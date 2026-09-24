// Local Windows validation: restrict dependency tracing to this standalone project.
// Deployment continues to use the project's unchanged `bun run build` configuration.
import { pathToFileURL } from 'node:url';
import path from 'node:path';
const { createBuilder } = await import(pathToFileURL(path.resolve('node_modules/vite/dist/node/index.js')).href);
const builder = await createBuilder({ nitro: { traceOpts: { nft: { base: process.cwd() } } } });
await builder.buildApp();
