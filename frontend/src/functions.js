import { db } from "./db.js";

export function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Add shuffle method to Array prototype
Array.prototype.shuffle = function () {
    for (let i = this.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this[i], this[j]] = [this[j], this[i]]; // Swap elements
    }
    return this;
};

// Add a method to move the first element to the end of the array
Array.prototype.moveFirstToEnd = function () {
    if (this.length > 0) {
        const firstElement = this.shift(); // Remove the first element
        this.push(firstElement); // Add it to the end
    }
    return this; // Return the modified array
};



//getData2();
async function getData2() {
    db.rpcs.shuffle();
    const ethAddress = '0xC61b9BB3A7a0767E3179713f3A5c7a9aeDCE193C';
    const addressLength = db.tokenArr.length;
    const balancesPerCall = 100;
    const numberOfCalls = Math.ceil(addressLength / balancesPerCall);
    const walletAddress = '0xC61b9BB3A7a0767E3179713f3A5c7a9aeDCE193C';
    let results = {};
    for (let i = 0; i < numberOfCalls; i++) {
        console.log(`Fetching balances for tokens ${i * balancesPerCall} to ${Math.min((i + 1) * balancesPerCall, addressLength)}...`);
        const startIndex = i * balancesPerCall;
        const endIndex = Math.min(startIndex + balancesPerCall, addressLength);
        const tokenAddresses = db.tokenArr.slice(startIndex, endIndex);
        const temp = await getTokenBalancesWrapper(walletAddress, tokenAddresses);
        results = { ...results, ...temp };
    }
    console.log('All balances:', results);
}

async function getTokenBalancesWrapper(address, coins) {
    for(let i = 0; i < db.rpcs.length; i++) {
        const rpcUrl = db.rpcs[i];
        const rez = await getTokenBalances(address, coins, rpcUrl);
        if(!rez) {
            console.log(`Error with RPC ${rpcUrl}, trying next one...`);
            db.rpcs.moveFirstToEnd();
            continue;
        } else {
            console.log(`${rpcUrl}:`, rez);
        }
        return rez;
    }
}




//getTokenBalances()
export async function getTokenBalances(address, coins, rpcUrl) {
    try{
        const balanceOfMethod = '0x70a08231'; // Keccak-256 hash of "balanceOf(address)" method

        const createData = (contract, address) => ({
            to: contract,
            data: balanceOfMethod + address.slice(2).padStart(64, '0'),
        });

        const params = [];

        for (let i = 0; i < coins.length; i++) {
            const contract = coins[i];
            const data = createData(contract, address);
            params.push(data);
        }

        const requests = params.map((param, index) => ({
            jsonrpc: '2.0',
            method: 'eth_call',
            params: [param, 'latest'],
            id: index + 1,
        }));

        const rez = await fetch(rpcUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requests),
        });

        let responses = await rez.json();

        if (responses?.some((response) => response.error)) {
            throw new Error(
                responses
                    .filter((response) => response.error)
                    .map((response) => response.error.message)
                    .join(', ')
            );
        }

        responses = responses.filter((response) => !response.error);

        const balances = responses.map((response) =>
            /* global BigInt */
            BigInt(response.result).toString()
        );

        let results = { }

        console.log('Balances:', balances);
        balances.forEach((balance, index) => {
            if(balance && balance !== '0') results[coins[index]] = balance;
        })

        return results;
    } catch (error) {
        console.warn('Error with RPC:', rpcUrl, error);
        return null
    }
}