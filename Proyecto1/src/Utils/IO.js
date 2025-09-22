export class IO {
    #rl;
    #isOpen;
    #defaultEncoding;

    constructor(encoding = 'utf-8') {
        if (typeof window !== 'undefined') {
            this.#isOpen = true;
            this.#defaultEncoding = encoding;
            return;
        }
        
        const readline = require('readline');
        const { stdin, stdout } = require('process');
        
        this.#rl = readline.createInterface({ input: stdin, output: stdout });
        this.#isOpen = true;
        this.#defaultEncoding = encoding;
    }

    readInput = async (msg, validator = null) => {
        if (!this.#isOpen) {
            throw new Error('IO interface is closed');
        }

        if (typeof window !== 'undefined') {
            return new Promise((resolve) => {
                const input = prompt(msg);
                if (validator && !validator(input)) {
                    alert('Entrada inválida. Intente nuevamente.');
                    return this.readInput(msg, validator).then(resolve);
                }
                resolve(input || '');
            });
        }

        return new Promise((resolve) => {
            const askQuestion = () => {
                this.#rl.question(`${msg}`, (input) => {
                    if (validator && !validator(input)) {
                        console.log('Entrada inválida. Intente nuevamente.');
                        askQuestion();
                        return;
                    }
                    resolve(input);
                });
            };
            askQuestion();
        });
    }

    readFile = (filePath, encoding = null) => {
        if (typeof window !== 'undefined' && window.fs) {
            try {
                const finalEncoding = encoding || this.#defaultEncoding;
                const content = window.fs.readFileSync(filePath, { encoding: finalEncoding });
                return [content, null];
            } catch (error) {
                return [null, error];
            }
        }
        
        const fs = require('fs');
        const finalEncoding = encoding || this.#defaultEncoding;
        
        try {
            if (!this.#validateFilePath(filePath)) {
                return [null, new Error('Ruta de archivo inválida')];
            }

            const content = fs.readFileSync(filePath, finalEncoding);
            return [content, null];
            
        } catch (error) {
            return [null, error];
        }
    }

    #validateFilePath(filePath) {
        if (typeof filePath !== 'string' || filePath.length === 0) {
            return false;
        }
        
        for (let i = 0; i < filePath.length; i++) {
            const char = filePath.charAt(i);
            const isValid = (char >= 'a' && char <= 'z') ||
                           (char >= 'A' && char <= 'Z') ||
                           (char >= '0' && char <= '9') ||
                           char === '.' || char === '_' ||
                           char === '-' || char === '/' ||
                           char === '\\' || char === ':';
            
            if (!isValid) {
                return false;
            }
        }
        
        return true;
    }

    close = () => {
        if (this.#isOpen) {
            if (this.#rl) {
                this.#rl.close();
            }
            this.#isOpen = false;
        }
    }
}
