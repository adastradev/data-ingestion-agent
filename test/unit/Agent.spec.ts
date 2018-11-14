
import 'reflect-metadata';
import * as chai from 'chai';

import container from './test.inversify.config';
import sinon = require('ts-sinon/node_modules/@types/sinon');
import Agent from '../../source/Agent';

const expect = chai.expect;

describe('Agent', () => {

    describe('handleAgentCommands', () => {
        let sandbox: sinon.SinonSandbox;

        beforeEach(() => {
            sandbox = sinon.createSandbox();
        });

        afterEach(() => {
            sandbox.reset();
        });

        it('should return a properly formatted query for all specified tables', async () => {
            const agent = new Agent(null, 'somequeueurl', null, container);

            // expect agent commands to work..
        });
    });
});
