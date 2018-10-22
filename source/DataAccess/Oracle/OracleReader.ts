import * as stream from 'stream';
import * as oracledb from 'oracledb';
import { inject, injectable } from 'inversify';
import TYPES from '../../../ioc.types';
import { Logger } from 'winston';

import IDataReader, { IQueryResult } from '../IDataReader';
import IConnectionPool from '../IConnectionPool';

/**
 * An interface through which data is queried using predefined queries for the
 * target Oracle database.
 *
 * @export
 * @class OracleReader
 * @implements {IDataReader}
 */
@injectable()
export default class OracleReader implements IDataReader {
    private _logger: Logger;
    private _connectionPool: IConnectionPool;
    private _connection: oracledb.IConnection;

    constructor(
        @inject(TYPES.Logger) logger: Logger,
        @inject(TYPES.ConnectionPool) connectionPool: IConnectionPool) {
        this._logger = logger;
        this._connectionPool = connectionPool;
    }

    public async read(queryStatement: string): Promise<IQueryResult> {
        if (process.env.ORACLE_ENDPOINT === undefined) {
            return { result: this.createDemoSnapshot(), metadata: null };
        }

        try {
            this._connection = await this._connectionPool.getConnection();

            // Query the data
            const binds = {};
            const options = {
              outFormat: oracledb.OBJECT // query result format
            };

            // TODO: Make fetch array size configurable?
            this._logger.info('Executing statement: ' + queryStatement);
            const objectStream = await this._connection.queryStream(queryStatement, [],
                { outFormat: oracledb.OBJECT, fetchArraySize: 10000, extendedMetaData: true } as any);

            const metadataStream = await this.getMetadata(objectStream);

            // const jsonTransformer = new stream.Transform( { objectMode: true });

            // jsonTransformer._transform = function (chunk, encoding, done) {
            //     // TODO: Decide on a format/encoding/structure - JSON for now
            //     const data = JSON.stringify(chunk);
            //     this.push(Buffer.from(data, encoding));

            //     done();
            // };

            // const metadataJsonStream = metadataStream.pipe(jsonTransformer);

            const jsonTransformer2 = new stream.Transform( { objectMode: true });

            jsonTransformer2._transform = function (chunk, encoding, done) {
                // TODO: Decide on a format/encoding/structure - JSON for now
                const data = JSON.stringify(chunk);
                this.push(Buffer.from(data, encoding));

                done();
            };
            const resultStream = objectStream.pipe(jsonTransformer2);

            return { result: resultStream, metadata: metadataStream };
        } catch (err) {
            this._logger.error(err);
            throw err;
        }
    }

    public async close(): Promise<void> {
        if (this._connectionPool && this._connection) {
            try {
                await this._connectionPool.releaseConnection(this._connection);
            } catch (err) {
                this._logger.error(err);
                return Promise.reject(err);
            }
        }
    }

    private async getMetadata(queryStream: stream.Readable): Promise<stream.Readable> {
        const metadataReceived = new Promise<any[]>((resolve, reject) => {
            queryStream.on('metadata', (md: any[]) => {
                resolve(md);
            });
        });

        const queryMetadataResult = await metadataReceived;

        const metadataStream = new stream.Readable({ objectMode: true });
        for (const col of queryMetadataResult) {
            metadataStream.push(col);
        }
        metadataStream.push(null);

        return metadataStream;
    }

    private createDemoSnapshot() {
        const s = new stream.Readable();
        s.push('this is a test stream');
        s.push(null);
        return s;
    }
}
