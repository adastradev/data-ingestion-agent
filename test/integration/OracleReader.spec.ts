import container from '../unit/test.inversify.config';
import OracleReader from '../../source/DataAccess/Oracle/OracleReader';
import TYPES from '../../ioc.types';
import { Logger } from 'winston';

import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { Readable } from 'stream';
import OracleConnectionPoolProxy from '../../source/DataAccess/Oracle/OracleConnectionPoolProxy';
import sleep from '../../source/Util/sleep';
import { IQueryResult } from '../../source/DataAccess/IDataReader';

const expect = chai.expect;
const should = chai.should();
chai.use(chaiAsPromised);

describe('oracledb', () => {

    describe('When connecting to an Oracle database', () => {
        xit('should return sample query results', async () => {
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
            // avoid invalid resultset error from closing the connection before consumption of the resultset
            await sleep(1000);

            await reader.close();
            await pool.close();
        });

        // tslint:disable-next-line:max-line-length
        it('should return empty streams without crashing when attempting to pull records from a table that does not exist', async () => {
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
