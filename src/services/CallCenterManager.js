import Call from '../models/Call.js';
import Client from '../models/Client.js';
import Operator from '../models/Operator.js';

export default class CallCenterManager {
    constructor() {
        this.operators = new Map();
        this.clients = new Map();
        this.calls = [];
    }
    loadRecords(records) {
        this.operators.clear();
        this.clients.clear();
        this.calls = [];

        for (const record of records) {
            let operator = this.operators.get(record.operatorId);
            if (!operator) {
                operator = new Operator(record.operatorId, record.operatorName);
                this.operators.set(record.operatorId, operator);
                console.log('Creating operator with ID:', record.operatorId, typeof record.operatorId);

            }
            let client = this.clients.get(record.clientId);
            if (!client) {
                client = new Client(record.clientId, record.clientName);
                this.clients.set(record.clientId, client);
            }
            const call = new Call(client,operator, record.stars)
            this.calls.push(call);
            operator.incrementAnsweredCalls();
        }
        console.log(`\n calls loaded ${this.calls.length} succed `);
        console.log(`\n operators loaded ${this.operators.size} succed `);
        console.log(`\n clients loaded ${this.clients.size} succed `);
    }

    getOperators() {   
        return Array.from(this.operators.values());
    }
    getClients() {
        return Array.from(this.clients.values());
    }
    getCalls() {
        return this.calls;
    }

    calculatePerformanceOperators(){
        const totalcalls = this.calls.length;
        return this.getOperators().map(operator => ({
            ...operator,
            percentage : totalcalls > 0 ? ((operator.answeredCalls / totalcalls) * 100).toFixed(2) : 0
        }));
        
    }
    calculateGradePercentage(){
        const total = this.calls.length;
        if(total === 0) return {Buenas:0, Medias:0, Malas:0};

        const buenas = this.calls.filter(l => l.Score === "buena").length;
        const medias = this.calls.filter(l => l.Score === "media").length;
        const malas = this.calls.filter(l => l.Score === "mala").length;

        return {
            Buenas: ((buenas / total) * 100).toFixed(2),
            Medias: ((medias / total) * 100).toFixed(2),
            Malas: ((malas / total) * 100).toFixed(2)
        };

    }
    calculateCallsByGrade(){
        const counts = {1:0, 2:0, 3:0, 4:0, 5:0};
        this.calls.forEach(call => {
            if(call.stars >=1 && call.stars <=5){
                counts[call.stars]++;
            }
        });
        return counts;
    }
}