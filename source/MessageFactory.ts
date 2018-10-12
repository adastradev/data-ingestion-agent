import IMessage from './IMessage';
import TYPES from '../ioc.types';
import { Container, injectable, inject, tagged } from 'inversify';
import "reflect-metadata";

/**
 * Given a raw JSON string, create a properly typed message instance.
 *
 * @export
 * @class MessageFactory
 */
@injectable()
export default class MessageFactory {

    private _container: Container;

    /**
     * Creates specifically typed messages given a json string
     * @param {Container} container The IOC container used to resolve other dependencies
     * @memberof MessageHandlerFactory
     */
    constructor(@inject(TYPES.Container) container: Container) {
        this._container = container;
    }

    createFromJson(messageBody: string, identifier?: string): IMessage {
        var message = <IMessage>JSON.parse(messageBody);

        if (identifier) {
            message.receiptHandle = identifier;
        }
        
        var targetMessage = this._container.get<IMessage>(TYPES[`${message.type}Message`]);

        Object.assign(targetMessage, message);

        return targetMessage;
    }
}

