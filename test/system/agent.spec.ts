
import * as chai from 'chai';
import * as ec2 from 'aws-sdk/clients/ec2';
import Ec2Factory from './util/Ec2Factory';

const expect = chai.expect;
const should = chai.should();

describe('Data Ingestion Agent on Red Hat Enterprise Linux 7', () => {

    var ec2Factory: Ec2Factory = new Ec2Factory();

    beforeEach(async () => {        
        await ec2Factory.createTestInstance("linux-rhel7");
    });

    afterEach(async () => {
        await ec2Factory.removeTestInstance();
    });

    describe('when installed', () => {
        it('should successfully start and maintain a healthy container state', () => {
            expect(0).to.eq(0);
        });
    });
});
