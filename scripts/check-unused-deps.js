#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Ler package.json
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

// Função para verificar se uma dependência está sendo usada
function isDependencyUsed(depName, projectRoot = '.') {
  const excludeDirs = ['node_modules', '.git', '.next', 'dist', 'build'];
  
  function searchInDirectory(dir) {
    try {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        if (excludeDirs.includes(item)) continue;
        
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          if (searchInDirectory(fullPath)) return true;
        } else if (stat.isFile() && (item.endsWith('.js') || item.endsWith('.jsx') || item.endsWith('.ts') || item.endsWith('.tsx'))) {
          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes(`from '${depName}'`) || content.includes(`from "${depName}"`)) {
              return true;
            }
          } catch (err) {
            // Ignorar erros de leitura
          }
        }
      }
    } catch (err) {
      // Ignorar erros de diretório
    }
    
    return false;
  }
  
  return searchInDirectory(projectRoot);
}

// Dependências que são necessárias mas não aparecem em imports diretos
const essentialDeps = [
  'react-dom', // Necessário para React
  'typescript', // Necessário para compilação
  'tailwindcss', // Necessário para CSS
  'postcss', // Necessário para Tailwind
  'autoprefixer', // Necessário para CSS
  '@types/node', // Necessário para TypeScript
  '@types/react', // Necessário para TypeScript
  '@types/react-dom', // Necessário para TypeScript
  '@types/bcryptjs', // Necessário para TypeScript
  '@types/jsonwebtoken', // Necessário para TypeScript
  '@types/sqlite3', // Necessário para TypeScript
  'tailwindcss-animate', // Usado via classes CSS
  '@tailwindcss/postcss', // Necessário para Tailwind
  'geist', // Usado via CSS
  '@vercel/analytics', // Usado no layout
  '@hookform/resolvers', // Usado implicitamente pelo react-hook-form
];

// Verificar dependências
console.log('🔍 Verificando dependências não utilizadas...\n');

const unusedDeps = [];
const usedDeps = [];

for (const [depName, version] of Object.entries(dependencies)) {
  if (isDependencyUsed(depName) || essentialDeps.includes(depName)) {
    usedDeps.push(depName);
  } else {
    unusedDeps.push(depName);
  }
}

console.log(`✅ Dependências utilizadas (${usedDeps.length}):`);
usedDeps.forEach(dep => console.log(`  - ${dep}`));

console.log(`\n❌ Dependências não utilizadas (${unusedDeps.length}):`);
unusedDeps.forEach(dep => console.log(`  - ${dep}`));

if (unusedDeps.length > 0) {
  console.log(`\n💡 Para remover dependências não utilizadas, execute:`);
  console.log(`npm uninstall ${unusedDeps.join(' ')}`);
} else {
  console.log('\n🎉 Todas as dependências estão sendo utilizadas!');
}
