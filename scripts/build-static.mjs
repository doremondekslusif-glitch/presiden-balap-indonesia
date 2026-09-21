import { cp, mkdir, readdir, rm } from 'node:fs/promises';

await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });

await cp('index.html', 'dist/index.html');
await cp('src', 'dist/src', { recursive: true });

const files = await readdir('.', { withFileTypes: true });

for (const file of files) {
  if (
    file.isFile() &&
    file.name.toLowerCase().endsWith('.glb')
  ) {
    await cp(file.name, `dist/${file.name}`);
  }
}

console.log('Static WebGL site written to dist/.');
