import ICommand from "./ICommand";
import { injectable, inject } from "inversify";
import TYPES from "../../ioc.types";
import { SQS } from "aws-sdk";
import SendDataMessage from "../Messages/SendDataMessage";

/**
 * Initiates an adhoc run of the data ingestion agent ingestion process
 *
 * @export
 * @class AdHocIngestCommand
 * @implements {ICommand}
 */
@injectable()
export default class AdHocIngestCommand implements ICommand {

    private _sqsConfig;
    private _queueUrl;

    constructor(
        @inject(TYPES.SQSConfig) sqsConfig: SQS.ClientConfiguration,
        @inject(TYPES.QueueUrl) queueUrl: string) {
        
        this._sqsConfig = sqsConfig;
        this._queueUrl = queueUrl;
    }

    public async invoke(subArgs?: string[]) {
        var sqs = new SQS(this._sqsConfig);
        var sendDataMessage = SendDataMessage.create();
        await sqs.sendMessage({ QueueUrl: this._queueUrl, MessageBody: sendDataMessage.toJson() }).promise();
    }
}