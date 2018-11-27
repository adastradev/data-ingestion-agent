import * as stream from 'stream';
import * as oracledb from 'oracledb';
import { inject, injectable, named } from 'inversify';
import TYPES from '../../../ioc.types';
import { Logger } from 'winston';

import IDataReader, { IQueryResult } from '../IDataReader';
import IConnectionPool from '../IConnectionPool';
import { TableNotFoundException } from '../../TableNotFoundException';

import 'reflect-metadata';
import { IIntegrationConfig, IntegrationSystemType, IntegrationType, IQueryDefinition  } from '../../IIntegrationConfig';
import IDDLHelper from '../IDDLHelper';

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

        // TS recognizes oracledb.fetchAsString as a const/readonly and
        // thus complains. Getting around the issue requires a cast to <any>
        (oracledb as any).fetchAsString = [ oracledb.CLOB ];
    }

    public async read(queryDefinition: IQueryDefinition): Promise<IQueryResult> {
        if (process.env.ORACLE_ENDPOINT === undefined) {
            return Promise.resolve({ result: this.createDemoSnapshot(), ddl: null, metadata: null });
        }

        try {
            this._connection = await this._connectionPool.getConnection();

            // Query the data
            const binds = {};
            const options = {
              outFormat: oracledb.OBJECT // query result format
            };

            // TODO: Make fetch array size configurable?
            this._logger.info('Executing statement: ' + queryDefinition.query);
            const queryResultStream = await this._connection.queryStream(queryDefinition.query, [],
                { outFormat: oracledb.OBJECT, fetchArraySize: 10000, extendedMetaData: true } as any);

            return await this.subscribeToStreamEvents(queryResultStream, queryDefinition.query);
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

    private async subscribeToStreamEvents(queryStream: stream.Readable, queryStatement: string): Promise<IQueryResult> {
        const streamEvents = new Promise<any>((resolve, reject) => {
            const result: IQueryResult = { result: null, metadata: null };

            queryStream.on('metadata', (md: any[]) => {
                result.metadata = this.getMetadataAsStream(md);
                result.result = this.getTransformStream(queryStream);
                resolve(result);
            });

            queryStream.on('error', (error: any) => {
                this._logger.error(`Failed to execute: '${queryStatement}' - ${error.stack}`);
                queryStream.destroy();
                // Translate - ORA-00942: table or view does not exist
                if (error.errorNum && error.errorNum === 942) {
                    reject(new TableNotFoundException(queryStatement, error.message));
                } else {
                    reject(error);
                }
            });

            queryStream.on('end', () => {
                // Don't block waiting on completion; this is for informational purposes
                this._logger.info(`end event received for query: '${queryStatement}'`);
            });
        });

        return await streamEvents;
    }

    private getMetadataAsStream(columnMetadata: any[]): stream.Readable {
        const columnMetadataStream = new stream.Readable({ objectMode: true });
        for (const col of columnMetadata) {
            columnMetadataStream.push(col);
        }
        columnMetadataStream.push(null);

        return columnMetadataStream;
    }

    private getTransformStream(queryStream: stream.Readable): stream.Readable {
        const jsonTransformer = new stream.Transform( { objectMode: true });
        jsonTransformer._transform = function (chunk, encoding, done) {
            // TODO: Decide on a format/encoding/structure - JSON for now
            const data = JSON.stringify(chunk) + '\n';
            this.push(Buffer.from(data, encoding));
            done();
        };
        const resultStream = queryStream.pipe(jsonTransformer);
        return resultStream;
    }

    private createDemoSnapshot() {
        const s = new stream.Readable();
        s.push('this is a test stream');
        s.push(null);
        return s;
    }
}
