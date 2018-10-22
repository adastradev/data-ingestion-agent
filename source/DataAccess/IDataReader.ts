import { Readable, Stream } from 'stream';

/**
 * Represents a mechanism intended to read data from some datasource and output that data as a stream
 *
 * @export
 * @interface IDataReader
 */
export default interface IDataReader {
    close: CloseFunction;
    /**
     * Note: the implementation of read must allow multiple calls on the same instance object.
     * It can rely on state from open/close, but must not introduce new state that would cause collisions
     * between multiple calls
     */
    read: QueryStreamFunction;
}

export type QueryStreamFunction = (queryStatement: string) => Promise<IQueryResult>;
export type CloseFunction = () => Promise<void>;
export interface IQueryResult {
    result: Readable;
    metadata: Readable;
}
