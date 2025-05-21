import { describe, test, expect, beforeEach } from "bun:test";
import { ReturningHtmlRewriter } from "../index"; // Update path as needed

describe("ReturningHtmlRewriter", () => {
	// Sample HTML to test with
	const sampleHtml = `
    <div class="container">
      <h1>Hello World</h1>
      <!-- This is a comment -->
      <p>This is a paragraph.</p>
      <ul>
        <li>Item 1</li>
        <li>Item 2</li>
      </ul>
    </div>
  `;

	// Define type for our test data
	interface TestData {
		type: string;
		name?: string;
		text?: string;
		comment?: string;
		attributes?: Record<string, string>;
	}

	let rewriter: ReturningHtmlRewriter<TestData>;

	beforeEach(() => {
		// Create a new rewriter instance before each test
		rewriter = new ReturningHtmlRewriter<TestData>();
	});

	test("should collect element data using element handler", () => {
		// Set up the rewriter with element handler
		rewriter.on("h1, p, li", {
			element: (el, context) => {
				context.add({
					type: "element",
					name: el.tagName,
				});
			},
		});

		// Parse HTML
		const result = rewriter.parse(sampleHtml);

		// Should find h1, p, and two li elements
		expect(result).toHaveLength(4);
		expect(result).toContainEqual({ type: "element", name: "h1" });
		expect(result).toContainEqual({ type: "element", name: "p" });
		expect(result.filter((item) => item.name === "li")).toHaveLength(2);
	});

	test("should collect text data using text handler", () => {
		// Set up the rewriter with text handler
		rewriter.on("h1, p, li", {
			text: (text, context) => {
				if (text.text.trim()) {
					context.add({
						type: "text",
						text: text.text,
					});
				}
			},
		});

		// Parse HTML
		const result = rewriter.parse(sampleHtml);

		// Check the result contains the expected text
		expect(result).toContainEqual({ type: "text", text: "Hello World" });
		expect(result).toContainEqual({
			type: "text",
			text: "This is a paragraph.",
		});
		expect(result).toContainEqual({ type: "text", text: "Item 1" });
		expect(result).toContainEqual({ type: "text", text: "Item 2" });
		expect(result).toHaveLength(4);
	});

	test("should collect comment data using comments handler", () => {
		// Set up the rewriter with comments handler
		rewriter.on("*", {
			comments: (comment, context) => {
				context.add({
					type: "comment",
					comment: comment.text,
				});
			},
		});

		// Parse HTML
		const result = rewriter.parse(sampleHtml);

		// Check the result
		expect(result).toHaveLength(1);
		expect(result[0]).toEqual({
			type: "comment",
			comment: " This is a comment ",
		});
	});

	test("should clear previous data when parsing new HTML", () => {
		// Set up the rewriter with element handler
		rewriter.on("div", {
			element: (el, context) => {
				context.add({
					type: "element",
					name: "div",
				});
			},
		});

		// Parse HTML first time
		const firstResult = rewriter.parse(sampleHtml);
		expect(firstResult).toHaveLength(1); // One div in the sample

		// Parse different HTML second time
		const secondHtml = "<div>First div</div><div>Second div</div>";
		const secondResult = rewriter.parse(secondHtml);

		// Check that the data was cleared and contains only the new entries
		expect(secondResult).toHaveLength(2);
		expect(secondResult).toEqual([
			{ type: "element", name: "div" },
			{ type: "element", name: "div" },
		]);
	});

	test("should handle multiple on() calls", () => {
		// Set up multiple handlers
		rewriter
			.on("h1", {
				element: (el, context) => {
					context.add({
						type: "heading",
						name: el.tagName,
					});
				},
			})
			.on("p", {
				element: (el, context) => {
					context.add({
						type: "paragraph",
						name: el.tagName,
					});
				},
			});

		// Parse HTML
		const result = rewriter.parse(sampleHtml);

		// Check the result
		expect(result).toHaveLength(2);
		expect(result).toContainEqual({ type: "heading", name: "h1" });
		expect(result).toContainEqual({ type: "paragraph", name: "p" });
	});

	test("should handle all handler types simultaneously", () => {
		// Set up with all handler types
		rewriter.on("div", {
			element: (el, context) => {
				const attributes: Record<string, string> = {};

				for (const [name, _] of el.attributes) {
					attributes[name] = el.getAttribute(name) ?? "";
				}

				context.add({
					type: "element",
					name: el.tagName,
					attributes,
				});
			},
			text: (text, context) => {
				if (text.text.trim()) {
					context.add({
						type: "text",
						text: text.text.trim(),
					});
				}
			},
			comments: (comment, context) => {
				context.add({
					type: "comment",
					comment: comment.text,
				});
			},
		});

		// Parse HTML
		const result = rewriter.parse(sampleHtml);

		// Check for element with attributes
		const divElement = result.find(
			(item) => item.type === "element" && item.name === "div",
		);
		expect(divElement).toBeDefined();
		expect(divElement?.attributes).toEqual({ class: "container" });

		// Check for comment
		const commentItem = result.find((item) => item.type === "comment");
		expect(commentItem).toBeDefined();

		// Overall check
		expect(result.length).toBeGreaterThanOrEqual(2); // At least div and comment
	});

	test("should extract nested content correctly", () => {
		const nestedHtml = `
      <article>
        <header>
          <h1>Main Title</h1>
          <h2>Subtitle</h2>
        </header>
        <section>
          <p>First paragraph</p>
          <p>Second paragraph</p>
        </section>
        <footer>
          <p>Footer text</p>
        </footer>
      </article>
    `;

		rewriter.on("h1, h2, p", {
			text: (text, context) => {
				if (text.text.trim()) {
					context.add({
						type: "content",
						text: text.text.trim(),
					});
				}
			},
		});

		const result = rewriter.parse(nestedHtml);

		expect(result).toHaveLength(5);
		expect(result).toContainEqual({ type: "content", text: "Main Title" });
		expect(result).toContainEqual({ type: "content", text: "Subtitle" });
		expect(result).toContainEqual({
			type: "content",
			text: "First paragraph",
		});
		expect(result).toContainEqual({
			type: "content",
			text: "Second paragraph",
		});
		expect(result).toContainEqual({ type: "content", text: "Footer text" });
	});
});
