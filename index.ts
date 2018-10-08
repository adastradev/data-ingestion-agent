import * as SQS from 'aws-sdk/clients/sqs';
import * as Winston from 'winston';
import { DiscoverySdk, BearerTokenCredentials } from '@adastradev/serverless-discovery-sdk';
import { AuthManager } from './source/astra-sdk/AuthManager';
import { CognitoUserPoolLocatorUserManagement } from './source/astra-sdk/CognitoUserPoolLocatorUserManagement';
import { UserManagementApi } from './source/astra-sdk/UserManagementApi';
import { CognitoIdentity, S3 } from 'aws-sdk';

async function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

class Startup {
    private static createObject() {
        var Readable = require('stream').Readable
        var s = new Readable;
        s.push('this is a test stream');
        s.push(null);

        return s;
    }

    public static async main(): Promise<number> {
        // NOTE: updates to the discovery service itself would require pushing a new docker image. This should still be an environment variable rather than hardcoded
        process.env['DISCOVERY_SERVICE'] = 'https://4w35qhpotd.execute-api.us-east-1.amazonaws.com/prod';
        const REGION = 'us-east-1';

        const logger = Winston.createLogger({
            level: 'info',
            format: Winston.format.json(),
            transports: [
                new Winston.transports.Console()
            ]
        });

        let queueUrl = '';
        let sqsConfig: SQS.ClientConfiguration = { apiVersion: '2012-11-05', region: REGION};
        let tenantId = '';
        let iamCredentials: CognitoIdentity.Credentials = undefined;

        if (process.env.ASTRA_CLOUD_USERNAME && process.env.ASTRA_CLOUD_PASSWORD) {
            logger.log('info', 'Configuring security credentials');

            // look up User Management service URI and cache in an environment variable
            const sdk: DiscoverySdk = new DiscoverySdk(process.env.DISCOVERY_SERVICE, REGION);
            const endpoints = await sdk.lookupService('user-management', 'dev');
            process.env['USER_MANAGEMENT_URI'] = endpoints[0];

            let poolLocator = new CognitoUserPoolLocatorUserManagement(REGION);
            let authManager = new AuthManager(poolLocator, REGION);
            let cognitoJwt = await authManager.signIn(process.env.ASTRA_CLOUD_USERNAME, process.env.ASTRA_CLOUD_PASSWORD);

            // Get IAM credentials
            iamCredentials = await authManager.getIamCredentials(cognitoJwt.idToken);
            sqsConfig.credentials = {
                accessKeyId: iamCredentials.AccessKeyId,
                secretAccessKey: iamCredentials.SecretKey,
                sessionToken: iamCredentials.SessionToken
            };

            // lookup SQS queue for this tenant
            let credentialsBearerToken: BearerTokenCredentials = {
                type: 'BearerToken',
                idToken: cognitoJwt.idToken
            };
            let userManagementApi = new UserManagementApi(process.env.USER_MANAGEMENT_URI, REGION, credentialsBearerToken);
            let poolListResponse = await userManagementApi.getUserPools();
            queueUrl = poolListResponse.data[0].tenantDataIngestionQueueUrl;
            tenantId = poolListResponse.data[0].tenant_id;
        }

        const s3api = new S3(
            {
                region: 'us-east-1',
                params: {
                    Bucket: 'adastra-dev-data-ingestion/' + tenantId
                },
                credentials: {
                    accessKeyId: iamCredentials.AccessKeyId,
                    secretAccessKey: iamCredentials.SecretKey,
                    sessionToken: iamCredentials.SessionToken    
                }
            }
        );

        var dataBody = this.createObject();
        var params = {
            Bucket: 'adastra-dev-data-ingestion/' + tenantId,
            Body: dataBody,
            Key: 'testUpload'
        };
        await s3api.upload(params).promise();
       
        var paramsDeleted = {
            Bucket: 'adastra-dev-data-ingestion/' + tenantId,
            Key: 'testUpload'
        };
        await s3api.deleteObject(paramsDeleted).promise();

        var sqs = new SQS(sqsConfig);

        logger.log('info', 'waiting for sqs schedule event');
        while(true) {
            await sleep(1000);
            
            var result = await sqs.receiveMessage({ QueueUrl: queueUrl, MaxNumberOfMessages: 1}).promise();

            if (result.Messages) {
                logger.log('info', `Schedule Signal Received - ${result.Messages[0].Body}`);      

                logger.log('info', 'Ingesting...');
                await sleep(1000);
                logger.log('info', 'Done Ingesting!');

                // ack
                await sqs.deleteMessage({ QueueUrl: queueUrl, ReceiptHandle: result.Messages[0].ReceiptHandle }).promise();
                
                // Debug hack for now
                if (result.Messages[0].Body === 'failme') {
                    throw Error('Fail');
                }
            }
        }
    }
}

Startup.main();