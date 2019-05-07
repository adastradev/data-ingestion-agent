import IOutputEncoder, { IEncodeResult } from './IOutputEncoder';
import { Readable } from 'stream';
import * as zlib from 'zlib';
import { injectable } from 'inversify';
@injectable()
export default class GZipOutputEncoder implements IOutputEncoder {
    public encode(inputStream: Readable): IEncodeResult {
        return { outputStream: inputStream.pipe(zlib.createGzip()), extension: 'gz' };
    }
}
