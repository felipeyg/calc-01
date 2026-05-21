document.addEventListener('DOMContentLoaded', function() {
    const calculator = new InvestmentCalculator();
    const initialCapitalInput = document.getElementById('initial-capital');
    const addPeriodBtn = document.getElementById('add-period');
    const calculateBtn = document.getElementById('calculate');
    const clearPeriodsBtn = document.getElementById('clear-periods');
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
    let initialCapitalLocked = false;
    
    addPeriodBtn.addEventListener('click', function() {
        const monthlyInvestment = parseBrazilianNumber(document.getElementById('monthly-investment').value);
        const interestRate = parseBrazilianNumber(document.getElementById('interest-rate').value);
        const interestRatePeriod = document.getElementById('interest-rate-period').value;

        const durationValue = document.getElementById('duration').value;
        const durationInput = Number(durationValue);
        const durationPeriod = document.getElementById('duration-period').value;

        if (!initialCapitalLocked) {
            const initialCapitalValue = initialCapitalInput.value.trim();
            const initialCapital = initialCapitalValue === '' ? 0 : parseBrazilianNumber(initialCapitalValue);

            if (!isValidNonNegativeNumber(initialCapital)) {
                showError('O capital inicial deve ser maior ou igual a zero.');
                return;
            }

            calculator.setInitialCapital(initialCapital);
            initialCapitalInput.disabled = true;
            initialCapitalLocked = true;
        }
        
        if (
            !isValidNonNegativeNumber(monthlyInvestment) ||
            !isValidNonNegativeNumber(interestRate) ||
            !Number.isInteger(durationInput) ||
            durationInput <= 0
        ) {
            showError('Aporte e taxa devem ser maiores ou iguais a zero. A duração deve ser um número inteiro maior que zero.');
            return;
        }

        let monthlyInterestRate = interestRate;

        if (interestRatePeriod === 'annual') {
            monthlyInterestRate = (Math.pow(1 + interestRate / 100, 1 / 12) - 1) * 100;
        }

        const durationInMonths = durationPeriod === 'years'
            ? durationInput * 12
            : durationInput;

        const interestRateLabel = interestRatePeriod === 'annual'
            ? `${interestRate}% ao ano`
            : `${interestRate}% ao mês`;

        const durationLabel = durationPeriod === 'years'
            ? `${durationInput} ano(s) (${durationInMonths} meses)`
            : `${durationInput} mês(es)`;
        
        calculator.addPeriod(monthlyInvestment, monthlyInterestRate, durationInMonths);
        
        const row = periodsTable.insertRow();
        row.innerHTML = `
            <td>${formatCurrency(monthlyInvestment)}</td>
            <td>${interestRateLabel}</td>
            <td>${durationLabel}</td>
            <td><button class="btn-remove">Remover</button></td>
        `;
        
        row.querySelector('.btn-remove').addEventListener('click', function() {
            const rowIndex = row.rowIndex - 1;
            if (calculator.removePeriod(rowIndex)) {
                periodsTable.deleteRow(rowIndex);

                if (calculator.getPeriods().length === 0) {
                    initialCapitalInput.disabled = false;
                    initialCapitalLocked = false;
                    calculator.setInitialCapital(0);
                }
            }
        });
        
        document.getElementById('monthly-investment').value = '';
        document.getElementById('interest-rate').value = '';
        document.getElementById('duration').value = '';
        document.getElementById('interest-rate-period').value = 'monthly';
        document.getElementById('duration-period').value = 'months';
    });
    
    calculateBtn.addEventListener('click', function() {
        if (calculator.getPeriods().length === 0) {
            showError('Adicione pelo menos um período de investimento.');
            return;
        }
        
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

        initialCapitalInput.value = '';
        
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

        if (lastResult) {
            comparisonSection.style.display = 'block';
        } else {
            comparisonSection.style.display = 'none';
        }
});

    clearPeriodsBtn.addEventListener('click', function() {
        calculator.clearPeriods();

        periodsTable.innerHTML = '';
        monthlyTable.innerHTML = '';

        resultSection.style.display = 'none';
        detailedResultsDiv.style.display = 'none';

        lastResult = null;

        initialCapitalInput.value = '';
        document.getElementById('monthly-investment').value = '';
        document.getElementById('interest-rate').value = '';
        document.getElementById('duration').value = '';

        initialCapitalResultElement.textContent = formatCurrency(0);
        totalAmountElement.textContent = formatCurrency(0);
        totalInvestedElement.textContent = formatCurrency(0);
        totalInterestElement.textContent = formatCurrency(0);
        profitabilityElement.textContent = '0%';

        if (savedScenarios.length > 0) {
            comparisonSection.style.display = 'block';
        } else {
            comparisonSection.style.display = 'none';
        }
    });
});
