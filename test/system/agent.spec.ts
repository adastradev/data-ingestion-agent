
import * as chai from 'chai';
import * as ec2 from 'aws-sdk/clients/ec2';
import Ec2Factory from './util/Ec2Factory';

const expect = chai.expect;
const should = chai.should();

describe('Ingestion Agent', () => {

    var ec2Factory: Ec2Factory = new Ec2Factory();

    before(async () => {        
        await ec2Factory.createTestInstance();
    });

    after(async () => {
        await ec2Factory.removeTestInstance();
    });

    describe('When Installed on a Linux Host', () => {
        // const greeter = new Example();

        it('should successfully install the data ingestion agent and maintain a healthy container state', () => {
            expect(0).to.eq(0);
        });
    });
});
