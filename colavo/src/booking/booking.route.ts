import { Router } from 'express';
import { BookingController } from './booking.controller';

const bookingController = new BookingController();

export const BookingRoutes = {
    path: '/booking',
    router: Router()
        .post('/getTimeSlots', bookingController.getTimeSlots),
};
