/**
 * ANALIZADOR SINTÁCTICO (PARSER) - VERSIÓN COMPLETA
 * Implementa un Parser Descendente Recursivo
 * Basado en la Gramática Libre de Contexto (GLC) del proyecto
 * 
 * GRAMÁTICA BNF COMPLETA:
 * 
 * PROGRAMA      ::= 'public' 'class' ID '{' MAIN '}'
 * MAIN          ::= 'public' 'static' 'void' 'main' '(' 'String' '[' ']' ID ')' '{' SENTENCIAS '}'
 * SENTENCIAS    ::= SENTENCIA SENTENCIAS | ε
 * SENTENCIA     ::= DECLARACION | ASIGNACION | IF | FOR | WHILE | PRINT | INCREMENTO | ';'
 * DECLARACION   ::= TIPO LISTA_VARS ';'
 * LISTA_VARS    ::= VAR_DECL (',' VAR_DECL)*
 * VAR_DECL      ::= ID ('=' EXPRESION)?
 * ASIGNACION    ::= ID '=' EXPRESION ';'
 * INCREMENTO    ::= ID ('++' | '--') ';'
 * IF            ::= 'if' '(' EXPRESION ')' '{' SENTENCIAS '}' ('else' '{' SENTENCIAS '}')?
 * FOR           ::= 'for' '(' FOR_INIT ';' EXPRESION ';' FOR_UPDATE ')' '{' SENTENCIAS '}'
 * FOR_INIT      ::= TIPO ID '=' EXPRESION
 * FOR_UPDATE    ::= ID ('++' | '--')
 * WHILE         ::= 'while' '(' EXPRESION ')' '{' SENTENCIAS '}'
 * PRINT         ::= 'System' '.' 'out' '.' 'println' '(' EXPRESION ')' ';'
 * EXPRESION     ::= TERMINO (('==' | '!=' | '>' | '<' | '>=' | '<=') TERMINO)*
 * TERMINO       ::= FACTOR (('+' | '-') FACTOR)*
 * FACTOR        ::= PRIMARIO (('*' | '/') PRIMARIO)*
 * PRIMARIO      ::= ID | LITERAL | '(' EXPRESION ')'
 * TIPO          ::= 'int' | 'double' | 'char' | 'String' | 'boolean'
 * LITERAL       ::= ENTERO | DECIMAL | CARACTER | CADENA | BOOLEANO
 */

export class Parser {
  constructor(tokens) {
    // Conservar tokens ORIGINALES para mejor reporte
    this.originalTokens = tokens;
    // Filtrar comentarios - SOLO PROCESAR TOKENS VÁLIDOS
    this.tokens = tokens.filter(t => t.type !== 'COMENTARIO');
    this.current = 0;
    this.errors = [];
    this.symbolTable = new Map();
    this.recoveryMode = false; // Modo de recuperación
  }

  /**
   * MÉTODO PRINCIPAL MEJORADO
   * Siempre retorna un AST, incluso con errores
   */
parse() {
  try {
    const ast = this.programa();
    
    // 🆕 VERIFICACIÓN: Asegurar que tenemos un AST válido con nombre de clase real
    if (ast && ast.className && ast.className.includes('Emergency')) {
      console.warn('⚠️  Se generó AST de emergencia en lugar del AST real');
      // Intentar recuperación más agresiva
      return this.attemptFullRecovery();
    }
    
    return { 
      ast, 
      errors: this.errors, 
      symbolTable: this.symbolTable,
      success: this.errors.length === 0
    };
  } catch (error) {
    console.error('❌ Error crítico en parser:', error);
    return { 
      ast: this.createEmergencyAST(), 
      errors: this.errors, 
      symbolTable: this.symbolTable,
      success: false
    };
  }
}

/**
 * 🆕 MÉTODO NUEVO: Recuperación completa
 */
attemptFullRecovery() {
  // Resetear posición y intentar parsear desde el inicio
  this.current = 0;
  this.errors = [];
  this.symbolTable.clear();
  
  try {
    const ast = this.programa();
    return { 
      ast, 
      errors: this.errors, 
      symbolTable: this.symbolTable,
      success: this.errors.length === 0
    };
  } catch (error) {
    return { 
      ast: this.createEmergencyAST(), 
      errors: this.errors, 
      symbolTable: this.symbolTable,
      success: false
    };
  }
}

