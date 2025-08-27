// Lógica de cálculo dos investimentos

class InvestmentCalculator {
    constructor() {
        this.periods = [];
        this.monthlyData = [];
    }
    
    addPeriod(monthlyInvestment, interestRate, duration) {
        this.periods.push({
            monthlyInvestment,
            interestRate,
            duration
        });
    }
    
    removePeriod(index) {
        if (index >= 0 && index < this.periods.length) {
            this.periods.splice(index, 1);
            return true;
        }
        return false;
    }
    
    clearPeriods() {
        this.periods = [];
        this.monthlyData = [];
    }
    
    calculate() {
        this.monthlyData = [];
        let totalAmount = 0;
        let totalInvested = 0;
        let currentMonth = 0;
        
        // Calcular para cada período
        for (let i = 0; i < this.periods.length; i++) {
            const period = this.periods[i];
            const monthlyRate = period.interestRate / 100;
            
            for (let month = 1; month <= period.duration; month++) {
                currentMonth++;
                
                // Calcular juros do mês
                const monthlyInterest = totalAmount * monthlyRate;
                
                // Adicionar aporte do mês
                totalAmount += period.monthlyInvestment + monthlyInterest;
                totalInvested += period.monthlyInvestment;
                
                // Adicionar dados para a tabela mensal
                this.monthlyData.push({
                    month: currentMonth,
                    monthlyInvestment: period.monthlyInvestment,
                    monthlyInterest: monthlyInterest,
                    totalInvested: totalInvested,
                    totalInterest: totalAmount - totalInvested,
                    accumulatedAmount: totalAmount
                });
            }
        }
        
        const totalInterest = totalAmount - totalInvested;
        const profitability = totalInvested > 0 ? (totalInterest / totalInvested * 100) : 0;
        
        return {
            totalAmount,
            totalInvested,
            totalInterest,
            profitability,
            monthlyData: this.monthlyData
        };
    }
    
    getPeriods() {
        return this.periods;
    }
    
    getMonthlyData() {
        return this.monthlyData;
    }
}