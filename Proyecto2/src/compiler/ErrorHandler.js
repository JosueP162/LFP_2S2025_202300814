/**
 * MANEJADOR DE ERRORES
 * 
 * Centraliza la gestión de errores léxicos y sintácticos
 * Clasifica errores por severidad y proporciona mensajes útiles
 */

export class ErrorHandler {
  constructor() {
    this.errors = [];
    this.warnings = [];
  }

  /**
   * Agrega un error al sistema
   */
  addError(error) {
    const normalizedError = this.normalizeError(error);
    
    if (normalizedError.severity === 'WARNING') {
      this.warnings.push(normalizedError);
    } else {
      this.errors.push(normalizedError);
    }
  }

  /**
   * Normaliza la estructura del error
   */
  normalizeError(error) {
    return {
      type: error.type || 'DESCONOCIDO',
      message: error.message || 'Error sin descripción',
      line: error.line || 'N/A',
      column: error.column || 'N/A',
      lexeme: error.lexeme || '',
      severity: error.severity || 'ERROR',
      context: error.context || ''
    };
  }

  /**
   * Obtiene todos los errores
   */
  getErrors() {
    return this.errors;
  }

  /**
   * Obtiene todas las advertencias
   */
  getWarnings() {
    return this.warnings;
  }

  /**
   * Obtiene errores y advertencias combinados
   */
  getAllIssues() {
    return [...this.errors, ...this.warnings];
  }

  /**
   * Verifica si hay errores
   */
  hasErrors() {
    return this.errors.length > 0;
  }

  /**
   * Verifica si hay advertencias
   */
  hasWarnings() {
    return this.warnings.length > 0;
  }

  /**
   * Limpia todos los errores y advertencias
   */
  clear() {
    this.errors = [];
    this.warnings = [];
  }

  /**
   * Obtiene resumen de errores
   */
  getSummary() {
    return {
      totalErrors: this.errors.length,
      totalWarnings: this.warnings.length,
      lexicalErrors: this.errors.filter(e => e.type === 'LEXICO').length,
      syntaxErrors: this.errors.filter(e => e.type === 'SINTACTICO').length,
      hasIssues: this.errors.length > 0 || this.warnings.length > 0
    };
  }

  /**
   * Formatea errores para visualización
   */
  formatErrors() {
    return this.errors.map((error, index) => ({
      id: index + 1,
      ...error
    }));
  }

  /**
   * Agrupa errores por tipo
   */
  groupByType() {
    const grouped = {
      LEXICO: [],
      SINTACTICO: [],
      SEMANTICO: [],
      OTRO: []
    };

    this.errors.forEach(error => {
      const type = error.type in grouped ? error.type : 'OTRO';
      grouped[type].push(error);
    });

    return grouped;
  }
}
