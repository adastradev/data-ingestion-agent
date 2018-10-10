import * as handlers from './MessageHandlers';
import IMessage from './IMessage';
import IMessageHandler from './IMessageHandler'

export default class MessageHandlerFactory {

    /**
     * Provides abstract access to handlers coded to work with specific message types.
     * @memberof MessageHandlerFactory
     */
    constructor() {
        
    }

    getHandler(message: IMessage, ...args: any[]): IMessageHandler {
        var instance = Object.create(handlers[`${message.type}Handler`].prototype); // would a decorator search on own props be more flexible here?
        instance.constructor.apply(instance, args);
        return <IMessageHandler> instance;
    }
}

