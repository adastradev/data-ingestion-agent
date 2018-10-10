
import * as chai from 'chai';
import { Example } from '../../source/Example';

const expect = chai.expect;

describe('Example', () => {

    describe('When asking for a greeting', () => {
        const greeter = new Example();

        it('should return hello world', () => {
            expect(greeter.getGreeting()).to.be.equal('Hello world');
        });
    });
});
