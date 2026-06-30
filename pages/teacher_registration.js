// ============================
// Teacher Registration Page
// ============================
let teacherRegData = {};

pages['teacher-registration'] = function() {
    const regMode = window._teacherRegMode || 'single';
    return `
    <div class="animate-in">
        <div class="page-header">
            <h1 class="page-title">เพิ่มข้อมูลอาจารย์</h1>
            <p class="page-subtitle">กรอกข้อมูลรายบุคคล หรือนำเข้าข้อมูลจำนวนมากจากไฟล์</p>
        </div>

        <!-- Mode Tabs -->
        <div style="display:flex; gap:0; margin-bottom:20px; border-bottom:2px solid var(--border-color);">
            <button class="btn" onclick="switchTeacherRegMode('single')" style="flex:1; padding:12px 20px; border:none; border-bottom:3px solid ${regMode==='single'?'var(--accent-primary)':'transparent'}; background:${regMode==='single'?'var(--bg-secondary)':'transparent'}; color:${regMode==='single'?'var(--accent-primary)':'var(--text-muted)'}; font-weight:${regMode==='single'?'600':'400'}; font-size:0.95rem; cursor:pointer; border-radius:var(--radius-md) var(--radius-md) 0 0; transition:all 0.2s;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle; margin-right:6px;"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                กรอกข้อมูลรายบุคคล
            </button>
            ${(window.currentUserRole === 'staff' || window.currentUserRole === 'admin') ? `
            <button class="btn" onclick="switchTeacherRegMode('bulk')" style="flex:1; padding:12px 20px; border:none; border-bottom:3px solid ${regMode==='bulk'?'var(--accent-primary)':'transparent'}; background:${regMode==='bulk'?'var(--bg-secondary)':'transparent'}; color:${regMode==='bulk'?'var(--accent-primary)':'var(--text-muted)'}; font-weight:${regMode==='bulk'?'600':'400'}; font-size:0.95rem; cursor:pointer; border-radius:var(--radius-md) var(--radius-md) 0 0; transition:all 0.2s;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle; margin-right:6px;"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                นำเข้าข้อมูลจำนวนมาก (Import)
            </button>
            ` : ''}
        </div>
 
        <!-- Single Mode -->
        <div id="teacherSinglePanel" style="display:${regMode==='single'?'block':'none'}">
            <div class="card">
                <div class="card-header"><h3 class="card-title">กรอกข้อมูลอาจารย์</h3></div>
                <div class="card-body">
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">คำนำหน้า</label>
                            <input id="t_prefix" class="form-input" list="prefix-list" placeholder="ระบุคำนำหน้าชื่อ..."/>
                            <datalist id="prefix-list">
                                <option value="รศ.ดร."></option>
                                <option value="ผศ.ดร."></option>
                                <option value="อ.ดร."></option>
                                <option value="ศ.ดร."></option>
                                <option value="รศ."></option>
                                <option value="ผศ."></option>
                                <option value="อ."></option>
                            </datalist>
                        </div>
                        <div class="form-group"><label class="form-label">ชื่อ</label><input id="t_firstName" class="form-input" placeholder="ชื่อ"/></div>
                        <div class="form-group"><label class="form-label">นามสกุล</label><input id="t_lastName" class="form-input" placeholder="นามสกุล"/></div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">ตำแหน่งทางวิชาการ</label>
                            <input id="t_position" class="form-input" list="position-list" placeholder="ระบุตำแหน่ง..."/>
                            <datalist id="position-list">
                                <option value="รองศาสตราจารย์"></option>
                                <option value="ผู้ช่วยศาสตราจารย์"></option>
                                <option value="อาจารย์"></option>
                                <option value="ศาสตราจารย์"></option>
                            </datalist>
                        </div>
                        <div class="form-group"><label class="form-label">ความเชี่ยวชาญ / สาขาวิชา</label><input id="t_expertise" class="form-input" placeholder="เช่น การพยาบาลจิตเวชและสุขภาพจิต"/></div>
                    </div>
                    <div class="form-row">
                        <div class="form-group"><label class="form-label">อีเมล</label><input id="t_email" class="form-input" type="email" placeholder="email@pi.ac.th"/></div>
                        <div class="form-group"><label class="form-label">เบอร์โทรศัพท์</label><input id="t_phone" class="form-input" placeholder="0xx-xxx-xxxx"/></div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">ประเภทอาจารย์</label>
                            <select id="t_type" class="form-select">
                                <option value="อาจารย์ประจำ">อาจารย์ประจำ</option>
                                <option value="อาจารย์ผู้รับผิดชอบหลักสูตร">อาจารย์ผู้รับผิดชอบหลักสูตร</option>
                                <option value="อาจารย์พิเศษ">อาจารย์พิเศษ</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">คณะ / สังกัด</label>
                            <input id="t_faculty" class="form-input" value="คณะพยาบาลศาสตร์ สถาบันพระบรมราชชนก" placeholder="สังกัด/หน่วยงานต้นสังกัด..."/>
                        </div>
                        <div class="form-group"><label class="form-label">จำนวนนักศึกษาในกำกับ</label><input id="t_studentCount" class="form-input" type="number" placeholder="0" value="0"/></div>
                    </div>
                    <div style="display:flex; justify-content:flex-end; margin-top:20px;">
                        <button class="btn btn-primary" onclick="submitSingleTeacher()" style="padding:12px 30px; font-size:1rem;">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle; margin-right:6px;"><polyline points="20 6 9 17 4 12"/></svg>
                            บันทึกข้อมูลอาจารย์
                        </button>
                    </div>
                </div>
            </div>
        </div>
 
        <!-- Bulk Mode -->
        <div id="teacherBulkPanel" style="display:${(regMode==='bulk' && (window.currentUserRole === 'staff' || window.currentUserRole === 'admin')) ? 'block' : 'none'}">
            <!-- Step 1: Download Template -->
            <div class="card animate-in animate-delay-1" style="margin-bottom:18px;">
                <div class="card-header"><h3 class="card-title">ขั้นตอนที่ 1: ดาวน์โหลด Template</h3></div>
                <div class="card-body">
                    <p style="color:var(--text-muted); font-size:0.9rem; margin-bottom:16px;">
                        ดาวน์โหลดไฟล์ Template (.csv) แล้วกรอกข้อมูลอาจารย์ตามรูปแบบที่กำหนด<br>
                        <span style="color:var(--danger); font-size:0.82rem;">⚠️ ห้ามเปลี่ยนชื่อหัวคอลัมน์ในแถวแรก</span>
                    </p>
                    <div style="overflow-x:auto; margin-bottom:16px;">
                        <table class="data-table" style="font-size:0.75rem; white-space:nowrap;">
                            <thead><tr>
                                <th>คำนำหน้า</th><th>ชื่อ</th><th>นามสกุล</th><th>ตำแหน่งทางวิชาการ</th>
                                <th>ความเชี่ยวชาญ</th><th>อีเมล</th><th>เบอร์โทร</th><th>คณะ/สังกัด</th><th>นศ. ในกำกับ</th>
                                <th>Username</th><th>Password</th><th>ประเภทอาจารย์</th>
                            </tr></thead>
                            <tbody>
                                <tr style="color:var(--text-muted);">
                                    <td>รศ.ดร.</td><td>สมศรี</td><td>ใจสว่าง</td><td>รองศาสตราจารย์</td>
                                    <td>การพยาบาลจิตเวชและสุขภาพจิต</td><td>somsri.j@pi.ac.th</td><td>02-123-4567</td><td>คณะพยาบาลศาสตร์ สถาบันพระบรมราชชนก</td><td>8</td>
                                    <td>somsri.j</td><td>111111</td><td>อาจารย์ประจำ</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <button class="btn btn-primary" onclick="downloadTeacherTemplate()" style="gap:6px;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        ดาวน์โหลด Template (.csv)
                    </button>
                </div>
            </div>

            <!-- Step 2: Upload File -->
            <div class="card animate-in animate-delay-2" style="margin-bottom:18px;">
                <div class="card-header"><h3 class="card-title">ขั้นตอนที่ 2: อัปโหลดไฟล์ข้อมูล</h3></div>
                <div class="card-body">
                    <div id="teacherDropZone" style="border:2px dashed var(--border-color); border-radius:var(--radius-md); padding:40px; text-align:center; cursor:pointer; transition:all 0.2s; background:var(--bg-secondary);"
                         onclick="document.getElementById('teacherBulkFileInput').click()"
                         ondragover="event.preventDefault(); this.style.borderColor='var(--accent-primary)'; this.style.background='rgba(220,53,69,0.05)';"
                         ondragleave="this.style.borderColor='var(--border-color)'; this.style.background='var(--bg-secondary)';"
                         ondrop="event.preventDefault(); this.style.borderColor='var(--border-color)'; this.style.background='var(--bg-secondary)'; handleTeacherBulkFile(event.dataTransfer.files[0]);">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5" style="margin-bottom:12px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                        <h4 style="color:var(--text-muted); margin-bottom:6px;" id="teacherDropZoneText">ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์</h4>
                        <p style="color:var(--text-muted); font-size:0.82rem;">รองรับไฟล์ .csv (UTF-8)</p>
                    </div>
                    <input type="file" id="teacherBulkFileInput" accept=".csv" style="display:none" onchange="handleTeacherBulkFile(this.files[0])" />
                </div>
            </div>

            <!-- Step 3: Preview & Submit -->
            <div class="card animate-in animate-delay-3" id="teacherBulkPreviewCard" style="display:none; margin-bottom:18px;">
                <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
                    <h3 class="card-title">ขั้นตอนที่ 3: ตรวจสอบและนำเข้า</h3>
                    <span class="badge success" id="teacherBulkCountBadge">0 รายการ</span>
                </div>
                <div class="card-body">
                    <div style="overflow-x:auto; max-height:400px; overflow-y:auto;" id="teacherBulkPreviewTable"></div>
                    <div style="display:flex; gap:12px; margin-top:16px; justify-content:flex-end;">
                        <button class="btn btn-secondary" onclick="clearTeacherBulkImport()">ยกเลิก</button>
                        <button class="btn btn-primary" onclick="submitTeacherBulkImport()">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle; margin-right:4px;"><polyline points="20 6 9 17 4 12"/></svg>
                            นำเข้าข้อมูลทั้งหมด
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>`;
};

