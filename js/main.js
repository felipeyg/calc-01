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
    const comparisonSection = document.getElementById('comparison-section');
    const saveScenarioBtn = document.getElementById('save-scenario');
    const clearScenariosBtn = document.getElementById('clear-scenarios');
    const comparisonTable = document.getElementById('comparison-table').getElementsByTagName('tbody')[0];

    const savedScenarios = [];
    let lastResult = null;
    
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

        lastResult = result;
        comparisonSection.style.display = 'block';
        
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
            if (data.month > 0 && data.month % 12 === 0) {
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
    
    function updateComparisonTable() {
        comparisonTable.innerHTML = '';

        if (savedScenarios.length === 0) {
            comparisonSection.style.display = 'none';
            return;
        }

        comparisonSection.style.display = 'block';

        const baseScenario = savedScenarios[0];

        savedScenarios.forEach(scenario => {
            const differenceFromBase = scenario.totalAmount - baseScenario.totalAmount;

            const row = comparisonTable.insertRow();

            row.innerHTML = `
                <td>${scenario.name}</td>
                <td>${formatCurrency(scenario.initialCapital)}</td>
                <td>${scenario.totalMonths} meses</td>
                <td>${formatCurrency(scenario.totalInvested)}</td>
                <td>${formatCurrency(scenario.totalInterest)}</td>
                <td>${formatCurrency(scenario.totalAmount)}</td>
                <td>${scenario.profitability.toFixed(2)}%</td>
                <td>${formatCurrency(differenceFromBase)}</td>
            `;
        });
    }

    saveScenarioBtn.addEventListener('click', function() {
        if (!lastResult) {
            showError('Execute uma simulação antes de salvar um cenário.');
            return;
        }

        const scenarioName = prompt('Informe um nome para o cenário:');

        if (!scenarioName || scenarioName.trim() === '') {
            showError('Informe um nome válido para o cenário.');
            return;
        }

        const totalMonths = lastResult.monthlyData.filter(data => data.month > 0).length;

        savedScenarios.push({
            name: scenarioName.trim(),
            initialCapital: lastResult.initialCapital,
            totalMonths: totalMonths,
            totalInvested: lastResult.totalInvested,
            totalInterest: lastResult.totalInterest,
            totalAmount: lastResult.totalAmount,
            profitability: lastResult.profitability
        });

        updateComparisonTable();
    });

    clearScenariosBtn.addEventListener('click', function() {
        savedScenarios.length = 0;
        comparisonTable.innerHTML = '';
        comparisonSection.style.display = 'none';
    });

    resetBtn.addEventListener('click', function() {
        calculator.clearPeriods();
        periodsTable.innerHTML = '';
        monthlyTable.innerHTML = '';
        resultSection.style.display = 'none';
        detailedResultsDiv.style.display = 'none';
        
        savedScenarios.length = 0;
        comparisonTable.innerHTML = '';
        comparisonSection.style.display = 'none';
        lastResult = null;

        initialCapitalInput.value = '';
        document.getElementById('monthly-investment').value = '';
        document.getElementById('interest-rate').value = '';
        document.getElementById('duration').value = '';
    });
});
