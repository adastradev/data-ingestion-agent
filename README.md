# data-ingestion-agent
Ad Astra Docker agent code base for cloud integration without VPN tunnels

## Pre-requisites
Docker version 18.02 or greater

## Install
```sh
docker pull adastradev/data-ingestion-agent:latest
```

## Run

Note: AWS access keys are a temporary solution and will be removed

```sh
docker run -d -t -e AWS_ACCESS_KEY_ID=<your_access_key> -e AWS_SECRET_ACCESS_KEY=<your_secret_access_key> -e SQS_QUEUE_URI=https://sqs.<your_region>.amazonaws.com/<your_account_id>/<your_queue_name> adastradev/data-ingestion-agent:<tag>
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
```sh
docker build -t data-ingestion-agent .
```

## Docker Health

The data ingestion agent periodically informs docker of its current health. Using `docker inspect` you can get a general idea of the applications state.

```sh
docker inspect --format='{{json .State.Health.Status}}' <container_name_or_id>
```

## Host System Requirements

TBD