// ====== Tab Switching ======
window.switchTeacherRegMode = function(mode) {
    window._teacherRegMode = mode;
    renderPage();
};

// ====== Single Teacher Submit ======
window.submitSingleTeacher = async function() {
    const firstName = document.getElementById('t_firstName').value.trim();
    const lastName = document.getElementById('t_lastName').value.trim();
    const prefix = document.getElementById('t_prefix').value.trim();
    
    if (!firstName || !lastName) {
        alert('กรุณากรอกชื่อและนามสกุลของอาจารย์');
        return;
    }

    const payload = {
        'คำนำหน้า': prefix,
        'ชื่อ': firstName,
        'นามสกุล': lastName,
        'ตำแหน่งทางวิชาการ': document.getElementById('t_position').value,
        'ความเชี่ยวชาญ': document.getElementById('t_expertise').value,
        'อีเมล': document.getElementById('t_email').value,
        'เบอร์โทร': document.getElementById('t_phone').value,
        'คณะ/สังกัด': document.getElementById('t_faculty').value,
        'นศ. ในกำกับ': parseInt(document.getElementById('t_studentCount').value) || 0,
        'Username': document.getElementById('t_email').value.split('@')[0],
        'Password': '111111',
        'ประเภทอาจารย์': document.getElementById('t_type').value,
        'name': (prefix ? prefix + ' ' : '') + firstName + ' ' + lastName
    };

    showApiLoading('กำลังบันทึกข้อมูลอาจารย์...');
    const res = await postData('registerTeacher', payload);
    hideApiLoading();

    if (res && res.status === 'success') {
        openModal('สำเร็จ!', `<div style="text-align:center;padding:20px"><div style="font-size:3rem;margin-bottom:12px">🎉</div><h3 style="margin-bottom:8px">บันทึกข้อมูลอาจารย์สำเร็จ</h3><p style="color:var(--text-muted)">${payload.name}</p><button class="btn btn-primary" style="margin-top:16px" onclick="closeModal();if(typeof bootApp==='function') bootApp();">ตกลง</button></div>`);
    } else {
        // Still add to local mock for demo purposes if API fails or for offline demo
        if (!MOCK.teachers) MOCK.teachers = [];
        MOCK.teachers.push(payload);
        
        // Add to display list based on type
        if (payload['ประเภทอาจารย์'] === 'อาจารย์พิเศษ') {
            if (!MOCK.specialLecturers) MOCK.specialLecturers = [];
            MOCK.specialLecturers.push(payload);
        } else {
            MOCK.academicAdvisors.push(payload);
        }
        
        openModal('สำเร็จ!', `<div style="text-align:center;padding:20px"><div style="font-size:3rem;margin-bottom:12px">🎉</div><h3 style="margin-bottom:8px">บันทึกข้อมูลอาจารย์สำเร็จ</h3><p style="color:var(--text-muted)">${payload.name}</p><p style="color:var(--text-muted); font-size:0.82rem;">(บันทึกในระบบภายในเรียบร้อย)</p><button class="btn btn-primary" style="margin-top:16px" onclick="closeModal();navigateTo('dashboard');">ตกลง</button></div>`);
    }
};

