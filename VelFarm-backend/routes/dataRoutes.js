const express = require('express');
const auth = require('../middleware/authMiddleware');
const Device = require('../models/Device');
const Field = require('../models/Field');
const Crop = require('../models/Crop');
const Job = require('../models/Job');
const Finance = require('../models/Finance');
const HealthReport = require('../models/HealthReport');
const WeatherCache = require('../models/WeatherCache');
const Notification = require('../models/Notification');
const Activity = require('../models/Activity');
const AppLog = require('../models/AppLog');
const Settings = require('../models/Settings');

const router = express.Router();

// Helper to attach userId to payloads
const withUser = (req, body = {}) => ({ ...body, userId: req.user.userId });

// Devices
router.post('/devices', auth, async (req, res) => {
  try { const doc = await Device.create(withUser(req, req.body)); res.status(201).json({ success: true, device: doc }); }
  catch (e) { res.status(400).json({ success: false, message: e.message }); }
});
router.get('/devices', auth, async (req, res) => {
  const { fieldId, page = 1, pageSize = 100, sortBy = 'createdAt', order = 'desc' } = req.query;
  const filter = { userId: req.user.userId, ...(fieldId && { fieldId }) };
  const sort = { [sortBy]: order === 'asc' ? 1 : -1 };
  const docs = await Device.find(filter)
    .sort(sort)
    .skip((+page - 1) * +pageSize)
    .limit(+pageSize);
  const total = await Device.countDocuments(filter);
  res.json({ success: true, devices: docs, total });
});
router.get('/devices/:id', auth, async (req, res) => {
  const doc = await Device.findOne({ _id: req.params.id, userId: req.user.userId });
  if (!doc) return res.status(404).json({ success: false, message: 'Device not found' });
  res.json({ success: true, device: doc });
});
router.put('/devices/:id', auth, async (req, res) => {
  const doc = await Device.findOneAndUpdate({ _id: req.params.id, userId: req.user.userId }, req.body, { new: true });
  if (!doc) return res.status(404).json({ success: false, message: 'Device not found' });
  res.json({ success: true, device: doc });
});
router.delete('/devices/:id', auth, async (req, res) => {
  const doc = await Device.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
  if (!doc) return res.status(404).json({ success: false, message: 'Device not found' });
  res.json({ success: true });
});

// Fields
router.post('/fields', auth, async (req, res) => {
  try { const doc = await Field.create(withUser(req, req.body)); res.status(201).json({ success: true, field: doc }); }
  catch (e) { res.status(400).json({ success: false, message: e.message }); }
});
router.get('/fields', auth, async (req, res) => {
  const { page = 1, pageSize = 100, sortBy = 'createdAt', order = 'desc' } = req.query;
  const filter = { userId: req.user.userId };
  const sort = { [sortBy]: order === 'asc' ? 1 : -1 };
  const docs = await Field.find(filter)
    .sort(sort)
    .skip((+page - 1) * +pageSize)
    .limit(+pageSize);
  const total = await Field.countDocuments(filter);
  res.json({ success: true, fields: docs, total });
});
router.get('/fields/:id', auth, async (req, res) => {
  const doc = await Field.findOne({ _id: req.params.id, userId: req.user.userId });
  if (!doc) return res.status(404).json({ success: false, message: 'Field not found' });
  res.json({ success: true, field: doc });
});
router.put('/fields/:id', auth, async (req, res) => {
  const doc = await Field.findOneAndUpdate({ _id: req.params.id, userId: req.user.userId }, req.body, { new: true });
  if (!doc) return res.status(404).json({ success: false, message: 'Field not found' });
  res.json({ success: true, field: doc });
});
router.delete('/fields/:id', auth, async (req, res) => {
  const doc = await Field.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
  if (!doc) return res.status(404).json({ success: false, message: 'Field not found' });
  res.json({ success: true });
});

