import { ApiCredentials, BearerTokenCredentials, IAMCredentials } from '@adastradev/serverless-discovery-sdk';

// ignore type checking for private member aws-api-gateway-client for now
// declare function require(name:string): any; // tslint:disable-line
const apigClientFactory: any = require('aws-api-gateway-client').default; // tslint:disable-line

// interceptor logging for Authorization headers
// axios.interceptors.request.use(function(config) {
//     var authorizationHeader = config.headers['Authorization'];
//     console.log('Authorization header: ' + authorizationHeader);
//     return config;
// });

export class UserManagementApi {
    private apigClient: any;
    private additionalParams: any;

    constructor(serviceEndpointUri: string, region: string, credentials: ApiCredentials) {
        if (credentials.type === 'None') {
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
            throw(Error('Unsupported credential type in UserManagementApi'));
        }
    }

    public createUserPool(tenant_id: string) {
        const params = {};
        const pathTemplate = '/admin/userpools';
        const method = 'POST';
        const additionalParams = {};
        const body = { tenant_id };

        return this.apigClient.invokeApi(params, pathTemplate, method, additionalParams, body);
    }

    public deleteUserPool(id) {
        const params = {};
        const pathTemplate = '/admin/userpools/' + id;
        const method = 'DELETE';
        const additionalParams = {};
        const body = { };

        return this.apigClient.invokeApi(params, pathTemplate, method, additionalParams, body);
    }

    public getUserPools() {
        const params = {};
        const pathTemplate = '/userpools';
        const method = 'GET';
        // var additionalParams = {};
        const body = {};

        return this.apigClient.invokeApi(params, pathTemplate, method, this.additionalParams, body);
    }

    public createUser(tenant_id, userName, password, firstName, lastName) {
        const params = {};
        const pathTemplate = '/admin/users';
        const method = 'POST';
        const additionalParams = {};
        const body = { tenant_id, userName, password, firstName, lastName };

        return this.apigClient.invokeApi(params, pathTemplate, method, additionalParams, body);
    }

    public registerTenant(tenantName, userName, firstName, lastName) {
        const params = {};
        const pathTemplate = '/tenant/register';
        const method = 'POST';
        const additionalParams = {};
        const body = { tenantName, userName, firstName, lastName };

        return this.apigClient.invokeApi(params, pathTemplate, method, additionalParams, body);
    }

    public deleteUser(userName) {
        const params = {};
        const pathTemplate = '/admin/users/' + encodeURIComponent(userName);
        const method = 'DELETE';
        const additionalParams = {};
        const body = { };

        return this.apigClient.invokeApi(params, pathTemplate, method, additionalParams, body);
    }

    public getUserPoolByUserName(userName): Promise<{}> {
        const params = {};
        const pathTemplate = '/users/' + encodeURIComponent(userName) + '/pool';
        const method = 'GET';
        const additionalParams = {};
        const body = {};

        return this.apigClient.invokeApi(params, pathTemplate, method, additionalParams, body);
    }

    public getUserInfo(userName) {
        const params = {};
        const pathTemplate = '/users/' + encodeURIComponent(userName) + '/info';
        const method = 'GET';
        // var additionalParams = {};
        const body = {};

        return this.apigClient.invokeApi(params, pathTemplate, method, this.additionalParams, body);
    }

    public getUsers(firstNameSearch) { // eslint-disable-line
        // TODO: implement search parameters
        const params = {};
        const pathTemplate = '/users';
        const method = 'GET';
        // var additionalParams = {};
        const body = {};

        return this.apigClient.invokeApi(params, pathTemplate, method, this.additionalParams, body);
    }
}
