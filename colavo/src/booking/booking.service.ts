import { DayTimetable, Timeslot } from './booking.models';
import * as moment from 'moment-timezone';
import * as events from '../../events.json';
import * as workhours from '../../workhours.json';

export type Events = Event[];
export type Workhours = Workhour[];

export interface Event {
    begin_at: number;
    end_at: number;
    created_at: number;
    updated_at: number;
}

export interface Workhour {
    is_day_off: boolean;
    open_interval: number;
    close_interval: number;
    weekday: number;
    key: string;
}

export async function getTimeSlots(
    start_day_identifier: string,
    timezone_identifier: string,
    service_duration: number,
    days: number = 1,
    timeslot_interval: number = 1800,
    is_ignore_schedule: boolean = false,
    is_ignore_workhour: boolean = false,
    events: Events,
    workhours: Workhours
): Promise<DayTimetable[]> {
    const startDay = moment.tz(start_day_identifier, "YYYYMMDD", timezone_identifier);
    const dayTimetables: DayTimetable[] = [];

    for (let i = 0; i < days; i++) {
        const currentDay = startDay.clone().add(i, 'days');
        const start_of_day = currentDay.clone().startOf('day').unix();
        const day_modifier = i;

        const weekday = currentDay.isoWeekday();
        const workhour = workhours.find(wh => wh.weekday === weekday);

        if (!is_ignore_workhour && workhour?.is_day_off) {
            dayTimetables.push({
                start_of_day,
                day_modifier,
                is_day_off: true,
                timeslots: [],
            });
            continue;
        }

        const open_interval = is_ignore_workhour ? 0 : workhour?.open_interval ?? 0;
        const close_interval = is_ignore_workhour ? 86400 : workhour?.close_interval ?? 86400;

        const timeslots: Timeslot[] = [];
        for (
            let slot_start = start_of_day + open_interval;
            slot_start + service_duration <= start_of_day + close_interval;
            slot_start += timeslot_interval
        ) {
            const slot_end = slot_start + service_duration;

            const local_slot_start = moment.tz(slot_start * 1000, timezone_identifier).unix();
            const local_slot_end = moment.tz(slot_end * 1000, timezone_identifier).unix();

            const overlappingEvent = events.find(
                event => event.begin_at < local_slot_end && event.end_at > local_slot_start
            );

            if (!is_ignore_schedule && overlappingEvent) {
                continue;
            }

            timeslots.push({
                begin_at: slot_start,
                end_at: slot_end,
            });
        }

        dayTimetables.push({
            start_of_day,
            day_modifier,
            is_day_off: false,
            timeslots,
        });
    }

    return dayTimetables;
}
