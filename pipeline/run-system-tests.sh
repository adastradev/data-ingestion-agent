sed -e "s|TEST_INSTANCE_SSH_KEY_NAME|$TEST_INSTANCE_SSH_KEY_NAME|" test/system/instanceConfig.json.sample > test/system/instanceConfig.json
sed -i "s|TEST_INSTANCE_SECURITYGROUP|$TEST_INSTANCE_SECURITYGROUP|" test/system/instanceConfig.json
sed -i "s|TEST_INSTANCE_SUBNETID|$TEST_INSTANCE_SUBNETID|" test/system/instanceConfig.json

export NORMALIZED_DOCKER_TAG=`echo $BITBUCKET_BRANCH | sed -e "s|\/|_|"`

npm install
node_modules/typescript/bin/tsc
npm run system-test