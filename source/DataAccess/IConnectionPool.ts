/**
 * Interface class abstraction for a pool of connection resources
 *
 * @export
 * @interface IConnectionPool
 */
export default interface IConnectionPool {
    open: OpenFunction;
    close: CloseFunction;
    getConnection: GetFunction;
    releaseConnection: ReleaseFunction;
}

export type OpenFunction = () => Promise<void>;
export type CloseFunction = () => Promise<void>;
// The following are opaque types visible only to module code common between pool and execution code itself;
// these allow flexibility in connection lifecycle managemnent by consuming classes that are not
// aware of implementation details
export type GetFunction = () => Promise<any>;
export type ReleaseFunction = (connection: any) => Promise<void>;
