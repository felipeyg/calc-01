// Código principal da aplicação

document.addEventListener('DOMContentLoaded', function() {
    const calculator = new InvestmentCalculator();
    
    // Elementos da interface
    const addPeriodBtn = document.getElementById('add-period');
    const calculateBtn = document.getElementById('calculate');
    const resetBtn = document.getElementById('reset');
    const exportDataBtn = document.getElementById('export-data');
    const periodsTable = document.getElementById('periods-table').getElementsByTagName('tbody')[0];
    const resultSection = document.getElementById('result');
    const detailedResultsDiv = document.getElementById('detailed-results');
    const monthlyTable = document.getElementById('monthly-table').getElementsByTagName('tbody')[0];
    const totalAmountElement = document.getElementById('total-amount');
    const totalInvestedElement = document.getElementById('total-invested');
    const totalInterestElement = document.getElementById('total-interest');
    const profitabilityElement = document.getElementById('profitability');
    
    // Adicionar período
    addPeriodBtn.addEventListener('click', function() {
        const monthlyInvestment = parseFloat(document.getElementById('monthly-investment').value);
        const interestRate = parseFloat(document.getElementById('interest-rate').value);
        const duration = parseInt(document.getElementById('duration').value);
        
        if (!isValidNumber(monthlyInvestment) || !isValidNumber(interestRate) || !isValidNumber(duration)) {
            showError('Por favor, preencha todos os campos com valores válidos.');
            return;
        }
        
        // Adicionar período à calculadora
        calculator.addPeriod(monthlyInvestment, interestRate, duration);
        
        // Adicionar linha na tabela
        const row = periodsTable.insertRow();
        row.innerHTML = `
            <td>${formatCurrency(monthlyInvestment)}</td>
            <td>${interestRate}%</td>
            <td>${duration}</td>
            <td><button class="btn-remove">Remover</button></td>
        `;
        
        // Adicionar evento de remoção
        row.querySelector('.btn-remove').addEventListener('click', function() {
            const rowIndex = row.rowIndex - 1;
            if (calculator.removePeriod(rowIndex)) {
                periodsTable.deleteRow(rowIndex);
            }
        });
        
        // Limpar campos de entrada
        document.getElementById('monthly-investment').value = '';
        document.getElementById('interest-rate').value = '';
        document.getElementById('duration').value = '';
    });
    
    // Calcular montante final
    calculateBtn.addEventListener('click', function() {
        if (calculator.getPeriods().length === 0) {
            showError('Adicione pelo menos um período de investimento.');
            return;
        }
        
        const result = calculator.calculate();
        
        // Exibir resultado
        totalAmountElement.textContent = formatCurrency(result.totalAmount);
        totalInvestedElement.textContent = formatCurrency(result.totalInvested);
        totalInterestElement.textContent = formatCurrency(result.totalInterest);
        profitabilityElement.textContent = `${result.profitability.toFixed(2)}%`;
        
        resultSection.style.display = 'block';
        detailedResultsDiv.style.display = 'block';
        
        // Preencher tabela mensal
        monthlyTable.innerHTML = '';
        result.monthlyData.forEach(data => {
            const row = monthlyTable.insertRow();
            // Destacar a cada 12 meses
            if (data.month % 12 === 0) {
                row.classList.add('highlight');
            }
            
            row.innerHTML = `
                <td>${data.month}</td>
                <td>${formatCurrency(data.monthlyInvestment)}</td>
                <td>${formatCurrency(data.monthlyInterest)}</td>
                <td>${formatCurrency(data.totalInvested)}</td>
                <td>${formatCurrency(data.totalInterest)}</td>
                <td>${formatCurrency(data.accumulatedAmount)}</td>
            `;
        });
        
        // Rolar para o resultado
        resultSection.scrollIntoView({ behavior: 'smooth' });
    });
    
    // Exportar dados para CSV
    exportDataBtn.addEventListener('click', function() {
        const monthlyData = calculator.getMonthlyData();
        
        if (monthlyData.length === 0) {
            showError('Não há dados para exportar.');
            return;
        }
        
        let csvContent = "Mês,Aporte no Mês,Juros Obtidos,Total Investido,Total em Juros,Montante Acumulado\n";
        
        monthlyData.forEach(data => {
            csvContent += `${data.month},${data.monthlyInvestment},${data.monthlyInterest},${data.totalInvested},${data.totalInterest},${data.accumulatedAmount}\n`;
        });
        
        const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "evolucao_investimento.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
    
    // Limpar tudo
    resetBtn.addEventListener('click', function() {
        calculator.clearPeriods();
        periodsTable.innerHTML = '';
        monthlyTable.innerHTML = '';
        resultSection.style.display = 'none';
        detailedResultsDiv.style.display = 'none';
        
        document.getElementById('monthly-investment').value = '';
        document.getElementById('interest-rate').value = '';
        document.getElementById('duration').value = '';
    });
});