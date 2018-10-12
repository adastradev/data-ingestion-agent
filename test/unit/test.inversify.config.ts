import { Container } from "inversify";
import TYPES from "../../ioc.types";
import {
    SendDataHandler
} from "../../source/MessageHandlers";

import { S3, SQS } from 'aws-sdk';
import * as Winston from 'winston';
// import { AuthManager } from "../../source/astra-sdk/AuthManager";
// import { CognitoUserPoolLocatorUserManagement } from "../../source/astra-sdk/CognitoUserPoolLocatorUserManagement";
// import IMessageHandler from "../../source/IMessageHandler";
// import { DiscoverySdk, BearerTokenCredentials } from "@adastradev/serverless-discovery-sdk";
// import { UserManagementApi } from "../../source/astra-sdk/UserManagementApi";
// import MessageHandlerFactory from "../../source/MessageHandlerFactory";
import MessageFactory from "../../source/MessageFactory";
import SendDataMessage from "../../source/Messages/SendDataMessage";
import IMessage from "../../source/IMessage";

// @inject(TYPES.S3Config) s3Config: S3.ClientConfiguration,
// @inject(TYPES.SQSConfig) sqsConfig: SQS.ClientConfiguration,
// @inject(TYPES.Logger) logger: Logger,
// @inject(TYPES.TenantId) tenantId: string,
// @inject(TYPES.Bucket) bucket: string,
// @inject(TYPES.QueueUrl) queueUrl: string) {

var container = new Container();

var logger: Winston.Logger = Winston.createLogger({
    level: 'info',
    format: Winston.format.json(),
    transports: [
        new Winston.transports.Console()
    ]
});

var s3Config: S3.ClientConfiguration = { region: "us-east-1" };
var sqsConfig: SQS.ClientConfiguration = { apiVersion: '2012-11-05', region: "us-east-1" };

// container.bind<IMessageHandler>(TYPES.SendDataHandler).to(SendDataHandler);
container.bind<MessageFactory>(TYPES.MessageFactory).to(MessageFactory).inSingletonScope();
container.bind<IMessage>(TYPES.SendDataMessage).to(SendDataMessage);
// container.bind<MessageHandlerFactory>(TYPES.MessageHandlerFactory).to(MessageHandlerFactory).inSingletonScope();
// container.bind<S3.ClientConfiguration>(TYPES.S3Config).toConstantValue(s3Config);
// container.bind<SQS.ClientConfiguration>(TYPES.SQSConfig).toConstantValue(s3Config);
// container.bind<Winston.Logger>(TYPES.Logger).toConstantValue(logger);
// container.bind<string>(TYPES.QueueUrl).toConstantValue("http://www.someurl.com");
// container.bind<string>(TYPES.TenantId).toConstantValue("74c23bda-a496-4ccb-b08f-a9ab80e407b6");
// container.bind<string>(TYPES.Bucket).toConstantValue("some-bucket");

container.bind<Container>(TYPES.Container).toConstantValue(container);

export default container;