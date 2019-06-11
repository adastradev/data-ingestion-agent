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

        let responseBody: IIntegrationConfig;

        try {
            // const queryServiceURI = (await this.discovery.lookupService('elt-queries'))[0];
            // Change this when service is registered
            const queryServiceURI = 'https://n5obyc9vwa.execute-api.us-east-1.amazonaws.com/clrdev';
            const queryServiceAPI = new QueryService(queryServiceURI, process.env.AWS_REGION);
            const response = await queryServiceAPI.getTemplateQueries(integrationType, 'Ingestion', 'false');
            responseBody = response.data;
            console.log(responseBody);
        } catch (err) {
            throw new Error(`Something went wrong fetching queries for integration type ${integrationType}`);
        }

        return responseBody;
    }
}
