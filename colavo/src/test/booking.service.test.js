"use strict";
exports.__esModule = true;
var booking_service_1 = require("../booking/booking.service");
describe('BookingService', function () {
    var bookingService;
    beforeEach(function () {
        bookingService = new booking_service_1.BookingService();
    });
    describe('getTimeSlots', function () {
        it('should return a valid DayTimetable array for valid input', function () {
            var result = bookingService.getTimeSlots('20210509', 'Asia/Seoul', 3600, 3, 1800, true, false);
            expect(result).toBeDefined();
            expect(Array.isArray(result)).toBe(true);
            var dayTimetable = result[0];
            expect(dayTimetable.start_of_day).toBeDefined();
            expect(dayTimetable.day_modifier).toBeDefined();
            expect(dayTimetable.is_day_off).toBeDefined();
            expect(dayTimetable.timeslots).toBeDefined();
        });
    });
});
