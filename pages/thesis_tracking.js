// ============================
// Thesis Tracking — Dashboard + Update (Separated)
// ============================

const THESIS_MILESTONES = [
    { id: 'M1',  label: 'สอบหัวข้อวิทยานิพนธ์',            icon: '📝', fields: [] },
    { id: 'M2',  label: 'แต่งตั้งอาจารย์ที่ปรึกษา',       icon: '👤', fields: [] },
    { id: 'M3',  label: 'สอบโครงร่างวิทยานิพนธ์',           icon: '🎯', fields: [] },
    { id: 'M4',  label: 'พิจารณาจริยธรรมการวิจัย (EC)',     icon: '⚖️', fields: [
        { id: 'EthicsDate1', label: 'วันที่อนุมัติ EC (1)', type: 'date' },
        { id: 'EthicsNo1',   label: 'เลขรับรอง/อนุมัติ EC (1)', type: 'text' },
        { id: 'EthicsNote1', label: 'หมายเหตุ EC (1)', type: 'text' },
        { id: 'EthicsDate2', label: 'วันที่อนุมัติ EC (2)', type: 'date' },
        { id: 'EthicsNo2',   label: 'เลขรับรอง/อนุมัติ EC (2)', type: 'text' },
        { id: 'EthicsNote2', label: 'หมายเหตุ EC (2)', type: 'text' }
    ] },
    { id: 'M5',  label: 'สอบป้องกันวิทยานิพนธ์',            icon: '🛡️', fields: [{ id: 'Score', label: 'ผลประเมิน/คะแนนสอบ', type: 'text' }] },
    { id: 'M6',  label: 'เผยแพร่ผลงาน (บทความวิชาการ)',      icon: '🌐', fields: [{ id: 'Journal', label: 'ชื่อวารสาร/สถานที่ตีพิมพ์', type: 'text' }] },
    { id: 'M7',  label: 'แก้ไขตามมติกรรมการ',               icon: '✍️', fields: [] },
    { id: 'M8',  label: 'ส่งเล่มฉบับสมบูรณ์',               icon: '📚', fields: [] }
];

function calcThesisProgress(track) {
    if (!track) return 0;
    const done = THESIS_MILESTONES.filter(m => track[`${m.id}_Status`] === 'Complete').length;
    return Math.round((done / THESIS_MILESTONES.length) * 100);
}

