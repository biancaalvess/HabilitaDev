#!/usr/bin/env node

/**
 * Verifica se a URL do backend Java (Spring) está definida.
 * Aceita: NEXT_PUBLIC_API_URL=https://... | NEXT_PUBLIC_BACKEND_URL | BACKEND_URL
 */

const fs = require('fs');
const path = require('path');

console.log('Verificando configuração do backend Java...\n');

const envLocalPath = path.join(process.cwd(), '.env.local');
let backendUrl = null;

function pickUrlFromContent(envContent) {
  const mApi = envContent.match(/^\s*NEXT_PUBLIC_API_URL=(.+)$/m);
  if (mApi) {
    const v = mApi[1].trim().replace(/^["']|["']$/g, '');
    if (/^https?:\/\//i.test(v)) return v;
  }
  const mB = envContent.match(/^\s*NEXT_PUBLIC_BACKEND_URL=(.+)$/m);
  if (mB) return mB[1].trim().replace(/^["']|["']$/g, '');
  const m2 = envContent.match(/^\s*BACKEND_URL=(.+)$/m);
  if (m2) return m2[1].trim().replace(/^["']|["']$/g, '');
  return null;
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
  console.log(' Não encontrei URL do backend Java (https://...).');
  console.log('\nDefina no .env.local, por exemplo:');
  console.log('   NEXT_PUBLIC_API_URL=https://teu-backend.onrender.com');
  console.log('ou (alternativa):');
  console.log('   NEXT_PUBLIC_BACKEND_URL=https://teu-backend.onrender.com');
  process.exit(1);
}

console.log(` URL do backend Java: ${backendUrl}`);

if (backendUrl.includes('localhost') || backendUrl.includes('127.0.0.1')) {
  console.log('\n Modo local: confirma que o Spring arranca e testa:');
  console.log(`   curl ${backendUrl}/health`);
  console.log(`   curl ${backendUrl}/api/v1/questions`);
} else {
  console.log('\n Remoto: health e lista');
  console.log(`   GET ${backendUrl}/health`);
  console.log(`   GET ${backendUrl}/api/v1/questions`);
}

console.log('\n Configuração verificada!');
