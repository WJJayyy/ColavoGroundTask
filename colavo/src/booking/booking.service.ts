import { readFileSync } from 'fs';
import { join } from 'path';
import { DayTimetable, ResponseBody, Timeslot } from './booking.models';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import moment from 'moment-timezone';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(localizedFormat);

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

export class BookingService {
    private workhoursData: WorkhoursData;
    private eventsData: EventsData;

    constructor() {
        const workhoursPath = join(process.cwd(), 'colavo', 'workhours.json');
        const eventsPath = join(process.cwd(), 'colavo', 'events.json');

        this.workhoursData = JSON.parse(readFileSync(workhoursPath, 'utf-8'));
        this.eventsData = JSON.parse(readFileSync(eventsPath, 'utf-8'));
    }

    public getTimeSlots(
        startDayIdentifier: string,
        timezoneIdentifier: string,
        serviceDuration: number,
        days: number = 1,
        timeslotInterval: number = 30,
        isIgnoreSchedule?: boolean,
        isIgnoreWorkhour?: boolean,
    )

        : ResponseBody {
        const timezones = moment.tz.names();

        if (!timezones.includes(timezoneIdentifier)) {
            throw new Error(`Invalid timezone identifier: ${timezoneIdentifier}`);
        }
        const workhours = this.workhoursData[timezoneIdentifier];
        const currentTime = dayjs().tz(timezoneIdentifier);

        const startDate = dayjs(startDayIdentifier, 'YYYYMMDD');
        const endDate = startDate.add(days, 'day');

        const response: ResponseBody = [];

        for (let i = 0; i < endDate.diff(startDate, 'day'); i++) {
            const currentDay = startDate.add(i, 'day');
            const dayTimetable: DayTimetable = {
                start_of_day: currentDay.unix(),
                day_modifier: 0,
                is_day_off: false,
                timeslots: [],
            };

            const workday = workhours[currentDay.format('dddd').toLowerCase()];

            if (workday.length > 0 && !workday[0].is_day_off) {
                const openInterval = workday[0].open_interval;
                const closeInterval = workday[workday.length - 1].close_interval;

                for (let startHour = openInterval; startHour + serviceDuration <= closeInterval; startHour += timeslotInterval) {
                    const endHour = startHour + serviceDuration;
                    const timeSlot: Timeslot = {
                        begin_at: currentDay.set('hour', startHour).unix(),
                        end_at: currentDay.set('hour', endHour).unix(),
                    };
                    dayTimetable.timeslots.push(timeSlot);
                }
            } else {
                dayTimetable.is_day_off = true;
            }

            response.push(dayTimetable);
        }

        return response;
    }
}
