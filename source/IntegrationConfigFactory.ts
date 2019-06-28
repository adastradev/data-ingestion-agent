// tslint:disable:no-string-literal

import TYPES from '../ioc.types';
import { inject, injectable } from 'inversify';
import 'reflect-metadata';
import { IIntegrationConfig, IntegrationType } from './IIntegrationConfig';
import { BearerTokenCredentials, DiscoverySdk } from '@adastradev/serverless-discovery-sdk';
import { QueryService } from './queryServiceAPI';
import getCloudDependencies from './Util/getCloudDependencies';
import * as Winston from 'winston';
// import { Credentials } from 'aws-sdk';

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

    constructor(@inject(TYPES.Logger)private logger: Winston.Logger, @inject(TYPES.QueryService)private queryService: QueryService) {
    }

    public async create(integrationType: IntegrationType): Promise<IIntegrationConfig> {

        let queries: IIntegrationConfig;

        try {
            // Fetch template queries from service
            this.logger.silly(`Fetching ingestion queries for '${integrationType}`);
            const response = await this.queryService.getTenantQueries(integrationType, 'Ingestion', 'false');
            queries = response.data;
        } catch (err) {
            this.logger.error(JSON.stringify(err));
            throw new Error(`Something went wrong fetching queries for integration type ${integrationType}`);
        }

        return queries;
    }
}
