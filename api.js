// ============================
// ฐานข้อมูล API Integration
// ============================

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzVHsCGlF5PGuzHBMU_C0i2pomiljhi9ErUg-JUrnfQ8TuJqoParTIJ30PU0UG27bCg/exec'.trim();

// Ensure api namespace exists
window.api = window.api || {};

// Loading overlay to block UI during API calls
function showApiLoading(message = 'กำลังโหลดข้อมูล...') {
    let loader = document.getElementById('apiLoader');
    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'apiLoader';
        loader.innerHTML = `
            <div style="background:var(--bg-card);padding:24px 32px;border-radius:var(--radius-lg);display:flex;align-items:center;gap:16px;box-shadow:var(--shadow-lg);border:1px solid var(--accent-primary)">
                <div class="loader-spinner" style="width:24px;height:24px;border:3px solid var(--border-color);border-top-color:var(--accent-primary);border-radius:50%;animation:spin 1s linear infinite"></div>
                <span id="apiLoaderMsg" style="font-weight:600">${message}</span>
            </div>
            <style>@keyframes spin { 100% { transform: rotate(360deg); } }</style>
        `;
        loader.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(3px);';
        document.body.appendChild(loader);
    } else {
        document.getElementById('apiLoaderMsg').textContent = message;
        loader.style.display = 'flex';
    }
}

function hideApiLoading() {
    const loader = document.getElementById('apiLoader');
    if (loader) loader.style.display = 'none';
}

