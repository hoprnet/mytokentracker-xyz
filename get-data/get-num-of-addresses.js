import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

export async function getNumberOfAddresses() {

    const url = 'https://etherscan.io/chart/address?output=csv';
    const res = await fetch(url)
    const json = await res.text();

    const rows = json.split('\n');
    const latestRow = rows[rows.length - 2].split(',');
    const getNumberOfAddresses = latestRow[2].replace(/"|\r/g, '');

    const results = {
        "uniqueAddresses": parseInt(getNumberOfAddresses),
        "timestamp": new Date().toISOString().replace('Z','+00:00')
    };

    const modulePath = dirname(fileURLToPath(import.meta.url))
    const filePath = './pregenerated-data/uniqueAddresses.json';
    fs.writeFileSync(resolve(modulePath, filePath), JSON.stringify(results, null, 2));
    console.log(`Number of unique addresses data saved to ${filePath}`);
}
