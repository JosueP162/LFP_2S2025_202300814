export class GraphvizGenerator {
    #tournament;

    constructor(tournament) {
        this.#tournament = tournament;
    }

    generateBracketDiagram() {
        const fases = this.#tournament.fases;
        const partidosCuartos = fases.cuartos || [];
        const partidosSemifinal = fases.semifinal || [];
        const partidosFinal = fases.final || [];

        let dot = 'digraph TournamentBracket {\n';
        dot += '    rankdir=LR;\n';
        dot += '    node [shape=box, style="filled,rounded", fontname="Arial", fontsize=12];\n';
        dot += '    edge [fontname="Arial", fontsize=10];\n';
        dot += '    bgcolor=white;\n';
        dot += '    pad=0.5;\n\n';

        // Cuartos de Final
        dot += '    // Cuartos de Final\n';
        dot += '    subgraph cluster_cuartos {\n';
        dot += '        label="Cuartos de Final";\n';
        dot += '        style=filled;\n';
        dot += '        color=lightblue;\n';
        dot += '        fillcolor="lightblue:white";\n';
        dot += '        fontname="Arial Bold";\n';
        
        for (let i = 0; i < partidosCuartos.length; i++) {
            const partido = partidosCuartos[i];
            const nodo = `cuarto${i + 1}`;
            const resultado = partido.resultado || 'Por jugar';
            let color = 'white';
            let fontcolor = 'black';
            
            if (partido.ganador && partido.ganador !== 'Empate') {
                color = 'lightgreen';
            } else if (resultado !== 'Por jugar') {
                color = 'lightyellow';
            }
            
            const label = `"${partido.equipo1}\\nvs\\n${partido.equipo2}\\n${resultado}"`;
            dot += `        ${nodo} [label=${label}, fillcolor="${color}", fontcolor="${fontcolor}"];\n`;
        }
        dot += '    }\n\n';

        // Semifinal
        if (partidosSemifinal.length > 0) {
            dot += '    // Semifinal\n';
            dot += '    subgraph cluster_semifinal {\n';
            dot += '        label="Semifinal";\n';
            dot += '        style=filled;\n';
            dot += '        color=lightcyan;\n';
            dot += '        fillcolor="lightcyan:white";\n';
            dot += '        fontname="Arial Bold";\n';
            
            for (let i = 0; i < partidosSemifinal.length; i++) {
                const partido = partidosSemifinal[i];
                const nodo = `semi${i + 1}`;
                const resultado = partido.resultado || 'Por jugar';
                let color = 'white';
                
                if (partido.ganador && partido.ganador !== 'Empate') {
                    color = 'lightgreen';
                } else if (resultado !== 'Por jugar') {
                    color = 'lightyellow';
                }
                
                const label = `"${partido.equipo1}\\nvs\\n${partido.equipo2}\\n${resultado}"`;
                dot += `        ${nodo} [label=${label}, fillcolor="${color}"];\n`;
            }
            dot += '    }\n\n';
        }

        // Final
        if (partidosFinal.length > 0) {
            dot += '    // Final\n';
            dot += '    subgraph cluster_final {\n';
            dot += '        label="Final";\n';
            dot += '        style=filled;\n';
            dot += '        color=gold;\n';
            dot += '        fillcolor="gold:white";\n';
            dot += '        fontname="Arial Bold";\n';
            
            for (let i = 0; i < partidosFinal.length; i++) {
                const partido = partidosFinal[i];
                const nodo = `final${i + 1}`;
                const resultado = partido.resultado || 'Por jugar';
                let color = 'white';
                
                if (partido.ganador && partido.ganador !== 'Empate') {
                    color = 'orange';
                    dot += `        ${nodo} [label="CAMPEÓN\\n${partido.ganador}\\n${resultado}", fillcolor="${color}", fontcolor="white", fontsize=14, style="filled,rounded,bold"];\n`;
                } else {
                    const label = `"${partido.equipo1}\\nvs\\n${partido.equipo2}\\n${resultado}"`;
                    dot += `        ${nodo} [label=${label}, fillcolor="${color}"];\n`;
                }
            }
            dot += '    }\n\n';
        }

        // Conexiones entre fases
        dot += '    // Conexiones\n';
        
        // Conectar cuartos con semifinal
        if (partidosCuartos.length >= 2 && partidosSemifinal.length > 0) {
            dot += `    cuarto1 -> semi1 [label="${partidosCuartos[0]?.ganador || '?'}"];\n`;
            dot += `    cuarto2 -> semi1 [label="${partidosCuartos[1]?.ganador || '?'}"];\n`;
            
            if (partidosCuartos.length >= 4 && partidosSemifinal.length > 1) {
                dot += `    cuarto3 -> semi2 [label="${partidosCuartos[2]?.ganador || '?'}"];\n`;
                dot += `    cuarto4 -> semi2 [label="${partidosCuartos[3]?.ganador || '?'}"];\n`;
            }
        }
        
        // Conectar semifinal con final
        if (partidosSemifinal.length >= 2 && partidosFinal.length > 0) {
            dot += `    semi1 -> final1 [label="${partidosSemifinal[0]?.ganador || '?'}"];\n`;
            dot += `    semi2 -> final1 [label="${partidosSemifinal[1]?.ganador || '?'}"];\n`;
        }

        // Configuración general
        dot += '\n    // Configuración\n';
        dot += '    label="Bracket de Eliminación";\n';
        dot += '    fontsize=20;\n';
        dot += '    fontname="Arial Bold";\n';
        dot += '    labelloc="t";\n';
        
        dot += '}\n';
        return dot;
    }

    generateTeamStats() {
        const equipos = this.#tournament.equipos;
        
        let dot = 'digraph TeamStats {\n';
        dot += '    rankdir=TB;\n';
        dot += '    node [shape=record, style=filled, fontname="Arial"];\n';
        dot += '    bgcolor=white;\n\n';
        
        for (let i = 0; i < equipos.length; i++) {
            const equipo = equipos[i];
            const stats = equipo.estadisticas;
            
            let color = 'lightblue';
            if (stats.faseAlcanzada === 'Campeón') color = 'gold';
            else if (stats.faseAlcanzada === 'Final') color = 'silver';
            else if (stats.faseAlcanzada === 'Semifinal') color = 'lightgreen';
            
            const label = `"{${equipo.nombre}|J: ${stats.partidos}|G: ${stats.ganados}|P: ${stats.perdidos}|GF: ${stats.golesFavor}|GC: ${stats.golesContra}|GD: ${stats.diferencia >= 0 ? '+' : ''}${stats.diferencia}|${stats.faseAlcanzada}}"`;
            
            dot += `    team${i} [label=${label}, fillcolor="${color}"];\n`;
        }
        
        dot += '\n    label="Estadísticas por Equipo";\n';
        dot += '    fontsize=16;\n';
        dot += '    fontname="Arial Bold";\n';
        dot += '}\n';
        
        return dot;
    }

    // Método para generar archivo PNG usando Graphviz
    generatePNG(dotContent, filename, outputPath = './output/') {
        return new Promise((resolve, reject) => {
            try {
                const fs = require('fs');
                const { exec } = require('child_process');
                const path = require('path');
                
                // Crear directorio si no existe
                if (!fs.existsSync(outputPath)) {
                    fs.mkdirSync(outputPath, { recursive: true });
                }
                
                // Escribir archivo .dot temporal
                const dotFile = path.join(outputPath, `${filename}.dot`);
                const pngFile = path.join(outputPath, `${filename}.png`);
                
                fs.writeFileSync(dotFile, dotContent);
                
                // Ejecutar comando dot para generar PNG
                const command = `dot -Tpng "${dotFile}" -o "${pngFile}"`;
                
                exec(command, (error, stdout, stderr) => {
                    if (error) {
                        console.log('Error ejecutando Graphviz. ¿Está instalado Graphviz?');
                        console.log('Instalación:');
                        console.log('- Windows: choco install graphviz o descargar desde graphviz.org');
                        console.log('- macOS: brew install graphviz');
                        console.log('- Ubuntu: sudo apt install graphviz');
                        reject(error);
                        return;
                    }
                    
                    if (stderr) {
                        console.log('Advertencia Graphviz:', stderr);
                    }
                    
                    console.log(`✓ PNG generado: ${pngFile}`);
                    resolve(pngFile);
                });
                
            } catch (error) {
                reject(error);
            }
        });
    }

    // Método para generar ambos diagramas como PNG
    async generateAllPNGs(outputPath = './output/') {
        try {
            const bracketDot = this.generateBracketDiagram();
            const statsDot = this.generateTeamStats();
            
            const results = await Promise.allSettled([
                this.generatePNG(bracketDot, 'tournament-bracket', outputPath),
                this.generatePNG(statsDot, 'team-stats', outputPath)
            ]);
            
            console.log('\n=== RESULTADOS DE GENERACIÓN PNG ===');
            results.forEach((result, index) => {
                const name = index === 0 ? 'Bracket' : 'Estadísticas';
                if (result.status === 'fulfilled') {
                    console.log(`✓ ${name}: ${result.value}`);
                } else {
                    console.log(`✗ ${name}: Error - ${result.reason.message}`);
                }
            });
            
            return results;
        } catch (error) {
            console.error('Error generando PNGs:', error);
            throw error;
        }
    }
}