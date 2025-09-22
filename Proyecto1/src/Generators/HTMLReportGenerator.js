import TokenTypes from '../core/TokenTypes.js';
export class HTMLReportGenerator {
    #tournament;

    constructor(tournament) {
        this.#tournament = tournament;
    }

    #calculateStatistics() {
        const equipos = this.#tournament.equipos;
        const fases = this.#tournament.fases;
        
        for (const equipo of equipos) {
            let partidos = 0, ganados = 0, perdidos = 0, golesFavor = 0, golesContra = 0;
            
            for (const fase of Object.values(fases)) {
                for (const partido of fase) {
                    if (partido.equipo1 === equipo.nombre || partido.equipo2 === equipo.nombre) {
                        partidos++;
                        
                        if (partido.resultado) {
                            const goles1 = partido.getGolesEquipo1();
                            const goles2 = partido.getGolesEquipo2();
                            
                            if (partido.equipo1 === equipo.nombre) {
                                golesFavor += goles1;
                                golesContra += goles2;
                                if (goles1 > goles2) ganados++;
                                else perdidos++;
                            } else {
                                golesFavor += goles2;
                                golesContra += goles1;
                                if (goles2 > goles1) ganados++;
                                else perdidos++;
                            }
                        }
                    }
                }
            }
            
            equipo.updateEstadisticas(partidos, ganados, perdidos, golesFavor, golesContra);
            
            let faseAlcanzada = 'Cuartos';
            
            const partidosFinal = fases.final || [];
            for (const partido of partidosFinal) {
                if (partido.ganador === equipo.nombre) {
                    faseAlcanzada = 'Campeón';
                    break;
                }
            }
            
            if (faseAlcanzada === 'Cuartos') {
                const partidosSemifinal = fases.semifinal || [];
                for (const partido of partidosSemifinal) {
                    if (partido.ganador === equipo.nombre) {
                        faseAlcanzada = 'Final';
                        break;
                    }
                }
            }
            
            if (faseAlcanzada === 'Cuartos') {
                const partidosCuartos = fases.cuartos || [];
                for (const partido of partidosCuartos) {
                    if (partido.ganador === equipo.nombre) {
                        faseAlcanzada = 'Semifinal';
                        break;
                    }
                }
            }
            
            equipo.setFaseAlcanzada(faseAlcanzada);
        }
    }

    #cleanString(str) {
        let cleaned = '';
        for (let i = 0; i < str.length; i++) {
            const char = str.charAt(i);
            if ((char >= 'a' && char <= 'z') ||
                (char >= 'A' && char <= 'Z') ||
                (char >= '0' && char <= '9') ||
                char === ' ' || char === '-') {
                cleaned += char;
            }
        }
        return cleaned;
    }

    generateFullReport() {
        this.#calculateStatistics();
        const nombreLimpio = this.#cleanString(this.#tournament.nombre);
        
        return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Reporte del Torneo: ${nombreLimpio}</title>
<style>
body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 20px;
    background-color: #f5f7fa;
    line-height: 1.6;
}
.container {
    max-width: 1200px;
    margin: 0 auto;
    background: white;
    padding: 30px;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
h1 {
    color: #2c3e50;
    text-align: center;
    border-bottom: 3px solid #3498db;
    padding-bottom: 15px;
    margin-bottom: 30px;
    font-size: 2.5em;
}
h2 {
    color: #34495e;
    border-bottom: 2px solid #bdc3c7;
    padding-bottom: 8px;
    margin-top: 40px;
    margin-bottom: 20px;
}
h3 {
    color: #2c3e50;
    margin-bottom: 15px;
}
table {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
th, td {
    border: 1px solid #ddd;
    padding: 12px 15px;
    text-align: left;
}
th {
    background-color: #3498db;
    color: white;
    font-weight: 600;
}
tr:nth-child(even) {
    background-color: #f8f9fa;
}
tr:hover {
    background-color: #e8f4fd;
}
.highlight {
    background-color: #f39c12;
    color: white;
    font-weight: bold;
}
.winner {
    background-color: #27ae60;
    color: white;
    font-weight: bold;
}
.stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin: 20px 0;
}
.stat-box {
    background: #ecf0f1;
    padding: 20px;
    border-radius: 8px;
    border-left: 4px solid #3498db;
}
.stat-box p {
    margin: 8px 0;
}
.goleador-highlight {
    background-color: #e74c3c;
    color: white;
    font-weight: bold;
}
strong {
    color: #2c3e50;
}
</style>
</head>
<body>
<div class="container">
<h1>Reporte del Torneo: ${nombreLimpio}</h1>
${this.generateBracketReport()}
${this.generateStatsReport()}
${this.generateGoleadoresReport()}
${this.generateGeneralReport()}
</div>
</body>
</html>`;
    }

    generateBracketReport() {
        const fases = this.#tournament.fases;
        
        let html = '<h2>Bracket de Eliminación</h2>';
        html += '<table><thead><tr><th>Fase</th><th>Partido</th><th>Resultado</th><th>Ganador</th></tr></thead><tbody>';
        
        const faseNames = { 'cuartos': 'Cuartos de Final', 'semifinal': 'Semifinal', 'final': 'Final' };
        
        for (const faseName of ['cuartos', 'semifinal', 'final']) {
            const partidos = fases[faseName] || [];
            for (const partido of partidos) {
                html += `<tr>
                    <td>${faseNames[faseName]}</td>
                    <td>${partido.equipo1} vs ${partido.equipo2}</td>
                    <td>${partido.resultado || 'Pendiente'}</td>
                    <td class="winner">${partido.ganador || '-'}</td>
                </tr>`;
            }
        }
        
        html += '</tbody></table>';
        return html;
    }

    generateStatsReport() {
        const equipos = this.#tournament.equipos;
        
        let html = '<h2>Estadísticas por Equipo</h2>';
        html += '<table><thead><tr><th>Equipo</th><th>J</th><th>G</th><th>P</th><th>GF</th><th>GC</th><th>GD</th><th>Fase Alcanzada</th></tr></thead><tbody>';
        
        const equiposOrdenados = [...equipos];
        for (let i = 0; i < equiposOrdenados.length - 1; i++) {
            for (let j = i + 1; j < equiposOrdenados.length; j++) {
                const statsI = equiposOrdenados[i].estadisticas;
                const statsJ = equiposOrdenados[j].estadisticas;
                
                if (statsJ.ganados > statsI.ganados || 
                    (statsJ.ganados === statsI.ganados && statsJ.diferencia > statsI.diferencia)) {
                    const temp = equiposOrdenados[i];
                    equiposOrdenados[i] = equiposOrdenados[j];
                    equiposOrdenados[j] = temp;
                }
            }
        }
        
        for (const equipo of equiposOrdenados) {
            const stats = equipo.estadisticas;
            const gdClass = stats.diferencia > 0 ? 'highlight' : '';
            const signo = stats.diferencia >= 0 ? '+' : '';
            
            html += `<tr>
                <td><strong>${equipo.nombre}</strong></td>
                <td>${stats.partidos}</td>
                <td>${stats.ganados}</td>
                <td>${stats.perdidos}</td>
                <td>${stats.golesFavor}</td>
                <td>${stats.golesContra}</td>
                <td class="${gdClass}">${signo}${stats.diferencia}</td>
                <td>${stats.faseAlcanzada}</td>
            </tr>`;
        }
        
        html += '</tbody></table>';
        return html;
    }

    generateGoleadoresReport() {
        const goleadores = new Map();
        const allMatches = this.#tournament.getAllMatches();
        
        for (const partido of allMatches) {
            for (const goleador of partido.goleadores) {
                const nombre = goleador.jugador;
                if (!goleadores.has(nombre)) {
                    goleadores.set(nombre, { nombre: nombre, goles: 0, partidos: [] });
                }
                goleadores.get(nombre).goles++;
                goleadores.get(nombre).partidos.push(`${partido.equipo1} vs ${partido.equipo2} (${goleador.minuto}')`);
            }
        }
        
        const goleadoresList = Array.from(goleadores.values());
        
        for (let i = 0; i < goleadoresList.length - 1; i++) {
            for (let j = i + 1; j < goleadoresList.length; j++) {
                if (goleadoresList[j].goles > goleadoresList[i].goles) {
                    const temp = goleadoresList[i];
                    goleadoresList[i] = goleadoresList[j];
                    goleadoresList[j] = temp;
                }
            }
        }
        
        let html = '<h2>Tabla de Goleadores</h2>';
        
        if (goleadoresList.length === 0) {
            html += '<p>No hay goleadores registrados en el torneo.</p>';
            return html;
        }
        
        html += '<table><thead><tr><th>Posición</th><th>Jugador</th><th>Goles</th><th>Partidos</th></tr></thead><tbody>';
        
        for (let i = 0; i < goleadoresList.length; i++) {
            const goleador = goleadoresList[i];
            const isTopScorer = i === 0 && goleador.goles > 0;
            const rowClass = isTopScorer ? 'goleador-highlight' : '';
            
            html += `<tr class="${rowClass}">
                <td><strong>${i + 1}</strong></td>
                <td>${goleador.nombre}</td>
                <td><strong>${goleador.goles}</strong></td>
                <td>${goleador.partidos.join(', ')}</td>
            </tr>`;
        }
        
        html += '</tbody></table>';
        return html;
    }

    generateGeneralReport() {
        const fases = this.#tournament.fases;
        const equipos = this.#tournament.equipos;
        
        let totalPartidos = 0;
        let partidosCompletados = 0;
        let totalGoles = 0;
        
        for (const fase of ['cuartos', 'semifinal', 'final']) {
            const partidos = fases[fase] || [];
            totalPartidos += partidos.length;
            
            for (const partido of partidos) {
                if (partido.completado) {
                    partidosCompletados++;
                    totalGoles += partido.getGolesEquipo1() + partido.getGolesEquipo2();
                }
            }
        }
        
        const promedioGoles = partidosCompletados > 0 ? (totalGoles / partidosCompletados).toFixed(2) : '0.00';
        
        return `<h2>Información General del Torneo</h2>
<div class="stats-grid">
    <div class="stat-box">
        <h3>Datos Básicos</h3>
        <p><strong>Nombre:</strong> ${this.#tournament.nombre}</p>
        <p><strong>Equipos Participantes:</strong> ${equipos.length}</p>
        <p><strong>Total de Partidos:</strong> ${totalPartidos}</p>
        <p><strong>Partidos Completados:</strong> ${partidosCompletados}</p>
    </div>
    <div class="stat-box">
        <h3>Estadísticas</h3>
        <p><strong>Total de Goles:</strong> ${totalGoles}</p>
        <p><strong>Promedio por Partido:</strong> ${promedioGoles}</p>
        <p><strong>Progreso:</strong> ${totalPartidos > 0 ? Math.round((partidosCompletados / totalPartidos) * 100) : 0}%</p>
    </div>
</div>`;
    }

    generateErrorsTable(errorsArray) {
        if (errorsArray.length === 0) return '<p>No hay errores que reportar.</p>';
        
        let html = '<h2>Errores Encontrados</h2>';
        html += '<table><thead><tr><th>No.</th><th>Descripción</th><th>Línea</th><th>Columna</th></tr></thead><tbody>';
        
        for (const error of errorsArray) {
            html += `<tr>
                <td>${error.numero}</td>
                <td>${error.descripcion}</td>
                <td>${error.linea}</td>
                <td>${error.columna}</td>
            </tr>`;
        }
        
        html += '</tbody></table>';
        return html;
    }

    generateTokensTable(tokensArray) {
        let html = '<h2>Listado de Tokens</h2>';
        html += '<table><thead><tr><th>No.</th><th>Lexema</th><th>Tipo</th><th>Línea</th><th>Columna</th></tr></thead><tbody>';
        
        for (let i = 0; i < tokensArray.length; i++) {
            const token = tokensArray[i];
            if (token.type !== TokenTypes.EOF) {
                html += `<tr>
                    <td>${i + 1}</td>
                    <td>${token.lexeme}</td>
                    <td>${token.type}</td>
                    <td>${token.line}</td>
                    <td>${token.column}</td>
                </tr>`;
            }
        }
        
        html += '</tbody></table>';
        return html;
    }
}