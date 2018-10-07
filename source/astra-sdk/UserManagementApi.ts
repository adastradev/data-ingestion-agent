import { ApiCredentials, IAMCredentials, BearerTokenCredentials } from "@adastradev/serverless-discovery-sdk";

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

    createUserPool(tenant_id) {
        var params = {};
        var pathTemplate = '/admin/userpools';
        var method = 'POST';
        var additionalParams = {};
        var body = { tenant_id: tenant_id };

        return this.apigClient.invokeApi(params, pathTemplate, method, additionalParams, body);
    }

    deleteUserPool(id) {
        var params = {};
        var pathTemplate = '/admin/userpools/' + id;
        var method = 'DELETE';
        var additionalParams = {};
        var body = { };

        return this.apigClient.invokeApi(params, pathTemplate, method, additionalParams, body);
    }

    getUserPools() {
        var params = {};
        var pathTemplate = '/userpools';
        var method = 'GET';
        // var additionalParams = {};
        var body = {};

        return this.apigClient.invokeApi(params, pathTemplate, method, this.additionalParams, body);
    }

    createUser(tenant_id, userName, password, firstName, lastName) {
        var params = {};
        var pathTemplate = '/admin/users';
        var method = 'POST';
        var additionalParams = {};
        var body = { tenant_id: tenant_id, userName: userName, password: password, firstName: firstName, lastName: lastName };

        return this.apigClient.invokeApi(params, pathTemplate, method, additionalParams, body);
    }

    registerTenant(tenantName, userName, firstName, lastName) {
        var params = {};
        var pathTemplate = '/tenant/register';
        var method = 'POST';
        var additionalParams = {};
        var body = { tenantName: tenantName, userName: userName, firstName: firstName, lastName: lastName };

        return this.apigClient.invokeApi(params, pathTemplate, method, additionalParams, body);
    }

    deleteUser(userName) {
        var params = {};
        var pathTemplate = '/admin/users/' + encodeURIComponent(userName);
        var method = 'DELETE';
        var additionalParams = {};
        var body = { };

        return this.apigClient.invokeApi(params, pathTemplate, method, additionalParams, body);
    }

    getUserPoolByUserName(userName): Promise<{}> {
        var params = {};
        var pathTemplate = '/users/' + encodeURIComponent(userName) + '/pool';
        var method = 'GET';
        var additionalParams = {};
        var body = {};

        return this.apigClient.invokeApi(params, pathTemplate, method, additionalParams, body);
    }

    getUserInfo(userName) {
        var params = {};
        var pathTemplate = '/users/' + encodeURIComponent(userName) + '/info';
        var method = 'GET';
        // var additionalParams = {};
        var body = {};

        return this.apigClient.invokeApi(params, pathTemplate, method, this.additionalParams, body);
    }

    getUsers(firstNameSearch) { // eslint-disable-line
        // TODO: implement search parameters
        var params = {};
        var pathTemplate = '/users';
        var method = 'GET';
        // var additionalParams = {};
        var body = {};

        return this.apigClient.invokeApi(params, pathTemplate, method, this.additionalParams, body);        
    }
}
