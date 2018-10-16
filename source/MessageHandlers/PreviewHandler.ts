import IMessageHandler from "../IMessageHandler";
import TYPES from "../../ioc.types";

import { Logger } from "winston";
import { injectable, inject } from "inversify";
import "reflect-metadata";

import PreviewMessage from "../Messages/PreviewMessage";
import IDataReader from "../DataAccess/IDataReader";

/**
 * Handles messages received to instruct the agent to preview queries used by the agent
 *
 * @export
 * @class PreviewHandler
 * @implements {IMessageHandler}
 */
@injectable()
export default class PreviewHandler implements IMessageHandler {

    constructor(
        @inject(TYPES.DataReader) reader: IDataReader,
        @inject(TYPES.Logger) logger: Logger) {

        this._logger = logger;
        this._reader = reader;
    }

    private _logger: Logger;
    private _reader: IDataReader;
    
    public async handle(message: PreviewMessage) {
        this._logger.log("info", `Handling message: ${message.receiptHandle}`);
        this._reader.logQueries();
    }
}