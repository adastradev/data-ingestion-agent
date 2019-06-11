
import 'reflect-metadata';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);

import IntegrationConfigFactory from '../../source/IntegrationConfigFactory';
import { IIntegrationConfig, IntegrationType } from '../../source/IIntegrationConfig';

const expect = chai.expect;

describe('IntegrationConfigFactory', () => {

    describe('create', () => {

        it('should return queries for Banner', async () => {
            const icf = new IntegrationConfigFactory();

            const cfg: IIntegrationConfig = await icf.create(IntegrationType.Banner);

            expect(cfg.queries).to.not.be.empty;
            expect(cfg.type).to.equal(IntegrationType.Banner);
        });

        it('should return queries for DegreeWorks', async () => {
            const icf = new IntegrationConfigFactory();

            const cfg: IIntegrationConfig = await icf.create(IntegrationType.DegreeWorks);

            expect(cfg.queries).to.not.be.empty;
            expect(cfg.type).to.equal(IntegrationType.DegreeWorks);
        });

        it('should return queries for PeopleSoft', async () => {
            const icf = new IntegrationConfigFactory();

            const cfg: IIntegrationConfig = await icf.create(IntegrationType.PeopleSoft);

            expect(cfg.queries).to.not.be.empty;
            expect(cfg.type).to.equal(IntegrationType.PeopleSoft);
        });

        it('should return queries for Demo', async () => {
            const icf = new IntegrationConfigFactory();

            const cfg: IIntegrationConfig = await icf.create(IntegrationType.Demo);

            expect(cfg.queries).to.not.be.empty;
            expect(cfg.type).to.equal(IntegrationType.Demo);
        });

        it('should return queries for Colleague and indicate it is not fully implemented', async () => {
            const icf = new IntegrationConfigFactory();

            const cfg: IIntegrationConfig = await icf.create(IntegrationType.Colleague);

            expect(cfg.queries).to.not.be.empty;
            expect(cfg.type).to.equal(IntegrationType.Colleague);
        });

        it('should fail when an unsupported type is specified', async () => {
            const icf = new IntegrationConfigFactory();
            const unsupportedType = IntegrationType.Unknown;

            expect(icf.create(unsupportedType)).to.eventually.be.rejectedWith(Error, `Something went wrong fetching queries for integration type ${unsupportedType}`);
        });
    });
});
