import express from 'express';
import bookingRoutes from './booking/booking.route';

const app = express();
const port = 8000;

app.use(express.json());

app.use('/', bookingRoutes);

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

