import ICommand from './ICommand';
import { inject, injectable } from 'inversify';
import TYPES from '../../ioc.types';
import { SQS } from 'aws-sdk';
import SendDataMessage from '../Messages/SendDataMessage';
import { Logger } from 'winston';

/**
 * Initiates an adhoc run of the data ingestion agent ingestion process
 *
 * @export
 * @class AdHocIngestCommand
 * @implements {ICommand}
 */
@injectable()
export default class AdHocIngestCommand implements ICommand {
    constructor(
        @inject(TYPES.QueueUrl) private _queueUrl: string,
        @inject(TYPES.Logger) private _logger: Logger) {
    }

    public async invoke(subArgs?: string[]) {
        this._logger.debug('Sending ingest notification');
        const sqs = new SQS();
        const sendDataMessage = SendDataMessage.create();
        await sqs.sendMessage({ QueueUrl: this._queueUrl, MessageBody: sendDataMessage.toJson() }).promise();
    }
}
