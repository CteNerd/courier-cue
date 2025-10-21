#!/usr/bin/env node
import { build } from 'esbuild';
import { glob } from 'glob';

async function bundleFunctions() {
  // Find all compiled function files
  const functionFiles = await glob('dist/functions/**/*.js');

  console.log(`Bundling ${functionFiles.length} function files...`);

  try {
    await build({
      entryPoints: functionFiles,
      bundle: true,
      platform: 'node',
      target: 'node20',
      format: 'cjs',
      outdir: 'dist/bundled',
      external: ['@aws-sdk/*'],
      minify: false,
      sourcemap: true,
      allowOverwrite: true
    });
    console.log('Bundle completed successfully!');
  } catch (error) {
    console.error('Bundle failed:', error);
    process.exit(1);
  }
}

bundleFunctions();