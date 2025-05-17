import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

//getTokensData()
export async function getTokensData() {

    const url = 'https://api.coingecko.com/api/v3/coins/list?include_platform=true';
    const options = {method: 'GET', headers: {accept: 'application/json'}};

    const res = await fetch(url, options)
    const json = await res.json();

    const results = {
        "name": "CoinGecko",
        "tokens": []
    };


    for(let i = 0; i < json.length/250; i++) {
        console.log(`Fetching page ${i + 1} of tokens... ${parseInt(i/(json.length/250)*100)}% done`);

        const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=id_asc&per_page=250&page=${i}`;
        const options = {method: 'GET', headers: {accept: 'application/json'}};

        const res = await fetch(url, options)
        const jsonD = await res.json();

        if(jsonD.length === 0) {
            break;
        }
        if (jsonD?.status?.error_code === 429) {
            console.log('Rate limit reached or a problem occured, waiting for 1 minute');
            await new Promise(resolve => setTimeout(resolve, 60_000));
            i--;
            continue;
        }

        for (const tokenDetails of jsonD) {
            const tokenBasicInfo = json.find(t => t.id === tokenDetails.id);
            if(!tokenBasicInfo?.platforms?.ethereum) continue;
            // if(tokenDetails.market_cap < 1_000_000) continue;
            const tokenDecimals = await checkifTokenExistsAndGetDecimals(tokenBasicInfo.platforms.ethereum);
            if(tokenDecimals === null) continue;
            const tokenData = {
                chainId: 1,
                address: tokenBasicInfo.platforms.ethereum,
                name: tokenDetails.name,
                symbol: tokenDetails.symbol.toUpperCase(),
                logoURI: tokenDetails.image,
                price: tokenDetails.current_price,
                market_cap: tokenDetails.market_cap,
                decimals: tokenDecimals,
            };
            results.tokens.push(tokenData);
        }
    }
    const ethToken = {
      chainId: 1,
      address: "0x0",
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
      logoURI: "https://coin-images.coingecko.com/coins/images/279/standard/ethereum.png?1696501628",
      price: 2681.96,
      market_cap: Number.MAX_SAFE_INTEGER,
    };
    results.tokens.push(ethToken);
    results.timestamp = new Date().toISOString().replace('Z','+00:00');

    const modulePath = dirname(fileURLToPath(import.meta.url))
    const filePath = '../server/tokens.json';
    fs.writeFileSync(resolve(modulePath, filePath), JSON.stringify(results, null, 2));
    console.log(`Tokens data saved to ${filePath}`);

}

//checkifTokenExistsAndGetDecimals('0xe07710cdcd1c9f0fb04bfd013f9854e4552671ce')
async function checkifTokenExistsAndGetDecimals(coin) {
    const address = '0x0000000000000000000000000000000000000000';
    const rpcUrl = 'https://rpc.ankr.com/eth/1247f52cb3112895f6f03c53f10eb15264a64a53200fee12e856f0cf2ee1183e';
   // const rpcUrl = 'https://eth.llamarpc.com';

    let text = '';
    try{
        const balanceOfMethod = '0x70a08231'; // Keccak-256 hash of "balanceOf(address)" method
        const decimals = '0x313ce567'; // Keccak-256 hash of "decimals()" method


        const createData = (contract, address) => ({
            to: contract,
            data: balanceOfMethod + address.slice(2).padStart(64, '0'),
        });

        const params = [
            createData(coin, address),
            {
                to: coin,
                data: decimals,
            },
        ];

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

        text = await rez.text();
        const responses = JSON.parse(text);

        if (responses?.some((response) => response.error)) {
            console.log(coin, text);
            return null;
        }

        return Number(responses[1].result);
    } catch (error) {
        console.log(coin, text);
        return null
    }
}