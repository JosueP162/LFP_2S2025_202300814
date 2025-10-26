/**
 * ═══════════════════════════════════════════════════════════
 * TEST.JS - SUITE DE PRUEBAS COMPLETA PARA JAVABRIDGE
 * ═══════════════════════════════════════════════════════════
 * 
 * Instrucciones de uso:
 * 1. Guarda este archivo como: test.js (en la raíz del proyecto)
 * 2. Ejecuta: node test.js
 * 
 * Prueba TODOS los aspectos del traductor:
 * - Casos exitosos
 * - Casos con errores léxicos
 * - Casos con errores sintácticos
 * - Casos complejos
 */

import { Lexer } from './src/compiler/Lexer.js';
import { Parser } from './src/compiler/Parser.js';
import { Translator } from './src/compiler/Translator.js';

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

class TestRunner {
  constructor() {
    this.totalTests = 0;
    this.passedTests = 0;
    this.failedTests = 0;
    this.testResults = [];
  }

  /**
   * Imprime con color
   */
  log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  /**
   * Imprime header de sección
   */
  header(title) {
    console.log('\n' + '═'.repeat(70));
    this.log(title.toUpperCase(), 'cyan');
    console.log('═'.repeat(70));
  }

  /**
   * Ejecuta una prueba individual
   */
  test(name, javaCode, expectedBehavior) {
    this.totalTests++;
    this.log(`\n🧪 TEST ${this.totalTests}: ${name}`, 'bright');
    console.log('─'.repeat(70));
    
    try {
      // FASE 1: Análisis Léxico
      this.log('  [1/3] Análisis Léxico...', 'blue');
      const lexer = new Lexer(javaCode);
      const { tokens, errors: lexErrors } = lexer.tokenize();
      
      console.log(`  ├─ Tokens reconocidos: ${tokens.length}`);
      console.log(`  └─ Errores léxicos: ${lexErrors.length}`);
      
      // FASE 2: Análisis Sintáctico
      this.log('  [2/3] Análisis Sintáctico...', 'blue');
      const parser = new Parser(tokens);
      const { ast, errors: parseErrors, symbolTable } = parser.parse();
      
      console.log(`  ├─ AST generado: ${ast ? '✓' : '✗'}`);
      console.log(`  ├─ Variables en tabla: ${symbolTable.size}`);
      console.log(`  └─ Errores sintácticos: ${parseErrors.length}`);
      
      // FASE 3: Traducción
      this.log('  [3/3] Traducción a Python...', 'blue');
      const allErrors = [...lexErrors, ...parseErrors];
      const translator = new Translator(ast, symbolTable, allErrors);
      const pythonCode = translator.translate();
      
      console.log(`  ├─ Código Python generado: ${pythonCode.length} caracteres`);
      console.log(`  └─ Errores totales: ${allErrors.length}`);
      
      // Verificar comportamiento esperado
      const result = expectedBehavior({
        tokens,
        lexErrors,
        ast,
        parseErrors,
        symbolTable,
        pythonCode,
        allErrors
      });
      
      if (result.passed) {
        this.passedTests++;
        this.log('  ✅ PASÓ: ' + result.message, 'green');
        this.testResults.push({ name, status: 'PASÓ', message: result.message });
      } else {
        this.failedTests++;
        this.log('  ❌ FALLÓ: ' + result.message, 'red');
        this.testResults.push({ name, status: 'FALLÓ', message: result.message });
      }
      
      // Mostrar código Python generado (primeras 5 líneas)
      if (pythonCode) {
        console.log('\n  📄 Python generado (preview):');
        const lines = pythonCode.split('\n').slice(0, 5);
        lines.forEach(line => console.log(`     ${line}`));
        if (pythonCode.split('\n').length > 5) {
          console.log('     ...');
        }
      }
      
    } catch (error) {
      this.failedTests++;
      this.log(`  ❌ ERROR FATAL: ${error.message}`, 'red');
      this.testResults.push({ name, status: 'ERROR', message: error.message });
    }
  }

