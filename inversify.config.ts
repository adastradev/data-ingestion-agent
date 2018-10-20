import { Container } from 'inversify';
import TYPES from './ioc.types';

// Config
import * as AWS from 'aws-sdk';
import * as Winston from 'winston';
import { AuthManager } from './source/astra-sdk/AuthManager';
import { CognitoUserPoolLocatorUserManagement } from './source/astra-sdk/CognitoUserPoolLocatorUserManagement';
import { BearerTokenCredentials, DiscoverySdk } from '@adastradev/serverless-discovery-sdk';
import { UserManagementApi } from './source/astra-sdk/UserManagementApi';

// Message Management
import MessageHandlerFactory from './source/MessageHandlerFactory';
import IMessageHandler from './source/IMessageHandler';
import SendDataHandler from './source/MessageHandlers/SendDataHandler';
import PreviewHandler from './source/MessageHandlers/PreviewHandler';

// Messages
import IMessage from './source/IMessage';
import MessageFactory from './source/MessageFactory';
import SendDataMessage from './source/Messages/SendDataMessage';
import PreviewMessage from './source/Messages/PreviewMessage';

// Data Access
import IDataReader from './source/DataAccess/IDataReader';
import IDataWriter from './source/DataAccess/IDataWriter';
import S3Writer from './source/DataAccess/S3/S3Writer';
import OracleReader from './source/DataAccess/Oracle/OracleReader';
import ICommand from './source/Commands/ICommand';
import AdHocIngestCommand from './source/Commands/AdHocIngestCommand';
import AdHocPreviewCommand from './source/Commands/AdHocPreviewCommand';
import IntegrationConfigFactory from './source/IntegrationConfigFactory';
import IConnectionPoolManager from './source/DataAccess/IConnectionPoolManager';
import OracleConnectionPoolManager from './source/DataAccess/Oracle/OracleConnectionPoolManager';

const region = process.env.AWS_REGION || 'us-east-1';
const stage = process.env.DEFAULT_STAGE || 'prod';
AWS.config.region = region;

const container = new Container();

const logger: Winston.Logger = Winston.createLogger({
    format: Winston.format.json(),
    level: 'info',
    transports: [
        new Winston.transports.Console()
    ]
});

// NOTE: updates to the discovery service itself would require pushing a new docker image.
// This should still be an environment variable rather than hardcoded
process.env.DISCOVERY_SERVICE = 'https://4w35qhpotd.execute-api.us-east-1.amazonaws.com/prod';
const sdk: DiscoverySdk = new DiscoverySdk(process.env.DISCOVERY_SERVICE, region);

const poolLocator = new CognitoUserPoolLocatorUserManagement(region);
const authManager = new AuthManager(poolLocator, region, logger);
let queueUrl: string;
let tenantId: string;

const s3Buckets = {
    dev: 'adastra-dev-data-ingestion',
    prod: 'adastra-prod-data-ingestion'
};

const bucketName = s3Buckets[stage];

const integrationConfigFactory = new IntegrationConfigFactory(logger);

const startup = async () => {
    // Authentication & Resource lookups
    const endpoints = await sdk.lookupService('user-management', stage);
    process.env.USER_MANAGEMENT_URI = endpoints[0];
    const cognitoSession =
        await authManager.signIn(process.env.ASTRA_CLOUD_USERNAME, process.env.ASTRA_CLOUD_PASSWORD);
    await authManager.configureIamCredentials();

    // lookup SQS queue for this tenant
    const credentialsBearerToken: BearerTokenCredentials = {
        idToken: cognitoSession.getIdToken().getJwtToken(),
        type: 'BearerToken'
    };
    const userManagementApi = new UserManagementApi(
        process.env.USER_MANAGEMENT_URI,
        region,
        credentialsBearerToken);

    const poolListResponse = await userManagementApi.getUserPools();
    queueUrl = poolListResponse.data[0].tenantDataIngestionQueueUrl;
    tenantId = poolListResponse.data[0].tenant_id;

    // Config injection
    container.bind<AuthManager>(TYPES.AuthManager).toConstantValue(authManager);
    container.bind<Winston.Logger>(TYPES.Logger).toConstantValue(logger);
    container.bind<string>(TYPES.QueueUrl).toConstantValue(queueUrl);
    container.bind<string>(TYPES.TenantId).toConstantValue(tenantId);
    container.bind<string>(TYPES.Bucket).toConstantValue(bucketName);
    container.bind<IntegrationConfigFactory>(TYPES.IntegrationConfigFactory).toConstantValue(integrationConfigFactory);
    container.bind<IConnectionPoolManager>(TYPES.ConnectionPool).to(OracleConnectionPoolManager).inSingletonScope();

    // Message Management
    container.bind<MessageHandlerFactory>(TYPES.MessageHandlerFactory).to(MessageHandlerFactory).inSingletonScope();
    container.bind<IMessageHandler>(TYPES.SendDataHandler).to(SendDataHandler);
    container.bind<IMessageHandler>(TYPES.PreviewHandler).to(PreviewHandler);

    // Messages
    container.bind<MessageFactory>(TYPES.MessageFactory).to(MessageFactory).inSingletonScope();
    container.bind<IMessage>(TYPES.SendDataMessage).to(SendDataMessage);
    container.bind<IMessage>(TYPES.PreviewMessage).to(PreviewMessage);

    // Data Access
    container.bind<IDataReader>(TYPES.DataReader).to(OracleReader);
    container.bind<IDataWriter>(TYPES.DataWriter).to(S3Writer);

    // Agent Commands
    container.bind<ICommand>(TYPES.INGEST).to(AdHocIngestCommand);
    container.bind<ICommand>(TYPES.PREVIEW).to(AdHocPreviewCommand);

    // TODO: Revisit, is this necessary?
    container.bind<Container>(TYPES.Container).toConstantValue(container);

    return container;
};

export default startup;
