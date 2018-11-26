
import 'reflect-metadata';
import * as chai from 'chai';

import OracleDDLHelper from '../../source/DataAccess/Oracle/OracleDDLHelper';

const expect = chai.expect;

describe('OracleDDLHelper', () => {

    describe('getDDLQuery', () => {

        it('should return a properly formatted query for all specified tables', async () => {
            const helper = new OracleDDLHelper();
            const query = helper.getDDLQuery('table1');

            const expectedQuery =
                'SELECT 1 as "priority", \'table1\' as table_name, DBMS_METADATA.GET_DDL(\'TABLE\', \'table1\') as ddl ' +
                'FROM dual ' +
                'union all ' +
                'SELECT 2 as "priority", \'table1\' as table_name, DBMS_METADATA.GET_DDL(\'INDEX\', \'table1\') as ddl ' +
                'FROM dual ';

            expect(query).to.equal(expectedQuery);
        });
    });
});
