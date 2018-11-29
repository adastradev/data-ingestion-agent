
import 'reflect-metadata';
import * as chai from 'chai';

import OracleDDLHelper from '../../source/DataAccess/Oracle/OracleDDLHelper';

const expect = chai.expect;

describe('OracleDDLHelper', () => {

    describe('getDDLQuery', () => {

        it('should return a properly formatted query for all specified tables', async () => {
            const helper = new OracleDDLHelper();
            const query = helper.getDDLQuery(['table1']);

            const expectedQuery =
                `SELECT 1 as "priority", TABLE_NAME, DBMS_METADATA.GET_DDL('TABLE', TABLE_NAME, OWNER) as ddl FROM ALL_TABLES where TABLE_NAME = 'table1' `;

            expect(query).to.equal(expectedQuery);
        });
    });
});
