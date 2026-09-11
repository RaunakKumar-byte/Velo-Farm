const express = require('express');

const router = express.Router();

router.post('/analyze', async (req, res) => {
  try {
    const { inputs } = req.body;

    if (!inputs?.image) {
      return res.status(400).json({ message: 'Image input is required' });
    }

    const apiKey = process.env.ROBOFLOW_API_KEY;
    const workflowUrl = process.env.ROBOFLOW_WORKFLOW_URL;

    if (!apiKey || !workflowUrl) {
      return res.status(500).json({ message: 'Roboflow configuration is missing on the server' });
    }

    const response = await fetch(workflowUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: apiKey,
        inputs
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (error) {
    console.error('Disease detection proxy error:', error);
    res.status(500).json({
      message: error.message || 'Failed to analyze image'
    });
  }
});

module.exports = router;
