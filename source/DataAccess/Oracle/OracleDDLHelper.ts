import IDDLHelper from '../IDDLHelper';
import { injectable } from 'inversify';

@injectable()
export default class OracleDDLHelper implements IDDLHelper {
    public getDDLQuery(tableName: string): string {
        // Having the ability to use DBMS_METADATA.SET_TRANSFORM_PARAM would help here to remove things like
        // disabling the scripting of the 'user' in create statements but this system function does not seem
        // to always be available despite 'GET_DDL' working
        // NOTE: Scripting dependencies (FKs etc) via simple commands such as GET_DDL does not seem to be
        // possible and would require some extra overhead to implement
        return `SELECT 1 as "priority", ${tableName} as table_name, DBMS_METADATA.GET_DDL(\'TABLE\',\'${tableName}\') as ddl ` +
            'FROM dual ' +
            'union all ' +
            `SELECT 2 as "priority", ${tableName} as table_name, DBMS_METADATA.GET_DDL(\'INDEX\',\'${tableName}\') as ddl ` +
            'FROM dual ';
    }
}
