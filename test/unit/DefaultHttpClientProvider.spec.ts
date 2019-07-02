
import 'reflect-metadata';
import * as sinon from 'sinon';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);

import { DefaultHttpClientProvider } from '../../source/Util/DefaultHttpClientProvider';
import { ApiCredentials, BearerTokenCredentials, IAMCredentials } from '@adastradev/serverless-discovery-sdk';

const expect = chai.expect;

describe('DefaultHttpClientProvider', () => {
    describe('Given a request for a client', () => {
        describe('When the request is made', () => {
            let sandbox: sinon.SinonSandbox;

            before(() => {
                sandbox = sinon.createSandbox();
            });

            afterEach(() => {
                sandbox.restore();
            });

            describe('and the request does not specify credentials', () => {
                it('then the provider should return a properly configured client', async () => {
                    const provider = new DefaultHttpClientProvider();

                    const client = provider.getClient('http://something.com', 'us-east-1');

                    expect(client).to.exist;
                    expect(client.defaultAdditionalParams).to.not.exist;
                });
            });
            describe('and the request specifies IAM credentials', () => {
                it('then the provider should return a properly configured client', async () => {
                    const provider = new DefaultHttpClientProvider();

                    const creds: IAMCredentials = {
                        accessKeyId: 'AKIAJE7N000000000000',
                        secretAccessKey: 'NQV69ecK9Eo0Na4paIrs0000000000000/000000',
                        type: 'IAM'
                    };
                    const client = provider.getClient('http://something.com', 'us-east-1', creds);

                    expect(client).to.exist;
                    expect(client.defaultAdditionalParams).to.not.exist;
                });
            });
            describe('and the request specifies BearerToken credentials', () => {
                it('then the provider should return a properly configured client', async () => {
                    const provider = new DefaultHttpClientProvider();

                    const creds: BearerTokenCredentials = {
                        idToken: 'notavalidtoken',
                        type: 'BearerToken'
                    };
                    const client = provider.getClient('http://something.com', 'us-east-1', creds);

                    expect(client).to.exist;
                    expect(client.defaultAdditionalParams.headers.Authorization).eq('Bearer ' + creds.idToken);
                });
            });
            describe('and the request specifies BearerToken credentials', () => {
                it('then the provider should return a properly configured client', async () => {
                    const provider = new DefaultHttpClientProvider();

                    const creds: BearerTokenCredentials = {
                        idToken: 'notavalidtoken',
                        type: 'BearerToken'
                    };
                    const client = provider.getClient('http://something.com', 'us-east-1', creds);

                    expect(client).to.exist;
                    expect(client.defaultAdditionalParams.headers.Authorization).eq('Bearer ' + creds.idToken);
                });
            });
            describe('and the request specifies unknown credentials', () => {
                it('then the provider should fail to return a client', async () => {
                    const provider = new DefaultHttpClientProvider();

                    const creds: ApiCredentials = {
                        type: 'unknown' as any
                    };
                    expect(() => provider.getClient('http://something.com', 'us-east-1', creds)).to.throw(Error, 'Unsupported credential type in TenantApi');
                });
            });
        });
    });
});
