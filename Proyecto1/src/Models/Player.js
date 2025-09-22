export class Player {
    #nombre;
    #posicion;
    #numero;
    #edad;
    #equipo;
    #goles;

    constructor(nombre) {
        this.#nombre = nombre;
        this.#posicion = '';
        this.#numero = 0;
        this.#edad = 0;
        this.#equipo = '';
        this.#goles = [];
    }

    get nombre() { return this.#nombre; }
    get posicion() { return this.#posicion; }
    get numero() { return this.#numero; }
    get edad() { return this.#edad; }
    get equipo() { return this.#equipo; }
    get goles() { return [...this.#goles]; }

    set posicion(valor) {
        if (!valor) {
            this.#posicion = '';
            return;
        }
        
        if (valor === 'PORTERO' || 
            valor === 'DEFENSA' || 
            valor === 'MEDIOCAMPO' || 
            valor === 'DELANTERO') {
            this.#posicion = valor;
        } else {
            throw new Error('Posición no válida. Debe ser: PORTERO, DEFENSA, MEDIOCAMPO o DELANTERO');
        }
    }

    set numero(valor) {
        if (!Number.isInteger(valor) || valor < 0 || valor > 99) {
            throw new Error('El número debe ser un entero entre 0 y 99');
        }
        this.#numero = valor;
    }

    set edad(valor) {
        if (!Number.isInteger(valor) || valor < 15 || valor > 50) {
            throw new Error('La edad debe ser un entero entre 15 y 50 años');
        }
        this.#edad = valor;
    }

    setEquipo(nombreEquipo) {
        this.#equipo = nombreEquipo;
    }

    addGol(minuto) {
        this.#goles.push({ minuto: minuto || 0 });
    }

    getTotalGoles() {
        return this.#goles.length;
    }
}