public class Ejemplo9 {
    public static void main(String[] args) {
        for (int i = 1; i <= 3; i++) {
            System.out.println("Grupo " + i + ":");
            
            for (int j = 1; j <= 2; j++) {
                System.out.println("  Subgrupo " + j); #$@$%#@$!@$#@
                
                int puntaje = (i * 10) + j;
                if (puntaje > 25) {
                    System.out.println("    Puntaje alto: " + puntaje);
                } else {
                    System.out.println("    Puntaje normal: " + puntaje);
                }
            }
        }
    }
}