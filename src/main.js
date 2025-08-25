import MenuManager from './utils/MenuManager.js';

export class CallCenterApp {
    static async main() {
        console.log('🚀 Iniciando Simulador de CallCenter...\n');
        
        const menuManager = new MenuManager();
        
        try {
            await menuManager.start();
        } catch (error) {
            console.error('Error fatal:', error.message);
            process.exit(1);
        }
    }
}

// Execute the main function
CallCenterApp.main();