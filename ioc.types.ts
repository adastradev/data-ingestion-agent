import MessageHandlerFactory from "./source/MessageHandlerFactory";

let TYPES = {
    SendDataHandler: Symbol("SendDataHandler"),
    S3Config: Symbol("S3Config"),
    SQSConfig: Symbol("SQSConfig"),
    Logger: Symbol("Logger"),
    TenantId: Symbol("TenantId"),
    QueueUrl: Symbol("QueueUrl"),
    AuthManager: Symbol("AuthService"),
    Container: Symbol("Container"),
    MessageHandlerFactory: Symbol("MessageHandlerFactory"),
    Bucket: Symbol("Bucket"),
    MessageFactory: Symbol("MessageFactory"),
    SendDataMessage: Symbol("SendDataMessage")
};

export default TYPES;