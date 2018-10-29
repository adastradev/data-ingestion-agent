import container from '../unit/test.inversify.config';
import OracleReader from '../../source/DataAccess/Oracle/OracleReader';
import TYPES from '../../ioc.types';
import { Logger } from 'winston';

import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import OracleConnectionPoolProxy from '../../source/DataAccess/Oracle/OracleConnectionPoolProxy';
import { IQueryResult } from '../../source/DataAccess/IDataReader';

const expect = chai.expect;
chai.use(chaiAsPromised);

describe('oracledb', () => {

    describe('When connecting to an Oracle database', () => {
        it('should return sample query results', async () => {
            const logger = container.get<Logger>(TYPES.Logger);
            const pool = new OracleConnectionPoolProxy(logger);
            const reader = new OracleReader(logger, pool);

            await pool.open();

            const queryResult: IQueryResult = await reader.read('SELECT * FROM ALL_TABLES');
            expect(queryResult.result.readable).to.be.equal(true);
            expect(queryResult.metadata.readable).to.be.equal(true);
            let chunk;
            let output = '';
            // tslint:disable-next-line:no-conditional-assignment
            while ((chunk = queryResult.result.read()) !== null) {
                output += chunk.toString();
            }

            // tslint:disable-next-line:no-conditional-assignment
            while ((chunk = queryResult.metadata.read()) !== null) {
                output += chunk.toString();
            }

            await reader.close();
            await pool.close();
        });

        it('should throw an exception when attempting to query a table that does not exist', async () => {
            const logger = container.get<Logger>(TYPES.Logger);
            const pool = new OracleConnectionPoolProxy(logger);
            const reader = new OracleReader(logger, pool);

            await pool.open();

            // TODO: simplify with .should.be.rejected
            let rejected = false;
            const readPromise = reader.read('SELECT * FROM tableDNE');
            try {
                await readPromise;
            } catch (err) {
                console.log(err);
                rejected = true;
            } finally {
                await reader.close();
                await pool.close();
                expect(rejected).to.be.true;
            }
        });
    });
});
