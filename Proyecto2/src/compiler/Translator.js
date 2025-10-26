/**
 * TRADUCTOR JAVA → PYTHON - VERSIÓN COMPLETA Y FUNCIONAL
 * 
 * Convierte el AST (Árbol de Sintaxis Abstracta) de Java a código Python
 * TRADUCE INCLUSO CON ERRORES - Genera código Python parcial con comentarios de error
 * 
 * REGLAS DE TRADUCCIÓN:
 * 
 * 1. TIPOS DE DATOS:
 *    Java          → Python
 *    int           → int
 *    double        → float
 *    char          → str (un carácter)
 *    String        → str
 *    boolean       → bool
 * 
 * 2. VALORES POR DEFECTO:
 *    int           → 0
 *    double        → 0.0
 *    char          → ' '
 *    String        → ""
 *    boolean       → False
 * 
 * 3. BOOLEANOS:
 *    true          → True
 *    false         → False
 * 
 * 4. ESTRUCTURAS:
 *    class {...}   → def main(): ...
 *    for(...)      → while equivalente
 *    System.out    → print()
 * 
 * 5. INDENTACIÓN:
 *    Java usa {}   → Python usa 4 espacios
 */

export class Translator {
  constructor(ast, symbolTable, errors = []) {
    this.ast = ast;
    this.symbolTable = symbolTable;
    this.errors = errors;
    this.pythonCode = '';
    this.indentLevel = 0;
    this.warnings = [];
  }

  /**
   * MÉTODO PRINCIPAL
   * Traduce el AST completo a Python
   */
  translate() {
    if (!this.ast) {
      this.writeLine('# ==========================================');
      this.writeLine('# ERROR: No se pudo generar AST válido');
      this.writeLine('# ==========================================');
      this.writeLine('');
      this.writeLine('def main():');
      this.indentLevel++;
      this.writeLine('pass');
      this.indentLevel--;
      this.writeLine('');
      this.writeLine('if __name__ == "__main__":');
      this.indentLevel++;
      this.writeLine('main()');
      this.indentLevel--;
      return this.pythonCode;
    }

    // Encabezado
    this.writeLine('# ==========================================');
    this.writeLine('# Traducido de Java a Python por JavaBridge');
    this.writeLine('# ==========================================');
    
    if (this.errors.length > 0) {
      this.writeLine(`# ADVERTENCIA: Se encontraron ${this.errors.length} error(es)`);
      this.writeLine('# El traductor intentó recuperar el código válido');
      this.errors.forEach(error => {
        this.writeLine(`# ERROR ${error.type}: ${error.message} (Línea ${error.line})`);
      });
    }
    
    this.writeLine(`# Clase original: ${this.ast.className}`);
    this.writeLine('');

    try {
      this.translateProgram(this.ast);
    } catch (error) {
      this.writeLine('# ERROR CRÍTICO EN TRADUCCIÓN:');
      this.writeLine(`# ${error.message}`);
    }

    return this.pythonCode;
  }

  /**
   * Traduce la estructura del programa
   */
  translateProgram(node) {
    if (node.main) {
      this.translateMain(node.main);
    } else {
      this.writeLine('def main():');
      this.indentLevel++;
      this.writeLine('pass');
      this.indentLevel--;
    }
  }

  /**
   * Traduce el método main
   */
  translateMain(node) {
    this.writeLine('def main():');
    this.indentLevel++;

    if (!node.statements || node.statements.length === 0) {
      this.writeLine('pass');
    } else {
      node.statements.forEach(stmt => {
        try {
          this.translateStatement(stmt);
        } catch (error) {
          this.writeLine(`# ERROR traduciendo sentencia: ${error.message}`);
        }
      });
    }

    this.indentLevel--;
    this.writeLine('');
    this.writeLine('if __name__ == "__main__":');
    this.indentLevel++;
    this.writeLine('main()');
    this.indentLevel--;
  }

  /**
   * Traduce una sentencia del AST
   */
  translateStatement(stmt) {
    if (!stmt || !stmt.type) {
      this.writeLine('# Sentencia inválida omitida');
      return;
    }

    switch (stmt.type) {
      case 'Declaracion':
        this.translateDeclaration(stmt);
        break;
      
      case 'Asignacion':
        this.translateAssignment(stmt);
        break;
      
      case 'If':
        this.translateIf(stmt);
        break;
      
      case 'For':
        this.translateFor(stmt);
        break;
      
      case 'While':
        this.translateWhile(stmt);
        break;
      
      case 'Print':
        this.translatePrint(stmt);
        break;

      case 'Incremento':
        this.translateIncremento(stmt);
        break;

      case 'Empty':
        // Sentencia vacía, no hacer nada
        break;

      default:
        this.writeLine(`# Sentencia desconocida: ${stmt.type}`);
    }
  }

  /**
   * INCREMENTO: Traduce ++ y --
   */
  translateIncremento(stmt) {
    const op = stmt.operator === '++' ? '+= 1' : '-= 1';
    this.writeLine(`${stmt.id} ${op}  # ${stmt.operator}`);
  }

