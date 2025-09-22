if (typeof global === 'undefined') {
    window.global = window;
}


// Importar módulos del analizador
import { TourneyScanner } from '../src/core/TourneyScanner.js';
import { TourneyParser } from '../src/core/TourneyParser.js';
import { HTMLReportGenerator } from '../src/generators/HTMLReportGenerator.js';
import { GraphvizGenerator } from '../src/Generators/GraphvizGenerator.js';

class TourneyInterface {
    constructor() {
        this.tournament = null;
        this.tokens = [];
        this.errors = [];
        this.currentTab = 'results';
        
        this.initializeElements();
        this.initializeEventListeners();
        this.initializeTabs();
        
        // Mostrar mensaje inicial
        this.showMessage('info', 'Carga un archivo o escribe código para comenzar el análisis');
    }

    initializeElements() {
        // Elementos de entrada
        this.codeInput = document.getElementById('code-input');
        this.fileInput = document.getElementById('file-input');
        this.analyzeBtn = document.getElementById('analyze-btn');
        this.clearBtn = document.getElementById('clear-btn');
        this.exampleBtn = document.getElementById('example-btn');

        // Elementos de estadísticas
        this.analysisStats = document.getElementById('analysis-stats');
        this.tokensCount = document.getElementById('tokens-count');
        this.errorsCount = document.getElementById('errors-count');
        this.teamsCount = document.getElementById('teams-count');
        this.matchesCount = document.getElementById('matches-count');

        // Elementos de salida
        this.analysisResult = document.getElementById('analysis-result');
        this.tokensTable = document.getElementById('tokens-table');
        this.errorsTable = document.getElementById('errors-table');
        this.reportsResult = document.getElementById('reports-result');

        // Botones de reportes
        this.generateHtmlBtn = document.getElementById('generate-html-btn');
        this.generateGraphvizBtn = document.getElementById('generate-graphviz-btn');
        this.downloadAllBtn = document.getElementById('download-all-btn');

        // Sistema de notificaciones
        this.notifications = document.getElementById('notifications');
        this.loadingOverlay = document.getElementById('loading-overlay');
    }

