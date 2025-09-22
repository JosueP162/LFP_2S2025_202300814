export default class Calls{
    constructor(client,operator,stars){
        this.client = client;
        this.operator = operator;
        this.stars = stars;
        this.Score = this.calculateScore(); 
    }

    calculateScore(){
        if(this.stars >=4) return "Buena";
        if(this.stars >= 2) return "Media";
        return "Mala";
    }
}