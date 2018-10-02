
import * as chai from 'chai';
import * as ec2 from 'aws-sdk/clients/ec2';
import Ec2Factory from './util/Ec2Factory';
import * as node_ssh from 'node-ssh';



const expect = chai.expect;
const should = chai.should();

describe('Data Ingestion Agent on CentOS 7', () => {

    var ec2Factory: Ec2Factory = new Ec2Factory();


    beforeEach(async () => {        
        await ec2Factory.createTestInstance("linux-centos7");
    });

    afterEach(async () => {
        await ec2Factory.removeTestInstance();
    });

    describe('when installed and the container started', () => {
        it('should successfully start and maintain a healthy container state', async () => {
            var targetInstance = ec2Factory.currentInstance;

            var ssh = new node_ssh();
            await ssh.connect({
                host: targetInstance.PublicDnsName,
                username: 'ec2-user',
                privateKey: 'automated-system-tests.pem'
            });

            var result = await ssh.execCommand('ls -a', { cwd: '/' });

            // TODO: Install docker (as before step?) 
            // sudo yum install -y yum-utils device-mapper-persistent-data lvm2
            // sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
            // sudo yum install -y docker-ce
            // sudo systemctl start docker
            // sudo docker pull adastradev/data-ingestion-agent:?

            expect(0).to.eq(0);
        });
    });
});
