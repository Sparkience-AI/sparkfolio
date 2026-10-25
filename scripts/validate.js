import { spawnSync } from 'node:child_process';

const commands = [
  ['--test', 'tests/unit.test.js'],
  ['tests/dom.test.js'],
  ['node_modules/html-validate/bin/html-validate.mjs', 'index.html'],
  ['node_modules/vite/bin/vite.js', 'build'],
  ['node_modules/html-validate/bin/html-validate.mjs', 'dist/index.html']
];
for (const args of commands) {
  const result = spawnSync(process.execPath, args, { stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}
