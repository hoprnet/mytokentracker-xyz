import React, { useEffect, useState, useRef } from "react";
import { formatEther } from 'viem'
import Icon from "./Icon";
import millify from "millify";
import { db } from "./db.js";
import { getTokenBalances } from "./functions";
import { getIcon, getIcon_uHTTP } from "./functions";

/* - RPC rescue - */
const addressLength = db.tokenArr.length; //adding 1 to account for ETH balance
const balancesPerCall = 100;
const numberOfCalls = Math.ceil(addressLength / balancesPerCall);
/* - RPC rescue - */

function Portfolio() {
    const [ethAddress, set_ethAddress] = useState('0xC61b9BB3A7a0767E3179713f3A5c7a9aeDCE193C');
    const [lastEthAddress, set_lastEthAddress] = useState('');
    const [portfolio, set_portfolio] = useState(null);
    const [downloadedIcons, set_downloadedIcons] = useState({});
    const [iteration, set_iteration] = useState(0);
    const inProgress = useRef(new Set());
    const use_uHTTP = useRef(false);

    useEffect(() => {
        db.rpcs.shuffle();
    }, []);

    useEffect(() => {
        console.log('Portfolio:', portfolio);
        getIconWrapper(portfolio);
    }, [portfolio, iteration]);

    const getIconWrapper = async (portfolio) => {
        if (portfolio === null) return;
        const tokenAddresses = Object.keys(portfolio);

        const iconPromises = [];

        for (const tokenAddress of tokenAddresses) {
            if (!db.tokenArr.includes(tokenAddress)) continue;
            if (inProgress.current.has(tokenAddress)) continue;
            inProgress.current.add(tokenAddress); // Mark as in-progress

            console.log('Getting icon for:', tokenAddress);
            const promise = (use_uHTTP.current ? getIcon_uHTTP(tokenAddress) : getIcon(tokenAddress))
                .then(icon => {
                    if (icon) {
                        set_downloadedIcons(old => ({
                            ...old,
                            [tokenAddress]: icon
                        }));
                    }
                });
            iconPromises.push(promise);
        }

        await Promise.all(iconPromises);
    }

    const clearData = () => {
        set_portfolio(null);
        inProgress.current = new Set();
    }

    async function getData(ethAddress) {
        clearData();
        set_downloadedIcons({});

        /* - Centralized main endpoint - */
        try {
            const rez = await fetch(`https://api.ethplorer.io/getAddressInfo/${ethAddress}?apiKey=freekey`);
            if (rez.ok) {
                const json = await rez.json();
                if (json.tokens || (json && json.ETH && json.ETH.balance > 0)) {
                    set_lastEthAddress(ethAddress);
                    const balances = {}
                    balances['0x0'] = json.ETH.rawBalance;
                    json.tokens.forEach(token => {
                        balances[token.tokenInfo.address] = token.rawBalance;
                    })
                    console.log('ethplorer balances:', balances);
                    set_portfolio(balances);
                }
                return;
            }
        } catch (error) {
            console.error('Error fetching data using ethplorer:', error);
        }

        /* - RPC fallback - */
        let jobs = [];
        for (let i = 0; i < numberOfCalls; i++) {
            const startIndex = i * balancesPerCall;
            const endIndex = Math.min(startIndex + balancesPerCall, addressLength);
            const tokenAddresses = db.tokenArr.slice(startIndex, endIndex);
            jobs.push(getTokenBalancesWrapper(ethAddress, tokenAddresses));
        }
        console.log('Jobs:', jobs);
        try {
            await Promise.all(jobs);
        } catch (error) {
            console.error('Error fetching data using RPC endpoints:', error);
        }

    }

    async function getTokenBalancesWrapper(address, tokenAddresses) {
        for (let i = 0; i < db.rpcs.length; i++) {
            const rpcUrl = db.rpcs[i];
            db.rpcs.moveFirstToEnd();
            const tokenBalances = await getTokenBalances(rpcUrl, address, tokenAddresses);
            if (!tokenBalances) {
                db.rpcs.moveFirstToEnd();
                continue;
            }

            console.log(`RPC balances (${rpcUrl}):`, tokenBalances);

            set_portfolio(old => {
                if (old === null) {
                    return tokenBalances
                }

                return {
                    ...old,
                    ...tokenBalances
                }
            });

            return;
        }
    }

    const formatBalance = (balance) => millify(Number(formatEther(balance)), { precision: 10, lowercase: true }).replace(' ', '') || '-';

    const roundTo = 10000;
    const numberOfAddresses = (Math.floor(db.uniqueAddresses.uniqueAddresses / roundTo) * roundTo).toLocaleString('en-US', { maximumFractionDigits: 10 });

    return (
        <div className={`portfolio-container ${portfolio ? 'portfolio-present' : 'no-portfolio'}`}>
            <div className="mtt-search-engine-container">
                <img className="mtt-img" src='./MTT.png' />
                <div className="mtt-search-engine">
                    {
                        !portfolio && <div> Search over {numberOfAddresses} Ethereum mainnet addresses</div>
                    }

                    <input
                        type="text"
                        id="name"
                        name="address"
                        required
                        minLength="4"
                        value={ethAddress}
                        onChange={(event) => { set_ethAddress(event.target.value) }}
                    />
                    <div>
                        <input
                            type="button"
                            value="Tracker Search"
                            onClick={() => {
                                use_uHTTP.current = false;
                                inProgress.current = new Set();
                                set_iteration(old => old + 1);
                                if (lastEthAddress !== ethAddress) {
                                    getData(ethAddress);
                                }
                            }}
                        />
                        <input
                            type="button"
                            value="I'm Feeling Private"
                            onClick={() => {
                                use_uHTTP.current = true;
                                inProgress.current = new Set();
                                set_iteration(old => old + 1);
                                if (lastEthAddress !== ethAddress) {
                                    getData(ethAddress);
                                }
                            }}
                        />
                    </div>
                </div>
            </div>
            {
                portfolio &&
                <div className='portfolio-table-container'>
                    <table
                        className='portfolio-table'
                    >
                        <thead>
                            <tr>
                                <th className="icon icon-cell">Icon</th>
                                <th className="name name-cell">Token</th>
                                <th className="balance balance-cell">Balance</th>
                            </tr>
                        </thead>

                        <tbody>
                            {
                                portfolio && db.tokenArr.map(tokenAddress => {
                                    if (portfolio[tokenAddress] === undefined) return null;
                                    return (
                                        <tr
                                            key={`${use_uHTTP}_${lastEthAddress}_${tokenAddress}`}
                                            aria-address={`${tokenAddress}`}
                                        >
                                            <td className="icon icon-cell" >
                                                <Icon
                                                    icon={downloadedIcons[tokenAddress]}
                                                />
                                            </td>
                                            <td className="name name-cell">{db.tokens[tokenAddress].name}</td>
                                            <td className="balance balance-cell">
                                                {formatBalance(portfolio[tokenAddress])}
                                                {` `}
                                                {db.tokens[tokenAddress].symbol}
                                            </td>
                                        </tr>
                                    )
                                }
                                )
                            }
                        </tbody>

                    </table>
                </div>
            }


        </div>
    );
}

export default Portfolio;