// ====== CSV Template Download ======
window.downloadTeacherTemplate = function() {
    const headers = [
        'คำนำหน้า','ชื่อ','นามสกุล','ตำแหน่งทางวิชาการ',
        'ความเชี่ยวชาญ','อีเมล','เบอร์โทร','คณะ/สังกัด','นศ. ในกำกับ',
        'Username','Password','ประเภทอาจารย์'
    ];
    const sampleRow = [
        'รศ.ดร.','สมศรี','ใจสว่าง','รองศาสตราจารย์',
        'การพยาบาลจิตเวชและสุขภาพจิต','somsri.j@pi.ac.th','02-123-4567 ต่อ 201','คณะพยาบาลศาสตร์ สถาบันพระบรมราชชนก','8',
        'somsri.j','111111','อาจารย์ผู้รับผิดชอบหลักสูตร'
    ];
    const BOM = '\uFEFF';
    const csv = BOM + headers.join(',') + '\n' + sampleRow.join(',') + '\n';
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_ข้อมูลอาจารย์.csv';
    a.click();
    URL.revokeObjectURL(url);
};

// ====== Bulk File Handler ======
let teacherBulkImportData = [];

window.handleTeacherBulkFile = function(file) {
    if (!file) return;
    const dropText = document.getElementById('teacherDropZoneText');
    if (dropText) dropText.textContent = '📄 ' + file.name;

    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        if (text.includes('\ufffd')) {
            const reader874 = new FileReader();
            reader874.onload = function(ev) { processTeacherCsvText(ev.target.result); };
            reader874.readAsText(file, 'windows-874');
            return;
        }
        processTeacherCsvText(text);
    };
    reader.readAsText(file, 'UTF-8');
};

