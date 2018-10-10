import * as handlers from './MessageHandlers';
import IMessage from './IMessage';
import IMessageHandler from './IMessageHandler'
import TYPES from '../ioc.types';
import { Container, injectable, inject } from 'inversify';
import "reflect-metadata";

/**
 * Dynamically creates message handlers based on the message type.
 *
 * @export
 * @class MessageHandlerFactory
 */
@injectable()
export default class MessageHandlerFactory {

    private _container: Container;

    /**
     * Provides abstract access to handlers coded to work with specific message types.
     * @param {Container} container The IOC container used to resolve other dependencies
     * @memberof MessageHandlerFactory
     */
    constructor(@inject(TYPES.Container) container: Container) {
        this._container = container;
    }

    getHandler(message: IMessage, ...args: any[]): IMessageHandler {
        return this._container.get<IMessageHandler>(TYPES[`${message.type}Handler`]);
    }
}

