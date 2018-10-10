import * as SQS from 'aws-sdk/clients/sqs';
import * as Winston from 'winston';
import { DiscoverySdk, BearerTokenCredentials } from '@adastradev/serverless-discovery-sdk';
import { AuthManager } from './source/astra-sdk/AuthManager';
import { CognitoUserPoolLocatorUserManagement } from './source/astra-sdk/CognitoUserPoolLocatorUserManagement';
import { UserManagementApi } from './source/astra-sdk/UserManagementApi';
import { CognitoIdentity, S3 } from 'aws-sdk';
import * as crypto from 'crypto';
import * as oracledb from 'oracledb';
import { bool } from 'aws-sdk/clients/signer';

async function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

var shutdownRequested = false;
process.on('SIGTERM', function() {
    shutdownRequested = true;
});

class Startup {
    private static logger: Winston.Logger = null;
    private static readonly queries = [
        'SELECT * FROM ALL_TABLES'
    ];

    private static createDemoSnapshot() {
        var Readable = require('stream').Readable
        var s = new Readable;
        s.push('this is a test stream');
        s.push(null);
        return s;
    }

    private static async createSnapshot() {
        if (process.env.ORACLE_ENDPOINT === undefined) {
            return this.createDemoSnapshot();
        }

        let connection;
        try {
            let sql, binds, options, result;

            connection = await oracledb.getConnection({
              user          : process.env.ORACLE_USER,
              password      : process.env.ORACLE_PASSWORD,
              connectString : process.env.ORACLE_ENDPOINT
            });

            // Query the data
            binds = {};
            options = {
              outFormat: oracledb.OBJECT // query result format
            };
            result = await connection.execute(this.queries[0], binds, options);
            return result.rows;
        } catch (err) {
            console.error(err);
            throw err;
        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (err) {
                    console.error(err);
                }
            }
        }
    }

    private static async sendSnapshot(s3Config: S3.ClientConfiguration, tenantId: string, bucketName: string, preview: boolean = false) {
        const s3api = new S3(s3Config);

        var dataBody = await this.createSnapshot();
        var params = {
            Bucket:  bucketName + '/' + tenantId,
            Body: dataBody,
            Key: 'testUpload-' + crypto.randomBytes(8).toString('hex')
        };

        if (preview) {
            this.logger.log("info", this.queries[0]);
        }
        else {
            await s3api.upload(params).promise();
        }
    }

    public static async initiatePreview(sqs: SQS, queueUrl: string): Promise<void> {
        await sqs.sendMessage({ QueueUrl: queueUrl, MessageBody: '{ "type": "SendData", "version": "v1", "payload": { "preview": true }}'}).promise();
    }

    public static async main() {

        // NOTE: updates to the discovery service itself would require pushing a new docker image. This should still be an environment variable rather than hardcoded
        process.env['DISCOVERY_SERVICE'] = 'https://4w35qhpotd.execute-api.us-east-1.amazonaws.com/prod';
        const REGION = 'us-east-1';

        this.logger = Winston.createLogger({
            level: 'info',
            format: Winston.format.json(),
            transports: [
                new Winston.transports.Console()
            ]
        });

        var body = this.createSnapshot();

        let s3Buckets = {
            prod: 'adastra-prod-data-ingestion',
            dev: 'adastra-dev-data-ingestion'
        }
        let stage = 'prod';
        let queueUrl = '';
        let sqsConfig: SQS.ClientConfiguration = { apiVersion: '2012-11-05', region: REGION};
        let s3Config: S3.ClientConfiguration = { region: REGION };
        let tenantId = '';
        let iamCredentials: CognitoIdentity.Credentials = undefined;
        let bucketName = s3Buckets[stage];

        if (process.env.ASTRA_CLOUD_USERNAME && process.env.ASTRA_CLOUD_PASSWORD) {
            this.logger.log('info', 'Configuring security credentials');

            // look up User Management service URI and cache in an environment variable
            const sdk: DiscoverySdk = new DiscoverySdk(process.env.DISCOVERY_SERVICE, REGION);
            const endpoints = await sdk.lookupService('user-management', stage);
            process.env['USER_MANAGEMENT_URI'] = endpoints[0];

            let poolLocator = new CognitoUserPoolLocatorUserManagement(REGION);
            let authManager = new AuthManager(poolLocator, REGION);
            let cognitoJwt = await authManager.signIn(process.env.ASTRA_CLOUD_USERNAME, process.env.ASTRA_CLOUD_PASSWORD);

            // Get IAM credentials
            iamCredentials = await authManager.getIamCredentials(cognitoJwt.idToken);

            // Set up authenticated access to SQS
            sqsConfig.credentials = {
                accessKeyId: iamCredentials.AccessKeyId,
                secretAccessKey: iamCredentials.SecretKey,
                sessionToken: iamCredentials.SessionToken
            };

            // Set up authenticated access to S3
            s3Config.credentials = {
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

        var sqs = new SQS(sqsConfig);

        var args = process.argv.splice(2);
        if (args.length > 0) {
            if (args[0] === "preview") {
                await Startup.initiatePreview(sqs, queueUrl);
            }
        }

        this.logger.log('info', 'waiting for sqs schedule event');
        while(!shutdownRequested) {
            await sleep(1000);
            
            var result = await sqs.receiveMessage({ QueueUrl: queueUrl, MaxNumberOfMessages: 1}).promise();

            if (result.Messages) {
                this.logger.log('info', `Schedule Signal Received`);      

                var payloadAsJson = null;
                try {
                    payloadAsJson = JSON.parse(result.Messages[0].Body);
                }
                catch(error) {
                    // probably not json
                }

                var preview: boolean = false;
                if (payloadAsJson && payloadAsJson.payload.preview) {
                    preview = payloadAsJson.payload.preview;
                }

                this.logger.log('info', 'Ingesting...');
                await this.sendSnapshot(s3Config, tenantId, bucketName, preview);
                this.logger.log('info', 'Done Ingesting!');

                // ack
                await sqs.deleteMessage({ QueueUrl: queueUrl, ReceiptHandle: result.Messages[0].ReceiptHandle }).promise();
                
                // Debug hack for now
                if (result.Messages[0].Body === 'failme') {
                    throw Error('Fail');
                } else if (preview) {
                    return;
                }
            }
        }
    }
}


Startup.main();