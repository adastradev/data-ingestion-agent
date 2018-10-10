import { Container } from "inversify";
import TYPES from "./ioc.types";
import {
    SendDataHandler
} from "./source/MessageHandlers";

import { S3, SQS } from 'aws-sdk';
import * as Winston from 'winston';

var container = new Container();

// TODO: Get region
var s3Config: S3.ClientConfiguration = { region: "us-east-1" };
var sqsConfig: SQS.ClientConfiguration = { apiVersion: '2012-11-05', region: "us-east-1"};

var logger = Winston.createLogger({
    level: 'info',
    format: Winston.format.json(),
    transports: [
        new Winston.transports.Console()
    ]
});

container.bind<Container>(TYPES.IOCContainer).(container);
container.bind<SendDataHandler>(TYPES.SendDataHandler).to(SendDataHandler);
container.bind<S3.ClientConfiguration>(TYPES.S3Config).toConstantValue(s3Config);
container.bind<SQS.ClientConfiguration>(TYPES.SQSConfig).toConstantValue(s3Config);
container.bind<Winston.Logger>(TYPES.Logger).to(logger);