export type CodeMode = "html" | "jsx";

export type Severity = "High" | "Medium";

export interface Finding {
  ruleId: string;
  title: string;
  severity: Severity;
  element: string;
  summary: string;
  recommendation: string;
  start: number;
  openingEnd: number;
  contentStart?: number;
  contentEnd?: number;
  needsManualReview: boolean;
  fixable: boolean;
}

interface ElementNode {
  tag: string;
  start: number;
  openingEnd: number;
  contentStart: number;
  contentEnd: number;
  parent?: ElementNode;
  attributes: Map<string, string>;
  selfClosing: boolean;
}

interface ScanResult {
  elements: ElementNode[];
  uncertain: boolean;
}

export const MAX_CODE_LENGTH = 40_000;

const VOID_ELEMENTS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

function findTagEnd(source: string, start: number): number {
  let quote = "";
  let braceDepth = 0;

  for (let index = start; index < source.length; index += 1) {
    const character = source[index];

    if (quote) {
      if (character === "\\") {
        index += 1;
      } else if (character === quote) {
        quote = "";
      }
      continue;
    }

    if (character === "'" || character === '"') {
      quote = character;
    } else if (character === "{") {
      braceDepth += 1;
    } else if (character === "}" && braceDepth > 0) {
      braceDepth -= 1;
    } else if (character === ">" && braceDepth === 0) {
      return index;
    }
  }

  return -1;
}