  /**
   * PRODUCCIÓN: PROGRAMA MEJORADO
   * Maneja estructura de clase con recuperación de errores
   */
  programa() {
    try {
      this.expectKeyword('public');
      this.expectKeyword('class');
      const className = this.expect('ID');
      this.expectSymbol('{');
      const main = this.main();
      this.expectSymbol('}');

      return { 
        type: 'Programa', 
        className: className.value, 
        main 
      };
    } catch (error) {
      this.handleError(error, 'programa');
      return this.recoverProgram();
    }
  }

  /**
   * PRODUCCIÓN: MAIN MEJORADO
   * Maneja método main con recuperación robusta
   */
main() {
  try {
    this.expectKeyword('public');
    this.expectKeyword('static');
    this.expectKeyword('void');
    this.expectKeyword('main');
    this.expectSymbol('(');
    this.expectKeyword('String');
    this.expectSymbol('[');
    this.expectSymbol(']');
    
    // 🆕 CORRECCIÓN DEFINITIVA: Manejar 'args' correctamente
    const nextToken = this.peek();
    
    if (this.isAtEnd()) {
      throw this.createError('Se esperaba ID pero se alcanzó el final del archivo');
    }
    
    if (nextToken.type !== 'ID') {
      throw this.createError(`Se esperaba ID, se encontró: ${nextToken.value}`);
    }
    
    // Consumir el ID (debería ser 'args')
    const argsToken = this.advance();
    
    // Verificación opcional: si no es 'args', mostrar advertencia pero continuar
    if (argsToken.value !== 'args') {
      this.errors.push({
        type: 'SINTACTICO',
        message: `Se esperaba 'args' en la firma del método main, se encontró: '${argsToken.value}'`,
        line: argsToken.line,
        column: argsToken.column,
        severity: 'WARNING'
      });
    }
    
    this.expectSymbol(')');
    this.expectSymbol('{');
    const statements = this.sentencias();
    this.expectSymbol('}');

    return { type: 'Main', statements };
  } catch (error) {
    this.handleError(error, 'main');
    return this.recoverMain();
  }
}

  /**
   * PRODUCCIÓN: SENTENCIAS MEJORADA
   * Recuperación robusta de errores en secuencias de sentencias
   */
  sentencias() {
    const stmts = [];
    
    while (!this.check('SIMBOLO', '}') && !this.isAtEnd()) {
      try {
        const stmt = this.sentencia();
        if (stmt) stmts.push(stmt);
        
        // RESET del modo recuperación si conseguimos una sentencia válida
        this.recoveryMode = false;
      } catch (error) {
        this.handleError(error, 'sentencia');
        
        // Entrar en modo recuperación
        this.recoveryMode = true;
        this.synchronize();
        
        // Intentar extraer alguna estructura reconocible incluso con errores
        const recoveredStmt = this.tryRecoverStatement();
        if (recoveredStmt) {
          stmts.push(recoveredStmt);
        }
      }
    }
    
    return stmts;
  }

  /**
   * MÉTODO NUEVO: Intentar recuperar sentencia después de error
   */
  tryRecoverStatement() {
    const startPos = this.current;
    
    // Intentar reconocer diferentes tipos de sentencias incluso con errores
    try {
      // CORRECCIÓN: Verificar System.out.println PRIMERO
      if (this.check('PALABRA_RESERVADA', 'System')) {
        return this.printStmt();
      }
      // Intentar declaración
      if (this.checkType()) {
        return this.declaracion();
      }
      // Intentar asignación
      if (this.check('ID') && this.peekNext()?.value === '=') {
        return this.asignacion();
      }
    } catch (e) {
      // Si falla, restaurar posición y retornar null
      this.current = startPos;
    }
    
    return null;
  }

