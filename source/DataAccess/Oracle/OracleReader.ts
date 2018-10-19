import * as stream from 'stream';
import * as oracledb from 'oracledb';
import { inject, injectable } from 'inversify';
import TYPES from '../../../ioc.types';
import { Logger } from 'winston';

import IDataReader from '../IDataReader';

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
    private logger: Logger;
    private connection: oracledb.IConnection;

    constructor(
        @inject(TYPES.Logger) logger: Logger) {
        this.logger = logger;
    }

    public async read(queryStatement: string): Promise<stream.Readable> {

        if (process.env.ORACLE_ENDPOINT === undefined) {
            return this.createDemoSnapshot();
        }

        try {
            this.connection = await oracledb.getConnection({
                connectString : process.env.ORACLE_ENDPOINT,
                password      : process.env.ORACLE_PASSWORD,
                user          : process.env.ORACLE_USER
            });

            // Query the data
            const binds = {};
            const options = {
              outFormat: oracledb.OBJECT // query result format
            };

            // TODO: Make fetch array size configurable?
            this.logger.info('Executing statement: ' + queryStatement);
            const s = await this.connection.queryStream(queryStatement, [],
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

    // TODO: This is leaky, need a better abstraction while
    // still allowing streams to fully process before closing
    // a connection
    public async close(): Promise<void> {
        if (this.connection) {
            try {
                await this.connection.close();
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
