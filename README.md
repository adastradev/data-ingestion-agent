# data-ingestion-agent
[![Coverage Status](https://coveralls.io/repos/github/adastradev/data-ingestion-agent/badge.svg?branch=master)](https://coveralls.io/github/adastradev/data-ingestion-agent?branch=master)

Ad Astra Docker agent code base for cloud integration without VPN tunnels

## Pre-requisites
Docker version 18.02 or greater (Community Edition or any Enterprise Edition)

#### Oracle
When connecting to an Oracle database the specified database user must be given read/execute access to the following:

- DBMS_METADATA.GET_DDL (function)
- ALL_TABLES (view)
- ALL_CONS_COLUMNS (view)
- ALL_CONSTRAINTS (view)
- All tables referenced by this agent (see 'Query Preview' section below)

## Resource Requirements

#### Docker Host

Memory:

* 8GB (Recommended)

#### Container

Memory:

* 4GB (Recommended)

## Install
```sh
docker pull adastradev/data-ingestion-agent:latest
```

## Run

```sh
# See Host System Requirements above for agent resource requirements
PROCESS_MAX_MEMORY_SIZE_MB=4096

docker run -d -t \
-m $PROCESS_MAX_MEMORY_SIZE_MB'M' \
-e PROCESS_MAX_MEMORY_SIZE_MB=$PROCESS_MAX_MEMORY_SIZE_MB \
-e ASTRA_CLOUD_USERNAME=<your_username> \
-e ASTRA_CLOUD_PASSWORD=<your_password> \
-e ORACLE_ENDPOINT=hostname:port/service_name \
-e ORACLE_USER=user \
-e ORACLE_PASSWORD=password \
--network=bridge \
adastradev/data-ingestion-agent:<tag>
```

To see a demo of the agent without connecting it to any data source, omit the ORACLE_* environment variables. In demo mode, the agent can verify connectivity to the Astra Cloud and push a mock dataset into S3.

The docker agent also supports the following optional arguments:
```sh
# [Demo, Banner, PeopleSoft, Colleague]
-e INTEGRATION_TYPE=Banner \
# [dev, prod]
-e DEFAULT_STAGE=prod \
-e AWS_REGION=us-east-1 \
-e CONCURRENT_CONNECTIONS=5 \
# [error, warn, info, verbose, debug, silly]
-e LOG_LEVEL=info
```

### Configure Network Access
The Data Ingestion Agent requires *outbound* internet access over HTTPS to Amazon Web Services (*.amazonaws.com). In general, the agent should be provided outbound internet access via providing a bridge network as shown above. If runnning through an internet proxy, it is recommended to configure the proxy at `docker run` time by using an environment variable `--env HTTPS_PROXY="https://127.0.0.1:3001"`. For more information, see the [Configure Docker to use a proxy server](https://docs.docker.com/network/proxy/).

No *inbound* access to the agent is required.

See [Getting started with HTTPS proxies](https://github.com/adastradev/data-ingestion-agent/blob/master/docs/HttpsProxy.md) for more information.

### Query Preview
Note: To see required table/field access for each integration type, see the following documentation:
- [Banner](https://github.com/adastradev/data-ingestion-agent/blob/master/docs/DataAccess/Banner.md)
- [DegreeWorks](https://github.com/adastradev/data-ingestion-agent/blob/master/docs/DataAccess/DegreeWorks.md)
- [PeopleSoft](https://github.com/adastradev/data-ingestion-agent/blob/master/docs/DataAccess/PeopleSoft.md)
- [Colleague](https://github.com/adastradev/data-ingestion-agent/blob/master/docs/DataAccess/Colleague.md) (Not Fully Supported)

Prior to sending any data you can run the following docker command to log each query to the console to examine each query. No data is sent to the destination using this command.

```sh
docker run -i \
-m $PROCESS_MAX_MEMORY_SIZE_MB'M' \
-e PROCESS_MAX_MEMORY_SIZE_MB=$PROCESS_MAX_MEMORY_SIZE_MB \
-e ASTRA_CLOUD_USERNAME=<your_username> \
-e ASTRA_CLOUD_PASSWORD=<your_password> \
--network=bridge \
adastradev/data-ingestion-agent:latest \
preview
```

### Adhoc Ingestion
To immediately begin the ingestion process you can run the following with the 'ingest' flag. This command will terminate the container once the process has completed.

```sh
# See Host System Requirements above for agent resource requirements
PROCESS_MAX_MEMORY_SIZE_MB=4096

docker run -i \
-m $PROCESS_MAX_MEMORY_SIZE_MB'M' \
-e PROCESS_MAX_MEMORY_SIZE_MB=$PROCESS_MAX_MEMORY_SIZE_MB \
-e ASTRA_CLOUD_USERNAME=<your_username> \
-e ASTRA_CLOUD_PASSWORD=<your_password> \
-e ORACLE_ENDPOINT=hostname:port/service_name \
-e ORACLE_USER=user \
-e ORACLE_PASSWORD=password \
--network=bridge \
adastradev/data-ingestion-agent:latest \
ingest
```

## Uninstall
The data ingestion agent is a long running process that may be performing work when an uninstall occurs. To reduce negative side effects of immediately stopping the agent it is advised to always stop the container with a grace period as shown below. Outright usage of `docker kill` is discouraged.

If multiple versions of the ingestion agent exist be sure to specify the optional tag when removing an image.

```sh
docker stop --time 10 <container_name_or_id>
docker rm <container_name_or_id>
docker rmi <image>:<tag>
```

## Administration

### Root Access to a running agent container
After starting the agent and confirming a healthy status you can use the containers name or ID to access the virtual machine via command line (bash) as follows:

```sh
docker exec -it <container_id_or_name> /bin/bash
```

### Container Health Monitoring
The data ingestion agent periodically informs docker of its current health. Using `docker inspect` you can get a general idea of the applications state.

```sh
docker inspect --format='{{json .State.Health.Status}}' <container_name_or_id>
```

To monitor container resource usage run the following:
```sh
docker stats <container_name_or_id>
```

### View agent logs
```sh
# View console output from container host
docker logs dia
# Copy/export logs from the container to the host
docker cp dia:/var/log/dia /tmp/log/dia
```

## Development
See the [Development guide for Data Ingestion Agent](https://github.com/adastradev/data-ingestion-agent/blob/master/docs/DevelopmentGuide.md)