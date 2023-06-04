import { Duration } from '@subathon/models/responses';
export const secondsToDuration = (d: number): Duration => {
    var hours = Math.floor(d / 3600);
    var minutes = Math.floor(d % 3600 / 60);
    var seconds = Math.floor(d % 3600 % 60);

    return {
        hours,
        minutes,
        seconds
    }
}

export const calcDurationFromNowToDate = (laterDate: Date) => {
    const now = new Date();
    const durationInSeconds = (laterDate.getTime() - new Date().getTime()) / 1000;

    return secondsToDuration(durationInSeconds);
}

export const calcTimestampFromNow = (duration: Duration) => {
    const now = new Date();
    
    now.setHours(now.getHours() + duration.hours, now.getMinutes() + duration.minutes, now.getSeconds() + duration.seconds, 0);

    return now.toUTCString();
}