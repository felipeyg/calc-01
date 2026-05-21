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
    const currentChartSection = document.getElementById('current-chart-section');
    const currentAmountChartCanvas = document.getElementById('current-amount-chart');
    const comparisonChartContainer = document.getElementById('comparison-chart-container');
    const comparisonChartCanvas = document.getElementById('comparison-chart');

    let currentAmountChart = null;
    let comparisonAmountChart = null;
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
    
    function getMonthlyDataWithMonthZero(monthlyData, initialCapital) {
    const hasMonthZero = monthlyData.some(data => data.month === 0);

    if (hasMonthZero) {
        return monthlyData;
    }

    return [
        {
            month: 0,
            accumulatedAmount: initialCapital
        },
        ...monthlyData
    ];
}

    function renderCurrentAmountChart(result) {
        const chartData = getMonthlyDataWithMonthZero(result.monthlyData, result.initialCapital);

        const labels = chartData.map(data => data.month);
        const values = chartData.map(data => Number(data.accumulatedAmount.toFixed(2)));

        if (currentAmountChart) {
            currentAmountChart.destroy();
        }

        currentAmountChart = new Chart(currentAmountChartCanvas, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Montante acumulado',
                        data: values,
                        tension: 0.2,
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Mês'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Montante acumulado (R$)'
                        },
                        ticks: {
                            callback: function(value) {
                                return formatCurrency(value);
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
                            }
                        }
                    }
                }
            }
        });

        currentChartSection.style.display = 'block';
    }

    function renderComparisonChart() {
        if (comparisonAmountChart) {
            comparisonAmountChart.destroy();
            comparisonAmountChart = null;
        }

        if (savedScenarios.length < 2) {
            comparisonChartContainer.style.display = 'none';
            return;
        }

        const maxMonth = Math.max(
            ...savedScenarios.map(scenario =>
                Math.max(...scenario.monthlyData.map(data => data.month))
            )
        );

        const labels = Array.from({ length: maxMonth + 1 }, (_, index) => index);

        const datasets = savedScenarios.map(scenario => {
            const valuesByMonth = new Map(
                scenario.monthlyData.map(data => [data.month, data.accumulatedAmount])
            );

            return {
                label: scenario.name,
                data: labels.map(month => {
                    return valuesByMonth.has(month)
                        ? Number(valuesByMonth.get(month).toFixed(2))
                        : null;
                }),
                tension: 0.2,
                fill: false
            };
        });

        comparisonAmountChart = new Chart(comparisonChartCanvas, {
            type: 'line',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Mês'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Montante acumulado (R$)'
                        },
                        ticks: {
                            callback: function(value) {
                                return formatCurrency(value);
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
                            }
                        }
                    }
                }
            }
        });

        comparisonChartContainer.style.display = 'block';
    }

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
        
        renderCurrentAmountChart(result);

        resultSection.scrollIntoView({ behavior: 'smooth' });
    });
    
    function updateComparisonTable() {
        comparisonTable.innerHTML = '';

        if (savedScenarios.length === 0) {
            comparisonSection.style.display = 'none';
            comparisonChartContainer.style.display = 'none';

            if (comparisonAmountChart) {
                comparisonAmountChart.destroy();
                comparisonAmountChart = null;
            }

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

        renderComparisonChart();
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

        const scenarioMonthlyData = getMonthlyDataWithMonthZero(
            lastResult.monthlyData,
            lastResult.initialCapital
        ).map(data => ({
            month: data.month,
            accumulatedAmount: data.accumulatedAmount
        }));

        savedScenarios.push({
            name: scenarioName.trim(),
            initialCapital: lastResult.initialCapital,
            totalMonths: totalMonths,
            totalInvested: lastResult.totalInvested,
            totalInterest: lastResult.totalInterest,
            totalAmount: lastResult.totalAmount,
            profitability: lastResult.profitability
            monthlyData: scenarioMonthlyData
        });

        updateComparisonTable();
    });

    clearScenariosBtn.addEventListener('click', function() {
        savedScenarios.length = 0;
        comparisonTable.innerHTML = '';
        comparisonChartContainer.style.display = 'none';

        if (comparisonAmountChart) {
            comparisonAmountChart.destroy();
            comparisonAmountChart = null;
        }

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
        currentChartSection.style.display = 'none';

        if (currentAmountChart) {
            currentAmountChart.destroy();
            currentAmountChart = null;
        }

        lastResult = null;

        initialCapitalInput.value = '';
        initialCapitalInput.disabled = false;
        initialCapitalLocked = false;
        calculator.setInitialCapital(0);

        document.getElementById('monthly-investment').value = '';
        document.getElementById('interest-rate').value = '';
        document.getElementById('duration').value = '';

        document.getElementById('interest-rate-period').value = 'monthly';
        document.getElementById('duration-period').value = 'months';

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
