import { Container } from 'inversify';
import TYPES from './ioc.types';

// Config
import getCloudDependencies from './source/Util/getCloudDependencies';
import * as AWS from 'aws-sdk';
import * as Winston from 'winston';
import * as Transport from 'winston-transport';
import {
    CustomAuthManager
} from './source/Auth/CustomAuthManager';
import {
    CognitoUserPoolLocatorUserManagement,
    configureAwsProxy
} from '@adastradev/user-management-sdk';
import { DataIngestionApi } from '@adastradev/data-ingestion-sdk';
import { QueryService } from './source/queryServiceAPI';
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
import OracleDDLHelper from './source/DataAccess/Oracle/OracleDDLHelper';
import IDDLHelper from './source/DataAccess/IDDLHelper';
import { FileTransportOptions } from 'winston/lib/winston/transports';
import { IntegrationSystemType } from './source/IIntegrationConfig';

import axios, { AxiosRequestConfig } from 'axios';
import { Agent } from './source/Agent';
import { SNS, SQS } from 'aws-sdk';
import IOutputEncoder from './source/DataAccess/IOutputEncoder';
import GZipOutputEncoder from './source/DataAccess/GZipOutputEncoder';
import { DefaultHttpClientProvider } from './source/Util/DefaultHttpClientProvider';

const region = process.env.AWS_REGION || 'us-east-1';
const stage = process.env.DEFAULT_STAGE || 'prod';

// AWS module configuration
configureAwsProxy(AWS.config);
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

const cloudDependenciesMap: Map<any, any> = getCloudDependencies();
const sdk: DiscoverySdk = new DiscoverySdk(process.env.DISCOVERY_SERVICE, region, process.env.DEFAULT_STAGE, null, cloudDependenciesMap);

const poolLocator = new CognitoUserPoolLocatorUserManagement(region);
const authManager = new CustomAuthManager(poolLocator, region);

const startup = async () => {
    try {
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

            const response = await axios.get(process.env.DISCOVERY_SERVICE + '/catalog/service', requestConfig);
            if (response.status === 200) {
                logger.silly('Located user management service via axios');
            }
        }

        // Authentication & Resource lookups
        logger.info('Looking up user management service address');
        let endpoints;
        try {
            endpoints = await sdk.lookupService('user-management');
            process.env.USER_MANAGEMENT_URI = endpoints[0];
            logger.info(process.env.USER_MANAGEMENT_URI);
        } catch (error) {
            logger.error('Failed to find the user management service via the lookup service');
            throw error;
        }

        logger.info('Looking up data ingestion service address');
        try {
            endpoints = await sdk.lookupService('data-ingestion');
            process.env.DATA_INGESTION_URI = endpoints[0];
            logger.info(process.env.DATA_INGESTION_URI);
        } catch (error) {
            logger.error('Failed to find the data ingestion service via the lookup service');
            throw error;
        }

        logger.info('Looking up elt query service address');
        try {
            endpoints = await sdk.lookupService('elt-queries');
            process.env.ELT_QUERY_URI = endpoints[0];
            logger.info( process.env.ELT_QUERY_URI);
        } catch (error) {
            logger.error('Failed to find the elt query service via the lookup service');
            throw error;
        }

        logger.silly('authManager.signIn');
        let cognitoSession;
        try {
            cognitoSession = await authManager.signIn(process.env.ASTRA_CLOUD_USERNAME, process.env.ASTRA_CLOUD_PASSWORD);
        } catch (error) {
            logger.error('Failed to sign in, please confirm the specified user exists and is in a valid state');
            throw error;
        }

        logger.silly('authManager.refreshCognitoCredentials()');
        try {
            await authManager.refreshCognitoCredentials();
        } catch (error) {
            logger.error('Failed to get authentication keys, please confirm the specified user exists and is in a valid state');
            throw error;
        }

        // lookup SQS queue for this tenant
        const credentialsBearerToken: BearerTokenCredentials = {
            idToken: cognitoSession.getIdToken().getJwtToken(),
            type: 'BearerToken'
        };
        const dataIngestionApi = new DataIngestionApi(
            process.env.DATA_INGESTION_URI,
            region,
            credentialsBearerToken);

        const httpClientProvider = new DefaultHttpClientProvider();
        const queryService = new QueryService(
            process.env.ELT_QUERY_URI,
            region,
            httpClientProvider,
            credentialsBearerToken);

        logger.info('Looking up ingestion user specific ingestion settings');
        let tenantSettingsResponse;
        try {
            tenantSettingsResponse = await dataIngestionApi.getTenantSettings();
        } catch (error) {
            logger.error('Could not find user specific ingestion settings');
            throw error;
        }
        const queueUrl = tenantSettingsResponse.data.tenantDataIngestionQueueUrl;
        const bucketPath = tenantSettingsResponse.data.dataIngestionBucketPath;
        const tenantName = tenantSettingsResponse.data.tenantName;

        logger.info('Looking up ingestion settings');
        let globalConfigResponse;
        try {
            globalConfigResponse = await dataIngestionApi.getSettings();
        } catch (error) {
            logger.error('Could not find ingestion settings');
        }
        const snsTopicArn = globalConfigResponse.data.snapshotReceivedTopicArn;

        // App
        container.bind<Agent>(TYPES.Agent).to(Agent).inSingletonScope();

        // Authentication
        container.bind<QueryService>(TYPES.QueryService).toConstantValue(queryService);

        // AWS
        container.bind<SQS>(TYPES.SQS).toConstantValue(new SQS());
        container.bind<SNS>(TYPES.SNS).toConstantValue(new SNS());

        // Config injection
        container.bind<CustomAuthManager>(TYPES.AuthManager).toConstantValue(authManager);
        container.bind<Winston.Logger>(TYPES.Logger).toConstantValue(logger);
        container.bind<string>(TYPES.QueueUrl).toConstantValue(queueUrl);
        container.bind<string>(TYPES.SnapshotReceivedTopicArn).toConstantValue(snsTopicArn);
        container.bind<string>(TYPES.Bucket).toConstantValue(bucketPath);
        container.bind<string>(TYPES.TenantName).toConstantValue(tenantName);
        container.bind<IntegrationConfigFactory>(TYPES.IntegrationConfigFactory)
            .to(IntegrationConfigFactory).inSingletonScope();
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
        container.bind<IDDLHelper>(TYPES.DDLHelper).to(OracleDDLHelper).whenTargetNamed(IntegrationSystemType.Oracle);
        container.bind<IOutputEncoder>(TYPES.OutputEncoder).to(GZipOutputEncoder);

        // Agent Commands
        container.bind<ICommand>(TYPES.INGEST).to(AdHocIngestCommand);
        container.bind<ICommand>(TYPES.PREVIEW).to(AdHocPreviewCommand);

        // TODO: Revisit, is this necessary?
        container.bind<Container>(TYPES.Container).toConstantValue(container);

        return container;
    } catch (error) {
        logger.error('Data ingestion agent initialization error: ' + error.message);
        // Log detail for axios errors
        if (error.response !== undefined && error.response.data !== undefined) {
            logger.debug('Axios response data: ' + JSON.stringify(error.response.data));
        }
        throw error;
    }
};

export default startup;
