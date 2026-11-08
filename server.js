const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// مخزن مؤقت داخل الذاكرة لحفظ الحجوزات أثناء تشغيل السيرفر
let bookingsDb = [];

// مسار تسجيل حجز جديد
app.post('/api/v1/bookings', (req, res) => {
    const { shopId, customerName, customerPhone, appointmentTime } = req.body;
    
    if (!shopId || !customerName || !customerPhone || !appointmentTime) {
        return res.status(400).json({ success: false, message: 'جميع الحقول مطلوبة' });
    }
    
    const newBooking = {
        id: Date.now().toString(),
        shopId,
        customerName,
        customerPhone,
        appointmentTime,
        createdAt: new Date()
    };
    
    bookingsDb.push(newBooking);
    console.log(`⏱️ حجز جديد: ${customerName} - ${appointmentTime} في ${shopId}`);
    
    res.status(201).json({ success: true, data: newBooking });
});

// مسار جلب حجوزات محل معين لحساب التاجر
app.get('/api/v1/bookings/:shopId', (req, res) => {
    const shopId = req.params.shopId;
    const filtered = bookingsDb.filter(b => b.shopId === shopId);
    res.json({ success: true, data: filtered });
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 خادم تطبيق احجزلي الاحترافي يعمل الآن على المنفذ http://localhost:${PORT}`);
});
