# data-ingestion-agent
Ad Astra Docker agent code base for cloud integration without VPN tunnels

## Pre-requisites
Docker version 18.02 or greater

## Usage
Note: AWS access keys are a temporary solution and will be removed

```sh
docker pull data=ingestion-agent:latest
docker run -d -t -e AWS_ACCESS_KEY=<your_access_key> -e AWS_SECRET_ACCESS_KEY=<your_secret_access_key> -e SQS_QUEUE_URI=https://sqs.<your_region>.amazonaws.com/<your_account_id>/<your_queue_name> data-ingestion-agent:latest
```

## Development
```sh
docker build -t data-ingestion-agent .or j
```

## Docker Health
```sh
docker inspect --format='{{json .State.Health.Status}}' <your_container_name_or_id>
```

## Host System Requirements

TBD