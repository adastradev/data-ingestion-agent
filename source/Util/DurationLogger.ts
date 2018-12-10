import TimerCompletionMessage from './TimerCompletionMessage';
import { inject } from 'inversify';
import TYPES from '../../ioc.types';
import { Logger } from 'winston';

export default class DurationLogger {

    public static readonly DURATION_TOKEN: string = '{DURATION}';

    private messageStack: TimerCompletionMessage[] = [];

    constructor(@inject(TYPES.Logger) private readonly _logger: Logger) {
    }

    public start(messageFormat: string): void {
        this.messageStack.push(new TimerCompletionMessage(messageFormat, DurationLogger.DURATION_TOKEN, Date.now()));
    }

    public stop(logLevel: string = 'info'): void {
        const message = this.messageStack.pop();
        this._logger.log(logLevel, message.generate(Date.now()));
    }
}
