// ============================
// Exam Results Page
// ============================

const EXAM_TYPES = [
    'ประมวลความรู้',
    'หัวข้อวิทยานิพนธ์',
    'ความรู้ภาษาอังกฤษ',
    'โครงร่างวิทยานิพนธ์',
    'ป้องกันวิทยานิพนธ์'
];

const EXAM_MECHANISMS = {
    'ประมวลความรู้': [
        { step: 1, desc: 'ตรวจสอบคุณสมบัติ (ลงทะเบียนมาแล้วไม่น้อยกว่า 2 ภาคการศึกษาปกติ)' },
        { step: 2, desc: 'ยื่นคำร้องขอสอบประมวลความรู้ (Comprehensive Exam)' },
        { step: 3, desc: 'ชำระค่าธรรมเนียมการสอบ' },
        { step: 4, desc: 'เข้ารับการสอบ (ข้อเขียน/ปากเปล่า)' },
        { step: 5, desc: 'ประกาศผลการสอบ' }
    ],
    'หัวข้อวิทยานิพนธ์': [
        { step: 1, desc: 'ปรึกษาและเลือกอาจารย์ที่ปรึกษาวิทยานิพนธ์' },
        { step: 2, desc: 'จัดทำบันทึกข้อความขออนุมัติชื่อหัวข้อวิทยานิพนธ์' },
        { step: 3, desc: 'เสนอหัวข้อต่อคณะกรรมการบริหารหลักสูตร' },
        { step: 4, desc: 'คณะกรรมการพิจารณาอนุมัติหัวข้อ' },
        { step: 5, desc: 'บันทึกข้อมูลหัวข้อที่ได้รับอนุมัติลงในระบบ' }
    ],
    'ความรู้ภาษาอังกฤษ': [
        { step: 1, desc: 'ตรวจสอบเกณฑ์คะแนนภาษาอังกฤษที่หลักสูตรกำหนด (IELTS, TOEFL, CU-TEP ฯลฯ)' },
        { step: 2, desc: 'เข้ารับการทดสอบจากสถาบันที่ได้รับการรับรอง' },
        { step: 3, desc: 'ยื่นผลคะแนนภาษาอังกฤษต่อฝ่ายบัณฑิตศึกษา' },
        { step: 4, desc: 'เจ้าหน้าที่ตรวจสอบความถูกต้องของใบรายงานผล' },
        { step: 5, desc: 'บันทึกสถานะผ่านเกณฑ์ภาษาอังกฤษ' }
    ],
    'โครงร่างวิทยานิพนธ์': [
        { step: 1, desc: 'จัดทำรูปเล่มโครงร่างวิทยานิพนธ์ (บทที่ 1-3) ภายใต้การดูแลของที่ปรึกษา' },
        { step: 2, desc: 'ยื่นคำร้องขอสอบโครงร่างวิทยานิพนธ์และแต่งตั้งคณะกรรมการ' },
        { step: 3, desc: 'นำเสนอโครงร่างต่อคณะกรรมการสอบ' },
        { step: 4, desc: 'ปรับปรุงแก้ไขรูปเล่มตามมติคณะกรรมการ (ถ้ามี)' },
        { step: 5, desc: 'ส่งรูปเล่มโครงร่างฉบับสมบูรณ์และขอรับหนังสือรับรองจริยธรรมการวิจัย' }
    ],
    'ป้องกันวิทยานิพนธ์': [
        { step: 1, desc: 'ดำเนินการวิจัยและจัดทำเล่มวิทยานิพนธ์ฉบับสมบูรณ์ (บทที่ 1-5)' },
        { step: 2, desc: 'ยื่นตรวจสอบการคัดลอกวรรณกรรม (Plagiarism) และผ่านเกณฑ์ที่กำหนด' },
        { step: 3, desc: 'ยื่นคำร้องขอสอบป้องกันวิทยานิพนธ์' },
        { step: 4, desc: 'สอบป้องกันวิทยานิพนธ์ต่อคณะกรรมการ' },
        { step: 5, desc: 'ส่งเล่มวิทยานิพนธ์ฉบับสมบูรณ์และหลักฐานการเผยแพร่ผลงานวิจัย' }
    ]
};

