
import * as chai from 'chai';
import Ec2Factory from './util/Ec2Factory';
import * as node_ssh from 'node-ssh';
import InstanceConfig from './InstanceConfig';
import IInvoker from './util/CommandInvokers/IInvoker';
import SshCommandInvoker from './util/CommandInvokers/SshCommandInvoker';
import { InstallDockerCommand } from './util/InstanceCommands/CentOS7/Commands';
import * as DockerCommands from './util/InstanceCommands/Docker/Commands';

const expect = chai.expect;
const should = chai.should();
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

describe('Data Ingestion Agent on CentOS 7', () => {

    var ec2Factory: Ec2Factory = new Ec2Factory();
    var instanceConfig: InstanceConfig = require('./instanceConfig.json');
    var targetInstanceType: string = "linux_centos7";
    var sshClient: node_ssh = null;
    var commandInvoker: IInvoker<string, string> = null;

    before(async () => {        
        await ec2Factory.createTestInstance(targetInstanceType);
        sshClient = new node_ssh();
        await sshClient.connect({
            host: ec2Factory.currentInstance.PublicDnsName,
            username: ec2Factory.getRootUser(),
            // For now assume it's a pem from AWS
            privateKey: `${instanceConfig.instance.KeyName}.pem`
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
            let result = await commandInvoker.invoke(new DockerCommands.RunDataIngestionAgent());
            await sleep(30000);

            result = await commandInvoker.invoke(new DockerCommands.InspectHealthStatusCommand());
            expect(result).to.eq('"healthy"');

            result = await commandInvoker.invoke(new DockerCommands.StopAndRemoveContainerCommand());
            expect(result).to.eq('diadia');
        });

        it('the preview command can be used to output queries to be executed in interactive mode', async () => {
            let result = await commandInvoker.invoke(new DockerCommands.RunDataIngestionAgentWithPreview());
            expect(result).to.contain('select * from sometable');

            result = await commandInvoker.invoke(new DockerCommands.StopAndRemoveContainerCommand());
            expect(result).to.eq('diadia');
        });
    });
});
