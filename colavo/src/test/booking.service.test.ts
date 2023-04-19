import { getTimeSlots } from '../booking/booking.service';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

describe('BookingService', () => {
    describe('getTimeSlots', () => {
        it('should return a valid DayTimetable array for 20210509, 20210510, and 20210511', async () => {
            const result = await getTimeSlots(
                '20210509',
                'Asia/Seoul',
                3600,
                3,
                1800,
                true,
                false,
                [],
                []
            );

            expect(result).toBeDefined();
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBe(3);

            // Check for 2021-05-09
            const dayTimetable1 = result[0];
            expect(dayTimetable1.start_of_day).toBeDefined();
            expect(dayTimetable1.day_modifier).toBe(0);
            expect(dayTimetable1.is_day_off).toBeDefined();
            expect(dayTimetable1.timeslots).toBeDefined();

            // Check for 2021-05-10
            const dayTimetable2 = result[1];
            expect(dayTimetable2.start_of_day).toBeDefined();
            expect(dayTimetable2.day_modifier).toBe(1);
            expect(dayTimetable2.is_day_off).toBeDefined();
            expect(dayTimetable2.timeslots).toBeDefined();

            // Check for 2021-05-11
            const dayTimetable3 = result[2];
            expect(dayTimetable3.start_of_day).toBeDefined();
            expect(dayTimetable3.day_modifier).toBe(2);
            expect(dayTimetable3.is_day_off).toBeDefined();
            expect(dayTimetable3.timeslots).toBeDefined();
        });

        it('should return a DayTimetable array without overlapping events', async () => {
            const events = [
                {
                    begin_at: 1620482400, // 2021-05-09T01:00:00+09:00 (Asia/Seoul)
                    end_at: 1620486000, // 2021-05-09T02:00:00+09:00 (Asia/Seoul)
                    created_at: 0,
                    updated_at: 0,
                },
            ];


            const workhours = [
                {
                    is_day_off: false,
                    open_interval: 0,
                    close_interval: 86400,
                    weekday: 7,
                    key: '0',
                },
            ];

            const result = await getTimeSlots(
                '20210509',
                'Asia/Seoul',
                3600,
                1,
                1800,
                false,
                false,
                events,
                workhours
            );

            expect(result).toBeDefined();
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBe(1);

            const dayTimetable = result[0];
            expect(dayTimetable.timeslots).toBeDefined();
            expect(dayTimetable.timeslots.length).toBeGreaterThan(0);

            // Check that no timeslots overlap with the event
            dayTimetable.timeslots.forEach(slot => {
                expect(slot.begin_at).toBeGreaterThanOrEqual(events[0].end_at);
            });
        });

    });
});
