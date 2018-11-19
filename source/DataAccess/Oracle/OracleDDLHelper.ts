import IDDLHelper from '../IDDLHelper';
import { injectable } from 'inversify';

@injectable()
export default class OracleDDLHelper implements IDDLHelper {
    public getDDLQuery(tableNames: string[]): string {
        const tableFilter = tableNames.map((tbl) => `'${tbl}'`).join(',');

        // Having the ability to use DBMS_METADATA.SET_TRANSFORM_PARAM would help here to remove things like
        // disabling the scripting of the 'user' in create statements but this system function does not seem
        // to always be available despite 'GET_DDL' working
        // NOTE: Scripting dependencies (FKs etc) via simple commands such as GET_DDL does not seem to be
        // possible and would require some extra overhead to implement
        const ddlQuery =
            'SELECT 1 as "priority", u.table_name, DBMS_METADATA.GET_DDL(\'TABLE\',u.table_name) as ddl ' +
            'FROM USER_TABLES u ' +
            `WHERE u.table_name in (${tableFilter})` +
            'union all ' +
            'SELECT 2 as "priority", u.table_name, DBMS_METADATA.GET_DDL(\'INDEX\',u.index_name) as ddl ' +
            'FROM USER_INDEXES u ' +
            `WHERE u.table_name in (${tableFilter})`  +
            'ORDER BY table_name, "priority"';

        return ddlQuery;
    }
}
