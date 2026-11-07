import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dist = path.join(root, 'dist');
const release = path.join(root, 'release');
if (!fs.existsSync(dist)) throw new Error('dist/ is missing; run npm run build first.');
fs.rmSync(release, { recursive: true, force: true });
fs.mkdirSync(release, { recursive: true });

function filesUnder(folder) {
  return fs.readdirSync(folder, { withFileTypes: true })
    .flatMap(entry => entry.isDirectory() ? filesUnder(path.join(folder, entry.name)) : [path.join(folder, entry.name)])
    .sort();
}

const subjects = filesUnder(dist).map(file => ({
  path: path.relative(root, file).replaceAll('\\', '/'),
  sha256: createHash('sha256').update(fs.readFileSync(file)).digest('hex'),
  bytes: fs.statSync(file).size
}));
fs.writeFileSync(path.join(release, 'SHA256SUMS'), subjects.map(item => `${item.sha256}  ${item.path}`).join('\n') + '\n');
fs.writeFileSync(path.join(release, 'release-manifest.json'), JSON.stringify({
  schema_version: 1,
  product: 'sparkfolio',
  version: JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).version,
  commit: process.env.GITHUB_SHA ?? null,
  node: process.version,
  generated_at: new Date().toISOString(),
  subjects
}, null, 2) + '\n');

const sbom = execFileSync('npm', ['sbom', '--sbom-format', 'cyclonedx'], { encoding: 'utf8', shell: process.platform === 'win32' });
JSON.parse(sbom);
fs.writeFileSync(path.join(release, 'sbom.cdx.json'), sbom);
console.log(`Created release evidence for ${subjects.length} built files.`);
