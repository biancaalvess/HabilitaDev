#!/usr/bin/env node

/**
 * Script para verificar configuração do backend
 */

const fs = require('fs');
const path = require('path');

console.log('Verificando configuração do backend...\n');

// Verificar .env.local
const envLocalPath = path.join(process.cwd(), '.env.local');
let backendUrl = null;

if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf-8');
  const backendUrlMatch = envContent.match(/NEXT_PUBLIC_BACKEND_URL=(.+)/);
  if (backendUrlMatch) {
    backendUrl = backendUrlMatch[1].trim().replace(/^["']|["']$/g, '');
  }
  
  const backendUrlMatch2 = envContent.match(/BACKEND_URL=(.+)/);
  if (backendUrlMatch2 && !backendUrl) {
    backendUrl = backendUrlMatch2[1].trim().replace(/^["']|["']$/g, '');
  }
}

if (!backendUrl) {
  console.log(' NEXT_PUBLIC_BACKEND_URL não está configurado no .env.local');
  console.log('\nPara desenvolvimento local, adicione ao .env.local:');
  console.log('   NEXT_PUBLIC_BACKEND_URL=http://localhost:8080');
  console.log('\nPara produção, use:');
  console.log('   NEXT_PUBLIC_BACKEND_URL=https://habilitadev-backend.onrender.com');
  process.exit(1);
}

console.log(` NEXT_PUBLIC_BACKEND_URL configurado: ${backendUrl}`);

// Verificar se é localhost
if (backendUrl.includes('localhost') || backendUrl.includes('127.0.0.1')) {
  console.log('\n Modo de desenvolvimento local detectado');
  console.log('   Certifique-se de que o backend Go está rodando em:', backendUrl);
  console.log('\n   Para iniciar o backend:');
  console.log('   1. Navegue até a pasta do backend Go');
  console.log('   2. Execute: go run main.go');
  console.log('   3. Verifique: curl http://localhost:8080/health');
} else {
  console.log('\n Modo de produção/remoto detectado');
  console.log('   Backend remoto:', backendUrl);
}

console.log('\n Configuração verificada!');

