import * as stream from 'stream';
import * as oracledb from 'oracledb';
import { inject, injectable } from 'inversify';
import TYPES from '../../../ioc.types';
import { Logger } from 'winston';

import IDataReader from '../IDataReader';
import IConnectionPoolManager from '../IConnectionPoolManager';

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
    private _connectionPool: IConnectionPoolManager;
    private _connection: oracledb.IConnection;

    constructor(
        @inject(TYPES.Logger) logger: Logger,
        @inject(TYPES.ConnectionPool) connectionPool: IConnectionPoolManager) {
        this._logger = logger;
        this._connectionPool = connectionPool;
    }

    public async read(queryStatement: string): Promise<stream.Readable> {
        if (process.env.ORACLE_ENDPOINT === undefined) {
            return this.createDemoSnapshot();
        }

        try {
            const oracleConnectionPool: oracledb.IConnectionPool = await this._connectionPool.get();
            this._connection = await oracleConnectionPool.getConnection();

            // Query the data
            const binds = {};
            const options = {
              outFormat: oracledb.OBJECT // query result format
            };

            // TODO: Make fetch array size configurable?
            this._logger.info('Executing statement: ' + queryStatement);
            const s = await this._connection.queryStream(queryStatement, [],
                { outFormat: oracledb.OBJECT, fetchArraySize: 10000 } as any);

            const t = new stream.Transform( { objectMode: true });

            t._transform = function (chunk, encoding, done) {
                // TODO: Decide on a format/encoding/structure - JSON for now
                const data = JSON.stringify(chunk);
                this.push(Buffer.from(data, encoding));

                done();
            };

            // tslint:disable-next-line:only-arrow-functions
            t._flush = function (done) {
                // lgr.info(`Flushing`);
                done();
            };

            const result = s.pipe(t);

            return result;
        } catch (err) {
            console.error(err);
            throw err;
        }
    }

    public async close(): Promise<void> {
        if (this._connection) {
            try {
                await this._connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }

    private createDemoSnapshot() {
        const s = new stream.Readable();
        s.push('this is a test stream');
        s.push(null);
        return s;
    }
}
