import { Readable } from 'stream';

/**
 * Represents a mechanism with the ability to write data to a data store
 *
 * @export
 * @interface IDataWriter
 */
export default interface IDataWriter {
    ingest: IngestionFunction;
}

interface IUploadResponse {
    fileName: string;
    bucket: string;
}

export type IngestionFunction = (stream: Readable, folderPath: string, fileNamePrefix: string) => Promise<IUploadResponse>;