  /**
   * PRODUCCIÓN: SENTENCIA MEJORADA
   * Detección temprana de errores sintácticos comunes
   */
  sentencia() {
    // CORRECCIÓN: Verificar System.out.println PRIMERO antes de asignación
    if (this.check('PALABRA_RESERVADA', 'System')) {
      return this.printStmt();
    }

    // Detectar identificadores no esperados (como "sudfhoaefhfwo" después de ;)
    if (this.check('ID')) {
      const nextToken = this.peekNext();
      
      // CORRECCIÓN MEJORADA: Lógica más precisa para detectar identificadores no esperados
      if (nextToken && (nextToken.type === 'ID' && 
          !['++', '--', '='].includes(this.peekNext(2)?.value))) {
        throw this.createError(`Identificador no esperado: '${this.peek().value}'`);
      }
    }

    // Sentencia vacía
    if (this.match('SIMBOLO', ';')) {
      return { type: 'Empty' };
    }

    // Declaración de variable
    if (this.checkType()) {
      return this.declaracion();
    }

    // Estructura if
    if (this.check('PALABRA_RESERVADA', 'if')) {
      return this.ifStmt();
    }

    // Estructura for
    if (this.check('PALABRA_RESERVADA', 'for')) {
      return this.forStmt();
    }

    // Estructura while
    if (this.check('PALABRA_RESERVADA', 'while')) {
      return this.whileStmt();
    }

    // INCREMENTO/DECREMENTO
    if (this.check('ID') && (this.peekNext()?.value === '++' || this.peekNext()?.value === '--')) {
      return this.incremento();
    }

    // Asignación (última opción para IDs)
    if (this.check('ID')) {
      // VERIFICACIÓN ADICIONAL: Asegurar que sea realmente una asignación
      if (this.peekNext()?.value === '=') {
        return this.asignacion();
      } else {
        // Si no es asignación, podría ser un error
        throw this.createError(`Identificador no esperado: '${this.peek().value}'`);
      }
    }

    throw this.createError('Sentencia no reconocida');
  }

  /**
   * PRODUCCIÓN: DECLARACION MEJORADA
   */
  declaracion() {
    const tipo = this.advance();
    const vars = this.listaVars();
    
    if (!this.match('SIMBOLO', ';')) {
      this.errors.push({
        type: 'SINTACTICO',
        message: "Se esperaba ';' después de la declaración",
        line: this.peek().line,
        column: this.peek().column,
        severity: 'ERROR'
      });
    }

    // Registrar variables en tabla de símbolos
    vars.forEach(v => {
      this.symbolTable.set(v.id, { 
        type: tipo.value, 
        initialized: v.value !== null
      });
    });

    return { 
      type: 'Declaracion', 
      dataType: tipo.value, 
      variables: vars 
    };
  }

  /**
   * PRODUCCIÓN: LISTA_VARS
   */
  listaVars() {
    const vars = [this.varDecl()];
    
    while (this.match('SIMBOLO', ',')) {
      vars.push(this.varDecl());
    }
    
    return vars;
  }

  /**
   * PRODUCCIÓN: VAR_DECL
   */
  varDecl() {
    const idToken = this.expect('ID');
    let value = null;
    
    if (this.match('SIMBOLO', '=')) {
      value = this.expresion();
    }
    
    return { id: idToken.value, value };
  }

  /**
   * PRODUCCIÓN: ASIGNACION MEJORADA
   */
  asignacion() {
    const id = this.expect('ID');
    
    // Verificación de variable declarada (solo advertencia)
    if (!this.symbolTable.has(id.value)) {
      this.errors.push({
        type: 'SINTACTICO',
        message: `Variable no declarada: '${id.value}'`,
        line: id.line,
        column: id.column,
        severity: 'WARNING'
      });
    }
    
    this.expectSymbol('=');
    const value = this.expresion();
    this.expectSymbol(';');

    return { type: 'Asignacion', id: id.value, value };
  }

