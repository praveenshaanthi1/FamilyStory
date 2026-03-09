const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/family-story';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection failed:', err));

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ── SCHEMAS ──

// Memory Schema
const memorySchema = new mongoose.Schema({
  date: { type: String, required: true },
  title: { type: String, required: true },
  desc: { type: String, default: '' },
  doodle: { type: String, default: 'photo' },
  photo: { type: String, default: null }, // Base64 string
  sortKey: { type: String, required: true },
  isAuto: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Settings Schema
const settingSchema = new mongoose.Schema({
  key: { type: String, primary: true, required: true },
  value: { type: String, default: null },
  updatedAt: { type: Date, default: Date.now }
});

const Memory = mongoose.model('Memory', memorySchema);
const Setting = mongoose.model('Setting', settingSchema);

// ── API ENDPOINTS ──

// Get all memories
app.get('/api/memories', async (req, res) => {
  try {
    const memories = await Memory.find().sort({ sortKey: 1 });
    res.json(memories);
  } catch (err) {
    console.error('Error fetching memories:', err);
    res.status(500).json({ error: 'Failed to fetch memories' });
  }
});

// Get a single memory
app.get('/api/memories/:id', async (req, res) => {
  try {
    const memory = await Memory.findById(req.params.id);
    if (!memory) {
      return res.status(404).json({ error: 'Memory not found' });
    }
    res.json(memory);
  } catch (err) {
    console.error('Error fetching memory:', err);
    res.status(500).json({ error: 'Failed to fetch memory' });
  }
});

// Create a new memory
app.post('/api/memories', async (req, res) => {
  try {
    const { date, title, desc, doodle, photo, sortKey, isAuto } = req.body;

    if (!date || !title) {
      return res.status(400).json({ error: 'Date and title are required' });
    }

    const memory = new Memory({
      date,
      title,
      desc: desc || '',
      doodle: doodle || 'photo',
      photo: photo || null,
      sortKey,
      isAuto: isAuto ? 1 : 0
    });

    const saved = await memory.save();
    res.json({ id: saved._id, message: 'Memory created successfully' });
  } catch (err) {
    console.error('Error creating memory:', err);
    res.status(500).json({ error: 'Failed to create memory' });
  }
});

// Update a memory
app.put('/api/memories/:id', async (req, res) => {
  try {
    const { date, title, desc, doodle, photo, sortKey, isAuto } = req.body;

    if (!date || !title) {
      return res.status(400).json({ error: 'Date and title are required' });
    }

    const memory = await Memory.findByIdAndUpdate(
      req.params.id,
      {
        date,
        title,
        desc: desc || '',
        doodle: doodle || 'photo',
        photo: photo || null,
        sortKey,
        isAuto: isAuto ? 1 : 0,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!memory) {
      return res.status(404).json({ error: 'Memory not found' });
    }

    res.json({ message: 'Memory updated successfully' });
  } catch (err) {
    console.error('Error updating memory:', err);
    res.status(500).json({ error: 'Failed to update memory' });
  }
});

// Delete a memory
app.delete('/api/memories/:id', async (req, res) => {
  try {
    const memory = await Memory.findByIdAndDelete(req.params.id);

    if (!memory) {
      return res.status(404).json({ error: 'Memory not found' });
    }

    res.json({ message: 'Memory deleted successfully' });
  } catch (err) {
    console.error('Error deleting memory:', err);
    res.status(500).json({ error: 'Failed to delete memory' });
  }
});

// Save frame photo
app.post('/api/settings/framePhoto', async (req, res) => {
  try {
    const { value } = req.body;

    if (!value) {
      await Setting.deleteOne({ key: 'framePhoto' });
      return res.json({ message: 'Frame photo removed' });
    }

    await Setting.findOneAndUpdate(
      { key: 'framePhoto' },
      { value, updatedAt: new Date() },
      { upsert: true }
    );

    res.json({ message: 'Frame photo saved' });
  } catch (err) {
    console.error('Error saving frame photo:', err);
    res.status(500).json({ error: 'Failed to save frame photo' });
  }
});

// Get frame photo
app.get('/api/settings/framePhoto', async (req, res) => {
  try {
    const setting = await Setting.findOne({ key: 'framePhoto' });
    res.json({ value: setting ? setting.value : null });
  } catch (err) {
    console.error('Error fetching frame photo:', err);
    res.status(500).json({ error: 'Failed to fetch frame photo' });
  }
});

// Serve the HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
