import IMessage from "./IMessage";

export default interface IMessageHandler {
    handle: HandleFunc
}

interface HandleFunc {
    (message: IMessage): void
}