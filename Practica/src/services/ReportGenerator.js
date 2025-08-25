import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default class ReportGenerator {
    static generateHistoryHtml(calls){
        const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title> Call History Report </title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 20px;
                    background-color: #f4f4f4;
                }
                .container {
                    max-width: 1200px;
                    margin: 0 auto;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                    padding: 20px;
                }
                h1 {
                    color: #2c3e50;
                    text-align: center;
                    margin-bottom: 30px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px 0;
                }
                th, td {
                    padding: 12px;
                    border: 1px solid #ddd;
                    text-align: left;
                }
                th {
                    background-color: #3498db;
                    color: white;
                    font-weight: bold;
                }
                tr:nth-child(even) {
                    background-color: #f2f2f2;
                }
                tr:hover {
                    background-color: #e8f4fd;
                }
                .buena{
                    color: #27ea60;
                    font-weight: bold;
                }
                .media{
                    color: #e3e327;
                    font-weight: bold;
                }
                .mala{
                    color: #e42424ff;
                    font-weight: bold;
                }
                .stars{
                    color: #f1c40f;
                    font-size: 16px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1> Call Center History Calls</h1>
                <table>
                    <thead>
                        <tr>
                            <th>Operator Id</th>
                            <th>Operato's name</th>
                            <th>Client Id</th>
                            <th>Grade</th>
                            <th>rating</th>
                        </tr>
                    </thead> 
                    <tbody>
                        ${calls.map(call => `
                        <tr>
                            <td>${call.operator.id}</td>
                            <td>${call.operator.name}</td>
                            <td>${call.client.id}</td>
                            <td>${call.client.name}</td>
                            <td class ="stars">${'*'.repeat(call.stars)}(${call.stars})</td>
                            <td class ="${call.Score.toLowerCase()}">${call.Score}</td>
                        </tr>    
                        `).join('')}
                    </tbody>
                </table>
                <p><strong>Total Calls:</strong>${calls.length}</p>
                <p><em>Reporte generado el: ${new Date().toLocaleString('es-ES')}</em></p>
            </div>
        </body>
        </html>`;

            return html;
    }
        static generateOperatorsHtml(operators){
        const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title> Clients Report </title>
            <style>
                body{
                    font-family: Arial, sans-serif;
                    margin: 20px;
                    background-color: #f5f5f5f6;
                }
                .container{
                    max-width: 800px;
                    margin: 0 auto;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    padding: 20px;
                }
                h1{
                    color: #2c3e50;
                    text-align: center;
                    margin-bottom: 30px;
                }
                table{
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px 0;
                }
                th, td{
                    padding: 12px;
                    border: 1px solid #ddd;
                    text-align: left;
                }
                th{
                    background-color: #e74c3c;
                    color: white;
                    font-weight: bold;
                }
                tr:nth-child(even){
                    background-color: #f2f2f2;
                }
                tr:hover{
                    background-color: #fdf2f2;
                }
            </style>        
        </head>
        <body>
            <div class="container">
                <h1> Call Center Operators </h1>
                <table>
                    <thead>
                        <tr>
                            <th>Operator Id</th>
                            <th>Operator Name</th>
                            <th>Answered Calls</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${operators.map(operator => `
                        <tr>
                            <td>${operator.id}</td>
                            <td>${operator.name}</td>
                            <td>${operator.answeredCalls}</td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
                <p><strong>Total Operadores:</strong> ${operators.length}</p>
                <p><em>Reporte generado el: ${new Date().toLocaleString('es-ES')}</em></p>
            </div>
        </body>        
        </html>`
            return html;
    }
    static generateClientsHtml(clients){
        const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title> Clients Report </title>
            <style>
                body{
                    font-family: Arial, sans-serif;
                    margin: 20px;
                    background-color: #f5f5f5f6;
                }
                .container{
                    max-width: 800px;
                    margin: 0 auto;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    padding: 20px;
                }
                h1{
                    color: #2c3e50;
                    text-align: center;
                    margin-bottom: 30px;
                }
                table{
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px 0;
                }
                th, td{
                    padding: 12px;
                    border: 1px solid #ddd;
                    text-align: left;
                }
                th{
                    background-color: #e74c3c;
                    color: white;
                    font-weight: bold;
                }
                tr:nth-child(even){
                    background-color: #f2f2f2;
                }
                tr:hover{
                    background-color: #fdf2f2;
                }
            </style>        
        </head>
        <body>
            <div class="container">
                <h1> Call Center Clients </h1>
                <table>
                    <thead>
                        <tr>
                            <th>Client Id</th>
                            <th>Client Name</th> 
                        </tr>
                    </thead>
                    <tbody>
                        ${clients.map(client => `
                        <tr>
                            <td>${client.id}</td>
                            <td>${client.name}</td>
                        </tr>   

                        `).join('')}
                    </tbody>
                </table>
                <p><strong>Total Clients:</strong> ${clients.length}</p>
                <p><em>Reporte generado el: ${new Date().toLocaleString('es-ES')}</em></p>
            </div>
        </body>        
        </html>`
            return html;
    }
    static generatePerformanceHtml(performance){
        const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0'>
            <title> Operators Performance Report </title>
            <style>
                body{
                    font-family: Arial, sans-serif;
                    margin: 20px;
                    background-color: #f5f5f5f6;
                }
                .container{
                    max-width: 800px;
                    margin: 0 auto;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    padding: 20px;
                }
                h1{
                    color: #2c3e50;
                    text-align: center;
                    margin-bottom: 30px;
                }
                table{
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px 0;
                }
                th, td{
                    padding: 12px;
                    border: 1px solid #ddd;
                    text-align: left;
                }
                th{
                    background-color: #e74c3c;
                    color: white;
                    font-weight: bold;
                }
                tr:nth-child(even){
                    background-color: #f2f2f2;
                }
                tr:hover{
                    background-color: #f8f4fd;
                }
                .percentage{
                    font-weight: bold;
                    text-align: center;
                }
                .alto{
                    color: #27ea60;
                    font-weight: bold;
                }
                .medio{
                    color: #e3e327;
                    font-weight: bold;
                }
                .bajo{
                    color: #e42424ff;
                    font-weight: bold;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1> call Center Operators Performance </h1>
                <table>
                    <thead>
                        <tr>
                            <th>Operator Id</th>
                            <th>Operator Name</th>
                            <th>Answered Calls</th>
                            <th>Performance Percentage</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${performance.map(operator => `
                        <tr>
                            <td>${operator.id}</td>
                            <td>${operator.name}</td>
                            <td>${operator.answeredCalls}</td>
                            <td class="percentage ${operator.percentage >= 60 ? 'alto' : operator.percentage >= 30 ? 'medio' : 'bajo'}">${operator.percentage}%</td>    
                        `).join('')}
                    </tbody>
                </table>
                <p><strong>Total Operadores:</strong> ${performance.length}</p>
                <p><em>Reporte generado el: ${new Date().toLocaleString('es-ES')}</em></p>
            </div>
        </body>
        </html>
        `
            return html;
    }
    static exportHtmlReport(filename, htmlContent){
        const reportsDir = join(__dirname, '..', 'reports');
        if(!existsSync(reportsDir)){
            mkdirSync(reportsDir);
        }

        const filePath = join(reportsDir, filename);
        writeFileSync(filePath, htmlContent, 'utf-8');
        console.log(`Report saved to ${filePath}`);
        return filePath;
    }

}