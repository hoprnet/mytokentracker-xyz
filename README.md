# tokentracker-demo-app

Logo Endpoint: `/logo/{TOKEN_ETHEREUM_ADDRESS}`

Websocket Logs Endpoint: `/client_logs/websocket`

Token list is taken from `server/tokens.json`

## Run locally

Backend:


```bash
yarn
wrangler dev
```

or if dependencies are installed:

```bash
yarn start:be
```

Frontend:

```bash
cd frontend
yarn
yarn start
```

or if dependencies are installed:

```bash
yarn start:fe
```

## Front-end .env:

```
REACT_APP_BACKEND_URL=tokentracker.hoprnet.workers.dev  //'127.0.0.1:8787' if local server is used
REACT_APP_uHTTP_DP_ENDPOINT= //leave empty to use default
REACT_APP_uHTTP_TOKEN=
REACT_APP_uHTTP_FORCE_ZERO_HOP=true

```