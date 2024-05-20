import { useEffect, useState } from "react";


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
            const rez = await fetch(`https://${props.serverurl}/logo/${ethAddress}`, { cache: "no-store" })
            const base64 = await rez.text();
            if(base64 && base64.includes('base64')) {
                console.log('Got icon', ethAddress, base64);
                set_icon(base64);
            }
        } catch (e) {
            console.warn(`No icon for ${ethAddress}`, e)
        }
    }

    async function getIcon_uHTTP(ethAddress) {
        set_ethAddress(ethAddress);
        try {
            props.uHTTP
            .fetch(`https://${props.serverurl}/logo/${ethAddress}`)
            .then(async (resp) => {
                const base64 = resp.text;
                if(base64 && base64.includes('base64')) {
                    console.log('Got icon through uHTTP', ethAddress, base64);
                    set_icon(base64);
                }
            })
            .catch((err) => {
                console.error('uHTTP error:', err);
            });
        } catch (e) {
            console.warn(`No icon for ${ethAddress}`, e)
        }
    }

    if (!icon) return <span>-</span>
    return (<img src={icon} />)
}

export default Icon;