  /**
   * Muestra resumen final
   */
  showSummary() {
    this.header('RESUMEN DE PRUEBAS');
    
    console.log(`\n  Total de pruebas:  ${this.totalTests}`);
    this.log(`  ✅ Aprobadas:      ${this.passedTests}`, 'green');
    this.log(`  ❌ Fallidas:       ${this.failedTests}`, 'red');
    
    const percentage = ((this.passedTests / this.totalTests) * 100).toFixed(2);
    const color = percentage === '100.00' ? 'green' : percentage >= '70' ? 'yellow' : 'red';
    this.log(`\n  📊 Tasa de éxito: ${percentage}%`, color);
    
    console.log('\n' + '═'.repeat(70));
    
    // Detalle de resultados
    if (this.failedTests > 0) {
      this.log('\n⚠️  PRUEBAS FALLIDAS:', 'red');
      this.testResults
        .filter(r => r.status !== 'PASÓ')
        .forEach((r, i) => {
          console.log(`\n  ${i + 1}. ${r.name}`);
          console.log(`     Razón: ${r.message}`);
        });
    }
    
    return this.failedTests === 0;
  }
}

// ═══════════════════════════════════════════════════════════
// DEFINICIÓN DE PRUEBAS
// ═══════════════════════════════════════════════════════════

