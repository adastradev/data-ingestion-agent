import 'reflect-metadata';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);

import IntegrationConfigFactory from '../../source/IntegrationConfigFactory';
import { IIntegrationConfig, IntegrationType } from '../../source/IIntegrationConfig';
import { Logger } from 'winston';
import TYPES from '../../ioc.types';
import startup from '../../inversify.config';
import { Container } from 'inversify';

const expect = chai.expect;

describe('IntegrationConfigFactory', () => {
    let queryService;
    let container: Container;

    before(async() => {
        container = await startup();
        queryService = container.get(TYPES.QueryService);
    });

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
