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
        if (!window.global) {
            window.global = {};
        }
        if (!window.global.errors) {
            window.global.errors = [];
        }
        
        try {
            this.#INICIO();
        } catch (error) {
            this.#addError(`Error cri­tico en el parser: ${error.message}`);
        }
        
        // Siempre devolver el torneo, incluso si hay errores
        return this.#tournament;
    }

    #addError(message) {
        if (!window.global) {
            window.global = {};
        }
        if (!window.global.errors) {
            window.global.errors = [];
        }
        window.global.errors.push({
            numero: window.global.errors.length + 1,
            descripcion: message,
            linea: this.#currentToken?.line || 0,
            columna: this.#currentToken?.column || 0
        });
    }

    #INICIO() {
        this.#ESTRUCTURA_TORNEO();
    }

    #ESTRUCTURA_TORNEO() {
        // Procesar secciones principales con recuperacion 
        this.#procesarSeccionTorneo();
        this.#procesarSeccionEquipos();
        this.#procesarSeccionEliminacion();
    }

    // metodo para procesar seccion TORNEO
    #procesarSeccionTorneo() {
        // Buscar la palabra clave TORNEO
        while (!this.#match(TokenTypes.EOF)) {
            if (this.#match(TokenTypes.TORNEO)) {
                try {
                    this.#SECCION_TORNEO();
                } catch (error) {
                    this.#addError(`Error en seccion TORNEO: ${error.message}`);
                    this.#sincronizarHastaLlaveCerrada();
                }
                return;
            }
            this.#avanzarToken();
        }
    }

    // metodo para procesar seccion EQUIPOS
    #procesarSeccionEquipos() {
        // Buscar la palabra clave EQUIPOS
        while (!this.#match(TokenTypes.EOF)) {
            if (this.#match(TokenTypes.EQUIPOS)) {
                try {
                    this.#SECCION_EQUIPOS();
                } catch (error) {
                    this.#addError(`Error en seccion EQUIPOS: ${error.message}`);
                    this.#sincronizarHastaLlaveCerrada();
                }
                return;
            }
            this.#avanzarToken();
        }
    }

    // metodo para procesar secciÃ³n ELIMINACION
    #procesarSeccionEliminacion() {
        // Buscar la palabra clave ELIMINACION
        while (!this.#match(TokenTypes.EOF)) {
            if (this.#match(TokenTypes.ELIMINACION)) {
                try {
                    this.#SECCION_ELIMINACION();
                } catch (error) {
                    this.#addError(`Error en seccion ELIMINACION: ${error.message}`);
                    this.#sincronizarHastaLlaveCerrada();
                }
                return;
            }
            this.#avanzarToken();
        }
    }

    #SECCION_TORNEO() {
        this.#consume(TokenTypes.TORNEO);
        this.#consume(TokenTypes.TK_llave_izq);
        this.#ATRIBUTOS_TORNEO();
        this.#consume(TokenTypes.TK_llave_der);
    }

    #ATRIBUTOS_TORNEO() {
        // Procesar atributos con recuperacion
        while (!this.#match(TokenTypes.TK_llave_der) && !this.#match(TokenTypes.EOF)) {
            try {
                this.#ATRIBUTO_TORNEO();
                
                // Saltar comas opcionales
                if (this.#match(TokenTypes.TK_coma)) {
                    this.#consume(TokenTypes.TK_coma);
                }
            } catch (error) {
                this.#addError(`Error procesando atributo del torneo: ${error.message}`);
                this.#saltarHastaProximoAtributoOCierre();
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
        } else if (this.#match(TokenTypes.KW_sede)) {
            this.#consume(TokenTypes.KW_sede);
            this.#consume(TokenTypes.TK_dos_puntos);
            const sede = this.#consume(TokenTypes.TK_cadena);
            try {
                this.#tournament.sede = sede?.lexeme || '';
            } catch (error) {
                this.#addError(error.message);
            }
        } else {
            // Manejar "equipos" como identificador
            this.#currentToken = this.#scanner.look_ahead();
            if (this.#currentToken.lexeme === 'equipos') {
                this.#avanzarToken();
                this.#consume(TokenTypes.TK_dos_puntos);
                const cantidad = this.#consume(TokenTypes.TK_numero);
                try {
                    this.#tournament.cantidadEquipos = parseInt(cantidad?.lexeme || '0');
                } catch (error) {
                    this.#addError(error.message);
                }
            } else {
                // Token inesperado, saltar
                this.#addError(`Atributo de torneo no reconocido: ${this.#currentToken?.lexeme}`);
                this.#avanzarToken();
            }
        }
    }

    #SECCION_EQUIPOS() {
        this.#consume(TokenTypes.EQUIPOS);
        this.#consume(TokenTypes.TK_llave_izq);
        this.#LISTA_EQUIPOS_();
        this.#consume(TokenTypes.TK_llave_der);
    }

    #LISTA_EQUIPOS_() {
        while (!this.#match(TokenTypes.TK_llave_der) && !this.#match(TokenTypes.EOF)) {
            this.#skipOptionalSemicolons();
            
            if (this.#match(TokenTypes.TK_llave_der) || this.#match(TokenTypes.EOF)) {
                break;
            }
            
            if (this.#match(TokenTypes.KW_equipo)) {
                try {
                    this.#DEFINICION_EQUIPO();
                    
                    if (this.#match(TokenTypes.TK_coma)) {
                        this.#consume(TokenTypes.TK_coma);
                    } else if (this.#match(TokenTypes.TK_punto_coma)) {
                        this.#consume(TokenTypes.TK_punto_coma);
                    }
                    
                    this.#skipOptionalSemicolons();
                    
                } catch (error) {
                    this.#addError(`Error procesando equipo: ${error.message}`);
                    this.#saltarHastaProximoEquipoOCierre();
                }
            } else {
                this.#addError(`Se esperaba 'equipo', se encontrado '${this.#currentToken?.lexeme}'`);
                this.#saltarHastaProximoEquipoOCierre();
            }
        }
    }

    #saltarHastaProximoEquipoOCierre() {
        while (!this.#match(TokenTypes.EOF) && 
               !this.#match(TokenTypes.KW_equipo) && 
               !this.#match(TokenTypes.TK_llave_der)) {
            this.#avanzarToken();
        }
        this.#skipOptionalSemicolons();
    }

    #DEFINICION_EQUIPO() {
        this.#consume(TokenTypes.KW_equipo);
        this.#consume(TokenTypes.TK_dos_puntos);
        const nombreEquipo = this.#consume(TokenTypes.TK_cadena);
        
        try {
            const equipo = new Team(nombreEquipo?.lexeme || '');
            
            // Procesar jugadores si hay corchetes
            if (this.#match(TokenTypes.TK_corchete_izq)) {
                this.#consume(TokenTypes.TK_corchete_izq);
                this.#LISTA_JUGADORES_(equipo);
                this.#consume(TokenTypes.TK_corchete_der);
            }
            
            this.#tournament.addEquipo(equipo);
        } catch (error) {
            this.#addError(`Error creando equipo: ${error.message}`);
        }
    }

    // Lista de jugadores 
    #LISTA_JUGADORES_(equipo) {
        while (!this.#match(TokenTypes.TK_llave_der) && !this.#match(TokenTypes.EOF)) {
            if (this.#match(TokenTypes.KW_jugador)) {
                try {
                    const jugador = this.#DEFINICION_JUGADOR();
                    if (jugador) {
                        equipo.addJugador(jugador);
                    }
                    
                    // Saltar coma opcional
                    if (this.#match(TokenTypes.TK_coma)) {
                        this.#consume(TokenTypes.TK_coma);
                    }
                } catch (error) {
                    this.#addError(`Error procesando jugador: ${error.message}`);
                    this.#saltarHastaProximoJugadorOCierre();
                }
            } else {
                // Token inesperado
                this.#addError(`Se esperaba 'jugador', se encontrado³ '${this.#currentToken?.lexeme}'`);
                this.#saltarHastaProximoJugadorOCierre();
            }
        }
    }

    // Saltar hasta el proximo jugador o cierre
    #saltarHastaProximoJugadorOCierre() {
        while (!this.#match(TokenTypes.EOF) && 
               !this.#match(TokenTypes.KW_jugador) && 
               !this.#match(TokenTypes.TK_llave_der)) {
            this.#avanzarToken();
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
                this.#ATRIBUTOS_JUGADOR_ROBUSTO(jugador);
                this.#consume(TokenTypes.TK_corchete_der);
            }
            
            return jugador;
        } catch (error) {
            this.#addError(`Error creando jugador: ${error.message}`);
            return null;
        }
    }

    // Atributos de jugador
    #ATRIBUTOS_JUGADOR_ROBUSTO(jugador) {
        while (!this.#match(TokenTypes.TK_corchete_der) && !this.#match(TokenTypes.EOF)) {
            try {
                this.#ATRIBUTO_JUGADOR(jugador);
                
                if (this.#match(TokenTypes.TK_coma)) {
                    this.#consume(TokenTypes.TK_coma);
                }
            } catch (error) {
                this.#addError(`Error en atributo de jugador: ${error.message}`);
                this.#saltarHastaProximoAtributoJugadorOCierre();
            }
        }
    }

    // Saltar hasta proximo atributo de jugador
    #saltarHastaProximoAtributoJugadorOCierre() {
        while (!this.#match(TokenTypes.EOF) && 
               !this.#match(TokenTypes.KW_posicion) &&
               !this.#match(TokenTypes.KW_numero) &&
               !this.#match(TokenTypes.KW_edad) &&
               !this.#match(TokenTypes.TK_corchete_der)) {
            this.#avanzarToken();
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
        } else {
            // Atributo no reconocido
            this.#addError(`Atributo de jugador no reconocido: ${this.#currentToken?.lexeme}`);
            this.#avanzarToken();
        }
    }

    
    #SECCION_ELIMINACION() {
        this.#consume(TokenTypes.ELIMINACION);
        this.#consume(TokenTypes.TK_llave_izq);
        this.#LISTA_FASES();
        this.#consume(TokenTypes.TK_llave_der);
    }

    #LISTA_FASES() {
        while (!this.#match(TokenTypes.TK_llave_der) && !this.#match(TokenTypes.EOF)) {
            this.#skipOptionalSemicolons();
            
            if (this.#match(TokenTypes.TK_llave_der) || this.#match(TokenTypes.EOF)) {
                break;
            }
            
            if (this.#match(TokenTypes.KW_cuartos, TokenTypes.KW_semifinal, TokenTypes.KW_final)) {
                try {
                    this.#FASE();
                } catch (error) {
                    this.#addError(`Error procesando fase: ${error.message}`);
                    this.#saltarHastaProximaFaseOCierre();
                }
            } else {
                this.#addError(`Se esperaba fase (cuartos/semifinal/final), se encontrado '${this.#currentToken?.lexeme}'`);
                this.#saltarHastaProximaFaseOCierre();
            }
            
            this.#skipOptional(TokenTypes.TK_coma);
            this.#skipOptional(TokenTypes.TK_punto_coma);
            this.#skipOptionalSemicolons();
        }
    }

    #saltarHastaProximaFaseOCierre() {
        while (!this.#match(TokenTypes.EOF) && 
               !this.#match(TokenTypes.KW_cuartos) && 
               !this.#match(TokenTypes.KW_semifinal) &&
               !this.#match(TokenTypes.KW_final) &&
               !this.#match(TokenTypes.TK_llave_der)) {
            this.#avanzarToken();
        }
        this.#skipOptionalSemicolons();
    }

    #skipOptional(tokenType) {
        if (this.#match(tokenType)) {
            this.#consume(tokenType);
        }
    }

    #skipOptionalSemicolons() {
        while (this.#match(TokenTypes.TK_punto_coma)) {
            this.#consume(TokenTypes.TK_punto_coma);
        }
    }

    // Procesamiento de fase 
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
        } else {
            this.#addError(`Nombre de fase no valido: ${this.#currentToken?.lexeme}`);
            return;
        }
        
        if (nombreFase) {
            this.#consume(TokenTypes.TK_dos_puntos);
            this.#consume(TokenTypes.TK_corchete_izq);
            this.#LISTA_PARTIDOS_(nombreFase);
            this.#consume(TokenTypes.TK_corchete_der);
        }
    }

    // Lista de partidos 
    #LISTA_PARTIDOS_(fase) {
        while (!this.#match(TokenTypes.TK_corchete_der) && !this.#match(TokenTypes.EOF)) {
            if (this.#match(TokenTypes.KW_partido)) {
                try {
                    const partido = this.#PARTIDO();
                    if (partido) {
                        partido.fase = fase;
                        this.#tournament.addPartidoToFase(fase, partido);
                    }
                } catch (error) {
                    this.#addError(`Error procesando partido: ${error.message}`);
                    this.#saltarHastaProximoPartidoOCierre();
                }
            } else {
                // Token inesperado
                this.#addError(`Se esperaba 'partido', se encontro '${this.#currentToken?.lexeme}'`);
                this.#saltarHastaProximoPartidoOCierre();
            }
            
            // Saltar coma opcional
            this.#skipOptional(TokenTypes.TK_coma);
        }
    }

    // Saltar hasta proximo partido o cierre
    #saltarHastaProximoPartidoOCierre() {
        while (!this.#match(TokenTypes.EOF) && 
               !this.#match(TokenTypes.KW_partido) && 
               !this.#match(TokenTypes.TK_corchete_der)) {
            this.#avanzarToken();
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
        } else if (this.#match(TokenTypes.KW_goleadores)) {
            this.#consume(TokenTypes.KW_goleadores);
            this.#consume(TokenTypes.TK_dos_puntos);
            this.#consume(TokenTypes.TK_corchete_izq);
            this.#LISTA_GOLEADORES(partido);
            this.#consume(TokenTypes.TK_corchete_der);
        } else if (this.#match(TokenTypes.KW_goleador)) {
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

    // ===== METODOS AUXILIARES MEJORADOS =====
    
    #match(...types) {
        this.#currentToken = this.#scanner.look_ahead();
        return types.includes(this.#currentToken.type);
    }

    // metodo simple para avanzar token
    #avanzarToken() {
        return this.#scanner.next_token();
    }

    // Consume 
    #consume(...types) {
        if (this.#match(...types)) {
            return this.#scanner.next_token();
        }
        
        // Reportar error pero intentar recuperarse
        this.#addError(`Se esperaba ${types.join(' o ')}, se encontro '${this.#currentToken.lexeme}'`);
        
        // : Si esperamos un delimitador importante, buscar el siguiente
        if (types.includes(TokenTypes.TK_llave_izq) || 
            types.includes(TokenTypes.TK_llave_der) ||
            types.includes(TokenTypes.TK_corchete_izq) ||
            types.includes(TokenTypes.TK_corchete_der)) {
            
            // Buscar el siguiente delimitador vÃ¡lido
            while (!this.#match(TokenTypes.EOF) && !this.#match(...types)) {
                this.#avanzarToken();
            }
            
            if (this.#match(...types)) {
                return this.#avanzarToken();
            }
        }
        
        return null;
    }

    // Sincronizar hasta proximo atributo o cierre
    #saltarHastaProximoAtributoOCierre() {
        while (!this.#match(TokenTypes.EOF) &&
               !this.#match(TokenTypes.KW_nombre) &&
               !this.#match(TokenTypes.KW_sede) &&
               !this.#match(TokenTypes.TK_identificador) &&
               !this.#match(TokenTypes.TK_llave_der) &&
               !this.#match(TokenTypes.TK_coma)) {
            this.#avanzarToken();
        }
    }

    //Sincronizar hasta llave cerrada
    #sincronizarHastaLlaveCerrada() {
        let nivelLlaves = 1; // Ya estamos dentro de una llave abierta
        
        while (!this.#match(TokenTypes.EOF) && nivelLlaves > 0) {
            if (this.#match(TokenTypes.TK_llave_izq)) {
                nivelLlaves++;
            } else if (this.#match(TokenTypes.TK_llave_der)) {
                nivelLlaves--;
            }
            
            if (nivelLlaves > 0) {
                this.#avanzarToken();
            }
        }
        
        // Consumir la llave de cierre si la encontramos
        if (this.#match(TokenTypes.TK_llave_der)) {
            this.#avanzarToken();
        }
    }

    
    #synchronize() {
        this.#avanzarToken();
        
        while (!this.#match(TokenTypes.EOF)) {
            if (this.#match(TokenTypes.TORNEO, TokenTypes.EQUIPOS, TokenTypes.ELIMINACION,
                           TokenTypes.TK_llave_der, TokenTypes.TK_corchete_der)) {
                return;
            }
            this.#avanzarToken();
        }
    }
}