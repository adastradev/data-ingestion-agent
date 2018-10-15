import { Readable } from "stream";

export default interface IDataAccessor {
    read: QueryStreamFunction,
    logQueries: LogQueriesFunction
}

export interface QueryStreamFunction {
    (): Promise<Readable>
}

export interface LogQueriesFunction {
    (): void
}