// Crops
router.post('/crops', auth, async (req, res) => {
  try { const doc = await Crop.create(withUser(req, req.body)); res.status(201).json({ success: true, crop: doc }); }
  catch (e) { res.status(400).json({ success: false, message: e.message }); }
});
router.get('/crops', auth, async (req, res) => {
  const { fieldId, page = 1, pageSize = 100, sortBy = 'createdAt', order = 'desc' } = req.query;
  const filter = { userId: req.user.userId, ...(fieldId && { fieldId }) };
  const sort = { [sortBy]: order === 'asc' ? 1 : -1 };
  const docs = await Crop.find(filter)
    .sort(sort)
    .skip((+page - 1) * +pageSize)
    .limit(+pageSize);
  const total = await Crop.countDocuments(filter);
  res.json({ success: true, crops: docs, total });
});
router.get('/crops/:id', auth, async (req, res) => {
  const doc = await Crop.findOne({ _id: req.params.id, userId: req.user.userId });
  if (!doc) return res.status(404).json({ success: false, message: 'Crop not found' });
  res.json({ success: true, crop: doc });
});
router.put('/crops/:id', auth, async (req, res) => {
  const doc = await Crop.findOneAndUpdate({ _id: req.params.id, userId: req.user.userId }, req.body, { new: true });
  if (!doc) return res.status(404).json({ success: false, message: 'Crop not found' });
  res.json({ success: true, crop: doc });
});
router.delete('/crops/:id', auth, async (req, res) => {
  const doc = await Crop.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
  if (!doc) return res.status(404).json({ success: false, message: 'Crop not found' });
  res.json({ success: true });
});

// Jobs
router.post('/jobs', auth, async (req, res) => {
  try { const doc = await Job.create(withUser(req, req.body)); res.status(201).json({ success: true, job: doc }); }
  catch (e) { res.status(400).json({ success: false, message: e.message }); }
});
router.get('/jobs', auth, async (req, res) => {
  const { fieldId, status, page = 1, pageSize = 100, sortBy = 'createdAt', order = 'desc' } = req.query;
  const filter = { userId: req.user.userId, ...(fieldId && { fieldId }), ...(status && { status }) };
  const sort = { [sortBy]: order === 'asc' ? 1 : -1 };
  const docs = await Job.find(filter)
    .sort(sort)
    .skip((+page - 1) * +pageSize)
    .limit(+pageSize);
  const total = await Job.countDocuments(filter);
  res.json({ success: true, jobs: docs, total });
});
router.get('/jobs/:id', auth, async (req, res) => {
  const doc = await Job.findOne({ _id: req.params.id, userId: req.user.userId });
  if (!doc) return res.status(404).json({ success: false, message: 'Job not found' });
  res.json({ success: true, job: doc });
});
router.patch('/jobs/:id/status', auth, async (req, res) => {
  const { status } = req.body;
  const doc = await Job.findOneAndUpdate({ _id: req.params.id, userId: req.user.userId }, { status }, { new: true });
  if (!doc) return res.status(404).json({ success: false, message: 'Job not found' });
  res.json({ success: true, job: doc });
});
router.put('/jobs/:id', auth, async (req, res) => {
  const doc = await Job.findOneAndUpdate({ _id: req.params.id, userId: req.user.userId }, req.body, { new: true });
  if (!doc) return res.status(404).json({ success: false, message: 'Job not found' });
  res.json({ success: true, job: doc });
});
router.delete('/jobs/:id', auth, async (req, res) => {
  const doc = await Job.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
  if (!doc) return res.status(404).json({ success: false, message: 'Job not found' });
  res.json({ success: true });
});

// Finance
router.post('/finance', auth, async (req, res) => {
  try { const doc = await Finance.create(withUser(req, req.body)); res.status(201).json({ success: true, entry: doc }); }
  catch (e) { res.status(400).json({ success: false, message: e.message }); }
});
router.get('/finance', auth, async (req, res) => {
  const docs = await Finance.find({ userId: req.user.userId }).sort({ date: -1 });
  res.json({ success: true, entries: docs });
});
router.get('/finance/summary', auth, async (req, res) => {
  const entries = await Finance.find({ userId: req.user.userId });
  const income = entries.filter(e => e.type === 'income').reduce((a,b)=>a+b.amount,0);
  const expense = entries.filter(e => e.type === 'expense').reduce((a,b)=>a+b.amount,0);
  res.json({ success: true, income, expense, balance: income - expense });
});
// Extra summaries
router.get('/jobs/summary', auth, async (req, res) => {
  const { fieldId } = req.query;
  const filter = { userId: req.user.userId, ...(fieldId && { fieldId }) };
  const jobs = await Job.find(filter);
  const total = jobs.length;
  const completed = jobs.filter(j => (j.status||'').toLowerCase() === 'completed').length;
  const inProgress = jobs.filter(j => ['in_progress','in-progress'].includes((j.status||'').toLowerCase())).length;
  const scheduled = jobs.filter(j => (j.status||'').toLowerCase() === 'scheduled').length;
  res.json({ success: true, total, completed, inProgress, scheduled });
});
router.get('/crops/summary', auth, async (req, res) => {
  const { fieldId } = req.query;
  const filter = { userId: req.user.userId, ...(fieldId && { fieldId }) };
  const crops = await Crop.find(filter);
  res.json({ success: true, total: crops.length });
});
router.get('/devices/summary', auth, async (req, res) => {
  const devices = await Device.find({ userId: req.user.userId });
  const total = devices.length;
  const byStatus = devices.reduce((acc, d) => { const k = (d.status||'unknown').toLowerCase(); acc[k]=(acc[k]||0)+1; return acc; }, {});
  res.json({ success: true, total, byStatus });
});

