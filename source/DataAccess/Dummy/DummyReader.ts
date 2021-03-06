import { Readable } from 'stream';
import { inject, injectable } from 'inversify';
import TYPES from '../../../ioc.types';
import { Logger } from 'winston';

import IDataReader, { IQueryResult } from '../IDataReader';

@injectable()
export default class DummyReader implements IDataReader {
    private _logger: Logger;

    constructor(@inject(TYPES.Logger) logger: Logger) {
        this._logger = logger;
    }

    public async read(): Promise<IQueryResult> {
        const s = new Readable();
        s.push('dummy data');
        s.push('\n');
        s.push(null);

        const metadataStream = new Readable({objectMode: true});
        metadataStream.push({ name: 'somecolumn', dbType: 'someType'});
        metadataStream.push(null);

        return { result: s, metadata: metadataStream };
    }

    public async close(): Promise<void> {
        return Promise.resolve();
    }

    public logQueries(): void {
        this._logger.info('dummy query');
    }
}
