/**
 * Represents an command exposed by the agent to perform a specific task
 *
 * @export
 * @interface ICommand
 */
export default interface ICommand {
    invoke: IInvokeFunction;
}

export type IInvokeFunction = (subArgs?: string[]) => Promise<void>;
