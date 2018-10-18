import { Container } from 'inversify';
import TYPES from '../../ioc.types';

// Handlers
import IMessageHandler from '../../source/IMessageHandler';
import DummyHandler from '../../source/MessageHandlers/DummyHandler';
import DummyReader from '../../source/DataAccess/Dummy/DummyReader';
import DummyWriter from '../../source/DataAccess/Dummy/DummyWriter';

// Services/cross-cutting concerns
import * as Winston from 'winston';

// Factories
import MessageHandlerFactory from '../../source/MessageHandlerFactory';
import MessageFactory from '../../source/MessageFactory';

// Messages
import IMessage from '../../source/IMessage';
import SendDataMessage from '../../source/Messages/SendDataMessage';
import DummyMessage from '../../source/Messages/DummyMessage';
import IDataReader from '../../source/DataAccess/IDataReader';
import IDataWriter from '../../source/DataAccess/IDataWriter';
import SendDataHandler from '../../source/MessageHandlers/SendDataHandler';

const container = new Container();

const logger: Winston.Logger = Winston.createLogger({
    format: Winston.format.json(),
    level: 'info',
    transports: [
        new Winston.transports.Console({ silent: true })
    ]
});

container.bind<MessageFactory>(TYPES.MessageFactory).to(MessageFactory).inSingletonScope();
container.bind<MessageHandlerFactory>(TYPES.MessageHandlerFactory).to(MessageHandlerFactory).inSingletonScope();

container.bind<IMessageHandler>(TYPES.DummyHandler).to(DummyHandler);
container.bind<IMessageHandler>(TYPES.SendDataHandler).to(SendDataHandler);

container.bind<IMessage>(TYPES.DummyMessage).to(DummyMessage);
container.bind<IMessage>(TYPES.SendDataMessage).to(SendDataMessage);

container.bind<IDataReader>(TYPES.DataReader).to(DummyReader);
container.bind<IDataWriter>(TYPES.DataWriter).to(DummyWriter);

container.bind<Winston.Logger>(TYPES.Logger).toConstantValue(logger);

container.bind<string>(TYPES.QueueUrl).toConstantValue('http://www.someurl.com');
container.bind<string>(TYPES.TenantId).toConstantValue('74c23bda-a496-4ccb-b08f-a9ab80e407b6');
container.bind<string>(TYPES.Bucket).toConstantValue('some-bucket');

container.bind<Container>(TYPES.Container).toConstantValue(container);

export default container;
