
import 'reflect-metadata';
import * as chai from 'chai';
import sinon = require('sinon');
import container from './test.inversify.config';
import { AuthManager } from '../../source/astra-sdk/AuthManager';
import { ICognitoUserPoolLocator } from '../../source/astra-sdk/ICognitoUserPoolLocator';
import { ICognitoUserPoolApiModel } from '../../source/astra-sdk/ICognitoUserPoolApiModel';
import { Logger } from 'winston';
import TYPES from '../../ioc.types';
import { CognitoUser, CognitoUserSession } from 'amazon-cognito-identity-js';

const expect = chai.expect;

class MockCognitoUserPoolLocator implements ICognitoUserPoolLocator {
    public getPoolForUsername(userName: string): Promise<ICognitoUserPoolApiModel> {
        // tslint:disable-next-line:only-arrow-functions
        return new Promise(function (resolve, reject) {
            const result: ICognitoUserPoolApiModel = {
                ClientId: 'mockAppClientValue',
                IdentityPoolId: 'mockIdentityPoolId',
                UserPoolId: 'mockUserPoolId'
            };
            resolve(result);
        }.bind(this));
    }
}

describe('AuthManager', () => {

    describe('when attempting to sign a cognito user in', () => {
        let sandbox: sinon.SinonSandbox;
        beforeEach(() => {
            sandbox = sinon.createSandbox();
        });

        afterEach(() => {
            sandbox.restore();
        });

        it('should acquire a valid Cognito session (JWT)', async () => {

            const authenticateUserFunc = async (query, binds, options) => {
                const stubSession = sinon.createStubInstance(CognitoUserSession);
                stubSession.isValid.returns(true);
                return Promise.resolve(stubSession);
            };
            const authenticateUserSpy = sandbox.spy(authenticateUserFunc);

            const authenticateUserStub = sandbox.stub(CognitoUser, 'authenticateUser' as any)
                .returns({ authenticateUser: authenticateUserSpy });

            const logger: Logger = container.get<Logger>(TYPES.Logger);

            const authManager = new AuthManager(new MockCognitoUserPoolLocator(), 'us-east-1', logger);
            const session = await authManager.signIn('user@aais.com', '12345');
            expect(authenticateUserStub.calledOnce).to.be.true;
            expect(session.isValid()).to.be.true;
        });
    });
});
