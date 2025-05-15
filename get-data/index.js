import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

import { getNumberOfAddresses } from "./get-num-of-addresses.js";
import { getRPCs } from "./get-rpcs.js";
import { getTokensData } from "./get-tokens-data.js";


// This script fetches data from various APIs and saves it to JSON and JS files for use in a frontend application.
(async () => {
    await getTokensData();
    await getNumberOfAddresses();
    await getRPCs();
    mergeDataForFrontend();
    console.log('All data fetched and saved successfully!');
}
)();

mergeDataForFrontend();
function mergeDataForFrontend() {
    const modulePath = dirname(fileURLToPath(import.meta.url));
    const files = ['pregenerated-data/uniqueAddresses.json', 'pregenerated-data/rpcs.json'];
    const mergedData = {
        tokenArr: [],
    };
    files.forEach(file => {
        const fileData = JSON.parse(fs.readFileSync(resolve(modulePath, file), 'utf8'));
        mergedData[file.replace('pregenerated-data/', '').replace('.json', '')] = fileData;
    });
    const file = '../server/tokens.json';
    const filePath = resolve(modulePath, file);
    const fileData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const parsedTokensData = {};

    fileData.tokens.map(token => {
        parsedTokensData[token.address] = {
            name: token.name,
            symbol: token.symbol,
            price: token.price,
            market_cap: token.market_cap,
        };
        mergedData.tokenArr.push(token.address);
    });
    mergedData.tokens = parsedTokensData;
    mergedData.tokenArr = mergedData.tokenArr.filter(function(item, pos) {
        return mergedData.tokenArr.indexOf(item) == pos;
    }).sort((a, b) => {
        return mergedData.tokens[b].market_cap - mergedData.tokens[a].market_cap;
    });

    const outputFilePath = resolve(modulePath, '../frontend/src/db.js');
    fs.writeFileSync(outputFilePath, 'export const db = ' + JSON.stringify(mergedData, null, 2));
    console.log(`Merged data saved to ${outputFilePath}`);
}