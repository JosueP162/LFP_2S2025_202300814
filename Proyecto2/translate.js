/**
 * ═══════════════════════════════════════════════════════════
 * TRANSLATE.JS - CLI PARA TRADUCIR ARCHIVOS JAVA A PYTHON
 * ═══════════════════════════════════════════════════════════
 * 
 * Uso:
 *   node translate.js archivo.java
 *   node translate.js archivo.java -o salida.py
 *   node translate.js archivo.java -v (verbose - ver detalles)
 * 
 * Ejemplos:
 *   node translate.js ejemplo.java
 *   node translate.js ejemplo.java -o miPrograma.py
 *   node translate.js ejemplo.java -v
 */

import { readFileSync, writeFileSync } from 'fs';
import { Lexer } from './src/compiler/Lexer.js';
import { Parser } from './src/compiler/Parser.js';
import { Translator } from './src/compiler/Translator.js';

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// ═══════════════════════════════════════════════════════════
// PARSEAR ARGUMENTOS
// ═══════════════════════════════════════════════════════════
const args = process.argv.slice(2);

if (args.length === 0) {
  log('❌ Error: Debes proporcionar un archivo .java', 'red');
  console.log('\n📖 Uso:');
  console.log('  node translate.js archivo.java');
  console.log('  node translate.js archivo.java -o salida.py');
  console.log('  node translate.js archivo.java -v  (verbose)\n');
  process.exit(1);
}

const inputFile = args[0];
let outputFile = inputFile.replace('.java', '.py');
let verbose = false;

// Opciones
for (let i = 1; i < args.length; i++) {
  if (args[i] === '-o' && args[i + 1]) {
    outputFile = args[i + 1];
    i++;
  } else if (args[i] === '-v' || args[i] === '--verbose') {
    verbose = true;
  }
}

