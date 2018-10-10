import IMessage from "../IMessage";
import { injectable } from "inversify";

/**
 * Represents a message requesting the delivery of data to the configured endpoint.
 *
 * @export
 * @class SendDataMessage
 * @implements {IMessage}
 */
@injectable()
export default class SendDataMessage implements IMessage {
    public type: string = "SendData";
    public version: string = "v1";
    public payload: SendDataPayload;
    public receiptHandle: string;

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
    public static create(payload: SendDataPayload, receiptHandle?: string): SendDataMessage {
        var message = new SendDataMessage();
        message.payload = payload;
        message.receiptHandle = receiptHandle;

        return message;
    }

    /**
     * Converts the instance to JSON.
     */
    public toJson(): string {
        return JSON.stringify(this);
    }
}

/**
 * The expected structure of a SendData messages payload property.
 *
 * @export
 * @interface SendDataPayload
 */
export interface SendDataPayload {
    
    /**
     * When true only a log will be produced containing a preview of queries to be executed. Otherwise 
     * the ingestion process will run and push data to the S3 bucket.
     *
     * @type {boolean}
     * @memberof SendDataPayload
     */
    preview: boolean;
}