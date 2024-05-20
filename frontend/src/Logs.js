import { useEffect, useState } from "react";

function Logs({serverurl}) {
    const [logs, add_Log] = useState([]);

    useEffect(() => {
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

    return (
        <div className="logs">
            {
                logs.map((log)=>
                    <Log log={log} />
                )
            }
        </div>
    );
}


function Log(props) {
    const ip = props.log.ip;
    const country = props.log.country;
    console.log('props.log', props.log)
   // const data = JSON.parse(props.log.data);

    return (
        <div className="log">
            {ip}
            {country}
            {
                JSON.stringify(props.log)
            }
        </div>
    );
}


export default Logs;
