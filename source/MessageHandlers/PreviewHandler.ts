import IMessageHandler from '../IMessageHandler';
import TYPES from '../../ioc.types';

import { Logger } from 'winston';
import { inject, injectable } from 'inversify';
import 'reflect-metadata';

import PreviewMessage from '../Messages/PreviewMessage';
import IDataReader from '../DataAccess/IDataReader';
import IntegrationConfigFactory from '../IntegrationConfigFactory';
import { IQueryDefinition } from '../IIntegrationConfig';

/**
 * Handles messages received to instruct the agent to preview queries used by the agent
 *
 * @export
 * @class PreviewHandler
 * @implements {IMessageHandler}
 */
@injectable()
export default class PreviewHandler implements IMessageHandler {

    private _logger: Logger;
    private _reader: IDataReader;
    private _integrationConfigFactory: IntegrationConfigFactory;

    constructor(
        @inject(TYPES.DataReader) reader: IDataReader,
        @inject(TYPES.Logger) logger: Logger,
        @inject(TYPES.IntegrationConfigFactory) integrationConfigFactory: IntegrationConfigFactory) {

        this._logger = logger;
        this._reader = reader;
        this._integrationConfigFactory = integrationConfigFactory;
    }

    public async handle(message: PreviewMessage) {
        this._logger.silly(`Handling message: ${message.receiptHandle}`);
        const integrationType = process.env.INTEGRATION_TYPE || 'Banner';
        const integrationConfig = this._integrationConfigFactory.create(integrationType);
        this.logQueries(integrationConfig.queries);
    }

    public logQueries(queryStatements: IQueryDefinition[]): void {
        this._logger.info('The following queries are configured to be run by the agent:');
        for (const query of queryStatements) {
            this._logger.info(query.query);
        }
    }
}
