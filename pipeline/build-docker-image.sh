
docker build \
--build-arg ORACLE_ENDPOINT=$ORACLE_ENDPOINT \
--build-arg ORACLE_USER=$ORACLE_USER \
--build-arg ORACLE_PASSWORD=$ORACLE_PASSWORD \
--build-arg TEST_TARGET=integration-test \
-t $IMAGE_NAME .
