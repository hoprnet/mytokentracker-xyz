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
    const [use_uHTTP, set_use_uHTTP] = useState(true);

    async function getData() {
        set_portfolioLoading(true);
        try {
            const rez = await fetch(`https://api.ethplorer.io/getAddressInfo/${ethAddress}?apiKey=freekey`)
            const json = await rez.json();
            let filtered = json;
            if (filtered.tokens) {
                filtered.tokens = filtered.tokens.filter(token => !(token?.tokenInfo?.symbol && notRealTokenRegEx.test(token?.tokenInfo?.symbol)))
                set_portfolio(filtered);
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
