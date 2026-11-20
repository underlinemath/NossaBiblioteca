import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const localRoot = resolve(root, 'xano');
const remoteRoot = resolve(root, '.audit-xano-live');

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path));
    else if (entry.name.endsWith('.xs')) files.push(path);
  }
  return files;
}

function rel(rootPath, file) {
  return relative(rootPath, file).replace(/\\/g, '/');
}

function fields(text) {
  const schema = text.match(/schema\s*\{([\s\S]*?)\n\s*\}/);
  if (!schema) return [];
  return [...schema[1].matchAll(/^\s*(int|text|email|password|bool|decimal|timestamp|date|json|uuid|enum)\s+([A-Za-z0-9_]+)\??[^\n]*$/gm)]
    .map((match) => `${match[1]} ${match[2]}`);
}

function indexes(text) {
  return [...text.matchAll(/type\s*[:=]\s*"?(primary|btree|btree\|unique|gin|search|vector)[^}\n]*/gi)]
    .map((match) => match[1]);
}

function apiInfo(text) {
  const query = text.match(/query\s+(?:"([^"]+)"|([A-Za-z0-9_\-/]+))/);
  const verb = text.match(/verb\s*=\s*(GET|POST|PATCH|PUT|DELETE)/i);
  const auth = text.match(/auth\s*=\s*"([^"]+)"/);
  return {
    route: query?.[1] ?? query?.[2] ?? null,
    verb: verb?.[1]?.toUpperCase() ?? null,
    auth: auth?.[1] ?? null,
  };
}

async function inventory(rootPath) {
  const tableFiles = await walk(resolve(rootPath, 'table')).catch(() => []);
  const apiFiles = await walk(resolve(rootPath, 'api')).catch(() => []);
  const tables = [];
  for (const file of tableFiles) {
    const text = await readFile(file, 'utf8');
    const name = text.match(/table\s+"([^"]+)"/)?.[1] ?? text.match(/table\s+([A-Za-z0-9_]+)/)?.[1];
    tables.push({ name: name ?? rel(rootPath, file), file: rel(rootPath, file), fields: fields(text), indexes: indexes(text) });
  }
  const apis = [];
  for (const file of apiFiles) {
    const text = await readFile(file, 'utf8');
    apis.push({ file: rel(rootPath, file), ...apiInfo(text) });
  }
  return { tables, apis };
}

const local = await inventory(localRoot);
const remote = await inventory(remoteRoot);
const localApiFiles = new Set(local.apis.map((api) => api.file));
const remoteApiFiles = new Set(remote.apis.map((api) => api.file));
const onlyLocal = local.apis.filter((api) => !remoteApiFiles.has(api.file));
const onlyRemote = remote.apis.filter((api) => !localApiFiles.has(api.file));

const report = {
  generatedAt: new Date().toISOString(),
  workspace: '151812',
  branch: 'v1',
  host: 'x8ki-letl-twmt.n7.xano.io',
  counts: {
    localTables: local.tables.length,
    remoteTables: remote.tables.length,
    localApis: local.apis.length,
    remoteApis: remote.apis.length,
  },
  onlyLocalApis: onlyLocal,
  onlyRemoteApis: onlyRemote,
  tables: remote.tables,
};

await mkdir(resolve(root, 'logs'), { recursive: true });
await mkdir(resolve(root, 'docs'), { recursive: true });
await writeFile(resolve(root, 'logs/xano-audit-inventory.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');

const tableRows = report.tables.map((table) => `| ${table.name} | ${table.fields.join(', ')} | ${table.indexes.join(', ')} |`);
const markdown = `# Matriz de auditoria Xano\n\n- Workspace: 151812\n- Branch: v1\n- Tabelas locais/remotas: ${report.counts.localTables}/${report.counts.remoteTables}\n- APIs locais/remotas: ${report.counts.localApis}/${report.counts.remoteApis}\n\n## Tabelas remotas\n\n| Tabela | Campos | Índices |\n| --- | --- | --- |\n${tableRows.join('\n')}\n\n## APIs ausentes da versão local\n\n${report.onlyRemoteApis.map((api) => `- ${api.verb ?? 'UNKNOWN'} ${api.route ?? api.file}`).join('\n') || '- Nenhuma'}\n\n## APIs locais sem equivalente remoto por caminho\n\n${report.onlyLocalApis.map((api) => `- ${api.verb ?? 'UNKNOWN'} ${api.route ?? api.file}`).join('\n') || '- Nenhuma'}\n`;
await writeFile(resolve(root, 'docs/xano-audit-matrix.md'), markdown, 'utf8');
console.log(JSON.stringify(report.counts, null, 2));
