import { Readable } from "stream";

export default interface IDataAccessor {
    queryStream: QueryStreamFunction,
    logQueries: LogQueriesFunction
}

export interface QueryStreamFunction {
    (): Promise<Readable>
}

export interface LogQueriesFunction {
    (): void
}