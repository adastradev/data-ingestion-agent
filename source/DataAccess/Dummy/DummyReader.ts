import IIngestionReader from "../IIngestionReader";
import { Readable } from "stream";

import { injectable, inject } from "inversify";
import TYPES from "../../../ioc.types";
import { Logger } from "winston";

@injectable()
export default class DummyReader implements IIngestionReader {
    private _logger: Logger;

    constructor(@inject(TYPES.Logger) logger: Logger) {
        this._logger = logger;
    }

    public async read(): Promise<Readable> {
        var Readable = require('stream').Readable
        var s = new Readable;
            s.push("dummy data");
            s.push('\n');
        s.push(null);
        return s;
    }

    public logQueries(): void {
        this._logger.log("info", "dummy query");
    }
}