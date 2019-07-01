
import 'reflect-metadata';
import * as sinon from 'sinon';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);

import { QueryService } from '../../source/queryServiceAPI';

const expect = chai.expect;

const createQueryService = (sandbox: sinon.SinonSandbox) => {
    const invokeSpy = sandbox.stub().resolves({ type: 'Banner', queries: [] });
    const clientStub = {
        invokeApi: invokeSpy
    };

    const queryService = new QueryService('http://something.com', 'us-east-1', {
        getClient: (): any => clientStub
    });

    return { invokeSpy, queryService };
};

describe('queryServiceApi', () => {
    describe('Given a request for tenant queries', () => {
        describe('When the request is made', () => {
            let sandbox: sinon.SinonSandbox;

            before(() => {
                sandbox = sinon.createSandbox();
            });

            afterEach(() => {
                sandbox.restore();
            });

            describe('and the request provides all query parameters', () => {
                it('then the provider should return a properly configured client', async () => {
                    const testCfg = createQueryService(sandbox);

                    const queryService = testCfg.queryService;
                    const invokeSpy = testCfg.invokeSpy;
                    const result = await queryService.getTenantQueries('Banner', 'Ingestion', 'true');

                    expect(result).to.exist;
                    expect(invokeSpy.calledOnce).to.be.true;
                    expect(invokeSpy.getCall(0).args[0]).to.be.empty;
                    expect(invokeSpy.getCall(0).args[1]).to.eq('/admin/queries');
                    expect(invokeSpy.getCall(0).args[2]).to.eq('GET');
                    expect(invokeSpy.getCall(0).args[3]).to.deep.eq({
                        queryParams: {
                            integrationstage: 'Ingestion',
                            integrationtype: 'Banner',
                            formatted: 'true'
                        }
                    });
                    expect(invokeSpy.getCall(0).args[4]).to.be.empty;
                });
            });
            describe('and the request does not provide a formatted filter', () => {
                it('then the provider should return a properly configured client without specifying formatted or not', async () => {
                    const testCfg = createQueryService(sandbox);

                    const queryService = testCfg.queryService;
                    const invokeSpy = testCfg.invokeSpy;
                    const result = await queryService.getTenantQueries('Banner', 'Ingestion', undefined);

                    expect(result).to.exist;
                    expect(invokeSpy.calledOnce).to.be.true;
                    expect(invokeSpy.getCall(0).args[0]).to.be.empty;
                    expect(invokeSpy.getCall(0).args[1]).to.eq('/admin/queries');
                    expect(invokeSpy.getCall(0).args[2]).to.eq('GET');
                    expect(invokeSpy.getCall(0).args[3]).to.deep.eq({
                        queryParams: {
                            integrationstage: 'Ingestion',
                            integrationtype: 'Banner'
                        }
                    });
                    expect(invokeSpy.getCall(0).args[4]).to.be.empty;
                });
            });
        });
    });
});
