/**
 * GENERADOR DE REPORTES HTML
 * 
 * Genera reportes visuales en HTML para:
 * - Tokens reconocidos
 * - Errores léxicos
 * - Errores sintácticos
 * - Tabla de símbolos
 */

export class ReportGenerator {
  
  /**
   * Genera reporte completo de tokens
   */
  generateTokenReport(tokens) {
    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reporte de Tokens - JavaBridge</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            min-height: 100vh;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }
        
        .header p {
            font-size: 1.1em;
            opacity: 0.9;
        }
        
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            padding: 30px;
            background: #f8fafc;
            border-bottom: 2px solid #e2e8f0;
        }
        
        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            text-align: center;
            border-left: 4px solid #2563eb;
        }
        
        .stat-card h3 {
            color: #64748b;
            font-size: 0.9em;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .stat-card .number {
            font-size: 2.5em;
            font-weight: bold;
            color: #2563eb;
        }
        
        .content {
            padding: 30px;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        thead {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
        }
        
        th {
            padding: 15px;
            text-align: left;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 0.85em;
            letter-spacing: 0.5px;
        }
        
        td {
            padding: 12px 15px;
            border-bottom: 1px solid #e2e8f0;
        }
        
        tbody tr:hover {
            background: #f0f9ff;
            transition: background 0.2s ease;
        }
        
        tbody tr:last-child td {
            border-bottom: none;
        }
        
        .token-type {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.85em;
            font-weight: 600;
        }
        
        .token-PALABRA_RESERVADA { background: #dbeafe; color: #1e40af; }
        .token-ID { background: #fef3c7; color: #92400e; }
        .token-ENTERO { background: #d1fae5; color: #065f46; }
        .token-DECIMAL { background: #d1fae5; color: #065f46; }
        .token-CADENA { background: #fce7f3; color: #9f1239; }
        .token-CARACTER { background: #fce7f3; color: #9f1239; }
        .token-SIMBOLO { background: #e0e7ff; color: #3730a3; }
        .token-COMENTARIO { background: #f3f4f6; color: #6b7280; }
        
        .lexeme {
            font-family: 'Courier New', monospace;
            background: #f1f5f9;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.9em;
        }
        
        .footer {
            text-align: center;
            padding: 20px;
            color: #64748b;
            font-size: 0.9em;
            background: #f8fafc;
            border-top: 2px solid #e2e8f0;
        }
        
        @media print {
            body { background: white; padding: 0; }
            .container { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📋 Reporte de Tokens</h1>
            <p>Análisis Léxico Completo - JavaBridge</p>
        </div>
        
        <div class="stats">
            <div class="stat-card">
                <h3>Total Tokens</h3>
                <div class="number">${tokens.length}</div>
            </div>
            <div class="stat-card">
                <h3>Palabras Reservadas</h3>
                <div class="number">${tokens.filter(t => t.type === 'PALABRA_RESERVADA').length}</div>
            </div>
            <div class="stat-card">
                <h3>Identificadores</h3>
                <div class="number">${tokens.filter(t => t.type === 'ID').length}</div>
            </div>
            <div class="stat-card">
                <h3>Literales</h3>
                <div class="number">${tokens.filter(t => ['ENTERO', 'DECIMAL', 'CADENA', 'CARACTER'].includes(t.type)).length}</div>
            </div>
        </div>
        
        <div class="content">
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Tipo</th>
                        <th>Lexema</th>
                        <th>Línea</th>
                        <th>Columna</th>
                    </tr>
                </thead>
                <tbody>
                    ${tokens.map((token, index) => `
                    <tr>
                        <td><strong>${index + 1}</strong></td>
                        <td><span class="token-type token-${token.type}">${token.type}</span></td>
                        <td><span class="lexeme">${this.escapeHtml(token.value)}</span></td>
                        <td>${token.line}</td>
                        <td>${token.column}</td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        
        <div class="footer">
            <p>Generado por JavaBridge - Traductor Java a Python</p>
            <p>Universidad San Carlos de Guatemala - Lenguajes Formales y de Programación</p>
        </div>
    </div>
</body>
</html>`;
    
    return html;
  }

  /**
   * Genera reporte de errores
   */
  generateErrorReport(errors) {
    const lexicalErrors = errors.filter(e => e.type === 'LEXICO');
    const syntaxErrors = errors.filter(e => e.type === 'SINTACTICO');
    
    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reporte de Errores - JavaBridge</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            padding: 20px;
            min-height: 100vh;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }
        
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            padding: 30px;
            background: #fef2f2;
            border-bottom: 2px solid #fecaca;
        }
        
        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            text-align: center;
        }
        
        .stat-card.error { border-left: 4px solid #dc2626; }
        .stat-card.warning { border-left: 4px solid #f59e0b; }
        
        .stat-card h3 {
            color: #64748b;
            font-size: 0.9em;
            margin-bottom: 10px;
            text-transform: uppercase;
        }
        
        .stat-card .number {
            font-size: 2.5em;
            font-weight: bold;
        }
        
        .stat-card.error .number { color: #dc2626; }
        .stat-card.warning .number { color: #f59e0b; }
        
        .content {
            padding: 30px;
        }
        
        .section {
            margin-bottom: 40px;
        }
        
        .section h2 {
            color: #1f2937;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 3px solid #e5e7eb;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            margin-bottom: 20px;
        }
        
        thead {
            background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
            color: white;
        }
        
        th {
            padding: 15px;
            text-align: left;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 0.85em;
        }
        
        td {
            padding: 12px 15px;
            border-bottom: 1px solid #fee2e2;
        }
        
        tbody tr:hover {
            background: #fef2f2;
        }
        
        .error-type {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.85em;
            font-weight: 600;
        }
        
        .error-type.LEXICO {
            background: #fed7aa;
            color: #9a3412;
        }
        
        .error-type.SINTACTICO {
            background: #fecaca;
            color: #991b1b;
        }
        
        .message {
            color: #374151;
            font-weight: 500;
        }
        
        .location {
            color: #6b7280;
            font-size: 0.9em;
        }
        
        .no-errors {
            text-align: center;
            padding: 40px;
            color: #10b981;
            font-size: 1.2em;
        }
        
        .footer {
            text-align: center;
            padding: 20px;
            color: #64748b;
            font-size: 0.9em;
            background: #fef2f2;
            border-top: 2px solid #fecaca;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>⚠️ Reporte de Errores</h1>
            <p>Análisis de Errores Léxicos y Sintácticos</p>
        </div>
        
        <div class="stats">
            <div class="stat-card error">
                <h3>Total Errores</h3>
                <div class="number">${errors.length}</div>
            </div>
            <div class="stat-card error">
                <h3>Errores Léxicos</h3>
                <div class="number">${lexicalErrors.length}</div>
            </div>
            <div class="stat-card error">
                <h3>Errores Sintácticos</h3>
                <div class="number">${syntaxErrors.length}</div>
            </div>
        </div>
        
        <div class="content">
            ${errors.length === 0 ? `
                <div class="no-errors">
                    ✅ No se encontraron errores en el análisis
                </div>
            ` : `
                ${lexicalErrors.length > 0 ? `
                <div class="section">
                    <h2>🔴 Errores Léxicos (${lexicalErrors.length})</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Tipo</th>
                                <th>Descripción</th>
                                <th>Línea</th>
                                <th>Columna</th>
                                <th>Lexema</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${lexicalErrors.map((error, i) => `
                            <tr>
                                <td><strong>${i + 1}</strong></td>
                                <td><span class="error-type ${error.type}">${error.type}</span></td>
                                <td class="message">${this.escapeHtml(error.message)}</td>
                                <td>${error.line}</td>
                                <td>${error.column}</td>
                                <td><code>${this.escapeHtml(error.lexeme || '')}</code></td>
                            </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                ` : ''}
                
                ${syntaxErrors.length > 0 ? `
                <div class="section">
                    <h2>🔴 Errores Sintácticos (${syntaxErrors.length})</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Tipo</th>
                                <th>Descripción</th>
                                <th>Línea</th>
                                <th>Columna</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${syntaxErrors.map((error, i) => `
                            <tr>
                                <td><strong>${i + 1}</strong></td>
                                <td><span class="error-type ${error.type}">${error.type}</span></td>
                                <td class="message">${this.escapeHtml(error.message)}</td>
                                <td>${error.line}</td>
                                <td>${error.column}</td>
                            </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                ` : ''}
            `}
        </div>
        
        <div class="footer">
            <p>Generado por JavaBridge - Traductor Java a Python</p>
            <p>Universidad San Carlos de Guatemala</p>
        </div>
    </div>
</body>
</html>`;
    
    return html;
  }

  /**
   * Genera reporte de tabla de símbolos
   */
  generateSymbolTableReport(symbolTable) {
    const symbols = Array.from(symbolTable.entries()).map(([name, info]) => ({
      name,
      ...info
    }));

    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tabla de Símbolos - JavaBridge</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
            padding: 20px;
        }
        .container {
            max-width: 1000px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 { font-size: 2.5em; margin-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin: 30px; }
        thead { background: #8b5cf6; color: white; }
        th { padding: 15px; text-align: left; }
        td { padding: 12px 15px; border-bottom: 1px solid #e5e7eb; }
        tbody tr:hover { background: #f5f3ff; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📚 Tabla de Símbolos</h1>
            <p>Variables declaradas en el programa</p>
        </div>
        <table>
            <thead>
                <tr><th>Variable</th><th>Tipo</th><th>Inicializada</th></tr>
            </thead>
            <tbody>
                ${symbols.map(s => `
                <tr>
                    <td><strong>${s.name}</strong></td>
                    <td>${s.type}</td>
                    <td>${s.initialized ? '✅ Sí' : '❌ No'}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
</body>
</html>`;
    
    return html;
  }

  /**
   * Escapa caracteres HTML
   */
  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, m => map[m]);
  }
}