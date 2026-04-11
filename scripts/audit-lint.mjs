import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.cwd();
const scanTargets = ['src', 'server.mjs', 'server', 'dev.mjs', 'package.json', 'tsconfig.app.json'];
const failures = [];

function walk(target) {
  const absolute = join(root, target);
  const stats = statSync(absolute);

  if (stats.isDirectory()) {
    return readdirSync(absolute, { withFileTypes: true }).flatMap((entry) =>
      walk(join(target, entry.name)),
    );
  }

  return [absolute];
}

function addFailure(filePath, message) {
  failures.push(`${relative(root, filePath)}: ${message}`);
}

for (const target of scanTargets) {
  for (const filePath of walk(target)) {
    const source = readFileSync(filePath, 'utf8');

    if (/[âÂ�]/.test(source)) {
      addFailure(filePath, 'contains mojibake or replacement characters');
    }

    if (/\bTODO\b|\bFIXME\b/.test(source)) {
      addFailure(filePath, 'contains TODO/FIXME markers');
    }

    if (filePath.includes(`${root}\\src\\`) && source.includes('OPENAI_API_KEY')) {
      addFailure(filePath, 'client code must not reference OPENAI_API_KEY');
    }

    if (filePath.endsWith('package.json') && source.includes('"name": "wear-landing"')) {
      addFailure(filePath, 'package metadata still uses landing-page naming');
    }

    if (filePath.endsWith('tsconfig.app.json') && source.includes('"exclude": ["src/App.tsx"]')) {
      addFailure(filePath, 'tsconfig still excludes src/App.tsx');
    }
  }
}

if (failures.length > 0) {
  console.error('Audit lint failed:\n');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('Audit lint passed.');
