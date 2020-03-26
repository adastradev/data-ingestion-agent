import { IHttpClientProvider } from './IHttpClientProvider';
import { ApiCredentials, BearerTokenCredentials, IAMCredentials } from '@adastradev/serverless-discovery-sdk';
import { IHttpClient } from './IHttpClient';

const apigClientFactory: any = require('@adastradev/aws-api-gateway-client').default; // tslint:disable-line

export class DefaultHttpClientProvider implements IHttpClientProvider {
    public getClient(serviceEndpointUri: string, region: string, credentials?: ApiCredentials): IHttpClient {
        if (!credentials || credentials.type === 'None') {
            return apigClientFactory.newClient({
                accessKey: '',
                invokeUrl: serviceEndpointUri,
                region,
                secretKey: ''
            });
        } else if (credentials.type === 'IAM') {
            const iamCreds = credentials as IAMCredentials;
            return apigClientFactory.newClient({
                accessKey: iamCreds.accessKeyId,
                invokeUrl: serviceEndpointUri,
                region,
                secretKey: iamCreds.secretAccessKey
            });
        } else if (credentials.type === 'BearerToken') {
            const tokenCreds = credentials as BearerTokenCredentials;
            const defaultAdditionalParams = {
                headers: {
                    Authorization: 'Bearer ' + tokenCreds.idToken
                }
            };
            const client = apigClientFactory.newClient({
                accessKey: '',
                invokeUrl: serviceEndpointUri,
                region,
                secretKey: ''
            });
            Object.assign(client, { defaultAdditionalParams });

            return client;
        } else {
            throw(Error('Unsupported credential type in TenantApi'));
        }
    }
}
