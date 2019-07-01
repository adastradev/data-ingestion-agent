import { ApiCredentials } from '@adastradev/serverless-discovery-sdk';
import { IHttpClientProvider } from './Util/IHttpClientProvider';
import { IHttpClient } from './Util/IHttpClient';

export class QueryService {
    // TODO: create an interface for client to allow plugging in clients for cloud providers other than AWS
    private apigClient: IHttpClient;
    private additionalParams: any;

    constructor(serviceEndpointUri: string, region: string, clientProvider: IHttpClientProvider, credentials?: ApiCredentials) {
        this.apigClient = clientProvider.getClient(serviceEndpointUri, region, credentials);
    }

    public async getTenantQueries(integrationtype: string, integrationstage: string, formatted: string) {
        const params = {};
        const pathTemplate = '/admin/queries';
        const method = 'GET';
        this.apigClient.defaultAdditionalParams = Object.assign({}, this.additionalParams);
        const body = {};
        const queryParams = {
            integrationstage,
            integrationtype
        };
        if (formatted) {
            queryParams['formatted'] = formatted;
        }

        Object.assign(this.apigClient.defaultAdditionalParams, { queryParams });

        return await this.apigClient.invokeApi(params, pathTemplate, method, this.additionalParams, body);
    }
}
