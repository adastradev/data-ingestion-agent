import { Readable } from 'stream';

/**
 * Represents a mechanism intended to read data from some datasource and output that data as a stream
 *
 * @export
 * @interface IDataReader
 */
export default interface IDataReader {
    read: QueryStreamFunction;
    logQueries: LogQueriesFunction;
    close: CloseFunction;
}

export type QueryStreamFunction = () => Promise<Readable>;
export type LogQueriesFunction = () => void;
export type CloseFunction = () => Promise<void>;
