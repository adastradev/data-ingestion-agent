
/**
 * An exception thrown when an adhoc command specified for the agent is not known
 * to the agent and cannot be handled
 */
export class InvalidCommandException extends Error {
    constructor(public readonly commandName: string, message?: string) {
        super(message);
        this.commandName = commandName;
    }
}
