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

function Portfolio({ serverurl }) {
    const [ethAddress, set_ethAddress] = useState('0x11b815efb8f581194ae79006d24e0d814b7697f6');
    const [lastEthAddress, set_lastEthAddress] = useState('');
    const [portfolio, set_portfolio] = useState(null);
    const [portfolioLoading, set_portfolioLoading] = useState(false);
    const [use_uHTTP, set_use_uHTTP] = useState(false);

    // useEffect(()=>{
    //     const x = {
    //         "address": "0x11b815efb8f581194ae79006d24e0d814b7697f6",
    //         "ETH": {
    //             "price": {
    //                 "rate": 3650.6266071721407,
    //                 "diff": 17.6,
    //                 "diff7d": 25.31,
    //                 "ts": 1716281220,
    //                 "marketCapUsd": 438540460749.76263,
    //                 "availableSupply": 120127448.77501075,
    //                 "volume24h": 38230357223.880165,
    //                 "volDiff1": 134.53923943044015,
    //                 "volDiff7": 89.02655232322815,
    //                 "volDiff30": -16.949947387576586,
    //                 "diff30d": 15.803583487437805
    //             },
    //             "balance": 0,
    //             "rawBalance": "0"
    //         },
    //         "tokens": [
    //             {
    //                 "tokenInfo": {
    //                     "address": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    //                     "name": "WETH",
    //                     "decimals": "18",
    //                     "symbol": "WETH",
    //                     "totalSupply": "2934370704195274840854267",
    //                     "owner": "",
    //                     "lastUpdated": 1716281096,
    //                     "issuancesCount": 71941615,
    //                     "price": {
    //                         "rate": 3659.109854415175,
    //                         "diff": 18.1,
    //                         "diff7d": 25.63,
    //                         "ts": 1716281100,
    //                         "marketCapUsd": 0,
    //                         "availableSupply": 0,
    //                         "volume24h": 2120453784.4125946,
    //                         "volDiff1": 78.74454600394358,
    //                         "volDiff7": 38.43083927780188,
    //                         "volDiff30": -27.156355754552294,
    //                         "diff30d": 15.769343512026552,
    //                         "bid": 2944.99,
    //                         "currency": "USD"
    //                     },
    //                     "holdersCount": 1023700,
    //                     "website": "https://weth.io",
    //                     "image": "/images/WETHc02aaa39.png",
    //                     "ethTransfersCount": 5917067,
    //                     "publicTags": [
    //                         "Tokenized",
    //                         "ETH"
    //                     ]
    //                 },
    //                 "balance": 3.4067283298742913e+21,
    //                 "rawBalance": "3406728329874291068984"
    //             },
    //             {
    //                 "tokenInfo": {
    //                     "address": "0xdac17f958d2ee523a2206206994597c13d831ec7",
    //                     "name": "Tether USD",
    //                     "decimals": "6",
    //                     "symbol": "USDT",
    //                     "totalSupply": "50998658367642960",
    //                     "owner": "0xc6cde7c39eb2f0f0095f41570af89efc2c1ea828",
    //                     "lastUpdated": 1716280579,
    //                     "issuancesCount": 1,
    //                     "price": {
    //                         "rate": 0.9998163333003541,
    //                         "diff": -0.01,
    //                         "diff7d": 0.03,
    //                         "ts": 1716281040,
    //                         "marketCapUsd": 111343762501.01291,
    //                         "availableSupply": 111364216399.09758,
    //                         "volume24h": 105961325992.41592,
    //                         "volDiff1": 93.65892200368606,
    //                         "volDiff7": 63.352863946082294,
    //                         "volDiff30": -22.089192036443876,
    //                         "diff30d": -0.05902106642986382,
    //                         "bid": 1.002,
    //                         "currency": "USD"
    //                     },
    //                     "holdersCount": 5720741,
    //                     "website": "https://tether.to/",
    //                     "image": "/images/tether.png",
    //                     "ethTransfersCount": 0,
    //                     "publicTags": [
    //                         "Stablecoins"
    //                     ]
    //                 },
    //                 "balance": 31779112235004,
    //                 "rawBalance": "31779112235004"
    //             },
    //             {
    //                 "tokenInfo": {
    //                     "address": "0x5b52bfb8062ce664d74bbcd4cd6dc7df53fd7233",
    //                     "decimals": "18",
    //                     "name": "ZENIQ",
    //                     "symbol": "ZENIQ",
    //                     "totalSupply": "106000000000000000000000000",
    //                     "lastUpdated": 1716255841,
    //                     "issuancesCount": 20,
    //                     "price": {
    //                         "rate": 0.02031265,
    //                         "diff": 3.21,
    //                         "diff7d": -9.93,
    //                         "ts": 1716280579,
    //                         "marketCapUsd": 0,
    //                         "availableSupply": 0,
    //                         "volume24h": 79982.20143384946,
    //                         "volDiff1": 2325.047998475893,
    //                         "volDiff7": -2.4077404277960426,
    //                         "volDiff30": -18.075454665243967,
    //                         "bid": 0.02031265,
    //                         "currency": "USD"
    //                     },
    //                     "holdersCount": 8459,
    //                     "website": "https://zeniq.com",
    //                     "ethTransfersCount": 0
    //                 },
    //                 "balance": 1313588650000000000,
    //                 "rawBalance": "1313588650000000000"
    //             },
    //             {
    //                 "tokenInfo": {
    //                     "address": "0x15d4c048f83bd7e37d49ea4c83a07267ec4203da",
    //                     "decimals": "8",
    //                     "name": "Gala",
    //                     "owner": "0xb46e97059bb733510a32fcb9e2d1b3655cd84e03",
    //                     "symbol": "GALA",
    //                     "totalSupply": "4495937554480643604",
    //                     "lastUpdated": 1716281007,
    //                     "issuancesCount": 195308,
    //                     "price": false,
    //                     "holdersCount": 261886,
    //                     "ethTransfersCount": 0,
    //                     "publicTags": [
    //                         "NFT"
    //                     ]
    //                 },
    //                 "balance": 1070000000000,
    //                 "rawBalance": "1070000000000"
    //             },
    //             {
    //                 "tokenInfo": {
    //                     "address": "0xe747fff1533bef9b6085b5d4955ba3aec2366fb3",
    //                     "decimals": "8",
    //                     "name": "auroom.finance",
    //                     "owner": "0x75c1d32d201b114d71163151f9c546aca8da57f2",
    //                     "symbol": "auroom.finance",
    //                     "totalSupply": "100000000000000",
    //                     "issuancesCount": 1,
    //                     "lastUpdated": 1663164825,
    //                     "holdersCount": 319,
    //                     "ethTransfersCount": 0,
    //                     "price": false
    //                 },
    //                 "balance": 5071371900,
    //                 "rawBalance": "5071371900"
    //             },
    //             {
    //                 "tokenInfo": {
    //                     "address": "0xad3c09b81929201530c4c6223a38e919a619cc32",
    //                     "decimals": "18",
    //                     "name": "NGP Energy",
    //                     "symbol": "NGPE",
    //                     "totalSupply": "1000000000000000000000000000",
    //                     "issuancesCount": 1,
    //                     "lastUpdated": 1670837223,
    //                     "holdersCount": 210,
    //                     "ethTransfersCount": 0,
    //                     "price": false
    //                 },
    //                 "balance": 7.89996e+24,
    //                 "rawBalance": "7899960000000000000000000"
    //             },
    //             {
    //                 "tokenInfo": {
    //                     "address": "0xb8366948b4a3f07bcbf14eb1739daa42a26b07c4",
    //                     "name": "VALOBIT",
    //                     "decimals": "18",
    //                     "symbol": "VBIT",
    //                     "totalSupply": "1600000000000000000000000000",
    //                     "owner": "",
    //                     "lastUpdated": 1716138251,
    //                     "issuancesCount": 0,
    //                     "price": {
    //                         "rate": 0.061466,
    //                         "diff": 26.83,
    //                         "diff7d": 111.14,
    //                         "ts": 1716280525,
    //                         "marketCapUsd": 0,
    //                         "availableSupply": 0,
    //                         "volume24h": 1296.438187430033,
    //                         "volDiff1": 342.4292441237041,
    //                         "volDiff7": 1274.5345962855902,
    //                         "volDiff30": -8.989373959997934,
    //                         "bid": 0.061466,
    //                         "currency": "USD"
    //                     },
    //                     "holdersCount": 3246,
    //                     "image": "/images/VBITb8366948.png",
    //                     "website": "https://valobit.io/",
    //                     "ethTransfersCount": 0
    //                 },
    //                 "balance": 70000000000000000000,
    //                 "rawBalance": "70000000000000000000"
    //             },
    //             {
    //                 "tokenInfo": {
    //                     "address": "0xd1d2eb1b1e90b638588728b4130137d262c87cae",
    //                     "decimals": "8",
    //                     "name": "Gala",
    //                     "price": {
    //                         "rate": 0.041455695959862975,
    //                         "diff": -5.34,
    //                         "diff7d": 1.38,
    //                         "ts": 1716281100,
    //                         "marketCapUsd": 1487775462.8955789,
    //                         "availableSupply": 35888324353.209015,
    //                         "volume24h": 798229851.4748904,
    //                         "volDiff1": 164.23304339538726,
    //                         "volDiff7": 244.42094815239102,
    //                         "volDiff30": -24.063720767112045,
    //                         "diff30d": -16.390556898303814,
    //                         "bid": 0.04369208,
    //                         "currency": "USD"
    //                     },
    //                     "symbol": "GALA",
    //                     "totalSupply": "3792385369293488752",
    //                     "issuancesCount": 279573,
    //                     "lastUpdated": 1716281078,
    //                     "holdersCount": 223488,
    //                     "website": "https://gala.games",
    //                     "image": "/images/GALA15d4c048.png",
    //                     "ethTransfersCount": 0
    //                 },
    //                 "balance": 1070000000000,
    //                 "rawBalance": "1070000000000"
    //             },
    //             {
    //                 "tokenInfo": {
    //                     "address": "0x115ec79f1de567ec68b7ae7eda501b406626478e",
    //                     "name": "Carry",
    //                     "decimals": "18",
    //                     "symbol": "CRE",
    //                     "totalSupply": "9999999999999999970000000000",
    //                     "owner": "0xf19670d12d7e58a3b976d6fee1cf77e1ae0c9290",
    //                     "lastUpdated": 1716269401,
    //                     "issuancesCount": 15,
    //                     "price": {
    //                         "rate": 0.006599274695503958,
    //                         "diff": 0,
    //                         "diff7d": 1.7,
    //                         "ts": 1716281100,
    //                         "marketCapUsd": 65992746.955039576,
    //                         "availableSupply": 10000000000,
    //                         "volume24h": 1985.6597519150523,
    //                         "volDiff1": 5699.604052297039,
    //                         "volDiff7": -64.228099634427,
    //                         "volDiff30": 346.4670823480378,
    //                         "diff30d": 9.383578032806923,
    //                         "bid": 0.00583588,
    //                         "currency": "USD"
    //                     },
    //                     "holdersCount": 29463,
    //                     "image": "/images/CRE115ec79f.png",
    //                     "website": "https://carryprotocol.io/",
    //                     "ethTransfersCount": 0
    //                 },
    //                 "balance": 5000000000000000,
    //                 "rawBalance": "5000000000000000"
    //             },
    //             {
    //                 "tokenInfo": {
    //                     "address": "0xc5fb36dd2fb59d3b98deff88425a3f425ee469ed",
    //                     "decimals": "9",
    //                     "name": "Dejitaru Tsuka",
    //                     "owner": "0x0000000000000000000000000000000000000000",
    //                     "symbol": "TSUKA",
    //                     "totalSupply": "1000000000000000000",
    //                     "issuancesCount": 1,
    //                     "lastUpdated": 1716279961,
    //                     "price": {
    //                         "rate": 0.0149322093972477,
    //                         "diff": 8.02,
    //                         "diff7d": 17.97,
    //                         "ts": 1716281160,
    //                         "marketCapUsd": 14932209.3972477,
    //                         "availableSupply": 1000000000,
    //                         "volume24h": 451339.8820508713,
    //                         "volDiff1": 32.95721284610832,
    //                         "volDiff7": 28.8253599459417,
    //                         "volDiff30": -47.33017270794831,
    //                         "diff30d": -40.69950951633668,
    //                         "bid": 0.01409382,
    //                         "currency": "USD"
    //                     },
    //                     "holdersCount": 14508,
    //                     "website": "https://www.dejitarutsuka.io",
    //                     "image": "/images/TSUKAc5fb36dd.png",
    //                     "ethTransfersCount": 18
    //                 },
    //                 "balance": 5503023795,
    //                 "rawBalance": "5503023795"
    //             },
    //             {
    //                 "tokenInfo": {
    //                     "address": "0x6226e00bcac68b0fe55583b90a1d727c14fab77f",
    //                     "decimals": "18",
    //                     "name": "MultiVAC",
    //                     "owner": "",
    //                     "symbol": "MTV",
    //                     "totalSupply": "10000000000000000000000000000",
    //                     "lastUpdated": 1716279438,
    //                     "issuancesCount": 1,
    //                     "price": false,
    //                     "holdersCount": 19358,
    //                     "website": "https://www.mtv.ac",
    //                     "image": "/images/MTV6226e00b.png",
    //                     "ethTransfersCount": 0
    //                 },
    //                 "balance": 1e+21,
    //                 "rawBalance": "1000000000000000000000"
    //             },
    //             {
    //                 "tokenInfo": {
    //                     "address": "0x57b9d10157f66d8c00a815b5e289a152dedbe7ed",
    //                     "decimals": "6",
    //                     "name": "环球股",
    //                     "symbol": "HQG",
    //                     "totalSupply": "10000000000000000",
    //                     "lastUpdated": 1716261290,
    //                     "issuancesCount": 0,
    //                     "price": false,
    //                     "holdersCount": 84490,
    //                     "ethTransfersCount": 0
    //                 },
    //                 "balance": 4300000,
    //                 "rawBalance": "4300000"
    //             },
    //             {
    //                 "tokenInfo": {
    //                     "address": "0xe627b9cda8398859f5f8d3f7e1cb48ec262aa4a6",
    //                     "decimals": "18",
    //                     "lastUpdated": 1697886328,
    //                     "name": "RektGAME",
    //                     "owner": "0x7a3bfbbb5247ce0331ddcdff75348275132b8efd",
    //                     "price": false,
    //                     "symbol": "REKT",
    //                     "totalSupply": "1000000000000000000000000",
    //                     "issuancesCount": 1,
    //                     "holdersCount": 361,
    //                     "ethTransfersCount": 0
    //                 },
    //                 "balance": 75533000000000000000,
    //                 "rawBalance": "75533000000000000000"
    //             },
    //             {
    //                 "tokenInfo": {
    //                     "address": "0xb77993e94068292b79cb5fb59ab9a25c98bcd2b6",
    //                     "decimals": "18",
    //                     "lastUpdated": 1706950268,
    //                     "name": "PUMP ",
    //                     "price": false,
    //                     "symbol": "PMP",
    //                     "totalSupply": "500000000000000000000000",
    //                     "issuancesCount": 1,
    //                     "holdersCount": 12,
    //                     "ethTransfersCount": 0
    //                 },
    //                 "balance": 5e+21,
    //                 "rawBalance": "5000000000000000000000"
    //             },
    //             {
    //                 "tokenInfo": {
    //                     "address": "0x58b580c1d86c04a97d981e66fa64a73342864bdc",
    //                     "decimals": "18",
    //                     "name": "Hedge Stable Finance",
    //                     "owner": "0x67dc38d42aa80676940a9922bb5b7010e06e672c",
    //                     "symbol": "HDSF",
    //                     "totalSupply": "243633197000000000000000000",
    //                     "issuancesCount": 1,
    //                     "lastUpdated": 1714131022,
    //                     "price": false,
    //                     "holdersCount": 641,
    //                     "ethTransfersCount": 0
    //                 },
    //                 "balance": 46000000000000000000,
    //                 "rawBalance": "46000000000000000000"
    //             },
    //             {
    //                 "tokenInfo": {
    //                     "address": "0x58b580c1d86c04a97d981e66fa64a73342864bdc",
    //                     "decimals": "18",
    //                     "name": "Hedge Stable Finance",
    //                     "owner": "0x67dc38d42aa80676940a9922bb5b7010e06e672c",
    //                     "symbol": "HDSF",
    //                     "totalSupply": "243633197000000000000000000",
    //                     "issuancesCount": 1,
    //                     "lastUpdated": 1714131022,
    //                     "price": false,
    //                     "holdersCount": 641,
    //                     "ethTransfersCount": 0
    //                 },
    //                 "balance": 46000000000000000000,
    //                 "rawBalance": "46000000000000000000"
    //             },
    //             {
    //                 "tokenInfo": {
    //                     "address": "0x58b580c1d86c04a97d981e66fa64a73342864bdc",
    //                     "decimals": "18",
    //                     "name": "Hedge Stable Finance",
    //                     "owner": "0x67dc38d42aa80676940a9922bb5b7010e06e672c",
    //                     "symbol": "HDSF",
    //                     "totalSupply": "243633197000000000000000000",
    //                     "issuancesCount": 1,
    //                     "lastUpdated": 1714131022,
    //                     "price": false,
    //                     "holdersCount": 641,
    //                     "ethTransfersCount": 0
    //                 },
    //                 "balance": 46000000000000000000,
    //                 "rawBalance": "46000000000000000000"
    //             },
    //             {
    //                 "tokenInfo": {
    //                     "address": "0x58b580c1d86c04a97d981e66fa64a73342864bdc",
    //                     "decimals": "18",
    //                     "name": "Hedge Stable Finance",
    //                     "owner": "0x67dc38d42aa80676940a9922bb5b7010e06e672c",
    //                     "symbol": "HDSF",
    //                     "totalSupply": "243633197000000000000000000",
    //                     "issuancesCount": 1,
    //                     "lastUpdated": 1714131022,
    //                     "price": false,
    //                     "holdersCount": 641,
    //                     "ethTransfersCount": 0
    //                 },
    //                 "balance": 46000000000000000000,
    //                 "rawBalance": "46000000000000000000"
    //             },
    //             {
    //                 "tokenInfo": {
    //                     "address": "0x58b580c1d86c04a97d981e66fa64a73342864bdc",
    //                     "decimals": "18",
    //                     "name": "Hedge Stable Finance",
    //                     "owner": "0x67dc38d42aa80676940a9922bb5b7010e06e672c",
    //                     "symbol": "HDSF",
    //                     "totalSupply": "243633197000000000000000000",
    //                     "issuancesCount": 1,
    //                     "lastUpdated": 1714131022,
    //                     "price": false,
    //                     "holdersCount": 641,
    //                     "ethTransfersCount": 0
    //                 },
    //                 "balance": 46000000000000000000,
    //                 "rawBalance": "46000000000000000000"
    //             },
    //             {
    //                 "tokenInfo": {
    //                     "address": "0x58b580c1d86c04a97d981e66fa64a73342864bdc",
    //                     "decimals": "18",
    //                     "name": "Hedge Stable Finance",
    //                     "owner": "0x67dc38d42aa80676940a9922bb5b7010e06e672c",
    //                     "symbol": "HDSF",
    //                     "totalSupply": "243633197000000000000000000",
    //                     "issuancesCount": 1,
    //                     "lastUpdated": 1714131022,
    //                     "price": false,
    //                     "holdersCount": 641,
    //                     "ethTransfersCount": 0
    //                 },
    //                 "balance": 46000000000000000000,
    //                 "rawBalance": "46000000000000000000"
    //             },
    //             {
    //                 "tokenInfo": {
    //                     "address": "0x58b580c1d86c04a97d981e66fa64a73342864bdc",
    //                     "decimals": "18",
    //                     "name": "Hedge Stable Finance",
    //                     "owner": "0x67dc38d42aa80676940a9922bb5b7010e06e672c",
    //                     "symbol": "HDSF",
    //                     "totalSupply": "243633197000000000000000000",
    //                     "issuancesCount": 1,
    //                     "lastUpdated": 1714131022,
    //                     "price": false,
    //                     "holdersCount": 641,
    //                     "ethTransfersCount": 0
    //                 },
    //                 "balance": 46000000000000000000,
    //                 "rawBalance": "46000000000000000000"
    //             },
    //             {
    //                 "tokenInfo": {
    //                     "address": "0x58b580c1d86c04a97d981e66fa64a73342864bdc",
    //                     "decimals": "18",
    //                     "name": "Hedge Stable Finance",
    //                     "owner": "0x67dc38d42aa80676940a9922bb5b7010e06e672c",
    //                     "symbol": "HDSF",
    //                     "totalSupply": "243633197000000000000000000",
    //                     "issuancesCount": 1,
    //                     "lastUpdated": 1714131022,
    //                     "price": false,
    //                     "holdersCount": 641,
    //                     "ethTransfersCount": 0
    //                 },
    //                 "balance": 46000000000000000000,
    //                 "rawBalance": "46000000000000000000"
    //             },
    //             {
    //                 "tokenInfo": {
    //                     "address": "0x58b580c1d86c04a97d981e66fa64a73342864bdc",
    //                     "decimals": "18",
    //                     "name": "Hedge Stable Finance",
    //                     "owner": "0x67dc38d42aa80676940a9922bb5b7010e06e672c",
    //                     "symbol": "HDSF",
    //                     "totalSupply": "243633197000000000000000000",
    //                     "issuancesCount": 1,
    //                     "lastUpdated": 1714131022,
    //                     "price": false,
    //                     "holdersCount": 641,
    //                     "ethTransfersCount": 0
    //                 },
    //                 "balance": 46000000000000000000,
    //                 "rawBalance": "46000000000000000000"
    //             },
    //             {
    //                 "tokenInfo": {
    //                     "address": "0x58b580c1d86c04a97d981e66fa64a73342864bdc",
    //                     "decimals": "18",
    //                     "name": "Hedge Stable Finance",
    //                     "owner": "0x67dc38d42aa80676940a9922bb5b7010e06e672c",
    //                     "symbol": "HDSF",
    //                     "totalSupply": "243633197000000000000000000",
    //                     "issuancesCount": 1,
    //                     "lastUpdated": 1714131022,
    //                     "price": false,
    //                     "holdersCount": 641,
    //                     "ethTransfersCount": 0
    //                 },
    //                 "balance": 46000000000000000000,
    //                 "rawBalance": "46000000000000000000"
    //             },
    //             {
    //                 "tokenInfo": {
    //                     "address": "0x58b580c1d86c04a97d981e66fa64a73342864bdc",
    //                     "decimals": "18",
    //                     "name": "Hedge Stable Finance",
    //                     "owner": "0x67dc38d42aa80676940a9922bb5b7010e06e672c",
    //                     "symbol": "HDSF",
    //                     "totalSupply": "243633197000000000000000000",
    //                     "issuancesCount": 1,
    //                     "lastUpdated": 1714131022,
    //                     "price": false,
    //                     "holdersCount": 641,
    //                     "ethTransfersCount": 0
    //                 },
    //                 "balance": 46000000000000000000,
    //                 "rawBalance": "46000000000000000000"
    //             },
    //             {
    //                 "tokenInfo": {
    //                     "address": "0x58b580c1d86c04a97d981e66fa64a73342864bdc",
    //                     "decimals": "18",
    //                     "name": "Hedge Stable Finance",
    //                     "owner": "0x67dc38d42aa80676940a9922bb5b7010e06e672c",
    //                     "symbol": "HDSF",
    //                     "totalSupply": "243633197000000000000000000",
    //                     "issuancesCount": 1,
    //                     "lastUpdated": 1714131022,
    //                     "price": false,
    //                     "holdersCount": 641,
    //                     "ethTransfersCount": 0
    //                 },
    //                 "balance": 46000000000000000000,
    //                 "rawBalance": "46000000000000000000"
    //             },
    //             {
    //                 "tokenInfo": {
    //                     "address": "0x58b580c1d86c04a97d981e66fa64a73342864bdc",
    //                     "decimals": "18",
    //                     "name": "Hedge Stable Finance",
    //                     "owner": "0x67dc38d42aa80676940a9922bb5b7010e06e672c",
    //                     "symbol": "HDSF",
    //                     "totalSupply": "243633197000000000000000000",
    //                     "issuancesCount": 1,
    //                     "lastUpdated": 1714131022,
    //                     "price": false,
    //                     "holdersCount": 641,
    //                     "ethTransfersCount": 0
    //                 },
    //                 "balance": 46000000000000000000,
    //                 "rawBalance": "46000000000000000000"
    //             },
    //             {
    //                 "tokenInfo": {
    //                     "address": "0x58b580c1d86c04a97d981e66fa64a73342864bdc",
    //                     "decimals": "18",
    //                     "name": "Hedge Stable Finance",
    //                     "owner": "0x67dc38d42aa80676940a9922bb5b7010e06e672c",
    //                     "symbol": "HDSF",
    //                     "totalSupply": "243633197000000000000000000",
    //                     "issuancesCount": 1,
    //                     "lastUpdated": 1714131022,
    //                     "price": false,
    //                     "holdersCount": 641,
    //                     "ethTransfersCount": 0
    //                 },
    //                 "balance": 46000000000000000000,
    //                 "rawBalance": "46000000000000000000"
    //             },
    //             {
    //                 "tokenInfo": {
    //                     "address": "0x58b580c1d86c04a97d981e66fa64a73342864bdc",
    //                     "decimals": "18",
    //                     "name": "Hedge Stable Finance",
    //                     "owner": "0x67dc38d42aa80676940a9922bb5b7010e06e672c",
    //                     "symbol": "HDSF",
    //                     "totalSupply": "243633197000000000000000000",
    //                     "issuancesCount": 1,
    //                     "lastUpdated": 1714131022,
    //                     "price": false,
    //                     "holdersCount": 641,
    //                     "ethTransfersCount": 0
    //                 },
    //                 "balance": 46000000000000000000,
    //                 "rawBalance": "46000000000000000000"
    //             },
    //             {
    //                 "tokenInfo": {
    //                     "address": "0x58b580c1d86c04a97d981e66fa64a73342864bdc",
    //                     "decimals": "18",
    //                     "name": "Hedge Stable Finance",
    //                     "owner": "0x67dc38d42aa80676940a9922bb5b7010e06e672c",
    //                     "symbol": "HDSF",
    //                     "totalSupply": "243633197000000000000000000",
    //                     "issuancesCount": 1,
    //                     "lastUpdated": 1714131022,
    //                     "price": false,
    //                     "holdersCount": 641,
    //                     "ethTransfersCount": 0
    //                 },
    //                 "balance": 46000000000000000000,
    //                 "rawBalance": "46000000000000000000"
    //             },
    //             {
    //                 "tokenInfo": {
    //                     "address": "0x58b580c1d86c04a97d981e66fa64a73342864bdc",
    //                     "decimals": "18",
    //                     "name": "Hedge Stable Finance",
    //                     "owner": "0x67dc38d42aa80676940a9922bb5b7010e06e672c",
    //                     "symbol": "HDSF",
    //                     "totalSupply": "243633197000000000000000000",
    //                     "issuancesCount": 1,
    //                     "lastUpdated": 1714131022,
    //                     "price": false,
    //                     "holdersCount": 641,
    //                     "ethTransfersCount": 0
    //                 },
    //                 "balance": 46000000000000000000,
    //                 "rawBalance": "46000000000000000000"
    //             },
    //             {
    //                 "tokenInfo": {
    //                     "address": "0x58b580c1d86c04a97d981e66fa64a73342864bdc",
    //                     "decimals": "18",
    //                     "name": "Hedge Stable Finance",
    //                     "owner": "0x67dc38d42aa80676940a9922bb5b7010e06e672c",
    //                     "symbol": "HDSF",
    //                     "totalSupply": "243633197000000000000000000",
    //                     "issuancesCount": 1,
    //                     "lastUpdated": 1714131022,
    //                     "price": false,
    //                     "holdersCount": 641,
    //                     "ethTransfersCount": 0
    //                 },
    //                 "balance": 46000000000000000000,
    //                 "rawBalance": "46000000000000000000"
    //             },
    //             {
    //                 "tokenInfo": {
    //                     "address": "0x58b580c1d86c04a97d981e66fa64a73342864bdc",
    //                     "decimals": "18",
    //                     "name": "Hedge Stable Finance",
    //                     "owner": "0x67dc38d42aa80676940a9922bb5b7010e06e672c",
    //                     "symbol": "HDSF",
    //                     "totalSupply": "243633197000000000000000000",
    //                     "issuancesCount": 1,
    //                     "lastUpdated": 1714131022,
    //                     "price": false,
    //                     "holdersCount": 641,
    //                     "ethTransfersCount": 0
    //                 },
    //                 "balance": 46000000000000000000,
    //                 "rawBalance": "46000000000000000000"
    //             },
    //             {
    //                 "tokenInfo": {
    //                     "address": "0x58b580c1d86c04a97d981e66fa64a73342864bdc",
    //                     "decimals": "18",
    //                     "name": "Hedge Stable Finance",
    //                     "owner": "0x67dc38d42aa80676940a9922bb5b7010e06e672c",
    //                     "symbol": "HDSF",
    //                     "totalSupply": "243633197000000000000000000",
    //                     "issuancesCount": 1,
    //                     "lastUpdated": 1714131022,
    //                     "price": false,
    //                     "holdersCount": 641,
    //                     "ethTransfersCount": 0
    //                 },
    //                 "balance": 46000000000000000000,
    //                 "rawBalance": "46000000000000000000"
    //             },
    //             {
    //                 "tokenInfo": {
    //                     "address": "0x58b580c1d86c04a97d981e66fa64a73342864bdc",
    //                     "decimals": "18",
    //                     "name": "Hedge Stable Finance",
    //                     "owner": "0x67dc38d42aa80676940a9922bb5b7010e06e672c",
    //                     "symbol": "HDSF",
    //                     "totalSupply": "243633197000000000000000000",
    //                     "issuancesCount": 1,
    //                     "lastUpdated": 1714131022,
    //                     "price": false,
    //                     "holdersCount": 641,
    //                     "ethTransfersCount": 0
    //                 },
    //                 "balance": 46000000000000000000,
    //                 "rawBalance": "46000000000000000000"
    //             },
    //             {
    //                 "tokenInfo": {
    //                     "address": "0x58b580c1d86c04a97d981e66fa64a73342864bdc",
    //                     "decimals": "18",
    //                     "name": "Hedge Stable Finance",
    //                     "owner": "0x67dc38d42aa80676940a9922bb5b7010e06e672c",
    //                     "symbol": "HDSF",
    //                     "totalSupply": "243633197000000000000000000",
    //                     "issuancesCount": 1,
    //                     "lastUpdated": 1714131022,
    //                     "price": false,
    //                     "holdersCount": 641,
    //                     "ethTransfersCount": 0
    //                 },
    //                 "balance": 46000000000000000000,
    //                 "rawBalance": "46000000000000000000"
    //             },
    //             {
    //                 "tokenInfo": {
    //                     "address": "0x58b580c1d86c04a97d981e66fa64a73342864bdc",
    //                     "decimals": "18",
    //                     "name": "Hedge Stable Finance",
    //                     "owner": "0x67dc38d42aa80676940a9922bb5b7010e06e672c",
    //                     "symbol": "HDSF",
    //                     "totalSupply": "243633197000000000000000000",
    //                     "issuancesCount": 1,
    //                     "lastUpdated": 1714131022,
    //                     "price": false,
    //                     "holdersCount": 641,
    //                     "ethTransfersCount": 0
    //                 },
    //                 "balance": 46000000000000000000,
    //                 "rawBalance": "46000000000000000000"
    //             },
    //             {
    //                 "tokenInfo": {
    //                     "address": "0x58b580c1d86c04a97d981e66fa64a73342864bdc",
    //                     "decimals": "18",
    //                     "name": "Hedge Stable Finance",
    //                     "owner": "0x67dc38d42aa80676940a9922bb5b7010e06e672c",
    //                     "symbol": "HDSF",
    //                     "totalSupply": "243633197000000000000000000",
    //                     "issuancesCount": 1,
    //                     "lastUpdated": 1714131022,
    //                     "price": false,
    //                     "holdersCount": 641,
    //                     "ethTransfersCount": 0
    //                 },
    //                 "balance": 46000000000000000000,
    //                 "rawBalance": "46000000000000000000"
    //             },
    //             {
    //                 "tokenInfo": {
    //                     "address": "0x58b580c1d86c04a97d981e66fa64a73342864bdc",
    //                     "decimals": "18",
    //                     "name": "Hedge Stable Finance",
    //                     "owner": "0x67dc38d42aa80676940a9922bb5b7010e06e672c",
    //                     "symbol": "HDSF",
    //                     "totalSupply": "243633197000000000000000000",
    //                     "issuancesCount": 1,
    //                     "lastUpdated": 1714131022,
    //                     "price": false,
    //                     "holdersCount": 641,
    //                     "ethTransfersCount": 0
    //                 },
    //                 "balance": 46000000000000000000,
    //                 "rawBalance": "46000000000000000000"
    //             },
    //             {
    //                 "tokenInfo": {
    //                     "address": "0x58b580c1d86c04a97d981e66fa64a73342864bdc",
    //                     "decimals": "18",
    //                     "name": "Hedge Stable Finance",
    //                     "owner": "0x67dc38d42aa80676940a9922bb5b7010e06e672c",
    //                     "symbol": "HDSF",
    //                     "totalSupply": "243633197000000000000000000",
    //                     "issuancesCount": 1,
    //                     "lastUpdated": 1714131022,
    //                     "price": false,
    //                     "holdersCount": 641,
    //                     "ethTransfersCount": 0
    //                 },
    //                 "balance": 46000000000000000000,
    //                 "rawBalance": "46000000000000000000"
    //             }
    //         ]
    //     }
    //     set_portfolio(x);
    // },[])

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
        <div className={`portfolio-container ${portfolio ? 'portfolio-present' : 'no-portfolio'}`}>
            <div className="mtt-search-engine-container">
                <img src='./MTT.png'/>
                <div className="mtt-search-engine">
                    {
                        !portfolio && <div> Search 270,000,000 Ethereum mainnet addresses</div>
                    }

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
                    <div>
                    <input
                        type="button"
                        value="Get portfolio"
                        onClick={() => {
                            if (lastEthAddress !== ethAddress) {
                                getData(ethAddress);
                                set_lastEthAddress(lastEthAddress);
                            }
                            set_use_uHTTP(false);
                        }}
                    />
                    <input
                        type="button"
                        value="I am feeling private"
                        onClick={() => {
                            if (lastEthAddress !== ethAddress) {
                                getData(ethAddress);
                                set_lastEthAddress(lastEthAddress);
                            }
                            set_use_uHTTP(true);
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
                                        key={`${use_uHTTP}_${ethAddress}_${token?.tokenInfo?.address}`}
                                    >
                                        <td>
                                            <Icon
                                                ethAddress={token?.tokenInfo?.address}
                                                uHTTP={uHTTP}
                                                use_uHTTP={use_uHTTP}
                                                serverurl={serverurl}
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
            }


        </div>
    );
}

export default Portfolio;
