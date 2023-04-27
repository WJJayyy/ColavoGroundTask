import express, { Request, Response } from 'express';
import { getTimeSlots } from './booking.controller';

const router = express.Router();

router.post('/getTimeSlots', getTimeSlots);

export default router;