function formatDateTh(dateStr) {
    if (!dateStr || dateStr === '-') return '-';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const months = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear() + 543}`;
}

function getStudentDisplayName(s) {
    return s.name || `${s.prefix || ''}${s.firstName || ''} ${s.lastName || ''}`.trim() || s.studentId;
}

// ============================================================
// PAGE 1: รายงานความก้าวหน้า (Read-only Dashboard)
// ============================================================
pages['thesis-dashboard'] = function() {
    const role = window.currentUserRole;
    if (role === 'student') return renderStudentTimeline();
    return renderAdminDashboard();
};

function renderAdminDashboard() {
    const trackingData = MOCK.thesisProgress || [];
    const studentList  = MOCK.students || [];

    const combined = studentList.map(s => {
        const track = trackingData.find(t => String(t.StudentID) === String(s.studentId)) || {};
        const prog   = calcThesisProgress(track);
        const done   = THESIS_MILESTONES.filter(m => track[`${m.id}_Status`] === 'Complete').length;
        const curM   = THESIS_MILESTONES.find(m => track[`${m.id}_Status`] !== 'Complete');
        return {
            studentId:   s.studentId,
            name:        getStudentDisplayName(s),
            major:       s.major || s.department || track.Major || '-',
            cohort:      s.cohort || s.admissionYear || track.Cohort || '-',
            progress:    prog,
            doneCount:   done,
            currentStep: curM ? `ขั้นที่ ${THESIS_MILESTONES.indexOf(curM)+1}: ${curM.label}` : `✅ ครบทั้ง ${THESIS_MILESTONES.length} ขั้นตอน`,
            lastUpdate:  track.LastUpdated || '-',
        };
    });

    const totalCount    = combined.length;
    const completeCount = combined.filter(d => d.progress === 100).length;
    const activeCount   = combined.filter(d => d.progress > 0 && d.progress < 100).length;
    const pendingCount  = combined.filter(d => d.progress === 0).length;

    const rows = combined.length === 0
        ? `<tr><td colspan="5" style="text-align:center;padding:30px;color:var(--text-secondary);">ยังไม่มีข้อมูลนักศึกษาในระบบ</td></tr>`
        : combined.map(d => {
            let barColor = '#6366f1';
            if (d.progress === 100) barColor = '#10b981';
            else if (d.progress > 50) barColor = '#3b82f6';
            else if (d.progress === 0) barColor = '#cbd5e1';

            return `
            <tr class="thesis-row" data-search="${d.name} ${d.studentId} ${d.major} ${d.cohort}" 
                onclick="window.showThesisDetail('${d.studentId}')" 
                style="cursor:pointer;" title="คลิกเพื่อดูรายละเอียด">
                <td>
                    <div style="font-weight:600;color:var(--accent-primary);">${d.name}</div>
                    <div style="font-size:0.82rem;color:var(--text-secondary);">${d.studentId}${d.cohort !== '-' ? ' • รุ่น ' + d.cohort : ''}</div>
                </td>
                <td style="font-size:0.88rem;">${d.major}</td>
                <td>
                    <div style="margin-bottom:5px;">
                        <div style="display:flex;align-items:center;gap:8px;">
                            <div style="flex:1;height:8px;background:#e2e8f0;border-radius:4px;overflow:hidden;">
                                <div style="height:100%;width:${d.progress}%;background:${barColor};border-radius:4px;transition:width 0.6s;"></div>
                            </div>
                            <span style="font-size:0.82rem;font-weight:700;width:36px;text-align:right;color:${barColor};">${d.progress}%</span>
                        </div>
                    </div>
                    <div style="font-size:0.78rem;color:var(--text-secondary);">${d.currentStep}</div>
                </td>
                <td style="font-size:0.82rem;color:var(--text-secondary);">${formatDateTh(d.lastUpdate)}</td>
                <td>
                    <span style="display:inline-flex;align-items:center;gap:4px;font-size:0.78rem;font-weight:600;padding:4px 10px;border-radius:20px;
                        background:${d.progress===100?'#d1fae5':d.progress>0?'#dbeafe':'#f1f5f9'};
                        color:${d.progress===100?'#059669':d.progress>0?'#2563eb':'#94a3b8'};">
                        ${d.progress===100?'✅ สำเร็จ':d.progress>0?'🔵 กำลังดำเนินการ':'⬜ ยังไม่เริ่ม'}
                    </span>
                </td>
            </tr>`;
        }).join('');

    return `
    <div class="animate-in">
        <div class="page-header" style="margin-bottom:24px;">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;">
                <div>
                    <h1 class="page-title">รายงานความก้าวหน้าวิทยานิพนธ์</h1>
                    <p class="page-subtitle">ภาพรวมสถานะการทำวิทยานิพนธ์ของนักศึกษาทุกคน (อ่านอย่างเดียว)</p>
                </div>
                <button class="btn btn-primary" onclick="navigateTo('thesis-update')" style="height:42px;gap:8px;display:flex;align-items:center;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                    อัปเดตสถานะ
                </button>
            </div>
        </div>

        <!-- Summary Cards -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:16px;margin-bottom:24px;">
            <div class="card" style="border:none;background:linear-gradient(135deg,#1e293b,#334155);color:white;">
                <div class="card-body" style="padding:20px;">
                    <div style="font-size:0.8rem;opacity:0.8;margin-bottom:6px;">นักศึกษาทั้งหมด</div>
                    <div style="font-size:2.2rem;font-weight:800;">${totalCount}</div>
                </div>
            </div>
            <div class="card" style="border:none;background:linear-gradient(135deg,#3b82f6,#06b6d4);color:white;">
                <div class="card-body" style="padding:20px;">
                    <div style="font-size:0.8rem;opacity:0.8;margin-bottom:6px;">กำลังดำเนินการ</div>
                    <div style="font-size:2.2rem;font-weight:800;">${activeCount}</div>
                </div>
            </div>
            <div class="card" style="border:none;background:linear-gradient(135deg,#10b981,#059669);color:white;">
                <div class="card-body" style="padding:20px;">
                    <div style="font-size:0.8rem;opacity:0.8;margin-bottom:6px;">ผ่านครบ ${THESIS_MILESTONES.length} ขั้นตอน</div>
                    <div style="font-size:2.2rem;font-weight:800;">${completeCount}</div>
                </div>
            </div>
            <div class="card" style="border:none;background:linear-gradient(135deg,#f59e0b,#d97706);color:white;">
                <div class="card-body" style="padding:20px;">
                    <div style="font-size:0.8rem;opacity:0.8;margin-bottom:6px;">ยังไม่เริ่ม</div>
                    <div style="font-size:2.2rem;font-weight:800;">${pendingCount}</div>
                </div>
            </div>
        </div>

        <!-- Table -->
        <div class="card">
            <div class="card-body" style="padding:0;">
                <div style="padding:14px 20px;border-bottom:1px solid #e2e8f0;background:#f8fafc;border-radius:16px 16px 0 0;">
                    <div style="position:relative;">
                        <input type="text" placeholder="🔍 ค้นหา ชื่อ, รหัสนักศึกษา, สาขาวิชา..."
                            style="width:100%;border-radius:8px;border:1px solid #e2e8f0;padding:9px 14px 9px 36px;font-size:0.9rem;outline:none;"
                            onkeyup="window.filterThesisRows(this.value)">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"
                            style="position:absolute;left:11px;top:50%;transform:translateY(-50%);">
                            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg>
                    </div>
                </div>
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>ชื่อ-นามสกุล / รหัส</th>
                                <th>สาขาวิชา</th>
                                <th style="min-width:260px;">ความก้าวหน้า (${THESIS_MILESTONES.length} ขั้นตอน)</th>
                                <th>อัปเดตล่าสุด</th>
                                <th>สถานะ</th>
                            </tr>
                        </thead>
                        <tbody id="thesisDashTableBody">${rows}</tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>`;
}

window.filterThesisRows = function(q) {
    const keyword = q.toLowerCase();
    document.querySelectorAll('#thesisDashTableBody .thesis-row').forEach(row => {
        row.style.display = row.dataset.search.toLowerCase().includes(keyword) ? '' : 'none';
    });
};

// Student personal timeline view
function renderStudentTimeline() {
    const student = MOCK.student || {};
    const track   = (MOCK.thesisProgress || []).find(t => String(t.StudentID) === String(student.studentId)) || {};
    const prog    = calcThesisProgress(track);
    const doneCount = THESIS_MILESTONES.filter(m => track[`${m.id}_Status`] === 'Complete').length;
    const nextMs  = THESIS_MILESTONES.find(m => track[`${m.id}_Status`] !== 'Complete');

    const timelineHTML = THESIS_MILESTONES.map((m, i) => {
        const status = track[`${m.id}_Status`] || 'Pending';
        const date   = track[`${m.id}_Date`]   || '';
        const note   = track[`${m.id}_Note`]   || '';

        let dotColor = '#cbd5e1', dotBg = 'white', check = '', statusLabel = 'ยังไม่ดำเนินการ', labelColor = '#94a3b8';
        if (status === 'Complete') {
            dotColor = '#10b981'; dotBg = '#10b981'; check = '<path d="M8 12.5l3 3 5-6" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>'; statusLabel = 'ผ่านแล้ว'; labelColor = '#10b981';
        } else if (status === 'InProgress') {
            dotColor = '#3b82f6'; check = '<circle cx="12" cy="12" r="5" fill="#3b82f6"/>'; statusLabel = 'กำลังดำเนินการ'; labelColor = '#3b82f6';
        }

        const lineColor = status === 'Complete' ? '#10b981' : '#e2e8f0';

        const extraHtml = (m.fields || []).map(f => {
            const val = track[`${m.id}_${f.id}`];
            return val ? `<span style="display:inline-block;background:#f1f5f9;border-radius:6px;padding:2px 10px;font-size:0.78rem;font-weight:600;margin-top:6px;margin-right:6px;"><span style="color:#94a3b8;">${f.label}: </span>${val}</span>` : '';
        }).join('');

        return `
        <div style="display:flex;position:relative;">
            ${i < THESIS_MILESTONES.length - 1 ? `<div style="position:absolute;left:20px;top:34px;bottom:-12px;width:2px;background:${lineColor};z-index:0;"></div>` : ''}
            <div style="width:42px;flex-shrink:0;padding-top:8px;z-index:1;">
                <svg width="24" height="24" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" fill="${dotBg}" stroke="${dotColor}" stroke-width="2.5"/>
                    ${check}
                </svg>
            </div>
            <div style="flex:1;padding:12px 16px;background:white;border:1px solid ${status==='InProgress'?'#93c5fd':'#e2e8f0'};border-radius:12px;margin-bottom:12px;${status==='InProgress'?'box-shadow:0 4px 14px rgba(59,130,246,0.12);':''}opacity:${status==='Pending'?'0.65':'1'};">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px;">
                    <div>
                        <div style="font-size:0.75rem;font-weight:700;color:#94a3b8;margin-bottom:2px;">ขั้นตอนที่ ${i+1}/${THESIS_MILESTONES.length}</div>
                        <div style="display:flex;align-items:center;gap:6px;">
                            <span style="font-size:1.1rem;">${m.icon}</span>
                            <h4 style="margin:0;font-size:0.97rem;font-weight:700;color:${status==='InProgress'?'#1d4ed8':'#1e293b'};">${m.label}</h4>
                        </div>
                        <span style="display:inline-block;margin-top:6px;font-size:0.73rem;font-weight:700;padding:3px 10px;border-radius:20px;background:${labelColor}15;color:${labelColor};">${statusLabel}</span>
                    </div>
                    ${date ? `<div style="text-align:right;"><div style="font-size:0.73rem;color:#94a3b8;">วันที่</div><div style="font-size:0.88rem;font-weight:700;">${formatDateTh(date)}</div></div>` : ''}
                </div>
                ${extraHtml}
                ${note ? `<div style="margin-top:10px;padding:8px 12px;background:#f8fafc;border-left:3px solid #e2e8f0;border-radius:0 6px 6px 0;font-size:0.83rem;color:#475569;">${note}</div>` : ''}
            </div>
        </div>`;
    }).join('');

    return `
    <div class="animate-in">
        <div class="page-header" style="margin-bottom:20px;">
            <h1 class="page-title">ติดตามความก้าวหน้าวิทยานิพนธ์</h1>
            <p class="page-subtitle">ไทม์ไลน์ส่วนตัว — แสดงสถานะขั้นตอนการทำวิทยานิพนธ์ของคุณ</p>
        </div>

        <div class="card" style="margin-bottom:20px;border:2px solid var(--accent-primary-light);border-radius:16px;">
            <div class="card-body" style="display:flex;align-items:center;gap:20px;padding:20px 24px;flex-wrap:wrap;">
                <div style="position:relative;width:90px;height:90px;flex-shrink:0;">
                    <svg viewBox="0 0 36 36" style="width:90px;height:90px;transform:rotate(-90deg);">
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e2e8f0" stroke-width="3.5"/>
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--accent-primary)" stroke-width="3.5" stroke-dasharray="${prog}, 100"/>
                    </svg>
                    <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:1.1rem;font-weight:800;color:var(--accent-primary);">${prog}%</div>
                </div>
                <div>
                    <div style="font-size:1.1rem;font-weight:700;color:#1e293b;margin-bottom:4px;">ภาพรวมความก้าวหน้า</div>
                    <div style="font-size:0.88rem;color:#64748b;line-height:1.6;">ผ่านแล้ว <b>${doneCount} จาก ${THESIS_MILESTONES.length}</b> ขั้นตอน</div>
                    <div style="font-size:0.85rem;color:#64748b;">ขั้นตอนถัดไป: <b style="color:var(--accent-primary);">${nextMs ? nextMs.label : 'สำเร็จครบทุกขั้นตอนแล้ว! 🎉'}</b></div>
                </div>
            </div>
        </div>

        <div class="card">
            <div class="card-header"><h3 class="card-title">ไทม์ไลน์ ${THESIS_MILESTONES.length} ขั้นตอน</h3></div>
            <div class="card-body" style="padding:24px;">
                <div style="max-width:750px;padding-left:4px;">${timelineHTML}</div>
            </div>
        </div>
    </div>`;
}

// Show detailed timeline in a modal for Admin
window.showThesisDetail = function(studentId) {
    const student = (MOCK.students || []).find(s => String(s.studentId) === String(studentId));
    const track   = (MOCK.thesisProgress || []).find(t => String(t.StudentID) === String(studentId)) || {};
    if (!student) return;

    const prog   = calcThesisProgress(track);
    const name   = getStudentDisplayName(student);
    
    const timelineHTML = THESIS_MILESTONES.map((m, i) => {
        const status = track[`${m.id}_Status`] || 'Pending';
        const date   = track[`${m.id}_Date`]   || '';
        const note   = track[`${m.id}_Note`]   || '';

        let dotColor = '#cbd5e1', dotBg = 'white', check = '', statusLabel = 'ยังไม่เริ่ม', labelColor = '#94a3b8';
        if (status === 'Complete') {
            dotColor = '#10b981'; dotBg = '#10b981'; check = '<path d="M8 12.5l3 3 5-6" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>'; statusLabel = 'เสร็จสิ้น'; labelColor = '#10b981';
        } else if (status === 'InProgress') {
            dotColor = '#3b82f6'; check = '<circle cx="12" cy="12" r="5" fill="#3b82f6"/>'; statusLabel = 'กำลังดำเนินการ'; labelColor = '#3b82f6';
        }

        const extraHtml = (m.fields || []).map(f => {
            const val = track[`${m.id}_${f.id}`];
            return val ? `<div style="font-size:0.8rem;margin-top:4px;"><span style="color:#64748b;">${f.label}:</span> <b>${val}</b></div>` : '';
        }).join('');

        return `
        <div style="display:flex;position:relative;margin-bottom:16px;">
            ${i < THESIS_MILESTONES.length - 1 ? `<div style="position:absolute;left:13px;top:28px;bottom:-20px;width:2px;background:#e2e8f0;z-index:0;"></div>` : ''}
            <div style="width:28px;flex-shrink:0;z-index:1;padding-top:4px;">
                <svg width="24" height="24" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" fill="${dotBg}" stroke="${dotColor}" stroke-width="2.5"/>
                    ${check}
                </svg>
            </div>
            <div style="flex:1;padding-left:16px;">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                    <div>
                        <div style="font-size:0.7rem;font-weight:700;color:#94a3b8;">ขั้นที่ ${i+1}/${THESIS_MILESTONES.length}</div>
                        <div style="font-size:0.95rem;font-weight:700;color:#1e293b;">${m.label}</div>
                        <div style="display:flex;align-items:center;gap:6px;margin-top:4px;">
                            <span style="font-size:0.7rem;font-weight:700;padding:2px 8px;border-radius:10px;background:${labelColor}15;color:${labelColor};">${statusLabel}</span>
                            ${date ? `<span style="font-size:0.75rem;color:#64748b;">• ${formatDateTh(date)}</span>` : ''}
                        </div>
                    </div>
                </div>
                ${extraHtml}
                ${note ? `<div style="font-size:0.8rem;color:#64748b;margin-top:4px;font-style:italic;">"${note}"</div>` : ''}
            </div>
        </div>`;
    }).join('');

    const modalHtml = `
    <div style="padding:10px 0;">
        <div style="background:linear-gradient(135deg,#f8fafc,#eff6ff);padding:20px;border-radius:16px;margin-bottom:24px;display:flex;justify-content:space-between;align-items:center;">
            <div>
                <div style="font-size:1.1rem;font-weight:800;color:#1e293b;">${name}</div>
                <div style="font-size:0.85rem;color:#64748b;">รหัส: ${studentId} | สาขา: ${student.major || '-'}</div>
            </div>
            <div style="text-align:right;">
                <div style="font-size:0.75rem;color:#94a3b8;">ความก้าวหน้า</div>
                <div style="font-size:1.6rem;font-weight:800;color:var(--accent-primary);">${prog}%</div>
            </div>
        </div>
        <div style="max-height:60vh;overflow-y:auto;padding-right:10px;">
            ${timelineHTML}
        </div>
        <div style="margin-top:24px;display:flex;justify-content:flex-end;gap:12px;">
            <button class="btn btn-primary" onclick="window.loadUpdateFormAndGo('${studentId}')" style="gap:8px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                ไปหน้าแก้ไขสถานะ
            </button>
            <button class="btn btn-secondary" onclick="closeModal()">ปิดหน้าต่าง</button>
        </div>
    </div>`;

    openModal('รายละเอียดความก้าวหน้าวิทยานิพนธ์', modalHtml);
};

window.loadUpdateFormAndGo = function(studentId) {
    if (typeof closeModal === 'function') closeModal();
    navigateTo('thesis-update');
    setTimeout(() => {
        const sel = document.getElementById('thesisStudentSelect');
        const search = document.getElementById('thesisStudentSearch');
        if (sel) {
            sel.value = studentId;
            if (search) search.value = ''; // clear search search
            window.loadStudentMilestoneForm(studentId);
        }
    }, 150);
};


// ============================================================
// PAGE 2: อัปเดตสถานะวิทยานิพนธ์ (Admin Only)
// ============================================================
pages['thesis-update'] = function() {
    if (window.currentUserRole !== 'admin' && !window.isSuperAdmin) {
        return `<div class="card"><div class="card-body" style="text-align:center;padding:48px;">
            <div style="font-size:3rem;margin-bottom:12px;">🔒</div>
            <h3>สิทธิ์ไม่เพียงพอ</h3>
            <p style="color:var(--text-secondary);">เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถอัปเดตสถานะวิทยานิพนธ์ได้</p>
        </div></div>`;
    }
    return renderUpdatePage();
};

function renderUpdatePage() {
    const students = MOCK.students || [];

    const studentOptions = students.map(s => {
        const name = getStudentDisplayName(s);
        return `<option value="${s.studentId}" data-name="${name}" data-major="${s.major||''}" data-cohort="${s.cohort||''}">${name} (${s.studentId})</option>`;
    }).join('');

    return `
    <div class="animate-in">
        <div class="page-header" style="margin-bottom:24px;">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;">
                <div>
                    <h1 class="page-title">อัปเดตสถานะวิทยานิพนธ์</h1>
                    <p class="page-subtitle">ค้นหานักศึกษา แล้วอัปเดตความก้าวหน้า 8 ขั้นตอน</p>
                </div>
                <button class="btn btn-secondary" onclick="navigateTo('thesis-dashboard')" style="height:42px;display:flex;align-items:center;gap:8px;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                    กลับหน้ารายงาน
                </button>
            </div>
        </div>

        <!-- Student Selector -->
        <div class="card" style="margin-bottom:20px;">
            <div class="card-body" style="padding:24px;">
                <h3 style="margin:0 0 16px;font-size:1rem;color:#1e293b;">เลือกนักศึกษาที่ต้องการอัปเดต</h3>
                <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:flex-end;">
                    <div style="flex:1;min-width:280px;">
                        <label style="display:block;font-size:0.8rem;font-weight:600;color:#64748b;margin-bottom:6px;">ค้นหาจากชื่อหรือรหัสนักศึกษา</label>
                        <div style="position:relative;">
                            <input type="text" id="thesisStudentSearch" placeholder="พิมพ์ชื่อหรือรหัสนักศึกษา..."
                                style="width:100%;border-radius:10px;border:2px solid #e2e8f0;padding:10px 14px 10px 36px;font-size:0.92rem;outline:none;"
                                oninput="window.filterStudentSelect(this.value)">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" style="position:absolute;left:11px;top:50%;transform:translateY(-50%);"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                        </div>
                    </div>
                    <div style="flex:1;min-width:280px;">
                        <label style="display:block;font-size:0.8rem;font-weight:600;color:#64748b;margin-bottom:6px;">รายชื่อนักศึกษา</label>
                        <select id="thesisStudentSelect" class="form-select" onchange="window.loadStudentMilestoneForm(this.value)"
                            style="width:100%;border-radius:10px;height:42px;border:2px solid #e2e8f0;outline:none;font-size:0.92rem;padding:0 12px;">
                            <option value="">-- เลือกเพื่อเริ่มต้นอัปเดต --</option>
                            ${studentOptions}
                        </select>
                    </div>
                </div>
            </div>
        </div>

        <div id="milestoneFormArea" class="animate-in"></div>
    </div>`;
}

window.filterStudentSelect = function(q) {
    const keyword = q.toLowerCase();
    const sel = document.getElementById('thesisStudentSelect');
    if (!sel) return;
    for (let opt of sel.options) {
        if (!opt.value) continue;
        const txt = (opt.dataset.name + ' ' + opt.value + ' ' + (opt.dataset.major||'') + ' ' + (opt.dataset.cohort||'')).toLowerCase();
        opt.style.display = txt.includes(keyword) ? '' : 'none';
    }
};

window.loadStudentMilestoneForm = function(studentId) {
    if (!studentId) {
        document.getElementById('milestoneFormArea').innerHTML = '';
        return;
    }

    const student = (MOCK.students || []).find(s => String(s.studentId) === String(studentId));
    const track   = (MOCK.thesisProgress || []).find(t => String(t.StudentID) === String(studentId)) || {};
    if (!student) return;

    const prog   = calcThesisProgress(track);
    const name   = getStudentDisplayName(student);
    const major  = student.major || track.Major || '-';
    const cohort = student.cohort || track.Cohort || '-';

    let milestonesHtml = THESIS_MILESTONES.map((m, idx) => {
        const cStatus = track[`${m.id}_Status`] || 'Pending';
        const cDate   = track[`${m.id}_Date`]   || '';
        const cNote   = track[`${m.id}_Note`]   || '';
        const dateVal = cDate.includes('T') ? cDate.split('T')[0] : cDate;

        let headerBg = '';
        if (cStatus === 'Complete')    headerBg = 'background:#f0fdf4;border-color:#6ee7b7;';
        else if (cStatus === 'InProgress') headerBg = 'background:#eff6ff;border-color:#93c5fd;';

        // Special rendering for M4 (EC) — show EC1 and EC2 as separate blocks
        let extraFieldsHtml = '';
        if (m.id === 'M4') {
            const ec1DateVal = (track['M4_EthicsDate1'] || '').replace('T', ' ').split(' ')[0];
            const ec2DateVal = (track['M4_EthicsDate2'] || '').replace('T', ' ').split(' ')[0];
            const ec1No = track['M4_EthicsNo1'] || '';
            const ec2No = track['M4_EthicsNo2'] || '';
            const ec1Note = track['M4_EthicsNote1'] || '';
            const ec2Note = track['M4_EthicsNote2'] || '';
            extraFieldsHtml = `
                <div style="padding:12px 16px;background:white;border-top:1px solid #e2e8f0;">
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                        <div style="background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:10px;padding:12px 14px;">
                            <div style="font-size:0.75rem;font-weight:700;color:#6366f1;margin-bottom:8px;letter-spacing:0.5px;">🔖 EC (1)</div>
                            <div style="display:flex;flex-direction:column;gap:8px;">
                                <div>
                                    <label style="display:block;font-size:0.75rem;color:#64748b;margin-bottom:3px;">วันที่อนุมัติ EC (1)</label>
                                    <input type="date" id="M4_EthicsDate1" class="form-input" value="${ec1DateVal}"
                                        style="width:100%;height:34px;font-size:0.83rem;border-radius:7px;">
                                </div>
                                <div>
                                    <label style="display:block;font-size:0.75rem;color:#64748b;margin-bottom:3px;">เลขรับรอง/อนุมัติ EC (1)</label>
                                    <input type="text" id="M4_EthicsNo1" class="form-input" placeholder="เช่น EC 65-001" value="${ec1No}"
                                        style="width:100%;height:34px;font-size:0.83rem;border-radius:7px;">
                                </div>
                                <div>
                                    <label style="display:block;font-size:0.75rem;color:#64748b;margin-bottom:3px;">หมายเหตุ / รายละเอียด (1)</label>
                                    <input type="text" id="M4_EthicsNote1" class="form-input" placeholder="หมายเหตุ EC (1)" value="${ec1Note}"
                                        style="width:100%;height:34px;font-size:0.83rem;border-radius:7px;">
                                </div>
                            </div>
                        </div>
                        <div style="background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:10px;padding:12px 14px;opacity:${ec1No || ec1DateVal ? '1' : '0.55'};">
                            <div style="font-size:0.75rem;font-weight:700;color:#0891b2;margin-bottom:8px;letter-spacing:0.5px;">🔖 EC (2) <span style="font-weight:400;color:#94a3b8;">(ถ้ามี)</span></div>
                            <div style="display:flex;flex-direction:column;gap:8px;">
                                <div>
                                    <label style="display:block;font-size:0.75rem;color:#64748b;margin-bottom:3px;">วันที่อนุมัติ EC (2)</label>
                                    <input type="date" id="M4_EthicsDate2" class="form-input" value="${ec2DateVal}"
                                        style="width:100%;height:34px;font-size:0.83rem;border-radius:7px;">
                                </div>
                                <div>
                                    <label style="display:block;font-size:0.75rem;color:#64748b;margin-bottom:3px;">เลขรับรอง/อนุมัติ EC (2)</label>
                                    <input type="text" id="M4_EthicsNo2" class="form-input" placeholder="เช่น EC 65-002" value="${ec2No}"
                                        style="width:100%;height:34px;font-size:0.83rem;border-radius:7px;">
                                </div>
                                <div>
                                    <label style="display:block;font-size:0.75rem;color:#64748b;margin-bottom:3px;">หมายเหตุ / รายละเอียด (2)</label>
                                    <input type="text" id="M4_EthicsNote2" class="form-input" placeholder="หมายเหตุ EC (2)" value="${ec2Note}"
                                        style="width:100%;height:34px;font-size:0.83rem;border-radius:7px;">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;
        } else {
            extraFieldsHtml = `
                <div style="padding:12px 16px;display:flex;gap:10px;flex-wrap:wrap;background:white;">
                    <input type="text" id="${m.id}_Note" class="form-input" placeholder="หมายเหตุ / รายละเอียด" value="${cNote}"
                        style="flex:2;min-width:200px;height:36px;font-size:0.83rem;border-radius:8px;">
                    ${(m.fields || []).map(f => {
                        const fVal = track[`${m.id}_${f.id}`] || '';
                        const fDateVal = fVal.includes('T') ? fVal.split('T')[0] : fVal;
                        return `<input type="${f.type}" id="${m.id}_${f.id}" class="form-input" placeholder="${f.label}" value="${f.type==='date'?fDateVal:fVal}"
                            style="flex:1;min-width:160px;height:36px;font-size:0.83rem;border-radius:8px;background:#fafafa;border-color:#94a3b8;">`;  
                    }).join('')}
                </div>`;
        }

        return `
        <div style="border:1.5px solid #e2e8f0;border-radius:12px;overflow:hidden;${headerBg}">
            <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid #e2e8f0;flex-wrap:wrap;gap:10px;">
                <div style="display:flex;align-items:center;gap:10px;">
                    <span style="font-size:1.3rem;">${m.icon}</span>
                    <div>
                        <div style="font-size:0.75rem;color:#94a3b8;font-weight:600;">ขั้นตอนที่ ${idx+1}</div>
                        <div style="font-size:0.95rem;font-weight:700;color:#1e293b;">${m.label}</div>
                    </div>
                </div>
                <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
                    <select id="${m.id}_Status" class="form-select" style="height:36px;padding:0 10px;border-radius:8px;font-size:0.85rem;min-width:155px;">
                        <option value="Pending"    ${cStatus==='Pending'   ?'selected':''}>⬜ ยังไม่เริ่ม</option>
                        <option value="InProgress" ${cStatus==='InProgress'?'selected':''}>🔵 กำลังดำเนินการ</option>
                        <option value="Complete"   ${cStatus==='Complete'  ?'selected':''}>✅ ผ่าน / เสร็จสิ้น</option>
                    </select>
                    ${m.id !== 'M4' ? `<input type="date" id="${m.id}_Date" class="form-input" value="${dateVal}"
                        style="height:36px;border-radius:8px;font-size:0.85rem;width:145px;">` : ''}
                </div>
            </div>
            ${extraFieldsHtml}
        </div>`;
    }).join('');

    document.getElementById('milestoneFormArea').innerHTML = `
    <div class="card">
        <div class="card-body" style="padding:0;">
            <div style="padding:20px 24px;border-bottom:1px solid #e2e8f0;background:linear-gradient(135deg,#f8fafc,#eef2ff);border-radius:16px 16px 0 0;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
                <div>
                    <div style="font-size:1.1rem;font-weight:700;color:#1e293b;">${name}</div>
                    <div style="font-size:0.85rem;color:#64748b;margin-top:2px;">รหัส: ${studentId}${major !== '-' ? ' | สาขา: ' + major : ''}${cohort !== '-' ? ' | รุ่น ' + cohort : ''}</div>
                </div>
                <div style="display:flex;align-items:center;gap:12px;">
                    <div style="text-align:right;">
                        <div style="font-size:0.75rem;color:#94a3b8;">ความก้าวหน้าปัจจุบัน</div>
                        <div style="font-size:1.5rem;font-weight:800;color:var(--accent-primary);">${prog}%</div>
                    </div>
                    <div style="width:50px;height:50px;position:relative;">
                        <svg viewBox="0 0 36 36" style="width:50px;height:50px;transform:rotate(-90deg);">
                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e2e8f0" stroke-width="4"/>
                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--accent-primary)" stroke-width="4" stroke-dasharray="${prog}, 100"/>
                        </svg>
                    </div>
                </div>
            </div>

            <div style="padding:20px 24px;display:flex;flex-direction:column;gap:12px;">
                <input type="hidden" id="tu_studentId"   value="${studentId}">
                <input type="hidden" id="tu_studentName" value="${name}">
                <input type="hidden" id="tu_major"       value="${major}">
                <input type="hidden" id="tu_cohort"      value="${cohort}">
                ${milestonesHtml}
            </div>

            <div style="padding:16px 24px;border-top:1px solid #e2e8f0;display:flex;justify-content:flex-end;gap:12px;background:#f8fafc;border-radius:0 0 16px 16px;">
                <button class="btn btn-secondary" onclick="document.getElementById('milestoneFormArea').innerHTML=''">ยกเลิก</button>
                <button class="btn btn-primary" onclick="window.saveThesisMilestonesInline()" style="gap:8px;display:flex;align-items:center;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                    บันทึกความก้าวหน้า
                </button>
            </div>
        </div>
    </div>`;

    if (window.initThaiDatePickers) window.initThaiDatePickers();
};

