[![codecov](https://codecov.io/bb/adastradev/data-ingestion-agent/branch/master/graph/badge.svg?token=VDVk2mP9Xu)](https://codecov.io/bb/adastradev/data-ingestion-agent)

# What is the Data Ingestion Agent?

The Data Ingestion Agent (DIA) enables the fast and secure delivery of data into the Ad Astra cloud without the need for Virtual Private Network (VPN) connections.

# Table of Contents

1. [Pre-requisites](#pre-requisites)
2. [Quick Start](#quick-start)
3. [Running the Agent](#running-the-agent)
4. [Uninstall](#uninstall)
5. [Administration](#administration)
6. [Security](#security)
7. [Development](#development)

***
## Pre-requisites

* Ad Astra Cloud credentials
* Review the docker [CLI documentation](https://docs.docker.com/engine/reference/commandline/cli/); familiarize yourself with the common commands noted in the [docker section](#docker)

* Docker version 18.02 or greater (Community Edition or any Enterprise Edition)
  * [Docker download for Windows](https://docs.docker.com/docker-for-windows/install/)
  * [Docker download for Mac](https://docs.docker.com/v17.12/docker-for-mac/install/)
  * [Docker download for Linux (Ubuntu)](https://docs.docker.com/install/linux/docker-ce/ubuntu/)
  * [Docker download for Linux (Debian)](https://docs.docker.com/install/linux/docker-ce/debian/)
  * [Docker download for Linux (CentOS)](https://docs.docker.com/install/linux/docker-ce/centos/)
  * [Docker (Enterprise Edition) download for Linux (RHEL)](https://docs.docker.com/install/linux/docker-ee/rhel/)
    * Installing Docker Community Edition on Red Hat Enterprise Linux (RHEL) will likely require the use of the CentOS guide to be successful

***

## Quick Start

To get started, you can use the built-in interactive wizard to build a properly formatted run command for the DIA. You should be prepared to collect the following information before using this wizard:

* Your Astra Cloud user credentials
* Your Student Information System database credentials for an administrative user, if you choose to ingest data into the Astra cloud
  * For all possible Oracle connection string options, see the [Oracle section](#oracle)
* Familiarize yourself with the different modes that the agent can run in before using the wizard.
  * See the [Running the Agent](#running-the-agent) section and corresponding descriptions to get a high level overview of the available agent modes

Some settings provide helpful defaults which you may wish to use for your first run. Hitting `enter` will use the default value (in parentheses).

**NOTE:** Unless you are comfortable with specifying the advanced run settings, we recommend responding "no" to the prompt "would you like to configure advanced run settings?" in the wizard.

**WARNING:** If you're installing Docker in a nested VM scenario using Hyper-V, see [this guide](https://docs.microsoft.com/en-us/virtualization/hyper-v-on-windows/user-guide/nested-virtualization).

**Expand and execute one of the following to install the latest version of the agent and start the wizard:**

<details><summary>(Windows) Command Prompt</summary>
<p>

```bat
docker pull adastradev/data-ingestion-agent:latest && ^
docker run -it adastradev/data-ingestion-agent:latest wizard
```
</p></details>

<details><summary>(Windows) Powershell</summary>
<p>

```powershell
docker pull adastradev/data-ingestion-agent:latest; `
docker run -it adastradev/data-ingestion-agent:latest wizard
```
</p></details>

<details><summary>(Linux/Mac) bash</summary>
<p>

```bash
docker pull adastradev/data-ingestion-agent:latest && \
docker run -it adastradev/data-ingestion-agent:latest wizard
```
</p></details>

***

## Resource Requirements

#### Docker Host

Hardware:

* Server grade systems are recommended for hosting Docker and the DIA. Using consumer grade devices such as personal laptops and desktops as the main host for the DIA is strongly discouraged.

Memory:

* 8GB (Recommended)

#### Container

Memory:

* 4GB (Recommended)

#### Oracle

When specifying the `ORACLE_ENDPOINT` value (a connection string) to your Oracle instance you may use one of the following formats:

```sh
# Easy Connect Connection String
CONNECTION_STRING="hostname:port/service_name"

# TNS Style Connection String using SID
CONNECTION_STRING="(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=hostname)(PORT=port))(CONNECT_DATA=(SERVER=DEDICATED)(SID=sid)))"

# TNS Style Connection String using SERVICE_NAME
CONNECTION_STRING="(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=hostname)(PORT=port))(CONNECT_DATA=(SERVER=DEDICATED)(SERVICE_NAME=service_name)))"
```
When connecting to an Oracle database the specified database user must be given read/execute access to the following:

- `DBMS_METADATA.GET_DDL` (function)
- `ALL_TABLES` (view)
- `ALL_CONS_COLUMNS` (view)
- `ALL_CONSTRAINTS` (view)
- All tables referenced by this agent (see [Query Preview Mode](#query-preview-mode) section below)

***

## Running the Agent

The agent is highly dependent on the integration type you specify as part of your commands. Integration types are a simple identifier for the system from which you intend to ingest data. To see a full list of possible integration types, use the wizard as noted in the [Quick Start](#quick-start) section at the top of this guide.

The agent supports different 'modes' in which it can run. Each mode performs a specific action (see below) and then exits after the action is complete.

### Ingest Mode

This mode will immediately ingest data into the Ad Astra cloud environment. Upon completion of an ingest of data, the container will cease to run.

**To run the agent expand and execute one of the following commands.**

<details><summary>(Windows) Command Prompt</summary>
<p>

```bat
REM See Host System Requirements above for agent resource requirements
SET PROCESS_MAX_MEMORY_SIZE_MB=4096

REM Define a variable to hold your connection string
SET CONNECTION_STRING=your_connection_string

docker pull adastradev/data-ingestion-agent:latest && ^
docker run -t ^
-m %PROCESS_MAX_MEMORY_SIZE_MB%'M' ^
-e PROCESS_MAX_MEMORY_SIZE_MB=%PROCESS_MAX_MEMORY_SIZE_MB% ^
-e ASTRA_CLOUD_USERNAME=<ASTRA_USERNAME> ^
-e ASTRA_CLOUD_PASSWORD=<ASTRA_PASSWORD> ^
-e ORACLE_ENDPOINT=%CONNECTION_STRING% ^
-e ORACLE_USER=<ORACLE_USER> ^
-e ORACLE_PASSWORD=<ORACLE_PASSWORD> ^
-e INTEGRATION_TYPE=<SIS Type> ^
--network=bridge ^
adastradev/data-ingestion-agent:latest ^
ingest
```
</p></details>

<details><summary>(Windows) Powershell</summary>

```powershell
# See Host System Requirements above for agent resource requirements
$PROCESS_MAX_MEMORY_SIZE_MB = 4096

# Define a variable to hold your connection string
$CONNECTION_STRING = your_connection_string

docker pull adastradev/data-ingestion-agent:latest; `
docker run -t `
-m $PROCESS_MAX_MEMORY_SIZE_MB'M' `
-e PROCESS_MAX_MEMORY_SIZE_MB=$PROCESS_MAX_MEMORY_SIZE_MB `
-e ASTRA_CLOUD_USERNAME=<ASTRA_USERNAME> `
-e ASTRA_CLOUD_PASSWORD=<ASTRA_PASSWORD> `
-e ORACLE_ENDPOINT=$CONNECTION_STRING `
-e ORACLE_USER=<ORACLE_USER> `
-e ORACLE_PASSWORD=<ORACLE_PASSWORD> `
-e INTEGRATION_TYPE=<SIS Type> `
-e DEFAULT_STAGE=dev `
--network=bridge `
adastradev/data-ingestion-agent:latest `
ingest
```
</p></details>

<details><summary>(Linux/Mac) bash</summary>

```bash
# See Host System Requirements above for agent resource requirements
PROCESS_MAX_MEMORY_SIZE_MB = 4096

# Define a variable to hold your connection string
CONNECTION_STRING = your_connection_string

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
adastradev/data-ingestion-agent:latest \
ingest
```
</p></details>

To see a demo of the agent without connecting it to any data source, omit the `ORACLE_*` environment variables. In demo mode, the agent can verify connectivity to the Astra Cloud and push a mock dataset into S3.

The docker agent also supports the following optional arguments:
```sh
# [dev, prod]
-e DEFAULT_STAGE=prod 
-e AWS_REGION=us-east-1 
-e CONCURRENT_CONNECTIONS=5
-e INGEST_RESTORATION_RESOURCES=<false or FALSE>
# [error, warn, info, verbose, debug, silly]
-e LOG_LEVEL=info
-e RUN_MATILLION=<true or false> # defaults to false
```

### Query Preview Mode

Prior to sending any data, you can run the following Docker command to examine each query for the specified integration type. No data is sent to the destination using this command. Upon completion of a preview command, the container will cease to run.

**To run the agent expand and execute one of the following commands.**

<details><summary>(Windows) Command Prompt</summary>

```bat
REM See Host System Requirements above for agent resource requirements
SET PROCESS_MAX_MEMORY_SIZE_MB=4096

docker pull adastradev/data-ingestion-agent:latest && ^
docker run -i ^
-m %PROCESS_MAX_MEMORY_SIZE_MB%'M' ^
-e PROCESS_MAX_MEMORY_SIZE_MB=%PROCESS_MAX_MEMORY_SIZE_MB% ^
-e ASTRA_CLOUD_USERNAME=<your_username> ^
-e ASTRA_CLOUD_PASSWORD=<your_password> ^
-e INTEGRATION_TYPE=<SIS Type> ^
--network=bridge ^
adastradev/data-ingestion-agent:latest ^
preview
```

</p></details>

<details><summary>(Windows) Powershell</summary>

```powershell
# See Host System Requirements above for agent resource requirements
$PROCESS_MAX_MEMORY_SIZE_MB = 4096

docker pull adastradev/data-ingestion-agent:latest; `
docker run -i `
-m $PROCESS_MAX_MEMORY_SIZE_MB'M' `
-e PROCESS_MAX_MEMORY_SIZE_MB=$PROCESS_MAX_MEMORY_SIZE_MB `
-e ASTRA_CLOUD_USERNAME=<your_username> `
-e ASTRA_CLOUD_PASSWORD=<your_password> `
-e INTEGRATION_TYPE=<SIS Type> `
--network=bridge `
adastradev/data-ingestion-agent:latest `
preview
```

</p></details>


<details><summary>(Linux/Mac) bash</summary>

```bash
# See Host System Requirements above for agent resource requirements
PROCESS_MAX_MEMORY_SIZE_MB = 4096

docker pull adastradev/data-ingestion-agent:latest && \
docker run -i \
-m $PROCESS_MAX_MEMORY_SIZE_MB'M' \
-e PROCESS_MAX_MEMORY_SIZE_MB=$PROCESS_MAX_MEMORY_SIZE_MB \
-e ASTRA_CLOUD_USERNAME=<your_username> \
-e ASTRA_CLOUD_PASSWORD=<your_password> \
-e INTEGRATION_TYPE=<SIS Type> \
--network=bridge \
adastradev/data-ingestion-agent:latest \
preview
```

</p></details>


The following links display the default set of queries that run for each of the respective SIS integrations:

[Banner Queries](https://2089dnykgd.execute-api.us-east-1.amazonaws.com/1-0-0/queries?integrationstage=Ingestion&formatted=true&integrationtype=Banner)

[PeopleSoft Queries](https://2089dnykgd.execute-api.us-east-1.amazonaws.com/1-0-0/queries?integrationstage=Ingestion&formatted=true&integrationtype=PeopleSoft)

[DegreeWorks Queries](https://2089dnykgd.execute-api.us-east-1.amazonaws.com/1-0-0/queries?integrationstage=Ingestion&formatted=true&integrationtype=DegreeWorks)

[Colleague SQL Queries](https://2089dnykgd.execute-api.us-east-1.amazonaws.com/1-0-0/queries?integrationstage=Ingestion&formatted=true&integrationtype=Colleague)

***

## Uninstall

The DIA is a long running process that may be performing work when an uninstall occurs. To reduce negative side effects of immediately stopping the agent, it is advised to always stop the container with a grace period as shown below. Outright usage of `docker kill` is discouraged.

If multiple versions of the ingestion agent exist, be sure to specify the optional tag when removing an image.

```sh
docker stop --time 10 <container_name_or_id>
docker rm <container_name_or_id>
docker rmi <image>:<tag>
```
***

## Administration

### Common Command Reference

#### Docker

* [docker run](https://docs.docker.com/engine/reference/commandline/run/) - Start a docker container
* [docker ps](https://docs.docker.com/engine/reference/commandline/ps/) - Observe the status of containers
* [docker stats](https://docs.docker.com/engine/reference/commandline/stats/) - Monitor resource usage of a running container
* [docker stop](https://docs.docker.com/engine/reference/commandline/stop/) - Stop a container
* [docker rm](https://docs.docker.com/engine/reference/commandline/rm/) - Remove a container
* [docker rmi](https://docs.docker.com/engine/reference/commandline/rmi/) - Remove an image

To review all the possible Docker CLI commands [see their CLI guide](https://docs.docker.com/engine/reference/commandline/cli/)

### Automation

<details><summary>Windows</summary>
<p>

Open notepad or notepad++ 

Copy and paste:

```
docker pull adastradev/data-ingestion-agent:latest

docker run ....<your data ingestion run cmd>
```

Save As > NameYourFile.bat

Open Windows Task Scheduler > 'Create Task' > Name your Task
-General > Check 'Run with highest privileges' > Select additional desired criteria
-Triggers > 'New' > Select desired ingest schedule > 'Ok'
-Actions > 'New' > Action is 'Start A Program' > Browse to the .bat file you just created > select that file > 'Ok'

To test, right click the task in Task Scheduler and hit run. A Command Prompt should appear, your docker pull command will run first followed by your ingest command. 

</p>
</details>

<details><summary>Linux/Mac</summary>
<p>

Create a shell script to contain your DIA run command. For example, the following commands will create a script in your home directory.

```sh
$ echo "docker pull adastradev/data-ingestion-agent:latest && docker run ....<your data ingestion run cmd>" > run_ingestion_agent.sh
$ chmod +x run_ingestion_agent.sh
```

Open up the cron job configuration file.

```sh
crontab -e
```

Call your script as a job to be executed on a schedule. In this case, once a day and append to a log file each time.

```sh
0 0 * * * sh /home/run_ingestion_agent.sh >> /home/agent.log
```

</p>
</details>

In addition to scheduling the DIA, it is helpful to automate checking if Docker is running. Here are some links to Docker's documentation to help address those areas:

[Configure Docker to start on reboot](https://docs.docker.com/install/linux/linux-postinstall/#configure-docker-to-start-on-boot)

[Check whether Docker is running](https://docs.docker.com/config/daemon/#check-whether-docker-is-running)

### Configure Network Access
The DIA requires *outbound* internet access over HTTPS to Amazon Web Services (*.amazonaws.com). In general, the agent should be provided outbound internet access via providing a bridge network as shown above. If runnning through an internet proxy, it is recommended to configure the proxy at `docker run` time by using an environment variable `--env HTTPS_PROXY="https://127.0.0.1:3001"`. For more information, see the [Configure Docker to use a proxy server](https://docs.docker.com/network/proxy/).

No *inbound* access to the agent is required.

See [Getting started with HTTPS proxies](https://github.com/adastradev/data-ingestion-agent/blob/master/docs/HttpsProxy.md) for more information.

### Authentication
The DIA utilizes JWT/AWS IAM token authentication for all request authentication. The DIA does not currently use AWS Key Management. The JWT/IAM tokens are only valid for short periods (possibly an hour), at which point the DIA must re-authenticate. 

### Root Access to a running agent container
After starting the agent and confirming a healthy status, you can use the containers name or ID to access the virtual machine via command line (bash) as follows:

```sh
docker exec -it <container_id_or_name> /bin/bash
```

### Container Health Monitoring
The DIA periodically informs Docker of its current health. Using `docker inspect` you can get a general idea of the applications state.

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

***

## Security

* Encryption:
  * Data is encrypted in-transit over HTTPS
  * Data at rest is encrypted in a private AWS S3 bucket using AES-256 bit encryption

*** 

## Development
See the [Development guide for the Data Ingestion Agent](https://github.com/adastradev/data-ingestion-agent/blob/master/docs/DevelopmentGuide.md)
