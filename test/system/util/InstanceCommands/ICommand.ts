/**
 * Defines one or more tightly related commands of the specified type
 *
 * @export
 * @interface ICommand
 * @template T The type of command (e.g. <string> for shell or sql commands)
 */
export default interface ICommand<T> {
    getCommands(): Iterable<T>;
}