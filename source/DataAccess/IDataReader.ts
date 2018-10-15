import { Readable } from "stream";

export default interface IDataReader {
    read: QueryStreamFunction,
    logQueries: LogQueriesFunction
}

export interface QueryStreamFunction {
    (): Promise<Readable>
}

export interface LogQueriesFunction {
    (): void
}