import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const tarball = resolve(process.argv[2] ?? 'package.tgz');
const manifest = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const directory = mkdtempSync(join(tmpdir(), 'markdown-to-whatsapp-package-'));

function run(command: string, args: string[]) {
	const result = spawnSync(command, args, { cwd: directory, stdio: 'inherit' });
	if (result.error) throw result.error;
	assert.equal(result.status, 0, `${command} failed`);
}

try {
	const packageDirectory = join(directory, 'node_modules', manifest.name);
	mkdirSync(packageDirectory, { recursive: true });
	run('tar', ['-xzf', tarball, '--strip-components=1', '-C', packageDirectory]);
	const packed = JSON.parse(readFileSync(join(packageDirectory, 'package.json'), 'utf8'));
	assert.equal(packed.name, manifest.name);
	assert.equal(packed.version, manifest.version);
	for (const file of ['dist/index.js', 'dist/index.d.ts', 'README.md', 'LICENSE']) {
		assert.ok(readFileSync(join(packageDirectory, file)).length > 0, `${file} must be included`);
	}
	writeFileSync(
		join(directory, 'smoke.mjs'),
		`import assert from 'node:assert/strict';
import { MarkdownToWhatsAppFormatter } from '${manifest.name}';
const formatter = new MarkdownToWhatsAppFormatter();
assert.equal(formatter.format('**bold** and *italic*'), '*bold* and _italic_');
assert.equal(formatter.format('[Docs](https://example.com)'), 'Docs (https://example.com)');
assert.equal(new MarkdownToWhatsAppFormatter({ formatH1: text => text.toUpperCase() }).format('# title'), 'TITLE');
`,
	);
	run('node', ['smoke.mjs']);
	writeFileSync(
		join(directory, 'smoke.mts'),
		`import { MarkdownToWhatsAppFormatter, type MarkdownToWhatsAppFormatterOptions } from '${manifest.name}';
const options: MarkdownToWhatsAppFormatterOptions = { formatH1: text => text.toUpperCase() };
const result: string = new MarkdownToWhatsAppFormatter(options).format('# title');
void result;
`,
	);
	run('node', [
		resolve('node_modules/typescript/bin/tsc'),
		'--noEmit',
		'--strict',
		'--module',
		'NodeNext',
		'--target',
		'ES2023',
		'smoke.mts',
	]);
	console.log('Packed package passed Node.js and TypeScript smoke tests.');
} finally {
	rmSync(directory, { recursive: true, force: true });
}
