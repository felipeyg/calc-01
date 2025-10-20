function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

function isValidNumber(value) {
    return !isNaN(value) && value > 0;
}

function showError(message) {
    alert(`Erro: ${message}`);
}

function calculatePeriodAmount(monthlyInvestment, interestRate, duration) {
    const monthlyRate = interestRate / 100;
    
    if (monthlyRate === 0) {
        return monthlyInvestment * duration;
    }
    
    return monthlyInvestment * (Math.pow(1 + monthlyRate, duration) - 1) / monthlyRate;
}