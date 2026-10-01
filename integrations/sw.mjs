import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const skip = (f) => f === 'sw.js' || f === 'robots.txt' || /(\.map|\.woff|\.xml|LICENSE)$/.test(f);
const toUrl = (f) => (f.endsWith('index.html') ? `/${f.slice(0, -10)}` : f.endsWith('.html') ? `/${f.slice(0, -5)}` : `/${f}`);

export default function sw() {
    return {
        name: 'service-worker',
        hooks: {
            'astro:build:done': async ({ dir }) => {
                const root = fileURLToPath(dir);
                const files = (await readdir(root, { recursive: true, withFileTypes: true }))
                    .filter((e) => e.isFile())
                    .map((e) => path.relative(root, path.join(e.parentPath, e.name)).split(path.sep).join('/'))
                    .filter((f) => !skip(f))
                    .sort();
                const hash = createHash('sha256');
                for (const f of files) hash.update(f).update(await readFile(path.join(root, f)));
                const template = await readFile(new URL('../src/sw.js', import.meta.url), 'utf8');
                const out = template
                    .replace('__VERSION__', hash.digest('hex').slice(0, 10))
                    .replace('self.__PRECACHE__', JSON.stringify(files.map(toUrl)));
                await writeFile(path.join(root, 'sw.js'), out);
            },
        },
    };
}
