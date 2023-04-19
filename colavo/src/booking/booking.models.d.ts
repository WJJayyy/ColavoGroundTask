export interface DayTimetable {
    start_of_day: number;
    day_modifier: number;
    is_day_off: boolean;
    timeslots: Timeslot[];
}
export interface Timeslot {
    begin_at: number;
    end_at: number;
    is_reserved?: boolean;
}
export type ResponseBody = DayTimetable[];
