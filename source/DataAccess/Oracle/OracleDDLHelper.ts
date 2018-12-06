import IDDLHelper from '../IDDLHelper';
import { inject, injectable } from 'inversify';
import TYPES from '../../../ioc.types';
import IConnectionPool from '../IConnectionPool';
import oracledb = require('oracledb');
import { DepGraph } from 'dependency-graph';

@injectable()
export default class OracleDDLHelper implements IDDLHelper {

    constructor(@inject(TYPES.ConnectionPool) private readonly _connectionPool: IConnectionPool) {
    }

    public getDDLQuery(validTableNames: string[]): string {
        // Having the ability to use DBMS_METADATA.SET_TRANSFORM_PARAM would help here to remove things like
        // disabling the scripting of the 'user' in create statements but this system function does not seem
        // to always be available despite 'GET_DDL' working
        // NOTE: Scripting dependencies (FKs etc) via simple commands such as GET_DDL does not seem to be
        // possible and would require some extra overhead to implement
        return validTableNames
            .filter((name) => {
                // The expected # of tables is not expected to reach a point where this would be
                // noticeably ineffficient
                return validTableNames.indexOf(name) > -1;
            })
            .map((name) => {
                // This apparently does not return metadata for some system tables/views like ALL_TABLES but will return
                // proper DDL otherwise
                return `SELECT 1 as "priority", TABLE_NAME, DBMS_METADATA.GET_DDL(\'TABLE\', TABLE_NAME, OWNER) as ddl ` +
                `FROM ALL_TABLES where TABLE_NAME = \'${name}\' `;

                // Getting index DDL statements has proven to be even more cumbersome than getting table DDL. Specifying an owner
                // may not even succeed so leaving this to help in a future feature request to figure out how to do this cleanly
                // 'union all ' +
                // // We know what tables exist but must discover any indexes
                // `SELECT 2 as "priority", TABLE_NAME, DBMS_METADATA.GET_DDL(\'INDEX\', uidx.INDEX_NAME) as ddl ` +
                // `FROM ALL_INDEXES uidx where TABLE_NAME = '${name}' `;
            })
            .join('\nunion all\n');
    }

    public async prioritizeObjects(validTableNames: string[]): Promise<string[]> {
        try {
            // await this._connectionPool.open();
            const connection: oracledb.IConnection = await this._connectionPool.getConnection();

            const tableConstraintQueries = validTableNames.map((tableOrViewName) => {
                return `select
                    cons.table_name       as child_table,
                    col.table_name           parent_table
                from
                    all_cons_columns      col
                    JOIN all_constraints       cons
                    ON cons.r_owner = col.owner
                    AND cons.r_constraint_name = col.constraint_name
                where cons.table_name = '${tableOrViewName}'"`;
            })
            .join('\nunion all\n');

            const records = await connection.execute(tableConstraintQueries);

            const tableGraph = new DepGraph<string>({ circular: true });
            validTableNames.forEach((tableOrView, idx, array) => tableGraph.addNode(tableOrView));

            // Use a simple 2-tuple to represent an association of two database objects
            let row: [string, string];
            for (row of records.rows) {
                tableGraph.addDependency(row[0], row[1]);
            }

            return tableGraph.overallOrder();

        } catch (error) {
            throw error;
        }
    }
}
