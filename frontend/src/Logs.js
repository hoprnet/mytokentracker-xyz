import { useEffect, useState } from "react";

function Logs({serverurl}) {
    const [logs, add_Log] = useState([]);
    const [myIp, set_myIp] = useState(null);

    useEffect(() => {
        getMyIp();
        joinWebSocket();
    }, []);

    const joinWebSocket = () => {
        const wsUrl = `wss://${serverurl}/client_logs/websocket`;
        const ws = new WebSocket(wsUrl);

        ws.addEventListener("open", (event) => {
            console.log("debug websocket opened");
        });

        ws.addEventListener("message", (event) => {
            const data = JSON.parse(event.data);
            addLogEntry(data);
            console.log('debug ws message', event)
        });

        ws.addEventListener("close", (event) => {
            console.log("websocket closed, reconnecting:", event.code, event.reason);
            setTimeout(joinWebSocket(), 1000);
        });

        ws.addEventListener("error", (event) => {
            console.log("websocket error, reconnecting:", event);
        });
    };

    const addLogEntry = (entry) => {
        add_Log((prevState) => {
          const newState = [...prevState, entry];
          return newState;
        });
    };

    const getMyIp = async () => {
        const rez = await fetch('https://ifconfig.me/ip');
        const ip = await rez.text();
        set_myIp(ip);
    };

    return (
        <div className="logs">
            {
                logs.map((log)=>
                    <Log log={log} myIp={myIp}/>
                )
            }
        </div>
    );
}


function Log(props) {
    const ip = props.log.ip;
    const country = props.log.country;
    const path = props.log.log.path;
    const uesrAgent = props.log.log.userAgent;
    const city = props.log?.cf?.city;
    const postalCode = props.log?.cf?.postalCode;


    return (
        <div className="log">
            <span className="req">REQ >></span><br/>{' '}
            <span className="req">{'IP: '}</span><span className={`${props.myIp === ip ? `myIp` : ''}`}>{ip}</span>
            {' '}<span className="req">{'country: '}</span>{country}
            {' '}<span className="req">{'city: '}</span>{city}
            {' '}<span className="req">{'postal code: '}</span>{postalCode}<br/>
            <span className="req">{'url: '}</span>{path}<br/>
            <span className="req">{'User Agent: '}</span>{uesrAgent}
        </div>
    );
}


export default Logs;
