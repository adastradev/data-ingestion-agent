export default class TimerCompletionMessage {
    constructor(public readonly message: string, public readonly token: string, public readonly startDateTime: number) {
    }

    public generate(durationDescription: string): string {
        return this.message.replace(this.token, durationDescription);
    }
}
