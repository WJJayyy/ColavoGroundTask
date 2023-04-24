import { Request, Response } from 'express';
import { getTimeSlots as getTimeSlotsService } from './booking.service';
import events from '../../events.json';
import workhours from '../../workhours.json';

export async function getTimeSlots(req: Request, res: Response): Promise<void> {
    try {
        const {
            start_day_identifier,
            timezone_identifier,
            service_duration,
            days = 1,
            timeslot_interval = 1800,
            is_ignore_schedule = false,
            is_ignore_workhour = false,
        } = req.body;

        const result = await getTimeSlotsService(
            start_day_identifier,
            timezone_identifier,
            service_duration,
            days,
            timeslot_interval,
            is_ignore_schedule,
            is_ignore_workhour,
            events,
            workhours
        );
        res.status(200).json(result);
    } catch (err) {
        if (err instanceof Error) {
            console.error(err);
            res.status(500).send(err.message);
        } else {
            res.status(500).send("An unknown error occurred.");
        }
    }
}

