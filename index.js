const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const axios = require('axios'); // Import axios
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:5173',  // Allow requests from your frontend
  methods: ['GET', 'POST', 'OPTIONS'],  // Allowed methods
  allowedHeaders: ['Content-Type', 'Authorization'],  // Allowed headers
}));

const SECRET_KEY = 'hyperverge_secret_key';
const APP_ID = '1pjk71';
const APP_KEY = 'sshfxkuemn558ohgb1v8';

// Authentication route (for JWT generation)
app.get('/auth', (req, res) => {
    const token = jwt.sign({ user: 'hyperverge' }, SECRET_KEY, { expiresIn: '30m' });
    res.json({ token });
});

app.post('/results', async (req, res) => {
    console.log('Webhook received:', req.body);
    const { transactionId } = req.body;

    if (!transactionId) {
        return res.status(400).json({ error: 'Transaction ID is required' });
    }

    console.log(`Fetching logs for Transaction ID: ${transactionId}`);

    try {
        const response = await axios.post('https://ind.idv.hyperverge.co/v1/link-kyc/results', {
            transactionId: transactionId,
        }, {
            headers: {
                'Content-Type': 'application/json',
                'appId': APP_ID,
                'appKey': APP_KEY,
                'transactionId': transactionId
            }
        });

        console.log('Logs API response:', response.data);
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error fetching logs:', error.message);

        // Log more detailed error information if available
        if (error.response) {
            console.error('Error Response:', error.response.data);
            res.status(500).json({
                error: 'Error fetching logs from HyperVerge API',
                message: error.response.data
            });
        } else {
            res.status(500).json({
                error: 'Error fetching logs from HyperVerge API',
                message: error.message
            });
        }
    }
});

// Output API route
app.post('/outputs', async (req, res) => {
    const { transactionId } = req.body;

    if (!transactionId) {
        return res.status(400).json({ error: 'Transaction ID is required' });
    }

    console.log(`Fetching outputs for Transaction ID: ${transactionId}`);

    try {
        const response = await axios.post('https://ind.idv.hyperverge.co/v1/output', {
            transactionId: transactionId
        }, {
            headers: {
                'Content-Type': 'application/json',
                'appId': APP_ID,
                'appKey': APP_KEY
            }
        });

        console.log('Output API response:', response.data);
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error fetching outputs:', error.message);
        // Include error response from API if available
        res.status(500).json({
            error: 'Error fetching outputs from HyperVerge API',
            message: error.response ? error.response.data : error.message
        });
    }
});


// Basic health check route
app.get('/', (req, res) => {
    res.send('HyperVerge Webhook Server is Running');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
