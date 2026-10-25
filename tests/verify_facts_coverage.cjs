// Compatibility entry point: coverage is now part of the full validation pipeline.
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const result = spawnSync(process.execPath, ['scripts/validate.js'], { cwd: path.join(__dirname, '..'), stdio: 'inherit' });
if (result.error) throw result.error;
process.exit(result.status || 0);
