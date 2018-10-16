const TYPES = {
    AuthManager: Symbol('AuthService'),
    Bucket: Symbol('Bucket'),
    Container: Symbol('Container'),
    DummyHandler: Symbol('DummyHandler'),
    DummyMessage: Symbol('DummyMessage'),
    INGEST: Symbol('Ingest'),
    IngestionReader: Symbol('IngestionReader'),
    IngestionWriter: Symbol('IngestionWriter'),
    Logger: Symbol('Logger'),
    MessageFactory: Symbol('MessageFactory'),
    MessageHandlerFactory: Symbol('MessageHandlerFactory'),
    PREVIEW: Symbol('Preview'),
    PreviewHandler: Symbol('PreviewHandler'),
    PreviewMessage: Symbol('PreviewMessage'),
    QueueUrl: Symbol('QueueUrl'),
    S3Config: Symbol('S3Config'),
    SQSConfig: Symbol('SQSConfig'),
    SendDataHandler: Symbol('SendDataHandler'),
    SendDataMessage: Symbol('SendDataMessage'),
    TenantId: Symbol('TenantId')
};

export default TYPES;
