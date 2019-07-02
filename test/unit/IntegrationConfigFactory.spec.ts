
import 'reflect-metadata';
import * as sinon from 'sinon';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
import container from './test.inversify.config';
import TYPES from '../../ioc.types';

import IntegrationConfigFactory from '../../source/IntegrationConfigFactory';
import { QueryService } from '../../source/queryServiceAPI';
import { Logger } from 'winston';
import { IntegrationType } from '../../source/IIntegrationConfig';

const expect = chai.expect;

describe('IntegrationConfigFactory', () => {
    describe('Given a request for queries', () => {
        describe('When the request is made', () => {
            let sandbox: sinon.SinonSandbox;
            let logger: Logger;

            before(() => {
                sandbox = sinon.createSandbox();
                logger = container.get<Logger>(TYPES.Logger);
            });

            afterEach(() => {
                sandbox.restore();
            });

            describe('and the request is well formed', () => {
                it('then the request should resolve with a query configuration result', async () => {
                    const getTenantQueriesStub = sandbox.stub(QueryService.prototype, 'getTenantQueries').resolves({ data: { type: 'Banner', queries: [] }});
                    const queryService = new QueryService('', 'us-east-1', { getClient: (): any => { return {
                            invokeApi: () => {
                                return Promise.resolve();
                            }
                        };
                    }});
                    const factory = new IntegrationConfigFactory(logger, queryService);

                    const queries = await factory.create(IntegrationType.Banner);

                    expect(getTenantQueriesStub.calledOnce).to.be.true;
                    expect(queries).to.exist;
                });
            });

            describe('and the request is malformed', () => {
                it('then the request should be rejected when a failure is encountered', async () => {
                    sandbox.stub(QueryService.prototype, 'getTenantQueries').rejects(Error);
                    const queryService = new QueryService('', 'us-east-1', { getClient: (): any => { return {
                            invokeApi: () => {
                                return Promise.resolve();
                            }
                        };
                    }});
                    const factory = new IntegrationConfigFactory(logger, queryService);

                    expect(factory.create(IntegrationType.Banner)).to.be.eventually.rejectedWith(Error, 'Something went wrong fetching queries for integration type Banner');
                });
            });
        });
    });
});
