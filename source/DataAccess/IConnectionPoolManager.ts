import { Readable } from 'stream';

/**
 * Represents a mechanism intended to read data from some datasource and output that data as a stream
 *
 * @export
 * @interface IConnectionPoolManager
 */
export default interface IConnectionPoolManager {
    open: OpenFunction;
    close: CloseFunction;
    get: GetFunction;
}

export type OpenFunction = () => Promise<void>;
export type CloseFunction = () => Promise<void>;
export type GetFunction = () => Promise<any>;
