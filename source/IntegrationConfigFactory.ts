// tslint:disable:no-string-literal

import TYPES from '../ioc.types';
import { Container, inject, injectable, tagged } from 'inversify';
import 'reflect-metadata';
import * as Winston from 'winston';
import { IIntegrationConfig, IQueryDefinition } from './IIntegrationConfig';
import { IntegrationType } from 'aws-sdk/clients/apigateway';

/**
 * Given an integration type, return a set of integration queries to run
 *
 * @export
 * @class IntegrationConfigFactory
 */
@injectable()
export default class IntegrationConfigFactory {
    private _logger: Winston.Logger;

    /**
     * Creates specifically typed messages given a json string
     * @param {Container} container The IOC container used to resolve other dependencies
     * @memberof MessageHandlerFactory
     */
    constructor(@inject(TYPES.Logger) logger: Winston.Logger) {
        this._logger = logger;
    }

    public create(integrationType: IntegrationType): IIntegrationConfig {
        switch (integrationType) {
            case 'Banner': {
                const BANNER_TEMPLATE_STATEMENTS: IQueryDefinition[] = new Array<IQueryDefinition>();

                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'dummysisdata',
                    query: 'SELECT * FROM dummysisdata where rownum < 100000'
                });

                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'all_tables',
                    query: 'SELECT * FROM ALL_TABLES'
                });

                return {
                    queries: BANNER_TEMPLATE_STATEMENTS,
                    type: 'Banner'
                };
            }
            default: {
                throw Error('Unsupported integration type in IntegrationConfigFactory');
            }
        }
    }
}
