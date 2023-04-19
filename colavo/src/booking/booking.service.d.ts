import { DayTimetable } from './booking.models';
export type Events = Event[];
export type Workhours = Workhour[];
interface Event {
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
export declare function getTimeSlots(start_day_identifier: string, timezone_identifier: string, service_duration: number, days: number | undefined, timeslot_interval: number | undefined, is_ignore_schedule: boolean | undefined, is_ignore_workhour: boolean | undefined, events: Events, workhours: Workhours): Promise<DayTimetable[]>;
export {};
