import ICommand from './ICommand';
import { inject, injectable } from 'inversify';
import TYPES from '../../ioc.types';
import { SQS } from 'aws-sdk';
import PreviewMessage from '../Messages/PreviewMessage';

/**
 * Initiates a preview of queries logged to stdout without performing query operations or delivering data.
 *
 * @export
 * @class AdHocPreviewCommand
 * @implements {ICommand}
 */
@injectable()
export default class AdHocPreviewCommand implements ICommand {
    private _queueUrl;

    constructor(
        @inject(TYPES.QueueUrl) queueUrl: string) {
        this._queueUrl = queueUrl;
    }

    public async invoke(subArgs?: string[]) {
        const sqs = new SQS();
        const previewMessage = PreviewMessage.create();
        await sqs.sendMessage({ QueueUrl: this._queueUrl, MessageBody: previewMessage.toJson() }).promise();
    }
}
