import 'reflect-metadata';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import container from '../unit/test.inversify.config';
chai.use(chaiAsPromised);

import IntegrationConfigFactory from '../../source/IntegrationConfigFactory';
import { IIntegrationConfig, IntegrationType } from '../../source/IIntegrationConfig';
import { Logger } from 'winston';
import TYPES from '../../ioc.types';
import {AuthManager, CognitoUserPoolLocatorUserManagement} from '@adastradev/user-management-sdk';
import { BearerTokenCredentials, ApiCredentialType} from '@adastradev/serverless-discovery-sdk';
import { QueryService } from '../../source/queryServiceAPI';
import { CognitoUserSession } from 'amazon-cognito-identity-js';

const expect = chai.expect;

describe('IntegrationConfigFactory', () => {
    let queryService;
    const region = 'us-east-1';
    let credentials: ApiCredentialType;
    queryService = new QueryService('https://wq56cwh321.execute-api.us-east-1.amazonaws.com/1-0-0-feat7328', region);
    console.log('here');
    // before(async () => {
    //     const poolLocator = await new CognitoUserPoolLocatorUserManagement(region);
    //     const authManager = await new AuthManager(poolLocator, region);
    //     let cognitoSession: CognitoUserSession;
    //     cognitoSession = await authManager.signIn('lbaais@yahoo.com', 'Apple123');
    //     const credentialsBearerToken: BearerTokenCredentials = {
    //         idToken: cognitoSession.getIdToken().getJwtToken(),
    //         type: 'BearerToken'
    //     };
    //     queryService = new QueryService('someurl', 'us-east-1');
    // });

    describe('create', () => {
        const logger = container.get<Logger>(TYPES.Logger);

        it('should return queries for Banner', async () => {
            const icf = new IntegrationConfigFactory(logger, queryService);

            const cfg: IIntegrationConfig = await icf.create(IntegrationType.Banner);

            expect(cfg.queries).to.not.be.empty;
            expect(cfg.type).to.equal('BANNER');
        });

        it('should return queries for DegreeWorks', async () => {
            const icf = new IntegrationConfigFactory(logger, queryService);

            const cfg: IIntegrationConfig = await icf.create(IntegrationType.DegreeWorks);

            expect(cfg.queries).to.not.be.empty;
            expect(cfg.type).to.equal('DEGREEWORKS');
        });

        it('should return queries for PeopleSoft', async () => {
            const icf = new IntegrationConfigFactory(logger, queryService);

            const cfg: IIntegrationConfig = await icf.create(IntegrationType.PeopleSoft);

            expect(cfg.queries).to.not.be.empty;
            expect(cfg.type).to.equal('PEOPLESOFT');
        });

        it('should return queries for Demo', async () => {
            const icf = new IntegrationConfigFactory(logger, queryService);

            const cfg: IIntegrationConfig = await icf.create(IntegrationType.Demo);

            expect(cfg.queries).to.not.be.empty;
            expect(cfg.type).to.equal('DEMO');
        });

        it('should return queries for Colleague and indicate it is not fully implemented', async () => {
            const icf = new IntegrationConfigFactory(logger, queryService);

            const cfg: IIntegrationConfig = await icf.create(IntegrationType.Colleague);

            expect(cfg.queries).to.not.be.empty;
            expect(cfg.type).to.equal('COLLEAGUE');
        });

        it('should fail when an unsupported type is specified', async () => {
            const icf = new IntegrationConfigFactory(logger, queryService);
            const unsupportedType = IntegrationType.Unknown;

            expect(icf.create(unsupportedType)).to.eventually.be.rejectedWith(Error, `Something went wrong fetching queries for integration type ${unsupportedType}`);
        });
    });
});
