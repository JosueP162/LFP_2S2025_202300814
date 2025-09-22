import { Team } from './Team.js';
export class Tournament {
    #nombre;
    #cantidadEquipos;
    #equipos;
    #fases;
    #estadisticas;
    #sede

    constructor() {
        this.#nombre = '';
        this.#sede = '';
        this.#cantidadEquipos = 0;
        this.#equipos = [];
        this.#fases = {
            cuartos: [],
            semifinal: [],
            final: []
        };
        this.#estadisticas = null;
    }

    get nombre() { return this.#nombre; }
    get cantidadEquipos() { return this.#cantidadEquipos; }
    get equipos() { return [...this.#equipos]; }
    get fases() { return { ...this.#fases }; }
    get estadisticas() { return this.#estadisticas; }
    get sede() { return this.#sede; }  

    set sede(valor) {  
    if (typeof valor !== 'string') {
        throw new Error('La sede debe ser una cadena');
    }
    this.#sede = valor.trim();
    }

    set nombre(valor) {
        if (typeof valor !== 'string' || valor.trim().length === 0) {
            throw new Error('El nombre del torneo debe ser una cadena no vacía');
        }
        this.#nombre = valor.trim();
    }

    set cantidadEquipos(valor) {
        if (!Number.isInteger(valor) || valor < 2) {
            throw new Error('La cantidad de equipos debe ser un entero mayor a 1');
        }
        this.#cantidadEquipos = valor;
    }

    addEquipo(equipo) {
        if (!(equipo instanceof Team)) {
            throw new Error('Debe ser una instancia de Team');
        }
        this.#equipos.push(equipo);
    }

    getEquipoByNombre(nombre) {
        return this.#equipos.find(equipo => equipo.nombre === nombre) || null;
    }

    addPartidoToFase(fase, partido) {
        if (!['cuartos', 'semifinal', 'final'].includes(fase)) {
            throw new Error('Fase no válida');
        }
        this.#fases[fase].push(partido);
    }

    getAllMatches() {
        const allMatches = [];
        for (const fase of ['cuartos', 'semifinal', 'final']) {
            const partidos = this.#fases[fase] || [];
            for (const partido of partidos) {
                allMatches.push(partido);
            }
        }
        return allMatches;
    }
}