// Fetch Data (GET) with Caching & Background Refresh
// parameters: action (e.g. 'getAllData', 'getStudents', 'getCourses')
// forceRefresh: boolean (if true, bypass cache and fetch directly)
async function fetchData(action, forceRefresh = false) {
    if (!SCRIPT_URL || SCRIPT_URL.includes('your-script-url')) {
        console.error('API Error: SCRIPT_URL is not configured correctly in api.js');
        return null;
    }

    const cacheKey = `cache_api_${action}`;
    const cacheTimeKey = `cache_time_${action}`;
    const CACHE_TTL_MS = 15 * 60 * 1000; // แคชมีอายุ 15 นาที

    // 1. ตรวจสอบข้อมูลใน Local Cache ก่อน
    if (!forceRefresh) {
        try {
            const cachedDataStr = localStorage.getItem(cacheKey);
            const cachedTime = localStorage.getItem(cacheTimeKey);
            const now = Date.now();

            if (cachedDataStr && cachedTime) {
                const age = now - parseInt(cachedTime, 10);
                const cachedData = JSON.parse(cachedDataStr);

                // ถ้ามีแคช ให้ส่งคืนแคชทันทีเพื่อให้หน้าเว็บเปิดทำงานได้ทันใจ (0 วินาที)
                console.log(`[Cache Hit] Action: ${action} (อายุแคช: Math.round(${age / 1000})s)`);

                // หากแคชเริ่มเก่า (> 5 นาที) ให้แอบดึงข้อมูลล่าสุดจาก Sheets มาอัปเดตแบบเบื้องหลัง (Background Sync)
                if (age > 5 * 60 * 1000) {
                    console.log(`[Background Sync] กำลังดึงข้อมูลล่าสุดของ ${action} มาอัปเดตในแคช...`);
                    fetchData(action, true).then(freshData => {
                        if (freshData && freshData.status !== 'error') {
                            console.log(`[Background Sync Complete] อัปเดตข้อมูล ${action} เรียบร้อยแล้ว`);
                        }
                    }).catch(e => console.warn(`[Background Sync Fail]`, e));
                }

                return cachedData;
            }
        } catch (cacheErr) {
            console.warn('[Cache Read Error]', cacheErr);
        }
    }

    // 2. หากไม่มีแคช หรือต้องการบังคับดึงข้อมูลสด
    try {
        const url = `${SCRIPT_URL}?action=${action}`;
        console.log(`Fetching from: ${url}`);
        const response = await fetch(url, {
            method: 'GET',
            mode: 'cors',
            cache: 'no-cache'
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();

        // บันทึกลง Local Cache สำหรับรอบต่อไป
        if (result && result.status !== 'error') {
            try {
                localStorage.setItem(cacheKey, JSON.stringify(result));
                localStorage.setItem(cacheTimeKey, Date.now().toString());
            } catch (storageErr) {
                console.warn('[Cache Write Error - Quota Exceeded?]', storageErr);
            }
        }

        return result;
    } catch (error) {
        console.error(`API Error (${action}):`, error);
        
        // กรณีเกิดข้อผิดพลาดในการเชื่อมต่อเน็ต แต่มีแคชเก่าอยู่ ให้กู้คืนแคชเก่ามาใช้แก้ขัด
        const fallback = localStorage.getItem(cacheKey);
        if (fallback) {
            console.warn(`[Offline Fallback] ใช้ข้อมูลเก่าในเครื่องแทนสำหรับ ${action}`);
            return JSON.parse(fallback);
        }

        throw error;
    }
}

// Note: postData is defined at the bottom with timeout support

// Upload Single File (Robust for large files)
window.api.uploadFile = async function (file, metadata = {}) {
    const MAX_FILE_SIZE = 40 * 1024 * 1024; // 40MB limit per file
    if (file.size > MAX_FILE_SIZE) {
        throw new Error(`ไฟล์ "${file.name}" มีขนาดใหญ่เกินไป (${(file.size / (1024 * 1024)).toFixed(2)}MB) ระบบรองรับสูงสุด 40MB ต่อไฟล์ครับ`);
    }

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async () => {
            try {
                const payload = {
                    ...metadata,
                    fileName: file.name,
                    mimeType: file.type,
                    base64Data: reader.result
                };
                const result = await postData('uploadDocument', payload, 300000); // 5 min timeout
                resolve(result);
            } catch (err) {
                reject(err);
            }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

// --- New Two-Phase Upload Methods ---

/**
 * Upload File to Drive Only (Phase 1)
 */
window.api.uploadFileOnly = function (file) {
    if (!file) return Promise.reject(new Error('No file provided'));

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async () => {
            try {
                const payload = {
                    fileName: file.name,
                    mimeType: file.type,
                    base64Data: reader.result
                };
                const result = await postData('uploadFileOnly', payload, 300000); // 5 min timeout
                resolve(result);
            } catch (err) {
                reject(err);
            }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

/**
 * Save Document Record to Sheet (Phase 2)
 */
window.api.saveDocumentRecord = function (metadata) {
    return postData('saveDocumentRecord', metadata);
};

/**
 * Update Student Status
 */
window.api.updateStudentStatus = function (studentId, status) {
    return postData('updateStudentStatus', { studentId: studentId, status: status });
};

/**
 * Update Student Detail
 */
window.api.updateStudentDetail = function (studentId, data) {
    return postData('updateStudentDetail', { studentId: studentId, data: data });
};

// Backwards compatibility helper
window.uploadFile = function (file, metadata) { return window.api.uploadFile(file, metadata); };

// Generic POST helper with custom timeout
async function postData(action, payload, timeoutMs = 120000) {
    console.log(`[API] >>> Call: ${action} | Size: ${Math.round(JSON.stringify(payload).length / 1024)} KB`);

    // Use an AbortSignal for the timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
        // IMPORTANT: No headers, no mode 'cors' - let fetch handle it as simply as possible
        // This is often the most reliable way to talk to Google Apps Script Web Apps
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({ action: action, payload: payload }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);
        console.log(`[API] <<< Status: ${response.status}`);

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const data = await response.json();
        console.log(`[API] Result:`, data);

        // เมื่อมีการแก้ไข/บันทึกข้อมูลสำเร็จ ให้ล้างแคช getAllData เพื่อให้ดึงข้อมูลใหม่ที่อัปเดตแล้ว
        if (data && data.status === 'success') {
            try {
                localStorage.removeItem('cache_api_getAllData');
                localStorage.removeItem('cache_time_getAllData');
            } catch (e) {}
        }

        return data;
    } catch (err) {
        clearTimeout(timeoutId);
        console.error(`[API] FAIL:`, err);

        if (err.name === 'AbortError') {
            throw new Error(`หมดเวลารอ (${timeoutMs / 1000} วินาที)`);
        }
        throw err;
    }
}

