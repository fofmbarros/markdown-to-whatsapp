# markdown-to-whatsapp

Convert Markdown into WhatsApp-friendly formatting.

## Installation

- NPM: `npm install @fofmbarros/markdown-to-whatsapp`
- Yarn `yarn add @fofmbarros/markdown-to-whatsapp`
- PNPM: `pnpm install @fofmbarros/markdown-to-whatsapp`
- Bun: `bun add @fofmbarros/markdown-to-whatsapp`

## Usage

```typescript
import { MarkdownToWhatsAppFormatter } from '@fofmbarros/markdown-to-whatsapp';

const formatter = new MarkdownToWhatsAppFormatter();

const message = formatter.format(`
# Release Notes
Read the [docs](https://example.com/docs) and review ![Diagram](https://example.com/diagram.png).

- **Bold** becomes WhatsApp bold
- *Italic* becomes WhatsApp italic
- ~~Strike~~ becomes WhatsApp strike
`);

console.log(message);
```

Output:

```text
Release Notes
Read the docs (https://example.com/docs) and review Diagram (https://example.com/diagram.png).

- *Bold* becomes WhatsApp bold
- _Italic_ becomes WhatsApp italic
- ~Strike~ becomes WhatsApp strike
```

## Formatter options

You can customize how supported headings, images, and links are rendered.

```typescript
import { MarkdownToWhatsAppFormatter } from '@fofmbarros/markdown-to-whatsapp';

const formatter = new MarkdownToWhatsAppFormatter({
	formatH1: (text) => `*${text.toUpperCase()}*`,
	formatH2: (text) => `_ ${text} _`,
	formatH3: (text) => `~${text}~`,
	formatImage: (url, alt) => `${alt ?? 'Image'} -> ${url}`,
	formatUrl: (url, text) => `${text ?? url} -> ${url}`,
});

console.log(
	formatter.format(
		'# Title\n## Subtitle\n### Section\n[Docs](https://example.com)\n![Logo](https://example.com/logo.png)',
	),
);
```

## Supported formatting

- `*italic*` -> `_italic_`
- `**bold**` and `__bold__` -> `*bold*`
- `~~strike~~` -> `~strike~`
- `` `code` `` -> ` ```code``` `
- `#`, `##`, and `###` headings -> plain text by default, or custom output via options
- `[text](url)` -> `text (url)` by default, or custom output via options
- `![alt](url)` -> `alt (url)` by default, or `url` when alt text is empty
- `<strong>`, `<em>`, `<b>`, and `<i>` tags are stripped

## License

MIT
