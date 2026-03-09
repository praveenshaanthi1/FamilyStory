const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Initialize SQLite Database
const dbPath = path.join(__dirname, 'memories.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection failed:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Database initialization
function initializeDatabase() {
  db.serialize(() => {
    // Create memories table
    db.run(`
      CREATE TABLE IF NOT EXISTS memories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        title TEXT NOT NULL,
        desc TEXT,
        doodle TEXT,
        photo LONGBLOB,
        sortKey TEXT NOT NULL,
        isAuto INTEGER DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create settings table
    db.run(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Database tables initialized');
  });
}

// ── API ENDPOINTS ──

// Get all memories
app.get('/api/memories', (req, res) => {
  db.all('SELECT * FROM memories ORDER BY sortKey ASC', (err, rows) => {
    if (err) {
      console.error('Error fetching memories:', err);
      return res.status(500).json({ error: 'Failed to fetch memories' });
    }
    // Convert BLOB photo back to base64 for client
    const memories = rows.map(m => ({
      ...m,
      photo: m.photo ? m.photo.toString('base64') : null
    }));
    res.json(memories);
  });
});

// Get a single memory
app.get('/api/memories/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM memories WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Error fetching memory:', err);
      return res.status(500).json({ error: 'Failed to fetch memory' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Memory not found' });
    }
    res.json(row);
  });
});

// Create a new memory
app.post('/api/memories', (req, res) => {
  const { date, title, desc, doodle, photo, sortKey, isAuto } = req.body;

  if (!date || !title) {
    return res.status(400).json({ error: 'Date and title are required' });
  }

  const photoBuffer = photo ? Buffer.from(photo, 'base64') : null;

  db.run(
    `INSERT INTO memories (date, title, desc, doodle, photo, sortKey, isAuto)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [date, title, desc || '', doodle || 'photo', photoBuffer, sortKey, isAuto ? 1 : 0],
    function(err) {
      if (err) {
        console.error('Error creating memory:', err);
        return res.status(500).json({ error: 'Failed to create memory' });
      }
      res.json({ id: this.lastID, message: 'Memory created successfully' });
    }
  );
});

// Update a memory
app.put('/api/memories/:id', (req, res) => {
  const { id } = req.params;
  const { date, title, desc, doodle, photo, sortKey, isAuto } = req.body;

  if (!date || !title) {
    return res.status(400).json({ error: 'Date and title are required' });
  }

  const photoBuffer = photo ? Buffer.from(photo, 'base64') : null;

  db.run(
    `UPDATE memories 
     SET date = ?, title = ?, desc = ?, doodle = ?, photo = ?, sortKey = ?, isAuto = ?, updatedAt = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [date, title, desc || '', doodle || 'photo', photoBuffer, sortKey, isAuto ? 1 : 0, id],
    function(err) {
      if (err) {
        console.error('Error updating memory:', err);
        return res.status(500).json({ error: 'Failed to update memory' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Memory not found' });
      }
      res.json({ message: 'Memory updated successfully' });
    }
  );
});

// Delete a memory
app.delete('/api/memories/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM memories WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('Error deleting memory:', err);
      return res.status(500).json({ error: 'Failed to delete memory' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Memory not found' });
    }
    res.json({ message: 'Memory deleted successfully' });
  });
});

// Save frame photo
app.post('/api/settings/framePhoto', (req, res) => {
  const { value } = req.body;

  if (!value) {
    db.run('DELETE FROM settings WHERE key = ?', ['framePhoto'], (err) => {
      if (err) {
        console.error('Error removing frame photo:', err);
        return res.status(500).json({ error: 'Failed to remove frame photo' });
      }
      res.json({ message: 'Frame photo removed' });
    });
  } else {
    db.run(
      'INSERT OR REPLACE INTO settings (key, value, updatedAt) VALUES (?, ?, CURRENT_TIMESTAMP)',
      ['framePhoto', value],
      (err) => {
        if (err) {
          console.error('Error saving frame photo:', err);
          return res.status(500).json({ error: 'Failed to save frame photo' });
        }
        res.json({ message: 'Frame photo saved' });
      }
    );
  }
});

// Get frame photo
app.get('/api/settings/framePhoto', (req, res) => {
  db.get('SELECT value FROM settings WHERE key = ?', ['framePhoto'], (err, row) => {
    if (err) {
      console.error('Error fetching frame photo:', err);
      return res.status(500).json({ error: 'Failed to fetch frame photo' });
    }
    res.json({ value: row ? row.value : null });
  });
});

// Serve the HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) console.error('Error closing database:', err);
    process.exit(0);
  });
});