// Health Reports
router.post('/health-reports', auth, async (req, res) => {
  try { const doc = await HealthReport.create(withUser(req, req.body)); res.status(201).json({ success: true, report: doc }); }
  catch (e) { res.status(400).json({ success: false, message: e.message }); }
});
router.get('/health-reports', auth, async (req, res) => {
  const { fieldId, page = 1, pageSize = 100, sortBy = 'createdAt', order = 'desc' } = req.query;
  const filter = { userId: req.user.userId, ...(fieldId && { fieldId }) };
  const sort = { [sortBy]: order === 'asc' ? 1 : -1 };
  const docs = await HealthReport.find(filter)
    .sort(sort)
    .skip((+page - 1) * +pageSize)
    .limit(+pageSize);
  const total = await HealthReport.countDocuments(filter);
  res.json({ success: true, reports: docs, total });
});
router.get('/health-reports/:id', auth, async (req, res) => {
  const doc = await HealthReport.findOne({ _id: req.params.id, userId: req.user.userId });
  if (!doc) return res.status(404).json({ success: false, message: 'Health report not found' });
  res.json({ success: true, report: doc });
});

// Weather Cache
router.get('/weather', auth, async (req, res) => {
  const { location } = req.query;
  if (!location) return res.status(400).json({ success: false, message: 'location is required' });
  const cache = await WeatherCache.findOne({ location });
  const valid = cache && cache.ttl > new Date();
  res.json({ success: true, cached: !!valid, data: valid ? cache.data : null });
});
router.post('/weather', auth, async (req, res) => {
  const { location, data, ttlMinutes } = req.body;
  if (!location || !data) return res.status(400).json({ success: false, message: 'location and data are required' });
  const ttl = new Date(Date.now() + (ttlMinutes || 60) * 60000);
  const doc = await WeatherCache.findOneAndUpdate({ location }, { userId: req.user.userId, location, data, ttl }, { new: true, upsert: true });
  res.status(201).json({ success: true, cache: doc });
});

// Notifications
router.post('/notifications', auth, async (req, res) => {
  const doc = await Notification.create(withUser(req, req.body));
  res.status(201).json({ success: true, notification: doc });
});
router.get('/notifications', auth, async (req, res) => {
  const { limit = 100 } = req.query;
  const docs = await Notification.find({ userId: req.user.userId }).sort({ createdAt: -1 }).limit(+limit);
  res.json({ success: true, notifications: docs });
});
router.put('/notifications/:id/read', auth, async (req, res) => {
  const doc = await Notification.findOneAndUpdate({ _id: req.params.id, userId: req.user.userId }, { read: true }, { new: true });
  if (!doc) return res.status(404).json({ success: false, message: 'Notification not found' });
  res.json({ success: true, notification: doc });
});

// Activities
router.post('/activities', auth, async (req, res) => {
  const doc = await Activity.create(withUser(req, req.body));
  res.status(201).json({ success: true, activity: doc });
});
router.get('/activities/recent', auth, async (req, res) => {
  const { limit = 20 } = req.query;
  const docs = await Activity.find({ userId: req.user.userId }).sort({ createdAt: -1 }).limit(+limit);
  res.json({ success: true, activities: docs });
});

// App logs
router.post('/logs', async (req, res) => {
  const doc = await AppLog.create({ level: req.body.level || 'info', message: req.body.message, meta: req.body.meta });
  res.status(201).json({ success: true, log: doc });
});
router.get('/logs/recent', auth, async (req, res) => {
  const { limit = 50 } = req.query;
  const docs = await AppLog.find({}).sort({ createdAt: -1 }).limit(+limit);
  res.json({ success: true, logs: docs });
});

// Settings (per user)
router.get('/settings', auth, async (req, res) => {
  const set = await Settings.findOne({ userId: req.user.userId });
  res.json({ success: true, settings: set || null });
});
router.post('/settings', auth, async (req, res) => {
  const set = await Settings.findOneAndUpdate(
    { userId: req.user.userId },
    { ...req.body, userId: req.user.userId },
    { upsert: true, new: true }
  );
  res.status(201).json({ success: true, settings: set });
});

module.exports = router;


