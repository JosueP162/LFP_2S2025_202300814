/**
 * ANALIZADOR LÉXICO (LEXER) - VERSIÓN COMPLETA
 * Implementa un Autómata Finito Determinista (AFD) manual
 * SIN USO DE EXPRESIONES REGULARES
 * 
 * ESTADOS DEL AFD:
 * 
 * Estado 0: INICIAL
 *   - Punto de entrada del autómata
 *   - Determina qué tipo de token se está leyendo
 *   - Transiciones:
 *     * [a-zA-Z_] → Estado 1 (Identificador/Palabra Reservada)
 *     * [0-9]     → Estado 2 (Número)
 *     * [-]       → Estado 3 (Número negativo o operador)
 *     * ["]       → Estado 4 (Cadena)
 *     * [']       → Estado 5 (Carácter)
 *     * [/]       → Estado 6 (Comentario o operador división)
 *     * [{()}[];,.=+-*<>!] → Estado 7 (Símbolos/Operadores)
 *     * [ \t\n\r] → Estado 0 (Ignorar espacios)
 *     * CUALQUIER OTRO CARÁCTER → Estado ERROR (Carácter no reconocido)
 */

export class Lexer {
  constructor(input) {
    this.input = input;
    this.position = 0;
    this.currentChar = input[0] || null;
    this.line = 1;
    this.column = 1;
    this.tokens = [];
    this.errors = [];
  }

  /**
   * MÉTODO PRINCIPAL - Ejecuta el AFD
   * Realiza el análisis léxico completo del código fuente
   * Retorna tokens Y errores (no detiene ejecución por errores)
   */
  tokenize() {
    // ESTADO 0: INICIAL
    while (this.currentChar !== null) {
      const startLine = this.line;
      const startCol = this.column;

      // Espacios en blanco (ignorar) - Permanece en Estado 0
      if (this.isWhitespace(this.currentChar)) {
        this.skipWhitespace();
        continue;
      }

      // Transición: [/] → Estado 6 (Comentario o división)
      if (this.currentChar === '/') {
        if (this.peek() === '/' || this.peek() === '*') {
          this.handleComment();
          continue;
        }
      }

      // Transición: [0-9] → Estado 2 (Número)
      if (this.isDigit(this.currentChar)) {
        this.handleNumber();
        continue;
      }

      // Transición: [-] → Estado 3 (Número negativo o resta)
      if (this.currentChar === '-' && this.isDigit(this.peek())) {
        this.handleNumber();
        continue;
      }

      // Transición: [a-zA-Z_] → Estado 1 (Identificador)
      if (this.isLetter(this.currentChar) || this.currentChar === '_') {
        this.handleIdentifier();
        continue;
      }

      // Transición: ["] → Estado 4 (Cadena)
      if (this.currentChar === '"') {
        this.handleString();
        continue;
      }

      // Transición: ['] → Estado 5 (Carácter)
      if (this.currentChar === "'") {
        this.handleChar();
        continue;
      }

      // Transición: Símbolos → Estado 7
      if (this.isValidSymbol(this.currentChar)) {
        this.handleSymbol();
        continue;
      }

      // ESTADO ERROR: Carácter no reconocido - CONTINUAR ANALIZANDO
      const errorChar = this.currentChar;
      this.errors.push({
        type: 'LEXICO',
        message: `Carácter no reconocido: '${errorChar}'`,
        line: startLine,
        column: startCol,
        lexeme: errorChar,
        severity: 'ERROR'
      });

      // AVANZAR Y CONTINUAR (no detener análisis)
      this.advance();
    }

    return { 
      tokens: this.tokens, 
      errors: this.errors,
      success: this.errors.length === 0 
    };
  }

  /**
   * ESTADO 1: IDENTIFICADOR/PALABRA_RESERVADA
   * AFD para reconocer identificadores
   * Patrón: [A-Za-z_][A-Za-z0-9_]*
   */
  handleIdentifier() {
    let lexeme = '';
    const startLine = this.line;
    const startCol = this.column;

    // Estado 1: Leer primer carácter (letra o _)
    if (!this.isLetter(this.currentChar) && this.currentChar !== '_') {
      this.errors.push({
        type: 'LEXICO',
        message: 'Identificador inválido: debe comenzar con letra o guion bajo',
        line: startLine,
        column: startCol,
        lexeme: this.currentChar,
        severity: 'ERROR'
      });
      this.advance();
      return;
    }

    // Estado 1 (bucle): Leer caracteres válidos
    while (this.currentChar !== null && 
           (this.isLetter(this.currentChar) || 
            this.isDigit(this.currentChar) || 
            this.currentChar === '_')) {
      lexeme += this.currentChar;
      this.advance();
    }

    // ACEPTACIÓN: Determinar si es palabra reservada o identificador
    const type = this.isKeyword(lexeme) ? 'PALABRA_RESERVADA' : 'ID';
    
    this.tokens.push({
      type: type,
      value: lexeme,
      line: startLine,
      column: startCol
    });
  }

