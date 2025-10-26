import React, { useState, useRef } from 'react';
import { Lexer } from './compiler/Lexer';
import { Parser } from './compiler/Parser';
import { Translator } from './compiler/Translator';
import { ReportGenerator } from './compiler/ReportGenerator';
import { ErrorHandler } from './compiler/ErrorHandler';

const JavaBridge = () => {
  const [javaCode, setJavaCode] = useState(`public class MiPrograma {
    public static void main(String[] args) {
        int x = 10;
        String mensaje = "Hola Mundo";
        System.out.println(mensaje);
        
        for(int i = 0; i < 5; i++) {
            System.out.println("Iteración: " + i);
        }
    }
}`);
  
  const [pythonCode, setPythonCode] = useState('');
  const [tokens, setTokens] = useState([]);
  const [errors, setErrors] = useState([]);
  const [activeTab, setActiveTab] = useState('editor');
  const fileInputRef = useRef(null);

  // Analizar código Java - VERSIÓN FLEXIBLE
  const analyzeCode = () => {
    // Limpiar estados previos
    setErrors([]);
    setTokens([]);
    
    const lexer = new Lexer(javaCode);
    const lexerResult = lexer.tokenize();
    
    setTokens(lexerResult.tokens);
    
    // 🆕 CORRECCIÓN: Siempre agregar errores léxicos, pero continuar
    if (lexerResult.errors.length > 0) {
      setErrors(prev => [...prev, ...lexerResult.errors]);
    }

    // 🆕 CORRECCIÓN: Intentar parsing incluso con errores léxicos
    let parserResult = { success: false, ast: null, errors: [], symbolTable: new Map() };
    
    try {
      const parser = new Parser(lexerResult.tokens);
      parserResult = parser.parse();
      
      // Agregar errores sintácticos si existen
      if (parserResult.errors.length > 0) {
        setErrors(prev => [...prev, ...parserResult.errors]);
      }
    } catch (error) {
      console.error('Error en parsing:', error);
      setErrors(prev => [...prev, {
        type: 'SINTACTICO',
        message: `Error crítico en parser: ${error.message}`,
        line: 1,
        column: 1,
        severity: 'ERROR'
      }]);
    }

    // 🆕 CORRECCIÓN: SIEMPRE intentar traducción, incluso con errores
    try {
      const translator = new Translator(
        parserResult.ast, 
        parserResult.symbolTable, 
        [...lexerResult.errors, ...parserResult.errors]
      );
      
      const pythonOutput = translator.translate();
      setPythonCode(pythonOutput);
      
    } catch (error) {
      console.error('Error en traducción:', error);
      // 🆕 GENERAR CÓDIGO PYTHON DE EMERGENCIA
      const emergencyPython = `# ==========================================
# TRADUCCIÓN CON ERRORES - JavaBridge
# ==========================================
# Se encontraron errores durante el análisis
# pero se generó código Python de recuperación

def main():
    print("⚠️  Ejecutando traducción con errores")
    # Código traducido parcialmente
    ${extractPartialCode(javaCode)}

if __name__ == "__main__":
    main()`;
      
      setPythonCode(emergencyPython);
      setErrors(prev => [...prev, {
        type: 'TRADUCCION',
        message: `Error en traducción: ${error.message}`,
        line: 1,
        column: 1,
        severity: 'WARNING'
      }]);
    }
  };

  // 🆕 FUNCIÓN AUXILIAR: Extraer código parcial incluso con errores
  const extractPartialCode = (code) => {
    const lines = code.split('\n');
    let pythonLines = [];
    
    lines.forEach(line => {
      // Intentar detectar declaraciones simples
      if (line.includes('int ') || line.includes('String ') || line.includes('double ')) {
        const varMatch = line.match(/(int|String|double)\s+(\w+)\s*=\s*(.+);/);
        if (varMatch) {
          pythonLines.push(`    ${varMatch[2]} = ${varMatch[3]}`);
        }
      }
      // Intentar detectar prints
      if (line.includes('System.out.println')) {
        const printMatch = line.match(/System\.out\.println\((.+)\);/);
        if (printMatch) {
          pythonLines.push(`    print(${printMatch[1]})`);
        }
      }
    });
    
    return pythonLines.join('\n    ') || '    pass';
  };

  // Generar reporte de tokens
  const generateTokenReport = () => {
    const reportGenerator = new ReportGenerator();
    const html = reportGenerator.generateTokenReport(tokens);
    const newWindow = window.open();
    newWindow.document.write(html);
  };

  // Generar reporte de errores
  const generateErrorReport = () => {
    const reportGenerator = new ReportGenerator();
    const html = reportGenerator.generateErrorReport(errors);
    const newWindow = window.open();
    newWindow.document.write(html);
  };

  // Cargar archivo Java
  const loadJavaFile = (event) => {
    const file = event.target.files[0];
    if (file && file.name.endsWith('.java')) {
      const reader = new FileReader();
      reader.onload = (e) => setJavaCode(e.target.result);
      reader.readAsText(file);
    }
  };

  // Descargar código Python
  const downloadPython = () => {
    if (!pythonCode) return;
    
    const blob = new Blob([pythonCode], { type: 'text/python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'traduccion.py';
    a.click();
    URL.revokeObjectURL(url);
  };

  // 🆕 FUNCIÓN: Limpiar todo
  const clearAll = () => {
    setJavaCode('');
    setPythonCode('');
    setTokens([]);
    setErrors([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          🚀 JavaBridge - TRADUCTOR FLEXIBLE
        </h1>
        <p className="text-lg text-gray-600">
          Traduce Java → Python incluso con errores - AFD Manual
        </p>
      </div>

      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden">
        {/* Menú Superior */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4">
          <div className="flex flex-wrap gap-4 justify-between items-center">
            <div className="flex flex-wrap gap-2">
              {/* Menú Archivo */}
              <div className="relative group">
                <button className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition">
                  📁 Archivo
                </button>
                <div className="absolute hidden group-hover:block bg-white shadow-lg rounded-lg mt-1 z-10 min-w-48">
                  <button 
                    onClick={clearAll}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
                  >
                    Nuevo
                  </button>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
                  >
                    Abrir .java
                  </button>
                  <button 
                    onClick={downloadPython}
                    disabled={!pythonCode}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 disabled:opacity-50"
                  >
                    Guardar Python como
                  </button>
                </div>
              </div>

              {/* Menú Traducir */}
              <div className="relative group">
                <button className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition">
                  🔄 Traducir
                </button>
                <div className="absolute hidden group-hover:block bg-white shadow-lg rounded-lg mt-1 z-10 min-w-48">
                  <button 
                    onClick={analyzeCode}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
                  >
                    🚀 Generar Traducción
                  </button>
                  <button 
                    onClick={generateTokenReport}
                    disabled={tokens.length === 0}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 disabled:opacity-50"
                  >
                    📋 Ver Tokens
                  </button>
                </div>
              </div>

              {/* Menú Reportes */}
              <div className="relative group">
                <button className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition">
                  📊 Reportes
                </button>
                <div className="absolute hidden group-hover:block bg-white shadow-lg rounded-lg mt-1 z-10 min-w-48">
                  <button 
                    onClick={generateTokenReport}
                    disabled={tokens.length === 0}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 disabled:opacity-50"
                  >
                    📄 Reporte de Tokens
                  </button>
                  <button 
                    onClick={generateErrorReport}
                    disabled={errors.length === 0}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 disabled:opacity-50"
                  >
                    ⚠️ Reporte de Errores
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={analyzeCode}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-semibold"
              >
                🚀 Traducir (Flexible)
              </button>
            </div>
          </div>
        </div>

        {/* Input oculto para archivos */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={loadJavaFile}
          accept=".java"
          className="hidden"
        />

        {/* Contenido Principal */}
        <div className="p-6">
          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{tokens.length}</div>
              <div className="text-sm text-blue-800">Tokens</div>
            </div>
            <div className="bg-red-50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-600">
                {errors.filter(e => e.severity === 'ERROR').length}
              </div>
              <div className="text-sm text-red-800">Errores</div>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {errors.filter(e => e.severity === 'WARNING').length}
              </div>
              <div className="text-sm text-yellow-800">Advertencias</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">
                {pythonCode ? '✅' : '❌'}
              </div>
              <div className="text-sm text-green-800">Python Listo</div>
            </div>
          </div>

          {/* Pestañas */}
          <div className="flex border-b mb-6">
            <button
              onClick={() => setActiveTab('editor')}
              className={`px-6 py-3 font-medium transition ${
                activeTab === 'editor'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              📝 Editor Java
            </button>
            <button
              onClick={() => setActiveTab('python')}
              className={`px-6 py-3 font-medium transition ${
                activeTab === 'python'
                  ? 'border-b-2 border-green-500 text-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              🐍 Python Generado
            </button>
            <button
              onClick={() => setActiveTab('tokens')}
              className={`px-6 py-3 font-medium transition ${
                activeTab === 'tokens'
                  ? 'border-b-2 border-purple-500 text-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              🔍 Tokens ({tokens.length})
            </button>
            <button
              onClick={() => setActiveTab('errors')}
              className={`px-6 py-3 font-medium transition ${
                activeTab === 'errors'
                  ? 'border-b-2 border-red-500 text-red-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              ⚠️ Errores ({errors.length})
            </button>
          </div>

          {/* Contenido de pestañas */}
          {activeTab === 'editor' && (
            <div className="space-y-4">
              <textarea
                value={javaCode}
                onChange={(e) => setJavaCode(e.target.value)}
                className="w-full h-96 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Escribe tu código Java aquí..."
                spellCheck="false"
              />
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  {javaCode.length} caracteres • {javaCode.split('\n').length} líneas
                </div>
                <button 
                  onClick={analyzeCode}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                  🚀 Analizar y Traducir (Flexible)
                </button>
              </div>
            </div>
          )}

          {activeTab === 'python' && (
            <div className="space-y-4">
              <div className="bg-gray-900 rounded-lg p-1">
                <pre className="w-full h-96 p-4 text-green-400 rounded-lg font-mono text-sm overflow-auto">
                  {pythonCode || '# Ejecuta "Analizar y Traducir" para generar código Python\n# El sistema es FLEXIBLE y traduce incluso con errores'}
                </pre>
              </div>
              {pythonCode && (
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    {pythonCode.split('\n').length} líneas de Python generadas
                    {errors.length > 0 && ` (con ${errors.length} errores/advertencias)`}
                  </div>
                  <button 
                    onClick={downloadPython}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
                  >
                    📥 Descargar .py
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ... (el resto del código de tokens y errores permanece igual) */}
          {activeTab === 'tokens' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Tokens Reconocidos: {tokens.length}</h3>
                <button 
                  onClick={generateTokenReport}
                  disabled={tokens.length === 0}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
                >
                  📄 Generar Reporte HTML
                </button>
              </div>
              <div className="h-96 overflow-auto border rounded-lg">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left">#</th>
                      <th className="px-4 py-2 text-left">Tipo</th>
                      <th className="px-4 py-2 text-left">Lexema</th>
                      <th className="px-4 py-2 text-left">Línea</th>
                      <th className="px-4 py-2 text-left">Columna</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tokens.map((token, index) => (
                      <tr key={index} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-2">{index + 1}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            token.type === 'PALABRA_RESERVADA' ? 'bg-blue-100 text-blue-800' :
                            token.type === 'ID' ? 'bg-yellow-100 text-yellow-800' :
                            token.type === 'ENTERO' ? 'bg-green-100 text-green-800' :
                            token.type === 'CADENA' ? 'bg-pink-100 text-pink-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {token.type}
                          </span>
                        </td>
                        <td className="px-4 py-2 font-mono">{token.value}</td>
                        <td className="px-4 py-2">{token.line}</td>
                        <td className="px-4 py-2">{token.column}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'errors' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  Problemas Encontrados: {errors.length}
                  {errors.length > 0 && ` (${errors.filter(e => e.severity === 'ERROR').length} errores, ${errors.filter(e => e.severity === 'WARNING').length} advertencias)`}
                </h3>
                <button 
                  onClick={generateErrorReport}
                  disabled={errors.length === 0}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                >
                  📄 Generar Reporte HTML
                </button>
              </div>
              {errors.length === 0 ? (
                <div className="text-center py-12 text-green-600">
                  <div className="text-6xl mb-4">✅</div>
                  <div className="text-xl font-semibold">No se encontraron problemas</div>
                  <div className="text-gray-500">El análisis se completó exitosamente</div>
                </div>
              ) : (
                <div className="h-96 overflow-auto border rounded-lg">
                  <table className="min-w-full">
                    <thead className="bg-red-50">
                      <tr>
                        <th className="px-4 py-2 text-left">#</th>
                        <th className="px-4 py-2 text-left">Tipo</th>
                        <th className="px-4 py-2 text-left">Severidad</th>
                        <th className="px-4 py-2 text-left">Descripción</th>
                        <th className="px-4 py-2 text-left">Línea</th>
                        <th className="px-4 py-2 text-left">Columna</th>
                      </tr>
                    </thead>
                    <tbody>
                      {errors.map((error, index) => (
                        <tr key={index} className={`border-t hover:bg-gray-50 ${
                          error.severity === 'ERROR' ? 'bg-red-50' : 'bg-yellow-50'
                        }`}>
                          <td className="px-4 py-2">{index + 1}</td>
                          <td className="px-4 py-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              error.type === 'LEXICO' ? 'bg-orange-100 text-orange-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {error.type}
                            </span>
                          </td>
                          <td className="px-4 py-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              error.severity === 'ERROR' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {error.severity}
                            </span>
                          </td>
                          <td className="px-4 py-2">{error.message}</td>
                          <td className="px-4 py-2">{error.line}</td>
                          <td className="px-4 py-2">{error.column}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-100 p-4 text-center text-gray-600 text-sm">
          <p>JavaBridge - Traductor FLEXIBLE Java a Python • Universidad San Carlos de Guatemala</p>
          <p>Lenguajes Formales y de Programación • Traduce incluso con errores</p>
        </div>
      </div>
    </div>
  );
};

export default JavaBridge;