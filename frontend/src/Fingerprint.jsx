function Fingerprint() {
    return (
        <div 
            className="fingerprint"
            onClick={()=>{window.open('https://dune.com/hopr/token-fingerprinting', '_blank').focus();}}
        >
            <img src="./fingerprint.svg"/>
        </div>
    )
}

export default Fingerprint;