    initializeEventListeners() {
        // Eventos de entrada
        this.analyzeBtn.addEventListener('click', () => this.analyzeTourney());
        this.clearBtn.addEventListener('click', () => this.clearInput());
        this.exampleBtn.addEventListener('click', () => this.loadExample());
        this.fileInput.addEventListener('change', (e) => this.loadFile(e));

        // Eventos de reportes
        this.generateHtmlBtn.addEventListener('click', () => this.generateHTML());
        this.generateGraphvizBtn.addEventListener('click', () => this.generateGraphviz());
        this.downloadAllBtn.addEventListener('click', () => this.downloadAll());

        // Atajos de teclado
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                this.analyzeTourney();
            }
            if (e.ctrlKey && e.key === 'l') {
                e.preventDefault();
                this.clearInput();
            }
        });
    }

    initializeTabs() {
        const tabs = document.querySelectorAll('.tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                this.switchTab(tab.dataset.tab);
            });
        });
    }

    switchTab(tabName) {
        // Actualizar pestañas
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}-content`).classList.add('active');
        
        this.currentTab = tabName;
    }

    async analyzeTourney() {
        const code = this.codeInput.value.trim();
        
        if (!code) {
            this.showNotification('warning', 'Por favor ingresa código para analizar');
            return;
        }

        this.showLoading(true);
        
        try {
            // Simular delay para mostrar loading
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Reiniciar estado
            window.errors = [];
            this.tokens = [];
            this.errors = [];
            this.tournament = null;

            // Análisis léxico
            const scanner = new TourneyScanner(code);
            this.tokens = scanner.scan();
            
            // Análisis sintáctico
            scanner.reset();
            const parser = new TourneyParser(scanner);
            this.tournament = parser.parse();
            this.errors = [...window.errors];

            // Actualizar interfaz
            this.updateResults();
            this.updateStats();
            this.updateTokensTable();
            this.updateErrorsTable();
            this.enableReports();

            // Mostrar notificación de éxito
            if (this.errors.length === 0) {
                this.showNotification('success', 'Análisis completado exitosamente');
            } else {
                this.showNotification('warning', `Análisis completado con ${this.errors.length} errores`);
            }

        } catch (error) {
            console.error('Error durante el análisis:', error);
            this.showError('Error crítico durante el análisis: ' + error.message);
            this.showNotification('error', 'Error crítico durante el análisis');
        } finally {
            this.showLoading(false);
        }
    }

    updateResults() {
        let html = '';
        
        if (this.errors.length > 0) {
            html = `
                <div class="error-message">
                    <h3>Análisis completado con errores</h3>
                    <p>Se encontraron <strong>${this.errors.length}</strong> errores en el código.</p>
                    <p>Revisa la pestaña "Errores" para más detalles.</p>
                </div>
            `;
        } else if (this.tournament) {
            html = `
                <div class="success-message">
                    <h3>¡Análisis exitoso!</h3>
                    <div class="tournament-info">
                        <p><strong>Nombre del Torneo:</strong> ${this.tournament.nombre}</p>
                        <p><strong>Equipos Registrados:</strong> ${this.tournament.equipos.length}</p>
                        <p><strong>Partidos Programados:</strong> ${this.tournament.getAllMatches().length}</p>
                        <p><strong>Tokens Generados:</strong> ${this.tokens.filter(t => t.type !== 'EOF').length}</p>
                    </div>
                </div>
            `;
        } else {
            html = `
                <div class="error-message">
                    <h3>Error en el análisis</h3>
                    <p>No se pudo procesar el torneo correctamente.</p>
                </div>
            `;
        }
        
        this.analysisResult.innerHTML = html;
    }

    updateStats() {
        this.tokensCount.textContent = this.tokens.filter(t => t.type !== 'EOF').length;
        this.errorsCount.textContent = this.errors.length;
        this.teamsCount.textContent = this.tournament ? this.tournament.equipos.length : 0;
        this.matchesCount.textContent = this.tournament ? this.tournament.getAllMatches().length : 0;
        
        this.analysisStats.classList.remove('hidden');
    }

    updateTokensTable() {
        if (this.tokens.length === 0) {
            this.tokensTable.innerHTML = `
                <div class="info-message">
                    <p>No hay tokens para mostrar. Ejecuta el análisis primero.</p>
                </div>
            `;
            return;
        }

        let html = `
            <table class="table">
                <thead>
                    <tr>
                        <th>No.</th>
                        <th>Lexema</th>
                        <th>Tipo</th>
                        <th>Línea</th>
                        <th>Columna</th>
                    </tr>
                </thead>
                <tbody>
        `;

        this.tokens.forEach((token, index) => {
            if (token.type !== 'EOF') {
                html += `
                    <tr>
                        <td>${index + 1}</td>
                        <td><code>${this.escapeHtml(token.lexeme)}</code></td>
                        <td><span class="token-type">${token.type}</span></td>
                        <td>${token.line}</td>
                        <td>${token.column}</td>
                    </tr>
                `;
            }
        });

        html += '</tbody></table>';
        this.tokensTable.innerHTML = html;
    }

    updateErrorsTable() {
        if (this.errors.length === 0) {
            this.errorsTable.innerHTML = `
                <div class="success-message">
                    <p>No se encontraron errores en el análisis. ¡El código es válido!</p>
                </div>
            `;
            return;
        }

        let html = `
            <table class="table">
                <thead>
                    <tr>
                        <th>No.</th>
                        <th>Descripción</th>
                        <th>Línea</th>
                        <th>Columna</th>
                    </tr>
                </thead>
                <tbody>
        `;

        this.errors.forEach(error => {
            html += `
                <tr>
                    <td>${error.numero}</td>
                    <td>${this.escapeHtml(error.descripcion)}</td>
                    <td>${error.linea}</td>
                    <td>${error.columna}</td>
                </tr>
            `;
        });

        html += '</tbody></table>';
        this.errorsTable.innerHTML = html;
    }

    enableReports() {
        const hasValidTournament = this.tournament !== null;
        this.generateHtmlBtn.disabled = !hasValidTournament;
        this.generateGraphvizBtn.disabled = !hasValidTournament;
        this.downloadAllBtn.disabled = !hasValidTournament;
    }

    generateHTML() {
        if (!this.tournament) {
            this.showNotification('error', 'No hay torneo válido para generar el reporte');
            return;
        }

        try {
            const generator = new HTMLReportGenerator(this.tournament);
            const html = generator.generateFullReport();
            
            this.downloadFile(html, 'tournament-report.html', 'text/html');
            this.showNotification('success', 'Reporte HTML descargado exitosamente');
            
            this.reportsResult.innerHTML = `
                <div class="success-message">
                    <h3>Reporte HTML Generado</h3>
                    <p>El reporte completo del torneo ha sido descargado como <strong>tournament-report.html</strong></p>
                </div>
            `;
        } catch (error) {
            this.showNotification('error', 'Error generando el reporte HTML');
            console.error('Error generando HTML:', error);
        }
    }

    generateGraphviz() {
        if (!this.tournament) {
            this.showNotification('error', 'No hay torneo válido para generar diagramas');
            return;
        }

        try {
            const generator = new GraphvizGenerator(this.tournament);
            const bracketDot = generator.generateBracketDiagram();
            const statsDot = generator.generateTeamStats();
            
            this.downloadFile(bracketDot, 'tournament-bracket.dot', 'text/plain');
            this.downloadFile(statsDot, 'team-stats.dot', 'text/plain');
            
            this.showNotification('success', 'Archivos Graphviz descargados exitosamente');
            
            this.reportsResult.innerHTML = `
                <div class="success-message">
                    <h3>Diagramas Graphviz Generados</h3>
                    <p>Se han descargado los archivos:</p>
                    <ul>
                        <li><strong>tournament-bracket.dot</strong> - Bracket de eliminación</li>
                        <li><strong>team-stats.dot</strong> - Estadísticas de equipos</li>
                    </ul>
                    <p><strong>Para visualizar:</strong></p>
                    <p>Usa <a href="http://magjac.com/graphviz-visual-editor/" target="_blank">Graphviz Online</a> o instala Graphviz localmente.</p>
                </div>
            `;
        } catch (error) {
            this.showNotification('error', 'Error generando los diagramas');
            console.error('Error generando Graphviz:', error);
        }
    }

    downloadAll() {
        this.generateHTML();
        setTimeout(() => {
            this.generateGraphviz();
        }, 1000);
    }

    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType + ';charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    loadFile(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (file.size > 1024 * 1024) { // 1MB limit
            this.showNotification('error', 'El archivo es demasiado grande. Máximo 1MB.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this.codeInput.value = e.target.result;
            this.showNotification('success', `Archivo "${file.name}" cargado exitosamente`);
        };
        reader.onerror = () => {
            this.showNotification('error', 'Error leyendo el archivo');
        };
        reader.readAsText(file);
    }

    clearInput() {
        this.codeInput.value = '';
        this.analysisResult.innerHTML = `
            <div class="info-message">
                <p>Ingresa código del torneo y presiona "Analizar" para comenzar</p>
            </div>
        `;
        this.tokensTable.innerHTML = '';
        this.errorsTable.innerHTML = '';
        this.reportsResult.innerHTML = '';
        this.analysisStats.classList.add('hidden');
        
        // Resetear estado
        this.tournament = null;
        this.tokens = [];
        this.errors = [];
        this.enableReports();
        
        this.showNotification('info', 'Entrada limpiada');
    }

    loadExample() {
        const example = `TORNEO {
    nombre: "Copa Mundial de Ejemplo 2024",
    equipos: 4
}

