type Handlers = HTMLRewriterTypes.HTMLRewriterElementContentHandlers;

interface ReturningContext<T> {
	/**
	 * Add the given item T to the data collection
	 * @param item Item to add to the data collection
	 * @returns
	 */
	add: (item: T) => void;
}

interface ReturningHandlers<T> {
	/**
	 * Execute this function when an element is encountered
	 * @param el Found element
	 * @param context Context
	 * @returns
	 */
	element?: (
		el: HTMLRewriterTypes.Element,
		context: ReturningContext<T>,
	) => void;

	/**
	 * Execute this function when a comment is encountered
	 * @param comment Found comment
	 * @param context Context
	 * @returns
	 */
	comments?: (
		comment: HTMLRewriterTypes.Comment,
		context: ReturningContext<T>,
	) => void;

	/**
	 * Execute this function when a text node is encountered
	 * @param text Found text
	 * @param context Context
	 * @returns
	 */
	text?: (text: HTMLRewriterTypes.Text, context: ReturningContext<T>) => void;
}

/**
 * HTMLRewriter with support for returning data
 * @template T Data type
 */
export class ReturningHtmlRewriter<T> extends HTMLRewriter {
	private readonly data: T[] = [];

	private readonly context: ReturningContext<T> = {
		add: (item: T): void => {
			this.data.push(item);
		},
	};

	private createWrappedHandlers(handlers: ReturningHandlers<T>): Handlers {
		const context = this.context;
		return {
			...handlers,
			element(el) {
				handlers.element?.(el, context);
			},
			comments(comment) {
				handlers.comments?.(comment, context);
			},
			text(text) {
				handlers.text?.(text, context);
			},
		};
	}

	/**
	 * @inheritdoc HTMLRewriter.on
	 */
	public on(
		selector: string,
		handlers: ReturningHandlers<T>,
	): ReturningHtmlRewriter<T> {
		super.on(selector, this.createWrappedHandlers(handlers));
		return this;
	}

	/**
	 * Parse the given HTML string and return the data collection
	 * @param html HTML string to parse
	 * @returns Data collection
	 */
	public parse(html: string): T[] {
		this.data.length = 0;
		super.transform(html);
		return this.data;
	}
}
