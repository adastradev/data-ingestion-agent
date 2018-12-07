
import 'reflect-metadata';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);

import OracleDDLHelper from '../../source/DataAccess/Oracle/OracleDDLHelper';
import IConnectionPool from '../../source/DataAccess/IConnectionPool';

const expect = chai.expect;

describe('OracleDDLHelper', () => {

    const createTestContext = (tableAssociations: Array<[string, string]> = []) => {
        const stubConnection = {
            execute: async () => Promise.resolve({ rows: tableAssociations })
        };
        const pool: IConnectionPool = {
            open: async () => Promise.resolve(),
            close: async () => Promise.resolve(),
            getConnection: async () => Promise.resolve(stubConnection),
            releaseConnection: async () => Promise.resolve()
        };

        return {
            pool
        };
    };

    describe('getDDLQuery', () => {

        it('should return a properly formatted query for a single table', async () => {
            const ctx = createTestContext();
            const helper = new OracleDDLHelper(ctx.pool);
            const query = await helper.getDDLQuery(['table1']);

            expect(query).to.equal(`SELECT 0 as "priority", TABLE_NAME, DBMS_METADATA.GET_DDL('TABLE', TABLE_NAME, OWNER) as ddl FROM ALL_TABLES WHERE TABLE_NAME = 'table1' `);
        });

        it('should return a properly formatted query for multiple unrelated tables', async () => {
            const ctx = createTestContext();
            const helper = new OracleDDLHelper(ctx.pool);
            const query = await helper.getDDLQuery(['table1', 'table2', 'table3']);

            expect(query).to.contain('SELECT 0 as "priority", TABLE_NAME, DBMS_METADATA.GET_DDL(\'TABLE\', TABLE_NAME, OWNER) as ddl FROM ALL_TABLES WHERE TABLE_NAME = \'table1\'');
            expect(query).to.contain('SELECT 1 as "priority", TABLE_NAME, DBMS_METADATA.GET_DDL(\'TABLE\', TABLE_NAME, OWNER) as ddl FROM ALL_TABLES WHERE TABLE_NAME = \'table2\'');
            expect(query).to.contain('SELECT 2 as "priority", TABLE_NAME, DBMS_METADATA.GET_DDL(\'TABLE\', TABLE_NAME, OWNER) as ddl FROM ALL_TABLES WHERE TABLE_NAME = \'table3\'');
        });

        it('should return a properly formatted query for multiple related tables', async () => {
            const ctx = createTestContext([['table1', 'table2'], ['table3', 'table1']]);
            const helper = new OracleDDLHelper(ctx.pool);
            const query = await helper.getDDLQuery(['table1', 'table2', 'table3']);

            expect(query).to.contain('SELECT 0 as "priority", TABLE_NAME, DBMS_METADATA.GET_DDL(\'TABLE\', TABLE_NAME, OWNER) as ddl FROM ALL_TABLES WHERE TABLE_NAME = \'table2\'');
            expect(query).to.contain('SELECT 1 as "priority", TABLE_NAME, DBMS_METADATA.GET_DDL(\'TABLE\', TABLE_NAME, OWNER) as ddl FROM ALL_TABLES WHERE TABLE_NAME = \'table1\'');
            expect(query).to.contain('SELECT 2 as "priority", TABLE_NAME, DBMS_METADATA.GET_DDL(\'TABLE\', TABLE_NAME, OWNER) as ddl FROM ALL_TABLES WHERE TABLE_NAME = \'table3\'');
        });

        it('should return a properly formatted query for multiple related and unrelated tables', async () => {
            const ctx = createTestContext([['table1', 'table2']]);
            const helper = new OracleDDLHelper(ctx.pool);
            const query = await helper.getDDLQuery(['table3', 'table1', 'table2']);

            expect(query).to.contain('SELECT 0 as "priority", TABLE_NAME, DBMS_METADATA.GET_DDL(\'TABLE\', TABLE_NAME, OWNER) as ddl FROM ALL_TABLES WHERE TABLE_NAME = \'table3\'');
            expect(query).to.contain('SELECT 1 as "priority", TABLE_NAME, DBMS_METADATA.GET_DDL(\'TABLE\', TABLE_NAME, OWNER) as ddl FROM ALL_TABLES WHERE TABLE_NAME = \'table2\'');
            expect(query).to.contain('SELECT 2 as "priority", TABLE_NAME, DBMS_METADATA.GET_DDL(\'TABLE\', TABLE_NAME, OWNER) as ddl FROM ALL_TABLES WHERE TABLE_NAME = \'table1\'');
        });
    });

    describe('prioritizeObjects', () => {

        it('should return a properly sorted list of objects to create', async () => {
            const tableAssociations: Array<[string, string]> = [['a', 'b'], ['b', 'c']];
            const ctx = createTestContext(tableAssociations);

            const helper = new OracleDDLHelper(ctx.pool);
            const prioritizedObjects = await (helper as any).prioritizeObjects(['a', 'b', 'c', 'd']);

            expect(prioritizedObjects).to.have.lengthOf(4);
            expect(prioritizedObjects).to.deep.equal(['c', 'b', 'a', 'd']);
        });

        it('should return a properly sorted list of objects to create when an independent circular dependency exists', async () => {
            const tableAssociations: Array<[string, string]> = [['a', 'b'], ['b', 'c'], ['e', 'e']];
            const ctx = createTestContext(tableAssociations);

            const helper = new OracleDDLHelper(ctx.pool);
            const prioritizedObjects = await (helper as any).prioritizeObjects(['a', 'b', 'c', 'd', 'e']);

            expect(prioritizedObjects).to.have.lengthOf(5);
            expect(prioritizedObjects).to.deep.equal(['c', 'b', 'a', 'd', 'e']);
        });

        it('should fail if there are circular dependencies', async () => {
            const tableAssociations: Array<[string, string]> = [['a', 'b'], ['b', 'c'], ['c', 'a']];
            const ctx = createTestContext(tableAssociations);

            const helper = new OracleDDLHelper(ctx.pool);
            expect((helper as any).prioritizeObjects(['a', 'b', 'c', 'd']))
                .to.eventually.be
                .rejectedWith(Error, 'Dependency Cycle Found: a -> b -> c -> a');
        });
    });
});
