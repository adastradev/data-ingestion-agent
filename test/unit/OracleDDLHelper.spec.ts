
import 'reflect-metadata';
import * as chai from 'chai';

import OracleDDLHelper from '../../source/DataAccess/Oracle/OracleDDLHelper';

const expect = chai.expect;

describe('OracleDDLHelper', () => {

    describe('getDDLQuery', () => {

        it('should return a properly formatted query for all specified tables', async () => {
            const helper = new OracleDDLHelper();
            const query = helper.getDDLQuery(['table1', 'table2']);

            const expectedQuery =
                'SELECT 1 as "priority", u.table_name, DBMS_METADATA.GET_DDL(\'TABLE\',u.table_name) as ddl ' +
                'FROM USER_TABLES u ' +
                `WHERE u.table_name in ('table1','table2')` +
                'union all ' +
                'SELECT 2 as "priority", u.table_name, DBMS_METADATA.GET_DDL(\'INDEX\',u.index_name) as ddl ' +
                'FROM USER_INDEXES u ' +
                `WHERE u.table_name in ('table1','table2')`  +
                'ORDER BY table_name, "priority"';

            expect(query).to.equal(expectedQuery);
        });
    });
});
