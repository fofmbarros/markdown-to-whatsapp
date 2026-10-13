# @fofmbarros/markdown-to-whatsapp

A lightweight formatter for converting Markdown into WhatsApp-friendly text.

Prepare messages with WhatsApp bold, italic, strikethrough, and monospace formatting. Customize how headings, links, and images appear in the output.

- No runtime dependencies.
- Framework-independent, with a synchronous string-in, string-out API.
- Custom formatting callbacks for headings, links, and images.
- Includes TypeScript declarations.

## Installation

Install with your preferred package manager:

```sh
npm install @fofmbarros/markdown-to-whatsapp
```

```sh
pnpm add @fofmbarros/markdown-to-whatsapp
```

```sh
bun add @fofmbarros/markdown-to-whatsapp
```

```sh
yarn add @fofmbarros/markdown-to-whatsapp
```

## Quick start

```typescript
import { MarkdownToWhatsAppFormatter } from "@fofmbarros/markdown-to-whatsapp";

const formatter = new MarkdownToWhatsAppFormatter();

const message = formatter.format(`# Release Notes
Read the [docs](https://example.com/docs) and review ![Diagram](https://example.com/diagram.png).

- **Bold** becomes WhatsApp bold
- *Italic* becomes WhatsApp italic
- ~~Strike~~ becomes WhatsApp strike`);

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

The formatter returns text only. It does not send messages or upload images to WhatsApp.

## API

### Formatter

| Method                                      | Description                                                            |
| ------------------------------------------- | ---------------------------------------------------------------------- |
| `new MarkdownToWhatsAppFormatter(options?)` | Creates a formatter with optional rendering callbacks.                 |
| `format(markdownString: string): string`    | Converts supported Markdown formatting and returns the resulting text. |

### Formatter options

All options are optional. Each callback receives the matched content and returns its replacement text.

| Option        | Signature                                | Default output                                     |
| ------------- | ---------------------------------------- | -------------------------------------------------- |
| `formatH1`    | `(text: string) => string`               | Heading text without the `#` prefix.               |
| `formatH2`    | `(text: string) => string`               | Heading text without the `##` prefix.              |
| `formatH3`    | `(text: string) => string`               | Heading text without the `###` prefix.             |
| `formatImage` | `(url: string, alt?: string) => string`  | `alt (url)`, or just `url` when alt text is empty. |
| `formatUrl`   | `(url: string, text?: string) => string` | `text (url)`.                                      |

The package exports `MarkdownToWhatsAppFormatter` and the `MarkdownToWhatsAppFormatterOptions` type. See the [source definitions](src/index.ts) for the full contracts.

### Custom formatting

```typescript
import { MarkdownToWhatsAppFormatter } from "@fofmbarros/markdown-to-whatsapp";

const formatter = new MarkdownToWhatsAppFormatter({
	formatH1: (text) => `*${text.toUpperCase()}*`,
	formatH2: (text) => `_${text}_`,
	formatH3: (text) => `~${text}~`,
	formatImage: (url, alt) => `${alt ?? "Image"} -> ${url}`,
	formatUrl: (url, text) => `${text ?? url} -> ${url}`,
});

console.log(
	formatter.format(
		"# Title\n## Subtitle\n### Section\n[Docs](https://example.com)\n![Logo](https://example.com/logo.png)",
	),
);
```

## Supported formatting

| Markdown input                       | Default output                     |
| ------------------------------------ | ---------------------------------- |
| `*italic*`                           | `_italic_`                         |
| `**bold**` or `__bold__`             | `*bold*`                           |
| `~~strike~~`                         | `~strike~`                         |
| `` `code` ``                         | ` ```code``` `                     |
| `# Heading` through `###### Heading` | `Heading`                          |
| `[text](url)`                        | `text (url)`                       |
| `![alt](url)`                        | `alt (url)`                        |
| `![](url)`                           | `url`                              |
| `<strong>`, `<em>`, `<b>`, and `<i>` | Tags removed; inner text retained. |

Only heading levels 1–3 have custom callbacks. Levels 4–6 always become plain text.

## License

[MIT](LICENSE).
