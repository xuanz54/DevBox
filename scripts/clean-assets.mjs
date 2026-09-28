import { rmSync } from 'node:fs';

rmSync(new URL('../resources/assets', import.meta.url), { recursive: true, force: true });
console.log('cleaned resources/assets');
