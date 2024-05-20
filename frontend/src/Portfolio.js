import { useEffect, useState } from "react";
import { formatEther } from 'viem'
import humanFormat from "human-format";
import Icon from "./Icon";
import { Routing } from '@hoprnet/phttp-lib';

const notRealTokenRegEx = /visit|www|http|.com|.org|claim/gi;

const RPChToken = 'cd86943feac3b8ef534c792c0e2bbfdf73c05a26b0798d0d';

const uHTTP = new Routing.Routing(RPChToken, {
    discoveryPlatformEndpoint: 'https://discovery-platform.staging.hoprnet.link',
    forceZeroHop: true,
});

function Portfolio() {
    const [ethAddress, set_ethAddress] = useState('0x11b815efb8f581194ae79006d24e0d814b7697f6');
    const [portfolio, set_portfolio] = useState(null);
    const [portfolioLoading, set_portfolioLoading] = useState(false);
    const [use_uHTTP, set_use_uHTTP] = useState(false);


    useEffect(()=>{
        set_portfolio({
            "address": "0x11b815efb8f581194ae79006d24e0d814b7697f6",
            "ETH": {
                "price": {
                    "rate": 3103.9042529431586,
                    "diff": 0.01,
                    "diff7d": 4.19,
                    "ts": 1716196980,
                    "marketCapUsd": 372861319456.65314,
                    "availableSupply": 120126553.22827746,
                    "volume24h": 11186674260.587378,
                    "volDiff1": 22.080582208062054,
                    "volDiff7": 27.237648868716022,
                    "volDiff30": -28.344771144022815,
                    "diff30d": -0.14953336253964267
                },
                "balance": 0,
                "rawBalance": "0"
            },
            "tokens": [
                {
                    "tokenInfo": {
                        "address": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
                        "name": "WETH",
                        "decimals": "18",
                        "symbol": "WETH",
                        "totalSupply": "3011142043716637120021982",
                        "owner": "",
                        "lastUpdated": 1716196500,
                        "issuancesCount": 71936772,
                        "price": {
                            "rate": 3100.788561331202,
                            "diff": -0.34,
                            "diff7d": 4.84,
                            "ts": 1716196500,
                            "marketCapUsd": 0,
                            "availableSupply": 0,
                            "volume24h": 1145213443.9753768,
                            "volDiff1": 34.04672546907844,
                            "volDiff7": 11.262757103707429,
                            "volDiff30": -31.243011228292787,
                            "diff30d": 0.8455126566900333,
                            "bid": 2944.99,
                            "currency": "USD"
                        },
                        "holdersCount": 1023500,
                        "website": "https://weth.io",
                        "image": "/images/WETHc02aaa39.png",
                        "ethTransfersCount": 5914406,
                        "publicTags": [
                            "Tokenized",
                            "ETH"
                        ]
                    },
                    "balance": 8.099342802935469e+21,
                    "rawBalance": "8099342802935468579639"
                },
            ]
        })
    }, [])

    async function getData() {
        set_portfolioLoading(true);
        try {
            const rez = await fetch(`https://api.ethplorer.io/getAddressInfo/${ethAddress}?apiKey=freekey`)
            const json = await rez.json();
            let filtered = json;
            if (filtered.tokens) {
                filtered.tokens = filtered.tokens.filter(token => !(token?.tokenInfo?.symbol && notRealTokenRegEx.test(token?.tokenInfo?.symbol)))
                set_portfolio(filtered);
                console.log(filtered)
            }
        } finally {
            set_portfolioLoading(false);
        }
    }

    const formatBalance = (balance) => humanFormat(Number(formatEther(balance), { maxDecimals: "auto" })).replace(' ', '') || '-';

    return (
        <div className="portfolio">
            <div>
                <input
                    type="text"
                    id="name"
                    name="address"
                    required
                    minLength="4"
                    size="50"
                    value={ethAddress}
                    onChange={(event) => { set_ethAddress(event.target.value) }}
                />
                <input
                    type="button"
                    value="Get portfolio"
                    onClick={() => { getData(ethAddress) }}
                />
            </div>
            <div>
                <input
                    type="checkbox"
                    id="name"
                    name="uHTTP"
                    checked={use_uHTTP}
                    onChange={() => { set_use_uHTTP(prev => !prev) }}
                />
                uHTTP
            </div>
            <div>
                <table
                    className='portfolio-table'
                >
                    <thead>
                        <tr>
                            <th className="icon">Icon</th>
                            <th className="name">Token</th>
                            <th className="balance">Balance</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            portfolio &&
                            <tr>
                                <td className="icon">-</td>
                                <td className="name">Ether</td>
                                <td className="balance">
                                    {portfolio?.ETH?.rawBalance && formatBalance(portfolio?.ETH?.rawBalance)}
                                    {` `}
                                    ETH
                                </td>

                            </tr>
                        }
                        {
                            portfolio && portfolio.tokens && portfolio.tokens.map(token =>
                                <tr
                                    key={`${ethAddress}_${token?.tokenInfo?.address}`}
                                >
                                    <td>
                                        <Icon
                                            ethAddress={token?.tokenInfo?.address}
                                            uHTTP={uHTTP}
                                            use_uHTTP={use_uHTTP}
                                        />
                                    </td>
                                    <td>{token?.tokenInfo?.name}</td>
                                    <td>
                                        {formatBalance(token?.rawBalance)}
                                        {` `}
                                        {token?.tokenInfo?.symbol}
                                    </td>

                                </tr>
                            )
                        }
                    </tbody>
                </table>
            </div>

        </div>
    );
}

export default Portfolio;
