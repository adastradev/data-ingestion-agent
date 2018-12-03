import IDDLHelper from '../IDDLHelper';
import { injectable } from 'inversify';

@injectable()
export default class OracleDDLHelper implements IDDLHelper {
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
}
