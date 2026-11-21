// Usage: node fetch.mjs <outDir> <apiPath> <outFile>
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
const [outDir, apiPath, outFile] = process.argv.slice(2);
const token = fs.readFileSync(path.join(os.homedir(), 'figma-token.txt'), 'utf8').replace(/^﻿/, '').trim();
if (!token) { console.error('Token file empty'); process.exit(1); }
const res = await fetch('https://api.figma.com' + apiPath, { headers: { 'X-Figma-Token': token } });
const text = await res.text();
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, outFile), text);
console.log(res.status, outFile, (text.length / 1024).toFixed(0) + ' KB');
if (!res.ok) console.log(text.slice(0, 300));
