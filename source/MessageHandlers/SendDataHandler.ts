import IMessageHandler from "../IMessageHandler";
import IMessage from "../IMessage";
import TYPES from "../../ioc.types";

import { S3 } from "aws-sdk";
import { Logger } from "winston";

import { injectable, inject } from "inversify";
import "reflect-metadata";
import SendDataMessage, { SendDataPayload } from "../Messages/SendDataMessage";

@injectable()
export default class SendDataHandler implements IMessageHandler {
    constructor() {
    }

    @inject(TYPES.AuthService)
    public AuthService: any;

    @inject(TYPES.S3Config)
    public S3Config: S3.ClientConfiguration;

    @inject(TYPES.Logger)
    public Logger: Logger; 

    public handle(message: SendDataMessage) {
        console.log("Handled!");
        console.log(`Message Body: ${message.payload}`);

        if (message.payload.preview) {

        } 
        else {
            // ingest!
        }        
    }
}