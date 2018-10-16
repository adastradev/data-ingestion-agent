import { Readable } from 'stream';
import * as oracledb from 'oracledb';
import { inject, injectable } from 'inversify';
import TYPES from '../../../ioc.types';
import { Logger } from 'winston';

import IIngestionReader from '../IDataReader';

/**
 * An interface through which data is queried using predefined queries for the
 * target Oracle database.
 *
 * @export
 * @class OracleReader
 * @implements {IIngestionReader}
 */
@injectable()
export default class OracleReader implements IIngestionReader {
    private logger: Logger;

    private readonly queries = [
        'SELECT * FROM ALL_TABLES'
    ];

    constructor(
        @inject(TYPES.Logger) logger: Logger) {
        this.logger = logger;
    }

    public async read(): Promise<Readable> {

        if (process.env.ORACLE_ENDPOINT === undefined) {
            return this.createDemoSnapshot();
        }

        let connection;
        try {
            connection = await oracledb.getConnection({
                connectString : process.env.ORACLE_ENDPOINT,
                password      : process.env.ORACLE_PASSWORD,
                user          : process.env.ORACLE_USER
            });

            // Query the data
            const binds = {};
            const options = {
              outFormat: oracledb.OBJECT // query result format
            };
            const result = await connection.execute(this.queries[0], binds, options);

            const s = new Readable();
            result.rows.forEach((element) => {
                s.push(JSON.stringify(element));
                s.push('\n');
            });
            s.push(null);
            return s;
        } catch (err) {
            console.error(err);
            throw err;
        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (err) {
                    console.error(err);
                }
            }
        }
    }

    public logQueries(): void {
        for (const query of this.queries) {
            this.logger.log('info', query);
        }
    }

    private createDemoSnapshot() {
        const s = new Readable();
        s.push('this is a test stream');
        s.push(null);
        return s;
    }
}
