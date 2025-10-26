// TokenTypes.js - Fixed version
export default class TokenTypes {
    // PALABRAS RESERVADAS PRINCIPALES
    static TORNEO = 'TORNEO';
    static EQUIPOS = 'EQUIPOS';
    static ELIMINACION = 'ELIMINACION';

    // PALABRAS RESERVADAS SECUNDARIAS
    static KW_equipo = 'equipo';
    static KW_jugador = 'jugador';
    static KW_partido = 'partido';
    static KW_goleador = 'goleador';
    static KW_nombre = 'nombre';
    static KW_posicion = 'posicion';
    static KW_numero = 'numero';
    static KW_edad = 'edad';
    static KW_resultado = 'resultado';
    static KW_minuto = 'minuto';
    static KW_vs = 'vs';
    static KW_sede = 'sede';
    static KW_goleadores = 'goleadores';

    // FASES - MISSING IN ORIGINAL
    static KW_cuartos = 'cuartos';
    static KW_semifinal = 'semifinal';
    static KW_final = 'final';

    // Posiciones válidas
    static KW_PORTERO = 'PORTERO';
    static KW_DEFENSA = 'DEFENSA';
    static KW_MEDIOCAMPO = 'MEDIOCAMPO';
    static KW_DELANTERO = 'DELANTERO';
    
    // Símbolos
    static TK_llave_izq = '(';
    static TK_llave_der = ')';
    static TK_corchete_izq = '[';
    static TK_corchete_der = ']';
    static TK_dos_puntos = ':';
    static TK_coma = ',';  
    static TK_punto_coma = ';';
    
    // Literales
    static TK_cadena = 'CADENA';
    static TK_numero = 'NUMERO';
    static TK_identificador = 'IDENTIFICADOR';
    
    // Control
    static EOF = 'EOF';
}