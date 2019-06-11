// tslint:disable:no-string-literal

import TYPES from '../ioc.types';
import { inject, injectable, named } from 'inversify';
import 'reflect-metadata';
import { IIntegrationConfig, IntegrationSystemType, IntegrationType, IQueryDefinition  } from './IIntegrationConfig';
import { DiscoverySdk } from '@adastradev/serverless-discovery-sdk';
import { QueryService } from './queryServiceAPI';

/**
 * Given an integration type, return a set of integration queries to run
 *
 * @export
 * @class IntegrationConfigFactory
 */
@injectable()
export default class IntegrationConfigFactory {
    /**
     * Creates specifically typed messages given a json string
     * @param {Container} container The IOC container used to resolve other dependencies
     * @memberof MessageHandlerFactory
     */
    private discovery: DiscoverySdk;
    constructor() {
        this.discovery = new DiscoverySdk(
            process.env.DISCOVERY_SERVICE,
            process.env.AWS_REGION,
            undefined,
            undefined,
            new Map(Object.entries(require('../package.json')['cloudDependencies'])));
    }

    public async create(integrationType: IntegrationType): Promise<IIntegrationConfig> {

        let queries: IIntegrationConfig;

        try {
            const queryServiceURI = (await this.discovery.lookupService('platform-service-elt-queries'))[0];
            // const queryServiceURI = 'https://4utk1njkqe.execute-api.us-east-1.amazonaws.com/0-1-0-feat7326';
            const queryServiceAPI = new QueryService(queryServiceURI, process.env.AWS_REGION);

            // Fetch template queries from service
            const response = await queryServiceAPI.getTemplateQueries(integrationType, 'Ingestion', 'false');
            queries = response.data;
        } catch (err) {
            throw new Error(`Something went wrong fetching queries for integration type ${integrationType}`);
        }

        return queries;
    }
}
