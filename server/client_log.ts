import { Request as WorkerRequest, DurableObjectState } from '@cloudflare/workers-types';

export class ClientLog {
  state: DurableObjectState;
  env: Env;
  sessions: WebSocket[];

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
    this.sessions = [];
  }

  async fetch(request: WorkerRequest) {
    const url = new URL(request.url);
    if (url.pathname == "/websocket") {
      if (request.headers.get("Upgrade") != "websocket") {
        return new Response("expected websocket", { status: 400 });
      }

      const pair = new WebSocketPair();
      await this.handleWebsocketSession(pair[1]);
      return new Response(null, { status: 101, webSocket: pair[0] });
    }

    if (request.method == "GET") {
      console.log("HANDLE GET");
      const data = JSON.stringify({
        ip: request.headers.get("CF-Connecting-IP"),
        country: request.headers.get("CF-IPCountry"),
        cf: request?.cf,
        log: {
          timestamp: new Date().toJSON(),
          userAgent: request.headers.get("User-Agent"),
          type: "request",
          path: request.path,
        },
      });

      console.log(this.sessions);
      this.sessions.forEach((session) => {
        console.log("SEND", data.log)
        session.send(data);
      });
    }

    return new Response("Not found", { status: 404 });
  }

  async handleWebsocketSession(webSocket: WebSocket) {
    webSocket.accept();

    console.log("ACCEPT WS");
    this.sessions.push(webSocket);
    console.log(this.sessions);

    let closeOrErrorHandler = (evt) => {
    console.log("CLOSE WS", evt);

      this.sessions = this.sessions.filter((member) => member !== webSocket);
    console.log(this.sessions);
    };
    webSocket.addEventListener("close", closeOrErrorHandler);
    webSocket.addEventListener("error", closeOrErrorHandler);
  }
}

interface Env {}
