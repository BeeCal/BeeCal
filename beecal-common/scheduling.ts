export enum Schedule {
    EveryHour,
    Daily,
    Weekly,
    Monthly,
}

export interface Task {
    schedule: Schedule,
    task: () => Promise<void>,
}
