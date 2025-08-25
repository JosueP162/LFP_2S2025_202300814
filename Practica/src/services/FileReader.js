import { readFileSync } from 'fs';
export default class FileReader {
    static readFileSync(filepath){
        try {
            return readFileSync(filepath, 'utf8');
        } catch (err) {
            throw new Error(`Error reading file at ${filepath}: ${err.message}`);
        }
    }
    static parseCallRecords(content){
        const lines = content.split('\n');
        const records = [];
        for(let i = 0; i < lines.length; i++){
            const line = lines[i].trim();
            if(line === '') continue;
            const parts = line.split(',');
            if(parts.length !== 5){
                throw new Error(`Invalid record format at line ${i + 1}`);
            }
            const [operatorId, operatorName, starsStr, clientId, clientName] = parts;

            const parsedOperatorId = parseInt(operatorId.trim());
            const parsedClientId = parseInt(clientId.trim());

            if(isNaN(parsedOperatorId) || isNaN(parsedClientId)){
                throw new Error(`Invalid ID format at line ${i + 1} - IDs must be numeric`);
            }
            const stars = FileReader.countStars(starsStr.trim());

            records.push({
                operatorId: parsedOperatorId,
                operatorName: operatorName.trim(),
                stars: stars,
                clientId: parsedClientId,
                clientName: clientName.trim()
            })

        }
        return records;
    }

    static countStars(starsStr){
        const stars = starsStr.split(';');
        if(stars.length !== 5){
            throw new Error(`Invalid stars format: ${starsStr} - Must contain exactly 5 character per star`);
        }    
        let count = 0;
        for(let i=0; i < stars.length; i++){
            if(stars[i] === 'x'){
                count++; 
            }
            else if(stars[i] !== '0'){
                throw new Error(`Invalid character in stars format: ${starsStr} - Only 'x' and '0' are allowed`);
            }
        }   
        return count;
    }
    
}