import 'reflect-metadata';
import * as chai from 'chai';
import * as sinon from 'sinon';

import { IntegrationType } from '../../source/IIntegrationConfig';
import DataAccessDoc from '../../source/DataAccess/DADGenerator';
import * as fs from 'fs';

const expect = chai.expect;

describe('DADGenerator', () => {
    describe('DataAccessDoc', () => {

        describe('create()', () => {

            let sandbox: sinon.SinonSandbox;
            let dad;
            let write;

            beforeEach(() => {
                dad = new DataAccessDoc(IntegrationType.Demo);
                sandbox = sinon.createSandbox();
                write = sandbox.stub(fs, 'writeFile');
                write.returns(undefined);
                sandbox.stub(dad, '_createTable');
                dad._createTable.returns([
                    'ROW 1',
                    'ROW 2'
                ]);
            });

            afterEach(() => {
                sandbox.restore();
            });

            it('Should not return anything', () => {
                expect(dad.create()).to.be.equal(undefined);
            });

            it('Should call createTable()', () => {
                dad.create();
                expect(dad._createTable.called).to.be.true;
            });

            it('Should call writeFile()', () => {
                dad.create();
                expect(write.called).to.be.true;
            });

        });

        describe('_getQueryInfo()', () => {

            let sandbox: sinon.SinonSandbox;
            let dad;

            beforeEach(() => {
                dad = new DataAccessDoc(IntegrationType.Demo);
                sandbox = sinon.createSandbox();
                dad._queries = [{
                    name: 'TABLE_NAME',
                    query: 'SELECT * FROM TABLE_NAME'
                }];
            });

            afterEach(() => {
                sandbox.restore();
            });

            it('Should return an array of query objects: { tableName: string, fields: string[] }', () => {
                const queryInfo = dad._getQueryInfo();
                expect(queryInfo).to.be.an('array');
                expect(queryInfo[0]).to.not.be.empty;
                expect(queryInfo[0]).to.be.an('object');
                expect(queryInfo[0].tableName).to.be.a('string');
                expect(queryInfo[0].fields).to.be.an('array');
            });

        });

        describe('_createTable()', () => {

            let sandbox: sinon.SinonSandbox;
            let dad;

            beforeEach(() => {
                dad = new DataAccessDoc(IntegrationType.Demo);
                sandbox = sinon.createSandbox();
                sandbox.stub(dad, '_getQueryInfo' as any);
                dad._getQueryInfo.returns([{
                    tableName: 'TABLE_NAME',
                    fields: ['FIELD1', 'FIELD2']
                }]);
            });

            afterEach(() => {
                sandbox.restore();
            });

            it('Should return an array of strings (markdown lines)', () => {
                const table = dad._createTable();
                expect(dad._getQueryInfo.called).to.be.true;
                expect(table).to.be.an('array');
                expect(table).to.not.be.empty;
                expect(table[0]).to.be.a('string');
            });

        });
    });
});
