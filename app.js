const BACKEND_URL = 'http://localhost:5000/api/v1';

// مواعيد تجريبية للعمل المباشر بدون سيرفر
const mockSlots = {
    shop1: ['09:00 ص', '10:30 ص', '12:00 م', '04:00 م', '05:30 م'],
    shop2: ['08:30 ص', '11:00 ص', '01:30 م', '03:00 م'],
    shop3: ['10:00 ص', '11:30 ص', '03:30 م', '06:00 م']
};

let currentMode = 'customer';
let selectedShop = '';
let selectedTime = '';

function switchMode(mode) {
    currentMode = mode;
    document.getElementById('btn-customer-mode').classList.toggle('active', mode === 'customer');
    document.getElementById('btn-merchant-mode').classList.toggle('active', mode === 'merchant');
    
    document.getElementById('customer-view').classList.toggle('hidden', mode !== 'customer');
    document.getElementById('merchant-view').classList.toggle('hidden', mode !== 'merchant');
    
    if (mode === 'merchant') {
        loadMerchantBookings();
    }
}

function onShopChange() {
    selectedShop = document.getElementById('shop-select').value;
    const bookingSection = document.getElementById('booking-section');
    const slotsGrid = document.getElementById('time-slots');
    
    slotsGrid.innerHTML = '';
    selectedTime = '';
    
    if (!selectedShop) {
        bookingSection.classList.add('hidden');
        return;
    }
    
    bookingSection.classList.remove('hidden');
    
    // بناء شبكة الساعات
    mockSlots[selectedShop].forEach(time => {
        const btn = document.createElement('button');
        btn.className = 'slot-btn';
        btn.innerText = time;
        btn.onclick = () => {
            document.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedTime = time;
        };
        slotsGrid.appendChild(btn);
    });
}

async function submitBooking() {
    const name = document.getElementById('cust-name').value.trim();
    const phone = document.getElementById('cust-phone').value.trim();
    
    if (!selectedTime) return alert('الرجاء اختيار وقت الموعد أولاً!');
    if (!name || !phone) return alert('الرجاء كتابة الاسم ورقم الهاتف للتأكيد!');
    
    const bookingData = {
        shopId: selectedShop,
        customerName: name,
        customerPhone: phone,
        appointmentTime: selectedTime
    };

    // حفظ محلي فوري للمحاكاة بدون سيرفر
    let localBookings = JSON.parse(localStorage.getItem('ehjezly_bookings') || '[]');
    localBookings.push(bookingData);
    localStorage.setItem('ehjezly_bookings', JSON.stringify(localBookings));

    // محاولة الإرسال للسيرفر الحقيقي
    try {
        await fetch(`${BACKEND_URL}/bookings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingData)
        });
    } catch(e) {
        console.log('يعمل في وضع المحاكاة بدون خادم');
    }

    // عرض شاشة النجاح
    const shopText = document.getElementById('shop-select').options[document.getElementById('shop-select').selectedIndex].text;
    document.getElementById('booking-section').classList.add('hidden');
    document.getElementById('shop-selection-card')?.classList.add('hidden'); 
    document.getElementById('success-text').innerText = `المحل: ${shopText}\nالوقت: ${selectedTime}\nالاسم: ${name}`;
    document.getElementById('success-screen').classList.remove('hidden');
}

function resetCustomerView() {
    document.getElementById('success-screen').classList.add('hidden');
    document.getElementById('shop-select').value = '';
    document.getElementById('cust-name').value = '';
    document.getElementById('cust-phone').value = '';
    onShopChange();
}

async function loadMerchantBookings() {
    const merchantShop = document.getElementById('merchant-shop-select').value;
    const listContainer = document.getElementById('merchant-bookings-list');
    listContainer.innerHTML = '';
    
    let bookings = [];
    
    // محاولة جلب البيانات من السيرفر
    try {
        const res = await fetch(`${BACKEND_URL}/bookings/${merchantShop}`);
        const json = await res.json();
        if (json.success) bookings = json.data;
    } catch(e) {
        // الفلترة من المخزن المحلي في حال غياب السيرفر
        let local = JSON.parse(localStorage.getItem('ehjezly_bookings') || '[]');
        bookings = local.filter(b => b.shopId === merchantShop);
    }
    
    if (bookings.length === 0) {
        listContainer.innerHTML = '<tr><td colspan="4" style="text-align:center; color:#888;">لا توجد حجوزات مسجلة لهذا اليوم حتى الآن</td></tr>';
        return;
    }
    
    bookings.forEach(b => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${b.appointmentTime}</strong></td>
            <td>${b.customerName}</td>
            <td>${b.customerPhone}</td>
            <td><span class="status-badge">مؤكد تلقائياً</span></td>
        `;
        listContainer.appendChild(tr);
    });
}
