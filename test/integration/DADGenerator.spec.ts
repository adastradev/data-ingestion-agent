import 'reflect-metadata';
import * as chai from 'chai';
import * as sinon from 'sinon';
import * as fs from 'fs';

import { IntegrationType } from '../../source/IIntegrationConfig';
import DataAccessDoc from '../../source/DataAccess/DADGenerator';

const expect = chai.expect;

const integrationTypeKeys = Object.keys(IntegrationType).slice(0, -1);

describe('DADGenerator', () => {

    describe('DataAccessDoc', () => {

        const write = sinon.stub(fs, 'writeFile');
        write.returns(undefined);

        it('Should successfully construct for each integration type', () => {
            integrationTypeKeys.forEach((key) => {
                const dad = new DataAccessDoc(IntegrationType[key]);
                expect(dad).is.an.instanceOf(DataAccessDoc);
                const spyCreate = sinon.spy(dad, 'create');
                expect(dad.create()).is.undefined;
                expect(spyCreate.called).to.be.true;
            });
        });

        it('Should should throw an error for unknown integration types', () => {
            expect(() => { new DataAccessDoc(IntegrationType.Unknown); }).to.throw;
        });

    });

});
