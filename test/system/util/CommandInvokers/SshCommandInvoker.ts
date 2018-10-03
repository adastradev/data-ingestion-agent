import ICommand from '../InstanceCommands/ICommand';
import IInvoker from './IInvoker';
import node_ssh from 'node-ssh';

export default class SshCommandInvoker implements IInvoker<string, string> {
    
    private sshClient: node_ssh = null;
    
    constructor(sshClient: node_ssh) {
        this.sshClient = sshClient;
    }

    public async invoke(command: ICommand<string>): Promise<string> {
        var commands: Iterable<string> = command.getCommands();
        var results = "";
        for (var cmd of commands) {
            console.log(cmd);
            var commandResult = await this.sshClient.execCommand(cmd, { cwd: '/' });

            if (commandResult.code > 0) {
                console.log(`Potential Command Failure: '${cmd}' - Code: '${commandResult.code}' - Message: '${commandResult.stderr}'`);
            }

            results = results.concat(commandResult.stdout);
        }

        console.log(results);
        return results;
    }

    public dispose(): void {
        this.sshClient.dispose();
    }
}