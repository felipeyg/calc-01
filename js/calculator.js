// Lógica de cálculo dos investimentos

class InvestmentCalculator {
    constructor() {
        this.periods = [];
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
    }
    
    calculate() {
        let totalAmount = 0;
        let totalInvested = 0;
        
        for (let i = 0; i < this.periods.length; i++) {
            const period = this.periods[i];
            const periodAmount = calculatePeriodAmount(
                period.monthlyInvestment,
                period.interestRate,
                period.duration
            );
            
            totalAmount += periodAmount;
            totalInvested += period.monthlyInvestment * period.duration;
        }
        
        const totalInterest = totalAmount - totalInvested;
        
        return {
            totalAmount,
            totalInvested,
            totalInterest
        };
    }
    
    getPeriods() {
        return this.periods;
    }
}