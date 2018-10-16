
import * as chai from 'chai';
import * as oracledb from 'oracledb';

const expect = chai.expect;
const should = chai.should();

describe('oracledb', () => {

    describe('When connecting to an Oracle database', () => {
        it('should return sample query results', async () => {
            let connection;
            try {
                let sql;
                let binds;
                let options;
                let result;

                console.log('oracledb.getConnection');
                connection = await oracledb.getConnection({
                    connectString : process.env.ORACLE_ENDPOINT,
                    password      : process.env.ORACLE_PASSWORD,
                    user          : process.env.ORACLE_USER
                });

                // tslint:disable-next-line:no-unused-expression
                expect(connection).to.be.not.undefined;

                // Query the data
                sql = `SELECT * FROM ALL_TABLES`;
                binds = {};

                // For a complete list of options see the documentation.
                options = {
                  outFormat: oracledb.OBJECT   // query result format
                  // extendedMetaData: true,   // get extra metadata
                  // fetchArraySize: 100       // internal buffer allocation size for tuning
                };

                console.log('Test connection.execute');
                result = await connection.execute(sql, binds, options);
                console.log('Test returned ' + result.rows.length + ' rows');

                // console.log("Column metadata: ", result.metaData);
                // console.log("Query results: ");
                // console.log(result.rows);
            } catch (err) {
                console.error(err);
                throw err;
            } finally {
                if (connection) {
                    try {
                        await connection.close();
                    } catch (err) {
                        console.error(err);
                    }
                }
            }
        });
    });
});
