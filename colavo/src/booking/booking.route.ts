import express, { Request, Response } from 'express';
import { getTimeSlots } from './booking.service';
import events from '../../events.json';
import workhours from '../../workhours.json';

const router = express.Router();

router.post('/getTimeSlots', async (req: Request, res: Response) => {
    console.log(req.body);
    console.log('Request received at /getTimeSlots');
    const {
        start_day_identifier,
        timezone_identifier,
        service_duration,
        days,
        timeslot_interval,
        is_ignore_schedule,
        is_ignore_workhour,
    } = req.body;

    try {
        const result = await getTimeSlots(
            start_day_identifier,
            timezone_identifier,
            service_duration,
            days,
            timeslot_interval,
            is_ignore_schedule,
            is_ignore_workhour,
            events as any,
            workhours as any
        );
        res.json(result);
    } catch (err: unknown) {
        if (err instanceof Error) {
            res.status(500).json({ error: err.message });
        } else {
            res.status(500).json({ error: 'An unknown error occurred.' });
        }
    }
});

export default router;
