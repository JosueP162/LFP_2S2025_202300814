import readline from 'readline';
import CallCenterManager from '../services/CallCenterManager.js';
import FileReader from '../services/FileReader.js';
import ReportGenerator from '../services/ReportGenerator.js';

export default class MenuManager {
    constructor() {
        this.callCenterManager = new CallCenterManager(); // Fixed: was "CallCenterManager"
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    showMenu() {
        console.clear();
        console.log('\n--- Call Center Management ---');
        console.log('1. Load Call Data from File');
        console.log('2. Export call history report');
        console.log('3. Export list of Operators');
        console.log('4. Export list of Clients');
        console.log('5. Export Operators Performance Report');
        console.log('6. Display call califications operators');
        console.log('7. Display count of calls per calification');
        console.log('8. Exit');
    }

    async start() {
        let running = true;
        
        while (running) {
            this.showMenu();
            const choice = await this.question('Select an option: ');

            try {
                switch (choice.trim()) {
                    case '1':
                        await this.loadCallDataFromFile();
                        break;
                    case '2':
                        await this.exportCallHistoryReport();
                        break;
                    case '3':
                        await this.exportOperatorsList();
                        break;
                    case '4':
                        await this.exportClientsList();
                        break;
                    case '5':
                        await this.exportOperatorsPerformanceReport();
                        break;
                    case '6':
                        await this.displayCallCalificationsOperators();
                        break;
                    case '7':
                        await this.displayCountCallPerCalification();
                        break;
                    case '8':
                        console.log('\n Terminating Program...');
                        running = false;
                        break;
                    default:
                        console.log('\nInvalid Option, please select 1,2,3,4,5,6,7,8');
                }
                
                // Add pause after each action except exit
                if (choice.trim() !== '8') {
                    await this.question('\nPress Enter to continue...');
                }
            } catch (err) {
                console.error(`\nError: ${err.message}`);
                await this.question('\nPress Enter to continue...');
            }
        }
        
        this.rl.close();
    }

    async loadCallDataFromFile() {
        console.log('\n=== Load Data From File ===');
        
        const pathFile = await this.question('Enter file path: ');
        try {
            const content = FileReader.readFileSync(pathFile.trim());
            const records = FileReader.parseCallRecords(content);
            this.callCenterManager.loadRecords(records);
            console.log('✅ Data loaded successfully!');
        } catch (err) {
            throw new Error(`Could not load file: ${err.message}`);
        }
    }

    async exportCallHistoryReport() {
        this.validateData();
        console.log('\n=== Export Call History Report ===');

        const calls = this.callCenterManager.getCalls();
        const html = ReportGenerator.generateHistoryHtml(calls);
        ReportGenerator.exportHtmlReport('historial_llamadas.html', html);
        console.log('✅ Call history report exported successfully!');
    }

    async exportClientsList() {
        this.validateData();
        console.log('\n=== Export Clients List Report ===');

        const clients = this.callCenterManager.getClients();
        const html = ReportGenerator.generateClientsHtml(clients);
        ReportGenerator.exportHtmlReport('lista_clients.html', html);
        console.log('✅ Clients list report exported successfully!');
    }

    async exportOperatorsList() {
        this.validateData();
        console.log('\n=== Export Operators List Report ===');

        const operators = this.callCenterManager.getOperators();
        const html = ReportGenerator.generateOperatorsHtml(operators);
        ReportGenerator.exportHtmlReport('lista_operadores.html', html);
        console.log('✅ Operators list report exported successfully!');
    }

    async exportOperatorsPerformanceReport() {
        this.validateData();
        console.log('\n=== Export Operators Performance Report ===');

        const performance = this.callCenterManager.calculatePerformanceOperators();
        const html = ReportGenerator.generatePerformanceHtml(performance);
        ReportGenerator.exportHtmlReport('rendimiento_operadores.html', html);
        console.log('✅ Operators performance report exported successfully!');
    }

    async displayCallCalificationsOperators() {
        this.validateData();
        console.log('\n=== Call Qualification Percentage ===');

        const percentage = this.callCenterManager.calculateGradePercentage();
        console.log(`📞 Llamadas Buenas (4-5 ⭐): ${percentage.Buenas}%`);
        console.log(`📞 Llamadas Medias (2-3 ⭐): ${percentage.Medias}%`);
        console.log(`📞 Llamadas Malas (0-1 ⭐): ${percentage.Malas}%`);
        console.log(`📊 Total: ${(parseFloat(percentage.Buenas) + parseFloat(percentage.Medias) + parseFloat(percentage.Malas)).toFixed(2)}%`);
    }

    async displayCountCallPerCalification() {
        this.validateData();
        console.log('\n=== Count Calls Per Qualification ===');

        const counts = this.callCenterManager.calculateCallsByGrade();
        const total = Object.values(counts).reduce((sum, count) => sum + count, 0);

        for (let i = 1; i <= 5; i++) {
            const estrellas = '⭐'.repeat(i);
            const percentage = total > 0 ? ((counts[i] / total) * 100).toFixed(1) : 0;
            console.log(`${estrellas} (${i} estrella${i > 1 ? 's' : ''}): ${counts[i]} llamadas (${percentage}%)`);
        }
        console.log(`\n📊 Total de llamadas: ${total}`);
    }

    validateData() {
        if (this.callCenterManager.getCalls().length === 0) { // Fixed typo
            throw new Error('No hay datos cargados, primero cargue datos al sistema');
        }
    }

    question(text) {
        return new Promise(resolve => {
            this.rl.question(text, resolve);
        });
    }
}