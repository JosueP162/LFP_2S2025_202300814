// test-complete.js - Test completo con HTML y PNG
import { TourneyScanner } from './src/Core/TourneyScanner.js';
import { TourneyParser } from './src/Core/TourneyParser.js';
import { GraphvizGenerator } from './src/Generators/GraphvizGenerator.js';
import { HTMLReportGenerator } from './src/Generators/HTMLReportGenerator.js';
import fs from 'fs';

// Initialize global errors
global.errors = [];

// Tournament data completo
const tournamentCode = `TORNEO {
    nombre: "Copa Mundial Test 2024",
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
        ]
    ],
    equipo: "Barcelona" [
        jugador: "Pedri" [
            posicion: "MEDIOCAMPO",
            numero: 8,
            edad: 21
        ]
    ],
    equipo: "Manchester City" [
        jugador: "Haaland" [
            posicion: "DELANTERO",
            numero: 9,
            edad: 23
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
            goleador: "Pedri" [minuto: 67],
            goleador: "Vinicius Jr" [minuto: 89]
        ],
        partido: "Manchester City" vs "PSG" [
            resultado: "2-1",
            goleador: "Haaland" [minuto: 12],
            goleador: "Mbappe" [minuto: 55],
            goleador: "Haaland" [minuto: 78]
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

async function testComplete() {
    console.log("=== TEST COMPLETO: HTML Y GRAPHVIZ PNG ===\n");

    try {
        // 1. Parse tournament
        console.log("1. PARSEANDO TORNEO...");
        global.errors = [];
        const scanner = new TourneyScanner(tournamentCode);
        const tokens = scanner.scan();
        scanner.reset();
        
        const parser = new TourneyParser(scanner);
        const tournament = parser.parse();
        
        if (!tournament) {
            console.log("Error: No se pudo parsear el torneo");
            global.errors.forEach(err => console.log(`  - ${err.descripcion}`));
            return;
        }
        
        console.log("✓ Torneo parseado exitosamente");
        console.log(`  Nombre: ${tournament.nombre}`);
        console.log(`  Equipos: ${tournament.equipos.length}`);
        console.log(`  Partidos: ${tournament.getAllMatches().length}`);

        // Crear directorio output
        const outputDir = './output';
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // 2. Generate HTML Report
        console.log("\n2. GENERANDO REPORTE HTML...");
        const htmlGenerator = new HTMLReportGenerator(tournament);
        const htmlReport = htmlGenerator.generateFullReport();
        
        fs.writeFileSync('./output/tournament-report.html', htmlReport, 'utf8');
        console.log("✓ Reporte HTML: ./output/tournament-report.html");

        // 3. Generate Graphviz files
        console.log("\n3. GENERANDO ARCHIVOS GRAPHVIZ...");
        const graphvizGenerator = new GraphvizGenerator(tournament);
        
        const bracketDot = graphvizGenerator.generateBracketDiagram();
        const statsDot = graphvizGenerator.generateTeamStats();
        
        fs.writeFileSync('./output/tournament-bracket.dot', bracketDot, 'utf8');
        fs.writeFileSync('./output/team-stats.dot', statsDot, 'utf8');
        
        console.log("✓ Bracket DOT: ./output/tournament-bracket.dot");
        console.log("✓ Stats DOT: ./output/team-stats.dot");

        // 4. Generate PNG files (requires Graphviz installed)
        console.log("\n4. GENERANDO ARCHIVOS PNG...");
        try {
            await graphvizGenerator.generateAllPNGs('./output/');
            console.log("✓ Archivos PNG generados exitosamente");
        } catch (error) {
            console.log("⚠ No se pudieron generar PNGs automáticamente");
            console.log("Para generar PNGs manualmente:");
            console.log("1. Instala Graphviz:");
            console.log("   - Windows: choco install graphviz");
            console.log("   - macOS: brew install graphviz");
            console.log("   - Ubuntu: sudo apt install graphviz");
            console.log("2. Ejecuta: dot -Tpng ./output/tournament-bracket.dot -o ./output/bracket.png");
            console.log("3. Ejecuta: dot -Tpng ./output/team-stats.dot -o ./output/stats.png");
        }

        // 5. Generate additional HTML components
        console.log("\n5. GENERANDO COMPONENTES ADICIONALES...");
        
        const errorsHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Errores</title></head><body>${htmlGenerator.generateErrorsTable([])}</body></html>`;
        fs.writeFileSync('./output/errors-report.html', errorsHtml, 'utf8');
        
        const tokensHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Tokens</title></head><body>${htmlGenerator.generateTokensTable(tokens)}</body></html>`;
        fs.writeFileSync('./output/tokens-report.html', tokensHtml, 'utf8');
        
        console.log("✓ Componentes adicionales generados");

        // Summary
        console.log("\n=== ARCHIVOS GENERADOS ===");
        console.log("📄 HTML Reports:");
        console.log("   - ./output/tournament-report.html (Reporte completo)");
        console.log("   - ./output/errors-report.html (Lista de errores)");
        console.log("   - ./output/tokens-report.html (Lista de tokens)");
        console.log("\n📊 Graphviz Files:");
        console.log("   - ./output/tournament-bracket.dot (Bracket)");
        console.log("   - ./output/team-stats.dot (Estadísticas)");
        console.log("   - ./output/tournament-bracket.png (si Graphviz está instalado)");
        console.log("   - ./output/team-stats.png (si Graphviz está instalado)");
        
        console.log("\n🌐 Para ver: Abre los archivos .html en tu navegador");
        console.log("🎨 Para Graphviz online: http://magjac.com/graphviz-visual-editor/");

    } catch (error) {
        console.error("Error durante el test:", error.message);
        console.error("Stack:", error.stack);
    }
}

testComplete();