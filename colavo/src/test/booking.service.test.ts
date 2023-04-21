import { getTimeSlots } from '../booking/booking.service';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { Event } from '../booking/booking.service';

dayjs.extend(timezone);
dayjs.extend(utc);

describe('BookingService', () => {
    describe('getTimeSlots', () => {
        // Step 1: Test the API with provided parameters
        it('should return a valid DayTimetable array for given parameters', async () => {
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
        });

        // Step 2: Test the API with is_ignore_schedule set to false
        it('should return a DayTimetable array with Timeslots that do not overlap events', async () => {
            const events = [
                {
                    begin_at: 1620482400, // 2021-05-09T01:00:00+09:00 (Asia/Seoul)
                    end_at: 1620486000, // 2021-05-09T02:00:00+09:00 (Asia/Seoul)
                    created_at: 0,
                    updated_at: 0,
                },
            ];

            const result = await getTimeSlots(
                '20210509',
                'Asia/Seoul',
                3600,
                3,
                1800,
                false,
                false,
                events,
                []
            );

            expect(result).toBeDefined();
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBe(3);

            result.forEach(dayTimetable => {
                dayTimetable.timeslots.forEach(slot => {
                    expect(slot.begin_at).toBeGreaterThanOrEqual(events[0].end_at);
                });
            });
        });

        // Step 3: Test the API with is_ignore_workhour set to false
        it('should return a DayTimetable array with Timeslots that do not overlap Workhours', async () => {
            const service_duration = 3600;
            const workhours = [
                {
                    is_day_off: false,
                    open_interval: 0,
                    close_interval: 3 * 3600,
                    weekday: 0, // Sunday is 0
                    key: '0',
                },
            ];

            const result = await getTimeSlots(
                '20210509',
                'Asia/Seoul',
                service_duration,
                3,
                1800,
                false,
                false,
                [],
                workhours
            );

            expect(result).toBeDefined();
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBe(3);

            result.forEach(dayTimetable => {
                dayTimetable.timeslots.forEach(slot => {
                    const localBeginAt = dayjs(slot.begin_at * 1000).tz('Asia/Seoul');
                    const localEndAt = dayjs(slot.end_at * 1000).tz('Asia/Seoul');
                    const startOfDay = dayjs(dayTimetable.start_of_day * 1000).tz('Asia/Seoul');
                    const openTime = startOfDay.add(workhours[0].open_interval, 'second').unix();
                    const closeTime = startOfDay.add(workhours[0].close_interval, 'second').unix();

                    expect(localBeginAt.unix()).toBeGreaterThanOrEqual(openTime);
                    expect(localEndAt.unix()).toBeLessThanOrEqual(closeTime + service_duration);
                });
            });
        });
    });
});