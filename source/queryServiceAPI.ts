declare function require(name:string): any; // tslint:disable-line
const apigClientFactory: any = require('aws-api-gateway-client').default; // tslint:disable-line
import { ApiCredentials, BearerTokenCredentials, IAMCredentials} from '@adastradev/serverless-discovery-sdk';

export class QueryService {
    // TODO: create an interface for client to allow plugging in clients for cloud providers other than AWS
    private apigClient: any;
    private additionalParams: any;

    constructor(serviceEndpointUri: string, region: string, credentials?: ApiCredentials) {
        if (!credentials || credentials.type === 'None') {
            this.apigClient = apigClientFactory.newClient({
                accessKey: '',
                invokeUrl: serviceEndpointUri,
                region,
                secretKey: ''
            });
        } else if (credentials.type === 'IAM') {
            const iamCreds = credentials as IAMCredentials;
            this.apigClient = apigClientFactory.newClient({
                accessKey: iamCreds.accessKeyId,
                invokeUrl: serviceEndpointUri,
                region,
                secretKey: iamCreds.secretAccessKey
            });
        } else if (credentials.type === 'BearerToken') {
            const tokenCreds = credentials as BearerTokenCredentials;
            this.additionalParams = {
                headers: {
                    Authorization: 'Bearer ' + tokenCreds.idToken
                }
            };
            this.apigClient = apigClientFactory.newClient({
                accessKey: '',
                invokeUrl: serviceEndpointUri,
                region,
                secretKey: ''
            });
        } else {
            throw(Error('Unsupported credential type in TenantApi'));
        }
    }

    public async getTenantQueries(integrationtype: string, integrationstage: string, formatted: string) {
        const params = {};
        const pathTemplate = '/admin/queries';
        const method = 'GET';
        this.additionalParams = Object.assign({}, this.additionalParams);
        const body = {};
        const queryParams = {
            integrationstage,
            integrationtype
        };
        if (formatted) {
            queryParams['formatted'] = formatted;
        }

        Object.assign(this.additionalParams, { queryParams });

        return await this.apigClient.invokeApi(params, pathTemplate, method, this.additionalParams, body);
    }
}
