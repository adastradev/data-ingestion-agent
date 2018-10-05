# Configure our test SSH key
echo "AUTOMATED_TEST_SSH_KEY" > test/system/automated-system-tests.pem
# Make sure the key permissions are not 'too open'
chmod 600 test/system/automated-system-tests.pem
sed -i -e "s|AUTOMATED_TEST_SSH_KEY|$AUTOMATED_TEST_SSH_KEY|" test/system/automated-system-tests.pem

# Configure system test
sed -e "s|TEST_INSTANCE_SSH_KEY_NAME|$TEST_INSTANCE_SSH_KEY_NAME|" test/system/instanceConfig.json.sample > test/system/instanceConfig.json
sed -i "s|TEST_INSTANCE_SECURITYGROUP|$TEST_INSTANCE_SECURITYGROUP|" test/system/instanceConfig.json
sed -i "s|TEST_INSTANCE_SUBNETID|$TEST_INSTANCE_SUBNETID|" test/system/instanceConfig.json

npm install
node_modules/typescript/bin/tsc
npm run system-test