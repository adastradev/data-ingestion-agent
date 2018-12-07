
import * as chai from 'chai';
import Ec2Factory from './util/Ec2Factory';
import * as node_ssh from 'node-ssh';
import InstanceConfig from './InstanceConfig';
import IInvoker from './util/CommandInvokers/IInvoker';
import SshCommandInvoker from './util/CommandInvokers/SshCommandInvoker';
import { InstallDockerCommand } from './util/InstanceCommands/CentOS7/Commands';
import * as DockerCommands from './util/InstanceCommands/Docker/Commands';
import sleep from '../../source/Util/sleep';
import * as AWS from 'aws-sdk';
import { AuthManager, CognitoUserPoolLocatorUserManagement } from '@adastradev/user-management-sdk';
import { BearerTokenCredentials, DiscoverySdk } from '@adastradev/serverless-discovery-sdk';
import { DataIngestionApi } from '@adastradev/data-ingestion-sdk';

import fetch from 'fetch-with-proxy';
// tslint:disable-next-line:no-string-literal
global['fetch'] = fetch;

const expect = chai.expect;

describe('Data Ingestion Agent on CentOS 7', () => {

    const ec2Factory: Ec2Factory = new Ec2Factory();
    const instanceConfig: InstanceConfig = require('./instanceConfig.json');
    const targetInstanceType: string = 'linux_centos7';
    let sshClient: node_ssh = null;
    let commandInvoker: IInvoker<string, string> = null;

    const getLatestIngestionObject = async (s3: AWS.S3, bucketPath: string): Promise<AWS.S3.Object> => {
        const today = new Date();
        const ymd = { year: today.getUTCFullYear, month: today.getUTCMonth, day: today.getUTCDay };
        const previousObjects = await s3.listObjectsV2({ Bucket: bucketPath.split('/')[0], Prefix: bucketPath.split('/')[1] + `/Demo-${ymd.year}-${ymd.month}-${ymd.day}-` }).promise();

        const sortedObjects = previousObjects.Contents.sort((a, b) => {
            if (a.LastModified < b.LastModified) { return -1; }
            if (a.LastModified > b.LastModified) { return 1; }

            return 0;
        });

        return sortedObjects[sortedObjects.length - 1];
    };

    before(async () => {
        await ec2Factory.createTestInstance(targetInstanceType);
        sshClient = new node_ssh();
        await sshClient.connect({
            host: ec2Factory.currentInstance.PublicDnsName,
            // For now assume it's a pem from AWS
            privateKey: `${instanceConfig.instance.KeyName}.pem`,
            username: ec2Factory.getRootUser()
        });

        commandInvoker = new SshCommandInvoker(sshClient);
        await commandInvoker.invoke(new InstallDockerCommand());
        await commandInvoker.invoke(new DockerCommands.PullLatestDockerImageCommand());
    });

    after(async () => {
        await ec2Factory.removeTestInstance();
        commandInvoker.dispose();
    });

    describe('when the latest docker image has been pulled', () => {
        it('the image can be started and report an initial healthy state', async () => {
            let result = await commandInvoker.invoke(new DockerCommands.RunDataIngestionAgentDemo());
            await sleep(30000);

            result = await commandInvoker.invoke(new DockerCommands.InspectHealthStatusCommand());
            expect(result).to.eq('"healthy"');

            result = await commandInvoker.invoke(new DockerCommands.StopAndRemoveContainerCommand());
            expect(result).to.eq('diadia');
        });

        it('the preview command can be used to output queries to be executed in interactive mode', async () => {
            let result = await commandInvoker.invoke(new DockerCommands.RunDataIngestionAgentDemoWithPreview());
            expect(result).to.contain('SELECT * FROM ALL_TABLES');

            result = await commandInvoker.invoke(new DockerCommands.StopAndRemoveContainerCommand());
            expect(result).to.eq('diadia');
        });

        it('the ingest command can be used to ingest demo data', async () => {
            const region = process.env.AWS_REGION;
            const sdk: DiscoverySdk = new DiscoverySdk(process.env.DISCOVERY_SERVICE, region);

            const stage = process.env.DEFAULT_STAGE || 'prod';
            let endpoints = await sdk.lookupService('user-management', stage);
            process.env.USER_MANAGEMENT_URI = endpoints[0];

            endpoints = await sdk.lookupService('data-ingestion', stage);
            const dataIngestionEndpoint = endpoints[0];

            const poolLocator = new CognitoUserPoolLocatorUserManagement(region);
            const authManager = new AuthManager(poolLocator, region);
            const cognitoSession = await authManager.signIn(process.env.ASTRA_CLOUD_USERNAME, process.env.ASTRA_CLOUD_PASSWORD);
            AWS.config.credentials = await authManager.getIamCredentials();
            AWS.config.region = region;
            const credentialsBearerToken: BearerTokenCredentials = {
                idToken: cognitoSession.getIdToken().getJwtToken(),
                type: 'BearerToken'
            };
            const dataIngestionApi = new DataIngestionApi(
                dataIngestionEndpoint,
                region,
                credentialsBearerToken);

            const poolListResponse = await dataIngestionApi.getTenantSettings();
            const bucketPath = poolListResponse.data.dataIngestionBucketPath;

            const s3 = new AWS.S3();

            const lastKnownObject = await getLatestIngestionObject(s3, bucketPath);

            if (lastKnownObject) {
                console.log(`Last Known Ingestion: ${lastKnownObject.Key}`);
            }

            let result = await commandInvoker.invoke(new DockerCommands.RunDataIngestionAgentDemoWithIngest());

            const latestKnownObject = await getLatestIngestionObject(s3, bucketPath);
            console.log(`Latest Known Ingestion: ${latestKnownObject.Key}`);

            if (lastKnownObject) {
                expect(latestKnownObject).to.exist;
                expect(latestKnownObject.Key).to.not.equal(lastKnownObject.Key);
            } else {
                expect(latestKnownObject).to.exist;
            }

            result = await commandInvoker.invoke(new DockerCommands.StopAndRemoveContainerCommand());
            expect(result).to.eq('diadia');
        });
    });
});
