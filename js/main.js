// Código principal da aplicação

document.addEventListener('DOMContentLoaded', function() {
    const calculator = new InvestmentCalculator();
    
    // Elementos da interface
    const addPeriodBtn = document.getElementById('add-period');
    const calculateBtn = document.getElementById('calculate');
    const resetBtn = document.getElementById('reset');
    const periodsTable = document.getElementById('periods-table').getElementsByTagName('tbody')[0];
    const resultSection = document.getElementById('result');
    const resultValue = document.querySelector('.result-value');
    const totalInvestedElement = document.getElementById('total-invested');
    const totalInterestElement = document.getElementById('total-interest');
    
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
        resultValue.textContent = formatCurrency(result.totalAmount);
        totalInvestedElement.textContent = formatCurrency(result.totalInvested);
        totalInterestElement.textContent = formatCurrency(result.totalInterest);
        
        resultSection.style.display = 'block';
        resultSection.scrollIntoView({ behavior: 'smooth' });
    });
    
    // Limpar tudo
    resetBtn.addEventListener('click', function() {
        calculator.clearPeriods();
        periodsTable.innerHTML = '';
        resultSection.style.display = 'none';
        
        document.getElementById('monthly-investment').value = '';
        document.getElementById('interest-rate').value = '';
        document.getElementById('duration').value = '';
    });
});