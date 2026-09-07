import { Schedule } from "beecal-common";

/**
 * 
 * @param {import("../../beecal-common/dist/scheduling").Task[]} tasks 
 */
export async function runAndRegisterTasks(tasks) {
    for (const task of tasks) {
        await task.task();
        new CronJob(
            scheduleToCron(task.schedule),
            function () {
                task.task();
            }, // onTick
            null, // onComplete
            true, // start
        );
    }
}

function random(max = 60) {
    return (Math.random() * max).toFixed(0);
}
/**
 * 
 * @param {Schedule} schedule 
 */
function scheduleToCron(schedule) {
    switch (schedule) {
        case Schedule.EveryHour:
            // Run at a random minute to distribute load
            return `0 ${random()} * * * *`;
        case Schedule.Daily:
            // Run at a random minute at 02:00 to distribute load
            return `0 ${random()} 2 * * *`;
        case Schedule.Weekly:
            // Run at a random minute at Sunday, 02:00 to distribute load
            return `0 ${random()} 2 * * 0`;
        case Schedule.Monthly:
            // Run at a random minute on a random day of the month, 02:00 to distribute load
            return `0 ${random()} 2 ${random(28)} * 0`;
    }
}