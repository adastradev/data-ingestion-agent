import { Readable } from 'stream';

export default interface IOutputEncoder {
    encode: (inputStream: Readable) => IEncodeResult;
}

export interface IEncodeResult {
    outputStream: Readable;
    extension: string;
}