pages.exams = function() {
    const role = window.currentUserRole;
    
    if (role === 'student') {
        return renderStudentExams(MOCK.student);
    } else {
        return renderAdminExams();
    }
};

function renderStudentExams(st) {
    if (!st) return `<div class="card"><div class="card-body">ไม่พบข้อมูลนักศึกษา</div></div>`;
    
    const exams = st.exams || [];
    
    let cardsHtml = '';
    EXAM_TYPES.forEach((type, typeIdx) => {
        const typeExams = exams.filter(ex => ex.exam_type === type)
                              .sort((a, b) => new Date(b.date) - new Date(a.date));
        
        let statusSummary = 'ยังไม่มีข้อมูล';
        let statusClass = 'status-pending';
        
        if (typeExams.length > 0) {
            const latest = typeExams[0];
            statusSummary = latest.status || 'รอผล';
            if (statusSummary === 'ผ่าน' || statusSummary === 'Pass' || statusSummary === 'ผ่านแบบมีเงื่อนไข') statusClass = 'status-active';
            else if (statusSummary === 'ไม่ผ่าน' || statusSummary === 'Fail' || statusSummary === 'ขาดสอบ') statusClass = 'status-inactive';
        }

        let historyRows = '';
        if (typeExams.length === 0) {
            historyRows = `
                <tr>
                    <td colspan="4" style="text-align:center;padding:20px;color:var(--text-secondary);">ไม่พบข้อมูลการสอบในหมวดนี้</td>
                </tr>
            `;
        } else {
            typeExams.forEach((ex, idx) => {
                const status = ex.status || 'รอผล';
                const score = ex.score || '-';
                const date = ex.date || '-';
                const note = ex.note || '-';
                
                let rowStatusClass = 'status-pending';
                if (status === 'ผ่าน' || status === 'Pass' || status === 'ผ่านแบบมีเงื่อนไข') rowStatusClass = 'status-active';
                else if (status === 'ไม่ผ่าน' || status === 'Fail' || status === 'ขาดสอบ') rowStatusClass = 'status-inactive';

                historyRows += `
                    <tr>
                        <td>ครั้งที่ ${typeExams.length - idx}</td>
                        <td><span class="status-badge ${rowStatusClass}">${status}</span></td>
                        <td>${score}</td>
                        <td>${date}</td>
                        <td style="font-size:0.8rem;color:var(--text-secondary);">${note}</td>
                    </tr>
                `;
            });
        }

        const mechanism = EXAM_MECHANISMS[type] || [];
        const mechanismHtml = mechanism.map(m => `
            <div class="mechanism-step">
                <span class="step-dot">${m.step}</span>
                <span class="step-text">${m.desc}</span>
            </div>
        `).join('');

        cardsHtml += `
            <div class="card animate-in" id="exam-card-${typeIdx}" style="margin-bottom:30px; animation-delay: ${typeIdx * 0.1}s">
                <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
                    <h3 class="card-title" style="display:flex; align-items:center; gap:10px;">
                        ${type}
                        <span class="badge info" style="font-size:0.7rem; font-weight:normal;">ขั้นตอนที่ ${typeIdx + 1}</span>
                    </h3>
                    <span class="status-badge ${statusClass}">${statusSummary}</span>
                </div>
                <div class="card-body">
                    <div class="mechanism-box">
                        <div class="mechanism-header">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                            กลไกและขั้นตอนการดำเนินการ (Preparation Guide)
                        </div>
                        <div class="mechanism-body">
                            ${mechanismHtml}
                        </div>
                    </div>

                    <div style="margin-top:20px;">
                        <h4 style="font-size:0.9rem; margin-bottom:12px; color:var(--text-secondary);">ประวัติการสอบ</h4>
                        <div class="table-container">
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th style="width:15%">ครั้งที่</th>
                                        <th style="width:20%">สถานะ</th>
                                        <th style="width:15%">คะแนน/ผล</th>
                                        <th style="width:20%">วันที่สอบ</th>
                                        <th style="width:30%">หมายเหตุ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${historyRows}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    return `
            <div class="card animate-in animate-delay-1" style="margin-bottom:25px;">
                <div class="card-body">
                    <h3 class="card-title" style="margin-bottom:20px; font-size:1.1rem; display:flex; align-items:center; gap:8px;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                        ลำดับขั้นตอนการดำเนินการสอบ (Exam Roadmap)
                    </h3>
                    <div class="exam-stepper">
                        ${EXAM_TYPES.map((type, idx) => {
                            const typeExams = exams.filter(ex => ex.exam_type === type);
                            const lastStatus = typeExams.length > 0 ? typeExams.sort((a,b)=>new Date(b.date)-new Date(a.date))[0].status : null;
                            let state = 'neutral';
                            if (lastStatus === 'ผ่าน') state = 'success';
                            else if (lastStatus === 'ผ่านแบบมีเงื่อนไข') state = 'info';
                            else if (lastStatus === 'ไม่ผ่าน' || lastStatus === 'รอผล' || lastStatus === 'ขาดสอบ') state = 'active';
                            else if (lastStatus === 'ยังไม่สอบ') state = 'neutral';
                            
                            return `
                                <div class="step ${state}" onclick="document.getElementById('exam-card-${idx}').scrollIntoView({behavior:'smooth', block:'center'});">
                                    <div class="step-number">${idx + 1}</div>
                                    <div class="step-label">${type}</div>
                                </div>
                            `;
                        }).join('<div class="step-connector"></div>')}
                    </div>
                </div>
            </div>

            <div class="animate-in">
                ${cardsHtml}
            </div>
            
            <div class="card animate-in animate-delay-2" style="margin-top:20px;border-left:4px solid var(--primary-color);">
                <div class="card-body">
                    <p style="margin:0;font-size:0.9rem;color:var(--text-secondary);">
                        * หากมีข้อสงสัยเกี่ยวกับข้อมูลผลการสอบ กรุณาติดต่อฝ่ายทะเบียนหรือที่ปรึกษาวิทยานิพนธ์ของท่าน
                    </p>
                </div>
            </div>
        </div>
    `;
}

function renderAdminExams() {
    const students = MOCK.students || [];
    const selectedId = window.selectedExamStudentId || (students[0] ? students[0].id : null);
    const selectedStudent = students.find(s => s.id === selectedId);
    
    let studentOptions = students.map(s => `
        <option value="${s.id}" ${s.id === selectedId ? 'selected' : ''}>
            ${s.studentId} - ${s.firstName} ${s.lastName}
        </option>
    `).join('');

    let cardsHtml = '';
    if (selectedStudent) {
        const exams = selectedStudent.exams || [];
        EXAM_TYPES.forEach((type, typeIdx) => {
            const typeExams = exams.filter(ex => ex.exam_type === type)
                                  .sort((a, b) => new Date(a.date) - new Date(b.date));
            
            let historyRows = '';
            typeExams.forEach((ex, idx) => {
                const status = ex.status || '';
                const score = ex.score || '';
                const date = ex.date || '';
                const note = ex.note || '';
                const examId = ex.id || '';

                historyRows += `
                    <tr data-type="${type}" data-id="${examId}">
                        <td>ครั้งที่ ${idx + 1}</td>
                        <td>
                            <select class="form-control status-select" style="min-width:100px;">
                                ${type === 'โครงร่างวิทยานิพนธ์' || type === 'ป้องกันวิทยานิพนธ์' ? `
                                    <option value="" ${!status ? 'selected' : ''}>- เลือกสถานะ -</option>
                                    <option value="ผ่าน" ${status === 'ผ่าน' ? 'selected' : ''}>ผ่าน (Pass)</option>
                                    <option value="ผ่านแบบมีเงื่อนไข" ${status === 'ผ่านแบบมีเงื่อนไข' ? 'selected' : ''}>ผ่านแบบมีเงื่อนไข (Pass with conditions)</option>
                                    <option value="ไม่ผ่าน" ${status === 'ไม่ผ่าน' ? 'selected' : ''}>ไม่ผ่าน (Fail)</option>
                                    <option value="ขาดสอบ" ${status === 'ขาดสอบ' ? 'selected' : ''}>ขาดสอบ (Absent)</option>
                                ` : `
                                    <option value="" ${!status ? 'selected' : ''}>- เลือกสถานะ -</option>
                                    <option value="ผ่าน" ${status === 'ผ่าน' ? 'selected' : ''}>ผ่าน (Pass)</option>
                                    <option value="ไม่ผ่าน" ${status === 'ไม่ผ่าน' ? 'selected' : ''}>ไม่ผ่าน (Fail)</option>
                                    <option value="ขาดสอบ" ${status === 'ขาดสอบ' ? 'selected' : ''}>ขาดสอบ (Absent)</option>
                                    <option value="รอผล" ${status === 'รอผล' ? 'selected' : ''}>รอผล (Pending)</option>
                                    <option value="ยังไม่สอบ" ${status === 'ยังไม่สอบ' ? 'selected' : ''}>ยังไม่สอบ</option>
                                `}
                            </select>
                        </td>
                        <td><input type="text" class="form-control score-input" value="${score}" placeholder="เช่น 70/100"></td>
                        <td><input type="date" class="form-control date-input" value="${date}"></td>
                        <td><input type="text" class="form-control note-input" value="${note}" placeholder="ระบุหมายเหตุ..."></td>
                        <td>
                            <button class="btn btn-primary btn-sm" onclick="saveIndividualExam('${selectedId}', '${type}', this)">บันทึก</button>
                        </td>
                    </tr>
                `;
            });

            cardsHtml += `
                <div class="card animate-in" style="margin-bottom:25px; border-top:3px solid var(--primary-color); animation-delay: ${typeIdx * 0.1}s">
                    <div class="card-header" style="display:flex; justify-content:space-between; align-items:center; background:#f8fafc;">
                        <h3 class="card-title" style="color:var(--primary-dark);">${type}</h3>
                        <button class="btn btn-secondary btn-sm" onclick="addNewExamRow('${selectedId}', '${type}', this)">+ เพิ่มบันทึกการสอบใหม่</button>
                    </div>
                    <div class="card-body" style="padding:0;">
                        <div class="table-container">
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th style="width:10%">ครั้งที่</th>
                                        <th style="width:15%">สถานะ</th>
                                        <th style="width:15%">คะแนน/ผล</th>
                                        <th style="width:15%">วันที่สอบ</th>
                                        <th style="width:35%">หมายเหตุ</th>
                                        <th style="width:10%">จัดการ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${historyRows}
                                    ${historyRows === '' ? '<tr><td colspan="6" style="text-align:center;padding:20px;color:var(--text-secondary);">ยังไม่มีประวัติการสอบในหมวดนี้</td></tr>' : ''}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
        });
    }

    return `
        <div class="animate-in">
            <div class="page-header">
                <h1 class="page-title">จัดการผลการสอบ</h1>
                <p class="page-subtitle">สำหรับอาจารย์และเจ้าหน้าที่จัดการข้อมูลการสอบ</p>
            </div>

            <div class="card animate-in animate-delay-1" style="margin-bottom:20px;">
                <div class="card-body">
                    <div class="grid-2" style="align-items: flex-end;">
                        <div class="form-group" style="margin-bottom:0;">
                            <label class="form-label">เลือกนักศึกษาที่ต้องการส่งผลสอบ</label>
                            <select class="form-control" onchange="window.selectedExamStudentId = this.value; renderPage();">
                                <option value="">-- เลือกนักศึกษา --</option>
                                ${studentOptions}
                            </select>
                        </div>
                        <div style="display:flex;gap:10px;">
                            <button class="btn btn-secondary" onclick="window.downloadExamCSVTemplate()">ดาวน์โหลดเทมเพลต</button>
                            <button class="btn btn-primary" onclick="document.getElementById('examCsvInput').click()">นำเข้า CSV</button>
                            <input type="file" id="examCsvInput" accept=".csv" style="display:none" onchange="window.handleExamFileSelect(event)">
                        </div>
                    </div>
                </div>
            </div>

            ${selectedStudent ? `
                <div class="animate-in animate-delay-2" style="margin-bottom:20px;">
                    <h2 style="font-size:1.4rem; color:var(--text-primary); margin-bottom:15px; display:flex; align-items:center; gap:10px;">
                        <i class="fas fa-user-graduate"></i> จัดการผลสอบ: ${selectedStudent.firstName} ${selectedStudent.lastName}
                    </h2>
                    ${cardsHtml}
                </div>
            ` : `
                <div class="card"><div class="card-body" style="text-align:center;color:var(--text-secondary);">กรุณาเลือกนักศึกษาเพื่อจัดการข้อมูล</div></div>
            `}
        </div>
    `;
}