window.saveThesisMilestonesInline = async function() {
    const studentId   = document.getElementById('tu_studentId').value;
    const studentName = document.getElementById('tu_studentName').value;
    const major       = document.getElementById('tu_major').value;
    const cohort      = document.getElementById('tu_cohort').value;

    const milestones = {};
    THESIS_MILESTONES.forEach(m => {
        milestones[`${m.id}_Status`] = document.getElementById(`${m.id}_Status`)?.value || '';
        if (m.id === 'M4') {
            milestones[`${m.id}_Date`] = '';
        } else {
            milestones[`${m.id}_Date`] = document.getElementById(`${m.id}_Date`)?.value || '';
        }
        milestones[`${m.id}_Note`] = document.getElementById(`${m.id}_Note`)?.value || '';
        (m.fields || []).forEach(f => {
            milestones[`${m.id}_${f.id}`] = document.getElementById(`${m.id}_${f.id}`)?.value || '';
        });
    });

    const payload = {
        studentId, studentName, major, cohort,
        updatedBy: window.currentUserData?.name || 'Admin',
        milestones
    };

    window.showLoading && window.showLoading();
    try {
        const resp = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'updateThesisMilestone', payload })
        });
        const result = await resp.json();
        window.hideLoading && window.hideLoading();

        if (result.status === 'success') {
            let existing = MOCK.thesisProgress.find(t => String(t.StudentID) === String(studentId));
            if (existing) {
                Object.assign(existing, milestones, { LastUpdated: new Date().toISOString() });
            } else {
                MOCK.thesisProgress.push({ StudentID: studentId, StudentName: studentName, Major: major, Cohort: cohort, LastUpdated: new Date().toISOString(), ...milestones });
            }

            document.getElementById('milestoneFormArea').innerHTML = `
                <div style="text-align:center;padding:40px;background:#f0fdf4;border-radius:16px;border:2px solid #6ee7b7;">
                    <div style="font-size:3rem;margin-bottom:12px;">✅</div>
                    <h3 style="color:#059669;margin:0 0 8px;">บันทึกเรียบร้อยแล้ว!</h3>
                    <p style="color:#64748b;margin:0 0 16px;">อัปเดตความก้าวหน้าของ <b>${studentName}</b> สำเร็จแล้ว</p>
                    <div style="display:flex;justify-content:center;gap:12px;flex-wrap:wrap;">
                        <button class="btn btn-primary" onclick="window.loadStudentMilestoneForm('${studentId}')" style="background:var(--danger);border:none;">อัปเดตต่อ</button>
                        <button class="btn btn-secondary" onclick="navigateTo('thesis-dashboard')">ดูรายงานรวม</button>
                    </div>
                </div>`;
        } else {
            alert('เกิดข้อผิดพลาด: ' + result.message);
        }
    } catch (err) {
        window.hideLoading && window.hideLoading();
        alert('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้: ' + err.message);
    }
};