function parseAttributes(source: string): Map<string, string> {
  const attributes = new Map<string, string>();
  const pattern =
    /([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|\{([^}]*)\}|([^\s"'=<>`]+)))?/g;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(source))) {
    const name = match[1].toLowerCase();
    const value = match[2] ?? match[3] ?? match[4] ?? match[5] ?? "";
    attributes.set(name, value);
  }

  return attributes;
}

function scanElements(source: string): ScanResult {
  const elements: ElementNode[] = [];
  const openElements: ElementNode[] = [];
  let uncertain = false;
  let index = 0;

  while (index < source.length) {
    const start = source.indexOf("<", index);
    if (start === -1) break;

    if (source.startsWith("<!--", start)) {
      const commentEnd = source.indexOf("-->", start + 4);
      index = commentEnd === -1 ? source.length : commentEnd + 3;
      continue;
    }

    const firstNameCharacter = source[start + 1];
    const isClosing = firstNameCharacter === "/";
    const nameStart = start + (isClosing ? 2 : 1);
    if (!/[A-Za-z]/.test(source[nameStart] ?? "")) {
      index = start + 1;
      continue;
    }

    let nameEnd = nameStart + 1;
    while (/[A-Za-z0-9:-]/.test(source[nameEnd] ?? "")) nameEnd += 1;

    const tagEnd = findTagEnd(source, nameEnd);
    if (tagEnd === -1) {
      uncertain = true;
      break;
    }

    const tag = source.slice(nameStart, nameEnd).toLowerCase();
    if (isClosing) {
      const stackIndex = openElements.map((element) => element.tag).lastIndexOf(tag);
      if (stackIndex === -1) {
        uncertain = true;
      } else {
        const element = openElements[stackIndex];
        element.contentEnd = start;
        openElements.splice(stackIndex);
      }
    } else {
      const attributesSource = source.slice(nameEnd, tagEnd);
      const selfClosing = /\/\s*$/.test(attributesSource);
      const element: ElementNode = {
        tag,
        start,
        openingEnd: tagEnd + 1,
        contentStart: tagEnd + 1,
        contentEnd: tagEnd + 1,
        parent: openElements.at(-1),
        attributes: parseAttributes(attributesSource),
        selfClosing,
      };
      elements.push(element);

      if (!selfClosing && !VOID_ELEMENTS.has(tag)) {
        openElements.push(element);
      }
    }

    index = tagEnd + 1;
  }

  for (const element of openElements) {
    element.contentEnd = source.length;
    uncertain = true;
  }

  return { elements, uncertain };
}

function attribute(element: ElementNode, name: string): string | undefined {
  const value = element.attributes.get(name);
  return value?.trim() ? value.trim() : undefined;
}

function hasStaticText(element: ElementNode, source: string, mode: CodeMode): boolean {
  const content = source.slice(element.contentStart, element.contentEnd);
  if (mode === "jsx" && /\{[^}]*\}/.test(content)) return true;

  return content
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<[^>]*>/g, "")
    .replace(/&(?:nbsp|#160|#x0*a0);/gi, " ")
    .trim().length > 0;
}

function hasAccessibleName(
  element: ElementNode,
  elements: ElementNode[],
  source: string,
  mode: CodeMode,
): boolean {
  if (attribute(element, "aria-label") || attribute(element, "title")) return true;

  const labelledBy = attribute(element, "aria-labelledby");
  if (labelledBy) {
    const referencedElements = labelledBy
      .split(/\s+/)
      .map((id) =>
        elements.find((candidate) => attribute(candidate, "id") === id),
      );
    if (
      referencedElements.length > 0 &&
      referencedElements.every(
        (candidate) =>
          candidate &&
          (hasStaticText(candidate, source, mode) ||
            attribute(candidate, "aria-label") ||
            attribute(candidate, "title")),
      )
    ) {
      return true;
    }
  }

  return false;
}

function hasLabel(
  element: ElementNode,
  elements: ElementNode[],
  source: string,
  mode: CodeMode,
): boolean {
  const id = attribute(element, "id");
  if (
    id &&
    elements.some(
      (candidate) =>
        candidate.tag === "label" &&
        (attribute(candidate, "for") ?? attribute(candidate, "htmlfor")) === id &&
        hasStaticText(candidate, source, mode),
    )
  ) {
    return true;
  }

  let parent = element.parent;
  while (parent) {
    if (parent.tag === "label" && hasStaticText(parent, source, mode)) return true;
    parent = parent.parent;
  }

  return false;
}

function createFinding(
  element: ElementNode,
  ruleId: string,
  title: string,
  severity: Severity,
  summary: string,
  recommendation: string,
  needsManualReview = false,
  fixable = true,
): Finding {
  return {
    ruleId,
    title,
    severity,
    element: `<${element.tag}>`,
    summary,
    recommendation,
    start: element.start,
    openingEnd: element.openingEnd,
    contentStart: element.contentStart,
    contentEnd: element.contentEnd,
    needsManualReview,
    fixable,
  };
}

export interface AnalysisResult {
  findings: Finding[];
  notes: string[];
  scannedElements: number;
}

export function analyzeAccessibility(
  source: string,
  mode: CodeMode,
): AnalysisResult {
  const { elements, uncertain } = scanElements(source);
  const findings: Finding[] = [];

  for (const element of elements) {
    if (element.tag === "img" && !element.attributes.has("alt")) {
      findings.push(
        createFinding(
          element,
          "image-alt",
          "Image is missing an alt attribute",
          "High",
          "The image has no alt attribute, so its purpose is not defined for people using assistive technology.",
          "Write concise alternative text for informative images. Use an empty value only when the image is confirmed to be decorative.",
          true,
        ),
      );
    }

    if (
      element.tag === "button" &&
      !hasAccessibleName(element, elements, source, mode) &&
      !hasStaticText(element, source, mode)
    ) {
      findings.push(
        createFinding(
          element,
          "button-name",
          "Button may not have an accessible name",
          "High",
          "No text or supported naming attribute was found for this button.",
          "Give the button concise text that describes its action, or provide an appropriate aria-label.",
          false,
          !element.selfClosing,
        ),
      );
    }

    if (
      element.tag === "a" &&
      element.attributes.has("href") &&
      !hasAccessibleName(element, elements, source, mode) &&
      !hasStaticText(element, source, mode)
    ) {
      findings.push(
        createFinding(
          element,
          "link-name",
          "Link may not have an accessible name",
          "High",
          "This link has an href but no text or supported naming attribute was found.",
          "Add concise link text that explains the destination or purpose.",
          false,
          !element.selfClosing,
        ),
      );
    }

    if (["input", "select", "textarea"].includes(element.tag)) {
      const type = attribute(element, "type")?.toLowerCase();
      if (element.tag === "input" && ["hidden", "submit", "reset", "button"].includes(type ?? "")) {
        continue;
      }

      const hasInputImageAlt =
        element.tag === "input" && type === "image" && element.attributes.has("alt");

      if (
        !hasAccessibleName(element, elements, source, mode) &&
        !hasInputImageAlt &&
        !hasLabel(element, elements, source, mode)
      ) {
        findings.push(
          createFinding(
            element,
            "form-control-name",
            "Form control may not have an accessible name",
            "High",
            "No non-empty aria-label, aria-labelledby, title, or associated label was found.",
            "Add a visible label whenever possible. A descriptive aria-label may be appropriate when a visible label is not practical.",
          ),
        );
      }
    }
  }

  const htmlElement = elements.find((element) => element.tag === "html");
  if (htmlElement && !attribute(htmlElement, "lang")) {
    findings.push(
      createFinding(
        htmlElement,
        "document-language",
        "Document language is not declared",
        "Medium",
        "A full document was provided, but its html element has no non-empty lang attribute.",
        "Set lang on the html element to the primary language of the page content.",
        true,
      ),
    );
  }

  let previousHeadingLevel = 0;
  for (const element of elements) {
    const headingLevel = /^h[1-6]$/.test(element.tag)
      ? Number(element.tag.slice(1))
      : 0;
    if (!headingLevel) continue;

    if (previousHeadingLevel && headingLevel > previousHeadingLevel + 1) {
      findings.push(
        createFinding(
          element,
          "heading-order",
          "Heading levels skip a step",
          "Medium",
          `The heading outline moves from level ${previousHeadingLevel} to level ${headingLevel}.`,
          "Review the outline and use heading levels to reflect the content hierarchy, without skipping levels.",
          true,
        ),
      );
    }
    previousHeadingLevel = headingLevel;
  }

  const notes = [
    mode === "jsx"
      ? "JSX analysis is a best-effort scan of literal HTML elements. Components, computed props, and dynamic content are not evaluated."
      : "HTML is scanned as source text; this does not execute or render the submitted markup.",
    "These checks cover a limited set of detectable patterns. They do not prove WCAG conformance or replace manual testing.",
  ];

  if (uncertain) {
    notes.push(
      "Some markup could not be matched reliably. Review the input and verify the results manually.",
    );
  }

  return { findings, notes, scannedElements: elements.length };
}

export function createSuggestedCode(
  source: string,
  findings: Finding[],
): string {
  const edits: Array<{ start: number; end: number; value: string }> = [];
  const findingsByStart = new Map<number, Finding[]>();

  for (const finding of findings) {
    if (!finding.fixable) continue;
    const existing = findingsByStart.get(finding.start) ?? [];
    existing.push(finding);
    findingsByStart.set(finding.start, existing);
  }

  const { elements } = scanElements(source);

  for (const element of elements) {
    const elementFindings = findingsByStart.get(element.start) ?? [];
    if (!elementFindings.length) continue;

    const rules = new Set(elementFindings.map((finding) => finding.ruleId));
    if (rules.has("image-alt")) {
      const position = element.openingEnd - (source[element.openingEnd - 2] === "/" ? 2 : 1);
      edits.push({
        start: position,
        end: position,
        value: ' alt="Describe this image"',
      });
    } else if (rules.has("form-control-name")) {
      const position = element.openingEnd - (source[element.openingEnd - 2] === "/" ? 2 : 1);
      edits.push({
        start: position,
        end: position,
        value: ' aria-label="Describe this field"',
      });
    } else if (rules.has("button-name") || rules.has("link-name")) {
      if (element.selfClosing) continue;
      const placeholder = rules.has("button-name")
        ? "Add button label"
        : "Add link text";
      edits.push({
        start: element.contentStart,
        end: element.contentStart,
        value: placeholder,
      });
    }
  }

  return edits
    .sort((left, right) => right.start - left.start)
    .reduce(
      (result, edit) =>
        result.slice(0, edit.start) + edit.value + result.slice(edit.end),
      source,
    );
}

export type VerificationStatus = "passed" | "failed" | "needs-review";

export function verifySuggestedCode(
  suggested: string,
  mode: CodeMode,
): { status: VerificationStatus; result: AnalysisResult } {
  const result = analyzeAccessibility(suggested, mode);
  if (result.findings.length > 0) return { status: "failed", result };
  return { status: "needs-review", result };
}
