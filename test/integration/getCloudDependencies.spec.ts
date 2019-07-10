
import 'reflect-metadata';
import * as chai from 'chai';
import getCloudDependencies from '../../source/Util/getCloudDependencies';

const expect = chai.expect;

describe('getCloudDependencies', () => {
    it('should return cloud dependencies', async () => {
        const deps = getCloudDependencies();
        expect(deps.size).to.be.greaterThan(0);
    });
});
