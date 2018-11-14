
import 'reflect-metadata';
import * as chai from 'chai';

import OracleDDLHelper from '../../source/DataAccess/Oracle/OracleDDLHelper';
import IntegrationConfigFactory from '../../source/IntegrationConfigFactory';
import { IIntegrationConfig, IntegrationSystemType, IntegrationType, IQueryDefinition  } from '../../source/IIntegrationConfig';

const expect = chai.expect;

describe('IntegrationConfigFactory', () => {

    describe('create', () => {

        it('should return queries for Banner', async () => {
            const helper = new OracleDDLHelper();
            const icf = new IntegrationConfigFactory(helper);

            const cfg: IIntegrationConfig = icf.create(IntegrationType.Banner);

            expect(cfg.queries).to.have.length.greaterThan(0);
            expect(cfg.type).to.equal(IntegrationType.Banner);
        });

        it('should return queries for DegreeWorks', async () => {
            const helper = new OracleDDLHelper();
            const icf = new IntegrationConfigFactory(helper);

            const cfg: IIntegrationConfig = icf.create(IntegrationType.DegreeWorks);

            expect(cfg.queries).to.have.length.greaterThan(0);
            expect(cfg.type).to.equal(IntegrationType.DegreeWorks);
        });

        it('should return queries for Demo', async () => {
            const helper = new OracleDDLHelper();
            const icf = new IntegrationConfigFactory(helper);

            const cfg: IIntegrationConfig = icf.create(IntegrationType.Demo);

            expect(cfg.queries).to.have.length.greaterThan(0);
            expect(cfg.type).to.equal(IntegrationType.Demo);
        });

        it('should fail when an unsupported type is specified', async () => {
            const helper = new OracleDDLHelper();
            const icf = new IntegrationConfigFactory(helper);

            expect(icf.create.bind(IntegrationType.Unknown)).to.throw(Error, 'Unsupported integration type in IntegrationConfigFactory');
        });
    });
});
