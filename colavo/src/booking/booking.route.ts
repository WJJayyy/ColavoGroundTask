import { Router } from 'express';
import { getTimeSlots } from './booking.controller';

const router = Router();

router.post('/getTimeSlots', async (req, res) => {
    try {
        const result = await getTimeSlots(req, res);
        res.status(200).json(result);
    } catch (err: any) {
        console.error(err);
        res.status(500).send(err.message);
    }
});

export default router;