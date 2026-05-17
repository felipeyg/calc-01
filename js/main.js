document.addEventListener('DOMContentLoaded', function() {
    const calculator = new InvestmentCalculator();
    
    const initialCapitalInput = document.getElementById('initial-capital');
    const addPeriodBtn = document.getElementById('add-period');
    const calculateBtn = document.getElementById('calculate');
    const resetBtn = document.getElementById('reset');
    const periodsTable = document.getElementById('periods-table').getElementsByTagName('tbody')[0];
    const resultSection = document.getElementById('result');
    const detailedResultsDiv = document.getElementById('detailed-results');
    const monthlyTable = document.getElementById('monthly-table').getElementsByTagName('tbody')[0];
    const initialCapitalResultElement = document.getElementById('initial-capital-result');
    const totalAmountElement = document.getElementById('total-amount');
    const totalInvestedElement = document.getElementById('total-invested');
    const totalInterestElement = document.getElementById('total-interest');
    const profitabilityElement = document.getElementById('profitability');
    
    addPeriodBtn.addEventListener('click', function() {
        const monthlyInvestment = parseBrazilianNumber(document.getElementById('monthly-investment').value);
        const interestRate = parseBrazilianNumber(document.getElementById('interest-rate').value);
        const durationValue = document.getElementById('duration').value;
        const duration = Number(durationValue);
        
        if (
            !isValidNonNegativeNumber(monthlyInvestment) ||
            !isValidNonNegativeNumber(interestRate) ||
            !Number.isInteger(duration) ||
            duration <= 0
        ) {
            showError('Aporte e taxa devem ser maiores ou iguais a zero. A duração deve ser um número inteiro maior que zero.');
            return;
        }
        
        calculator.addPeriod(monthlyInvestment, interestRate, duration);
        
        const row = periodsTable.insertRow();
        row.innerHTML = `
            <td>${formatCurrency(monthlyInvestment)}</td>
            <td>${interestRate}%</td>
            <td>${duration}</td>
            <td><button class="btn-remove">Remover</button></td>
        `;
        
        row.querySelector('.btn-remove').addEventListener('click', function() {
            const rowIndex = row.rowIndex - 1;
            if (calculator.removePeriod(rowIndex)) {
                periodsTable.deleteRow(rowIndex);
            }
        });
        
        document.getElementById('monthly-investment').value = '';
        document.getElementById('interest-rate').value = '';
        document.getElementById('duration').value = '';
    });
    
    calculateBtn.addEventListener('click', function() {
        const initialCapitalValue = initialCapitalInput.value.trim();
        const initialCapital = initialCapitalValue === '' ? 0 : parseBrazilianNumber(initialCapitalValue);
        
        if (!isValidNonNegativeNumber(initialCapital)) {
            showError('O capital inicial deve ser maior ou igual a zero.');
            return;
        }
        
        if (calculator.getPeriods().length === 0) {
            showError('Adicione pelo menos um período de investimento.');
            return;
        }
        
        calculator.setInitialCapital(initialCapital);
        const result = calculator.calculate();
        
        initialCapitalResultElement.textContent = formatCurrency(result.initialCapital);
        totalAmountElement.textContent = formatCurrency(result.totalAmount);
        totalInvestedElement.textContent = formatCurrency(result.totalInvested);
        totalInterestElement.textContent = formatCurrency(result.totalInterest);
        profitabilityElement.textContent = `${result.profitability.toFixed(2)}%`;
        
        resultSection.style.display = 'block';
        detailedResultsDiv.style.display = 'block';
        
        monthlyTable.innerHTML = '';
        result.monthlyData.forEach(data => {
            const row = monthlyTable.insertRow();
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
        
        resultSection.scrollIntoView({ behavior: 'smooth' });
    });
    
    resetBtn.addEventListener('click', function() {
        calculator.clearPeriods();
        periodsTable.innerHTML = '';
        monthlyTable.innerHTML = '';
        resultSection.style.display = 'none';
        detailedResultsDiv.style.display = 'none';
        
        initialCapitalInput.value = '';
        document.getElementById('monthly-investment').value = '';
        document.getElementById('interest-rate').value = '';
        document.getElementById('duration').value = '';
    });
});
