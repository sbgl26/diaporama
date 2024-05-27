const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = 3000;

mongoose.connect('mongodb://localhost:27017/diaporama', { useNewUrlParser: true, useUnifiedTopology: true });

const fileSchema = new mongoose.Schema({
  filename: String,
  filepath: String,
  filetype: String,
});

const File = mongoose.model('File', fileSchema);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

app.use('/uploads', express.static('uploads'));
app.use(express.static('public'));

app.post('/upload', upload.single('file'), (req, res) => {
  const file = new File({
    filename: req.file.filename,
    filepath: `/uploads/${req.file.filename}`,
    filetype: req.file.mimetype,
  });

  file.save().then(() => {
    io.emit('newFile', file); // Notify clients about the new file
    res.status(201).send('File uploaded successfully');
  }).catch(err => res.status(400).send('Error uploading file'));
});

app.get('/files', (req, res) => {
  File.find().then(files => res.json(files));
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});