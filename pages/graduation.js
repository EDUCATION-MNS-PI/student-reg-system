// ============================
// Graduation Request & Approval Page
// ============================

pages.graduation = function() {
    const role = window.currentUserRole;
    if (role === 'student') {
        return renderStudentGraduation();
    } else {
        return renderAdminGraduation();
    }
};

function renderStudentGraduation() {
    const st = MOCK.student;
    if (!st) return `<div class="card"><div class="card-body">ไม่พบข้อมูลนักศึกษา</div></div>`;

    const allStudents = MOCK.students || [];
    const me = allStudents.find(s => String(s.id || s.studentId) === String(st.id || st.studentId)) || st;
    
    // Eligibility Calculations
    const currentGpa = parseFloat(me.gpa || 0);
    const gpaStatus = currentGpa >= 3.00;
    
    const plan = window.getStudyPlanForStudent(me);
    const requiredCredits = plan ? (plan.requiredCredits || 36) : 36;
    const currentCredits = parseInt(me.totalCredits || 0);
    const creditsStatus = currentCredits >= requiredCredits;
    
    const thesisTrack = (MOCK.thesisProgress || []).find(t => String(t.StudentID) === String(me.studentId || me.id));
    const thesisValid = thesisTrack && thesisTrack.M7_Status === 'Complete';

    const isEligible = gpaStatus && creditsStatus && thesisValid;
    
    // Existing Request?
    const existingRequest = (MOCK.graduationRequests || []).find(r => String(r.studentId) === String(me.studentId || me.id));

    return `
    <div class="animate-in">
        <div class="page-header">
            <h1 class="page-title">ยื่นเรื่องสำเร็จการศึกษา</h1>
            <p class="page-subtitle">ตรวจสอบเกณฑ์การสำเร็จการศึกษาและส่งคำร้อง</p>
        </div>

        <div class="grid-2">
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">ตรวจสอบเกณฑ์การสำเร็จการศึกษา</h3>
                </div>
                <div class="card-body">
                    <div class="eligibility-item ${gpaStatus ? 'success' : 'danger'}">
                        <div class="eligibility-icon">
                            ${gpaStatus ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>' : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'}
                        </div>
                        <div class="eligibility-content">
                            <div class="eligibility-label">เกรดเฉลี่ยสะสม (GPAX) ต้องไม่ต่ำกว่า 3.00</div>
                            <div class="eligibility-value">ปัจจุบัน: ${currentGpa.toFixed(2)}</div>
                        </div>
                    </div>

                    <div class="eligibility-item ${creditsStatus ? 'success' : 'danger'}">
                        <div class="eligibility-icon">
                            ${creditsStatus ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>' : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'}
                        </div>
                        <div class="eligibility-content">
                            <div class="eligibility-label">หน่วยกิตสะสมต้องครบตามหลักสูตร (${requiredCredits} นก.)</div>
                            <div class="eligibility-value">ปัจจุบัน: ${currentCredits} / ${requiredCredits} นก.</div>
                        </div>
                    </div>

                    <div class="eligibility-item ${thesisValid ? 'success' : 'danger'}">
                        <div class="eligibility-icon">
                            ${thesisValid ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>' : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'}
                        </div>
                        <div class="eligibility-content">
                            <div class="eligibility-label">ผ่านขั้นตอนวิทยานิพนธ์: แก้ไขตามมติกรรมการ</div>
                            <div class="eligibility-value">ปัจจุบัน: ${thesisValid ? 'เสร็จสิ้นแล้ว' : 'ยังไม่เสร็จสิ้น'}</div>
                        </div>
                    </div>

                    ${existingRequest ? `
                        <div class="status-box ${existingRequest.status === 'Approved' ? 'success' : 'warning'}" style="margin-top:20px;">
                            <div style="font-weight:700;">สถานะคำร้อง: ${existingRequest.status === 'Approved' ? 'อนุมัติแล้ว' : 'รอการตรวจสอบ'}</div>
                            <div style="font-size:0.85rem;">ยื่นเมื่อวันที่: ${existingRequest.requestDate}</div>
                            ${existingRequest.note ? `<div style="font-size:0.85rem; margin-top:5px;">หมายเหตุ: ${existingRequest.note}</div>` : ''}
                        </div>
                    ` : `
                        <div style="margin-top:30px;">
                            <button class="btn btn-primary" style="width:100%; padding:12px;" ${!isEligible ? 'disabled' : ''} onclick="submitGraduationRequest()">
                                ${isEligible ? 'ส่งคำร้องขอสำเร็จการศึกษา' : 'คุณยังไม่ผ่านเกณฑ์การสำเร็จการศึกษา'}
                            </button>
                            ${!isEligible ? `<p style="text-align:center; color:var(--danger); font-size:0.8rem; margin-top:10px;">* โปรดตรวจสอบเกณฑ์ที่ยังไม่ผ่านและดำเนินการให้ครบถ้วน</p>` : ''}
                        </div>
                    `}
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">ความก้าวหน้าวิทยานิพนธ์ (เงื่อนไขจบการศึกษา)</h3>
                </div>
                <div class="card-body" style="padding:0;">
                    <table class="data-table">
                        <thead>
                            <tr><th>ขั้นตอน</th><th>สถานะ</th></tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>แก้ไขตามมติกรรมการ</td>
                                <td><span class="badge ${thesisValid ? 'success' : 'neutral'}">${thesisValid ? 'เสร็จสิ้น' : 'ยังไม่เสร็จสิ้น'}</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>`;
}

