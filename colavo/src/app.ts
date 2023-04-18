import express, { Request, Response } from 'express';
import bookingRouter from './booking/booking.route';

const app = express();
const port = 8000;

// Middleware
app.use(express.json());

// Routes
app.use('/getTimeSlots', bookingRouter);

// Default Route
app.get('/', (req: Request, res: Response) => {
    res.send('Hello World!');
});

// Start the server
app.listen(port, () => {
    console.log(`Server is listening on http://localhost:${port}`);
});