EQUIPOS {
    equipo: "Real Madrid" [
        jugador: "Vinicius Jr" [
            posicion: "DELANTERO",
            numero: 7,
            edad: 24
        ],
        jugador: "Courtois" [
            posicion: "PORTERO",
            numero: 1,
            edad: 32
        ],
        jugador: "Modric" [
            posicion: "MEDIOCAMPO",
            numero: 10,
            edad: 38
        ]
    ],
    equipo: "Barcelona" [
        jugador: "Pedri" [
            posicion: "MEDIOCAMPO",
            numero: 8,
            edad: 21
        ],
        jugador: "Ter Stegen" [
            posicion: "PORTERO",
            numero: 1,
            edad: 31
        ]
    ],
    equipo: "Manchester City" [
        jugador: "Haaland" [
            posicion: "DELANTERO",
            numero: 9,
            edad: 23
        ],
        jugador: "De Bruyne" [
            posicion: "MEDIOCAMPO",
            numero: 17,
            edad: 32
        ]
    ],
    equipo: "PSG" [
        jugador: "Mbappe" [
            posicion: "DELANTERO",
            numero: 7,
            edad: 25
        ]
    ]
}

ELIMINACION {
    cuartos: [
        partido: "Real Madrid" vs "Barcelona" [
            resultado: "3-1",
            goleador: "Vinicius Jr" [minuto: 23],
            goleador: "Modric" [minuto: 45],
            goleador: "Pedri" [minuto: 67],
            goleador: "Vinicius Jr" [minuto: 89]
        ],
        partido: "Manchester City" vs "PSG" [
            resultado: "2-1",
            goleador: "Haaland" [minuto: 12],
            goleador: "Mbappe" [minuto: 55],
            goleador: "De Bruyne" [minuto: 78]
        ]
    ],
    semifinal: [
        partido: "Real Madrid" vs "Manchester City" [
            resultado: "1-0",
            goleador: "Vinicius Jr" [minuto: 90]
        ]
    ],
    final: [
        partido: "Real Madrid" vs "TBD" [
            resultado: "2-1",
            goleador: "Vinicius Jr" [minuto: 30],
            goleador: "Courtois" [minuto: 60],
            goleador: "Vinicius Jr" [minuto: 85]
        ]
    ]
}`;

        this.codeInput.value = example;
        this.showNotification('success', 'Ejemplo cargado. Presiona "Analizar" para procesarlo');
    }

    showLoading(show) {
        if (show) {
            this.loadingOverlay.classList.remove('hidden');
            this.analyzeBtn.disabled = true;
        } else {
            this.loadingOverlay.classList.add('hidden');
            this.analyzeBtn.disabled = false;
        }
    }

    showError(message) {
        this.analysisResult.innerHTML = `
            <div class="error-message">
                <h3>Error</h3>
                <p>${this.escapeHtml(message)}</p>
            </div>
        `;
    }

    showMessage(type, message) {
        const className = type === 'error' ? 'error-message' : 
                         type === 'success' ? 'success-message' :
                         type === 'warning' ? 'warning-message' : 'info-message';
        
        this.analysisResult.innerHTML = `
            <div class="${className}">
                <p>${this.escapeHtml(message)}</p>
            </div>
        `;
    }

    showNotification(type, message) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <span>${this.escapeHtml(message)}</span>
                <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; cursor: pointer; font-size: 18px; opacity: 0.7;">×</button>
            </div>
        `;
        
        this.notifications.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar interfaz
    window.tourneyInterface = new TourneyInterface();
    
    console.log('TourneyJS Interface iniciada correctamente');
});