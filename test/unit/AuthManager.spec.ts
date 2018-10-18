
import 'reflect-metadata';
import * as chai from 'chai';
import sinon = require('sinon');
import container from './test.inversify.config';
import { AuthManager } from '../../source/astra-sdk/AuthManager';
import { ICognitoUserPoolLocator } from '../../source/astra-sdk/ICognitoUserPoolLocator';
import { ICognitoUserPoolApiModel } from '../../source/astra-sdk/ICognitoUserPoolApiModel';
import { Logger } from 'winston';
import TYPES from '../../ioc.types';
import {
    AuthenticationDetails,
    CognitoUser,
    CognitoUserSession,
    IAuthenticationCallback
} from 'amazon-cognito-identity-js';

const expect = chai.expect;

class MockCognitoUserPoolLocator implements ICognitoUserPoolLocator {
    public getPoolForUsername(userName: string): Promise<ICognitoUserPoolApiModel> {
        // tslint:disable-next-line:only-arrow-functions
        return new Promise(function (resolve, reject) {
            const result: ICognitoUserPoolApiModel = {
                ClientId: '47ajgnlo93ucpk9r76rtlv66mj',
                IdentityPoolId: 'us-east-1:5f4ff9f2-75f6-4ad8-84d5-d7955445a5df',
                UserPoolId: 'us-east-1_aDe89j0zq'
            };
            resolve(result);
        });
    }
}

describe('AuthManager', () => {

    describe('when attempting to sign a cognito user in', () => {
        let sandbox: sinon.SinonSandbox;

        // const locatorStub = sinon.createStubInstance(ICognitoUserPoolLocator);
        // locatorStub.getPoolForUsername().returns(
        //     {
        //         ClientId: 'mockAppClientValue',
        //         IdentityPoolId: 'mockIdentityPoolId',
        //         UserPoolId: 'mockUserPoolId'
        //     }
        // );

        beforeEach(() => {
            sandbox = sinon.createSandbox();
        });

        afterEach(() => {
            sandbox.restore();
        });

        it('should acquire a valid Cognito session (JWT)', async () => {
            const authenticateUserFunc = async (authenticationDetails: AuthenticationDetails,
                                                callbacks: IAuthenticationCallback) => {
                const stubSession = sinon.createStubInstance(CognitoUserSession);
                stubSession.isValid.returns(true);
                callbacks.onSuccess(stubSession);
            };
            const authenticateUserSpy = sandbox.spy(authenticateUserFunc);

            const authenticateUserStub = sandbox.stub(CognitoUser.prototype, 'authenticateUser')
                .callsFake(authenticateUserSpy);

            const logger: Logger = container.get<Logger>(TYPES.Logger);

            const authManager = new AuthManager(new MockCognitoUserPoolLocator(), 'us-east-1', logger);
            const session = await authManager.signIn('user@aais.com', '12345');
            expect(authenticateUserStub.calledOnce).to.be.true;
            expect(session.isValid()).to.be.true;
        });
    });
});
