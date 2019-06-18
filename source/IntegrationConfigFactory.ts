// tslint:disable:no-string-literal

import TYPES from '../ioc.types';
import { inject, injectable } from 'inversify';
import 'reflect-metadata';
import { IIntegrationConfig, IntegrationType } from './IIntegrationConfig';
import { DiscoverySdk } from '@adastradev/serverless-discovery-sdk';
import { QueryService } from './queryServiceAPI';
import getCloudDependencies from './Util/getCloudDependencies';
import * as Winston from 'winston';

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
    constructor(@inject(TYPES.Logger)private logger: Winston.Logger) {
        const cloudDependenciesMap = getCloudDependencies();
        this.discovery = new DiscoverySdk(
            process.env.DISCOVERY_SERVICE,
            process.env.AWS_REGION,
            undefined,
            undefined,
            cloudDependenciesMap);
    }

    public async create(integrationType: IntegrationType): Promise<IIntegrationConfig> {

        let queries: IIntegrationConfig;

        try {
            const queryServiceURI = (await this.discovery.lookupService('elt-queries'))[0];
            this.logger.silly(`Query Service URI: ${queryServiceURI}`);
            const queryServiceAPI = new QueryService(queryServiceURI, process.env.AWS_REGION);

            // Fetch template queries from service
            this.logger.silly(`Fetching ingestion queries for '${integrationType}`);
            const response = await queryServiceAPI.getTemplateQueries(integrationType, 'Ingestion', 'false');
            queries = response.data;
        } catch (err) {
            this.logger.error(JSON.stringify(err));
            throw new Error(`Something went wrong fetching queries for integration type ${integrationType}`);
        }

        return queries;
    }
}
