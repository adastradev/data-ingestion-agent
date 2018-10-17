import TYPES from '../ioc.types';
import { Container, inject, injectable } from 'inversify';
import 'reflect-metadata';

import IMessage from './IMessage';
import IMessageHandler from './IMessageHandler';

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

    public getHandler(message: IMessage, ...args: any[]): IMessageHandler {
        let handler: IMessageHandler;
        try {
            handler = this._container.get<IMessageHandler>(TYPES[`${message.type}Handler`]);
        } catch (error) {
            const msg = `Unknown message handler type: ${message.type} - (inner) ${error}`;
            throw Error(msg);
        }

        return handler;
    }
}
