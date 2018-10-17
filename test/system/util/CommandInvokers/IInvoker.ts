import ICommand from '../InstanceCommands/ICommand';

/**
 * The basic signature of a mechanism that can invoke commands
 *
 * @export
 * @interface IInvoker
 * @template TCommandType The type that represents an individual command
 * @template TResultType The type of the result returned by invoking the command
 */
export default interface IInvoker<TCommandType, TResultType> {
    /**
     * Perform an action on the given command and return the result
     *
     * @type {AsyncInvokeFunction<TCommandType, TResultType>}
     * @memberof IInvoker
     */
    invoke: IAsyncInvokeFunction<TCommandType, TResultType>;

    /**
     * Perform any cleanup
     *
     * @memberof IInvoker
     */
    dispose(): void;
}

type IAsyncInvokeFunction<TCommandType, TResultType> = (command: ICommand<TCommandType>) => Promise<TResultType>;
