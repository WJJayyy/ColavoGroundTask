import { DayTimetable, Timeslot } from './booking.models';
import dayjs from 'dayjs';

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
    const startDay = dayjs.tz(start_day_identifier, "YYYYMMDD", timezone_identifier);
    const dayTimetables: DayTimetable[] = [];

    for (let i = -1; i < days - 1; i++) {
        const currentDay = startDay.clone().add(i, 'days');
        const start_of_day = currentDay.clone().startOf('day').unix();
        const day_modifier = i;

        const weekday = currentDay.day() === 0 ? 1 : currentDay.day() + 1;
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

        const open_interval = is_ignore_workhour ? 0 : workhour?.open_interval ?? 0; //근무 시작시간
        const close_interval = is_ignore_workhour ? 86400 : workhour?.close_interval ?? 86400;

        const timeslots: Timeslot[] = [];

        const openTime = currentDay.clone().startOf('day').add(open_interval, 'second').unix(); // 작업시작시간(해당날짜의 시작시간 + 근무시작시간)
        const closeTime = currentDay.clone().startOf('day').add(close_interval, 'second').unix();

        for (let slot_start = openTime; slot_start + service_duration <= closeTime;) { // 예약시작시간
            const slot_end = slot_start + service_duration;

            const local_slot_start = dayjs.unix(slot_start).tz(timezone_identifier);
            const local_slot_end = dayjs.unix(slot_end).tz(timezone_identifier);

            const overlappingEvent = events.find(
                event => event.begin_at < local_slot_end.unix() && event.end_at > local_slot_start.unix()
            ); // 현재 예약 시간대와 겹치는 이벤트를 찾습니다.

            if (!is_ignore_schedule && overlappingEvent) {
                slot_start += timeslot_interval;
                continue;
            } // 겹치는 이벤트를 찾습니다.

            if (local_slot_start.unix() < openTime || local_slot_end.unix() > closeTime) {
                slot_start += timeslot_interval;
                continue;
            }

            timeslots.push({
                begin_at: local_slot_start.unix(),
                end_at: local_slot_end.unix(),
            });

            slot_start += timeslot_interval;
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


