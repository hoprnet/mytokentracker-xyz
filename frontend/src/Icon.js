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
            const rez = await fetch(`https://tokentracker.hoprnet.workers.dev/logo/${ethAddress}`, { cache: "no-store" })
            const blob = await rez.blob();
            console.log('debug blob', blob);


            // const text = await rez.text();
            // console.log('debug text', text);

            // var arrayBuffer = new ArrayBuffer(text);
            // const decoder = new TextDecoder('UTF-8');
            // let html = decoder.decode(arrayBuffer)
            // console.log('debug html', html);

            // const blob = await new Response(text).blob();
            // console.log('debug blob', blob);


            // // let base64ImageString = Buffer.from(text).toString();
            // // console.log('debug base64ImageString', base64ImageString);

            // const blob2 = new Blob([text], {
            //     type: 'image/png',
            // });
            // console.log('debug blob2', blob2);

            const base64 = await new Promise((onSuccess, onError) => {
                try {
                    const reader = new FileReader();
                    reader.onload = function () { onSuccess(this.result) };
                    reader.readAsDataURL(blob);
                } catch (e) { }
            });
            console.log('debug base64', ethAddress, base64)


            const b64String = base64.split(',')[1];
            var byteString = atob(b64String);
            console.log('debug byteString', byteString);
        //    var byteString = text;
            var arrayBuffer = new ArrayBuffer(byteString.length);
            console.log('debug arrayBuffer', arrayBuffer);
            var intArray = new Uint8Array(arrayBuffer);
            console.log('debug intArray', intArray);
            for (var i = 0; i < byteString.length; i++) {
                intArray[i] = byteString.charCodeAt(i);
            }
            console.log('debug intArray', intArray);
            // var blob2 = new Blob([intArray], { type: 'image/png' });
            // console.log('debug imageBlob', blob2);

            // const base64 = await new Promise((onSuccess, onError) => {
            //     try {
            //       const reader = new FileReader() ;
            //       reader.onload = function(){ onSuccess(this.result) } ;
            //       reader.readAsDataURL(blob) ;
            //     } catch(e) {}
            // });
            // console.log('debug base64', base64);
          //  base64 && set_icon(base64)
        } catch (e) {
            console.warn(`No icon for ${ethAddress}`, e)
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
                        const reader = new FileReader();
                        reader.onload = function () { onSuccess(this.result) };
                        reader.readAsDataURL(resp.text);
                    } catch (e) { }
                });
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
