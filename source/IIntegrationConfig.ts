import { Readable } from 'stream';

export enum IntegrationType { Banner = 'Banner', DegreeWorks = 'DegreeWorks', PeopleSoft = 'PeopleSoft', Demo = 'Demo', Unknown = 'Unknown'}
export enum IntegrationSystemType { 'Oracle' = 'Oracle' }

/**
 * Represents a set of statements or queries that need to be run for a given integration
 *
 * @export
 * @interface IIntegrationConfig
 */
export interface IIntegrationConfig {
    /**
     * The unique integration type descriptor
     *
     * @type {string}
     * @memberof IIntegrationConfig
     */
    type: IntegrationType;
    /**
     * A set of named queries that must be run for this integration
     *
     * @type {string[]}
     * @memberof IIntegrationConfig
     */
    queries: IQueryDefinition[];

    // TODO: do we need to version the config and/or track it's state (authorized to run / newly updated)
}

/**
 * A named query to be used as part of the data integration.
 *
 * @export
 * @interface IQueryDefinition
 */
export interface IQueryDefinition {
    name: string;
    query: string;
}

/**
 * Information about the query results and other information about the
 * underlying datastore related to the query
 *
 * @export
 * @interface IQueryMetadata
 */
export interface IQueryMetadata {
    /**
     * The name of the query
     *
     * @type {string}
     * @memberof IQueryMetadata
     */
    name: string;

    /**
     * A stream containing metadata about the query
     *
     * @type {Readable}
     * @memberof IQueryMetadata
     */
    data: Readable;
}