  /**
   * PRODUCCIÓN: INCREMENTO
   */
  incremento() {
    const id = this.expect('ID');
    const op = this.advance();
    
    if (op.value !== '++' && op.value !== '--') {
      throw this.createError("Se esperaba '++' o '--'");
    }
    
    this.expectSymbol(';');

    return { 
      type: 'Incremento', 
      id: id.value, 
      operator: op.value 
    };
  }

  /**
   * PRODUCCIÓN: IF
   */
  ifStmt() {
    this.expectKeyword('if');
    this.expectSymbol('(');
    const condition = this.expresion();
    this.expectSymbol(')');
    this.expectSymbol('{');
    const thenBlock = this.sentencias();
    this.expectSymbol('}');

    let elseBlock = null;
    if (this.match('PALABRA_RESERVADA', 'else')) {
      this.expectSymbol('{');
      elseBlock = this.sentencias();
      this.expectSymbol('}');
    }

    return { type: 'If', condition, thenBlock, elseBlock };
  }

  /**
   * PRODUCCIÓN: FOR
   */
  forStmt() {
    this.expectKeyword('for');
    this.expectSymbol('(');
    
    // FOR_INIT
    const tipo = this.advance();
    const id = this.expect('ID');
    this.expectSymbol('=');
    const init = this.expresion();
    
    this.symbolTable.set(id.value, { type: tipo.value, initialized: true });
    
    this.expectSymbol(';');
    const condition = this.expresion();
    this.expectSymbol(';');
    
    // FOR_UPDATE
    const updateId = this.expect('ID');
    const updateOp = this.advance();
    
    if (updateOp.value !== '++' && updateOp.value !== '--') {
      throw this.createError("Se esperaba '++' o '--' en actualización del for");
    }
    
    this.expectSymbol(')');
    this.expectSymbol('{');
    const body = this.sentencias();
    this.expectSymbol('}');

    return {
      type: 'For',
      init: { type: tipo.value, id: id.value, value: init },
      condition,
      update: { id: updateId.value, op: updateOp.value },
      body
    };
  }

  /**
   * PRODUCCIÓN: WHILE
   */
  whileStmt() {
    this.expectKeyword('while');
    this.expectSymbol('(');
    const condition = this.expresion();
    this.expectSymbol(')');
    this.expectSymbol('{');
    const body = this.sentencias();
    this.expectSymbol('}');

    return { type: 'While', condition, body };
  }

  /**
   * PRODUCCIÓN: PRINT
   */
  printStmt() {
    this.expectKeyword('System');
    this.expectSymbol('.');
    this.expectKeyword('out');
    this.expectSymbol('.');
    this.expectKeyword('println');
    this.expectSymbol('(');
    const expr = this.expresion();
    this.expectSymbol(')');
    this.expectSymbol(';');

    return { type: 'Print', expression: expr };
  }

  /**
   * PRODUCCIÓN: EXPRESION
   */
  expresion() {
    let expr = this.termino();

    while (this.matchAny(['==', '!=', '>', '<', '>=', '<='])) {
      const op = this.previous();
      const right = this.termino();
      expr = { type: 'BinaryOp', operator: op.value, left: expr, right };
    }

    return expr;
  }

  /**
   * PRODUCCIÓN: TERMINO
   */
  termino() {
    let expr = this.factor();

    while (this.matchAny(['+', '-'])) {
      const op = this.previous();
      const right = this.factor();
      expr = { type: 'BinaryOp', operator: op.value, left: expr, right };
    }

    return expr;
  }

