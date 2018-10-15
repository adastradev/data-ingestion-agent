import { Readable } from "stream";

export default interface IIngestionWriter {
    ingest: IngestionFunction
}

export interface IngestionFunction {
    (stream: Readable): Promise<void>
}