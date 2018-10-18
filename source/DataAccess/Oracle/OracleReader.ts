import { Readable, Transform } from 'stream';
import transform from 'stream-transform';
import { Stringifier } from 'csv-stringify';
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

    private readonly queries = [
        'SELECT * FROM dummysisdata where rownum < 100',
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
            // const result = await connection.execute(this.queries[0], binds, options);
            const stream = await this.connection.queryStream(this.queries[0], [],
                { outFormat: oracledb.OBJECT } as any);

            const transformer = transform((data) => {
                return
            });

            // const stringifier = new Stringifier({
            //     columns: ['Id', 'Name', 'City'],
            //     delimiter: '\t',
            //     header: true
            //   });

            // const outStream = stream.pipe(stringifier);

            return stream;
        } catch (err) {
            console.error(err);
            throw err;
        }
    }

    public async close(): Promise<void> {
        if (this.connection) {
            try {
                await this.connection.close();
            } catch (err) {
                console.error(err);
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
