// ============================
// New Registration Page (Multi-step Wizard)
// ============================
let regData = {}; // เก็บข้อมูลการลงทะเบียน

pages['new-registration'] = function() {
    const stepLabels = ['ข้อมูลส่วนตัว', 'ข้อมูลการศึกษา', 'ข้อมูลการติดต่อ', 'ยืนยัน'];
    const regMode = window._regMode || 'single';
    return `
    <div class="animate-in">
        <div class="page-header">
            <h1 class="page-title">ลงทะเบียนนักศึกษาใหม่</h1>
            <p class="page-subtitle">กรอกข้อมูลรายบุคคล หรือนำเข้าข้อมูลจำนวนมากจากไฟล์</p>
        </div>

        <!-- Mode Tabs -->
        <div style="display:flex; gap:0; margin-bottom:20px; border-bottom:2px solid var(--border-color);">
            <button class="btn" onclick="switchRegMode('single')" style="flex:1; padding:12px 20px; border:none; border-bottom:3px solid ${regMode==='single'?'var(--accent-primary)':'transparent'}; background:${regMode==='single'?'var(--bg-secondary)':'transparent'}; color:${regMode==='single'?'var(--accent-primary)':'var(--text-muted)'}; font-weight:${regMode==='single'?'600':'400'}; font-size:0.95rem; cursor:pointer; border-radius:var(--radius-md) var(--radius-md) 0 0; transition:all 0.2s;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle; margin-right:6px;"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                กรอกข้อมูลรายบุคคล
            </button>
            ${(window.currentUserRole === 'staff' || window.currentUserRole === 'admin') ? `
            <button class="btn" onclick="switchRegMode('bulk')" style="flex:1; padding:12px 20px; border:none; border-bottom:3px solid ${regMode==='bulk'?'var(--accent-primary)':'transparent'}; background:${regMode==='bulk'?'var(--bg-secondary)':'transparent'}; color:${regMode==='bulk'?'var(--accent-primary)':'var(--text-muted)'}; font-weight:${regMode==='bulk'?'600':'400'}; font-size:0.95rem; cursor:pointer; border-radius:var(--radius-md) var(--radius-md) 0 0; transition:all 0.2s;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle; margin-right:6px;"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                นำเข้าข้อมูลจำนวนมาก (Import)
            </button>
            ` : ''}
        </div>

        <!-- Single Mode: Wizard Form -->
        <div id="regSinglePanel" style="display:${regMode==='single'?'block':'none'}">
            <div class="card">
                <div class="card-body">
                    <div class="steps" id="regSteps">
                        ${stepLabels.map((label, i) => `
                            <div class="step ${i+1 < registrationStep ? 'completed' : ''} ${i+1 === registrationStep ? 'active' : ''}" data-step="${i+1}">
                                <div class="step-circle">${i+1 < registrationStep ? '✓' : i+1}</div>
                                <span class="step-label">${label}</span>
                            </div>
                            ${i < stepLabels.length-1 ? `<div class="step-line ${i+1 < registrationStep ? 'completed' : ''}"></div>` : ''}
                        `).join('')}
                    </div>
                    <div id="regForm">${renderRegStep(registrationStep)}</div>
                    <div style="display:flex;justify-content:space-between;margin-top:24px;">
                        <button class="btn btn-secondary" onclick="regPrev()" ${registrationStep===1?'disabled style="opacity:0.4"':''}>← ก่อนหน้า</button>
                        ${registrationStep < 4 
                            ? `<button class="btn btn-primary" onclick="regNext()">ถัดไป →</button>`
                            : `<button class="btn btn-primary" onclick="regSubmit()">✓ ยืนยันลงทะเบียน</button>`
                        }
                    </div>
                </div>
            </div>
        </div>

        <!-- Bulk Mode: Import Panel -->
        <div id="regBulkPanel" style="display:${regMode==='bulk'?'block':'none'}">
            <!-- Step 1: Download Template -->
            <div class="card animate-in animate-delay-1" style="margin-bottom:18px;">
                <div class="card-header">
                    <h3 class="card-title">ขั้นตอนที่ 1: ดาวน์โหลด Template</h3>
                </div>
                <div class="card-body">
                    <p style="color:var(--text-muted); font-size:0.9rem; margin-bottom:16px;">
                        ดาวน์โหลดไฟล์ Template (.csv) แล้วกรอกข้อมูลนักศึกษาตามรูปแบบที่กำหนด<br>
                        <span style="color:var(--danger); font-size:0.82rem;">⚠️ ห้ามเปลี่ยนชื่อหัวคอลัมน์ในแถวแรก</span>
                    </p>
                    <div style="overflow-x:auto; margin-bottom:16px;">
                        <table class="data-table" style="font-size:0.75rem; white-space:nowrap;">
                            <thead><tr>
                                <th>คำนำหน้า</th><th>ชื่อ (ไทย)</th><th>นามสกุล (ไทย)</th><th>ชื่อ (EN)</th><th>นามสกุล (EN)</th>
                                <th>เลขบัตรประชาชน</th><th>รหัสนักศึกษา</th><th>วันเกิด</th><th>เพศ</th><th>อีเมล</th><th>E-mail ของสถาบัน</th><th>เบอร์โทร</th>
                                <th>สาขาวิชา</th><th>ปีการศึกษาที่เข้า</th>
                                <th>สถาบันที่จบ</th><th>สาขาที่จบ</th><th>วันที่สำเร็จ</th><th>GPA</th>
                                <th>ที่อยู่</th><th>สถานที่ทำงาน</th><th>แหล่งทุน</th>
                                <th>Username</th><th>Password</th>
                            </tr></thead>
                            <tbody>
                                <tr style="color:var(--text-muted);">
                                    <td>นางสาว</td><td>พิมพ์ใจ</td><td>รักดี</td><td>Pimjai</td><td>Rakdee</td>
                                    <td>1-1234-56789-01-2</td><td>6901012630</td><td>1995-01-15</td><td>หญิง</td><td>pimjai@email.com</td><td>pimjai.r@pi.ac.th</td><td>081-234-5678</td>
                                    <td>การพยาบาลจิตเวช</td><td>2569</td>
                                    <td>ม.มหิดล</td><td>พยาบาลศาสตร์</td><td>2567-03-15</td><td>3.45</td>
                                    <td>123 ถ.พหลโยธิน กทม.</td><td>รพ.พระมงกุฎ</td><td>ทุนส่วนตัว</td>
                                    <td>pimjai.r</td><td>123456</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <button class="btn btn-primary" onclick="downloadRegTemplate()" style="gap:6px;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        ดาวน์โหลด Template (.csv)
                    </button>
                </div>
            </div>

            <!-- Step 2: Upload File -->
            <div class="card animate-in animate-delay-2" style="margin-bottom:18px;">
                <div class="card-header">
                    <h3 class="card-title">ขั้นตอนที่ 2: อัปโหลดไฟล์ข้อมูล</h3>
                </div>
                <div class="card-body">
                    <div id="dropZone" style="border:2px dashed var(--border-color); border-radius:var(--radius-md); padding:40px; text-align:center; cursor:pointer; transition:all 0.2s; background:var(--bg-secondary);"
                         onclick="document.getElementById('bulkFileInput').click()"
                         ondragover="event.preventDefault(); this.style.borderColor='var(--accent-primary)'; this.style.background='rgba(220,53,69,0.05)';"
                         ondragleave="this.style.borderColor='var(--border-color)'; this.style.background='var(--bg-secondary)';"
                         ondrop="event.preventDefault(); this.style.borderColor='var(--border-color)'; this.style.background='var(--bg-secondary)'; handleBulkFile(event.dataTransfer.files[0]);">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5" style="margin-bottom:12px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                        <h4 style="color:var(--text-muted); margin-bottom:6px;" id="dropZoneText">ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์</h4>
                        <p style="color:var(--text-muted); font-size:0.82rem;">รองรับไฟล์ .csv (UTF-8)</p>
                    </div>
                    <input type="file" id="bulkFileInput" accept=".csv" style="display:none" onchange="handleBulkFile(this.files[0])" />
                </div>
            </div>

            <!-- Step 3: Preview & Submit -->
            <div class="card animate-in animate-delay-3" id="bulkPreviewCard" style="display:none; margin-bottom:18px;">
                <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
                    <h3 class="card-title">ขั้นตอนที่ 3: ตรวจสอบและนำเข้า</h3>
                    <span class="badge success" id="bulkCountBadge">0 รายการ</span>
                </div>
                <div class="card-body">
                    <div style="overflow-x:auto; max-height:400px; overflow-y:auto;" id="bulkPreviewTable"></div>
                    <div style="display:flex; gap:12px; margin-top:16px; justify-content:flex-end;">
                        <button class="btn btn-secondary" onclick="clearBulkImport()">ยกเลิก</button>
                        <button class="btn btn-primary" onclick="submitBulkImport()">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle; margin-right:4px;"><polyline points="20 6 9 17 4 12"/></svg>
                            นำเข้าข้อมูลทั้งหมด
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>`;
};

