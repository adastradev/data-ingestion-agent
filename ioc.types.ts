const TYPES = {
    AuthManager: Symbol('AuthService'),
    Bucket: Symbol('Bucket'),
    Container: Symbol('Container'),
    DataReader: Symbol('IngestionReader'),
    DataWriter: Symbol('IngestionWriter'),
    DummyHandler: Symbol('DummyHandler'),
    DummyMessage: Symbol('DummyMessage'),
    INGEST: Symbol('Ingest'),
    Logger: Symbol('Logger'),
    MessageFactory: Symbol('MessageFactory'),
    MessageHandlerFactory: Symbol('MessageHandlerFactory'),
    PREVIEW: Symbol('Preview'),
    PreviewHandler: Symbol('PreviewHandler'),
    PreviewMessage: Symbol('PreviewMessage'),
    QueueUrl: Symbol('QueueUrl'),
    SendDataHandler: Symbol('SendDataHandler'),
    SendDataMessage: Symbol('SendDataMessage'),
    TenantId: Symbol('TenantId')
};

export default TYPES;