window.saveIndividualExam = async function(studentId, type, btn) {
    const row = btn.closest('tr');
    const examId = row.dataset.id || '';
    
    const payload = {
        action: 'updateExam',
        payload: {
            id: examId,
            student_id: studentId,
            exam_type: type,
            status: row.querySelector('.status-select').value,
            score: row.querySelector('.score-input').value,
            date: row.querySelector('.date-input').value,
            note: row.querySelector('.note-input').value
        }
    };
    
    btn.disabled = true;
    btn.textContent = '...กำลังบันทึก';
    
    try {
        const res = await callApi(payload);
        if (res.status === 'success') {
            showToast('บันทึกผลการสอบเรียบร้อยแล้ว', 'success');
            // Refresh data
            if (typeof window.syncActiveStudentData === 'function') {
                await window.syncActiveStudentData();
            }
            renderPage();
        } else {
            throw new Error(res.message);
        }
    } catch (e) {
        showToast('เกิดข้อผิดพลาด: ' + e.message, 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'บันทึก';
    }
};

window.addNewExamRow = function(studentId, type, btn) {
    const card = btn.closest('.card');
    const tbody = card.querySelector('tbody');
    
    // Check if there's a "no data" row and remove it
    const emptyRow = tbody.querySelector('td[colspan="6"]');
    if (emptyRow) {
        emptyRow.closest('tr').remove();
    }

    const newRow = document.createElement('tr');
    newRow.dataset.type = type;
    newRow.dataset.id = ''; // New
    newRow.innerHTML = `
        <td style="font-weight:600; color:var(--primary-color);">+ ใหม่</td>
        <td>
            <select class="form-control status-select" style="min-width:100px;">
                ${type === 'โครงร่างวิทยานิพนธ์' || type === 'ป้องกันวิทยานิพนธ์' ? `
                    <option value="" selected>- เลือกสถานะ -</option>
                    <option value="ผ่าน">ผ่าน (Pass)</option>
                    <option value="ผ่านแบบมีเงื่อนไข">ผ่านแบบมีเงื่อนไข (Pass with conditions)</option>
                    <option value="ไม่ผ่าน">ไม่ผ่าน (Fail)</option>
                    <option value="ขาดสอบ">ขาดสอบ (Absent)</option>
                ` : `
                    <option value="" selected>- เลือกสถานะ -</option>
                    <option value="ผ่าน">ผ่าน (Pass)</option>
                    <option value="ไม่ผ่าน">ไม่ผ่าน (Fail)</option>
                    <option value="ขาดสอบ">ขาดสอบ (Absent)</option>
                    <option value="รอผล">รอผล (Pending)</option>
                    <option value="ยังไม่สอบ">ยังไม่สอบ</option>
                `}
            </select>
        </td>
        <td><input type="text" class="form-control score-input" placeholder="เช่น 70/100"></td>
        <td><input type="date" class="form-control date-input" value="${new Date().toISOString().split('T')[0]}"></td>
        <td><input type="text" class="form-control note-input" placeholder="ระบุหมายเหตุ..."></td>
        <td>
            <button class="btn btn-primary btn-sm" onclick="saveIndividualExam('${studentId}', '${type}', this)">บันทึก</button>
        </td>
    `;
    tbody.appendChild(newRow);
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> กำลังระบุข้อมูล...';
};

async function callApi(data) {
    return await postData(data.action, data.payload);
}

/**
 * CSV Template & Import Functions
 */
window.downloadExamCSVTemplate = function() {
    const headers = ['รหัสนักศึกษา', 'ประเภทการสอบ', 'สถานะ', 'คะแนน', 'วันที่', 'หมายเหตุ'];
    const sampleRows = [
        ['65100503002', 'ความรู้ภาษาอังกฤษ', 'ผ่าน', '7.5/9', '2024-03-25', 'ผ่านเกณฑ์ภาษาอังกฤษ'],
        ['65100503002', 'หัวข้อวิทยานิพนธ์', 'ผ่าน', 'Pass', '2024-02-10', ''],
        ['65100503002', 'โครงร่างวิทยานิพนธ์', 'ผ่านแบบมีเงื่อนไข', 'Pass', '2024-04-15', 'แก้เอกสารเพิ่มเติม'],
        ['', '', '', '', '', ''],
        ['* คำชี้แจง:', '', '', '', '', ''],
        ['- ประเภทการสอบ:', EXAM_TYPES.join(', '), '', '', '', ''],
        ['- สถานะ:', 'ผ่าน, ผ่านแบบมีเงื่อนไข, ไม่ผ่าน, ขาดสอบ, รอผล, ยังไม่สอบ', '', '', '', ''],
        ['- วันที่:', 'รูปแบบ YYYY-MM-DD', '', '', '', '']
    ];
    
    let csvContent = "\uFEFF"; // Add BOM for Excel Thai support
    csvContent += headers.join(',') + "\n";
    sampleRows.forEach(row => {
        csvContent += row.map(val => {
            val = String(val).replace(/"/g, '""');
            return val.includes(',') ? `"${val}"` : val;
        }).join(',') + "\n";
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "exam_results_template.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

window.handleExamFileSelect = function(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (e) => {
        const text = e.target.result;
        try {
            const rows = parseCSV(text);
            if (rows.length === 0) throw new Error('ไม่พบข้อมูลในไฟล์ CSV');
            
            // Map CSV headers to payload keys
            // Expected: รหัสนักศึกษา, ประเภทการสอบ, สถานะ, คะแนน, วันที่, หมายเหตุ
            const mapping = {
                'รหัสนักศึกษา': 'student_id',
                'ประเภทการสอบ': 'exam_type',
                'สถานะ': 'status',
                'คะแนน': 'score',
                'วันที่': 'date',
                'หมายเหตุ': 'note'
            };
            
            const examsToImport = rows.map(r => {
                const item = {};
                Object.keys(mapping).forEach(csvKey => {
                    item[mapping[csvKey]] = r[csvKey] || '';
                });
                return item;
            }).filter(ex => ex.student_id && ex.exam_type);
            
            if (examsToImport.length === 0) throw new Error('ไม่พบข้อมูลที่ถูกต้องในไฟล์ CSV (ต้องมีรหัสนักศึกษาและประเภทการสอบ)');
            
            showToast(`กำลังนำเข้าข้อมูล ${examsToImport.length} รายการ...`, 'info');
            
            const res = await callApi({
                action: 'importExams',
                payload: { exams: examsToImport }
            });
            
            if (res.status === 'success') {
                showToast(`นำเข้าข้อมูลผลสอบสำเร็จ ${res.count || examsToImport.length} รายการ`, 'success');
                if (typeof window.syncActiveStudentData === 'function') {
                    await window.syncActiveStudentData();
                }
                renderPage();
            } else {
                throw new Error(res.message);
            }
        } catch (err) {
            showToast('เกิดข้อผิดพลาดในการนำเข้า: ' + err.message, 'error');
            console.error(err);
        } finally {
            event.target.value = ''; // Reset input
        }
    };
    reader.readAsText(file);
};

function parseCSV(text) {
    const lines = text.split(/\r?\n/).filter(line => line.trim());
    if (lines.length === 0) return [];
    
    const headers = lines[0].replace(/^\uFEFF/, '').split(',').map(h => h.trim());
    const result = [];
    
    for (let i = 1; i < lines.length; i++) {
        // Skip rows that start with '*' (comments)
        if (lines[i].startsWith('*')) continue;
        
        const currentLine = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/); // Regex to handle commas inside quotes
        if (currentLine.length < headers.length) continue;
        
        const obj = {};
        headers.forEach((h, index) => {
            let val = currentLine[index] ? currentLine[index].trim() : '';
            if (val.startsWith('"') && val.endsWith('"')) {
                val = val.substring(1, val.length -1).replace(/""/g, '"');
            }
            obj[h] = val;
        });
        result.push(obj);
    }
    return result;
}
