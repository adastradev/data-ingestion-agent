import { injectable } from 'inversify';
import IMessage from '../IMessage';

/**
 * Represents a message requesting the delivery of data to the configured endpoint.
 *
 * @export
 * @class SendDataMessage
 * @implements {IMessage}
 */
@injectable()
export default class SendDataMessage implements IMessage {

    /**
     * Creates a new SendDataMessage given the payload and optional identifier.
     *
     * @static
     * @param {SendDataPayload} payload
     * @param {string} [receiptHandle] A unique identifier of the message that may have context within
     * the system the message originated from or is intended to go to.
     * @returns {SendDataMessage}
     * @memberof SendDataMessage
     */
    public static create(payload?: any, receiptHandle?: string): SendDataMessage {
        const message = new SendDataMessage();
        message.payload = payload || {};

        if (receiptHandle) {
            message.receiptHandle = receiptHandle;
        }

        return message;
    }

    public type: string = 'SendData';
    public version: string = '1';
    public payload: any = {};
    public receiptHandle?: string;

    /**
     * Converts the instance to JSON.
     */
    public toJson(): string {
        return JSON.stringify(this);
    }
}
