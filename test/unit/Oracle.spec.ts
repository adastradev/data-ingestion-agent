
import * as chai from 'chai';
import * as oracledb from 'oracledb';

const expect = chai.expect;
const should = chai.should();

describe('oracledb', () => {

    describe('When connecting to an Oracle database', () => {
        xit('should return sample query results', async () => {
            let connection;
            try {
                let sql, binds, options, result;

                console.log('oracledb.getConnection');
                connection = await oracledb.getConnection({
                    user          : process.env.ORACLE_USER,
                    password      : process.env.ORACLE_PASSWORD,
                    connectString : process.env.ORACLE_ENDPOINT
                });
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
            
                console.log("Column metadata: ", result.metaData);
                console.log("Query results: ");
                console.log(result.rows);
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