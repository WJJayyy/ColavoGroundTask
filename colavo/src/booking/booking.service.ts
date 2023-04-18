import { readFileSync } from 'fs';
import { join } from 'path';
import { DayTimetable, ResponseBody, Timeslot } from './booking.models';
import * as moment from 'moment-timezone';

interface WorkhoursData {
    [key: string]: {
        [key: string]: {
            is_day_off: boolean;
            open_interval: number;
            close_interval: number;
        }[];
    };
}

interface EventsData {
    [key: string]: {
        begin_at: number;
        end_at: number;
    }[];
}

interface ResponseWrapper {
    response: ResponseBody;
}

export class BookingService {
    private workhoursData: WorkhoursData;
    private eventsData: EventsData;

    constructor() {
        const workhoursPath = join(process.cwd(), 'colavo', 'workhours.json');
        const eventsPath = join(process.cwd(), 'colavo', 'events.json');

        try {
            this.workhoursData = JSON.parse(readFileSync(workhoursPath, 'utf-8'));
            // console.log('workhours', this.workhoursData);
        } catch (error) {
            console.error('Error parsing workhours data:', error);
            this.workhoursData = {};
        }

        try {
            this.eventsData = JSON.parse(readFileSync(eventsPath, 'utf-8'));
        } catch (error) {
            console.error('Error parsing events data:', error);
            this.eventsData = {};
        }
    }

    private log(...args: any[]): void {
        console.log(...args);
    }

    public getTimeSlots(
        startDayIdentifier: string,
        timezoneIdentifier: string,
        serviceDuration: number,
        days: number = 1,
        timeslotInterval: number = 30,
        isIgnoreSchedule?: boolean,
        isIgnoreWorkhour?: boolean,
    ): DayTimetable[] {
        const timezones = moment.tz.names();

        if (!timezones.includes(timezoneIdentifier)) {
            throw new Error(`Invalid timezone identifier: ${timezoneIdentifier}`);
        }

        const workhours = this.workhoursData[timezoneIdentifier];

        const startDate = moment(startDayIdentifier, 'YYYYMMDD');
        const endDate = startDate.clone().add(days, 'day');

        const response: DayTimetable[] = [];

        for (let i = 0; i < endDate.diff(startDate, 'day'); i++) {
            const currentDay = startDate.clone().add(i, 'day');

            const dayTimetable: DayTimetable = {
                start_of_day: 0,
                day_modifier: 0,
                is_day_off: false,
                timeslots: [],
            };

            response.push(dayTimetable);

            dayTimetable.start_of_day = currentDay.clone().startOf('day').unix();

            if (!workhours || !workhours[currentDay.format('ddd').toLowerCase()]) {
                this.log(`No workhours found for ${currentDay.format('dddd')}`);
                dayTimetable.is_day_off = true;
            } else {
                const workday = workhours[currentDay.format('ddd').toLowerCase()];
                const serviceDurationInSeconds = serviceDuration * 60;

                if (isIgnoreWorkhour) {
                    dayTimetable.timeslots.push({
                        begin_at: dayTimetable.start_of_day,
                        end_at: dayTimetable.start_of_day + (days - 1) * 86400 + serviceDurationInSeconds,
                    });
                } else {
                    const workday = workhours[currentDay.format('dddd').toLowerCase()];

                    if (workday[0].is_day_off) {
                        this.log(`Day is off for ${currentDay.format('dddd')}`);
                        dayTimetable.is_day_off = true;
                    } else {
                        dayTimetable.day_modifier = workday[0].open_interval - dayTimetable.start_of_day;

                        const workhoursBeginAt = dayTimetable.start_of_day + workday[0].open_interval;
                        const workhoursEndAt = dayTimetable.start_of_day + workday[0].close_interval;

                        let beginAt = workhoursBeginAt;
                        while (beginAt + serviceDurationInSeconds <= workhoursEndAt) {
                            const endAt = beginAt + serviceDurationInSeconds;

                            const isOverlap = dayTimetable.timeslots.some((slot: Timeslot) => {
                                const isBeginOverlap = beginAt >= slot.begin_at && beginAt < slot.end_at;
                                const isEndOverlap = endAt > slot.begin_at && endAt <= slot.end_at;
                                const isEncompassing = beginAt <= slot.begin_at && endAt >= slot.end_at;

                                return isBeginOverlap || isEndOverlap || isEncompassing;
                            });

                            if (!isOverlap) {
                                dayTimetable.timeslots.push({
                                    begin_at: beginAt,
                                    end_at: endAt,
                                });
                            }

                            beginAt += timeslotInterval * 60;
                        }

                        if (dayTimetable.timeslots.length === 0) {
                            this.log(`No timeslots available for ${currentDay.format('dddd')}`);
                            dayTimetable.is_day_off = true;
                        } else {
                            dayTimetable.timeslots.forEach((timeslot: Timeslot) => {
                                const events = this.eventsData[currentDay.format('YYYYMMDD')];
                                if (!events) {
                                    return;
                                }

                                const isOverlap = events.some((event: { begin_at: number; end_at: number }) => {
                                    return (
                                        timeslot.begin_at < event.end_at &&
                                        timeslot.end_at > event.begin_at
                                    );
                                });

                                if (isOverlap) {
                                    timeslot.is_reserved = true;
                                }
                            });
                        }
                    }
                }
            }
        }
        return response;
    }
}
