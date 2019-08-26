import { Container, interfaces } from 'inversify';
import TYPES from '../../ioc.types';
import { stubInterface } from 'ts-sinon';
import { CustomAuthManager } from '../../source/Auth/CustomAuthManager';

// Handlers
import IMessageHandler from '../../source/IMessageHandler';
import DummyHandler from '../../source/MessageHandlers/DummyHandler';
import DummyReader from '../../source/DataAccess/Dummy/DummyReader';

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
import IConnectionPool from '../../source/DataAccess/IConnectionPool';
import IDDLHelper from '../../source/DataAccess/IDDLHelper';
import OracleDDLHelper from '../../source/DataAccess/Oracle/OracleDDLHelper';
import { IntegrationSystemType } from '../../source/IIntegrationConfig';
import IOutputEncoder from '../../source/DataAccess/IOutputEncoder';

const container = new Container();

const logger: Winston.Logger = Winston.createLogger({
    format: Winston.format.json(),
    level: 'info',
    transports: [
        new Winston.transports.Console({ silent: true })
    ]
});

container.bind<MessageFactory>(TYPES.MessageFactory).to(MessageFactory);
container.bind<MessageHandlerFactory>(TYPES.MessageHandlerFactory).to(MessageHandlerFactory);

const mockPool = stubInterface<IConnectionPool>();
container.bind<IConnectionPool>(TYPES.ConnectionPool).toConstantValue(mockPool);

container.bind<IMessageHandler>(TYPES.DummyHandler).to(DummyHandler);
container.bind<IMessageHandler>(TYPES.SendDataHandler).to(SendDataHandler);

container.bind<IMessage>(TYPES.DummyMessage).to(DummyMessage);
container.bind<IMessage>(TYPES.SendDataMessage).to(SendDataMessage);

container.bind<IDataReader>(TYPES.DataReader).to(DummyReader);
const mockWriter = stubInterface<IDataWriter>();
container.bind<IDataWriter>(TYPES.DataWriter).toConstantValue(mockWriter);
const mockEncoder = stubInterface<IOutputEncoder>();
container.bind<IOutputEncoder>(TYPES.OutputEncoder).toConstantValue(mockEncoder);

container.bind<Winston.Logger>(TYPES.Logger).toConstantValue(logger);

container.bind<string>(TYPES.QueueUrl).toConstantValue('http://www.someurl.com');
container.bind<string>(TYPES.Bucket).toConstantValue('some-bucket/74c23bda-a496-4ccb-b08f-a9ab80e407b6');

container.bind<IDDLHelper>(TYPES.DDLHelper).to(OracleDDLHelper).whenTargetNamed(IntegrationSystemType.Oracle);

// tslint:disable-next-line:only-arrow-functions
container.bind<CustomAuthManager>(TYPES.AuthManager)
    .toDynamicValue((context: interfaces.Context) => {
        return new CustomAuthManager(null, 'us-east-1');
    });
container.bind<Container>(TYPES.Container).toConstantValue(container);

export default container;
