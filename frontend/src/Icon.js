import { useEffect, useState } from "react";


const serverurl = 'https://tokentracker.hoprnet.workers.dev' //'http://127.0.0.1:8787'

function Icon(props) {
    const [icon, set_icon] = useState(null);
    const [ethAddress, set_ethAddress] = useState(null);

    useEffect(() => {
        if (ethAddress !== props.ethAddress) {
            if (props.use_uHTTP) {
                getIcon_uHTTP(props.ethAddress)
            } else {
                getIcon(props.ethAddress)
            }
        }
    }, [props, ethAddress]);

    async function getIcon(ethAddress) {
        set_ethAddress(ethAddress);
        try {
            const rez = await fetch(`${serverurl}/logo/${ethAddress}`, { cache: "no-store" })
            const base64 = await rez.text();
            base64 && set_icon(base64)
        } catch (e) {
            console.warn(`No icon for ${ethAddress}`, e)
        }
    }

    async function getIcon_uHTTP(ethAddress) {
        set_ethAddress(ethAddress);

        props.uHTTP
            .fetch(`${serverurl}/logo/${ethAddress}`)
            .then(async (resp) => {
                const base64 = resp.text;
                console.log('Got icon', ethAddress, base64)
                base64 && set_icon(base64)
            })
            .catch((err) => {
                console.error('uHTTP error:', err);
            });
    }

    if (!icon) return <span>-</span>
    return (<img src={icon} />)
}

export default Icon;
