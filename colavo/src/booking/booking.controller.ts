import { Request, Response } from 'express';
import { BookingService } from './booking.service';

export class BookingController {
    private readonly bookingService: BookingService;

    constructor() {
        this.bookingService = new BookingService();
    }

    public getTimeSlots = async (req: Request, res: Response): Promise<void> => {
        try {
            const requestBody = req.body;
            const result = this.bookingService.getTimeSlots(
                requestBody.start_day_identifier,
                requestBody.timezone_identifier,
                requestBody.service_duration,
                requestBody.days,
                requestBody.timeslot_interval,
                requestBody.is_ignore_schedule,
                requestBody.is_ignore_workhour,
            );
            res.status(200).json(result);
        } catch (err: any) {
            console.error(err);
            res.status(500).send(err.message);
        }
    };
}
