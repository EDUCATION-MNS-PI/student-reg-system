// ============================
// Student Documents Page
// ============================
// ============================
// Student Petitions Page (Submission Form)
// ============================
pages['petitions-student'] = function () {
    const templates = MOCK.documentTemplates || [];

    return `
    <div class="animate-in">
        <div class="page-header">
            <h1 class="page-title">ยื่นคำร้องใหม่</h1>
            <p class="page-subtitle">กรอกข้อมูลเพื่อส่งคำร้องและเอกสารประกอบ</p>
        </div>

        <div class="card animate-in animate-delay-1" style="max-width: 900px; margin: 0 auto;">
            <div class="card-header">
                <h3 class="card-title">แบบฟอร์มยื่นคำร้อง</h3>
            </div>
            <div class="card-body">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
                    
                    <!-- Row 1 -->
                    <div class="form-group" style="grid-column: 1 / -1;">
                        <label class="form-label">ประเภทการยื่น <span style="color:var(--danger-color)">*</span></label>
                        <div style="display:flex; gap:16px;">
                            <label style="flex:1; display:flex; align-items:center; gap:10px; padding:12px 16px; border:1px solid var(--accent-primary); border-radius:var(--radius-md); cursor:pointer; background:rgba(var(--accent-primary-rgb), 0.05);" id="lblDocNew" onclick="selectDocType('new')">
                                <input type="radio" name="docType" value="new" checked style="accent-color: var(--accent-primary); width:18px; height:18px;">
                                <span style="font-weight:600;">📄 ส่งคำร้องใหม่</span>
                            </label>
                            <label style="flex:1; display:flex; align-items:center; gap:10px; padding:12px 16px; border:1px solid var(--border-color); border-radius:var(--radius-md); cursor:pointer;" id="lblDocRevise" onclick="selectDocType('revise')">
                                <input type="radio" name="docType" value="revise" style="accent-color: var(--accent-primary); width:18px; height:18px;">
                                <span style="font-weight:600;">✏️ ส่งคำร้องแก้ไข</span>
                            </label>
                        </div>
                    </div>

                    <!-- Hidden Row: Reference Document -->
                    <div class="form-group" id="refDocGroup" style="grid-column: 1 / -1; display: none;">
                        <label class="form-label" style="display:flex; align-items:center; gap:8px;">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                            <strong>อ้างอิงเอกสารชุดเดิม</strong>
                            <span style="font-size:0.85rem;font-weight:normal;color:var(--text-muted);">— เลือกเอกสารที่ต้องการแก้ไข</span>
                        </label>
                        <div style="position:relative;">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="position:absolute; left:12px; top:50%; transform:translateY(-50%); color:var(--text-muted);"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                            <input type="text" class="form-input" id="refDocSearch" placeholder="ค้นหาเอกสารเก่า (รหัส, ชื่อ, หัวเรื่อง)..." style="padding-left:42px; height:45px;" onkeyup="searchRefDocs()">
                        </div>
                        <div id="refDocResults" style="margin-top:10px; border:1px solid var(--border-color); border-radius:var(--radius-md); padding:15px; text-align:center; color:var(--text-muted); font-size:0.95rem; background:var(--bg-secondary); max-height:200px; overflow-y:auto;">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom:8px;"><path d="M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8"></path><polyline points="22 7 12 13 2 7"></polyline><line x1="16" y1="21" x2="22" y2="15"></line><line x1="16" y1="15" x2="22" y2="21"></line></svg><br>ไม่พบเอกสารที่ตรงกัน
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">ชื่อนักศึกษา</label>
                        <input type="text" class="form-input" style="height:45px; background-color:var(--bg-tertiary); color:var(--text-muted);" value="${MOCK.student ? MOCK.student.prefix + MOCK.student.firstName + ' ' + MOCK.student.lastName : ''}" readonly>
                    </div>
                    <div class="form-group">
                        <label class="form-label">รหัสนักศึกษา</label>
                        <input type="text" class="form-input" style="height:45px; background-color:var(--bg-tertiary); color:var(--text-muted);" value="${MOCK.student ? (MOCK.student.studentId || MOCK.student.id) : ''}" readonly>
                    </div>

                    <!-- Row 3 -->
                    <div class="form-group">
                        <label class="form-label">หัวเรื่อง / แบบฟอร์ม <span style="color:var(--danger-color)">*</span></label>
                        <select class="form-select" id="docTemplateForm" style="height:45px;">
                            <option value="">-- กรุณาเลือกแบบฟอร์ม --</option>
                            ${templates.map(t => `<option value="${t.id}">${t.id} - ${t.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">สาขาวิชา <span style="color:var(--danger-color)">*</span></label>
                        <select class="form-select" id="docMajor" style="height:45px;" onchange="updateGenerationField()">
                            <option value="">-- กรุณาเลือกสาขาวิชา --</option>
                            ${MOCK.programs ? MOCK.programs.map(p => `<option value="${p.name}" ${MOCK.student && MOCK.student.department && MOCK.student.department.includes(p.name) ? 'selected' : ''}>${p.name}</option>`).join('') : ''}
                        </select>
                    </div>

                    <div class="form-group" id="generationFieldContainer">
                        <label class="form-label">รุ่นที่</label>
                        <input type="text" id="docGeneration" class="form-input" style="height:45px;" placeholder="เช่น 15">
                    </div>
                    <div></div> <!-- Spacer -->

                    <!-- Row 4 -->
                    <div class="form-group" style="grid-column: 1 / -1;">
                        <label class="form-label">จุดประสงค์ / รายละเอียด</label>
                        <textarea class="form-input" id="docNote" placeholder="อธิบายจุดประสงค์ของคำร้องโดยสังเขป" style="height:100px; padding-top:12px; resize:vertical;"></textarea>
                    </div>

                    <!-- Row 5 -->
                    <div class="form-group" style="grid-column: 1 / -1;">
                        <label class="form-label">แนบไฟล์เอกสาร <span style="color:var(--danger-color)">*</span> <span style="font-size:0.85rem;font-weight:normal;color:var(--text-muted);">(PDF, Word, รูปภาพ)</span></label>
                             <p style="font-size: 0.88rem; color: var(--text-muted); margin-bottom: 12px;">รองรับ PDF, DOC, DOCX, JPG, PNG - <b style="color: var(--accent-primary); font-weight: 800;">สูงสุด 10 ไฟล์</b></p>
                             <div style="border: 2px dashed var(--border-color); padding: 40px; text-align: center; border-radius: var(--radius-md); background: var(--bg-tertiary); cursor: pointer; transition: all 0.2s;" onclick="document.getElementById('docFile').click()" onmouseover="this.style.borderColor='var(--accent-primary)'" onmouseout="this.style.borderColor='var(--border-color)'">
                                 <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5" style="margin-bottom: 15px;">
                                     <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></path>
                                 </svg>
                                 <p style="font-size: 1.1rem; font-weight: 600; color: var(--accent-primary);" id="fileNameDisplay">คลิกเพื่อเลือกไฟล์ <span style="color: var(--text-muted); font-weight: normal;"> หรือลากไฟล์มาวาง</span></p>
                             <input type="file" id="docFile" style="display: none;" onchange="updateDocFileName(this)" multiple>
                        </div>
                        <div id="fileListNames" style="margin-top: 16px; display: none; flex-direction: column; gap: 8px; max-height: 300px; overflow-y: auto; padding: 4px;"></div>
                    </div>

                </div>
            </div>
            <div class="card-footer" style="padding: 24px; border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end; gap: 16px; background:#fcfcfc;">
                <button class="btn btn-secondary" onclick="renderPage()">ล้างข้อมูล</button>
                <button class="btn btn-primary" onclick="submitStudentDocument()" style="padding: 12px 32px; font-size:1.05rem; display:flex; align-items:center; gap:10px;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                    ส่งคำร้อง
                </button>
            </div>
        </div>
    </div>`;
};

window.updateGenerationField = function () {
    const major = document.getElementById('docMajor')?.value || '';
    const container = document.getElementById('generationFieldContainer');
    if (!container) return;

    const targetMajors = [
        'การพยาบาลผู้ใหญ่และผู้สูงอายุ',
        'การพยาบาลเวชปฏิบัติชุมชน',
        'สาขาวิชาการพยาบาลเวชปฏิบัติชุมชน (ป.โท)'
    ];

    const isTarget = targetMajors.some(t => major.includes(t));

    if (isTarget) {
        container.innerHTML = `
            <label class="form-label">รุ่นที่ <span style="color:var(--danger-color)">*</span></label>
            <select id="docGeneration" class="form-select" style="height:45px;">
                <option value="">-- เลือกรุ่นที่ --</option>
                <option value="รุ่นปีการศึกษา 2565 (รหัส 65)">รุ่นปีการศึกษา 2565 (รหัส 65)</option>
                <option value="รุ่นปีการศึกษา 2566 (รหัส 66)">รุ่นปีการศึกษา 2566 (รหัส 66)</option>
                <option value="รุ่นปีการศึกษา 2567 (รหัส 67)">รุ่นปีการศึกษา 2567 (รหัส 67)</option>
                <option value="รุ่นปีการศึกษา 2568 (รหัส 68)">รุ่นปีการศึกษา 2568 (รหัส 68)</option>
                <option value="รุ่นปีการศึกษา 2569 (รหัส 69)">รุ่นปีการศึกษา 2569 (รหัส 69)</option>
            </select>
        `;
    } else {
        container.innerHTML = `
            <label class="form-label">รุ่นที่</label>
            <input type="text" id="docGeneration" class="form-input" style="height:45px;" placeholder="เช่น 15">
        `;
    }
};

window.init_petitions_student = function () {
    window.updateGenerationField();
    // If global data loaded successfully, we already have templates in MOCK.
    if (!MOCK.studentPetitionsSyncDone && window.apiDataLoaded === true) {
        MOCK.studentPetitionsSyncDone = true;
    }
};

// ============================
// Student Documents Status Tracking Page
// ============================
pages['documents-status'] = function() {
    let docs = MOCK.studentDocuments || [];
    
    // UI-layer failsafe filtering: Students MUST ONLY see their own documents
    if (window.currentUserRole === 'student') {
        const studentId = String(MOCK.student ? (MOCK.student.studentId || MOCK.student.id) : (window.currentUserData.username || window.currentUserData.id || '')).trim();
        docs = docs.filter(d => String(d.studentId || '').trim() === studentId);
    }

    return `
    <div class="animate-in">
        <div class="page-header" style="display:flex; justify-content:space-between; align-items:flex-start;">
            <div>
                <h1 class="page-title">ติดตามสถานะเอกสาร</h1>
                <p class="page-subtitle">ตรวจสอบสถานะการอนุมัติและประวัติการส่งคำร้องออนไลน์</p>
            </div>
            <button class="btn btn-secondary" onclick="syncStudentDocuments()" style="display:flex; align-items:center; gap:8px; margin-top:10px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 4v6h-6m-7 13v-6h6M21 12a9 9 0 1 1-9-9c2.52 0 4.85.83 6.71 2.22"/></svg>
                รีเฟรชข้อมูลล่าสุด
            </button>
        </div>

        <div class="card animate-in animate-delay-1">
            <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
                <h3 class="card-title">รายการคำร้องที่ยื่นทั้งหมด</h3>
                <div class="search-box" style="width: 320px;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <input type="text" id="studentDocQuery" placeholder="ค้นหารหัสเอกสาร, แบบฟอร์ม, สถานะ..." onkeyup="searchStudentDocs()">
                </div>
            </div>
            <div class="card-body" style="padding: 0;">
                <div class="table-wrapper">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th style="width: 140px;">รหัสเอกสาร</th>
                                ${window.currentUserRole !== 'student' ? '<th style="width: 200px;">ข้อมูลผู้ส่ง</th>' : ''}
                                <th>แบบฟอร์มคำร้อง</th>
                                <th style="width: 160px;">วันที่ส่ง</th>
                                <th style="width: 180px;">สถานะ</th>
                            </tr>
                        </thead>
                        <tbody id="studentDocTableBody">
                            ${docs.length === 0 ? `<tr><td colspan="4" style="text-align:center;color:var(--text-muted);padding:40px;">ไม่มีรายการคำร้องที่เคยยื่น</td></tr>` : ''}
                            ${docs.map(d => {
                                let badgeClass = 'neutral';
                                if (d.status.includes('อนุมัติ')) badgeClass = 'success';
                                if (d.status.includes('ปฏิเสธ')) badgeClass = 'danger';
                                if (d.status.includes('รอ') || d.status.includes('กำลัง')) badgeClass = 'warning';

                                return `
                                <tr class="student-doc-row" data-search="${[d.id, d.formName, d.status, d.studentId, d.senderName].join(' ').toLowerCase()}">
                                    <td style="font-weight:700; color:var(--accent-primary)">${d.id}</td>
                                    ${window.currentUserRole !== 'student' ? `
                                    <td>
                                        <div style="font-weight:600; color:var(--text-primary); margin-bottom:4px;">${d.senderName || 'ไม่ระบุชื่อ'}</div>
                                        <div style="font-size:0.85rem; color:var(--text-muted);">${d.studentId || '-'}</div>
                                    </td>` : ''}
                                    <td>
                                        <div style="font-weight:600; margin-bottom:4px;">${d.formName}</div>
                                        ${d.attachment ? `<div style="font-size:0.85rem; color:var(--text-muted); display:flex; align-items:center; gap:6px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>${d.attachment}</div>` : ''}
                                    </td>
                                    <td style="font-size:0.95rem;">${d.submitDate}</td>
                                    <td>
                                        <div style="display:flex; flex-direction:column; gap:8px;">
                                            <span class="badge ${badgeClass}" style="padding:6px 12px; font-size:0.85rem;">${d.status}</span>
                                            ${d.lastUpdate && d.lastUpdate !== d.submitDate && d.lastUpdate !== '-' ? `<div style="font-size:0.75rem; color:var(--text-muted); display:flex; align-items:center; gap:4px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>อัปเดต: ${d.lastUpdate}</div>` : ''}
                                            <button class="btn btn-sm" style="background:var(--bg-tertiary); color:var(--accent-primary); border:1px solid var(--border-color); padding: 5px 10px; font-size: 0.85rem; width: fit-content;" onclick="previewStudentDoc('${d.id}')">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                                ดูรายละเอียด
                                            </button>
                                        </div>
                                    </td>
                                </tr>`;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>`;
};

window.syncStudentDocuments = async function() {
    showApiLoading('กำลังโหลดข้อมูลสถานะเอกสารจากฐานข้อมูล...');
    try {
        const data = await fetchData('getDocuments');
        if (data && Array.isArray(data)) {
            // Filter for current student
            const studentId = String(MOCK.student ? (MOCK.student.studentId || MOCK.student.id) : '').trim();
            const isStudent = window.currentUserRole === 'student';
            
            // Map Sheet data to MOCK format
            const mappedDocs = data
                .filter(row => {
                    if (!isStudent) return true;
                    const rowSId = String(row['รหัสนักศึกษา'] || row['studentId'] || row['student_id'] || '').trim();
                    return rowSId === studentId && studentId !== '';
                })
                .map((row, index) => {
                    const docId = row['รหัสติดตาม'] || row['id'] || ('DOC-L' + (1000 + index));
                    let displayDate = String(row['วันที่ส่ง'] || '-');
                    try {
                        const dateObj = new Date(displayDate);
                        if (!isNaN(dateObj.getTime())) {
                            const day = String(dateObj.getDate()).padStart(2, '0');
                            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                            let year = dateObj.getFullYear();
                            if (year < 2400) year += 543;
                            const hours = String(dateObj.getHours()).padStart(2, '0');
                            const minutes = String(dateObj.getMinutes()).padStart(2, '0');
                            displayDate = `${day}/${month}/${year} ${hours}:${minutes} น.`;
                        }
                    } catch (e) {}

                    let historyJson = row['ประวัติการดำเนินการ'] || '[]';
                    let lastUpdate = displayDate;
                    try {
                        const hist = JSON.parse(historyJson);
                        if (hist.length > 0 && hist[hist.length - 1].timestamp) {
                            lastUpdate = hist[hist.length - 1].timestamp;
                        }
                    } catch(e) {}

                    return {
                        id: docId,
                        studentId: row['รหัสนักศึกษา'] || row['studentId'] || '',
                        senderName: row['ชื่อผู้ส่ง'] || row['senderName'] || 'ไม่ระบุ',
                        formName: row['ประเภทเอกสาร'] || 'คำร้องทั่วไป',
                        submitDate: displayDate,
                        lastUpdate: lastUpdate,
                        status: row['สถานะ'] || 'รอตรวจสอบ',
                        attachment: row['ชื่อไฟล์'] || '-',
                        fileUrl: row['ลิงก์เอกสาร'] || null,
                        signedFileUrl: row['ลิงก์เอกสารที่ลงนาม'] || null,
                        note: row['หมายเหตุ'] || '',
                        history: historyJson
                    };
                });
            
            // Reverse to show newest first
            MOCK.studentDocuments = mappedDocs.reverse();
            
            hideApiLoading();
            renderPage(); // Redraw UI
        } else {
            hideApiLoading();
            alert('ไม่สามารถดึงข้อมูลได้ หรือไม่มีข้อมูลในระบบ');
        }
    } catch (err) {
        hideApiLoading();
        console.error('Sync Error:', err);
        alert('เกิดข้อผิดพลาดในการเชื่อมต่อ: ' + err.message);
    }
};

window.init_documents_status = function() {
    // If global data loaded successfully, we already have studentDocuments in MOCK. 
    if (!MOCK.studentDocumentsSyncDone && window.apiDataLoaded === true) {
        MOCK.studentDocumentsSyncDone = true;
    }
    
    // Only fetch if we haven't fetched real data yet or if requested
    if (!MOCK.studentDocumentsSyncDone) {
        window.syncStudentDocuments().then(() => {
            MOCK.studentDocumentsSyncDone = true;
        });
    }
};

window.selectedRefDocId = null;

window.previewStudentDoc = function(docId) {
    const doc = MOCK.studentDocuments.find(d => d.id === docId);
    if (!doc) return;
    
    showApiLoading('กำลังเปิดเครื่องมือดูเอกสาร...');
    setTimeout(() => {
        hideApiLoading();
        
        let previewContent = '';
        const displayUrl = doc.signedFileUrl || doc.fileUrl;

        if (displayUrl) {
            const urls = displayUrl.split(',').map(u => u.trim());
            const names = (doc.attachment || '').split(',').map(n => n.trim());

            // 1. List of ALL files (Show on TOP per user request)
            let filesListHtml = '';
            if (urls.length > 1) {
                filesListHtml = `
                    <div style="background:#f8fafc; border:1px solid var(--border-color); border-radius:var(--radius-md); padding:15px; margin-bottom:15px;">
                        <h4 style="margin-top:0; margin-bottom:12px; color:var(--text-primary); font-size:1rem; display:flex; align-items:center; gap:8px;">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                            รายการไฟล์แนบทั้งหมด (${urls.length} ไฟล์)
                        </h4>
                        <div style="display:flex; flex-direction:column; gap:8px;">
                            ${urls.map((url, idx) => {
                                const name = names[idx] || `ไฟล์ที่ ${idx + 1}`;
                                const targetUrl = window.getDriveUrl(url, 'file');
                                return `
                                    <a href="${targetUrl}" target="_blank" style="display:flex; align-items:center; gap:10px; padding:10px; background:white; border:1px solid var(--border-color); border-radius:var(--radius-sm); color:var(--accent-primary); text-decoration:none; font-weight:500; font-size:0.9rem; transition:all 0.2s;" onmouseover="this.style.borderColor='var(--accent-primary)';" onmouseout="this.style.borderColor='var(--border-color)';">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                                        <span style="flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${name}</span>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                                    </a>
                                `;
                            }).join('')}
                        </div>
                    </div>
                `;
            }

            // 2. Visual Preview for the FIRST file (Now at BOTTOM)
            const embedUrl = window.getDriveUrl(urls[0], 'preview');
            const iframeHtml = `<iframe src="${embedUrl}" style="width:100%; height:450px; border:none; border-radius:var(--radius-sm);" allow="autoplay"></iframe>`;

            previewContent = filesListHtml + iframeHtml;
        }

        // 3. Document Timeline (ประวัติการดำเนินการ)
        let history = [];
        try { history = JSON.parse(doc.history || '[]'); } catch(e) { history = []; }
        
        let timelineHtml = '';
        if (history.length > 0) {
            timelineHtml = `
                <div style="margin-top:25px; padding-top:20px; border-top:1px solid var(--border-color);">
                    <h4 style="margin:0 0 15px; color:var(--text-primary); font-size:1rem; display:flex; align-items:center; gap:8px;">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        เส้นเวลาการดำเนินงาน (Timeline)
                    </h4>
                    <div class="timeline">
                        ${history.map((h, idx) => {
                            const isActive = (idx === history.length - 1);
                            let statusBadge = '';
                            if (h.status) {
                                let badgeClass = 'neutral';
                                if (h.status.includes('อนุมัติ')) badgeClass = 'success';
                                if (h.status.includes('ปฏิเสธ')) badgeClass = 'danger';
                                if (h.status.includes('รอ') || h.status.includes('กำลัง')) badgeClass = 'warning';
                                statusBadge = `<span class="timeline-status badge ${badgeClass}">${h.status}</span>`;
                            }

                            return `
                                <div class="timeline-item ${isActive ? 'active' : ''}">
                                    <div class="timeline-dot"></div>
                                    <div class="timeline-content">
                                        <div class="timeline-header">
                                            <div class="timeline-title">${h.event || 'เปลี่ยนสถานะ'}</div>
                                            <div class="timeline-time">${h.timestamp || ''}</div>
                                        </div>
                                        <div style="display:flex; justify-content:space-between; align-items:center;">
                                            ${statusBadge}
                                            <div style="font-size:0.75rem; color:var(--text-muted);">โดย: ${h.actor || '-'}</div>
                                        </div>
                                        ${h.note ? `<div class="timeline-note">${h.note}</div>` : ''}
                                    </div>
                                </div>
                            `;
                        }).reverse().join('')}
                    </div>
                </div>
            `;
        }

        const modalHtml = `
            <div style="padding:10px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; padding-bottom:10px; border-bottom:1px solid var(--border-color);">
                    <div>
                        <h3 style="margin:0; color:var(--accent-primary); font-size:1.1rem;">${doc.id}</h3>
                        <div style="font-size:0.9rem; color:var(--text-muted);">${doc.formName}</div>
                    </div>
                </div>
                
                ${previewContent}
                ${timelineHtml}
            </div>
        `;
        openModal('พรีวิวเอกสารคำร้อง', modalHtml, '800px');
    }, 500);
};

// Auto search on typing
document.getElementById('refDocSearch')?.addEventListener('input', window.searchRefDocs);

window.searchStudentDocs = function () {
    const query = document.getElementById('studentDocQuery').value.toLowerCase();
    const rows = document.querySelectorAll('.student-doc-row');
    let hasVisibleRows = false;

    rows.forEach(row => {
        const searchData = row.getAttribute('data-search') || '';
        if (searchData.includes(query)) {
            row.style.display = '';
            hasVisibleRows = true;
        } else {
            row.style.display = 'none';
        }
    });

    let noResultMsg = document.getElementById('noStudentDocMatch');
    if (hasVisibleRows || rows.length === 0) {
        if (noResultMsg) noResultMsg.style.display = 'none';
    } else {
        if (!noResultMsg) {
            const tbody = document.getElementById('studentDocTableBody');
            if (tbody) {
                const tr = document.createElement('tr');
                tr.id = 'noStudentDocMatch';
                tr.innerHTML = '<td colspan="4" style="text-align:center;color:var(--text-muted);padding:20px;">ไม่พบเอกสารที่ค้นหา</td>';
                tbody.appendChild(tr);
            }
        } else {
            noResultMsg.style.display = '';
        }
    }
};

window.searchRefDocs = function () {
    const query = document.getElementById('refDocSearch').value.toLowerCase();
    const resultsContainer = document.getElementById('refDocResults');
    const docs = MOCK.studentDocuments || [];

    const emptyState = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-bottom:8px;"><path d="M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8"></path><polyline points="22 7 12 13 2 7"></polyline><line x1="16" y1="21" x2="22" y2="15"></line><line x1="16" y1="15" x2="22" y2="21"></line></svg><br>ไม่พบเอกสารที่ตรงกัน`;

    if (!query) {
        resultsContainer.innerHTML = emptyState;
        return;
    }

    const matched = docs.filter(d =>
        (d.id && d.id.toLowerCase().includes(query)) ||
        (d.formName && d.formName.toLowerCase().includes(query))
    );

    if (matched.length === 0) {
        resultsContainer.innerHTML = emptyState;
    } else {
        resultsContainer.innerHTML = `<div style="display:flex; flex-direction:column; gap:8px;">` +
            matched.map(d => `
                <div style="padding:10px; border:1px solid var(--border-color); border-radius:var(--radius-sm); cursor:pointer; text-align:left; background:var(--bg-primary); transition:all 0.2s;" onclick="selectRefDoc('${d.id}', '${d.formName}')" onmouseover="this.style.borderColor='var(--accent-primary)'" onmouseout="this.style.borderColor='var(--border-color)'">
                    <div style="font-weight:600; color:var(--accent-primary); font-size:0.9rem;">${d.id} <span style="color:var(--text-muted); font-weight:normal; font-size:0.8rem; margin-left:8px;">${d.submitDate}</span></div>
                    <div style="font-size:0.85rem; color:var(--text-primary); margin-top:4px;">${d.formName}</div>
                </div>
            `).join('') + `</div>`;
    }
};

window.selectRefDoc = function (id, name) {
    window.selectedRefDocId = id;
    document.getElementById('refDocSearch').value = id + ' - ' + name;
    document.getElementById('refDocResults').innerHTML = `<div style="color:var(--success); font-size:0.9rem; font-weight:500;">✅ เลือกเอกสารอ้างอิง: ${id} แล้ว</div>`;
};

window.selectDocType = function (type) {
    const lblNew = document.getElementById('lblDocNew');
    const lblRevise = document.getElementById('lblDocRevise');
    const refGroup = document.getElementById('refDocGroup');

    // We can use a simple hack for rgb colors if the CSS variable is not raw RGB
    const activeBg = 'rgba(239, 68, 68, 0.05)'; // Using red theme color roughly
    const activeBorder = 'var(--accent-primary)';

    if (type === 'new') {
        lblNew.style.background = activeBg;
        lblNew.style.borderColor = activeBorder;
        lblRevise.style.background = 'transparent';
        lblRevise.style.borderColor = 'var(--border-color)';
        if (refGroup) refGroup.style.display = 'none';
        window.selectedRefDocId = null;
    } else {
        lblRevise.style.background = activeBg;
        lblRevise.style.borderColor = activeBorder;
        lblNew.style.background = 'transparent';
        lblNew.style.borderColor = 'var(--border-color)';
        if (refGroup) {
            refGroup.style.display = 'block';
            window.searchRefDocs();
        }
    }
};

window.updateDocFileName = function (input) {
    const display = document.getElementById('fileNameDisplay');
    const listContainer = document.getElementById('fileListNames');
    
    if (input.files && input.files.length > 0) {
        if (input.files.length > 10) {
            alert('คุณสามารถแนบไฟล์ได้สูงสุด 10 ไฟล์ต่อครั้ง');
            input.value = '';
            display.textContent = 'คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวาง';
            display.style.color = 'var(--text-muted)';
            display.style.fontWeight = 'normal';
            if (listContainer) {
                listContainer.style.display = 'none';
                listContainer.innerHTML = '';
            }
            return;
        }

        if (input.files.length === 1) {
            display.textContent = input.files[0].name;
        } else {
            display.textContent = `เลือกแล้ว ${input.files.length} ไฟล์`;
        }
        display.style.color = 'var(--text-primary)';
        display.style.fontWeight = '600';

        // Update individual file names list (Vertical list for better readability)
        if (listContainer) {
            listContainer.style.display = 'flex';
            listContainer.innerHTML = Array.from(input.files).map((file, idx) => `
                <div style="background: white; border: 1px solid var(--border-color); border-radius: 10px; padding: 10px 16px; font-size: 0.9rem; display: flex; align-items: center; justify-content: space-between; box-shadow: var(--shadow-sm); animation: fadeIn 0.3s ease-out; animation-delay: ${idx * 0.05}s; border-left: 4px solid var(--accent-primary);">
                    <div style="display: flex; align-items: center; gap: 12px; overflow: hidden;">
                        <div style="width: 32px; height: 32px; border-radius: 8px; background: var(--bg-secondary); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" stroke-width="2.5"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
                        </div>
                        <div style="overflow: hidden;">
                            <div style="color: var(--text-primary); font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${file.name}</div>
                            <div style="font-size: 0.75rem; color: var(--text-muted);">${(file.size / 1024).toFixed(1)} KB</div>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    } else {
        display.textContent = 'คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวาง';
        display.style.color = 'var(--text-muted)';
        display.style.fontWeight = 'normal';
        if (listContainer) {
            listContainer.style.display = 'none';
            listContainer.innerHTML = '';
        }
    }
};

window.toggleAttachmentReq = function () {
    // Just a UI helper, could be used to toggle required star if data had it
};

window.submitStudentDocument = function () {
    const formId = document.getElementById('docTemplateForm').value;
    const majorId = document.getElementById('docMajor').value;
    const fileInput = document.getElementById('docFile');
    const noteRaw = document.getElementById('docNote').value;
    const docType = document.querySelector('input[name="docType"]:checked').value;
    const generation = document.getElementById('docGeneration').value;

    if (!formId) {
        alert('กรุณาเลือกแบบฟอร์มคำร้อง');
        return;
    }
    if (!majorId) {
        alert('กรุณาเลือกสาขาวิชา');
        return;
    }

    const targetMajors = ['การพยาบาลผู้ใหญ่และผู้สูงอายุ', 'การพยาบาลเวชปฏิบัติชุมชน'];
    if (targetMajors.some(t => majorId.includes(t)) && !generation) {
        alert('กรุณาเลือกรุ่นที่');
        return;
    }

    if (!fileInput.files || fileInput.files.length === 0) {
        alert('กรุณาแนบไฟล์เอกสาร');
        return;
    }
    if (fileInput.files.length > 10) {
        alert('กรุณาแนบไฟล์ไม่เกิน 10 ไฟล์');
        return;
    }

    let note = noteRaw;
    if (generation) {
        note = `[รุ่นที่: ${generation}] ` + note;
    }
    if (docType === 'revise' && window.selectedRefDocId) {
        note = `[แก้ไขอ้างอิง ${window.selectedRefDocId}] ` + note;
    }
    const files = Array.from(fileInput.files);

    // Resolve template from formId
    const templates = MOCK.documentTemplates || [];
    const template = templates.find(t => t.id === formId);
    const templateName = template ? template.name : formId;
    
    // Generate a SINGLE groupId for all files in this submission
    const groupId = 'DOC-' + Date.now();
    
    // Use an async loop to upload files SEQUENTIALLY to Drive first
    (async () => {
        const uploadedFiles = [];
        let errorCount = 0;
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            showApiLoading(`กำลังอัปโหลดไฟล์ที่ ${i + 1}/${files.length}: ${file.name}...`);
            
            try {
                // Phase 1: Upload to Drive only (Using the new api method)
                const response = await window.api.uploadFileOnly(file);
                if (response && response.status === 'success') {
                    uploadedFiles.push({
                        name: file.name,
                        url: response.fileUrl
                    });
                } else {
                    throw new Error(response.message || 'Upload failed');
                }
            } catch (err) {
                console.error(`Error uploading file ${file.name}:`, err);
                errorCount++;
            }
        }
        
        if (uploadedFiles.length === 0) {
            hideApiLoading();
            alert('ไม่สามารถอัปโหลดไฟล์ได้ กรุณาลองใหม่อีกครั้ง');
            return;
        }

        // Phase 2: Save metadata and ALL links to Sheet in ONE row
        showApiLoading('กำลังบันทึกข้อมูลคำร้อง...');
        try {
            const metadata = {
                studentId: MOCK.student ? (MOCK.student.studentId || MOCK.student.id) : 'Unknown',
                senderName: MOCK.student ? (MOCK.student.prefix + MOCK.student.firstName + ' ' + MOCK.student.lastName) : 'Unknown',
                documentType: templateName,
                major: majorId,
                note: note,
                fileNames: uploadedFiles.map(f => f.name).join(', '),
                fileUrls: uploadedFiles.map(f => f.url).join(', ')
            };

            const saveResult = await window.api.saveDocumentRecord(metadata);
            hideApiLoading();

            if (saveResult && saveResult.status === 'success') {
                const docId = saveResult.id;
                const today = window.formatDateThai(new Date());

                const newDoc = {
                    id: docId,
                    formId: formId,
                    formName: templateName,
                    status: 'รอเจ้าหน้าที่งานบัณฑิตศึกษาตรวจสอบ',
                    submitDate: today,
                    lastUpdate: today,
                    attachment: files.length === 1 ? files[0].name : `${files[0].name} (และอีก ${files.length - 1} ไฟล์)`,
                    fileUrl: uploadedFiles[0].url // Principal link
                };

                if (!MOCK.studentDocuments) MOCK.studentDocuments = [];
                MOCK.studentDocuments.unshift(newDoc);

                let msg = `ส่งเอกสารสำเร็จ! รหัสติดตาม: ${docId}`;
                if (errorCount > 0) msg += `\n(หมายเหตุ: อัปโหลดล้มเหลว ${errorCount} ไฟล์)`;
                alert(msg);

                if (typeof navigateTo === 'function') {
                    navigateTo('documents-status');
                } else {
                    renderPage();
                }
            } else {
                alert('ไม่สามารถบันทึกข้อมูลได้: ' + (saveResult ? saveResult.message : 'Unknown error'));
            }
        } catch (err) {
            hideApiLoading();
            console.error('Save Record Error:', err);
            alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล: ' + err.message);
        }
    })();
};




