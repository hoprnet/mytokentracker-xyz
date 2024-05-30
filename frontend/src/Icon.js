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
            const blob = await rez.blob();
            const icon = URL.createObjectURL(blob);
            set_icon(icon);
        } catch (e) {
            console.warn(`No icon for ${ethAddress}`, e)
        }
    }

    async function getIcon_uHTTP(ethAddress) {
        set_ethAddress(ethAddress);
        try {
            const rez = await props.uHTTP.fetch(`https://${props.serverurl}/logo/${ethAddress}`)
            const blob = await rez.blob();
            const icon = URL.createObjectURL(blob);
            set_icon(icon);
        } catch (e) {
            console.warn(`[uHTTP] No icon for ${ethAddress}`, e)
        }
    }

    if (!icon) return <span>-</span>
    return (<img src={icon} />)
}

export default Icon;
