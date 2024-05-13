import type { DurableObjectState } from "./deps.ts";

export class ClientLog {
  state: DurableObjectState;

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
    this.sessions = [];
  }

  async fetch(request: Request) {
    const url = new URL(request.url);
    if (url.pathname == "/websocket") {
      if (request.headers.get("Upgrade") != "websocket") {
        return new Response("expected websocket", { status: 400 });
      }

      const pair = new WebSocketPair();
      await this.handleWebsocketSession(pair[1]);
      return new Response(null, { status: 101, webSocket: pair[0] });
    }

    if (url.pathname == "/" && request.method == "POST") {
      request
        .json()
        .then((json) => {
          const data = JSON.stringify({
            ip: request.headers.get("CF-Connecting-IP"),
            country: request.headers.get("CF-IPCountry"),
            cf: request?.cf,
            log: {
              timestamp: new Date().toJSON(),
              userAgent: request.headers.get("User-Agent"),
              type: "request",
              method: json.method,
              params: json.params,
            },
          });

          this.sessions.forEach((session) => {
            session.webSocket.send(data);
          });
        })
        .catch((error) => {
          console.log("Cannot read JSON body:", error);
        });
    }

    return new Response("Not found", { status: 404 });
  }

  async handleWebsocketSession(webSocket) {
    webSocket.accept();

    const session = { webSocket };
    this.sessions.push(session);

    let closeOrErrorHandler = (evt) => {
      this.sessions = this.sessions.filter((member) => member !== session);
    };
    webSocket.addEventListener("close", closeOrErrorHandler);
    webSocket.addEventListener("error", closeOrErrorHandler);
  }
}

interface Env {}
