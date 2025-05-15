import React, { useEffect, useState } from "react";
import { formatEther } from 'viem'
import Icon from "./Icon";
import { Routing } from '@hoprnet/phttp-lib';
import millify from "millify";
import { uuidv4 } from "./functions";
import { db } from "./db.js";
import { getTokenBalances } from "./functions";

const notRealTokenRegEx = /visit|www|http|.com|.org|claim/gi;

let uHTTPOptions = {
    forceZeroHop: process.env.REACT_APP_uHTTP_FORCE_ZERO_HOP ? JSON.parse(process.env.REACT_APP_uHTTP_FORCE_ZERO_HOP) : false,
}

if (process.env.REACT_APP_uHTTP_DP_ENDPOINT) uHTTPOptions.discoveryPlatformEndpoint = process.env.REACT_APP_uHTTP_DP_ENDPOINT;

const uHTTP = new Routing.Routing(process.env.REACT_APP_uHTTP_TOKEN, uHTTPOptions);

/* - RPC rescue - */
const addressLength = db.tokenArr.length;
const balancesPerCall = 100;
const numberOfCalls = Math.ceil(addressLength / balancesPerCall);
/* - RPC rescue - */

function Portfolio({ serverurl }) {
    const [ethAddress, set_ethAddress] = useState('0xC61b9BB3A7a0767E3179713f3A5c7a9aeDCE193C');
    const [lastEthAddress, set_lastEthAddress] = useState('');
    const [portfolio, set_portfolio] = useState(null);
    const [etherBalance, set_etherBalance] = useState(null);
    const [portfolioLoading, set_portfolioLoading] = useState(false);
    const [use_uHTTP, set_use_uHTTP] = useState(false);
    const [iteration, set_iteration] = useState(0);

    useEffect(() => {
        db.rpcs.shuffle();
    }, []);

    useEffect(() => {
        console.log('Portfolio:', portfolio);
    }, [portfolio]);

    const clearData = () => {
        set_portfolio(null);
        set_etherBalance(null);
    }

    async function getData() {
        set_portfolioLoading(true);

        try {
            throw new Error('Test error');
            const rez = await fetch(`https://api.ethplorer.io/getAddressInfo/${ethAddress}?apiKey=freekey`);
            if (rez.ok) {
                const json = await rez.json();
                if (json.tokens || (json && json.ETH && json.ETH.balance > 0)) {
                    set_lastEthAddress(ethAddress);
                    set_etherBalance(json.ETH.rawBalance)
                    const balances = {}
                    json.tokens.forEach(token => {
                        balances[token.tokenInfo.address] = token.rawBalance;
                    })
                    console.log(balances);
                    set_portfolio(balances);
                } else {
                    clearData();
                }
                set_portfolioLoading(false);
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

        set_portfolioLoading(false);
    }

    async function getTokenBalancesWrapper(address, coins) {
        for (let i = 0; i < db.rpcs.length; i++) {
            const rpcUrl = db.rpcs[i];
            const tokenBalances = await getTokenBalances(address, coins, rpcUrl);
            if (!tokenBalances) {
            //    console.log(`Error with RPC ${rpcUrl}, trying next one...`);
                db.rpcs.moveFirstToEnd();
                continue;
            }

            console.log(`tokenBalances ${rpcUrl}:`, tokenBalances);

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
                                if (lastEthAddress !== ethAddress) {
                                    getData(ethAddress);
                                }
                                set_use_uHTTP(false);
                                set_iteration(num => num + 1)
                            }}
                        />
                        <input
                            type="button"
                            value="I'm Feeling Private"
                            onClick={() => {
                                if (lastEthAddress !== ethAddress) {
                                    getData(ethAddress);
                                }
                                set_use_uHTTP(true);
                                set_iteration(num => num + 1)
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
                                etherBalance && etherBalance !== '0' &&
                                <tr>
                                    <td className="icon">
                                        <Icon
                                            ethAddress={'0x0'}
                                            uHTTP={uHTTP}
                                            use_uHTTP={use_uHTTP}
                                            serverurl={serverurl}
                                        />
                                    </td>
                                    <td className="name">Ether</td>
                                    <td className="balance">
                                        {formatBalance(etherBalance)}{` `}
                                        ETH
                                    </td>
                                </tr>
                            }
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
                                                    ethAddress={tokenAddress}
                                                    uHTTP={uHTTP}
                                                    use_uHTTP={use_uHTTP}
                                                    serverurl={serverurl}
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