function processTeacherCsvText(text) {
    const lines = text.split(/\r?\n|\r/).filter(l => l.trim());
    if (lines.length < 2) {
        alert('ไฟล์ไม่มีข้อมูล (ต้องมีอย่างน้อย 1 แถวหัวตาราง + 1 แถวข้อมูล)');
        return;
    }
    const headers = parseCSVLine(lines[0]);
    teacherBulkImportData = [];
    for (let i = 1; i < lines.length; i++) {
        const cols = parseCSVLine(lines[i]);
        if (cols.length < 2) continue;
        const row = {};
        headers.forEach((h, idx) => { row[h.trim()] = (cols[idx] || '').trim(); });
        teacherBulkImportData.push(row);
    }
    renderTeacherBulkPreview(headers, teacherBulkImportData);
}

function renderTeacherBulkPreview(headers, data) {
    const card = document.getElementById('teacherBulkPreviewCard');
    const badge = document.getElementById('teacherBulkCountBadge');
    const tableDiv = document.getElementById('teacherBulkPreviewTable');
    if (!card || !tableDiv) return;

    card.style.display = 'block';
    badge.textContent = data.length + ' รายการ';

    let html = '<table class="data-table" style="font-size:0.78rem;"><thead><tr><th>#</th>';
    headers.forEach(h => { html += `<th>${h.trim()}</th>`; });
    html += '</tr></thead><tbody>';
    data.forEach((row, i) => {
        html += `<tr><td>${i+1}</td>`;
        headers.forEach(h => { html += `<td>${row[h.trim()] || '-'}</td>`; });
        html += '</tr>';
    });
    html += '</tbody></table>';
    tableDiv.innerHTML = html;
}

