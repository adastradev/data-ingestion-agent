import { Container } from 'inversify';
import TYPES from './ioc.types';

// Config
import * as AWS from 'aws-sdk';
import * as Winston from 'winston';
import * as Transport from 'winston-transport';
import { AuthManager, CognitoUserPoolLocatorUserManagement, UserManagementApi } from '@adastradev/user-management-sdk';
import { BearerTokenCredentials, DiscoverySdk } from '@adastradev/serverless-discovery-sdk';

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
import IConnectionPool from './source/DataAccess/IConnectionPool';
import OracleConnectionPoolProxy from './source/DataAccess/Oracle/OracleConnectionPoolProxy';
import { FileTransportOptions } from 'winston/lib/winston/transports';

import axios, { AxiosRequestConfig } from 'axios';

const region = process.env.AWS_REGION || 'us-east-1';
const stage = process.env.DEFAULT_STAGE || 'prod';
AWS.config.region = region;

process.env.UV_THREADPOOL_SIZE = process.env.CONCURRENT_CONNECTIONS || '5';

const container = new Container();

const transports: Transport[] = [
    new Winston.transports.Console()
];
if (process.env.LOG_PATH !== undefined) {
    const options: FileTransportOptions = {
        dirname: process.env.LOG_PATH,
        filename: 'dia.log'
    };
    transports.push(new Winston.transports.File(options));
}

const logger: Winston.Logger = Winston.createLogger({
    format: Winston.format.json(),
    level: process.env.LOG_LEVEL || 'info',
    transports
});

// NOTE: updates to the discovery service itself would require pushing a new docker image.
// This should still be an environment variable rather than hardcoded
process.env.DISCOVERY_SERVICE = 'https://4w35qhpotd.execute-api.us-east-1.amazonaws.com/prod';
const sdk: DiscoverySdk = new DiscoverySdk(process.env.DISCOVERY_SERVICE, region);

const poolLocator = new CognitoUserPoolLocatorUserManagement(region);
const authManager = new AuthManager(poolLocator, region);
let queueUrl: string;
let tenantId: string;

const s3Buckets = {
    dev: 'adastra-dev-data-ingestion',
    prod: 'adastra-prod-data-ingestion'
};

const bucketName = s3Buckets[stage];

const integrationConfigFactory = new IntegrationConfigFactory(logger);

const startup = async () => {
    if (logger.level === 'silly') { // truly silly debugging for testing proxy operation
        logger.silly('test GET http://example.com (via axios)');
        const exampleResponse = await axios.get('http://example.com');
        if (exampleResponse.status === 200) {
            logger.silly('SUCCESS: GET http://example.com');
        }

        logger.silly('test GET https://example.com (via axios)');
        const exampleHttpsResponse = await axios.get('https://example.com');
        if (exampleHttpsResponse.status === 200) {
            logger.silly('SUCCESS: GET https://example.com');
        }

        logger.silly('Looking up user management service address via raw axios request');
        const requestConfig: AxiosRequestConfig = {
            params: { ServiceName: 'user-management', StageName: stage }
        };
        try {
            const response = await axios.get(process.env.DISCOVERY_SERVICE + '/catalog/service', requestConfig);
            if (response.status === 200) {
                logger.silly('Located user management service via axios');
            }
        } catch (error) {
            logger.silly(error.message);
            logger.silly(error.stack);
            if (error.response !== undefined) {
                logger.silly(error.response);
            }
        }
    }

    // Authentication & Resource lookups
    logger.info('Looking up user management service address');
    const endpoints = await sdk.lookupService('user-management', stage);
    process.env.USER_MANAGEMENT_URI = endpoints[0];
    logger.silly('authManager.signIn');
    const cognitoSession =
        await authManager.signIn(process.env.ASTRA_CLOUD_USERNAME, process.env.ASTRA_CLOUD_PASSWORD);
    logger.silly('authManager.getIamCredentials');
    AWS.config.credentials = await authManager.getIamCredentials();

    // lookup SQS queue for this tenant
    const credentialsBearerToken: BearerTokenCredentials = {
        idToken: cognitoSession.getIdToken().getJwtToken(),
        type: 'BearerToken'
    };
    const userManagementApi = new UserManagementApi(
        process.env.USER_MANAGEMENT_URI,
        region,
        credentialsBearerToken);

    logger.info('Looking up tenant configuration info');
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
    container.bind<IConnectionPool>(TYPES.ConnectionPool).to(OracleConnectionPoolProxy).inSingletonScope();

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
