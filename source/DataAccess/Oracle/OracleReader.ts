import { Readable } from "stream";
import * as oracledb from 'oracledb';
import { injectable, inject } from "inversify";
import TYPES from "../../../ioc.types";
import { Logger } from "winston";

import IIngestionReader from "../IDataReader";

@injectable()
export default class OracleReader implements IIngestionReader {
    private _logger: Logger;
    
    private readonly queries = [
        'SELECT * FROM ALL_TABLES'
    ];

    constructor(@inject(TYPES.Logger) logger: Logger) {
        this._logger = logger;
    }

    public async read(): Promise<Readable> {

        if (process.env.ORACLE_ENDPOINT === undefined) {
            return this.createDemoSnapshot();
        }

        let connection;
        try {
            let sql, binds, options, result;

            connection = await oracledb.getConnection({
              user          : process.env.ORACLE_USER,
              password      : process.env.ORACLE_PASSWORD,
              connectString : process.env.ORACLE_ENDPOINT
            });

            // Query the data
            binds = {};
            options = {
              outFormat: oracledb.OBJECT // query result format
            };
            result = await connection.execute(this.queries[0], binds, options);

            var Readable = require('stream').Readable
            var s = new Readable;
            result.rows.forEach(element => {
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
        for (var query of this.queries) {
            this._logger.log("info", query)
        }
    }

    private createDemoSnapshot() {
        var s = new Readable;
        s.push('this is a test stream');
        s.push(null);
        return s;
    }
}