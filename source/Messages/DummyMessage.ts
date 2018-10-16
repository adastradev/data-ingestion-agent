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
export default class DummyMessage implements IMessage {

    /**
     * Creates a new DummyMessage given the payload and optional identifier.
     *
     * @static
     * @param {string} payload
     * @param {string} [receiptHandle] A unique identifier of the message that may have context within
     * the system the message originated from or is intended to go to.
     * @returns {DummyMessage}
     * @memberof DummyMessage
     */
    public static create(payload?: string, receiptHandle?: string): DummyMessage {
        const message = new DummyMessage();
        message.payload = payload || '';

        if (receiptHandle) {
            message.receiptHandle = receiptHandle;
        }

        return message;
    }
    public type: string = 'Dummy';
    public version: string = 'v1';
    public payload: string = '';
    public receiptHandle?: string;

    /**
     * Converts the instance to JSON.
     */
    public toJson(): string {
        return JSON.stringify(this);
    }
}
