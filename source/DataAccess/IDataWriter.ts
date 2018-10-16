import { Readable } from "stream";

/**
 * Represents a mechanism with the ability to write data to a data store
 *
 * @export
 * @interface IDataWriter
 */
export default interface IDataWriter {
    ingest: IngestionFunction
}

export interface IngestionFunction {
    (stream: Readable): Promise<void>
}