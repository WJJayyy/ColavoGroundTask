import { Router } from 'express';
import { BookingController } from './booking.controller';

const bookingController = new BookingController();

export const BookingRoutes = {
    path: '/booking',
    router: Router()
        .post('/getTimeSlots', async (req, res) => {
            try {
                const result = await bookingController.getTimeSlots(req, res);
                res.status(200).json(result);
            } catch (err: any) {
                console.error(err);
                res.status(500).send(err.message);
            }
        }),
};
