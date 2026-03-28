import { expect, test } from 'bun:test';
import { MarkdownToWhatsAppFormatter } from '../src';

const formatter = new MarkdownToWhatsAppFormatter();

test('formats inline markdown styles', () => {
	expect(
		formatter.format(
			'Use *italic*, **bold**, __also bold__, ~~strike~~, and `code`.',
		),
	).toBe('Use _italic_, *bold*, *also bold*, ~strike~, and ```code```.');
});

test('strips heading markers and preserves compatible quote and list syntax', () => {
	expect(
		formatter.format('# Title\n## Subtitle\n> quote\n- bullet\n1. numbered'),
	).toBe('Title\nSubtitle\n> quote\n- bullet\n1. numbered');
});

test('formats images and links', () => {
	expect(
		formatter.format(
			'![Diagram](https://example.com/image.png) and [Docs](https://example.com)',
		),
	).toBe(
		'Diagram (https://example.com/image.png) and Docs (https://example.com)',
	);
});

test('keeps image URLs when alt text is empty', () => {
	expect(formatter.format('![](https://example.com/image.png)')).toBe(
		'https://example.com/image.png',
	);
});

test('uses heading options when provided', () => {
	const customFormatter = new MarkdownToWhatsAppFormatter({
		formatH1: (heading) => `*${heading.toUpperCase()}*`,
		formatH2: (heading) => `_ ${heading} _`,
		formatH3: (heading) => `~${heading}~`,
	});

	expect(
		customFormatter.format('# Title\n## Subtitle\n### Tertiary\n#### Plain'),
	).toBe('*TITLE*\n_ Subtitle _\n~Tertiary~\nPlain');
});

test('uses image and link options when provided', () => {
	const customFormatter = new MarkdownToWhatsAppFormatter({
		formatImage: (url, alt) => `image:${alt ?? 'none'}@${url}`,
		formatUrl: (url, text) => `link:${text ?? url}@${url}`,
	});

	expect(
		customFormatter.format(
			'![Diagram](https://example.com/image.png) and [Docs](https://example.com)',
		),
	).toBe(
		'image:Diagram@https://example.com/image.png and link:Docs@https://example.com',
	);
});

test('passes empty alt text to custom image formatting', () => {
	const customFormatter = new MarkdownToWhatsAppFormatter({
		formatImage: (url, alt) => `image:${alt === '' ? 'empty' : alt}@${url}`,
	});

	expect(customFormatter.format('![](https://example.com/image.png)')).toBe(
		'image:empty@https://example.com/image.png',
	);
});

test('falls back to default formatting for missing options', () => {
	const customFormatter = new MarkdownToWhatsAppFormatter({
		formatH1: (heading) => `H1:${heading}`,
	});

	expect(
		customFormatter.format(
			'# Title\n## Subtitle\n![Diagram](https://example.com/image.png)\n[Docs](https://example.com)',
		),
	).toBe(
		'H1:Title\nSubtitle\nDiagram (https://example.com/image.png)\nDocs (https://example.com)',
	);
});

test('keeps default formatting for headings deeper than h3', () => {
	const customFormatter = new MarkdownToWhatsAppFormatter({
		formatH1: (heading) => `H1:${heading}`,
		formatH2: (heading) => `H2:${heading}`,
		formatH3: (heading) => `H3:${heading}`,
	});

	expect(customFormatter.format('#### Fourth\n##### Fifth\n###### Sixth')).toBe(
		'Fourth\nFifth\nSixth',
	);
});

test('removes supported html emphasis tags', () => {
	expect(
		formatter.format(
			'<strong>Bold</strong> <em>italic</em> <b>more</b> <i>text</i>',
		),
	).toBe('Bold italic more text');
});

test('applies multiple transformations in one string', () => {
	expect(
		formatter.format(
			'# Release\nRead [guide](https://example.com) and ![Logo](https://example.com/logo.png) with *care* and `snippets`.',
		),
	).toBe(
		'Release\nRead guide (https://example.com) and Logo (https://example.com/logo.png) with _care_ and ```snippets```.',
	);
});

test('applies option hooks alongside other markdown transforms', () => {
	const customFormatter = new MarkdownToWhatsAppFormatter({
		formatH1: (heading) => `*${heading}*`,
		formatImage: (url, alt) => `${alt ?? 'image'} -> ${url}`,
		formatUrl: (url, text) => `${text ?? url} -> ${url}`,
	});

	expect(
		customFormatter.format(
			'# Release\nRead [guide](https://example.com) and ![Logo](https://example.com/logo.png) with *care*.',
		),
	).toBe(
		'*Release*\nRead guide -> https://example.com and Logo -> https://example.com/logo.png with _care_.',
	);
});