  /**
   * PRODUCCIÓN: FACTOR
   */
  factor() {
    let expr = this.primario();

    while (this.matchAny(['*', '/'])) {
      const op = this.previous();
      const right = this.primario();
      expr = { type: 'BinaryOp', operator: op.value, left: expr, right };
    }

    return expr;
  }

  /**
   * PRODUCCIÓN: PRIMARIO
   */
  primario() {
    // Números enteros
    if (this.check('ENTERO')) {
      return { type: 'Literal', value: this.advance().value, dataType: 'int' };
    }

    // Números decimales
    if (this.check('DECIMAL')) {
      return { type: 'Literal', value: this.advance().value, dataType: 'double' };
    }

    // Cadenas
    if (this.check('CADENA')) {
      return { type: 'String', value: this.advance().value };
    }

    // Caracteres
    if (this.check('CARACTER')) {
      return { type: 'Char', value: this.advance().value };
    }

    // Booleanos
    if (this.check('PALABRA_RESERVADA', 'true') || 
        this.check('PALABRA_RESERVADA', 'false')) {
      return { type: 'Boolean', value: this.advance().value };
    }

    // Variables
    if (this.check('ID')) {
      const id = this.advance();
      
      // Solo advertencia para variables no declaradas
      if (!this.symbolTable.has(id.value)) {
        this.errors.push({
          type: 'SINTACTICO',
          message: `Variable no declarada: '${id.value}'`,
          line: id.line,
          column: id.column,
          severity: 'WARNING'
        });
      }
      
      return { type: 'Variable', name: id.value };
    }

    // Expresiones entre paréntesis
    if (this.match('SIMBOLO', '(')) {
      const expr = this.expresion();
      this.expectSymbol(')');
      return expr;
    }

    throw this.createError('Se esperaba una expresión');
  }

  /**
   * MÉTODOS AUXILIARES MEJORADOS
   */

  checkType() {
    return this.check('PALABRA_RESERVADA', 'int') ||
           this.check('PALABRA_RESERVADA', 'double') ||
           this.check('PALABRA_RESERVADA', 'char') ||
           this.check('PALABRA_RESERVADA', 'String') ||
           this.check('PALABRA_RESERVADA', 'boolean');
  }

  expect(type, value = null) {
    if (this.isAtEnd()) {
      throw this.createError(`Se esperaba ${value || type} pero se alcanzó el final del archivo`);
    }
    
    const token = this.peek();
    if (token.type !== type) {
      throw this.createError(`Se esperaba ${value || type}, se encontró: ${token.value}`);
    }
    
    if (value !== null && token.value !== value) {
      throw this.createError(`Se esperaba '${value}', se encontró: '${token.value}'`);
    }
    
    return this.advance();
  }

  expectKeyword(keyword) {
    return this.expect('PALABRA_RESERVADA', keyword);
  }

  expectSymbol(symbol) {
    return this.expect('SIMBOLO', symbol);
  }

  check(type, value = null) {
    if (this.isAtEnd()) return false;
    if (this.peek().type !== type) return false;
    if (value !== null && this.peek().value !== value) return false;
    return true;
  }

  match(type, value = null) {
    if (this.check(type, value)) {
      this.advance();
      return true;
    }
    return false;
  }