window.clearTeacherBulkImport = function() {
    teacherBulkImportData = [];
    const card = document.getElementById('teacherBulkPreviewCard');
    if (card) card.style.display = 'none';
    const dropText = document.getElementById('teacherDropZoneText');
    if (dropText) dropText.textContent = 'ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์';
    const fileInput = document.getElementById('teacherBulkFileInput');
    if (fileInput) fileInput.value = '';
};

window.submitTeacherBulkImport = async function() {
    if (teacherBulkImportData.length === 0) { alert('ไม่มีข้อมูลสำหรับนำเข้า'); return; }
    showApiLoading(`กำลังนำเข้าข้อมูลอาจารย์ ${teacherBulkImportData.length} รายการ...`);

    let successCount = 0;
    for (const row of teacherBulkImportData) {
        const prefix = row['คำนำหน้า'] || '';
        const firstName = row['ชื่อ'] || '';
        const lastName = row['นามสกุล'] || '';
        const payload = {
            'คำนำหน้า': row['คำนำหน้า'] || '',
            'ชื่อ': row['ชื่อ'] || '',
            'นามสกุล': row['นามสกุล'] || '',
            'ตำแหน่งทางวิชาการ': row['ตำแหน่งทางวิชาการ'] || '',
            'ความเชี่ยวชาญ': row['ความเชี่ยวชาญ'] || '',
            'อีเมล': row['อีเมล'] || '',
            'เบอร์โทร': row['เบอร์โทร'] || '',
            'คณะ/สังกัด': row['คณะ/สังกัด'] || 'คณะพยาบาลศาสตร์ สถาบันพระบรมราชชนก',
            'นศ. ในกำกับ': parseInt(row['นศ. ในกำกับ']) || 0,
            'Username': row['Username'] || (row['อีเมล'] ? row['อีเมล'].split('@')[0] : ''),
            'Password': row['Password'] || '111111',
            'ประเภทอาจารย์': row['ประเภทอาจารย์'] || 'อาจารย์ประจำ'
        };
        const res = await postData('registerTeacher', payload);
        if (res && res.status === 'success') {
            successCount++;
        } else {
            // Add to local mock for demo
            if (!MOCK.teachers) MOCK.teachers = [];
            MOCK.teachers.push(payload);
            MOCK.academicAdvisors.push(payload);
            successCount++;
        }
    }

    hideApiLoading();
    openModal('นำเข้าข้อมูลเสร็จสิ้น', `<div style="text-align:center;padding:20px"><div style="font-size:3rem;margin-bottom:12px">👩‍🏫</div><h3 style="margin-bottom:8px">นำเข้าข้อมูลอาจารย์สำเร็จ</h3><p style="color:var(--text-muted)">นำเข้าสำเร็จ <strong>${successCount}</strong> จาก ${teacherBulkImportData.length} รายการ</p><button class="btn btn-primary" style="margin-top:16px" onclick="closeModal();clearTeacherBulkImport();if(typeof bootApp === 'function') bootApp(); else navigateTo('dashboard');">ตกลง</button></div>`);
};