// ═══════════════════════════════════════════════════════════
// TRADUCCIÓN
// ═══════════════════════════════════════════════════════════
try {
  log('\n╔═══════════════════════════════════════════════════════════╗', 'cyan');
  log('║           JAVABRIDGE - TRADUCTOR JAVA → PYTHON           ║', 'cyan');
  log('╚═══════════════════════════════════════════════════════════╝', 'cyan');
  
  log(`\n📂 Leyendo archivo: ${inputFile}`, 'blue');
  const javaCode = readFileSync(inputFile, 'utf-8');
  
  if (verbose) {
    console.log(`\n📄 Contenido del archivo (${javaCode.length} caracteres):`);
    console.log('─'.repeat(60));
    console.log(javaCode.substring(0, 200) + (javaCode.length > 200 ? '...' : ''));
    console.log('─'.repeat(60));
  }

  // ═══════════════════════════════════════════════════════════
  // FASE 1: ANÁLISIS LÉXICO
  // ═══════════════════════════════════════════════════════════
  log('\n⚙️  [1/3] Análisis Léxico...', 'blue');
  const lexer = new Lexer(javaCode);
  const { tokens, errors: lexErrors } = lexer.tokenize();
  
  log(`   ✓ Tokens reconocidos: ${tokens.length}`, 'green');
  
  if (lexErrors.length > 0) {
    log(`   ⚠️  Errores léxicos: ${lexErrors.length}`, 'yellow');
    if (verbose) {
      lexErrors.forEach((err, i) => {
        console.log(`      ${i + 1}. ${err.message} (Línea ${err.line}, Col ${err.column})`);
      });
    }
  } else {
    log('   ✓ Sin errores léxicos', 'green');
  }

  if (verbose) {
    console.log('\n   📋 Tokens encontrados:');
    const tokenSummary = {};
    tokens.forEach(t => {
      tokenSummary[t.type] = (tokenSummary[t.type] || 0) + 1;
    });
    Object.entries(tokenSummary).forEach(([type, count]) => {
      console.log(`      ${type}: ${count}`);
    });
  }

  // ═══════════════════════════════════════════════════════════
  // FASE 2: ANÁLISIS SINTÁCTICO
  // ═══════════════════════════════════════════════════════════
  log('\n⚙️  [2/3] Análisis Sintáctico...', 'blue');
  const parser = new Parser(tokens);
  const { ast, errors: parseErrors, symbolTable } = parser.parse();
  
  if (ast) {
    log(`   ✓ AST generado correctamente`, 'green');
    log(`   ✓ Variables en tabla de símbolos: ${symbolTable.size}`, 'green');
  } else {
    log(`   ⚠️  AST con errores`, 'yellow');
  }
  
  if (parseErrors.length > 0) {
    log(`   ⚠️  Errores sintácticos: ${parseErrors.length}`, 'yellow');
    if (verbose) {
      parseErrors.forEach((err, i) => {
        console.log(`      ${i + 1}. [${err.type}] ${err.message}`);
        if (err.line) console.log(`         Línea ${err.line}, Col ${err.column}`);
      });
    }
  } else {
    log('   ✓ Sin errores sintácticos', 'green');
  }

  if (verbose && symbolTable.size > 0) {
    console.log('\n   📚 Tabla de símbolos:');
    symbolTable.forEach((info, name) => {
      console.log(`      ${name}: ${info.type} ${info.initialized ? '(inicializada)' : '(sin inicializar)'}`);
    });
  }

  // ═══════════════════════════════════════════════════════════
  // FASE 3: TRADUCCIÓN
  // ═══════════════════════════════════════════════════════════
  log('\n⚙️  [3/3] Traduciendo a Python...', 'blue');
  const allErrors = [...lexErrors, ...parseErrors];
  const translator = new Translator(ast, symbolTable, allErrors);
  const pythonCode = translator.translate();

  log(`   ✓ Código Python generado: ${pythonCode.length} caracteres`, 'green');

  // ═══════════════════════════════════════════════════════════
  // GUARDAR ARCHIVO
  // ═══════════════════════════════════════════════════════════
  log(`\n💾 Guardando archivo: ${outputFile}`, 'blue');
  writeFileSync(outputFile, pythonCode, 'utf-8');
  
  log(`\n✅ ¡TRADUCCIÓN COMPLETADA!`, 'green');
  log(`   Archivo generado: ${outputFile}`, 'green');

  // ═══════════════════════════════════════════════════════════
  // RESUMEN
  // ═══════════════════════════════════════════════════════════
  console.log('\n' + '─'.repeat(60));
  log('📊 RESUMEN:', 'cyan');
  console.log(`   Tokens:              ${tokens.length}`);
  console.log(`   Variables:           ${symbolTable.size}`);
  console.log(`   Errores léxicos:     ${lexErrors.length}`);
  console.log(`   Errores sintácticos: ${parseErrors.length}`);
  console.log(`   Total errores:       ${allErrors.length}`);
  console.log('─'.repeat(60));

  if (allErrors.length > 0) {
    log('\n⚠️  ADVERTENCIA: Se encontraron errores durante el análisis', 'yellow');
    log('   El código Python puede no funcionar correctamente', 'yellow');
    
    console.log('\n📝 Lista de errores:');
    allErrors.forEach((err, i) => {
      const prefix = err.type === 'LEXICO' ? '🔤' : '📝';
      console.log(`   ${prefix} ${i + 1}. [${err.type}] ${err.message}`);
      if (err.line) console.log(`      Línea ${err.line}, Columna ${err.column}`);
    });
  } else {
    log('\n✨ ¡Sin errores! El código está listo para ejecutar.', 'green');
  }

  // ═══════════════════════════════════════════════════════════
  // PREVIEW DEL CÓDIGO PYTHON
  // ═══════════════════════════════════════════════════════════
  if (verbose) {
    console.log('\n📄 Vista previa del código Python:');
    console.log('─'.repeat(60));
    const lines = pythonCode.split('\n');
    lines.slice(0, 15).forEach((line, i) => {
      console.log(`${String(i + 1).padStart(3)} | ${line}`);
    });
    if (lines.length > 15) {
      console.log('... (ver archivo completo)');
    }
    console.log('─'.repeat(60));
  }

  // ═══════════════════════════════════════════════════════════
  // SUGERENCIAS
  // ═══════════════════════════════════════════════════════════
  console.log('\n💡 Próximos pasos:');
  console.log(`   1. Revisar el archivo: ${outputFile}`);
  console.log(`   2. Ejecutar con Python: python ${outputFile}`);
  if (allErrors.length > 0) {
    console.log(`   3. Corregir errores en el archivo Java original`);
  }
  console.log('');

  process.exit(allErrors.length > 0 ? 1 : 0);

} catch (error) {
  log(`\n❌ ERROR FATAL:`, 'red');
  console.error(`   ${error.message}`);
  
  if (verbose && error.stack) {
    console.log('\n📋 Stack trace:');
    console.log(error.stack);
  }
  
  console.log('');
  process.exit(1);
}