  /**
   * ESTADO 2, 3, 8, 13: NÚMEROS (ENTEROS Y DECIMALES)
   * AFD para reconocer números enteros y decimales
   * Soporta números negativos
   */
  handleNumber() {
    let lexeme = '';
    const startLine = this.line;
    const startCol = this.column;
    let hasDecimal = false;
    let hasDigit = false;

    // Estado 3: Manejar signo negativo
    if (this.currentChar === '-') {
      lexeme += this.currentChar;
      this.advance();
    }

    // Estado 2: Leer dígitos enteros
    while (this.currentChar !== null && 
           (this.isDigit(this.currentChar) || this.currentChar === '.')) {
      
      if (this.currentChar === '.') {
        // Transición a Estado 8: Punto decimal
        if (hasDecimal) {
          // ERROR: Segundo punto decimal
          this.errors.push({
            type: 'LEXICO',
            message: 'Número decimal inválido: múltiples puntos decimales',
            line: startLine,
            column: startCol,
            lexeme: lexeme + this.currentChar,
            severity: 'ERROR'
          });
          this.advance();
          return;
        }
        
        if (!hasDigit) {
          // ERROR: Punto decimal sin dígitos previos
          this.errors.push({
            type: 'LEXICO',
            message: 'Número decimal inválido: punto decimal sin dígitos',
            line: startLine,
            column: startCol,
            lexeme: lexeme + this.currentChar,
            severity: 'ERROR'
          });
          this.advance();
          return;
        }
        
        hasDecimal = true;
        lexeme += this.currentChar;
        this.advance();
        
        // Estado 8: Debe haber al menos un dígito después del punto
        if (!this.isDigit(this.currentChar)) {
          this.errors.push({
            type: 'LEXICO',
            message: 'Número decimal inválido: falta dígito después del punto',
            line: startLine,
            column: startCol,
            lexeme: lexeme,
            severity: 'ERROR'
          });
          return;
        }
        continue;
      }
      
      // Estado 2 o 13: Leer dígito
      lexeme += this.currentChar;
      hasDigit = true;
      this.advance();
    }

    // ACEPTACIÓN: Estado 2 (entero) o Estado 13 (decimal)
    const type = hasDecimal ? 'DECIMAL' : 'ENTERO';
    this.tokens.push({
      type: type,
      value: lexeme,
      line: startLine,
      column: startCol
    });
  }

  /**
   * ESTADO 4, 9: CADENAS
   * AFD para reconocer cadenas de texto
   * Detecta cadenas sin cerrar
   */
  handleString() {
    let lexeme = '';
    const startLine = this.line;
    const startCol = this.column;
    
    // Consumir comilla inicial
    this.advance();

    // Estado 4: Leer contenido de la cadena
    while (this.currentChar !== null && this.currentChar !== '"') {
      // ERROR: Salto de línea sin cerrar cadena
      if (this.currentChar === '\n') {
        this.errors.push({
          type: 'LEXICO',
          message: 'Cadena sin cerrar: encontrado salto de línea',
          line: startLine,
          column: startCol,
          lexeme: '"' + lexeme,
          severity: 'ERROR'
        });
        return;
      }
      
      lexeme += this.currentChar;
      this.advance();
    }

    // ERROR: Fin de archivo sin cerrar cadena
    if (this.currentChar === null) {
      this.errors.push({
        type: 'LEXICO',
        message: 'Cadena sin cerrar: fin de archivo inesperado',
        line: startLine,
        column: startCol,
        lexeme: '"' + lexeme,
        severity: 'ERROR'
      });
      return;
    }

    // Consumir comilla final
    this.advance();

    // ACEPTACIÓN: Estado 9
    this.tokens.push({
      type: 'CADENA',
      value: lexeme,
      line: startLine,
      column: startCol
    });
  }

