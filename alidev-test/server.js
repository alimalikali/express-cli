import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';

import errorHandler from './middlewares/errorHandler.js';

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());

app.get('/', (req, res) => res.send('Hello World!'));

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