function renderRegStep(step) {
    const programs = MOCK.programs || [];

    // ======== Step 1: ข้อมูลส่วนตัว ========
    if (step === 1) return `
        <div class="form-row"><div class="form-group"><label class="form-label">คำนำหน้า</label><select id="reg_prefix" class="form-select"><option>นาย</option><option>นางสาว</option><option>นาง</option></select></div><div class="form-group"><label class="form-label">เลขบัตรประชาชน</label><input id="reg_idCard" class="form-input" placeholder="x-xxxx-xxxxx-xx-x" value="${regData.idCard||''}"/></div></div>
        <div class="form-row"><div class="form-group"><label class="form-label">ชื่อ (ไทย)</label><input id="reg_firstName" class="form-input" placeholder="ชื่อ" value="${regData.firstName||''}"/></div><div class="form-group"><label class="form-label">นามสกุล (ไทย)</label><input id="reg_lastName" class="form-input" placeholder="นามสกุล" value="${regData.lastName||''}"/></div></div>
        <div class="form-row"><div class="form-group"><label class="form-label">ชื่อ (อังกฤษ)</label><input id="reg_firstNameEn" class="form-input" placeholder="First Name" value="${regData.firstNameEn||''}"/></div><div class="form-group"><label class="form-label">นามสกุล (อังกฤษ)</label><input id="reg_lastNameEn" class="form-input" placeholder="Last Name" value="${regData.lastNameEn||''}"/></div></div>
        <div class="form-row"><div class="form-group"><label class="form-label">วันเกิด</label><input id="reg_dob" class="form-input" type="date" value="${regData.dob||''}"/></div><div class="form-group"><label class="form-label">เพศ</label><select id="reg_gender" class="form-select"><option>ชาย</option><option>หญิง</option></select></div></div>
        <div class="form-row"><div class="form-group"><label class="form-label">อีเมล</label><input id="reg_email" class="form-input" type="email" placeholder="email@example.com" value="${regData.email||''}"/></div><div class="form-group"><label class="form-label">เบอร์โทรศัพท์</label><input id="reg_phone" class="form-input" placeholder="0xx-xxx-xxxx" value="${regData.phone||''}"/></div></div>`;

    // ======== Step 2: ข้อมูลการศึกษา ========
    if (step === 2) return `
        <h4 style="margin-bottom:14px;font-size:0.95rem;color:var(--accent-primary);">ข้อมูลหลักสูตรที่สมัคร</h4>
        <div class="form-row">
            <div class="form-group">
                <label class="form-label">รหัสประจำตัวนักศึกษา (ถ้ามี)</label>
                <input id="reg_studentId" class="form-input" placeholder="กรอกรหัสประจำตัวนักศึกษา" value="${regData.studentId||''}"/>
            </div>
            <div class="form-group">
                <label class="form-label">คณะ</label>
                <input id="reg_faculty" class="form-input" value="คณะพยาบาลศาสตร์ สถาบันพระบรมราชชนก" readonly style="background:var(--bg-tertiary); color:var(--text-muted);" />
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label class="form-label">หลักสูตร</label>
                <input id="reg_program" class="form-input" value="หลักสูตรพยาบาลศาสตรมหาบัณฑิต" readonly style="background:var(--bg-tertiary); color:var(--text-muted);" />
            </div>
            <div class="form-group">
                <label class="form-label">สาขาวิชา</label>
                <select id="reg_department" class="form-select">
                    <option value="">-- กรุณาเลือกสาขาวิชา --</option>
                    ${programs.map(p => `<option value="${p.name}" ${regData.department === p.name ? 'selected' : ''}>${p.name}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">ปีการศึกษาที่เข้าศึกษา</label>
                <select id="reg_admissionYear" class="form-select">
                    ${[2573,2572,2571,2570,2569,2568,2567,2566,2565].map(y => `<option value="${y}" ${(regData.admissionYear || 2569) == y ? 'selected' : ''}>${y}</option>`).join('')}
                </select>
            </div>
        </div>

        <hr style="border-color:var(--border-color);margin:22px 0" />
        <h4 style="margin-bottom:14px;font-size:0.95rem;color:var(--accent-primary);">ข้อมูลการศึกษาเดิม</h4>
        <div class="form-row">
            <div class="form-group">
                <label class="form-label">สถาบันการศึกษาที่จบ</label>
                <input id="reg_prevSchool" class="form-input" placeholder="ชื่อสถาบัน/มหาวิทยาลัย" value="${regData.prevSchool||''}"/>
            </div>
            <div class="form-group">
                <label class="form-label">สาขาที่จบ</label>
                <input id="reg_prevMajor" class="form-input" placeholder="ชื่อสาขาวิชาที่สำเร็จการศึกษา" value="${regData.prevMajor||''}"/>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label class="form-label">วัน/เดือน/ปี ที่สำเร็จการศึกษา</label>
                <input id="reg_graduationDate" class="form-input" type="date" value="${regData.graduationDate||''}"/>
            </div>
            <div class="form-group">
                <label class="form-label">เกรดเฉลี่ย (GPA)</label>
                <input id="reg_prevGPA" class="form-input" placeholder="x.xx" value="${regData.prevGPA||''}"/>
            </div>
        </div>

        <hr style="border-color:var(--border-color);margin:22px 0" />
        <h4 style="margin-bottom:14px;font-size:0.95rem;color:var(--accent-primary);display:flex;align-items:center;justify-content:space-between;">ประวัติการทำงาน <span style="font-size:0.8rem;font-weight:normal;color:var(--text-muted);">(ระบุได้สูงสุด 5 แห่ง)</span></h4>
        ${[1,2,3,4,5].map(n => `
            <div id="workBlock${n}" style="${n > 1 && !regData['workPlace'+n] ? 'display:none;' : ''} border:1px solid var(--border-color); border-radius:var(--radius-md); padding:16px; margin-bottom:12px; background:var(--bg-secondary);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                    <strong style="font-size:0.88rem; color:var(--text-primary);">สถานที่ทำงานที่ ${n}</strong>
                    ${n > 1 ? `<button type="button" class="btn" style="padding:2px 10px; font-size:0.75rem; background:var(--bg-tertiary); border:1px solid var(--border-color); color:var(--text-muted);" onclick="document.getElementById('workBlock${n}').style.display='none'; document.getElementById('reg_workPlace${n}').value=''; document.getElementById('reg_workPosition${n}').value=''; document.getElementById('reg_workDuration${n}').value=''; document.getElementById('reg_workPeriod${n}').value='';">✕ ลบ</button>` : ''}
                </div>
                <div class="form-row">
                    <div class="form-group"><label class="form-label">ชื่อสถานที่ทำงาน</label><input id="reg_workPlace${n}" class="form-input" placeholder="ชื่อโรงพยาบาล / หน่วยงาน" value="${regData['workPlace'+n]||''}"/></div>
                    <div class="form-group"><label class="form-label">ตำแหน่งงาน</label><input id="reg_workPosition${n}" class="form-input" placeholder="ตำแหน่ง" value="${regData['workPosition'+n]||''}"/></div>
                </div>
                <div class="form-row">
                    <div class="form-group"><label class="form-label">ระยะเวลาการทำงาน</label><input id="reg_workDuration${n}" class="form-input" placeholder="เช่น 5 ปี 3 เดือน" value="${regData['workDuration'+n]||''}"/></div>
                    <div class="form-group"><label class="form-label">ช่วงเวลา (เริ่มต้น - สิ้นสุด)</label><input id="reg_workPeriod${n}" class="form-input" placeholder="เช่น ม.ค. 2563 - ปัจจุบัน" value="${regData['workPeriod'+n]||''}"/></div>
                </div>
            </div>
        `).join('')}
        <button type="button" class="btn" style="width:100%; padding:10px; background:var(--bg-tertiary); border:1px dashed var(--border-color); color:var(--accent-primary); font-size:0.9rem;" onclick="addWorkBlock()">+ เพิ่มประวัติการทำงาน</button>`;

    // ======== Step 3: ข้อมูลการติดต่อ ========
    if (step === 3) return `
        <h4 style="margin-bottom:14px;font-size:0.95rem;color:var(--accent-primary);">ที่อยู่ปัจจุบัน</h4>
        <div class="form-group"><label class="form-label">ที่อยู่ปัจจุบัน</label><textarea id="reg_address" class="form-textarea" placeholder="บ้านเลขที่, ถนน, ซอย, ตำบล, อำเภอ, จังหวัด, รหัสไปรษณีย์">${regData.address||''}</textarea></div>

        <hr style="border-color:var(--border-color);margin:20px 0" />
        <h4 style="margin-bottom:14px;font-size:0.95rem;color:var(--accent-primary);">ข้อมูลสถานที่ทำงาน</h4>
        <div class="form-row">
            <div class="form-group">
                <label class="form-label">สถานที่ทำงานในปัจจุบัน</label>
                <input id="reg_currentWorkPlace" class="form-input" placeholder="ชื่อโรงพยาบาล / หน่วยงาน" value="${regData.currentWorkPlace||''}"/>
            </div>
            <div class="form-group" style="display:none;"><!-- placeholder --></div>
        </div>
        <div class="form-group">
            <label class="form-label">ที่อยู่ของสถานที่ทำงาน</label>
            <textarea id="reg_workAddress" class="form-textarea" placeholder="ที่อยู่สถานที่ทำงาน">${regData.workAddress||''}</textarea>
        </div>

        <hr style="border-color:var(--border-color);margin:20px 0" />
        <h4 style="margin-bottom:14px;font-size:0.95rem;color:var(--accent-primary);">แหล่งทุนสนับสนุน</h4>
        <div class="form-group">
            <label class="form-label">ประเภททุนสนับสนุน</label>
            <div style="display:flex; flex-direction:column; gap:10px;">
                <label style="display:flex; align-items:center; gap:8px; padding:8px 12px; border:1px solid var(--border-color); border-radius:var(--radius-md); cursor:pointer;" onclick="selectFundType('personal')">
                    <input type="radio" name="fundType" value="ทุนส่วนตัว" ${(!regData.fundType || regData.fundType === 'ทุนส่วนตัว') ? 'checked' : ''} style="accent-color:var(--accent-primary);">
                    <span>💰 ทุนส่วนตัว</span>
                </label>
                <label style="display:flex; align-items:center; gap:8px; padding:8px 12px; border:1px solid var(--border-color); border-radius:var(--radius-md); cursor:pointer;" onclick="selectFundType('org')">
                    <input type="radio" name="fundType" value="ทุนต้นสังกัด" ${regData.fundType === 'ทุนต้นสังกัด' ? 'checked' : ''} style="accent-color:var(--accent-primary);">
                    <span>🏥 ทุนต้นสังกัด</span>
                </label>
                <label style="display:flex; align-items:center; gap:8px; padding:8px 12px; border:1px solid var(--border-color); border-radius:var(--radius-md); cursor:pointer;" onclick="selectFundType('other')">
                    <input type="radio" name="fundType" value="ทุนอื่นๆ" ${regData.fundType === 'ทุนอื่นๆ' ? 'checked' : ''} style="accent-color:var(--accent-primary);">
                    <span>📋 ทุนอื่นๆ โปรดระบุ</span>
                </label>
                <input type="text" id="reg_fundOther" class="form-input" placeholder="ระบุชื่อทุน..." value="${regData.fundOther||''}" style="display:${regData.fundType === 'ทุนอื่นๆ' ? 'block' : 'none'}; margin-left:32px;" />
            </div>
        </div>`;

    // ======== Step 4: ยืนยัน ========
    if (step === 4) return `
        <div style="text-align:center;padding:20px 0">
            <div style="width:64px;height:64px;border-radius:50%;background:var(--success-bg);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:1.8rem;color:var(--success)">✓</div>
            <h3 style="margin-bottom:8px;font-size:1.1rem">ตรวจสอบข้อมูลก่อนยืนยัน</h3>
            <p style="color:var(--text-muted);font-size:0.85rem;margin-bottom:24px">กรุณาตรวจสอบข้อมูลทั้งหมดให้ถูกต้องก่อนกดปุ่มยืนยัน</p>
            <div class="card" style="text-align:left;max-width:600px;margin:0 auto">
                <div class="card-body">
                    <div class="transcript-info">
                        <div class="transcript-info-item"><span class="label">ชื่อ-สกุล:</span><span>${regData.prefix||''}${regData.firstName||'-'} ${regData.lastName||'-'}</span></div>
                        <div class="transcript-info-item"><span class="label">อีเมล:</span><span>${regData.email||'-'}</span></div>
                        <div class="transcript-info-item"><span class="label">รหัสนักศึกษา:</span><span>${regData.studentId||'สร้างอัตโนมัติเมื่อยืนยัน'}</span></div>
                        <div class="transcript-info-item"><span class="label">คณะ:</span><span>${regData.faculty||'-'}</span></div>
                        <div class="transcript-info-item"><span class="label">หลักสูตร:</span><span>${regData.program||'-'}</span></div>
                        <div class="transcript-info-item"><span class="label">สาขาวิชา:</span><span>${regData.department||'-'}</span></div>
                        <div class="transcript-info-item"><span class="label">สถาบันที่จบ:</span><span>${regData.prevSchool||'-'}</span></div>
                        <div class="transcript-info-item"><span class="label">สาขาที่จบ:</span><span>${regData.prevMajor||'-'}</span></div>
                        <div class="transcript-info-item"><span class="label">GPA:</span><span>${regData.prevGPA||'-'}</span></div>
                        <div class="transcript-info-item"><span class="label">สถานที่ทำงาน:</span><span>${regData.workPlace||'-'}</span></div>
                        <div class="transcript-info-item"><span class="label">ตำแหน่ง:</span><span>${regData.workPosition||'-'}</span></div>
                        <div class="transcript-info-item"><span class="label">แหล่งทุน:</span><span>${regData.fundType||'-'} ${regData.fundOther ? '('+regData.fundOther+')' : ''}</span></div>
                    </div>
                </div>
            </div>
        </div>`;
    return '';
}

function saveStepData(step) {
    if (step === 1) {
        regData.prefix = document.getElementById('reg_prefix').value;
        regData.idCard = document.getElementById('reg_idCard').value;
        regData.firstName = document.getElementById('reg_firstName').value;
        regData.lastName = document.getElementById('reg_lastName').value;
        regData.firstNameEn = document.getElementById('reg_firstNameEn').value;
        regData.lastNameEn = document.getElementById('reg_lastNameEn').value;
        regData.dob = document.getElementById('reg_dob').value;
        regData.gender = document.getElementById('reg_gender').value;
        regData.email = document.getElementById('reg_email').value;
        regData.phone = document.getElementById('reg_phone').value;
    } else if (step === 2) {
        regData.studentId = document.getElementById('reg_studentId').value;
        regData.faculty = document.getElementById('reg_faculty').value;
        regData.program = document.getElementById('reg_program').value;
        regData.department = document.getElementById('reg_department').value;
        regData.admissionYear = document.getElementById('reg_admissionYear').value;
        regData.prevSchool = document.getElementById('reg_prevSchool').value;
        regData.prevMajor = document.getElementById('reg_prevMajor').value;
        regData.graduationDate = document.getElementById('reg_graduationDate').value;
        regData.prevGPA = document.getElementById('reg_prevGPA').value;
        // Save work history for up to 5 entries
        for (let i = 1; i <= 5; i++) {
            const el = document.getElementById('reg_workPlace'+i);
            if (el) {
                regData['workPlace'+i] = el.value;
                regData['workPosition'+i] = document.getElementById('reg_workPosition'+i).value;
                regData['workDuration'+i] = document.getElementById('reg_workDuration'+i).value;
                regData['workPeriod'+i] = document.getElementById('reg_workPeriod'+i).value;
            }
        }
    } else if (step === 3) {
        regData.address = document.getElementById('reg_address').value;
        regData.currentWorkPlace = document.getElementById('reg_currentWorkPlace').value;
        regData.workAddress = document.getElementById('reg_workAddress').value;
        // Fund type from radio
        const fundRadio = document.querySelector('input[name="fundType"]:checked');
        regData.fundType = fundRadio ? fundRadio.value : '';
        const fundOtherEl = document.getElementById('reg_fundOther');
        regData.fundOther = fundOtherEl ? fundOtherEl.value : '';
    }
}

function regNext() {
    saveStepData(registrationStep);
    if (registrationStep < 4) { registrationStep++; renderPage(); }
}

function regPrev() {
    saveStepData(registrationStep);
    if (registrationStep > 1) { registrationStep--; renderPage(); }
}

window.selectFundType = function(type) {
    const otherInput = document.getElementById('reg_fundOther');
    if (type === 'other') {
        if (otherInput) otherInput.style.display = 'block';
    } else {
        if (otherInput) { otherInput.style.display = 'none'; otherInput.value = ''; }
    }
};

window.addWorkBlock = function() {
    for (let i = 2; i <= 5; i++) {
        const block = document.getElementById('workBlock' + i);
        if (block && block.style.display === 'none') {
            block.style.display = 'block';
            return;
        }
    }
    alert('เพิ่มได้สูงสุด 5 สถานที่ทำงาน');
};

async function regSubmit() {
    showApiLoading('กำลังบันทึกข้อมูลการลงทะเบียน...');
    
    const payload = {
        'คำนำหน้า': regData.prefix,
        'ชื่อ (ไทย)': regData.firstName,
        'นามสกุล (ไทย)': regData.lastName,
        'ชื่อ (EN)': regData.firstNameEn,
        'นามสกุล (EN)': regData.lastNameEn,
        'เลขบัตรประชาชน': regData.idCard,
        'รหัสนักศึกษา': regData.studentId || ('68' + Math.floor(Math.random() * 10000000).toString().padStart(8, '0')),
        'วันเกิด (YYYY-MM-DD)': regData.dob,
        'เพศ': regData.gender || 'ไม่ระบุ',
        'อีเมล': regData.email,
        'E-mail ของสถาบัน': regData.institutionalEmail || (regData.studentId + '@pi.ac.th'),
        'เบอร์โทร': regData.phone,
        'สาขาวิชา': regData.department,
        'ปีการศึกษาที่เข้า': regData.admissionYear || (new Date().getFullYear() + 543),
        'ที่อยู่': regData.address,
        'หลักสูตร': regData.program || 'หลักสูตรพยาบาลศาสตรมหาบัณฑิต',
        'คณะ': regData.faculty || 'คณะพยาบาลศาสตร์ สถาบันพระบรมราชชนก',
        'Username': regData.username || regData.studentId,
        'Password': regData.password || '123456'
    };

    const res = await postData('registerStudent', payload);
    hideApiLoading();

    if (res && res.status === 'success') {
        openModal('สำเร็จ!', `<div style="text-align:center;padding:20px"><div style="font-size:3rem;margin-bottom:12px">🎉</div><h3 style="margin-bottom:8px">ลงทะเบียนนักศึกษาใหม่สำเร็จ</h3><p style="color:var(--text-muted)">รหัสนักศึกษาใหม่: <strong>${payload['รหัสนักศึกษา']}</strong></p><p style="color:var(--text-muted);font-size:0.85rem;margin-top:8px">ข้อมูลถูกบันทึกลงในฐานข้อมูล (ฐานข้อมูล) แล้ว</p><button class="btn btn-primary" style="margin-top:16px" onclick="closeModal();registrationStep=1;regData={};if(typeof bootApp === 'function') bootApp(); else navigateTo('dashboard');">กลับหน้าหลัก</button></div>`);
    } else {
        openModal('เกิดข้อผิดพลาด', `<div style="text-align:center;padding:20px"><div style="font-size:3rem;margin-bottom:12px">❌</div><h3 style="margin-bottom:8px">ไม่สามารถบันทึกข้อมูลได้</h3><p style="color:var(--danger)">${res ? res.message : 'Network Error'}</p><button class="btn btn-secondary" style="margin-top:16px" onclick="closeModal()">ปิด</button></div>`);
    }
}

// ============================
// Bulk Import Functions
// ============================
let bulkImportData = [];

window.switchRegMode = function(mode) {
    window._regMode = mode;
    renderPage();
};

window.downloadRegTemplate = function() {
    const headers = [
        'คำนำหน้า','ชื่อ (ไทย)','นามสกุล (ไทย)','ชื่อ (EN)','นามสกุล (EN)',
        'เลขบัตรประชาชน','รหัสนักศึกษา','วันเกิด (YYYY-MM-DD)','เพศ','อีเมล','E-mail ของสถาบัน','เบอร์โทร',
        'สาขาวิชา','ปีการศึกษาที่เข้า',
        'สถาบันที่จบ','สาขาที่จบ','วันที่สำเร็จ (YYYY-MM-DD)','GPA',
        'ที่อยู่','สถานที่ทำงาน','ตำแหน่ง','แหล่งทุน','Username','Password'
    ];
    const sampleRow = [
        'นางสาว','พิมพ์ใจ','รักดี','Pimjai','Rakdee',
        '1-1234-56789-01-2','6901012630','1995-01-15','หญิง','pimjai@email.com','pimjai.r@pi.ac.th','081-234-5678',
        'การพยาบาลจิตเวชและสุขภาพจิต','2569',
        'มหาวิทยาลัยมหิดล','พยาบาลศาสตรบัณฑิต','2567-03-15','3.45',
        '123 ถ.พหลโยธิน กทม. 10900','โรงพยาบาลพระมงกุฎเกล้า','พยาบาลวิชาชีพ','ทุนส่วนตัว','pimjai.r','123456'
    ];
    const BOM = '\uFEFF';
    const csv = BOM + headers.join(',') + '\n' + sampleRow.join(',') + '\n';
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_ลงทะเบียนนักศึกษา.csv';
    a.click();
    URL.revokeObjectURL(url);
};

window.handleBulkFile = function(file) {
    if (!file) return;
    const dropText = document.getElementById('dropZoneText');
    if (dropText) dropText.textContent = '📄 ' + file.name;

    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        if (text.includes('')) {
            // Likely saved from Excel as ANSI/TIS-620. Re-read as Thai windows-874
            const reader874 = new FileReader();
            reader874.onload = function(errEv) {
                processCsvText(errEv.target.result);
            };
            reader874.readAsText(file, 'windows-874');
            return;
        }
        processCsvText(text);
    };
    reader.readAsText(file, 'UTF-8');
};

function processCsvText(text) {
    // Robustly split by any line ending (Windows, Mac, Linux)
    const lines = text.split(/\r?\n|\r/).filter(l => l.trim());
    if (lines.length < 2) {
        alert('ไฟล์ไม่มีข้อมูล (ต้องมีอย่างน้อย 1 แถวหัวตาราง + 1 แถวข้อมูล)');
        return;
    }
    const headers = parseCSVLine(lines[0]);
    bulkImportData = [];
    for (let i = 1; i < lines.length; i++) {
        const cols = parseCSVLine(lines[i]);
        if (cols.length < 2) continue;
        const row = {};
        headers.forEach((h, idx) => { row[h.trim()] = (cols[idx] || '').trim(); });
        bulkImportData.push(row);
    }
    renderBulkPreview(headers, bulkImportData);
}

function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuote = false;
    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') { inQuote = !inQuote; }
        else if (ch === ',' && !inQuote) { result.push(current); current = ''; }
        else { current += ch; }
    }
    result.push(current);
    return result;
}

function renderBulkPreview(headers, data) {
    const card = document.getElementById('bulkPreviewCard');
    const badge = document.getElementById('bulkCountBadge');
    const tableDiv = document.getElementById('bulkPreviewTable');
    if (!card || !tableDiv) return;

    card.style.display = 'block';
    badge.textContent = data.length + ' รายการ';

    const displayHeaders = headers.slice(0, 10); // Show first 10 columns for readability
    let html = '<table class="data-table" style="font-size:0.78rem;"><thead><tr><th>#</th>';
    displayHeaders.forEach(h => { html += `<th>${h.trim()}</th>`; });
    if (headers.length > 10) html += '<th>...</th>';
    html += '</tr></thead><tbody>';
    data.forEach((row, i) => {
        html += `<tr><td>${i+1}</td>`;
        displayHeaders.forEach(h => { html += `<td>${row[h.trim()] || '-'}</td>`; });
        if (headers.length > 10) html += '<td>+' + (headers.length - 10) + ' คอลัมน์</td>';
        html += '</tr>';
    });
    html += '</tbody></table>';
    tableDiv.innerHTML = html;
}

window.clearBulkImport = function() {
    bulkImportData = [];
    const card = document.getElementById('bulkPreviewCard');
    if (card) card.style.display = 'none';
    const dropText = document.getElementById('dropZoneText');
    if (dropText) dropText.textContent = 'ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์';
    const fileInput = document.getElementById('bulkFileInput');
    if (fileInput) fileInput.value = '';
};

window.submitBulkImport = async function() {
    if (bulkImportData.length === 0) { alert('ไม่มีข้อมูลสำหรับนำเข้า'); return; }
    showApiLoading(`กำลังนำเข้าข้อมูลนักศึกษา ${bulkImportData.length} รายการ...`);

    let successCount = 0;
    for (const row of bulkImportData) {
        const studentId = row['รหัสนักศึกษา'] || ('68' + Math.floor(Math.random() * 10000000).toString().padStart(8, '0'));
        const payload = {
            'คำนำหน้า': row['คำนำหน้า'] || '',
            'ชื่อ (ไทย)': row['ชื่อ (ไทย)'] || '',
            'นามสกุล (ไทย)': row['นามสกุล (ไทย)'] || '',
            'ชื่อ (EN)': row['ชื่อ (EN)'] || '',
            'นามสกุล (EN)': row['นามสกุล (EN)'] || '',
            'เลขบัตรประชาชน': row['เลขบัตรประชาชน'] || '',
            'รหัสนักศึกษา': studentId,
            'วันเกิด (YYYY-MM-DD)': row['วันเกิด (YYYY-MM-DD)'] || '',
            'เพศ': row['เพศ'] || '',
            'อีเมล': row['อีเมล'] || '',
            'E-mail ของสถาบัน': row['E-mail ของสถาบัน'] || (studentId + '@pi.ac.th'),
            'เบอร์โทร': row['เบอร์โทร'] || '',
            'สาขาวิชา': row['สาขาวิชา'] || '',
            'ปีการศึกษาที่เข้า': row['ปีการศึกษาที่เข้า'] || (new Date().getFullYear() + 543),
            'ที่อยู่': row['ที่อยู่'] || '',
            'Username': row['Username'] || studentId,
            'Password': row['Password'] || '123456'
        };
        const res = await postData('registerStudent', payload);
        if (res && res.status === 'success') successCount++;
    }

    hideApiLoading();
    openModal('นำเข้าข้อมูลเสร็จสิ้น', `<div style="text-align:center;padding:20px"><div style="font-size:3rem;margin-bottom:12px">📋</div><h3 style="margin-bottom:8px">นำเข้าข้อมูลสำเร็จ</h3><p style="color:var(--text-muted)">นำเข้าสำเร็จ <strong>${successCount}</strong> จาก ${bulkImportData.length} รายการ</p><button class="btn btn-primary" style="margin-top:16px" onclick="closeModal();clearBulkImport();if(typeof bootApp === 'function') bootApp();">ตกลง</button></div>`);
};

