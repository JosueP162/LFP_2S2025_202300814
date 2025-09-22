
import TokenTypes from './TokenTypes.js';

export class TourneyScanner {
    #input;
    #position;
    #line;
    #column;
    #currentChar;
    #tokens;
    #reservedWords;
    #currentIndex;

    constructor(input) {
        this.#input = input;
        this.#position = 0;
        this.#line = 1;
        this.#column = 1;
        this.#currentChar = this.#input.charAt(0);
        this.#tokens = [];
        this.#currentIndex = 0;
        
        // FIXED: Use static properties
        this.#reservedWords = new Map([
            ['TORNEO', TokenTypes.TORNEO],
            ['EQUIPOS', TokenTypes.EQUIPOS],
            ['ELIMINACION', TokenTypes.ELIMINACION],
            ['equipo', TokenTypes.KW_equipo],
            ['jugador', TokenTypes.KW_jugador],
            ['partido', TokenTypes.KW_partido],
            ['sede', TokenTypes.KW_sede],
            ['goleadores', TokenTypes.KW_goleadores],
            ['goleador', TokenTypes.KW_goleador],
            ['nombre', TokenTypes.KW_nombre],
            ['posicion', TokenTypes.KW_posicion],
            ['numero', TokenTypes.KW_numero],
            ['edad', TokenTypes.KW_edad],
            ['resultado', TokenTypes.KW_resultado],
            ['minuto', TokenTypes.KW_minuto],
            ['vs', TokenTypes.KW_vs],
            ['cuartos', TokenTypes.KW_cuartos],
            ['semifinal', TokenTypes.KW_semifinal],
            ['final', TokenTypes.KW_final],
            ['PORTERO', TokenTypes.KW_PORTERO],
            ['DEFENSA', TokenTypes.KW_DEFENSA],
            ['MEDIOCAMPO', TokenTypes.KW_MEDIOCAMPO],
            ['DELANTERO', TokenTypes.KW_DELANTERO]
        ]);
    }

    #isLetter(char) {
        if (!char) return false;
        
        const code = char.charCodeAt(0);
        
        if ((code >= 65 && code <= 90) || (code >= 97 && code <= 122)) {
            return true;
        }
        
        if (code === 95) return true;
        
        const acentuados = 'áéíóúÁÉÍÓÚñÑ';
        for (let i = 0; i < acentuados.length; i++) {
            if (char === acentuados.charAt(i)) {
                return true;
            }
        }
        
        return false;
    }

    #isDigit(char) {
        if (!char) return false;
        const code = char.charCodeAt(0);
        return code >= 48 && code <= 57;
    }

    #isAlphaNumeric(char) {
        return this.#isLetter(char) || this.#isDigit(char);
    }

    #isWhitespace(char) {
        if (!char) return false;
        return char === ' ' || 
               char === '\t' || 
               char === '\n' || 
               char === '\r' ||
               char === '\f' ||
               char === '\v';
    }

    #advance() {
        this.#position++;
        if (this.#position >= this.#input.length) {
            this.#currentChar = null;
        } else {
            if (this.#currentChar === '\n') {
                this.#line++;
                this.#column = 1;
            } else {
                this.#column++;
            }
            this.#currentChar = this.#input.charAt(this.#position);
        }
    }

    #peek(offset = 1) {
        const peekPos = this.#position + offset;
        return peekPos < this.#input.length ? this.#input.charAt(peekPos) : null;
    }

    #skipWhitespace() {
        while (this.#currentChar && this.#isWhitespace(this.#currentChar)) {
            this.#advance();
        }
    }

    #readIdentifier() {
        let value = '';
        const startColumn = this.#column;
        
        if (this.#isLetter(this.#currentChar)) {
            value += this.#currentChar;
            this.#advance();
        }
        
        while (this.#currentChar && this.#isAlphaNumeric(this.#currentChar)) {
            value += this.#currentChar;
            this.#advance();
        }
        
        const tokenType = this.#reservedWords.get(value) || TokenTypes.TK_identificador;
        return this.#createToken(value, tokenType, this.#line, startColumn);
    }

    #readNumber() {
        let value = '';
        const startColumn = this.#column;
        
        while (this.#currentChar && this.#isDigit(this.#currentChar)) {
            value += this.#currentChar;
            this.#advance();
        }
        
        if (this.#currentChar === '.' && this.#peek() && this.#isDigit(this.#peek())) {
            value += this.#currentChar;
            this.#advance();
            
            while (this.#currentChar && this.#isDigit(this.#currentChar)) {
                value += this.#currentChar;
                this.#advance();
            }
        }
        
        return this.#createToken(value, TokenTypes.TK_numero, this.#line, startColumn);
    }

    #readString() {
        let value = '';
        const startColumn = this.#column;
        this.#advance(); // Skip opening quote
        
        while (this.#currentChar && this.#currentChar !== '"') {
            if (this.#currentChar === '\n') {
                this.#addError('Cadena sin cerrar - se encontró fin de línea', this.#line, startColumn);
                break;
            }
            
            if (this.#currentChar === '\\' && this.#peek() === '"') {
                value += '"';
                this.#advance();
                this.#advance();
            } else {
                value += this.#currentChar;
                this.#advance();
            }
        }
        
        if (this.#currentChar === '"') {
            this.#advance(); // Skip closing quote
            return this.#createToken(value, TokenTypes.TK_cadena, this.#line, startColumn);
        } else {
            this.#addError('Se esperaba \'"\'', this.#line, this.#column);
            return null;
        }
    }

    #createToken(lexeme, type, line, column) {
        return { lexeme, type, line, column };
    }

    #addError(message, line, column) {
        // FIXED: Use global errors array consistently
        if (!global.errors) {
            global.errors = [];
        }
        global.errors.push({
            numero: global.errors.length + 1,
            descripcion: message,
            linea: line,
            columna: column
        });
    }

    scan() {
        this.#tokens = [];
        // Don't clear global errors here - let the caller manage it
        
        while (this.#currentChar !== null) {
            this.#skipWhitespace();
            
            if (this.#currentChar === null) break;
            
            const startColumn = this.#column;
            
            if (this.#isLetter(this.#currentChar)) {
                const token = this.#readIdentifier();
                if (token) this.#tokens.push(token);
            }
            else if (this.#isDigit(this.#currentChar)) {
                const token = this.#readNumber();
                if (token) this.#tokens.push(token);
            }
            else if (this.#currentChar === '"') {
                const token = this.#readString();
                if (token) this.#tokens.push(token);
            }
            else if (this.#currentChar === '{') {
                this.#tokens.push(this.#createToken('{', TokenTypes.TK_llave_izq, this.#line, startColumn));
                this.#advance();
            }
            else if (this.#currentChar === '}') {
                this.#tokens.push(this.#createToken('}', TokenTypes.TK_llave_der, this.#line, startColumn));
                this.#advance();
            }
            else if (this.#currentChar === '[') {
                this.#tokens.push(this.#createToken('[', TokenTypes.TK_corchete_izq, this.#line, startColumn));
                this.#advance();
            }
            else if (this.#currentChar === ']') {
                this.#tokens.push(this.#createToken(']', TokenTypes.TK_corchete_der, this.#line, startColumn));
                this.#advance();
            }
            else if (this.#currentChar === ':') {
                this.#tokens.push(this.#createToken(':', TokenTypes.TK_dos_puntos, this.#line, startColumn));
                this.#advance();
            }
            else if (this.#currentChar === ',') {
                this.#tokens.push(this.#createToken(',', TokenTypes.TK_coma, this.#line, startColumn));
                this.#advance();
            }
            else {
                this.#addError(`Carácter no reconocido «${this.#currentChar}»`, this.#line, startColumn);
                this.#advance();
            }
        }
        
        this.#tokens.push(this.#createToken('', TokenTypes.EOF, this.#line, this.#column));
        return this.#tokens;
    }

    next_token() {
        if (this.#currentIndex < this.#tokens.length) {
            return this.#tokens[this.#currentIndex++];
        }
        return this.#tokens[this.#tokens.length - 1];
    }

    look_ahead() {
        if (this.#currentIndex < this.#tokens.length) {
            return this.#tokens[this.#currentIndex];
        }
        return this.#tokens[this.#tokens.length - 1];
    }

    getTokens() {
        return [...this.#tokens];
    }

    reset() {
        this.#currentIndex = 0;
    }
}