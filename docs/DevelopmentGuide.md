
## Development guide for Data Ingestion Agent
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

## Dependencies
Data ingestion agent uses the [node-oracledb driver](https://github.com/oracle/node-oracledb/blob/master/doc/api.md) by Oracle.