function runAllTests() {
  const runner = new TestRunner();
  
  runner.log('\n╔═══════════════════════════════════════════════════════════╗', 'bright');
  runner.log('║         JAVABRIDGE - SUITE DE PRUEBAS COMPLETA           ║', 'bright');
  runner.log('╚═══════════════════════════════════════════════════════════╝', 'bright');

  // ═══════════════════════════════════════════════════════════
  // CATEGORÍA 1: CASOS EXITOSOS
  // ═══════════════════════════════════════════════════════════
  runner.header('CATEGORÍA 1: CASOS EXITOSOS (Sin errores)');

  // Test 1: Programa mínimo válido
  runner.test(
    'Programa mínimo válido',
    `public class Test {
      public static void main(String[] args) {
        int x = 5;
      }
    }`,
    ({ lexErrors, parseErrors, pythonCode }) => {
      const noErrors = lexErrors.length === 0 && parseErrors.length === 0;
      const hasPython = pythonCode.includes('def main():') && pythonCode.includes('x = 5');
      return {
        passed: noErrors && hasPython,
        message: noErrors && hasPython ? 'Traduce correctamente' : 'Errores inesperados o Python inválido'
      };
    }
  );

  // Test 2: Declaración múltiple
  runner.test(
    'Declaración múltiple de variables',
    `public class Test {
      public static void main(String[] args) {
        int a = 1, b = 2, c = 3;
      }
    }`,
    ({ parseErrors, pythonCode }) => {
      const noErrors = parseErrors.length === 0;
      const hasVars = pythonCode.includes('a = 1') && pythonCode.includes('b = 2') && pythonCode.includes('c = 3');
      return {
        passed: noErrors && hasVars,
        message: noErrors && hasVars ? 'Declara múltiples variables correctamente' : 'Error en declaración múltiple'
      };
    }
  );

  // Test 3: Todos los tipos de datos
  runner.test(
    'Todos los tipos de datos soportados',
    `public class Test {
      public static void main(String[] args) {
        int entero = 42;
        double decimal = 3.14;
        char letra = 'A';
        String texto = "Hola";
        boolean activo = true;
      }
    }`,
    ({ symbolTable, pythonCode, allErrors }) => {
      const hasAllTypes = symbolTable.size === 5;
      const pythonHasTrue = pythonCode.includes('True');
      const noErrors = allErrors.length === 0;
      return {
        passed: hasAllTypes && pythonHasTrue && noErrors,
        message: hasAllTypes && pythonHasTrue && noErrors ? 'Reconoce todos los tipos' : 'Falta algún tipo'
      };
    }
  );

  // Test 4: Estructura IF simple
  runner.test(
    'Estructura IF simple',
    `public class Test {
      public static void main(String[] args) {
        int x = 10;
        if (x > 5) {
          System.out.println(x);
        }
      }
    }`,
    ({ pythonCode, allErrors }) => {
      const hasIf = pythonCode.includes('if') && pythonCode.includes('print(');
      const noErrors = allErrors.length === 0;
      return {
        passed: hasIf && noErrors,
        message: hasIf && noErrors ? 'IF traducido correctamente' : 'Error en IF'
      };
    }
  );

  // Test 5: Estructura IF-ELSE
  runner.test(
    'Estructura IF-ELSE completa',
    `public class Test {
      public static void main(String[] args) {
        int x = 5;
        if (x > 10) {
          System.out.println("Mayor");
        } else {
          System.out.println("Menor");
        }
      }
    }`,
    ({ pythonCode, allErrors }) => {
      const hasIfElse = pythonCode.includes('if') && pythonCode.includes('else:');
      const noErrors = allErrors.length === 0;
      return {
        passed: hasIfElse && noErrors,
        message: hasIfElse && noErrors ? 'IF-ELSE traducido' : 'Error en IF-ELSE'
      };
    }
  );

  // Test 6: Bucle FOR
  runner.test(
    'Bucle FOR (traducido a WHILE)',
    `public class Test {
      public static void main(String[] args) {
        for (int i = 0; i < 5; i++) {
          System.out.println(i);
        }
      }
    }`,
    ({ pythonCode, allErrors }) => {
      const hasWhile = pythonCode.includes('while');
      const hasIncrement = pythonCode.includes('i += 1') || pythonCode.includes('i -= 1');
      const noErrors = allErrors.length === 0;
      return {
        passed: hasWhile && hasIncrement && noErrors,
        message: hasWhile && hasIncrement && noErrors ? 'FOR → WHILE correcto' : 'Error en FOR'
      };
    }
  );

  // Test 7: Bucle WHILE
  runner.test(
    'Bucle WHILE',
    `public class Test {
      public static void main(String[] args) {
        int x = 0;
        while (x < 3) {
          System.out.println(x);
          x++;
        }
      }
    }`,
    ({ pythonCode, allErrors }) => {
      const hasWhile = pythonCode.includes('while (x < 3)');
      const noErrors = allErrors.length === 0;
      return {
        passed: hasWhile && noErrors,
        message: hasWhile && noErrors ? 'WHILE traducido' : 'Error en WHILE'
      };
    }
  );

  // Test 8: Operaciones aritméticas
  runner.test(
    'Operaciones aritméticas complejas',
    `public class Test {
      public static void main(String[] args) {
        int resultado = 2 + 3 * 4 - 1;
        double division = 10 / 2;
      }
    }`,
    ({ pythonCode, allErrors }) => {
      const hasOperations = pythonCode.includes('2 + 3 * 4 - 1') || pythonCode.includes('(');
      const noErrors = allErrors.length === 0;
      return {
        passed: hasOperations && noErrors,
        message: hasOperations && noErrors ? 'Operaciones traducidas' : 'Error en operaciones'
      };
    }
  );

  // Test 9: Comentarios
  runner.test(
    'Comentarios de línea y bloque',
    `public class Test {
      public static void main(String[] args) {
        // Comentario de línea
        int x = 5;
        /* Comentario
           de bloque */
        int y = 10;
      }
    }`,
    ({ tokens, allErrors }) => {
      const hasComments = tokens.some(t => t.type === 'COMENTARIO');
      const noErrors = allErrors.length === 0;
      return {
        passed: hasComments && noErrors,
        message: hasComments && noErrors ? 'Comentarios reconocidos' : 'Error en comentarios'
      };
    }
  );

  // Test 10: Programa complejo
  runner.test(
    'Programa complejo con todo',
    `public class Completo {
      public static void main(String[] args) {
        int a = 5, b = 10;
        double pi = 3.14159;
        String nombre = "JavaBridge";
        
        if (a < b) {
          System.out.println("a es menor");
          
          for (int i = 0; i < 3; i++) {
            System.out.println(i);
          }
        } else {
          System.out.println("a es mayor o igual");
        }
        
        int contador = 0;
        while (contador < 2) {
          contador++;
        }
      }
    }`,
    ({ symbolTable, pythonCode, allErrors }) => {
      const hasVariables = symbolTable.size >= 5;
      const hasStructures = pythonCode.includes('if') && pythonCode.includes('while');
      const noErrors = allErrors.length === 0;
      return {
        passed: hasVariables && hasStructures && noErrors,
        message: hasVariables && hasStructures && noErrors ? 'Programa complejo traducido' : 'Error en programa complejo'
      };
    }
  );

  // ═══════════════════════════════════════════════════════════
  // CATEGORÍA 2: ERRORES LÉXICOS
  // ═══════════════════════════════════════════════════════════
  runner.header('CATEGORÍA 2: ERRORES LÉXICOS (Pero sigue traduciendo)');

  // Test 11: Carácter inválido
  runner.test(
    'Error: Carácter no reconocido (@)',
    `public class Test {
      public static void main(String[] args) {
        int x = 10@;
      }
    }`,
    ({ lexErrors, pythonCode }) => {
      const hasLexError = lexErrors.length > 0;
      const stillTranslates = pythonCode.length > 0;
      return {
        passed: hasLexError && stillTranslates,
        message: hasLexError && stillTranslates ? 'Detecta error y traduce parcialmente' : 'No maneja error correctamente'
      };
    }
  );

  // Test 12: Cadena sin cerrar
  runner.test(
    'Error: Cadena sin cerrar',
    `public class Test {
      public static void main(String[] args) {
        String mensaje = "Hola mundo;
      }
    }`,
    ({ lexErrors, pythonCode }) => {
      const hasError = lexErrors.some(e => e.message.includes('sin cerrar'));
      const stillTranslates = pythonCode.length > 0;
      return {
        passed: hasError && stillTranslates,
        message: hasError && stillTranslates ? 'Detecta cadena sin cerrar y continúa' : 'No detecta error'
      };
    }
  );

  // Test 13: Número decimal mal formado
  runner.test(
    'Error: Número decimal inválido (12.34.56)',
    `public class Test {
      public static void main(String[] args) {
        double pi = 3.14.15;
      }
    }`,
    ({ lexErrors, pythonCode }) => {
      const hasError = lexErrors.length > 0;
      const stillTranslates = pythonCode.length > 0;
      return {
        passed: hasError && stillTranslates,
        message: hasError && stillTranslates ? 'Detecta decimal inválido' : 'No detecta error'
      };
    }
  );

  // Test 14: Carácter mal formado
  runner.test(
    'Error: Carácter mal formado (más de un char)',
    `public class Test {
      public static void main(String[] args) {
        char letra = 'ABC';
      }
    }`,
    ({ lexErrors, pythonCode }) => {
      const hasError = lexErrors.some(e => e.message.includes('mal formado'));
      const stillTranslates = pythonCode.length > 0;
      return {
        passed: hasError && stillTranslates,
        message: hasError && stillTranslates ? 'Detecta carácter inválido' : 'No detecta error'
      };
    }
  );

  // ═══════════════════════════════════════════════════════════
  // CATEGORÍA 3: ERRORES SINTÁCTICOS
  // ═══════════════════════════════════════════════════════════
  runner.header('CATEGORÍA 3: ERRORES SINTÁCTICOS (Pero sigue traduciendo)');

  // Test 15: Falta punto y coma
  runner.test(
    'Error: Falta punto y coma',
    `public class Test {
      public static void main(String[] args) {
        int x = 10
        int y = 20;
      }
    }`,
    ({ parseErrors, pythonCode }) => {
      const hasError = parseErrors.length > 0;
      const stillTranslates = pythonCode.length > 0;
      return {
        passed: hasError && stillTranslates,
        message: hasError && stillTranslates ? 'Detecta falta de ; y continúa' : 'No maneja error'
      };
    }
  );

  // Test 16: Variable no declarada
  runner.test(
    'Advertencia: Variable no declarada',
    `public class Test {
      public static void main(String[] args) {
        x = 10;
      }
    }`,
    ({ parseErrors, pythonCode }) => {
      const hasWarning = parseErrors.some(e => e.message.includes('no declarada'));
      const stillTranslates = pythonCode.includes('x = 10');
      return {
        passed: hasWarning && stillTranslates,
        message: hasWarning && stillTranslates ? 'Detecta variable no declarada y traduce' : 'No detecta advertencia'
      };
    }
  );

  // Test 17: Estructura de clase incorrecta
  runner.test(
    'Error: Estructura de clase incorrecta',
    `private class Test {
      public static void main(String[] args) {
        int x = 5;
      }
    }`,
    ({ parseErrors, pythonCode }) => {
      const hasError = parseErrors.length > 0 || pythonCode.includes('ERROR');
      const attemptsTranslation = pythonCode.length > 0;
      return {
        passed: hasError && attemptsTranslation,
        message: hasError && attemptsTranslation ? 'Detecta clase incorrecta' : 'No detecta error'
      };
    }
  );

  // ═══════════════════════════════════════════════════════════
  // CATEGORÍA 4: CASOS EDGE (Límites)
  // ═══════════════════════════════════════════════════════════
  runner.header('CATEGORÍA 4: CASOS LÍMITE');

  // Test 18: Programa vacío
  runner.test(
    'Programa con main vacío',
    `public class Test {
      public static void main(String[] args) {
      }
    }`,
    ({ pythonCode, allErrors }) => {
      const hasDef = pythonCode.includes('def main():');
      const hasPass = pythonCode.includes('pass');
      return {
        passed: hasDef && hasPass,
        message: hasDef && hasPass ? 'Maneja main vacío con pass' : 'No maneja main vacío'
      };
    }
  );

  // Test 19: Múltiples errores
  runner.test(
    'Múltiples errores combinados',
    `public class Test {
      public static void main(String[] args) {
        int x = 10@
        y = 20;
        String s = "sin cerrar
      }
    }`,
    ({ allErrors, pythonCode }) => {
      const hasMultipleErrors = allErrors.length >= 2;
      const stillTranslates = pythonCode.length > 0;
      return {
        passed: hasMultipleErrors && stillTranslates,
        message: hasMultipleErrors && stillTranslates ? 'Detecta múltiples errores y traduce' : 'No maneja múltiples errores'
      };
    }
  );

  // Test 20: Expresiones anidadas
  runner.test(
    'Expresiones con paréntesis anidados',
    `public class Test {
      public static void main(String[] args) {
        int resultado = ((2 + 3) * (4 - 1)) / 2;
      }
    }`,
    ({ pythonCode, allErrors }) => {
      const hasParenthesis = pythonCode.includes('((') && pythonCode.includes('))');
      const noErrors = allErrors.length === 0;
      return {
        passed: hasParenthesis && noErrors,
        message: hasParenthesis && noErrors ? 'Maneja paréntesis anidados' : 'Error en anidación'
      };
    }
  );

  // Mostrar resumen
  const allPassed = runner.showSummary();
  
  // Exit code
  process.exit(allPassed ? 0 : 1);
}

// ═══════════════════════════════════════════════════════════
// EJECUTAR PRUEBAS
// ═══════════════════════════════════════════════════════════
runAllTests();