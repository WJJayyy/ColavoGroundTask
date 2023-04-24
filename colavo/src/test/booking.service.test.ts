import { getTimeSlots, Event, Workhour } from '../booking/booking.service';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import workhours from '../../workhours.json';

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

            result.forEach(dayTimetable => {
                dayTimetable.timeslots.forEach(slot => {
                    if (slot.begin_at < events[0].end_at) {
                        expect(slot.end_at).toBeLessThanOrEqual(events[0].begin_at);
                    } else {
                        expect(slot.begin_at).toBeGreaterThanOrEqual(events[0].end_at);
                    }
                });
            });
        });

        // Step 3: Test the API with is_ignore_workhour set to false
        it('should return a DayTimetable array with Timeslots that do not overlap Workhours', async () => {
            const events: Event[] = [];
            const timeSlotInterval = 1800; // 30 minutes

            const result = await getTimeSlots('20210509', 'Asia/Seoul', 3600, 1, timeSlotInterval, false, false, events, workhours);

            result.forEach((dayTimetable) => {
                dayTimetable.timeslots.forEach((timeSlot) => {
                    let insideWorkhour = false;
                    workhours.forEach((workHour) => {
                        if (workHour.weekday === (dayTimetable.start_of_day + 3) % 7) {
                            const openTime = dayjs.unix(dayTimetable.start_of_day).tz('Asia/Seoul').add(workHour.open_interval, 'second').unix();
                            const closeTime = dayjs.unix(dayTimetable.start_of_day).tz('Asia/Seoul').add(workHour.close_interval, 'second').unix();

                            const localTimeSlotBegin = dayjs.unix(timeSlot.begin_at).tz('Asia/Seoul').unix(); // timeSlot 시작 시간을 로컬 시간대로 변환
                            const localTimeSlotEnd = dayjs.unix(timeSlot.end_at).tz('Asia/Seoul').unix(); // timeSlot 종료 시간을 로컬 시간대로 변환

                            if (localTimeSlotBegin >= openTime && localTimeSlotEnd <= closeTime) {
                                insideWorkhour = true;
                            }
                        };
                    });
                    if (!insideWorkhour) {
                        console.log('Failed timeslot:', dayjs.unix(timeSlot.begin_at).tz('Asia/Seoul').format());
                        console.log('DayTimetable start_of_day:', dayjs.unix(dayTimetable.start_of_day).tz('Asia/Seoul').format());
                        console.log('Weekday:', (dayTimetable.start_of_day % 7) + 1);
                    }
                    expect(insideWorkhour).toBe(true);
                });
            });
        });
    });
});