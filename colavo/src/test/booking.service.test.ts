import { BookingService } from '../booking/booking.service';

describe('BookingService', () => {
    let bookingService: BookingService;

    beforeEach(() => {
        bookingService = new BookingService();
    });

    describe('getTimeSlots', () => {
        it('should return a valid DayTimetable array for valid input', () => {
            const result = bookingService.getTimeSlots(
                '20210509',
                'Asia/Seoul',
                3600,
                3,
                1800,
                true,
                false,
            );

            expect(result).toBeDefined();
            expect(Array.isArray(result)).toBe(true);

            const dayTimetable = result[0];
            expect(dayTimetable?.start_of_day).toBeDefined();
            expect(dayTimetable.day_modifier).toBeDefined();
            expect(dayTimetable.is_day_off).toBeDefined();
            expect(dayTimetable.timeslots).toBeDefined();
        });
    });
});