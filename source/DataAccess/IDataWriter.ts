import { Readable } from "stream";

export default interface IDataWriter {
    ingest: IngestionFunction
}

export interface IngestionFunction {
    (stream: Readable): Promise<void>
}