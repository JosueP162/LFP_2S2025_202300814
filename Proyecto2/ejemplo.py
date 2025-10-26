# ==========================================
# Traducido de Java a Python por JavaBridge
# ==========================================
# ADVERTENCIA: Se encontraron 13 error(es)
# El traductor intentó recuperar el código válido
# ERROR LEXICO: Carácter no reconocido: '#' (Línea 7)
# ERROR LEXICO: Carácter no reconocido: '$' (Línea 7)
# ERROR LEXICO: Carácter no reconocido: '@' (Línea 7)
# ERROR LEXICO: Carácter no reconocido: '$' (Línea 7)
# ERROR LEXICO: Carácter no reconocido: '%' (Línea 7)
# ERROR LEXICO: Carácter no reconocido: '#' (Línea 7)
# ERROR LEXICO: Carácter no reconocido: '@' (Línea 7)
# ERROR LEXICO: Carácter no reconocido: '$' (Línea 7)
# ERROR LEXICO: Carácter no reconocido: '@' (Línea 7)
# ERROR LEXICO: Carácter no reconocido: '$' (Línea 7)
# ERROR LEXICO: Carácter no reconocido: '#' (Línea 7)
# ERROR LEXICO: Carácter no reconocido: '@' (Línea 7)
# ERROR SINTACTICO: Sentencia no reconocida (Línea 7)
# Clase original: Ejemplo9

def main():
    i = 1  # Inicialización for
    while (i <= 3):
        print((("Grupo " + i) + ":"))
        j = 1  # Inicialización for
        while (j <= 2):
            print(("  Subgrupo " + j))
            puntaje = ((i * 10) + j)  # Tipo: int
            if (puntaje > 25):
                print(("    Puntaje alto: " + puntaje))
            else:
                print(("    Puntaje normal: " + puntaje))
            j += 1  # Actualización for
        i += 1  # Actualización for

if __name__ == "__main__":
    main()
