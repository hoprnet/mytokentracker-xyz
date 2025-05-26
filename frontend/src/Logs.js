import { useEffect, useState, useRef } from "react";
const serverurl = process.env.REACT_APP_BACKEND_URL;

function Logs() {
    const [logs, set_Log] = useState([]);
    const [logsHide, set_logsHide] = useState(false);
    const [myIp, set_myIp] = useState(null);
    const wsRef = useRef(null);

    useEffect(() => {
        getMyIp();

        // Clean up any previous websocket before creating a new one
        if (wsRef.current) {
            wsRef.current.close();
        }

        const wsUrl = `wss://${serverurl}/client_logs/websocket`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

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
            // Only reconnect if this is the current ws
            if (wsRef.current === ws) {
                setTimeout(() => {
                    wsRef.current = null;
                    // This will trigger useEffect again due to dependency on serverurl
                    // or you can force a reconnect here if needed
                }, 1000);
            }
        });

        ws.addEventListener("error", (event) => {
            console.log("websocket error, reconnecting:", event);
        });

        // Cleanup on unmount
        return () => {
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
        };
    }, [serverurl]);

    const addLogEntry = (entry) => {
        const entryWithId = {
            ...entry,
            uuid: window.crypto.randomUUID(),
        }
        set_Log((prevState) => {
            const newState = [entryWithId, ...prevState];
            return newState;
        });
    };

    const getMyIp = async () => {
        const rez = await fetch(`https://${serverurl}/myip`);
        const ip = await rez.text();
        set_myIp(ip);
    };

    return (
        <div className="logs">
            <div className="logs-buttons">
                <input
                    type="button"
                    value="Clear"
                    onClick={() => {
                        set_Log([])
                    }}
                />
                <input
                    type="button"
                    value={logsHide ? "Show" : "Hide"}
                    onClick={() => {
                        set_logsHide(prev => !prev)
                    }}
                />
            </div>
            {
                !logsHide && logs.map((log) =>
                    <Log
                        log={log}
                        myIp={myIp}
                        key={log.uuid}
                    />
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
            <span className="req">REQ >></span><br />{' '}
            <span className="req">{'IP: '}</span><span className={`${props.myIp === ip ? `myIp` : ''}`}>{ip}</span>
            {' '}<span className="req">{'country: '}</span>{country}
            {city && <>{' '}<span className="req">{'city: '}</span>{city}</>}
            {postalCode && <>{' '}<span className="req">{'postal code: '}</span>{postalCode}</>}
            <br />
            <span className="req">{'url: '}</span>{path}<br />
            <span className="req">{'User Agent: '}</span>{uesrAgent}
        </div>
    );
}


export default Logs;
