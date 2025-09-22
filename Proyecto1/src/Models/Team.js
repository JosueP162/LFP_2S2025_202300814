// Team.js - Fixed version
import { Player } from './Player.js';
export class Team {
    #nombre;
    #jugadores;
    #estadisticas;

    constructor(nombre) {
        this.#nombre = nombre;
        this.#jugadores = [];
        this.#estadisticas = {
            partidos: 0,
            ganados: 0,
            perdidos: 0,
            golesFavor: 0,
            golesContra: 0,
            diferencia: 0,
            faseAlcanzada: 'Cuartos'
        };
    }

    get nombre() { return this.#nombre; }
    get jugadores() { return [...this.#jugadores]; }
    get estadisticas() { return { ...this.#estadisticas }; }

    addJugador(jugador) {
        if (!(jugador instanceof Player)) {
            throw new Error('Debe ser una instancia de Player');
        }
        this.#jugadores.push(jugador);
        jugador.setEquipo(this.#nombre);
    }

    updateEstadisticas(partidos, ganados, perdidos, golesFavor, golesContra) {
        this.#estadisticas.partidos = partidos;
        this.#estadisticas.ganados = ganados;
        this.#estadisticas.perdidos = perdidos;
        this.#estadisticas.golesFavor = golesFavor;
        this.#estadisticas.golesContra = golesContra;
        this.#estadisticas.diferencia = golesFavor - golesContra;
    }

    setFaseAlcanzada(fase) {
        this.#estadisticas.faseAlcanzada = fase;
    }
}