function renderAdminGraduation() {
    const requests = MOCK.graduationRequests || [];
    const pending = requests.filter(r => r.status === 'Pending' || r.status === 'Waiting');
    
    return `
    <div class="animate-in">
        <div class="page-header">
            <h1 class="page-title">รายการคำร้องขอสำเร็จการศึกษา</h1>
            <p class="page-subtitle">ตรวจสอบและพิจารณาอนุมัติการจบการศึกษาของนักศึกษา</p>
        </div>

        <div class="stats-grid" style="margin-bottom:25px;">
            <div class="stat-card">
                <div class="stat-icon purple"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg></div>
                <div class="stat-value">${pending.length}</div>
                <div class="stat-label">คำร้องรอตรวจสอบ</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon green"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg></div>
                <div class="stat-value">${requests.filter(r => r.status === 'Approved').length}</div>
                <div class="stat-label">อนุมัติแล้วในภาคเรียนนี้</div>
            </div>
        </div>

        <div class="card">
            <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
                <h3 class="card-title">รายการคำร้องขอจบการศึกษา</h3>
                <span class="badge info">${requests.length} รายการทั้งหมด</span>
            </div>
            <div class="card-body" style="padding:0;">
                <div class="table-wrapper">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>วันที่ยื่น</th>
                                <th>รหัสนักศึกษา</th>
                                <th>ชื่อ-นามสกุล</th>
                                <th>เกณฑ์ผ่าน</th>
                                <th>สถานะ</th>
                                <th>จัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${requests.length > 0 ? requests.map(r => {
                                const st = (MOCK.students || []).find(s => String(s.studentId || s.id) === String(r.studentId));
                                const thesisTrack = (MOCK.thesisProgress || []).find(t => String(t.StudentID) === String(r.studentId));
                                const thesisValid = thesisTrack && thesisTrack.M7_Status === 'Complete';
                                return `
                                <tr>
                                    <td>${r.requestDate}</td>
                                    <td style="font-weight:600;">${r.studentId}</td>
                                    <td>${r.studentName}</td>
                                    <td>
                                        <div style="font-size:0.75rem;">GPA: <span style="color:${parseFloat(st?.gpa||0)>=3?'var(--success)':'var(--danger)'}">${parseFloat(st?.gpa||0).toFixed(2)}</span></div>
                                        <div style="font-size:0.75rem;">วิทยานิพนธ์ (M9): <span style="color:${thesisValid?'var(--success)':'var(--warning)'}">${thesisValid ? 'เสร็จสิ้น' : 'รอดำเนินการ'}</span></div>
                                    </td>
                                    <td><span class="badge ${r.status === 'Approved' ? 'success' : 'warning'}">${r.status === 'Approved' ? 'อนุมัติแล้ว' : 'รอตรวจสอบ'}</span></td>
                                    <td>
                                        ${r.status !== 'Approved' ? `
                                            <button class="btn btn-primary btn-sm" onclick="reviewGraduationRequest('${r.id}')">พิจารณา</button>
                                        ` : `
                                            <button class="btn btn-secondary btn-sm" onclick="viewStudentProfile('${r.studentId}')">ดูโปรไฟล์</button>
                                        `}
                                    </td>
                                </tr>
                                `;
                            }).join('') : `<tr><td colspan="6" style="text-align:center; padding:30px; color:var(--text-muted);">ไม่พบรายการคำร้อง</td></tr>`}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>`;
}

