# Family Story App 🌸

A beautiful, interactive family timeline web application with persistent backend database storage. Built with Node.js, Express, and SQLite.

## Features

- ✨ Beautiful responsive timeline interface
- 📸 Support for memory photos (base64 stored in database)
- 💾 Persistent SQLite database
- 🔄 Real-time sync across all devices
- 📱 Mobile-friendly design
- ✏️ Edit, add, and delete memories
- 🎨 Animated petal background effects
- 👨‍👩‍👧‍👦 Support for yearly recurring events (birthdays, anniversaries)

## Project Structure

```
.
├── server.js              # Express server & API endpoints
├── package.json           # Node dependencies
├── Procfile              # Heroku deployment config
├── public/
│   └── index.html        # Frontend application
└── memories.db           # SQLite database (created on first run)
```

## Local Development

### Prerequisites
- Node.js 14+ 
- npm or yarn

### Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Start the server:**
```bash
npm start
```

The app will be available at `http://localhost:5000`

3. **Development mode with auto-reload:**
```bash
npm run dev
```
(Requires nodemon: `npm install --save-dev nodemon`)

## API Endpoints

### Memories
- `GET /api/memories` - Get all memories
- `GET /api/memories/:id` - Get a single memory
- `POST /api/memories` - Create a new memory
- `PUT /api/memories/:id` - Update a memory
- `DELETE /api/memories/:id` - Delete a memory

### Settings
- `POST /api/settings/framePhoto` - Save frame photo
- `GET /api/settings/framePhoto` - Get frame photo

## Deployment

### Heroku Deployment

1. **Create a Heroku app:**
```bash
heroku create your-app-name
```

2. **Deploy code:**
```bash
git push heroku main
```

3. **View logs:**
```bash
heroku logs --tail
```

### Other Cloud Platforms

#### Railway
1. Connect your GitHub repo
2. Select the repository
3. Railway will auto-detect Node.js
4. Set environment variables if needed
5. Deploy!

#### Render
1. Create new Web Service on Render
2. Connect GitHub repository
3. Build command: `npm install`
4. Start command: `node server.js`
5. Deploy!

#### Vercel (with serverless functions)
Not recommended for this app as it uses SQLite which requires persistent storage.

### Environment Variables
- `PORT` - Server port (default: 5000)

## Database

The app uses SQLite with two tables:

### memories table
```sql
id (PRIMARY KEY)
date
title
desc
doodle
photo (BLOB)
sortKey
isAuto
createdAt
updatedAt
```

### settings table
```sql
key (PRIMARY KEY)
value
updatedAt
```

## API Request Examples

### Create a Memory
```bash
curl -X POST http://localhost:5000/api/memories \
  -H "Content-Type: application/json" \
  -d '{
    "date": "21 Oct 2021",
    "title": "Special Day",
    "desc": "An amazing memory",
    "doodle": "photo",
    "photo": "base64_encoded_image_string",
    "sortKey": "2021-10-21"
  }'
```

### Update a Memory
```bash
curl -X PUT http://localhost:5000/api/memories/1 \
  -H "Content-Type: application/json" \
  -d '{
    "date": "21 Oct 2021",
    "title": "Special Day (Updated)",
    "desc": "Updated description",
    "doodle": "photo",
    "sortKey": "2021-10-21"
  }'
```

### Delete a Memory
```bash
curl -X DELETE http://localhost:5000/api/memories/1
```

## Troubleshooting

### Database file not found
The database is automatically created on first run. Check that the `server.js` location has write permissions.

### Port already in use
Change the port by setting environment variable:
```bash
PORT=3000 npm start
```

### CORS errors
The app includes CORS middleware. If you're accessing from a different origin, it should work. Check browser console for details.

## Performance Notes

- Photo storage uses base64 encoding - keep photo file sizes reasonable (under 1MB recommended)
- SQLite is suitable for small to medium datasets
- For large datasets or high concurrency, consider migrating to PostgreSQL or MongoDB

## Future Enhancements

- [ ] User authentication
- [ ] Multiple family timelines
- [ ] Photo gallery view
- [ ] Export to PDF
- [ ] Backup and restore functionality
- [ ] Advanced search and filtering

## License

MIT License - feel free to use this for personal projects!

## Support

For issues or questions, check the browser console (F12) and server logs for error messages.
