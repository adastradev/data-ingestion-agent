import 'reflect-metadata';
import * as chai from 'chai';
import * as sinon from 'sinon';

import { IntegrationType } from '../../source/IIntegrationConfig';
import DataAccessDocGenerator from '../../source/DataAccess/DataAccessDocGenerator';
import * as fs from 'fs';

const expect = chai.expect;

describe('DataAccessDocGenerator', () => {
    describe('DataAccessDoc', () => {

        describe('create()', () => {

            let sandbox: sinon.SinonSandbox;
            let dad;
            let write;

            beforeEach(() => {
                dad = new DataAccessDocGenerator(IntegrationType.Demo);
                sandbox = sinon.createSandbox();
                write = sandbox.stub(fs, 'writeFile');
                sandbox.stub(dad, '_createTable');
                dad._createTable.returns([
                    'ROW 1',
                    'ROW 2'
                ]);
            });

            afterEach(() => {
                sandbox.restore();
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
                dad = new DataAccessDocGenerator(IntegrationType.Demo);
                sandbox = sinon.createSandbox();
            });

            afterEach(() => {
                sandbox.restore();
            });

            it('Should return properly formatted query info', () => {

                let queryInfo;

                dad._queries = [{ name: 'TABLE_NAME', query: 'SELECT ROWID, A.* FROM TABLE_NAME' }];
                queryInfo =  dad._getQueryInfo();
                expect(queryInfo).to.deep.equal([{ tableName: 'TABLE_NAME', fields: ['ROWID', '*'] }]);

                dad._queries = [{ name: 'TABLE_NAME_CC_DD_EE', query: 'SELECT FIELD1, field2, FiEl_D3, TEST.* FROM TABLE_NAME' }];
                queryInfo =  dad._getQueryInfo();
                expect(queryInfo).to.deep.equal([{ tableName: 'TABLE_NAME_CC_DD_EE', fields: ['FIELD1', 'FIELD2', 'FIEL_D3', '*'] }]);

            });

        });

        describe('_createTable()', () => {

            let sandbox: sinon.SinonSandbox;
            let dad;

            beforeEach(() => {
                dad = new DataAccessDocGenerator(IntegrationType.Demo);
                sandbox = sinon.createSandbox();
                sandbox.stub(dad, '_getQueryInfo' as any);
                dad._getQueryInfo.returns([{
                    tableName: 'TABLE_NAME',
                    fields: ['ROWID', '*']
                }]);
            });

            afterEach(() => {
                sandbox.restore();
            });

            it('Should return an array of strings (markdown lines)', () => {
                const table = dad._createTable();
                expect(dad._getQueryInfo.called).to.be.true;
                expect(table).to.deep.equal([
                    '| Tables | Fields |',
                    '| ------ | ------ |',
                    '| TABLE_NAME | ROWID, * |'
                ]);
            });

        });
    });
});
