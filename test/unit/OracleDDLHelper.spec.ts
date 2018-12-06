
import 'reflect-metadata';
import * as chai from 'chai';

import container from './test.inversify.config';
import OracleDDLHelper from '../../source/DataAccess/Oracle/OracleDDLHelper';
import IConnectionPool from '../../source/DataAccess/IConnectionPool';
import TYPES from '../../ioc.types';

const expect = chai.expect;

describe('OracleDDLHelper', () => {

    describe('getDDLQuery', () => {

        it('should return a properly formatted query for all specified tables', async () => {
            const pool = container.get<IConnectionPool>(TYPES.ConnectionPool);
            const helper = new OracleDDLHelper(pool);
            const query = helper.getDDLQuery(['table1']);

            const expectedQuery =
                `SELECT 1 as "priority", TABLE_NAME, DBMS_METADATA.GET_DDL('TABLE', TABLE_NAME, OWNER) as ddl FROM ALL_TABLES where TABLE_NAME = 'table1' `;

            expect(query).to.equal(expectedQuery);
        });
    });

    describe('prioritizeObjects', () => {

        xit('should return a properly sorted list of objects to create', async () => {
            const pool = container.get<IConnectionPool>(TYPES.ConnectionPool);
            const helper = new OracleDDLHelper(pool);
            const query = helper.prioritizeObjects(['table1', 'table2', 'table3']);

            // TODO: stub new connection and return proper faux constraint info to process

            expect(1).to.equal(1);
        });
    });
});
