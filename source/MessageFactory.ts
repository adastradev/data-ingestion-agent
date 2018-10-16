import TYPES from '../ioc.types';
import { Container, injectable, inject, tagged } from 'inversify';
import "reflect-metadata";
import * as Winston from 'winston';

import IMessage from './IMessage';

/**
 * Given a raw JSON string, create a properly typed message instance.
 *
 * @export
 * @class MessageFactory
 */
@injectable()
export default class MessageFactory {

    private _container: Container;
    private _logger: Winston.Logger;

    /**
     * Creates specifically typed messages given a json string
     * @param {Container} container The IOC container used to resolve other dependencies
     * @memberof MessageHandlerFactory
     */
    constructor(@inject(TYPES.Container) container: Container, @inject(TYPES.Logger) logger: Winston.Logger) {
        this._container = container;
        this._logger = logger;0
    }

    createFromJson(messageBody: string, identifier?: string): IMessage {
        var message = <IMessage>JSON.parse(messageBody);

        if (identifier) {
            message.receiptHandle = identifier;
        }

        var targetMessage: IMessage;
        
        try {
            this._logger.log("info", `Handling message type: ${message.type}`);
            targetMessage = this._container.get<IMessage>(TYPES[`${message.type}Message`]);
        }
        catch (error) {
            var msg = `Unknown message type: ${message.type} - (inner) ${error}`;
            throw Error(msg);
        }

        Object.assign(targetMessage, message);

        return targetMessage;
    }
}

