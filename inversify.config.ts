import { Container } from "inversify";
import TYPES from "./ioc.types";

// Config
import { S3, SQS } from 'aws-sdk';
import * as Winston from 'winston';
import { AuthManager } from "./source/astra-sdk/AuthManager";
import { CognitoUserPoolLocatorUserManagement } from "./source/astra-sdk/CognitoUserPoolLocatorUserManagement";
import { DiscoverySdk, BearerTokenCredentials } from "@adastradev/serverless-discovery-sdk";
import { UserManagementApi } from "./source/astra-sdk/UserManagementApi";

// Message Management
import MessageHandlerFactory from "./source/MessageHandlerFactory";
import IMessageHandler from "./source/IMessageHandler";
import SendDataHandler from "./source/MessageHandlers/SendDataHandler";
import PreviewHandler from "./source/MessageHandlers/PreviewHandler";

// Messages
import IMessage from "./source/IMessage";
import MessageFactory from "./source/MessageFactory";
import SendDataMessage from "./source/Messages/SendDataMessage";
import PreviewMessage from "./source/Messages/PreviewMessage";

// Data Access
import IDataReader from "./source/DataAccess/IDataReader";
import IDataWriter from "./source/DataAccess/IDataWriter";
import S3Writer from "./source/DataAccess/S3/S3Writer";
import OracleReader from "./source/DataAccess/Oracle/OracleReader";
import ICommand from "./source/Commands/ICommand";
import AdHocIngestCommand from "./source/Commands/AdHocIngestCommand";
import AdHocPreviewCommand from "./source/Commands/AdHocPreviewCommand";

// TODO: Make configurable?
const REGION = "us-east-1";
const stage = "prod";

var container = new Container();

// TODO: Get region
var s3Config: S3.ClientConfiguration = { region: REGION };
var sqsConfig: SQS.ClientConfiguration = { apiVersion: '2012-11-05', region: REGION };

var logger: Winston.Logger = Winston.createLogger({
    level: 'info',
    format: Winston.format.json(),
    transports: [
        new Winston.transports.Console()
    ]
});
process.env['DISCOVERY_SERVICE'] = 'https://4w35qhpotd.execute-api.us-east-1.amazonaws.com/prod';
const sdk: DiscoverySdk = new DiscoverySdk(process.env.DISCOVERY_SERVICE, REGION);

var poolLocator = new CognitoUserPoolLocatorUserManagement(REGION);
var authManager = new AuthManager(poolLocator, REGION);
var queueUrl: string, 
    tenantId: string,
    s3: S3,
    sqs: SQS;

let s3Buckets = {
    prod: 'adastra-prod-data-ingestion',
    dev: 'adastra-dev-data-ingestion'
}
let bucketName = s3Buckets[stage];

// NOTE: updates to the discovery service itself would require pushing a new docker image. This should still be an environment variable rather than hardcoded
process.env['DISCOVERY_SERVICE'] = 'https://4w35qhpotd.execute-api.us-east-1.amazonaws.com/prod';

var startup = 
    () => (async () => {
        const endpoints = await sdk.lookupService('user-management', stage);
        process.env['USER_MANAGEMENT_URI'] = endpoints[0];
    })()
    .then(async () => {
        let cognitoJwt = await authManager.signIn(process.env.ASTRA_CLOUD_USERNAME, process.env.ASTRA_CLOUD_PASSWORD);

        // Get IAM credentials
        var iamCredentials = await authManager.getIamCredentials(cognitoJwt.idToken);

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

    })
    .then(() => {

        // Config
        container.bind<AuthManager>(TYPES.AuthManager).toConstantValue(authManager); // is this too boilerplate to be injecting everywhere? is there a way to inquire about a timed-out token?
        container.bind<S3.ClientConfiguration>(TYPES.S3Config).toConstantValue(s3Config);
        container.bind<SQS.ClientConfiguration>(TYPES.SQSConfig).toConstantValue(s3Config);
        container.bind<Winston.Logger>(TYPES.Logger).toConstantValue(logger);
        container.bind<string>(TYPES.QueueUrl).toConstantValue(queueUrl);
        container.bind<string>(TYPES.TenantId).toConstantValue(tenantId);
        container.bind<string>(TYPES.Bucket).toConstantValue(bucketName);

        // Message Management        
        container.bind<MessageHandlerFactory>(TYPES.MessageHandlerFactory).to(MessageHandlerFactory).inSingletonScope();
        container.bind<IMessageHandler>(TYPES.SendDataHandler).to(SendDataHandler);
        container.bind<IMessageHandler>(TYPES.PreviewHandler).to(PreviewHandler);
        
        // Messages
        container.bind<MessageFactory>(TYPES.MessageFactory).to(MessageFactory).inSingletonScope();
        container.bind<IMessage>(TYPES.SendDataMessage).to(SendDataMessage);
        container.bind<IMessage>(TYPES.PreviewMessage).to(PreviewMessage);
        
        // Data Access
        container.bind<IDataReader>(TYPES.IngestionReader).to(OracleReader);
        container.bind<IDataWriter>(TYPES.IngestionWriter).to(S3Writer);

        // Agent Commands
        container.bind<ICommand>(TYPES.INGEST).to(AdHocIngestCommand);
        container.bind<ICommand>(TYPES.PREVIEW).to(AdHocPreviewCommand);

        // TODO: Revisit, is this necessary?
        container.bind<Container>(TYPES.Container).toConstantValue(container);

        return container;
    });

export default startup;