#!/usr/bin/env node
import { build } from 'esbuild';
import { glob } from 'glob';

async function buildFunctions() {
  // Find all function files
  const functionFiles = await glob('src/functions/**/*.ts');

  console.log(`Building ${functionFiles.length} function files...`);

  try {
    await build({
      entryPoints: functionFiles,
      bundle: true,
      platform: 'node',
      target: 'node20',
      format: 'esm',
      outdir: 'dist/functions',
      external: ['@aws-sdk/*'],
      outExtension: { '.js': '.mjs' },
      minify: false,
      sourcemap: true,
      resolveExtensions: ['.ts', '.js'],
      loader: {
        '.ts': 'ts'
      }
    });
    console.log('Build completed successfully!');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

buildFunctions();