export class Match {
    #equipo1;
    #equipo2;
    #resultado;
    #goleadores;
    #ganador;
    #fase;
    #completado;

    constructor() {
        this.#equipo1 = '';
        this.#equipo2 = '';
        this.#resultado = '';
        this.#goleadores = [];
        this.#ganador = '';
        this.#fase = '';
        this.#completado = false;
    }

    get equipo1() { return this.#equipo1; }
    get equipo2() { return this.#equipo2; }
    get resultado() { return this.#resultado; }
    get ganador() { return this.#ganador; }
    get fase() { return this.#fase; }
    get completado() { return this.#completado; }
    get goleadores() { return [...this.#goleadores]; }

    set equipo1(nombre) {
        if (typeof nombre !== 'string' || nombre.length === 0) {
            throw new Error('El nombre del equipo debe ser una cadena no vacía');
        }
        this.#equipo1 = nombre;
    }

    set equipo2(nombre) {
        if (typeof nombre !== 'string' || nombre.length === 0) {
            throw new Error('El nombre del equipo debe ser una cadena no vacía');
        }
        if (nombre === this.#equipo1) {
            throw new Error('Un equipo no puede jugar contra sí mismo');
        }
        this.#equipo2 = nombre;
    }

    set resultado(valor) {
    if (typeof valor !== 'string') {
        valor = ''; // Valor por defecto en lugar de error
    }
    
    this.#resultado = valor;
    
    // Solo validar formato si no es vacío o "Pendiente"
    if (valor && valor.toLowerCase() !== 'pendiente' && valor.trim() !== '') {
        if (!this.#validateResultFormat(valor)) {
            // No lanzar error, solo asignar valor por defecto
            this.#resultado = 'Pendiente';
        } else {
            this.#determinarGanador();
            this.#completado = true;
        }
    }
}

    set fase(valor) {
        if (!valor) {
            this.#fase = '';
            return;
        }
        
        if (valor === 'cuartos' || valor === 'semifinal' || valor === 'final') {
            this.#fase = valor;
        } else {
            throw new Error('Fase no válida. Debe ser: cuartos, semifinal o final');
        }
    }

    addGoleador(jugador, minuto) {
        this.#goleadores.push({
            jugador: jugador,
            minuto: minuto || 0
        });
    }

    getGolesEquipo1() {
        if (!this.#resultado) return 0;
        
        let dashPos = -1;
        for (let i = 0; i < this.#resultado.length; i++) {
            if (this.#resultado.charAt(i) === '-') {
                dashPos = i;
                break;
            }
        }
        
        if (dashPos === -1) return 0;
        
        let golesStr = '';
        for (let i = 0; i < dashPos; i++) {
            golesStr += this.#resultado.charAt(i);
        }
        
        return parseInt(golesStr) || 0;
    }

    getGolesEquipo2() {
        if (!this.#resultado) return 0;
        
        let dashPos = -1;
        for (let i = 0; i < this.#resultado.length; i++) {
            if (this.#resultado.charAt(i) === '-') {
                dashPos = i;
                break;
            }
        }
        
        if (dashPos === -1) return 0;
        
        let golesStr = '';
        for (let i = dashPos + 1; i < this.#resultado.length; i++) {
            golesStr += this.#resultado.charAt(i);
        }
        
        return parseInt(golesStr) || 0;
    }

    #validateResultFormat(valor) {
        if (!valor || valor.length < 3) return false;
        
        let dashFound = false;
        let dashPosition = -1;
        
        for (let i = 0; i < valor.length; i++) {
            if (valor.charAt(i) === '-') {
                if (dashFound) return false;
                dashFound = true;
                dashPosition = i;
            }
        }
        
        if (!dashFound || dashPosition === 0 || dashPosition === valor.length - 1) {
            return false;
        }
        
        for (let i = 0; i < dashPosition; i++) {
            const char = valor.charAt(i);
            if (char < '0' || char > '9') {
                return false;
            }
        }
        
        for (let i = dashPosition + 1; i < valor.length; i++) {
            const char = valor.charAt(i);
            if (char < '0' || char > '9') {
                return false;
            }
        }
        
        return true;
    }

    #determinarGanador() {
    if (!this.#resultado || this.#resultado.toLowerCase() === 'pendiente') {
        this.#ganador = '';
        return;
    }
    
    const goles1 = this.getGolesEquipo1();
    const goles2 = this.getGolesEquipo2();
    
    if (goles1 > goles2) {
        this.#ganador = this.#equipo1;
    } else if (goles2 > goles1) {
        this.#ganador = this.#equipo2;
    } else {
        this.#ganador = 'Empate';
    }
}
}
