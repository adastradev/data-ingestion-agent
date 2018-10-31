
# Running Data Ingestion Agent behind an HTTPS proxy
This guide documents how to proxy internet traffic from a running docker container. It is not intended to replace the official docker documentation, but provides some steps for how to get started with respect to the Data Ingestion Agent.

For purposes of this article, we will be using [mitmproxy](https://hub.docker.com/r/mitmproxy/mitmproxy/) as a Docker container, for minimal change to the host operating system. This guide carries no such recommendation that this proxy be used for production purposes.

```sh
# First, let's run the image and point it to a proxy address
docker run -it \
-e ASTRA_CLOUD_USERNAME=mailbox@domain.com \
-e ASTRA_CLOUD_PASSWORD=******** \
-e PROCESS_MAX_MEMORY_SIZE_MB=512 \
--env HTTPS_PROXY="http://localhost:8080" \
--env HTTP_PROXY="http://localhost:8080" \
--network=bridge --memory=512m adastradev/data-ingestion-agent:latest ingest

(node:34) UnhandledPromiseRejectionWarning: Error: connect ECONNREFUSED 127.0.0.1:8080
    at TCPConnectWrap.afterConnect [as oncomplete] (net.js:1191:14)

(node:34) UnhandledPromiseRejectionWarning: Unhandled promise rejection. This error originated either by throwing inside of an async function without a catch block, or by rejecting a promise which was not handled with .catch(). (rejection id: 2)
(node:34) [DEP0018] DeprecationWarning: Unhandled promise rejections are deprecated. In the future, promise rejections that are not handled will terminate the Node.js process with a non-zero exit code.
```
Always start with a test that fails, I say. Looks like the running docker container is not able to go out to the internet. Let's proceed with setting up a proxy server.

## Pre-requisites

### Host machine steps
```sh
https://hub.docker.com/r/mitmproxy/mitmproxy/
n --rm -it -p 8080:8080 mitmproxy/mitmproxy
# Test whether basic traffic is passing through the proxy
http_proxy=http://localhost:8080/ curl http://example.com/
https_proxy=http://localhost:8080/ curl -k https://example.com/

# Note that "localhost" has different meaning on the host vs guest container network. Let's set up a named bridge network to help make sure we have a routable path to the intended proxy server from the guest image. This will allow docker guests to reference the host ("localhost") via 192.168.0.1
docker network create -d bridge --subnet 192.168.0.0/24 --gateway 192.168.0.1 dockerProxyNetwork

# Let's start by doing a connectivity test that doesn't involve Data Ingestion Agent code. Launch the container with a /bin/bash shell instead of loading the DIA code:
docker run -it \
--env HTTPS_PROXY="http://192.168.0.1:8080" \
--env HTTP_PROXY="http://192.168.0.1:8080" \
--network=dockerProxyNetwork --entrypoint=/bin/bash adastradev/data-ingestion-agent:latest
```

On the running interactive container, perform the following steps:

`curl http://example.com`
<details>
<summary>Expected http://example.com response</summary>
```
root@445dc9b01354:/app# curl http://example.com
<!doctype html>
<html>
<head>
    <title>Example Domain</title>

    <meta charset="utf-8" />
    <meta http-equiv="Content-type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style type="text/css">
    body {
        background-color: #f0f0f2;
        margin: 0;
        padding: 0;
        font-family: "Open Sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
        
    }
    div {
        width: 600px;
        margin: 5em auto;
        padding: 50px;
        background-color: #fff;
        border-radius: 1em;
    }
    a:link, a:visited {
        color: #38488f;
        text-decoration: none;
    }
    @media (max-width: 700px) {
        body {
            background-color: #fff;
        }
        div {
            width: auto;
            margin: 0 auto;
            border-radius: 0;
            padding: 1em;
        }
    }
    </style>    
</head>

<body>
<div>
    <h1>Example Domain</h1>
    <p>This domain is established to be used for illustrative examples in documents. You may use this
    domain in examples without prior coordination or asking for permission.</p>
    <p><a href="http://www.iana.org/domains/example">More information...</a></p>
</div>
</body>
</html>
```
</details>

`curl -k https://example.com`
<details>
<summary>Expected https://example.com response</summary>
```
root@445dc9b01354:/app# curl -k https://example.com
<!doctype html>
<html>
<head>
    <title>Example Domain</title>

    <meta charset="utf-8" />
    <meta http-equiv="Content-type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style type="text/css">
    body {
        background-color: #f0f0f2;
        margin: 0;
        padding: 0;
        font-family: "Open Sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
        
    }
    div {
        width: 600px;
        margin: 5em auto;
        padding: 50px;
        background-color: #fff;
        border-radius: 1em;
    }
    a:link, a:visited {
        color: #38488f;
        text-decoration: none;
    }
    @media (max-width: 700px) {
        body {
            background-color: #fff;
        }
        div {
            width: auto;
            margin: 0 auto;
            border-radius: 0;
            padding: 1em;
        }
    }
    </style>    
</head>

<body>
<div>
    <h1>Example Domain</h1>
    <p>This domain is established to be used for illustrative examples in documents. You may use this
    domain in examples without prior coordination or asking for permission.</p>
    <p><a href="http://www.iana.org/domains/example">More information...</a></p>
</div>
</body>
</html>
```
</details>

### Docker container steps
```sh
# Let's start by doing a connectivity test that doesn't involve Data Ingestion Agent code. Launch the container with a /bin/bash shell instead of loading the DIA code:
docker run -it \
-e LOG_LEVEL=debug \
-e ASTRA_CLOUD_USERNAME=mailbox@domain.com \
-e ASTRA_CLOUD_PASSWORD=******** \
-e PROCESS_MAX_MEMORY_SIZE_MB=512 \
--env HTTPS_PROXY="http://192.168.0.1:8080" \
--env HTTP_PROXY="http://192.168.0.1:8080" \
--network=dockerProxyNetwork --memory=512m adastradev/data-ingestion-agent:latest
```

<details>
<summary>Expected ingest results</summary>
> @adastradev/data-ingestion-agent@1.0.0 start /app
> node dist/start.js "ingest"

healthcheck server
(node:34) UnhandledPromiseRejectionWarning: Error: self signed certificate in certificate chain
    at TLSSocket.<anonymous> (_tls_wrap.js:1116:38)
    at emitNone (events.js:106:13)
    at TLSSocket.emit (events.js:208:7)
    at TLSSocket._finishInit (_tls_wrap.js:643:8)
    at TLSWrap.ssl.onhandshakedone (_tls_wrap.js:473:38)

(node:34) UnhandledPromiseRejectionWarning: Unhandled promise rejection. This error originated either by throwing inside of an async function without a catch block, or by rejecting a promise which was not handled with .catch(). (rejection id: 2)
(node:34) [DEP0018] DeprecationWarning: Unhandled promise rejections are deprecated. In the future, promise rejections that are not handled will terminate the Node.js process with a non-zero exit code.

Agent Process exited with code 0; signal: null
</details>

Note that NodeJS is throwing an error for security reasons, as the development proxy server has a self-signed certificate.

### Certificate trust test
For a connectivity purposes, we'll run the ingest command one more time with another environment variable to deterine how NodeJS should handle this certificate failure. The `NODE_TLS_REJECT_UNAUTHORIZED` environment variable can be used to change the handling of self-signed certificates.
```
docker run -it \
-e LOG_LEVEL=debug \
-e ASTRA_CLOUD_USERNAME=mailbox@domain.com \
-e ASTRA_CLOUD_PASSWORD=******** \
-e PROCESS_MAX_MEMORY_SIZE_MB=512 \
-e NODE_TLS_REJECT_UNAUTHORIZED=0 \
--env HTTPS_PROXY="http://192.168.0.1:8080" \
--env HTTP_PROXY="http://192.168.0.1:8080" \
--network=dockerProxyNetwork --memory=512m adastradev/data-ingestion-agent:latest
```

This is not recommended for production, and shouldn't be necessary when pointing to a production-grade internet proxy.

