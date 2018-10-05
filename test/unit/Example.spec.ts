
import * as chai from 'chai';
import { Example } from '../../source/Example';

const expect = chai.expect;
const should = chai.should();

describe('DiscoverySdk', () => {

    describe('When asking for a greeting', () => {
        const greeter = new Example();

        it('should return hello world', () => {
            expect(greeter.getGreeting()).to.be.equal('Hello world');
        });
    });
});
