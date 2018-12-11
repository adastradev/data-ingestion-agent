import 'reflect-metadata';
import * as chai from 'chai';
import * as sinon from 'sinon';
import * as fs from 'fs';

import { IntegrationType } from '../../source/IIntegrationConfig';
import DataAccessDoc from '../../source/DataAccess/DADGenerator';

const expect = chai.expect;

const integrationTypeKeys = Object.keys(IntegrationType).slice(0, -2);

describe('DADGenerator', () => {

    describe('DataAccessDoc', () => {

        let sandbox: sinon.SinonSandbox;
        let dad;

        beforeEach(() => {
            sandbox = sinon.createSandbox();
        });

        afterEach(() => {
            sandbox.restore();
        });

        it('Should successfully write file for each integration type', () => {
            integrationTypeKeys.forEach(async (key) => {
                if (fs.existsSync(`./docs/DataAccess/${IntegrationType[key]}.md`)) {
                    fs.unlinkSync(`./docs/DataAccess/${IntegrationType[key]}.md`);
                }
                expect(fs.existsSync(`./docs/DataAccess/${IntegrationType[key]}.md`)).to.be.false;
                dad = new DataAccessDoc(IntegrationType[key]);
                await dad.create();
                expect(fs.existsSync(`./docs/DataAccess/${IntegrationType[key]}.md`)).to.be.true;
            });
        });

        it('Should should throw an error for unknown integration types', () => {
            expect(() => { new DataAccessDoc(IntegrationType.Unknown); }).to.throw;
        });

    });

});
