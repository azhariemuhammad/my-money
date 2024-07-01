const file = require('./file')

const months = [
    'january', 
    'february', 
    'march', 
    'april', 
    'may', 
    'june', 
    'july', 
    'august', 
    'september', 
    'october', 
    'november', 
    'december'
];

class MoneyService {
    constructor(filename) {
        this.filename = filename
        this.balance = ''
        this.currentMonth = 'JANUARY'
        this.sipInput = []
     }
    
    async allocate(...args) {
        const [equity, debt, gold] = args
        
        try {
            const { balance, month } = await this.getCurrentData()
            const subtotal = args.reduce((prev, curr) => {
                return prev + Number(curr)
            }, parseInt(balance, 10) || 0)

            const content = `\n${debt} ${equity} ${gold} ${month} - Allocation ${subtotal}`
            return content
        } catch (error) {
            console.error('Error allocating money:', error)
        }      
    }

    setSip(...args) {
        const [equity, debt, gold] = args
        this.sipInput = [equity, debt, gold]
    }

    async calculateSip(...args) {
        const [, , , month] = args
        const monthIdx = months.findIndex((item) => item === month.toLowerCase())
        
        const newMonth = months[monthIdx + 1]
        
        const [equity, debt, gold] = this.sipInput

        const { balance, equity: currentEquity, debt: currentDebt, gold: currentGold } = await this.getCurrentData()

        const subtotal = [equity, debt, gold].reduce((prev, curr) => {
            return prev + Number(curr)
        }, parseInt(balance, 10) || 0)


        const updatedEquity = Number(equity) + Number(currentEquity)
        const updatedDebt = Number(debt) + Number(currentDebt)
        const updatedGold = Number(gold) + Number(currentGold)

        const sip = `\n${updatedDebt} ${updatedEquity} ${updatedGold} ${newMonth} - After SIP ${subtotal}`
        const existing = `\n${currentDebt} ${currentEquity} ${currentGold} ${month} - Existing ${balance}`

        return {sip, existing}
    }

    parsePercentage(value) {
        if (typeof value === 'string' && value.endsWith('%')) {
            return parseFloat(value.slice(0,-1)) / 100
        }

        return parseFloat(value)
    }

    calculateNewValue(initial, marketChangePercent) {
        const marketChangeDecimal = this.parsePercentage(marketChangePercent)
        console.log({marketChangeDecimal})
        return Math.floor(initial * (1 + marketChangeDecimal))
    }

    async change(...args) {
        const [equityChange, debtChange, goldChange, month] = args

        try {
            const { balance, equity: currentEquity, debt: currentDebt, gold: currentGold } = await this.getCurrentData()
            const updatedEquity = this.calculateNewValue(currentEquity, equityChange)
            const updatedDebt = this.calculateNewValue(currentDebt, debtChange)
            const updatedGold = this.calculateNewValue(currentGold, goldChange)

            const subtotal = [Number(updatedDebt) - Number(currentDebt), Number(updatedEquity) - Number(currentEquity),  Number(updatedGold) - Number(currentGold)].reduce((prev, curr) => {
                return prev + Number(curr)
            }, 0)
            
            const total = Number(subtotal) + Number(balance)

            const content = `\n${updatedDebt} ${updatedEquity} ${updatedGold} ${month} - After Market Change ${total}`
            return content
        } catch (error) {
            console.error('Error calculation market change:', error)
        }      
    }

    async getCurrentData() {
        const items = await file.read(this.filename)
        const item = items[items.length - 1]?.split(' ') ?? []
        const [debt, equity, gold, month] = item
        const balance = item[item.length - 1]
        const currentMonth = month || 'January'
        
        return {balance:  parseInt(balance, 10) ? balance : '', month: currentMonth, debt, equity, gold }
    }

    async print(content) {
        file.write(this.filename, content)
    }

    async getBalanceByMonth(...args) {
        const [month] = args
        const lines = await file.read(this.filename)
        const filteredLines = lines.filter(curr => {
            return curr.toLowerCase().includes(month.toLowerCase()) && curr.toLowerCase().includes('after market change');
        });

        const [debt, equity, gold] = filteredLines?.[0].split(' ') ?? []

        return {debt, equity, gold};
    }
    

}
module.exports = {
    MoneyService
}

