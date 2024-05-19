import { useEffect, useState } from "react";

function Icon(props) {
    const [icon, set_icon] = useState(null);
    const [ethAddress, set_ethAddress] = useState(null);

    useEffect(() => {
        if(ethAddress !== props.ethAddress) { 
            if(props.use_uHTTP) {
                getIcon_uHTTP(props.ethAddress) 
            } else {
                getIcon(props.ethAddress) 
            }
        }
    }, [props, ethAddress]);

    async function getIcon(ethAddress) {
        set_ethAddress(ethAddress);
        try {
            const rez = await fetch(`https://tokentracker.hoprnet.workers.dev/logo/${ethAddress}`, {cache: "no-store"})
            const blob = await rez.blob();
            const base64 = await new Promise((onSuccess, onError) => {
                try {
                  const reader = new FileReader() ;
                  reader.onload = function(){ onSuccess(this.result) } ;
                  reader.readAsDataURL(blob) ;
                } catch(e) {}
            });
            console.log('Got icon', ethAddress, base64)
            base64 && set_icon(base64)
        } catch(e) {
            console.warn(`No icon for ${ethAddress}`)
        }
    }

    async function getIcon_uHTTP(ethAddress) {
        set_ethAddress(ethAddress);

        props.uHTTP
            .fetch(`https://tokentracker.hoprnet.workers.dev/logo/${ethAddress}`)
            .then(async (resp) => {
                console.log('uHTTP', resp.text)  
                const base64 = await new Promise((onSuccess, onError) => {
                    try {
                      const reader = new FileReader() ;
                      reader.onload = function(){ onSuccess(this.result) } ;
                      reader.readAsDataURL(resp.text) ;
                    } catch(e) {}
                });
                console.log('Got icon', ethAddress, base64)
                base64 && set_icon(base64)
            })
            .catch((err) => {
                console.error('uHTTP error:', err);
            });
    }


    if(!icon) return <span>-</span>
    return (<img src={icon}/>)
}

export default Icon;
