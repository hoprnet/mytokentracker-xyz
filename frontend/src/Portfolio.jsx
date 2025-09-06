import React, { useEffect, useState, useRef } from "react";
import { formatEther } from 'viem'
import Icon from "./Icon.jsx";
import millify from "millify";
import { db } from "./db.js";
import { getTokenBalances } from "./functions.jsx";
import { getIcon, getIcon_uHTTP } from "./functions.jsx";

// Web3
import { useAccount, useSignMessage } from 'wagmi';

// Civic
import { UserButton, useUser } from "@civic/auth-web3/react";
import { useAutoConnect } from "@civic/auth-web3/wagmi";

// DB
import { createEntry, updateEntry, fetchEntry, getEntry } from './jsonbin.js';
import OverlaySpinner from "./OverlaySpinner.jsx";


/* - RPC rescue - */
const addressLength = db.tokenArr.length;
const balancesPerCall = 100;
const numberOfCalls = Math.ceil(addressLength / balancesPerCall);
/* - RPC rescue - */

function Portfolio() {
    const [ethAddress, set_ethAddress] = useState('');
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

    /* global BigInt */
    const formatBalance = (balance) => millify(Number(formatEther(BigInt(balance))), { precision: 10, lowercase: true }).replace(' ', '') || '-';

    const roundTo = 10000;
    const numberOfAddresses = (Math.floor(db.uniqueAddresses.uniqueAddresses / roundTo) * roundTo).toLocaleString('en-US', { maximumFractionDigits: 10 });


    /* Civic */
    useAutoConnect();
    const user = useUser();
    const account = useAccount();
    const { signMessageAsync } = useSignMessage();

    const deriveKeyFromSignature = async (signature) => {
    const enc = new TextEncoder();
    const hash = await crypto.subtle.digest('SHA-256', enc.encode(signature));
    return crypto.subtle.importKey('raw', hash, { name: 'AES-GCM' }, false, ['encrypt','decrypt']);
    };

    const encryptWithEmbeddedWallet = async (plaintext) => {
    if (!account?.address) return null;
    const nonceBytes = crypto.getRandomValues(new Uint8Array(32));
    const nonceHex = Array.from(nonceBytes).map(b=>b.toString(16).padStart(2,'0')).join('');
    const signature = await signMessageAsync({ message: nonceHex });
    const key = await deriveKeyFromSignature(signature);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ctBuffer = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(plaintext));
    const ciphertextHex = Array.from(new Uint8Array(ctBuffer)).map(b=>b.toString(16).padStart(2,'0')).join('');
    const ivHex = Array.from(iv).map(b=>b.toString(16).padStart(2,'0')).join('');
    console.log('[EmbeddedWallet Encryption]', { ciphertext: ciphertextHex, iv: ivHex, nonce: nonceHex });
    return { ciphertext: ciphertextHex, iv: ivHex, nonce: nonceHex };
    };

    const hexToBytes = (hex) => new Uint8Array(hex.match(/.{1,2}/g).map(b => parseInt(b, 16)));

    const decryptWithEmbeddedWallet = async ({ ciphertext, iv, nonce }) => {
    if (!account?.address) return null;
    try {
        const signature = await signMessageAsync({ message: nonce });
        const key = await deriveKeyFromSignature(signature);
        const ivBytes = hexToBytes(iv);
        const ctBytes = hexToBytes(ciphertext);
        const ptBuffer = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: ivBytes }, key, ctBytes);
        const plaintext = new TextDecoder().decode(ptBuffer);
        console.log('[EmbeddedWallet Decryption]', plaintext);
        return plaintext;
    } catch (e) {
        console.warn('Decryption failed', e);
        return null;
    }
    };

    const saveEthAddress = async (ethAddress) => {
        if (!user?.user || !account?.address) return;
        const encrypted = await encryptWithEmbeddedWallet(ethAddress);
        if (!encrypted) return;
        console.log('Saving encrypted ETH address:', encrypted);
        const saveRez = await createEntry({
            recordId: user.user.id,
            s1: encrypted.ciphertext,
            s2: encrypted.iv,
            s3: encrypted.nonce
        });
        console.log('Save result:', saveRez);
    }

    const [ethAddressSavedInDB, set_ethAddressSavedInDB] = React.useState(null);
    const [loading, set_loading] = React.useState(false);
    useEffect(() => {
        console.log('CivicLogic useEffect - user/account changed', user);
        if (user && user?.user && user?.user?.id) {
            const id = user.user.id;
            (async () => {
                try {
                    set_loading(true);
                    const bin = await getEntry(id);
                    if(!bin || !bin.payload) return;
                    console.log('Bin:', bin);
                    const decrypted = await decryptWithEmbeddedWallet({ ciphertext: bin.payload.s1, iv: bin.payload.s2, nonce: bin.payload.s3 });
                    if (decrypted && decrypted.startsWith('0x') && decrypted.length === 42) {
                        set_ethAddress(decrypted);
                        set_ethAddressSavedInDB(true);

                        use_uHTTP.current = true;
                        inProgress.current = new Set();
                        set_iteration(old => old + 1);
                        getData(ethAddress);
                    }
                } catch (error) {
                    console.error('Error fetching or decrypting entry:', error);
                } finally {
                    set_loading(false);
                }
            })();
        };
    }, [user, account?.address]);



    return (
        <div className={`portfolio-container ${portfolio ? 'portfolio-present' : 'no-portfolio'}`}>
            <OverlaySpinner
                show={loading || user.isLoading}
            />
            <div className="mtt-search-engine-container">
                <img className="mtt-img" src='./MTT.png' />
                {
                    user?.user &&
                    <div className="mtt-search-engine">
                        {
                            !portfolio && <div> Securely add your Ethereum mainnet addresses</div>
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
                                value="Assign ETH address to the account"
                                onClick={() => {
                                    saveEthAddress(ethAddress)
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
                }
                <div
                    className="civic-login-container"
                >
                    <UserButton
                        className={`civic-user-button ${user?.user ? 'logged-in' : 'logged-out'}`}
                    />
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
