class InvestmentCalculator {
    constructor() {
        this.initialCapital = 0;
        this.periods = [];
        this.monthlyData = [];
    }
    
    setInitialCapital(initialCapital) {
        this.initialCapital = initialCapital;
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
        this.initialCapital = 0;
        this.periods = [];
        this.monthlyData = [];
    }
    
    calculate() {
        this.monthlyData = [];
        let totalAmount = this.initialCapital;
        let totalInvested = this.initialCapital;
        let currentMonth = 0;

        if (this.initialCapital > 0) {
            this.monthlyData.push({
            month: 0,
            monthlyInvestment: 0,
            monthlyInterest: 0,
            totalInvested: totalInvested,
            totalInterest: 0,
            accumulatedAmount: totalAmount
            });
        }
    
        for (let i = 0; i < this.periods.length; i++) {
            const period = this.periods[i];
            const monthlyRate = period.interestRate / 100;
            
            for (let month = 1; month <= period.duration; month++) {
                currentMonth++;
                
                const monthlyInterest = totalAmount * monthlyRate;
                
                totalAmount += period.monthlyInvestment + monthlyInterest;
                totalInvested += period.monthlyInvestment;
                
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
            initialCapital: this.initialCapital,
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