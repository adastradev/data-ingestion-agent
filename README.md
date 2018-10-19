# data-ingestion-agent
[![Coverage Status](https://coveralls.io/repos/github/adastradev/data-ingestion-agent/badge.svg?branch=master)](https://coveralls.io/github/adastradev/data-ingestion-agent?branch=master)

Ad Astra Docker agent code base for cloud integration without VPN tunnels

## Pre-requisites
Docker version 18.02 or greater (Community Edition or any Enterprise Edition)

## Install
```sh
docker pull adastradev/data-ingestion-agent:latest
```

## Run
```sh
docker run -d -t \
-e ASTRA_CLOUD_USERNAME=<your_username> \
-e ASTRA_CLOUD_PASSWORD=<your_password> \
-e ORACLE_ENDPOINT=hostname:port/service_name \
-e ORACLE_USER=user \
-e ORACLE_PASSWORD=password \
adastradev/data-ingestion-agent:<tag>
```

## Uninstall
The data ingestion agent is a long running process that may be performing work when an uninstall occurs. To reduce negative side effects of immediately stopping the agent it is advised to always stop the container with a grace period as shown below. Outright usage of `docker kill` is discouraged.

If multiple versions of the ingestion agent exist be sure to specify the optional tag when removing an image.

```sh
docker stop --time 10 <container_name_or_id>
docker rm <container_name_or_id>
docker rmi <image>:<tag>
```

## Development
Build docker image and run unit tests
```sh
docker build -t data-ingestion-agent .
```

Build docker image and run integration tests
```sh
docker build \
--build-arg ORACLE_ENDPOINT=hostname:port/service_name \
--build-arg ORACLE_USER=user \
--build-arg ORACLE_PASSWORD=password \
--build-arg INTEGRATION_TESTS_ENABLED=true \
-t data-ingestion-agent .
```

Run System Tests
```sh
npm install
export ASTRA_CLOUD_USERNAME=<your_username>
export ASTRA_CLOUD_PASSWORD=<your_password>
# The system tests pull an image from dockerhub so you must provide the tag you wish to use in the test
export NORMALIZED_DOCKER_TAG=feature_something

# Copy the sample config
cp test/system/instanceConfig.json.sample test/system/instanceConfig.json
# Update the following EC2 instance config fields:
#  InstanceType (t2.micro is likely not ideal)
#  Ebs.VolumeSize
#  Keyname (the key name - without extension )
#  SecurityGroupIds (can be a single security group)
#  SubnetId (be sure it is a public facing subnet, no NAT)
#  Tags.Name (adjust to be something unique to help identify the instance)

# Start the system test
npm run system-test
```

## Query Preview
Prior to sending any data you can run the following docker command to log each query to the console to examine each query. No data is sent to the destination using this command.

```sh
docker run -i \
-e ASTRA_CLOUD_USERNAME=<your_username> \
-e ASTRA_CLOUD_PASSWORD=<your_password> \
adastradev/data-ingestion-agent:latest \
preview
```

## Adhoc Ingestion
To immediately begin the ingestion process you can run the following with the 'ingest' flag. This command will terminate the container once the process has completed.

```sh
docker run -i \
-e ASTRA_CLOUD_USERNAME=<your_username> \
-e ASTRA_CLOUD_PASSWORD=<your_password> \
-e ORACLE_ENDPOINT=hostname:port/service_name \
-e ORACLE_USER=user \
-e ORACLE_PASSWORD=password \
adastradev/data-ingestion-agent:latest \
ingest
```

## Root Access to a running agent container

After starting the agent and confirming a healthy status you can use the containers name or ID to access the virtual machine via command line (bash) as follows:

```sh
docker exec -it <container_id_or_name> /bin/bash
```

## Container Health Monitoring
The data ingestion agent periodically informs docker of its current health. Using `docker inspect` you can get a general idea of the applications state.

```sh
docker inspect --format='{{json .State.Health.Status}}' <container_name_or_id>
```

## Host System Requirements
TBD