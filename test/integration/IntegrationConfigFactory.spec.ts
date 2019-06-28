import 'reflect-metadata';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import container from '../unit/test.inversify.config';
chai.use(chaiAsPromised);

import IntegrationConfigFactory from '../../source/IntegrationConfigFactory';
import { IIntegrationConfig, IntegrationType } from '../../source/IIntegrationConfig';
import { Logger } from 'winston';
import TYPES from '../../ioc.types';
import {AuthManager, CognitoUserPoolLocatorUserManagement,} from '@adastradev/user-management-sdk';
import { BearerTokenCredentials} from '@adastradev/serverless-discovery-sdk';
import { QueryService } from '../../source/queryServiceAPI';

const expect = chai.expect;

describe('IntegrationConfigFactory', () => {
    let queryService;
    const region = 'us-east-1';

    before(async () => {
        const poolLocator = new CognitoUserPoolLocatorUserManagement(region);
        const authManager = new AuthManager(poolLocator, region);
        let cognitoSession;
        cognitoSession = await authManager.signIn('kennesaw@aais.com', 'testKennesaw1');
        const credentialsBearerToken: BearerTokenCredentials = {
            idToken: cognitoSession.getIdToken().getJwtToken(),
            type: 'BearerToken'
        };
        queryService = new QueryService('someurl', 'us-east-1', credentialsBearerToken);
    });

    describe('create', () => {
        const logger = container.get<Logger>(TYPES.Logger);

        it('should return queries for Banner', async () => {
            const icf = new IntegrationConfigFactory(logger, queryService);

            const cfg: IIntegrationConfig = await icf.create(IntegrationType.Banner);

            expect(cfg.queries).to.not.be.empty;
            expect(cfg.type).to.equal(IntegrationType.Banner);
        });

        it('should return queries for DegreeWorks', async () => {
            const icf = new IntegrationConfigFactory(logger, queryService);

            const cfg: IIntegrationConfig = await icf.create(IntegrationType.DegreeWorks);

            expect(cfg.queries).to.not.be.empty;
            expect(cfg.type).to.equal(IntegrationType.DegreeWorks);
        });

        it('should return queries for PeopleSoft', async () => {
            const icf = new IntegrationConfigFactory(logger, queryService);

            const cfg: IIntegrationConfig = await icf.create(IntegrationType.PeopleSoft);

            expect(cfg.queries).to.not.be.empty;
            expect(cfg.type).to.equal(IntegrationType.PeopleSoft);
        });

        it('should return queries for Demo', async () => {
            const icf = new IntegrationConfigFactory(logger, queryService);

            const cfg: IIntegrationConfig = await icf.create(IntegrationType.Demo);

            expect(cfg.queries).to.not.be.empty;
            expect(cfg.type).to.equal(IntegrationType.Demo);
        });

        it('should return queries for Colleague and indicate it is not fully implemented', async () => {
            const icf = new IntegrationConfigFactory(logger, queryService);

            const cfg: IIntegrationConfig = await icf.create(IntegrationType.Colleague);

            expect(cfg.queries).to.not.be.empty;
            expect(cfg.type).to.equal(IntegrationType.Colleague);
        });

        it('should fail when an unsupported type is specified', async () => {
            const icf = new IntegrationConfigFactory(logger, queryService);
            const unsupportedType = IntegrationType.Unknown;

            expect(icf.create(unsupportedType)).to.eventually.be.rejectedWith(Error, `Something went wrong fetching queries for integration type ${unsupportedType}`);
        });
    });
});
