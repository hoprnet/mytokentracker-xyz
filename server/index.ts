import type {
  Request as WorkerRequest,
  ExportedHandler,
  ExecutionContext,
} from "@cloudflare/workers-types";
import { Env } from "worker-configuration.js";
const Buffer = require('buffer/').Buffer

import tokensFile from "./tokens.json";

const tokens = tokensFile.tokens;

export async function handleRequest(
  request: WorkerRequest,
  env: Env,
  ctx: ExecutionContext,
): Promise<Response> {
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
  // use single logs object because we want to broadcast all logs to every
  // connected client
  const clientLogsId = env.client_logs.idFromName("main-shared");
  const logsObject = env.client_logs.get(clientLogsId);

  if (path[0] == "myip") {
    const clientIp = request.headers.get("CF-Connecting-IP");
    return new Response(clientIp, { status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });
  }

  if (path[0] == "logo") {
    const tokenAddress = path[1];
    const tokenInfo = tokens.find((t) => t.address == tokenAddress);
    if (tokenInfo) {
      const tokenLogoUrl = tokenInfo.logoURI;
      await logsObject.fetch(url, request.clone());
      return fetchLogo(tokenLogoUrl, request);
    }
    return new Response("Not found", { status: 404 });
  }

  if (path[0] == "client_logs") {
    const strippedUrl = new URL(request.url);
    strippedUrl.pathname = "/" + path.slice(1).join("/");
    return logsObject.fetch(strippedUrl, request);
  }

  return new Response("Not found", { status: 404 });
}

async function fetchLogo(url: string, request: WorkerRequest) {
  return fetch(url, request).then(async function (response) {
    const blob = await response.blob();
    let buffer = Buffer.from(await blob.arrayBuffer());
    const base64 =  "data:" + blob.type + ';base64,' + buffer.toString('base64');
    return new Response(base64, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });
  });
}

const worker: ExportedHandler<Bindings> = { fetch: handleRequest };

// Make sure we export the Counter Durable Object class
export { ClientLog } from "./client_log";
export default worker;
