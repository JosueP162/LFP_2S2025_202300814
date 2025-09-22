class Validator {
    static validarFormatoArchivo(contenido) {
        const lines = contenido.trim().split('\n');
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line === '') continue;
            
            const parts = line.split('|');
            if (parts.length !== 5) {
                return { valido: false, error: `Línea ${i + 1}: Formato incorrecto` };
            }
            
            // Validar IDs numéricos
            if (isNaN(parseInt(parts[0])) || isNaN(parseInt(parts[3]))) {
                return { valido: false, error: `Línea ${i + 1}: Los IDs deben ser números` };
            }
            
            // Validar campo de estrellas
            const estrellas = parts[2];
            if (estrellas.length !== 5) {
                return { valido: false, error: `Línea ${i + 1}: Campo de estrellas debe tener 5 caracteres` };
            }
            
            for (let j = 0; j < estrellas.length; j++) {
                if (estrellas[j] !== 'x' && estrellas[j] !== '0') {
                    return { valido: false, error: `Línea ${i + 1}: Campo de estrellas solo puede contener 'x' y '0'` };
                }
            }
        }
        
        return { valido: true };
    }
}