#!/usr/bin/env node
import { execSync } from 'child_process';
import { glob } from 'glob';

async function buildFunctions() {
  // Find all function files
  const functionFiles = await glob('src/functions/**/*.ts');
  
  console.log(`Building ${functionFiles.length} function files...`);
  
  try {
    // Use esbuild CLI directly with file list
    const fileList = functionFiles.join(' ');
    const command = `npx esbuild ${fileList} --bundle --platform=node --target=node20 --outdir=dist/functions --format=cjs --external:@aws-sdk/* --tsconfig=tsconfig.json`;
    
    execSync(command, { stdio: 'inherit' });
    console.log('Build completed successfully!');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

buildFunctions();