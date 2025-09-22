// TourneyParser.js - Con imports corregidos según la estructura de carpetas
import { Tournament } from '../Models/Tournament.js';
import { Player } from '../Models/Player.js';
import { Match } from '../Models/Match.js';
import TokenTypes from './TokenTypes.js';
import {Team} from '../Models/Team.js';

export class TourneyParser {
    #scanner;
    #currentToken;
    #tournament;

    constructor(scanner) {
        this.#scanner = scanner;
        this.#currentToken = null;
        this.#tournament = new Tournament();
    }

    parse() {
        // Initialize global errors if not exists
        if (!global.errors) {
            global.errors = [];
        }
        
        this.#INICIO();
        
        if (!this.#match(TokenTypes.EOF)) {
            this.#addError(`No se esperaba «${this.#currentToken.lexeme}»`);
        }
        
        return global.errors.length === 0 ? this.#tournament : null;
    }

    #INICIO() {
        this.#ESTRUCTURA_TORNEO();
    }

    #ESTRUCTURA_TORNEO() {
        if (this.#match(TokenTypes.TORNEO)) {
            this.#SECCION_TORNEO();
        }
        
        if (this.#match(TokenTypes.EQUIPOS)) {
            this.#SECCION_EQUIPOS();
        }
        
        if (this.#match(TokenTypes.ELIMINACION)) {
            this.#SECCION_ELIMINACION();
        }
    }

    #SECCION_TORNEO() {
        this.#consume(TokenTypes.TORNEO);
        this.#consume(TokenTypes.TK_llave_izq);
        this.#ATRIBUTOS_TORNEO();
        this.#consume(TokenTypes.TK_llave_der);
    }

    #ATRIBUTOS_TORNEO() {
        this.#ATRIBUTO_TORNEO();
        
        while (this.#match(TokenTypes.TK_coma)) {
            this.#consume(TokenTypes.TK_coma);
            if (!this.#match(TokenTypes.TK_llave_der)) {
                this.#ATRIBUTO_TORNEO();
            }
        }
    }

    #ATRIBUTO_TORNEO() {
    if (this.#match(TokenTypes.KW_nombre)) {
        this.#consume(TokenTypes.KW_nombre);
        this.#consume(TokenTypes.TK_dos_puntos);
        const nombre = this.#consume(TokenTypes.TK_cadena);
        try {
            this.#tournament.nombre = nombre?.lexeme || '';
        } catch (error) {
            this.#addError(error.message);
        }
    } else if (this.#match(TokenTypes.KW_sede)) {  // NUEVO
        this.#consume(TokenTypes.KW_sede);
        this.#consume(TokenTypes.TK_dos_puntos);
        const sede = this.#consume(TokenTypes.TK_cadena);
        try {
            this.#tournament.sede = sede?.lexeme || '';  // Agregar sede
        } catch (error) {
            this.#addError(error.message);
        }
    } else {
        // Handle "equipos" as identifier
        this.#currentToken = this.#scanner.look_ahead();
        if (this.#currentToken.lexeme === 'equipos') {
            this.#scanner.next_token();
            this.#consume(TokenTypes.TK_dos_puntos);
            const cantidad = this.#consume(TokenTypes.TK_numero);
            try {
                this.#tournament.cantidadEquipos = parseInt(cantidad?.lexeme || '0');
            } catch (error) {
                this.#addError(error.message);
            }
        }
    }
}

    #SECCION_EQUIPOS() {
        this.#consume(TokenTypes.EQUIPOS);
        this.#consume(TokenTypes.TK_llave_izq);
        this.#LISTA_EQUIPOS();
        this.#consume(TokenTypes.TK_llave_der);
    }

    #LISTA_EQUIPOS() {
        if (this.#match(TokenTypes.KW_equipo)) {
            this.#DEFINICION_EQUIPO();
            
            while (this.#match(TokenTypes.TK_coma)) {
                this.#consume(TokenTypes.TK_coma);
                if (this.#match(TokenTypes.KW_equipo)) {
                    this.#DEFINICION_EQUIPO();
                }
            }
        }
    }

    #DEFINICION_EQUIPO() {
        this.#consume(TokenTypes.KW_equipo);
        this.#consume(TokenTypes.TK_dos_puntos);
        const nombreEquipo = this.#consume(TokenTypes.TK_cadena);
        
        try {
            const equipo = new Team(nombreEquipo?.lexeme || '');
            
            if (this.#match(TokenTypes.TK_corchete_izq)) {
                this.#consume(TokenTypes.TK_corchete_izq);
                this.#LISTA_JUGADORES(equipo);
                this.#consume(TokenTypes.TK_corchete_der);
            }
            
            this.#tournament.addEquipo(equipo);
        } catch (error) {
            this.#addError(`Error creando equipo: ${error.message}`);
        }
    }

    #LISTA_JUGADORES(equipo) {
        if (this.#match(TokenTypes.KW_jugador)) {
            const jugador = this.#DEFINICION_JUGADOR();
            if (jugador) {
                try {
                    equipo.addJugador(jugador);
                } catch (error) {
                    this.#addError(error.message);
                }
            }
            
            while (this.#match(TokenTypes.TK_coma)) {
                this.#consume(TokenTypes.TK_coma);
                if (this.#match(TokenTypes.KW_jugador)) {
                    const jugador = this.#DEFINICION_JUGADOR();
                    if (jugador) {
                        try {
                            equipo.addJugador(jugador);
                        } catch (error) {
                            this.#addError(error.message);
                        }
                    }
                }
            }
        }
    }

    #DEFINICION_JUGADOR() {
        this.#consume(TokenTypes.KW_jugador);
        this.#consume(TokenTypes.TK_dos_puntos);
        const nombreJugador = this.#consume(TokenTypes.TK_cadena);
        
        try {
            const jugador = new Player(nombreJugador?.lexeme || '');
            
            if (this.#match(TokenTypes.TK_corchete_izq)) {
                this.#consume(TokenTypes.TK_corchete_izq);
                this.#ATRIBUTOS_JUGADOR(jugador);
                this.#consume(TokenTypes.TK_corchete_der);
            }
            
            return jugador;
        } catch (error) {
            this.#addError(`Error creando jugador: ${error.message}`);
            return null;
        }
    }

    #ATRIBUTOS_JUGADOR(jugador) {
        this.#ATRIBUTO_JUGADOR(jugador);
        
        while (this.#match(TokenTypes.TK_coma)) {
            this.#consume(TokenTypes.TK_coma);
            if (!this.#match(TokenTypes.TK_corchete_der)) {
                this.#ATRIBUTO_JUGADOR(jugador);
            }
        }
    }

    #ATRIBUTO_JUGADOR(jugador) {
        if (this.#match(TokenTypes.KW_posicion)) {
            this.#consume(TokenTypes.KW_posicion);
            this.#consume(TokenTypes.TK_dos_puntos);
            const posicion = this.#consume(TokenTypes.TK_cadena);
            try {
                jugador.posicion = posicion?.lexeme || '';
            } catch (error) {
                this.#addError(error.message);
            }
        } else if (this.#match(TokenTypes.KW_numero)) {
            this.#consume(TokenTypes.KW_numero);
            this.#consume(TokenTypes.TK_dos_puntos);
            const numero = this.#consume(TokenTypes.TK_numero);
            try {
                jugador.numero = parseInt(numero?.lexeme || '0');
            } catch (error) {
                this.#addError(error.message);
            }
        } else if (this.#match(TokenTypes.KW_edad)) {
            this.#consume(TokenTypes.KW_edad);
            this.#consume(TokenTypes.TK_dos_puntos);
            const edad = this.#consume(TokenTypes.TK_numero);
            try {
                jugador.edad = parseInt(edad?.lexeme || '0');
            } catch (error) {
                this.#addError(error.message);
            }
        }
    }

    #SECCION_ELIMINACION() {
        this.#consume(TokenTypes.ELIMINACION);
        this.#consume(TokenTypes.TK_llave_izq);
        this.#LISTA_FASES();
        this.#consume(TokenTypes.TK_llave_der);
    }

    #LISTA_FASES() {
        this.#FASE();
        
        while (this.#match(TokenTypes.TK_coma)) {
            this.#consume(TokenTypes.TK_coma);
            if (!this.#match(TokenTypes.TK_llave_der)) {
                this.#FASE();
            }
        }
    }

    #FASE() {
        let nombreFase = '';
        
        if (this.#match(TokenTypes.KW_cuartos)) {
            nombreFase = 'cuartos';
            this.#consume(TokenTypes.KW_cuartos);
        } else if (this.#match(TokenTypes.KW_semifinal)) {
            nombreFase = 'semifinal';
            this.#consume(TokenTypes.KW_semifinal);
        } else if (this.#match(TokenTypes.KW_final)) {
            nombreFase = 'final';
            this.#consume(TokenTypes.KW_final);
        }
        
        if (nombreFase) {
            this.#consume(TokenTypes.TK_dos_puntos);
            this.#consume(TokenTypes.TK_corchete_izq);
            this.#LISTA_PARTIDOS(nombreFase);
            this.#consume(TokenTypes.TK_corchete_der);
        }
    }

    #LISTA_PARTIDOS(fase) {
        if (this.#match(TokenTypes.KW_partido)) {
            const partido = this.#PARTIDO();
            if (partido) {
                try {
                    partido.fase = fase;
                    this.#tournament.addPartidoToFase(fase, partido);
                } catch (error) {
                    this.#addError(error.message);
                }
            }
            
            while (this.#match(TokenTypes.TK_coma)) {
                this.#consume(TokenTypes.TK_coma);
                if (this.#match(TokenTypes.KW_partido)) {
                    const partido = this.#PARTIDO();
                    if (partido) {
                        try {
                            partido.fase = fase;
                            this.#tournament.addPartidoToFase(fase, partido);
                        } catch (error) {
                            this.#addError(error.message);
                        }
                    }
                }
            }
        }
    }

    #PARTIDO() {
        this.#consume(TokenTypes.KW_partido);
        this.#consume(TokenTypes.TK_dos_puntos);
        const equipo1 = this.#consume(TokenTypes.TK_cadena);
        this.#consume(TokenTypes.KW_vs);
        const equipo2 = this.#consume(TokenTypes.TK_cadena);
        
        try {
            const partido = new Match();
            partido.equipo1 = equipo1?.lexeme || '';
            partido.equipo2 = equipo2?.lexeme || '';
            
            if (this.#match(TokenTypes.TK_corchete_izq)) {
                this.#consume(TokenTypes.TK_corchete_izq);
                this.#ATRIBUTOS_PARTIDO(partido);
                this.#consume(TokenTypes.TK_corchete_der);
            }
            
            return partido;
        } catch (error) {
            this.#addError(`Error creando partido: ${error.message}`);
            return null;
        }
    }

    #ATRIBUTOS_PARTIDO(partido) {
        this.#ATRIBUTO_PARTIDO(partido);
        
        while (this.#match(TokenTypes.TK_coma)) {
            this.#consume(TokenTypes.TK_coma);
            if (!this.#match(TokenTypes.TK_corchete_der)) {
                this.#ATRIBUTO_PARTIDO(partido);
            }
        }
    }

    #ATRIBUTO_PARTIDO(partido) {
    if (this.#match(TokenTypes.KW_resultado)) {
        this.#consume(TokenTypes.KW_resultado);
        this.#consume(TokenTypes.TK_dos_puntos);
        const resultado = this.#consume(TokenTypes.TK_cadena);
        try {
            partido.resultado = resultado?.lexeme || '';
        } catch (error) {
            this.#addError(error.message);
        }
    } else if (this.#match(TokenTypes.KW_goleadores)) {  // NUEVO - plural
        this.#consume(TokenTypes.KW_goleadores);
        this.#consume(TokenTypes.TK_dos_puntos);
        this.#consume(TokenTypes.TK_corchete_izq);
        this.#LISTA_GOLEADORES(partido);  // Nuevo método
        this.#consume(TokenTypes.TK_corchete_der);
    } else if (this.#match(TokenTypes.KW_goleador)) {  // EXISTENTE - singular
        this.#consume(TokenTypes.KW_goleador);
        this.#consume(TokenTypes.TK_dos_puntos);
        const nombreGoleador = this.#consume(TokenTypes.TK_cadena);
        
        if (this.#match(TokenTypes.TK_corchete_izq)) {
            this.#consume(TokenTypes.TK_corchete_izq);
            if (this.#match(TokenTypes.KW_minuto)) {
                this.#consume(TokenTypes.KW_minuto);
                this.#consume(TokenTypes.TK_dos_puntos);
                const minuto = this.#consume(TokenTypes.TK_numero);
                partido.addGoleador(nombreGoleador?.lexeme || '', parseInt(minuto?.lexeme || '0'));
            }
            this.#consume(TokenTypes.TK_corchete_der);
        }
    }
    }   

    // Nuevo método para lista de goleadores
    #LISTA_GOLEADORES(partido) {
    if (this.#match(TokenTypes.KW_goleador)) {
        this.#GOLEADOR_INDIVIDUAL(partido);
        
        while (this.#match(TokenTypes.TK_coma)) {
            this.#consume(TokenTypes.TK_coma);
            if (this.#match(TokenTypes.KW_goleador)) {
                this.#GOLEADOR_INDIVIDUAL(partido);
            }
        }
    }
    }

    #GOLEADOR_INDIVIDUAL(partido) {
    this.#consume(TokenTypes.KW_goleador);
    this.#consume(TokenTypes.TK_dos_puntos);
    const nombreGoleador = this.#consume(TokenTypes.TK_cadena);
    
    if (this.#match(TokenTypes.TK_corchete_izq)) {
        this.#consume(TokenTypes.TK_corchete_izq);
        if (this.#match(TokenTypes.KW_minuto)) {
            this.#consume(TokenTypes.KW_minuto);
            this.#consume(TokenTypes.TK_dos_puntos);
            const minuto = this.#consume(TokenTypes.TK_numero);
            partido.addGoleador(nombreGoleador?.lexeme || '', parseInt(minuto?.lexeme || '0'));
        }
        this.#consume(TokenTypes.TK_corchete_der);
    }
    }

    // ===== AUXILIARY METHODS =====
    #match(...types) {
        this.#currentToken = this.#scanner.look_ahead();
        return types.includes(this.#currentToken.type);
    }

    #consume(...types) {
        if (this.#match(...types)) {
            return this.#scanner.next_token();
        }
        this.#addError(`Se esperaba ${types.join(' o ')}, se encontró «${this.#currentToken.lexeme}»`);
        return null;
    }

    #addError(message) {
        // Use global errors consistently
        if (!global.errors) {
            global.errors = [];
        }
        global.errors.push({
            numero: global.errors.length + 1,
            descripcion: message,
            linea: this.#currentToken?.line || 0,
            columna: this.#currentToken?.column || 0
        });
    }
}