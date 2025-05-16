import { Routing } from '@hoprnet/phttp-lib';
import { db } from "./db.js";

const serverurl = process.env.REACT_APP_BACKEND_URL;
let uHTTPOptions = {
    forceZeroHop: process.env.REACT_APP_uHTTP_FORCE_ZERO_HOP ? JSON.parse(process.env.REACT_APP_uHTTP_FORCE_ZERO_HOP) : false,
}
if (process.env.REACT_APP_uHTTP_DP_ENDPOINT) uHTTPOptions.discoveryPlatformEndpoint = process.env.REACT_APP_uHTTP_DP_ENDPOINT;
const uHTTP = new Routing.Routing(process.env.REACT_APP_uHTTP_TOKEN, uHTTPOptions);

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

//getTokenBalances('https://rpc.ankr.com/eth/1247f52cb3112895f6f03c53f10eb15264a64a53200fee12e856f0cf2ee1183e', '0xC61b9BB3A7a0767E3179713f3A5c7a9aeDCE193C', ['0x0'])

export async function getTokenBalances(rpcUrl, address, coins) {
    try{
        const balanceOfMethod = '0x70a08231'; // Keccak-256 hash of "balanceOf(address)" method

        const createData = (contract, address) => ({
            to: contract,
            data: balanceOfMethod + address.slice(2).padStart(64, '0'),
        });

        const params = [];

        for (let i = 0; i < coins.length; i++) {
            const contract = coins[i];
            if (contract === '0x0') {
                const multicall3 = "0xcA11bde05977b3631167028862bE2a173976CA11";
                const getEthBalanceSelector = "0x4d2301cc"; // getEthBalance(address) in Multicall3
                const data = getEthBalanceSelector + address.slice(2).padStart(64, "0");
                params.push({
                    to: multicall3,
                    data: data
                });
            } else {
                const data = createData(contract, address);
                params.push(data);
            }
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

    //    console.log('Balances:', balances);
        balances.forEach((balance, index) => {
            if(balance && balance !== '0') results[coins[index]] = balance;
        })

        return results;
    } catch (error) {
    //    console.warn('Error with RPC:', rpcUrl, error);
        return null
    }
}

export async function getIcon(ethAddress) {
    try {
        const rez = await fetch(`https://${serverurl}/logo/${ethAddress}`, { cache: "no-store" })
        const blob = await rez.blob();
        const icon = URL.createObjectURL(blob);
        return icon;
    } catch (e) {
        console.warn(`No icon for ${ethAddress}`, e)
    }
}

export async function getIcon_uHTTP(ethAddress) {
    try {
        const rez = await uHTTP.fetch(`https://${serverurl}/logo/${ethAddress}`)
        const blob = await rez.blob();
        if(blob.type.includes('image')){
            const icon = URL.createObjectURL(blob);
            return icon;
        }
    } catch (e) {
        console.warn(`[uHTTP] No icon for ${ethAddress}`, e)
    }
}