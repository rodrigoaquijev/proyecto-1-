import { readFile, mkdir, copyFile, cp } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
const files = ['index.html', 'styles.css', 'app.js', 'floral.js', 'music.js', 'motion.js', 'boda-camila-rodrigo.ics'];
const html = await readFile('index.html', 'utf8');
const css = spawnSync(process.execPath, ['node_modules/tailwindcss/lib/cli.js', '-i', 'tailwind.input.css', '-o', 'assets/layout.css', '--minify'], { stdio: 'inherit' });
if (css.status !== 0) process.exit(1);
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
if (new Set(ids).size !== ids.length) throw new Error('Duplicate HTML IDs');
for (const [, id] of html.matchAll(/href="#([^"]+)"/g)) {
  if (!ids.includes(id)) throw new Error(`Missing navigation target: ${id}`);
}
for (const [, id] of html.matchAll(/\bfor="([^"]+)"/g)) {
  if (!ids.includes(id)) throw new Error(`Missing form label target: ${id}`);
}
if ((html.match(/class="gift-item"/g) || []).length !== 12) throw new Error('Gift list incomplete');
const syntax = spawnSync(process.execPath, ['--check', 'app.js'], { stdio: 'inherit' });
if (syntax.status !== 0) process.exit(1);
await mkdir('dist', { recursive: true });
for (const file of files) await copyFile(file, `dist/${file}`);
await cp('assets', 'dist/assets', { recursive: true });
console.log('Static build complete: navigation, labels, gift list and JavaScript validated.');
