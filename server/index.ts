export default {
  async fetch(request: Request, env: Env, ctx: Context) {
    const url = new URL(request.url);

    // redirect to secure connections, unless on localhost (for testing)
    if (url.hostname != "localhost" && url.hostname != "127.0.0.1") {
      if (url.protocol == "http:" || url.protocol == "ws:") {
        const { pathname, search, host } = url;
        const secureProtocol = url.protocol
          .replace("http", "https")
          .replace("ws", "wss");
        const secureUrl = `${secureProtocol}//${host}${pathname}${search}`;
        return Response.redirect(secureUrl, 307);
      }

      // only pass when we are on secure connections
      if (url.protocol != "https:" && url.protocol != "wss:") {
        return new Response("Unsupported protocol", { status: 422 });
      }
    }

    const acceptContent = request.headers.get("accept");
    const contentType = request.headers.get("content-type");
    const method = request.method;
    const path = url.pathname.slice(1).split("/");
    const clientIp = request.headers.get("CF-Connecting-IP");
    const clientLogsId = env.client_logs.idFromName(clientIp);
    const logsObject = env.client_logs.get(clientLogsId);
    let newUrl = new URL(request.url);

    if (true) {
      newUrl.pathname = "/";
      let object = request.clone();
      object.cf.originalUrl = object.url;
      await logsObject.fetch(newUrl, object);
      return fetchFromProvider(chosenChain.originalUrl, request);
    }

    if (path[0] == "client_logs") {
      newUrl.pathname = "/" + path.slice(1).join("/");
      return logsObject.fetch(newUrl, request);
    }
    return new Response("Not found", { status: 404 });
  },
};

async function fetchFromProvider(provider: String, request: Request) {
  return fetch(provider, request).then(async function (response) {
    return response;
  });
}

// Make sure we export the Counter Durable Object class
export { ClientLog } from "./client_log.ts";