  matchAny(values) {
    for (const val of values) {
      if (this.check('SIMBOLO', val)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  advance() {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  peek(offset = 0) {
    const pos = this.current + offset;
    return this.tokens[pos] || { type: 'EOF', value: 'EOF', line: -1, column: -1 };
  }

  peekNext() {
    return this.peek(1);
  }

  previous() {
    return this.tokens[this.current - 1];
  }

  isAtEnd() {
    return this.current >= this.tokens.length;
  }

  /**
   * MANEJO DE ERRORES Y RECUPERACIÓN MEJORADO
   */

  createError(message) {
    const token = this.peek();
    return {
      type: 'SINTACTICO',
      message,
      line: token.line,
      column: token.column,
      lexeme: token.value,
      severity: 'ERROR'
    };
  }

  handleError(error, context) {
    if (!error.type) {
      error = {
        type: 'SINTACTICO',
        message: error.message || 'Error desconocido',
        line: this.peek().line,
        column: this.peek().column,
        lexeme: this.peek().value,
        severity: 'ERROR'
      };
    }
    
    // Agregar contexto y información de recuperación
    const enhancedError = {
      ...error,
      context: context,
      recoveryMode: this.recoveryMode,
      currentToken: this.peek().value
    };
    
    this.errors.push(enhancedError);
    
    console.warn(`Error ${context}:`, enhancedError);
  }

  /**
   * MÉTODO MEJORADO: SINCRONIZACIÓN AVANZADA
   */
synchronize() {
  const startPos = this.current;
  let advanced = false;
  
  // 🆕 CORRECCIÓN CRÍTICA: Avanzar al menos una vez para evitar bucle infinito
  if (!this.isAtEnd()) {
    this.advance();
    advanced = true;
  }
  
  // Avanzar hasta encontrar token de sincronización
  while (!this.isAtEnd()) {
    // Puntos de sincronización comunes
    if (this.previous()?.value === ';') {
      return;
    }
    
    const currentToken = this.peek();
    const syncTokens = [';', '}', 'if', 'for', 'while', 'int', 'double', 'char', 'String', 'boolean', 'System', 'public', 'class'];
    
    if (syncTokens.includes(currentToken?.value)) {
      return;
    }

    // 🆕 VERIFICACIÓN: Asegurar que estamos avanzando
    const previousPos = this.current;
    this.advance();
    advanced = true;
    
    // 🆕 SEGURIDAD: Si no avanzamos, salir para evitar bucle infinito
    if (this.current === previousPos) {
      console.warn('⚠️  Synchronize no está avanzando, forzando salida');
      return;
    }
  }
  
  // 🆕 CORRECCIÓN: Si llegamos al final, asegurarnos de que avanzamos al menos una vez
  if (!advanced && !this.isAtEnd()) {
    this.advance();
  }
}

  recoverProgram() {
    // Buscar método main de forma robusta
    for (let i = 0; i < this.tokens.length - 4; i++) {
      if (this.tokens[i].value === 'public' &&
          this.tokens[i + 1].value === 'static' &&
          this.tokens[i + 2].value === 'void' &&
          this.tokens[i + 3].value === 'main') {
        
        this.current = i;
        try {
          const main = this.main();
          return {
            type: 'Programa',
            className: 'RecoveredClass',
            main
          };
        } catch (e) {
          // Continuar buscando
        }
      }
    }
    
    return {
      type: 'Programa',
      className: 'DefaultClass',
      main: { type: 'Main', statements: [] }
    };
  }

recoverMain() {
  let statements = [];
  
  // Buscar llave de apertura de main
  while (!this.isAtEnd() && !this.check('SIMBOLO', '{')) {
    this.advance();
  }
  
  if (this.check('SIMBOLO', '{')) {
    this.advance(); // Consumir '{'
    statements = this.sentencias();
    
    // Buscar llave de cierre
    if (this.check('SIMBOLO', '}')) {
      this.advance(); // Consumir '}'
    }
  }
  
  return { type: 'Main', statements };
}

  createEmergencyAST() {
    const statements = [];
    
    // Intentar extraer cualquier sentencia válida del código completo
    for (let i = 0; i < this.tokens.length; i++) {
      this.current = i;
      try {
        if (this.checkType()) {
          statements.push(this.declaracion());
        } else if (this.check('PALABRA_RESERVADA', 'System')) {
          statements.push(this.printStmt());
        } else if (this.check('ID') && this.peekNext()?.value === '=') {
          statements.push(this.asignacion());
        }
      } catch (e) {
        // Continuar con siguiente token
      }
    }
    
    return {
      type: 'Programa',
      className: 'EmergencyClass',
      main: { type: 'Main', statements }
    };
  }
}