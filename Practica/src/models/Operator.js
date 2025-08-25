export default class Operator {

    constructor(id, name,answeredCalls) {
        this.id = parseInt(id);
        this.name = name;
        this.answeredCalls = 0;
    }

    incrementAnsweredCalls() {
        this.answeredCalls ++;
    }
}   