  /**
   * ESTADO 5, 10: CARACTERES
   * AFD para reconocer caracteres individuales
   * Valida formato correcto 'x'
   */
  handleChar() {
    const startLine = this.line;
    const startCol = this.column;
    
    // Consumir comilla inicial
    this.advance();
    
    // ERROR: Fin de archivo inmediato
    if (this.currentChar === null) {
      this.errors.push({
        type: 'LEXICO',
        message: 'Carácter sin cerrar: fin de archivo inesperado',
        line: startLine,
        column: startCol,
        lexeme: "'",
        severity: 'ERROR'
      });
      return;
    }

    // Estado 5: Leer exactamente un carácter
    const charValue = this.currentChar;
    this.advance();

    // Estado 10: Verificar comilla de cierre
    if (this.currentChar !== "'") {
      this.errors.push({
        type: 'LEXICO',
        message: 'Carácter mal formado: debe contener exactamente un carácter',
        line: startLine,
        column: startCol,
        lexeme: "'" + charValue + (this.currentChar || ''),
        severity: 'ERROR'
      });
      
      // Intentar recuperarse buscando comilla de cierre
      while (this.currentChar !== null && this.currentChar !== "'") {
        this.advance();
      }
      if (this.currentChar === "'") this.advance();
      return;
    }

    // Consumir comilla final
    this.advance();

    // ACEPTACIÓN
    this.tokens.push({
      type: 'CARACTER',
      value: charValue,
      line: startLine,
      column: startCol
    });
  }

  /**
   * ESTADO 6, 11, 12: COMENTARIOS
   * AFD para reconocer comentarios de línea y bloque
   */
  handleComment() {
    const startLine = this.line;
    const startCol = this.column;
    
    this.advance(); // Consumir primer /
    
    // Estado 11: Comentario de línea //
    if (this.currentChar === '/') {
      let comment = '//';
      this.advance();
      
      while (this.currentChar !== null && this.currentChar !== '\n') {
        comment += this.currentChar;
        this.advance();
      }
      
      this.tokens.push({
        type: 'COMENTARIO',
        value: comment,
        line: startLine,
        column: startCol
      });
      return;
    }
    
    // Estado 12: Comentario de bloque /* */
    if (this.currentChar === '*') {
      let comment = '/*';
      this.advance();
      
      while (this.currentChar !== null) {
        if (this.currentChar === '*' && this.peek() === '/') {
          comment += '*/';
          this.advance(); // *
          this.advance(); // /
          break;
        }
        comment += this.currentChar;
        this.advance();
      }
      
      this.tokens.push({
        type: 'COMENTARIO',
        value: comment,
        line: startLine,
        column: startCol
      });
      return;
    }
  }

  /**
   * ESTADO 7: SÍMBOLOS Y OPERADORES
   * AFD para reconocer símbolos y operadores
   * Maneja operadores de 1 y 2 caracteres
   */
  handleSymbol() {
    const startLine = this.line;
    const startCol = this.column;
    let symbol = this.currentChar;
    
    this.advance();

    // Operadores de dos caracteres
    const twoCharOps = {
      '=': '=',  // ==
      '!': '=',  // !=
      '>': '=',  // >=
      '<': '=',  // <=
      '+': '+',  // ++
      '-': '-'   // --
    };

    if (twoCharOps[symbol] && this.currentChar === twoCharOps[symbol]) {
      symbol += this.currentChar;
      this.advance();
    }

    this.tokens.push({
      type: 'SIMBOLO',
      value: symbol,
      line: startLine,
      column: startCol
    });
  }

  /**
   * MÉTODOS AUXILIARES
   */

  advance() {
    if (this.currentChar === '\n') {
      this.line++;
      this.column = 0;
    }
    this.position++;
    this.column++;
    this.currentChar = this.position < this.input.length 
      ? this.input[this.position] 
      : null;
  }

  peek(offset = 1) {
    const pos = this.position + offset;
    return pos < this.input.length ? this.input[pos] : null;
  }

  skipWhitespace() {
    while (this.currentChar !== null && this.isWhitespace(this.currentChar)) {
      this.advance();
    }
  }

  isWhitespace(char) {
    return char === ' ' || char === '\t' || char === '\n' || char === '\r';
  }

  isDigit(char) {
    return char >= '0' && char <= '9';
  }

  isLetter(char) {
    return (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z');
  }

  isValidSymbol(char) {
    // Solo caracteres válidos del lenguaje Java
    return '{}()[];,.=+-*/<>!'.includes(char);
  }

  isKeyword(word) {
    const keywords = [
      'public', 'class', 'static', 'void', 'main', 'String',
      'int', 'double', 'char', 'boolean', 'true', 'false',
      'if', 'else', 'for', 'while', 'System', 'out', 'println'
    ];
    return keywords.includes(word);
  }
}