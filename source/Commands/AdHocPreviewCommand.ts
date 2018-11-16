import ICommand from './ICommand';
import { inject, injectable } from 'inversify';
import TYPES from '../../ioc.types';
import { SQS } from 'aws-sdk';
import PreviewMessage from '../Messages/PreviewMessage';
import { Logger } from 'winston';

/**
 * Initiates a preview of queries logged to stdout without performing query operations or delivering data.
 *
 * @export
 * @class AdHocPreviewCommand
 * @implements {ICommand}
 */
@injectable()
export default class AdHocPreviewCommand implements ICommand {
    constructor(
        @inject(TYPES.QueueUrl) private _queueUrl: string,
        @inject(TYPES.Logger) private _logger: Logger) {
    }

    public async invoke(subArgs?: string[]) {
        this._logger.debug('Sending previewMessage notification');
        const sqs = new SQS();
        const previewMessage = PreviewMessage.create();
        await sqs.sendMessage({ QueueUrl: this._queueUrl, MessageBody: previewMessage.toJson() }).promise();
    }
}
