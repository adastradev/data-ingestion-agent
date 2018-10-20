import * as stream from 'stream';
import * as oracledb from 'oracledb';
import { inject, injectable } from 'inversify';
import TYPES from '../../../ioc.types';
import { Logger } from 'winston';

import IConnectionPoolManager from '../IConnectionPoolManager';

const POOL_SIZE = 5;

/**
 * An interface through which data is queried using predefined queries for the
 * target Oracle database.
 *
 * @export
 * @class OracleConnectionPoolManager
 * @implements {IConnectionPoolManager}
 */
@injectable()
export default class OracleConnectionPoolManager implements IConnectionPoolManager {
    private _logger: Logger;
    private _connectionPool: oracledb.IConnectionPool;

    constructor(
        @inject(TYPES.Logger) logger: Logger) {
        this._logger = logger;
    }

    public async open(): Promise<void> {
        if (process.env.ORACLE_ENDPOINT === undefined) {
            return;
        }
        this._connectionPool = await oracledb.createPool({
            connectString : process.env.ORACLE_ENDPOINT,
            password      : process.env.ORACLE_PASSWORD,
            poolMax       : POOL_SIZE,
            user          : process.env.ORACLE_USER
        });
    }

    public async close(): Promise<void> {
        if (this._connectionPool) {
            try {
                await (this._connectionPool as any).close(30);
            } catch (err) {
                console.error(err);
            }
        }
    }

    public async get(): Promise<any> {
        return Promise.resolve(this._connectionPool);
    }
}
