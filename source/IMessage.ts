/**
 * Represents a message delivered to the agent to perform some task(s).
 *
 * @export
 * @interface IMessage
 */
export default interface IMessage {
    /**
     * The unique message type descriptor
     *
     * @type {string}
     * @memberof IMessage
     */
    type: string,
    /**
     * The version of the message which may determine what tasks are performed
     *
     * @type {string}
     * @memberof IMessage
     */
    version: string,
    /**
     * A unique identifier of the message that may have context within 
     *
     * @type {string}
     * @memberof IMessage
     */
    receiptHandle?: string,
    payload: any,
    toJson: MessageToJsonFunction
}

export interface MessageToJsonFunction {
    (): string
}