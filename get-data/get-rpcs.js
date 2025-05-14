
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// getRPCs()
export async function getRPCs() {

    let rpcs = [...await getChainlistOrg(), ...await getChainlistWtf()];
    rpcs = rpcs.filter((item, pos) => {
        return item.substring(0,8) === 'https://';
    });
    rpcs = rpcs.filter(function(item, pos) {
        return rpcs.indexOf(item) == pos;
    })

    const modulePath = dirname(fileURLToPath(import.meta.url))
    const filePath = './pregenerated-data/rpcs.json';
    fs.writeFileSync(resolve(modulePath, filePath), JSON.stringify(rpcs, null, 2));
    console.log(`RPCs urls saved to ${filePath}`);
}


async function getChainlistOrg() {
    try{
    const url = 'https://chainlist.org/_next/data/OChd-xEMdh7PTxR8BYpMB/chain/1.json?chain=1';
    const res = await fetch(url);
    const json = await res.json();
    const rpcs = json.pageProps.chain.rpc.map((entry) => {
        return entry.url;
    });
    return rpcs;
    } catch (error) {
        console.log('Need to update the url for the Chainlist.Org.\nError fetching Chainlist.org RPCs:', error);
        return [];
    }

}

async function getChainlistWtf() {
    const url = 'https://chainlist.wtf/page-data/chain/1/page-data.json';
    const res = await fetch(url);
    const json = await res.json();
    return json.result.data.chain.rpc;
}