const express = require('express'); const fs = require('fs'); const path = require('path');
const multer = require('multer'); const axios = require('axios');
const app = express(); app.use(express.json({ limit: '500mb' })); app.use(express.static('public'));
const uploadDir = path.join(__dirname, 'public/uploads'); const dataFile = path.join(__dirname, 'data.json');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({ destination: uploadDir, filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)) });
const upload = multer({ storage });

app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public/index.html')));
app.get('/api/data', (req, res) => {
    if (!fs.existsSync(dataFile)) return res.json({ sections: [], settings: {} });
    res.json(JSON.parse(fs.readFileSync(dataFile)));
});
app.post('/api/data', (req, res) => { fs.writeFileSync(dataFile, JSON.stringify(req.body, null, 2)); res.json({ success: true }); });
app.post('/api/upload', upload.single('media'), (req, res) => res.json({ url: '/uploads/' + req.file.filename }));
app.post('/api/apply', async (req, res) => {
    const { source, phone } = req.body;
    let db = JSON.parse(fs.readFileSync(dataFile));
    if (!db.settings?.telegramToken || !db.settings?.telegramChatId) return res.status(500).json({ error: 'TG Error' });
    try { await axios.post(`https://api.telegram.org/bot${db.settings.telegramToken}/sendMessage`, { chat_id: db.settings.telegramChatId, text: `🔥 *Новый лид!*\n📱 Телефон: ${phone}\n📍 Источник: ${source}`, parse_mode: 'Markdown' }); res.json({ success: true }); } catch (e) { res.status(500).json({ error: e.message }); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`\n🚀 САЙТ ЗАПУЩЕН: http://localhost:${PORT}\n🔐 АДМИН: http://localhost:${PORT}/admin\n`));
