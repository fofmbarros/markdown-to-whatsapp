export interface MarkdownToWhatsAppFormatterOptions {
	formatH1?(h1String: string): string;
	formatH2?(h1String: string): string;
	formatH3?(h1String: string): string;
	formatImage?(url: string, alt?: string): string;
	formatUrl?(url: string, text?: string): string;
}

export class MarkdownToWhatsAppFormatter {
	readonly options?: MarkdownToWhatsAppFormatterOptions;

	constructor(options?: MarkdownToWhatsAppFormatterOptions) {
		this.options = options;
	}

	private formatHeading(level: number, heading: string): string {
		switch (level) {
			case 1:
				return this.options?.formatH1?.(heading) ?? heading;
			case 2:
				return this.options?.formatH2?.(heading) ?? heading;
			case 3:
				return this.options?.formatH3?.(heading) ?? heading;
			default:
				return heading;
		}
	}

	private formatImage(url: string, alt: string): string {
		return (
			this.options?.formatImage?.(url, alt) ??
			(alt.length > 0 ? `${alt} (${url})` : url)
		);
	}

	private formatUrl(url: string, text: string): string {
		return this.options?.formatUrl?.(url, text) ?? `${text} (${url})`;
	}

	format(markdownString: string): string {
		const content = markdownString
			// Supported HTML emphasis tags
			.replaceAll(/<\/?(?:strong|em|b|i)>/g, '')
			// Italic
			.replaceAll(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '_$1_')
			// Bold
			.replaceAll(/\*\*(.*?)\*\*/g, '*$1*')
			.replaceAll(/__(.*?)__/g, '*$1*')
			// Strikethrough
			.replaceAll(/~~(.*?)~~/g, '~$1~')
			// Inline code
			.replaceAll(/`([^`]+)`/g, '```$1```')
			// Headings
			.replaceAll(/^(#{1,6})\s+(.*)$/gm, (_, hashes: string, heading: string) =>
				this.formatHeading(hashes.length, heading),
			)
			// Images
			.replaceAll(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt: string, url: string) =>
				this.formatImage(url, alt),
			)
			// Links
			.replaceAll(
				/(?<!!)\[([^\]]+)\]\(([^)]+)\)/g,
				(_, text: string, url: string) => this.formatUrl(url, text),
			);

		return content;
	}
}
