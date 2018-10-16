import ICommand from '../ICommand';

/**
 * Installs docker on a CentOS 7 installation.
 *
 * @export
 * @class InstallDockerCommand
 * @implements {ICommand<string>}
 */
export class InstallDockerCommand implements ICommand<string> {
    public getCommands(): Iterable<string> {
        return [
            'sudo yum install -y yum-utils device-mapper-persistent-data lvm2',
            'sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo',
            'sudo yum install -y docker-ce',
            'sudo systemctl start docker'
        ];
    }
}
