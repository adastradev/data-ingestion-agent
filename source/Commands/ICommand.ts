/**
 * Represents an command exposed by the agent to perform a specific task
 *
 * @export
 * @interface ICommand
 */
export default interface ICommand {
    invoke: invokeFunction
}

export interface invokeFunction {
    (subArgs?: string[]): Promise<void>
}