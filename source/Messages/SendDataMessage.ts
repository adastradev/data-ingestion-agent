import IMessage from "../IMessage";

export default class SendDataMessage implements IMessage {
    public type: string = "SendData";
    public version: string = "v1";
    public payload: SendDataPayload;
}

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