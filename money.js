#!/usr/bin/env node

const file = require('./file');

const { MoneyService } = require('./service');


const COMMAND = {
    ALLOCATE: 'ALLOCATE',
    SIP: 'SIP',
    CHANGE: 'CHANGE',
    BALANCE: 'BALANCE',
    REBALACE: 'REBALANCE'
}


async function main() {
    const filename = process.argv[2];
    const money = new MoneyService('./portofolio.txt')
    const lines = await file.read(filename) 

    for (const item of lines) {
        const input = item.split(' ')
    
        const [cmd, ...rest] = input

        switch (cmd) {
            case COMMAND.ALLOCATE:
                const content = await money.allocate(...rest)
                await money.print(content)
                break;
            case COMMAND.SIP:
                await money.setSip(...rest)
                break;
            case COMMAND.CHANGE:
                const changeContent = await money.change(...rest)
                await money.print(changeContent)
                const { sip, existing } = await money.calculateSip(...rest)
                await money.print(existing)
                await money.print(sip)
                break;
            case COMMAND.BALANCE:
                const balance = await money.getBalanceByMonth(...rest)
                return Object.values(balance).join(' ')
            default:
                return
        
        }
        console.log({ input })
    }

}

main()