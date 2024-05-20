import { useEffect, useState } from "react";

function Logs() {
    const [log, setLog] = useState([]);

    useEffect(() => {
        joinWebSocket();
        //eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);

    const joinWebSocket = () => {
        const wsUrl = "wss://tokentracker.hoprnet.workers.dev/client_logs/websocket";
        const ws = new WebSocket(wsUrl);

        ws.addEventListener("open", (event) => {
            console.log("debug websocket opened");
            // currentWebSocket = ws;
            // setConnectionStatus();
        });

        ws.addEventListener("message", (event) => {
            const data = JSON.parse(event.data);
            addLogEntry(data.log);
            //   getAndParseDataFromEntry(data.log);
            //   updateIp(data.ip, data.country);
            //   updateInfo(data.cf);
            //   set_numberOfCalls(prevNumberOfCalls => prevNumberOfCalls + 1);
            console.log('debug ws message', event)
        });

        ws.addEventListener("close", (event) => {
            console.log("websocket closed, reconnecting:", event.code, event.reason);
            //  unsetConnectionStatus();
            setTimeout(joinWebSocket(), 1000);
        });

        ws.addEventListener("error", (event) => {
            console.log("websocket error, reconnecting:", event);
            // unsetConnectionStatus();
            //   setTimeout(join(), 1000);
        });
    };

    const addLogEntry = (entry) => {
        setLog((prevState) => {
          const newState = [...prevState, entry];
          return newState;
        });
      };

    return (
        <div className="logs">
            <pre>
                {JSON.stringify(log, undefined, 2)}
            </pre>
        </div>
    );
}

export default Logs;
