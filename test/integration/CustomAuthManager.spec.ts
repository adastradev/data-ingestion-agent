import { CognitoUserPoolLocatorUserManagement } from '@adastradev/user-management-sdk';
import { CustomAuthManager } from '../../source/Auth/CustomAuthManager';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinon from 'sinon';
import { DiscoverySdk } from '@adastradev/serverless-discovery-sdk';
import fetch from 'node-fetch';
import { CognitoIdentityCredentials, config } from 'aws-sdk';
import sleep from '../../source/Util/sleep';
// tslint:disable-next-line: no-string-literal
global['fetch'] = fetch;

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('AuthManager', () => {
  let auth: CustomAuthManager;
  let sandbox: sinon.SinonSandbox;

  before( async () => {
    sandbox = sinon.createSandbox();
    config.credentials = null;
    const region = process.env.AWS_REGION || 'us-east-1';
    const locator = new CognitoUserPoolLocatorUserManagement(region);
    const discovery = new DiscoverySdk(
      process.env.DISCOVERY_SERVICE || process.env.DISCOVERY_SERVICE_DEV,
      region,
      process.env.DEFAULT_STAGE || 'dev'
    );
    process.env.USER_MANAGEMENT_URI = await discovery.lookupService('user-management');
    auth = new CustomAuthManager(locator, region);
  });

  after(() => {
    sandbox.restore();
  });

  it('Should have ability to login and refresh multiple times successfully', async () => {
    (auth as any).minutesBeforeAllowRefresh = 0;
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
});
