declare function require(name:string): any; // tslint:disable-line
const apigClientFactory: any = require('aws-api-gateway-client').default; // tslint:disable-line

export class QueryService {
    // TODO: create an interface for client to allow plugging in clients for cloud providers other than AWS
    private apigClient: any;
    // private additionalParams: any;

    constructor(serviceEndpointUri: string, region: string) {
        // if (credentials.type === 'None') {
            this.apigClient = apigClientFactory.newClient({
                accessKey: '',
                invokeUrl: serviceEndpointUri,
                region,
                secretKey: ''
            });
        // } else if (credentials.type === 'IAM') {
        //     const iamCreds = credentials as IAMCredentials;
        //     this.apigClient = apigClientFactory.newClient({
        //         accessKey: iamCreds.accessKeyId,
        //         invokeUrl: serviceEndpointUri,
        //         region,
        //         secretKey: iamCreds.secretAccessKey
        //     });
        // } else if (credentials.type === 'BearerToken') {
        //     const tokenCreds = credentials as BearerTokenCredentials;
        //     this.additionalParams = {
        //         headers: {
        //             Authorization: 'Bearer ' + tokenCreds.idToken
        //         }
        //     };
        //     this.apigClient = apigClientFactory.newClient({
        //         accessKey: '',
        //         invokeUrl: serviceEndpointUri,
        //         region,
        //         secretKey: ''
        //     });
        // } else {
        //     throw(Error('Unsupported credential type in TenantApi'));
        // }
    }

    public async getTemplateQueries(integrationtype: string, integrationstage: string, formatted: string) {
        const params = {};
        const pathTemplate = '/queries';
        const method = 'GET';
        const additionalParams = Object.assign({}, {
            queryParams: {
                integrationtype,
                integrationstage,
                formatted
            }
        });
        const body = {};

        return await this.apigClient.invokeApi(params, pathTemplate, method, additionalParams, body);
    }
}
