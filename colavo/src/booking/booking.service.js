"use strict";
exports.__esModule = true;
exports.BookingService = void 0;
var fs_1 = require("fs");
var path_1 = require("path");
var moment_timezone_1 = require("moment-timezone");
var BookingService = /** @class */ (function () {
    function BookingService() {
        var workhoursPath = (0, path_1.join)(process.cwd(), 'colavo', 'workhours.json');
        var eventsPath = (0, path_1.join)(process.cwd(), 'colavo', 'events.json');
        this.workhoursData = JSON.parse((0, fs_1.readFileSync)(workhoursPath, 'utf-8'));
        this.eventsData = JSON.parse((0, fs_1.readFileSync)(eventsPath, 'utf-8'));
    }
    BookingService.prototype.getTimeSlots = function (startDayIdentifier, timezoneIdentifier, serviceDuration, days, timeslotInterval, isIgnoreSchedule, isIgnoreWorkhour) {
        if (days === void 0) { days = 1; }
        if (timeslotInterval === void 0) { timeslotInterval = 30; }
        var timezones = moment_timezone_1["default"].tz.names();
        if (!timezones.includes(timezoneIdentifier)) {
            throw new Error("Invalid timezone identifier: ".concat(timezoneIdentifier));
        }
        var workhours = this.workhoursData[timezoneIdentifier];
        var startDate = (0, moment_timezone_1["default"])(startDayIdentifier, 'YYYYMMDD');
        var endDate = startDate.clone().add(days, 'day');
        var response = [];
        for (var i = 0; i < endDate.diff(startDate, 'day'); i++) {
            var currentDay = startDate.clone().add(i, 'day');
            var dayTimetable = {
                start_of_day: currentDay.unix(),
                day_modifier: 0,
                is_day_off: false,
                timeslots: []
            };
            var workday = workhours[currentDay.format('dddd').toLowerCase()];
            if (workday.length > 0 && !workday[0].is_day_off) {
                var openInterval = workday[0].open_interval;
                var closeInterval = workday[workday.length - 1].close_interval;
                for (var startHour = openInterval; startHour + serviceDuration <= closeInterval; startHour += timeslotInterval) {
                    var endHour = startHour + serviceDuration;
                    var timeSlot = {
                        begin_at: currentDay.clone().set('hour', startHour).unix(),
                        end_at: currentDay.clone().set('hour', endHour).unix()
                    };
                    dayTimetable.timeslots.push(timeSlot);
                }
            }
            else {
                dayTimetable.is_day_off = true;
            }
            response.push(dayTimetable);
        }
        return response;
    };
    return BookingService;
}());
exports.BookingService = BookingService;
