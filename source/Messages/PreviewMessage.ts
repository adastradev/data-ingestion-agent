import { injectable } from "inversify";
import IMessage from "../IMessage";

/**
 * Represents a received to instruct the agent to preview queries used by the agent
 *
 * @export
 * @class SendDataMessage
 * @implements {IMessage}
 */
@injectable()
export default class PreviewMessage implements IMessage {
    public type: string = "Preview";
    public version: string = "1";
    public payload: any = {};
    public receiptHandle?: string;

    /**
     * Creates a new PreviewMessage given the payload and optional identifier.
     *
     * @static
     * @param {any} payload
     * @param {string} [receiptHandle] A unique identifier of the message that may have context within 
     * the system the message originated from or is intended to go to.
     * @returns {SendDataMessage}
     * @memberof SendDataMessage
     */
    public static create(payload?: any, receiptHandle?: string): PreviewMessage {
        var message = new PreviewMessage();
        message.payload = payload || {};

        if (receiptHandle) {
            message.receiptHandle = receiptHandle;
        }

        return message;
    }

    /**
     * Converts the instance to JSON.
     */
    public toJson(): string {
        return JSON.stringify(this);
    }
}

