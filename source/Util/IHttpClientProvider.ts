import { ApiCredentials } from '@adastradev/serverless-discovery-sdk';
import { IHttpClient } from './IHttpClient';

export interface IHttpClientProvider {
    getClient(serviceEndpointUri: string, region: string, credentials?: ApiCredentials): IHttpClient;
}
