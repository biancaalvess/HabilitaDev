#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const envFiles = {
  development: 'env.local.example',
  production: 'env.production.example',
  test: 'env.test.example',
};

const configFiles = {
  development: 'config/development.json',
  production: 'config/production.json',
  test: 'config/test.json',
};

function createEnvFile(environment) {
  const envFile = envFiles[environment];
  const configFile = configFiles[environment];
  
  if (!envFile || !fs.existsSync(envFile)) {
    console.log(`❌ Arquivo de exemplo não encontrado: ${envFile}`);
    return false;
  }
  
  if (!configFile || !fs.existsSync(configFile)) {
    console.log(`❌ Arquivo de configuração não encontrado: ${configFile}`);
    return false;
  }
  
  const targetEnvFile = `.env.${environment}`;
  const targetLocalFile = environment === 'development' ? '.env.local' : `.env.${environment}`;
  
  try {
    // Copiar arquivo de exemplo
    fs.copyFileSync(envFile, targetEnvFile);
    console.log(`✅ Criado ${targetEnvFile}`);
    
    // Para desenvolvimento, também criar .env.local
    if (environment === 'development') {
      fs.copyFileSync(envFile, targetLocalFile);
      console.log(`✅ Criado ${targetLocalFile}`);
    }
    
    return true;
  } catch (error) {
    console.error(`❌ Erro ao criar arquivo de ambiente:`, error.message);
    return false;
  }
}

function validateEnvironment(environment) {
  const envFile = `.env.${environment}`;
  const localFile = environment === 'development' ? '.env.local' : envFile;
  
  if (!fs.existsSync(envFile) && !fs.existsSync(localFile)) {
    console.log(`❌ Arquivo de ambiente não encontrado para ${environment}`);
    return false;
  }
  
  console.log(`✅ Ambiente ${environment} configurado corretamente`);
  return true;
}

function showHelp() {
  console.log(`
🔧 Script de Configuração de Ambiente - HabilitaDev

Uso:
  node scripts/setup-env.js <comando> [ambiente]

Comandos:
  init <ambiente>    - Inicializar configuração para ambiente específico
  validate <ambiente> - Validar configuração do ambiente
  list              - Listar ambientes disponíveis
  help              - Mostrar esta ajuda

Ambientes disponíveis:
  development       - Ambiente de desenvolvimento
  production        - Ambiente de produção
  test             - Ambiente de testes

Exemplos:
  node scripts/setup-env.js init development
  node scripts/setup-env.js validate production
  node scripts/setup-env.js list
`);
}

function listEnvironments() {
  console.log('📋 Ambientes disponíveis:\n');
  
  Object.keys(envFiles).forEach(env => {
    const envFile = envFiles[env];
    const configFile = configFiles[env];
    const envExists = fs.existsSync(envFile);
    const configExists = fs.existsSync(configFile);
    
    console.log(`  ${env}:`);
    console.log(`    📄 Exemplo: ${envFile} ${envExists ? '✅' : '❌'}`);
    console.log(`    ⚙️  Config: ${configFile} ${configExists ? '✅' : '❌'}`);
    console.log('');
  });
}

// Main
const command = process.argv[2];
const environment = process.argv[3];

switch (command) {
  case 'init':
    if (!environment) {
      console.log('❌ Ambiente não especificado');
      showHelp();
      process.exit(1);
    }
    
    if (!envFiles[environment]) {
      console.log(`❌ Ambiente inválido: ${environment}`);
      showHelp();
      process.exit(1);
    }
    
    console.log(`🚀 Inicializando ambiente ${environment}...`);
    if (createEnvFile(environment)) {
      console.log(`✅ Ambiente ${environment} inicializado com sucesso!`);
      console.log(`\n📝 Próximos passos:`);
      console.log(`   1. Edite o arquivo .env.${environment} com suas configurações`);
      console.log(`   2. Execute: npm run dev`);
    } else {
      process.exit(1);
    }
    break;
    
  case 'validate':
    if (!environment) {
      console.log('❌ Ambiente não especificado');
      showHelp();
      process.exit(1);
    }
    
    console.log(`🔍 Validando ambiente ${environment}...`);
    validateEnvironment(environment);
    break;
    
  case 'list':
    listEnvironments();
    break;
    
  case 'help':
  case '--help':
  case '-h':
    showHelp();
    break;
    
  default:
    console.log('❌ Comando inválido');
    showHelp();
    process.exit(1);
}
