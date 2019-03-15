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

    public async getDDLQuery(validTableNames: string[]): Promise<string> {
        const prioritizedObjects: string[] = await this.prioritizeTables(validTableNames);

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
                return `SELECT ${prioritizedObjects.indexOf(name)} as "priority", TABLE_NAME, DBMS_METADATA.GET_DDL(\'TABLE\', TABLE_NAME, OWNER) as ddl ` +
                `FROM ALL_TABLES WHERE TABLE_NAME = \'${name}\' `;

                // Getting index DDL statements has proven to be even more cumbersome than getting table DDL. Specifying an owner
                // may not even succeed so leaving this to help in a future feature request to figure out how to do this cleanly
                // 'union all ' +
                // // We know what tables exist but must discover any indexes
                // `SELECT 2 as "priority", TABLE_NAME, DBMS_METADATA.GET_DDL(\'INDEX\', uidx.INDEX_NAME) as ddl ` +
                // `FROM ALL_INDEXES uidx where TABLE_NAME = '${name}' `;
            })
            .join('\nUNION ALL\n');
    }

    /**
     * Determines the order in which database tables should be created
     * based on their dependency graph.
     *
     * @private
     * @param {string[]} validTableNames All valid tables referenced by the integration type
     * @returns {Promise<string[]>} A sorted list of objects in order of creation priority
     * @memberof OracleDDLHelper
     */
    private async prioritizeTables(validTableNames: string[]): Promise<string[]> {
        const connection: oracledb.IConnection = await this._connectionPool.getConnection();

        const tableInClause = validTableNames.map((tableOrViewName) => {
            return `'${tableOrViewName}'`;
        })
        .join(',');

        const tableConstraintQueries = `SELECT
                cons.TABLE_NAME as child_table,
                col.TABLE_NAME parent_table
            FROM
                ALL_CONS_COLUMNS col
                JOIN ALL_CONSTRAINTS cons
                ON cons.R_OWNER = col.OWNER
                AND cons.R_CONSTRAINT_NAME = col.CONSTRAINT_NAME
            WHERE cons.TABLE_NAME in (${tableInClause})`;

        const records = await connection.execute(tableConstraintQueries);

        const tableGraph = new DepGraph<string>();
        validTableNames.forEach((tableOrView, idx, array) => tableGraph.addNode(tableOrView));

        // Use a simple 2-tuple to represent an association of two database objects
        let row: [string, string];
        for (row of records.rows) {
            // We don't care about self referencing tables so only worry about
            // inter-table dependencies
            if (row[0] !== row[1]) {
                tableGraph.addDependency(row[0], row[1]);
            }
        }

        return tableGraph.overallOrder();
    }
}