  /**
   * DECLARACION: Traduce declaración de variables
   * Java: int x = 5, y = 10;
   * Python: x = 5
   *         y = 10
   */
  translateDeclaration(stmt) {
    if (!stmt.variables || stmt.variables.length === 0) {
      this.writeLine('# Declaración vacía');
      return;
    }

    stmt.variables.forEach(variable => {
      const value = variable.value 
        ? this.translateExpression(variable.value)
        : this.getDefaultValue(stmt.dataType);
      
      this.writeLine(`${variable.id} = ${value}  # Tipo: ${stmt.dataType}`);
    });
  }

  /**
   * ASIGNACION: Traduce asignación de variable
   * Java: x = 10;
   * Python: x = 10
   */
  translateAssignment(stmt) {
    const value = this.translateExpression(stmt.value);
    this.writeLine(`${stmt.id} = ${value}`);
  }

  /**
   * IF-ELSE: Traduce estructura condicional
   * Java: if (x > 5) { ... } else { ... }
   * Python: if x > 5:
   *             ...
   *         else:
   *             ...
   */
  translateIf(stmt) {
    const condition = this.translateExpression(stmt.condition);
    this.writeLine(`if ${condition}:`);
    this.indentLevel++;

    if (!stmt.thenBlock || stmt.thenBlock.length === 0) {
      this.writeLine('pass');
    } else {
      stmt.thenBlock.forEach(s => this.translateStatement(s));
    }

    this.indentLevel--;

    if (stmt.elseBlock && stmt.elseBlock.length > 0) {
      this.writeLine('else:');
      this.indentLevel++;
      stmt.elseBlock.forEach(s => this.translateStatement(s));
      this.indentLevel--;
    }
  }

  /**
   * FOR: Traduce bucle for a while equivalente
   * Java: for (int i = 0; i < 10; i++) { ... }
   * Python: i = 0
   *         while i < 10:
   *             ...
   *             i += 1
   */
  translateFor(stmt) {
    // Inicialización
    const initValue = this.translateExpression(stmt.init.value);
    this.writeLine(`${stmt.init.id} = ${initValue}  # Inicialización for`);

    // Condición del while
    const condition = this.translateExpression(stmt.condition);
    this.writeLine(`while ${condition}:`);
    this.indentLevel++;

    // Cuerpo del bucle
    if (!stmt.body || stmt.body.length === 0) {
      this.writeLine('pass');
    } else {
      stmt.body.forEach(s => this.translateStatement(s));
    }

    // Actualización (++ o --)
    const updateOp = stmt.update.op === '++' ? '+= 1' : '-= 1';
    this.writeLine(`${stmt.update.id} ${updateOp}  # Actualización for`);

    this.indentLevel--;
  }

  /**
   * WHILE: Traduce bucle while
   * Java: while (x < 10) { ... }
   * Python: while x < 10:
   *             ...
   */
  translateWhile(stmt) {
    const condition = this.translateExpression(stmt.condition);
    this.writeLine(`while ${condition}:`);
    this.indentLevel++;

    if (!stmt.body || stmt.body.length === 0) {
      this.writeLine('pass');
    } else {
      stmt.body.forEach(s => this.translateStatement(s));
    }

    this.indentLevel--;
  }

  /**
   * PRINT: Traduce System.out.println
   * Java: System.out.println(x);
   * Python: print(x)
   */
  translatePrint(stmt) {
    const expr = this.translateExpression(stmt.expression);
    this.writeLine(`print(${expr})`);
  }

  /**
   * EXPRESION: Traduce expresiones y operaciones
   */
  translateExpression(expr) {
    if (!expr || !expr.type) {
      return '# ERROR_EXPRESION';
    }

    switch (expr.type) {
      case 'Literal':
        return expr.value;

      case 'String':
        return `"${expr.value}"`;

      case 'Char':
        return `'${expr.value}'`;

      case 'Boolean':
        // Java: true/false → Python: True/False
        return expr.value === 'true' ? 'True' : 'False';

      case 'Variable':
        return expr.name;

      case 'BinaryOp':
        const left = this.translateExpression(expr.left);
        const right = this.translateExpression(expr.right);
        return `(${left} ${expr.operator} ${right})`;

      default:
        this.warnings.push(`Expresión desconocida: ${expr.type}`);
        return '# ERROR_EXPRESION';
    }
  }

  /**
   * Obtiene el valor por defecto según el tipo de dato
   */
  getDefaultValue(type) {
    const defaults = {
      'int': '0',
      'double': '0.0',
      'char': "' '",
      'String': '""',
      'boolean': 'False'
    };
    return defaults[type] || '0';
  }

  /**
   * Escribe una línea con la indentación correcta
   */
  writeLine(text) {
    const indent = '    '.repeat(this.indentLevel);
    this.pythonCode += indent + text + '\n';
  }

  /**
   * Obtiene las advertencias generadas durante la traducción
   */
  getWarnings() {
    return this.warnings;
  }
}