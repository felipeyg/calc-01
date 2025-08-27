// Funções utilitárias

// Formata valores monetários
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

// Valida se um valor é numérico e positivo
function isValidNumber(value) {
    return !isNaN(value) && value > 0;
}

// Exibe mensagens de erro para o usuário
function showError(message) {
    alert(`Erro: ${message}`);
}

// Calcula o montante para um único período
function calculatePeriodAmount(monthlyInvestment, interestRate, duration) {
    const monthlyRate = interestRate / 100;
    
    if (monthlyRate === 0) {
        return monthlyInvestment * duration;
    }
    
    return monthlyInvestment * (Math.pow(1 + monthlyRate, duration) - 1) / monthlyRate;
}