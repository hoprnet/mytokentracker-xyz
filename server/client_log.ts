export class ClientLog {
  constructor(state, env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request: WorkerRequest) {
    const url = new URL(request.url);
    if (url.pathname == "/websocket") {
      if (request.headers.get("Upgrade") != "websocket") {
        return new Response("expected websocket", { status: 400 });
      }

      const wsPair = new WebSocketPair();
      const [client, server] = Object.values(wsPair);
      this.state.acceptWebSocket(server);

      return new Response(null, { status: 101, webSocket: client });
    }

    if (request.method == "GET") {
      const data = JSON.stringify({
        ip: request.headers.get("CF-Connecting-IP"),
        country: request.headers.get("CF-IPCountry"),
        cf: request?.cf,
        log: {
          timestamp: new Date().toJSON(),
          userAgent: request.headers.get("User-Agent"),
          type: "request",
          path: new URL(request.url).pathname,
        },
      });

      // traverse connections
      this.state.getWebSockets().forEach((ws) => {
        ws.send(data);
      });
    }

    return new Response("Not found", { status: 404 });
  }

  async webSocketMessage(ws, message) {
    // ignore client messages
  }

  async closeOrErrorHandler(ws) {
    // ignore close and error
  }

  async webSocketClose(webSocket, code, reason, wasClean) {
    this.closeOrErrorHandler(webSocket);
  }

  async webSocketError(webSocket, error) {
    this.closeOrErrorHandler(webSocket);
  }
}
