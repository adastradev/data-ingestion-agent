import { CognitoUserPoolLocatorUserManagement } from '@adastradev/user-management-sdk';
import { CustomAuthManager } from '../../source/Auth/CustomAuthManager';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinon from 'sinon';
import { DiscoverySdk } from '@adastradev/serverless-discovery-sdk';
import fetch from 'node-fetch';
import { CognitoIdentityCredentials, config } from 'aws-sdk';
import sleep from '../../source/Util/sleep';
import { CognitoUser } from 'amazon-cognito-identity-js';
import { promisify } from 'util';
// tslint:disable-next-line: no-string-literal
global['fetch'] = fetch;

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('AuthManager', () => {
    let sandbox: sinon.SinonSandbox;
    let locator: CognitoUserPoolLocatorUserManagement;
    let region: string;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    before( async () => {
        config.credentials = null;
        region = process.env.AWS_REGION || 'us-east-1';
        locator = new CognitoUserPoolLocatorUserManagement(region);
        const discovery = new DiscoverySdk(
            process.env.DISCOVERY_SERVICE || process.env.DISCOVERY_SERVICE_DEV,
            region,
            process.env.DEFAULT_STAGE || 'dev'
        );
        process.env.USER_MANAGEMENT_URI = await discovery.lookupService('user-management');
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('Should have ability to login and refresh multiple times successfully', async () => {
        const auth = new CustomAuthManager(locator, region);
        (auth as any).MINUTES_BEFORE_ALLOW_REFRESH = 0;
        await auth.signIn(process.env.ASTRA_CLOUD_USERNAME, process.env.ASTRA_CLOUD_PASSWORD);
        await auth.refreshCognitoCredentials();
        const iamCredsOne = auth.getIamCredentials();
        const envCredsOne = {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        };

        await sleep(1000);

        await auth.refreshCognitoCredentials();
        const iamCredsTwo = auth.getIamCredentials();
        const envCredsTwo = {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        };
        expect(iamCredsOne).not.deep.equal(iamCredsTwo);
        expect(envCredsOne).not.deep.equal(envCredsTwo);
        expect((iamCredsTwo as CognitoIdentityCredentials).expireTime)
            .greaterThan((iamCredsOne as CognitoIdentityCredentials).expireTime);
    });

    it('Should not refresh again before half an hour has passed', async () => {
        const auth = new CustomAuthManager(locator, region);
        (auth as any).minutesBeforeAllowRefresh = 60;
        await auth.signIn(process.env.ASTRA_CLOUD_USERNAME, process.env.ASTRA_CLOUD_PASSWORD);
        await auth.refreshCognitoCredentials();
        const iamCredsOne = auth.getIamCredentials();
        const envCredsOne = {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        };

        await sleep(1000);

        await auth.refreshCognitoCredentials();
        const iamCredsTwo = auth.getIamCredentials();
        const envCredsTwo = {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        };
        expect(iamCredsOne).deep.equal(iamCredsTwo);
        expect(envCredsOne).deep.equal(envCredsTwo);
        expect((iamCredsTwo as CognitoIdentityCredentials).expireTime)
            .equal((iamCredsOne as CognitoIdentityCredentials).expireTime);
    });

    it('Should reject if there is a cognitoUser refreshSession error', async () => {
        const auth = new CustomAuthManager(locator, region);
        await auth.signIn(process.env.ASTRA_CLOUD_USERNAME, process.env.ASTRA_CLOUD_PASSWORD);
        (auth as any).minutesBeforeAllowRefresh = 0;
        const error = Error('Blah');
        sandbox.stub((auth as any).cognitoUser, 'refreshSession').callsArgWith(1, error);
        return auth.refreshCognitoCredentials().should.eventually.be.rejectedWith(error);
    });

    it('Should reject if there is an iamCredentials refresh error', async () => {
        const auth = new CustomAuthManager(locator, region);
        await auth.signIn(process.env.ASTRA_CLOUD_USERNAME, process.env.ASTRA_CLOUD_PASSWORD);
        (auth as any).minutesBeforeAllowRefresh = 0;
        const error = Error('Blah');
        sandbox.stub(CognitoIdentityCredentials.prototype, 'get').callsArgWith(0, error);
        return auth.refreshCognitoCredentials().should.eventually.be.rejectedWith(error);
    });
});
