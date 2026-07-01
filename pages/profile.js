// ============================
// Student Profile Page
// ============================
pages['student-profile'] = function () {
    const isAdmin = (window.currentUserRole === 'staff' || window.currentUserRole === 'admin');
    const st = MOCK.student;

    if (!st && !isAdmin) {
        return `
        <div class="animate-in">
            <div class="page-header">
                <h1 class="page-title">ข้อมูลนักศึกษา</h1>
                <p class="page-subtitle">ไม่พบข้อมูลนักศึกษา กรุณาลงทะเบียนก่อน</p>
            </div>
            <div class="card"><div class="card-body" style="text-align:center; padding:40px;">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5" style="margin-bottom:15px;"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <h3 style="color:var(--text-muted);">ยังไม่มีข้อมูลนักศึกษา</h3>
                <p style="color:var(--text-muted); font-size:0.9rem;">กรุณาลงทะเบียนนักศึกษาใหม่ก่อนเข้าใช้งานหน้านี้</p>
            </div></div>
        </div>`;
    }

    if (!st && isAdmin) {
        return `
        <div class="animate-in">
            <div class="page-header" style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <h1 class="page-title">ข้อมูลนักศึกษา</h1>
                    <p class="page-subtitle">กรุณาเลือกนักศึกษาเพื่อดูข้อมูล</p>
                </div>
                <div style="flex-grow: 1; max-width: 400px; margin: 0 20px;">
                    <div class="form-group" style="margin-bottom: 0;">
                        <select id="studentSelector" class="form-input" onchange="changeProfileStudent(this.value)" style="padding-right: 30px;">
                            <option value="">-- เลือกนักศึกษาเพื่อดูข้อมูล --</option>
                            ${(MOCK.students || []).map(s => `
                                <option value="${s.id || s.studentId}">
                                    ${s.studentId || ''} - ${s.prefix || ''}${s.firstName || ''} ${s.lastName || ''}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                </div>
            </div>
            <div class="card"><div class="card-body" style="text-align:center; padding:60px;">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5" style="margin-bottom:20px; opacity:0.5;"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <h3 style="color:var(--text-muted);">กรุณาเลือกนักศึกษา</h3>
                <p style="color:var(--text-muted);">ค้นหาและเลือกรายชื่อนักศึกษาจากรายการด้านบนเพื่อดูรายละเอียด</p>
            </div></div>
        </div>`;
    }

    // Safe property access with defaults
    const studentId = st.studentId || st.id || '-';
    const prefix = st.prefix || '';
    const firstName = st.firstName || '';
    const lastName = st.lastName || '';
    const firstNameEn = st.firstNameEn || '-';
    const lastNameEn = st.lastNameEn || '-';
    const faculty = st.faculty || '-';
    const department = st.department || '-';
    const program = st.program || '-';
    const year = st.year || '-';
    const status = st.status || 'กำลังศึกษา';
    const admissionYear = st.admissionYear || '-';
    const advisor = st.advisor || '-';
    const email = st.email || '-';
    const personalEmail = st.personalEmail || '-';
    const phone = st.phone || '-';
    const workplace = st.workplace || '-';
    const position = st.position || '-';
    const dob = window.formatDateThai(st.dob);
    const address = st.address || '-';
    const parentName = st.parentName || '-';
    const parentPhone = st.parentPhone || '-';
    const gpa = typeof st.gpa === 'number' ? st.gpa : 0;
    const totalCredits = typeof st.totalCredits === 'number' ? st.totalCredits : 0;
    const requiredCredits = typeof st.requiredCredits === 'number' ? st.requiredCredits : 1;
    const creditPercent = Math.round((totalCredits / requiredCredits) * 100);
    const initial = firstName ? firstName[0] : '?';

    return `
    <div class="animate-in" style="font-size:0.95rem; color:var(--text-primary);">
        <div class="page-header" style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap: wrap; gap: 15px; margin-bottom:25px;">
            <div>
                <h1 class="page-title">ข้อมูลนักศึกษา</h1>
                <p class="page-subtitle">ข้อมูลส่วนตัวและข้อมูลการศึกษาปัจจุบัน</p>
            </div>
            
            <div style="display:flex; gap:12px; align-items: center;">
                ${(window.currentUserRole === 'staff' || window.currentUserRole === 'admin' || window.hasPermission('import_student')) ? `
                <div style="flex-grow: 1; min-width: 250px;">
                    <select id="studentSelector" class="form-input" onchange="changeProfileStudent(this.value)" style="padding-right: 30px; height:38px;">
                        <option value="">-- เลือกนักศึกษา --</option>
                        ${(MOCK.students || []).map(s => `
                            <option value="${s.id || s.studentId}" ${(st && (st.id === s.id || st.studentId === s.studentId)) ? 'selected' : ''}>
                                ${s.studentId || ''} - ${s.prefix || ''}${s.firstName || ''} ${s.lastName || ''}
                            </option>
                        `).join('')}
                    </select>
                </div>
                ` : ''}

                ${(window.currentUserRole === 'student') ? `
                <button class="btn btn-primary" onclick="openEditStudentProfile()" style="gap:6px; font-size:0.85rem; height:38px;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    แก้ไขข้อมูล
                </button>
                ` : ''}
                
                ${window.hasPermission('import_student') ? `
                <button class="btn btn-primary" onclick="importProfile()" style="gap:6px; font-size:0.85rem; height:38px;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    นำเข้าข้อมูล
                </button>
                ` : ''}
            </div>
        </div>

        <!-- Upper Profile Header Card -->
        <div class="card animate-in animate-delay-1" style="margin-bottom:30px; border:none; box-shadow: 0 4px 20px -5px rgba(0,0,0,0.05);">
            <div class="card-body" style="padding:25px; display:flex; gap:30px; align-items:center;">
                <div class="profile-avatar-large" style="width:100px; height:100px; font-size:2.5rem; background:linear-gradient(135deg, var(--primary-color), var(--accent-primary)); border:4px solid white; box-shadow:0 10px 15px -3px rgba(0,0,0,0.1);">${initial}</div>
                <div style="flex:1;">
                    <h2 style="margin:0 0 8px 0; font-size:1.8rem; font-weight:800; color:var(--text-primary);">${prefix}${firstName} ${lastName}</h2>
                    <div style="display:flex; gap:20px; align-items:center; flex-wrap:wrap;">
                        <div style="color:var(--text-muted); font-weight:600;"><span style="color:var(--accent-primary);">ID:</span> ${studentId}</div>
                        <div style="display:flex; align-items:center; gap:8px;">
                            ${getStatusBadge(status)}
                            ${isAdmin ? `
                            <button class="btn btn-ghost btn-sm" onclick="openStatusUpdateModal()" title="เปลี่ยนสถานะ" style="padding: 2px; border-radius: 4px; color:var(--text-muted);">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            </button>
                            ` : ''}
                        </div>
                        ${(isAdmin && status !== 'สำเร็จการศึกษา' && status !== 'Graduated') ? `
                        <button class="btn btn-primary btn-sm" onclick="openApproveGraduationModal()" style="background:#10b981; border:none; padding:6px 16px; border-radius:30px; border:none; box-shadow:0 4px 6px -1px rgba(16, 185, 129, 0.2);">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                            อนุมัติจบการศึกษา
                        </button>
                        ` : ''}
                    </div>
                </div>
                <div style="text-align:right;">
                    <div style="font-size:0.75rem; text-transform:uppercase; color:var(--text-muted); font-weight:700; letter-spacing:0.05em; margin-bottom:4px;">GPA สะสม</div>
                    <div style="font-size:2.2rem; font-weight:900; color:var(--accent-primary); line-height:1;">${gpa.toFixed(2)}</div>
                </div>
            </div>
        </div>

        <div style="display:grid; grid-template-columns: 1.2fr 1fr; gap:30px; margin-bottom:30px;">
            <!-- Column 1: Personal Info -->
            <div class="card animate-in animate-delay-2" style="border:none; box-shadow: 0 4px 20px -5px rgba(0,0,0,0.05);">
                <div class="card-body" style="padding:25px;">
                    <div style="display:flex; align-items:center; gap:10px; color:#9d174d; border-bottom:1px solid #fecdd3; padding-bottom:8px; margin-bottom:20px;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        <h3 style="font-weight:700; font-size:1.1rem; margin:0;">ข้อมูลส่วนบุคคล</h3>
                    </div>
                    <div style="display:grid; gap:12px;">
                        <div><span style="font-weight:700; color:var(--text-primary);">ชื่อ-สกุล (TH):</span> <span style="margin-left:5px;">${prefix}${firstName} ${lastName}</span></div>
                        <div><span style="font-weight:700; color:var(--text-primary);">ชื่อ-สกุล (EN):</span> <span style="margin-left:5px;">${firstNameEn} ${lastNameEn}</span></div>
                        <div><span style="font-weight:700; color:var(--text-primary);">รหัสนักศึกษา:</span> <span style="margin-left:5px;">${studentId}</span></div>
                        <div><span style="font-weight:700; color:var(--text-primary);">วันเกิด:</span> <span style="margin-left:5px;">${dob}</span></div>
                        <div><span style="font-weight:700; color:var(--text-primary);">อีเมลส่วนตัว:</span> <span style="margin-left:5px;">${personalEmail}</span></div>
                        <div><span style="font-weight:700; color:var(--text-primary);">เบอร์โทรศัพท์:</span> <span style="margin-left:5px;">${phone}</span></div>
                        <div><span style="font-weight:700; color:var(--text-primary);">ที่อยู่:</span> <span style="margin-left:5px; line-height:1.4;">${address}</span></div>
                        <div style="margin-top:10px; padding-top:10px; border-top:1px dashed #e2e8f0;">
                            <div><span style="font-weight:700; color:var(--text-primary);">สถานที่ปฏิบัติงาน:</span> <span style="margin-left:5px;">${workplace}</span></div>
                            <div><span style="font-weight:700; color:var(--text-primary);">ตำแหน่ง:</span> <span style="margin-left:5px;">${position}</span></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Column 2: Education Info -->
            <div class="card animate-in animate-delay-3" style="border:none; box-shadow: 0 4px 20px -5px rgba(0,0,0,0.05);">
                <div class="card-body" style="padding:25px;">
                    <div style="display:flex; align-items:center; gap:10px; color:#9d174d; border-bottom:1px solid #fecdd3; padding-bottom:8px; margin-bottom:20px;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                        <h3 style="font-weight:700; font-size:1.1rem; margin:0;">ข้อมูลการศึกษา</h3>
                    </div>
                    <div style="display:grid; gap:12px;">
                        <div><span style="font-weight:700; color:var(--text-primary);">คณะ:</span> <span style="margin-left:5px;">${faculty}</span></div>
                        <div><span style="font-weight:700; color:var(--text-primary);">สาขาวิชา:</span> <span style="margin-left:5px;">${department}</span></div>
                        <div><span style="font-weight:700; color:var(--text-primary);">หลักสูตร:</span> <span style="margin-left:5px;">${program}</span></div>
                        <div><span style="font-weight:700; color:var(--text-primary);">ปีที่เข้าศึกษา:</span> <span style="margin-left:5px;">${admissionYear}</span></div>
                        <div><span style="font-weight:700; color:var(--text-primary);">อาจารย์ที่ปรึกษา (ทั่วไป):</span> <span style="margin-left:5px;">${advisor}</span></div>
                        
                        <div style="margin-top:15px; background:#f8fafc; padding:15px; border-radius:12px; border:1px solid #e2e8f0;">
                            <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:0.85rem; font-weight:700; color:#475569;">
                                <span>หน่วยกิตสะสม</span><span>${totalCredits} / ${requiredCredits}</span>
                            </div>
                            <div class="progress-bar" style="height:10px; background:#e2e8f0; border-radius:10px; overflow:hidden;">
                                <div class="progress-fill" style="width:${creditPercent}%; background:linear-gradient(90deg, #10b981, #059669); height:100%;"></div>
                            </div>
                            <div style="text-align:right; font-size:0.75rem; color:var(--text-muted); margin-top:4px; font-weight:600;">${creditPercent}% สำเร็จการศึกษา</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Thesis Topic Box (Premium Highlight) -->
        <div class="animate-in animate-delay-4" style="background:#f8fafc; padding:30px; border-radius:20px; border:1px solid #e2e8f0; margin-top:10px; position:relative; box-shadow: 0 4px 15px -3px rgba(0,0,0,0.04);">
            <div style="display:flex; align-items:center; gap:12px; margin-bottom:15px; color:#b45309;">
                <div style="background:#fef3c7; padding:8px; border-radius:10px; display:flex; align-items:center; justify-content:center; width:40px; height:40px;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/></svg>
                </div>
                <h3 style="margin:0; font-size:1.2rem; font-weight:800;">หัวข้อวิทยานิพนธ์ (Thesis Topic)</h3>
            </div>
            
            <div style="padding-left:12px; border-left:4px solid #f59e0b; margin-left:18px;">
                <div style="margin-bottom:10px; font-size:1.1rem; font-weight:700; color:#1e293b; line-height:1.5;">${st.thesisInfo?.title || 'ยังไม่ได้ระบุหัวข้อวิทยานิพนธ์'}</div>
                <div style="font-style:italic; color:#64748b; font-size:1rem; line-height:1.5; margin-bottom:15px;">${st.thesisInfo?.titleEn || 'Not specified'}</div>
                
                <div style="border-top:1px dashed #e2e8f0; padding-top:15px; margin-top:10px; display:grid; gap:8px;">
                    <div><span style="font-weight:700; color:#475569;">อาจารย์ที่ปรึกษาหลัก:</span> <span style="margin-left:8px; color:var(--accent-primary); font-weight:700;">${(st.mainAdvisor && st.mainAdvisor !== '-') ? st.mainAdvisor : 'รอการแต่งตั้ง'}</span></div>
                    <div><span style="font-weight:700; color:#475569;">อาจารย์ที่ปรึกษาร่วม (1):</span> <span style="margin-left:8px; color:var(--text-primary);">${(st.coAdvisorInternal && st.coAdvisorInternal !== '-') ? st.coAdvisorInternal : '-'}</span></div>
                    <div><span style="font-weight:700; color:#475569;">อาจารย์ที่ปรึกษาร่วม (2):</span> <span style="margin-left:8px; color:var(--text-primary);">${(st.coAdvisorExternal && st.coAdvisorExternal !== '-') ? st.coAdvisorExternal : '-'}</span></div>
                </div>
            </div>
        </div>
    </div>`;
};

window.exportProfileTemplate = function () {
    const headers = ['รหัสนักศึกษา', 'คำนำหน้า', 'ชื่อ', 'นามสกุล', 'คณะ', 'สาขาวิชา', 'หลักสูตร', 'ปีที่เข้าศึกษา', 'สถานะ', 'อีเมล', 'โทรศัพท์', 'GPA', 'หน่วยกิตสะสม'];
    const sample = ['6801012630', 'นางสาว', 'พิมพ์ใจ', 'รักดี', 'คณะพยาบาลศาสตร์ สถาบันพระบรมราชชนก', 'สาขาวิชาการพยาบาลจิตเวชและสุขภาพจิต', 'พยาบาลศาสตรมหาบัณฑิต (พย.ม.)', '2568', 'กำลังศึกษา', 'pimjai.r@pi.ac.th', '081-234-5678', '3.45', '96'];
    downloadCSVTemplate('template_ข้อมูลนักศึกษา.csv', headers, sample);
};

window.importProfile = function () {
    handleGenericCSVImport((data) => {
        if (data && data.length > 0) {
            const row = data[0]; // Take first row to update current student
            MOCK.student.studentId = row['รหัสนักศึกษา'] || MOCK.student.studentId;
            MOCK.student.prefix = row['คำนำหน้า'] || MOCK.student.prefix;
            MOCK.student.firstName = row['ชื่อ'] || MOCK.student.firstName;
            MOCK.student.lastName = row['นามสกุล'] || MOCK.student.lastName;
            MOCK.student.faculty = row['คณะ'] || MOCK.student.faculty;
            MOCK.student.department = row['สาขาวิชา'] || MOCK.student.department;
            MOCK.student.program = row['หลักสูตร'] || MOCK.student.program;
            MOCK.student.admissionYear = row['ปีที่เข้าศึกษา'] || MOCK.student.admissionYear;
            MOCK.student.status = row['สถานะ'] || MOCK.student.status;
            MOCK.student.email = row['อีเมล'] || MOCK.student.email;
            MOCK.student.phone = row['โทรศัพท์'] || MOCK.student.phone;
            MOCK.student.gpa = parseFloat(row['GPA']) || MOCK.student.gpa;
            MOCK.student.totalCredits = parseInt(row['หน่วยกิตสะสม']) || MOCK.student.totalCredits;

            alert('นำเข้าข้อมูลนักศึกษาสำเร็จ');
            renderPage();
        }
    });
};


// ============================
// Edit Profile Modal
// ============================
window.openEditStudentProfile = function () {
    const st = MOCK.student;
    if (!st) {
        alert('กรุณาเลือกนักศึกษาที่ต้องการแก้ไขข้อมูลก่อนครับ');
        return;
    }
    const isAdmin = (window.currentUserRole === 'staff' || window.currentUserRole === 'admin');
    
    // Group teachers for advisor selection
    const allTeachers = MOCK.teachers || [];
    const academicT = allTeachers.filter(t => (t.Type || t['ประเภทบคลากร']) === 'Academic' || (t.position || '').includes('อาจารย์'));
    const thesisT = allTeachers.filter(t => (t.Type || t['ประเภทบคลากร']) === 'Thesis' || (t.position || '').includes('อาจารย์'));

    const modalHtml = `
    <div style="padding:10px;">
        <div class="form-group" style="margin-bottom:15px;">
            <label class="form-label">เบอร์โทรศัพท์ (Phone)</label>
            <input type="text" id="editPhone" class="form-input" value="${st.phone || ''}">
        </div>
        <div class="form-group" style="margin-bottom:15px;">
            <label class="form-label">อีเมลส่วนตัว (Personal Email)</label>
            <input type="email" id="editPersonalEmail" class="form-input" value="${st.personalEmail || ''}">
        </div>
        <div class="form-group" style="margin-bottom:15px;">
            <label class="form-label">สถานที่ปฏิบัติงาน (Workplace)</label>
            <input type="text" id="editWorkplace" class="form-input" value="${st.workplace || ''}">
        </div>
        <div class="form-group" style="margin-bottom:15px;">
            <label class="form-label">ตำแหน่ง (Position)</label>
            <input type="text" id="editPosition" class="form-input" value="${st.position || ''}">
        </div>

        ${isAdmin ? `
        <hr style="border:0; border-top:1px dashed var(--border-color); margin:20px 0;">
        <h4 style="margin-bottom:15px; font-size:1rem; color:var(--accent-primary);">การแต่งตั้งอาจารย์ (Admin Only)</h4>
        
        <div class="form-group" style="margin-bottom:15px;">
            <label class="form-label">อาจารย์ที่ปรึกษา (Academic Advisor)</label>
            <select id="editAdvisor" class="form-input">
                <option value="-">-- เลือกอาจารย์ที่ปรึกษา --</option>
                ${allTeachers.map(t => {
                    const name = (t.Prefix || '') + (t.FirstName || '') + ' ' + (t.LastName || '');
                    return `<option value="${name}" ${st.advisor === name ? 'selected' : ''}>${name}</option>`;
                }).join('')}
            </select>
        </div>

        <div class="form-group" style="margin-bottom:15px;">
            <label class="form-label">อาจารย์ที่ปรึกษาวิทยานิพนธ์ (Thesis Advisor)</label>
            <select id="editThesisAdvisor" class="form-input">
                <option value="-">-- เลือกอาจารย์ที่ปรึกษาวิทยานิพนธ์ --</option>
                ${allTeachers.map(t => {
                    const name = (t.Prefix || '') + (t.FirstName || '') + ' ' + (t.LastName || '');
                    return `<option value="${name}" ${st.thesisAdvisor === name ? 'selected' : ''}>${name}</option>`;
                }).join('')}
            </select>
        </div>
        ` : ''}

        <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:20px;">
            <button class="btn btn-secondary" onclick="closeModal()">ยกเลิก</button>
            <button class="btn btn-primary" onclick="saveStudentProfileEdit()">บันทึกข้อมูล</button>
        </div>
    </div>
    `;
    openModal('แก้ไขข้อมูลส่วนตัว', modalHtml);
};

window.saveStudentProfileEdit = async function () {
    const st = MOCK.student;
    if (!st) return;

    const isAdmin = (window.currentUserRole === 'staff' || window.currentUserRole === 'admin');
    const updateData = {
        phone: document.getElementById('editPhone').value,
        personalEmail: document.getElementById('editPersonalEmail').value,
        workplace: document.getElementById('editWorkplace').value,
        position: document.getElementById('editPosition').value
    };

    if (isAdmin) {
        updateData.advisor = document.getElementById('editAdvisor').value;
        updateData.thesisAdvisor = document.getElementById('editThesisAdvisor').value;
    }

    showApiLoading('กำลังบันทึกข้อมูล...');
    try {
        const studentId = st.studentId || st.id;
        const res = await window.api.updateStudentDetail(studentId, updateData);
        
        if (res && res.status === 'success') {
            // Update local state
            Object.assign(st, updateData);
            
            // Sync with global list
            const idx = (MOCK.students || []).findIndex(s => (s.id || s.studentId) === studentId);
            if (idx !== -1) {
                Object.assign(MOCK.students[idx], updateData);
            }

            hideApiLoading();
            closeModal();
            renderPage();
            setTimeout(() => alert('บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว'), 300);
        } else {
            throw new Error(res ? res.message : 'Unknown error');
        }
    } catch (err) {
        hideApiLoading();
        alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล: ' + err.message);
    }
};

// ============================
// Graduation Approval
// ============================
window.openApproveGraduationModal = function() {
    const st = MOCK.student;
    if (!st) return;

    const modalHtml = `
    <div style="padding:10px;">
        <p style="margin-bottom:15px; color:var(--text-secondary);">คุณกำลังจะอนุมัติการสำเร็จการศึกษาให้แก่ <strong>${st.prefix || ''}${st.firstName} ${st.lastName}</strong></p>
        
        <div class="form-group" style="margin-bottom:15px;">
            <label class="form-label">ปีที่สำเร็จการศึกษา (พ.ศ.)</label>
            <input type="number" id="gradYear" class="form-input" value="${new Date().getFullYear() + 543}">
        </div>
        
        <div class="form-group" style="margin-bottom:15px;">
            <label class="form-label">สถานที่ปฏิบัติงานหลังบรรจุ/ทำงาน</label>
            <input type="text" id="gradWorkplace" class="form-input" placeholder="เช่น รพ.พุทธชินราช, สสจ.พิษณุโลก" value="${st.workplace || ''}">
        </div>

        <div class="form-group" style="margin-bottom:15px;">
            <label class="form-label">ตำแหน่ง</label>
            <input type="text" id="gradPosition" class="form-input" placeholder="เช่น พยาบาลวิชาชีพ" value="${st.position || ''}">
        </div>

        <div style="background:var(--warning-bg); padding:12px; border-radius:var(--radius-md); border:1px solid var(--warning); margin-bottom:20px;">
            <p style="font-size:0.82rem; color:var(--warning); margin:0;">
                <strong>คำแนะนำ:</strong> การอนุมัติจะเปลี่ยนสถานะนักศึกษาเป็น "สำเร็จการศึกษา" และย้ายข้อมูลไปยังฐานข้อมูลศิษย์เก่าทันที
            </p>
        </div>

        <div style="display:flex; justify-content:flex-end; gap:10px;">
            <button class="btn btn-secondary" onclick="closeModal()">ยกเลิก</button>
            <button class="btn btn-primary" onclick="submitGraduationApproval()" style="background:var(--success); border:none;">ยืนยันการสำเร็จการศึกษา</button>
        </div>
    </div>
    `;
    openModal('อนุมัติการสำเร็จการศึกษา', modalHtml);
};

window.submitGraduationApproval = function() {
    const gradYear = document.getElementById('gradYear').value;
    const gradWorkplace = document.getElementById('gradWorkplace').value;
    const gradPosition = document.getElementById('gradPosition').value;

    if (!gradYear) {
        alert('กรุณาระบุปีที่สำเร็จการศึกษา');
        return;
    }

    if (MOCK.student) {
        showApiLoading('กำลังบันทึกข้อมูลการสำเร็จการศึกษา...');
        
        // Update local object
        MOCK.student.status = 'สำเร็จการศึกษา';
        MOCK.student.graduationYear = gradYear;
        MOCK.student.workplace = gradWorkplace;
        MOCK.student.position = gradPosition;

        // Sync with main students list
        const idx = MOCK.students.findIndex(s => (s.id || s.studentId) === (MOCK.student.id || MOCK.student.studentId));
        if (idx !== -1) {
            MOCK.students[idx] = { ...MOCK.student };
        }

        // Trigger API Sync
        if (typeof window.syncActiveStudentData === 'function') {
            window.syncActiveStudentData();
        }

        setTimeout(() => {
            hideApiLoading();
            closeModal();
            alert('อนุมัติการสำเร็จการศึกษาเรียบร้อยแล้ว รายชื่อจะถูกย้ายไปยังฐานข้อมูลศิษย์เก่า');
            navigateTo('alumni');
        }, 1000);
    }
};

// ============================
// Status Update Logic
// ============================
window.openStatusUpdateModal = function() {
    const st = MOCK.student;
    if (!st) return;

    const statuses = [
        { val: 'กำลังศึกษา', label: 'กำลังศึกษา (Studying)', icon: '🟢' },
        { val: 'ลาพักการศึกษา', label: 'ลาพักการศึกษา (Leave of Absence)', icon: '🟡' },
        { val: 'ลาออก', label: 'ลาออก (Resigned)', icon: '🔴' },
        { val: 'สำเร็จการศึกษา', label: 'สำเร็จการศึกษา (Graduated)', icon: '🟣' }
    ];

    const modalHtml = `
    <div style="padding:10px;">
        <p style="margin-bottom:15px; color:var(--text-secondary);">เลือกสถานะใหม่สำหรับ <strong>${st.prefix || ''}${st.firstName} ${st.lastName}</strong></p>
        
        <div class="status-options" style="display:grid; gap:10px; margin-bottom:20px;">
            ${statuses.map(s => `
                <label style="display:flex; align-items:center; gap:12px; padding:12px; border:1px solid var(--border-color); border-radius:var(--radius-md); cursor:pointer; transition:var(--transition-fast);" onmouseover="this.style.borderColor='var(--accent-primary)'" onmouseout="this.style.borderColor='var(--border-color)'">
                    <input type="radio" name="newStatus" value="${s.val}" ${st.status === s.val ? 'checked' : ''} style="width:18px; height:18px; accent-color:var(--accent-primary);">
                    <div style="font-size:1.2rem;">${s.icon}</div>
                    <div style="font-weight:600; font-size:0.95rem;">${s.label}</div>
                </label>
            `).join('')}
        </div>

        <div style="display:flex; justify-content:flex-end; gap:10px;">
            <button class="btn btn-secondary" onclick="closeModal()">ยกเลิก</button>
            <button class="btn btn-primary" onclick="saveStudentStatusUpdate()">บันทึกสถานะ</button>
        </div>
    </div>
    `;
    openModal('แก้ไขสถานะนักศึกษา', modalHtml);
};

window.saveStudentStatusUpdate = async function() {
    const selected = document.querySelector('input[name="newStatus"]:checked');
    if (!selected) return;
    
    const newStatus = selected.value;
    const st = MOCK.student;
    if (!st) return;

    if (newStatus === st.status) {
        closeModal();
        return;
    }

    // Special case for Graduation
    if (newStatus === 'สำเร็จการศึกษา' || newStatus === 'Graduated') {
        closeModal();
        setTimeout(() => openApproveGraduationModal(), 100);
        return;
    }

    showApiLoading('กำลังอัปเดตสถานะนักศึกษา...');
    try {
        const studentId = st.studentId || st.id;
        const result = await window.api.updateStudentStatus(studentId, newStatus);
        
        if (result && result.status === 'success') {
            // Update local state
            st.status = newStatus;
            
            // Sync with global mock list
            const idx = (MOCK.students || []).findIndex(s => (s.id || s.studentId) === studentId);
            if (idx !== -1) {
                MOCK.students[idx].status = newStatus;
            }

            hideApiLoading();
            closeModal();
            renderPage();
            alert('อัปเดตสถานะนักศึกษาเรียบร้อยแล้ว');
        } else {
            throw new Error(result ? result.message : 'Unknown error');
        }
    } catch (err) {
        hideApiLoading();
        alert('เกิดข้อผิดพลาดในการอัปเดตสถานะ: ' + err.message);
    }
};