window.submitGraduationRequest = async function() {
    const st = MOCK.student;
    if (!st) return;

    if (confirm('ยืนยันการส่งคำร้องขอสำเร็จการศึกษา? ระบบจะส่งข้อมูลให้เจ้าหน้าที่ตรวจสอบ')) {
        const newReq = {
            id: 'REQ-' + Date.now(),
            studentId: st.studentId || st.id,
            studentName: `${st.prefix || ''}${st.firstName} ${st.lastName}`,
            requestDate: window.formatDateTh ? window.formatDateTh(new Date().toISOString().split('T')[0]) : window.formatDateThai(new Date()),
            status: 'Pending',
            note: ''
        };
        
        try {
            showApiLoading('กำลังส่งคำร้อง...');
            const res = await fetch(SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'submitGraduationRequest',
                    payload: newReq
                })
            }).then(r => r.json());

            hideApiLoading();
            if (res.status === 'success') {
                MOCK.graduationRequests.push(newReq);
                showToast('ส่งคำร้องสำเร็จแล้ว', 'success');
                renderPage();
            } else {
                alert('เกิดข้อผิดพลาด: ' + res.message);
            }
        } catch (err) {
            hideApiLoading();
            alert('การเชื่อมต่อขัดข้อง: ' + err.message);
        }
    }
};

window.reviewGraduationRequest = function(reqId) {
    const req = MOCK.graduationRequests.find(r => r.id === reqId);
    if (!req) return;

    const modalHtml = `
    <div style="padding:10px;">
        <p>พิจารณาคำร้องขอสำเร็จการศึกษาของ: <strong>${req.studentName}</strong></p>
        <p style="font-size:0.9rem; color:var(--text-secondary); margin-bottom:20px;">รหัสนักศึกษา: ${req.studentId}</p>
        
        <div class="form-group">
            <label class="form-label">สถานที่ทำงาน (ถ้ามีข้อมูล)</label>
            <input type="text" id="revWorkplace" class="form-input" placeholder="รพ.พุทธชินราช">
        </div>

        <div class="form-row" style="display:grid; grid-template-columns: 1fr 1fr; gap:15px; margin-top:15px;">
            <div class="form-group">
                <label class="form-label">ปีที่จบ (พ.ศ.)</label>
                <input type="number" id="revYear" class="form-input" value="${new Date().getFullYear() + 543}">
            </div>
            <div class="form-group">
                <label class="form-label">ตำแหน่ง</label>
                <input type="text" id="revPosition" class="form-input" placeholder="พยาบาลวิชาชีพ">
            </div>
        </div>

        <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:20px;">
            <button class="btn btn-secondary" onclick="closeModal()">ค้างไว้ก่อน</button>
            <button class="btn btn-primary" style="background:var(--success); border:none;" onclick="finalizeGraduationApproval('${reqId}')">อนุมัติการจบการศึกษา</button>
        </div>
    </div>
    `;
    openModal('ตรวจสอบคำร้องขอสำเร็จการศึกษา', modalHtml);
};

window.finalizeGraduationApproval = async function(reqId) {
    const req = MOCK.graduationRequests.find(r => r.id === reqId);
    if (!req) return;

    const workplace = document.getElementById('revWorkplace').value;
    const year = document.getElementById('revYear').value;
    const pos = document.getElementById('revPosition').value;

    if (confirm('ยืนยันการอนุมัติจบการศึกษา? นักศึกษาคนนี้จะถูกเปลี่ยนสถานะเป็น "สำเร็จการศึกษา" และย้ายไปยังฐานข้อมูลศิษย์เก่า')) {
        try {
            showApiLoading('กำลังอนุมัติ...');
            const res = await fetch(SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'approveGraduationRequest',
                    payload: { id: reqId, workplace: workplace, year: year, pos: pos }
                })
            }).then(r => r.json());

            hideApiLoading();
            if (res.status === 'success') {
                req.status = 'Approved';
                
                // Find student and update local MOCK
                const st = MOCK.students.find(s => String(s.studentId || s.id) === String(req.studentId));
                if (st) {
                    st.status = 'สำเร็จการศึกษา';
                    st.graduationYear = year;
                    st.workplace = workplace;
                    st.position = pos;
                }

                closeModal();
                showToast('อนุมัติจบการศึกษาเรียบร้อยแล้ว', 'success');
                renderPage();
            } else {
                alert('เกิดข้อผิดพลาด: ' + res.message);
            }
        } catch (err) {
            hideApiLoading();
            alert('การเชื่อมต่อขัดข้อง: ' + err.message);
        }
    }
};
