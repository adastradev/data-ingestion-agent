# data-ingestion-agent
[![Coverage Status](https://coveralls.io/repos/github/adastradev/data-ingestion-agent/badge.svg?branch=master)](https://coveralls.io/github/adastradev/data-ingestion-agent?branch=master)

Ad Astra Docker agent code base for cloud integration without VPN tunnels

## Pre-requisites
Docker version 18.02 or greater (Community Edition or any Enterprise Edition)

[Docker download for Windows](https://docs.docker.com/docker-for-windows/install/)
[Docker download for Mac](https://docs.docker.com/v17.12/docker-for-mac/install/)

#### Oracle
When connecting to an Oracle database the specified database user must be given read/execute access to the following:

- DBMS_METADATA.GET_DDL (function)
- ALL_TABLES (view)
- ALL_CONS_COLUMNS (view)
- ALL_CONSTRAINTS (view)
- All tables referenced by this agent (see 'Query Preview' section below)

When specifying the 'ORACLE_ENDPOINT' value (a connection string) to your Oracle instance you may use one of the following formats:

```sh
# Easy Connect Connection String
CONNECTION_STRING="hostname:port/service_name"

# TNS Style Connection String using SID
# CONNECTION_STRING="(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=hostname)(PORT=port))(CONNECT_DATA=(SERVER=DEDICATED)(SID=sid)))"

# TNS Style Connection String using SERVICE_NAME
# CONNECTION_STRING="(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=hostname)(PORT=port))(CONNECT_DATA=(SERVER=DEDICATED)(SERVICE_NAME=service_name)))"
```

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

## Quick Start

To get started you can use the built-in interactive wizard to build a properly formatted run command for the data ingestion agent. You should be prepared to collect the following information before using this wizard:

* Your Astra Cloud user credentials
* Your Student Information System database credentials for an administrative user if you choose to ingest data into the Astra cloud

Some settings provide helpful defaults which you may wish to use for your first run. Unless you are comfortable with specifying the advanced run settings you can deline to enter them at this time.

Execute the following to get started:

```sh
docker run -it adastradev/data-ingestion-agent:latest wizard
```

## Run

For all possible Oracle connection string options, see the [Oracle section](####Oracle) at the top of this document

```sh
# See Host System Requirements above for agent resource requirements
PROCESS_MAX_MEMORY_SIZE_MB=4096

# Define a variable to hold your connection string
CONNECTION_STRING=your_connection_string

For Windows:

docker pull adastradev/data-ingestion-agent:latest && ^
docker run -t ^
-m $PROCESS_MAX_MEMORY_SIZE_MB'M' ^
-e PROCESS_MAX_MEMORY_SIZE_MB=$PROCESS_MAX_MEMORY_SIZE_MB ^
-e ASTRA_CLOUD_USERNAME=<ASTRA_USERNAME> ^
-e ASTRA_CLOUD_PASSWORD=<ASTRA_PASSWORD> ^
-e ORACLE_ENDPOINT=$CONNECTION_STRING ^
-e ORACLE_USER=<ORACLE_USER> ^
-e ORACLE_PASSWORD=<ORACLE_PASSWORD> ^
-e INTEGRATION_TYPE=<SIS Type> ^
-e DEFAULT_STAGE=dev ^
--network=bridge ^
adastradev/data-ingestion-agent:latest ^
ingest

For Mac & Linux:

docker pull adastradev/data-ingestion-agent:latest && \
docker run -t \
-m $PROCESS_MAX_MEMORY_SIZE_MB'M' \
-e PROCESS_MAX_MEMORY_SIZE_MB=$PROCESS_MAX_MEMORY_SIZE_MB \
-e ASTRA_CLOUD_USERNAME=<ASTRA_USERNAME> \
-e ASTRA_CLOUD_PASSWORD=<ASTRA_PASSWORD> \
-e ORACLE_ENDPOINT=$CONNECTION_STRING \
-e ORACLE_USER=<ORACLE_USER> \
-e ORACLE_PASSWORD=<ORACLE_PASSWORD> \
-e INTEGRATION_TYPE=<SIS Type> \
--network=bridge \
adastradev/data-ingestion-agent:latest

# <SIS Type> [Demo, Banner, PeopleSoft, Colleague]
```

To see a demo of the agent without connecting it to any data source, omit the ORACLE_* environment variables. In demo mode, the agent can verify connectivity to the Astra Cloud and push a mock dataset into S3.

The docker agent also supports the following optional arguments:
```sh
# [dev, prod]
-e DEFAULT_STAGE=prod 
-e AWS_REGION=us-east-1 
-e CONCURRENT_CONNECTIONS=5 
# [error, warn, info, verbose, debug, silly]
-e LOG_LEVEL=info
```

### Configure Network Access
The Data Ingestion Agent requires *outbound* internet access over HTTPS to Amazon Web Services (*.amazonaws.com). In general, the agent should be provided outbound internet access via providing a bridge network as shown above. If runnning through an internet proxy, it is recommended to configure the proxy at `docker run` time by using an environment variable `--env HTTPS_PROXY="https://127.0.0.1:3001"`. For more information, see the [Configure Docker to use a proxy server](https://docs.docker.com/network/proxy/).

No *inbound* access to the agent is required.

See [Getting started with HTTPS proxies](https://github.com/adastradev/data-ingestion-agent/blob/master/docs/HttpsProxy.md) for more information.

### Authentication
The Data Ingestion Agent utilizes JWT/AWS IAM token authentication for all request authentication. The DIA does not currently use AWS Key Management, the JWT/IAM tokens are only valid for short periods (possibly an hour) at which point the DIA must re-authenticate. 

### Query Preview

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

The following links display the default set of queries that run for each of the respective SIS integrations:

[Banner Queries](https://2089dnykgd.execute-api.us-east-1.amazonaws.com/1-0-0/queries?integrationstage=Ingestion&formatted=true&integrationtype=Banner)

[PeopleSoft Queries](https://2089dnykgd.execute-api.us-east-1.amazonaws.com/1-0-0/queries?integrationstage=Ingestion&formatted=true&integrationtype=PeopleSoft)

[DegreeWorks Queries](https://2089dnykgd.execute-api.us-east-1.amazonaws.com/1-0-0/queries?integrationstage=Ingestion&formatted=true&integrationtype=DegreeWorks)

[Colleague SQL Queries](https://2089dnykgd.execute-api.us-east-1.amazonaws.com/1-0-0/queries?integrationstage=Ingestion&formatted=true&integrationtype=Colleague)

### Adhoc Ingestion
To immediately begin the ingestion process you can run the following with the 'ingest' flag. This command will terminate the container once the process has completed.

For all possible Oracle connection string options, see the [Oracle section](####Oracle) at the top of this document

```sh
# See Host System Requirements above for agent resource requirements
PROCESS_MAX_MEMORY_SIZE_MB=4096

# Define a variable to hold your connection string
CONNECTION_STRING=your_connection_string

docker run -i \
-m $PROCESS_MAX_MEMORY_SIZE_MB'M' \
-e PROCESS_MAX_MEMORY_SIZE_MB=$PROCESS_MAX_MEMORY_SIZE_MB \
-e ASTRA_CLOUD_USERNAME=<your_username> \
-e ASTRA_CLOUD_PASSWORD=<your_password> \
-e ORACLE_ENDPOINT=$CONNECTION_STRING \
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
docker logs <container_name_or_id>
# Copy/export logs from the container to the host
# Create a destination path to store log files. After running the command the copied log file stored in your destination path should be renamed so files are not overwritten. 
docker cp <container_name_or_id>:/var/log/dia/. <destination_path>
```
See the [Docker cp command guide for help copying logs to a local file system](https://docs.docker.com/engine/reference/commandline/cp/)

## Development
See the [Development guide for Data Ingestion Agent](https://github.com/adastradev/data-ingestion-agent/blob/master/docs/DevelopmentGuide.md)