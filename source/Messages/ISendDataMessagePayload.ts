/**
 * The expected structure of a SendData messages payload property.
 *
 * @export
 * @interface SendDataPayload
 */
export default interface SendDataPayload {
    
    /**
     * When true only a log will be produced containing a preview of queries to be executed. Otherwise 
     * the ingestion process will run and push data to the S3 bucket.
     *
     * @type {boolean}
     * @memberof SendDataPayload
     */
    preview?: boolean;
}