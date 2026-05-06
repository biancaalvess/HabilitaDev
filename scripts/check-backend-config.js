#!/usr/bin/env node

/**
 * Verifica se NEXT_PUBLIC_BACKEND_URL está definida nos ficheiros .env.
 */

const fs = require('fs');
const path = require('path');

console.log('Verificando NEXT_PUBLIC_BACKEND_URL...\n');

const envLocalPath = path.join(process.cwd(), '.env.local');
let backendUrl = null;

function pickUrlFromContent(envContent) {
  const m = envContent.match(/^\s*NEXT_PUBLIC_BACKEND_URL=(.+)$/m);
  if (!m) return null;
  return m[1].trim().replace(/^["']|["']$/g, '');
}

if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf-8');
  backendUrl = pickUrlFromContent(envContent);
}

if (!backendUrl) {
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    backendUrl = pickUrlFromContent(envContent);
  }
}

if (!backendUrl) {
  console.log(' Não encontrei NEXT_PUBLIC_BACKEND_URL.');
  console.log('\nDefina no .env.local, por exemplo:');
  console.log('   NEXT_PUBLIC_BACKEND_URL=https://teu-backend.onrender.com');
  process.exit(1);
}

console.log(` NEXT_PUBLIC_BACKEND_URL: ${backendUrl}`);

if (backendUrl.includes('localhost') || backendUrl.includes('127.0.0.1')) {
  console.log('\n Modo local: confirma que o Spring arranca e testa:');
  console.log(`   curl ${backendUrl}/health`);
  console.log(`   curl ${backendUrl}/api/v1/questions`);
} else {
  console.log('\n Remoto:');
  console.log(`   GET ${backendUrl}/health`);
  console.log(`   GET ${backendUrl}/api/v1/questions`);
}

console.log('\n Configuração verificada!');
