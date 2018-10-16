import { injectable, inject } from "inversify";
import "reflect-metadata";

import IMessageHandler from "../IMessageHandler";
import DummyMessage from "../Messages/DummyMessage";

@injectable()
export default class DummyHandler implements IMessageHandler {

    public async handle(message: DummyMessage) {
        console.log(`Handling message: ${message.receiptHandle}`);
        return Promise.resolve();
    }
}