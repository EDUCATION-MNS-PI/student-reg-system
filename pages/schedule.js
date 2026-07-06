// ============================
// Schedule Page — ตารางการเรียนการสอน (Date-based format)
// ============================
pages.schedule = function() {
    const list = MOCK.scheduleList || [];

    // ---- Filter Controls ----
    const allSemesters = [...new Set(list.map(s => s.semester).filter(Boolean))];
    const allYears     = [...new Set(list.map(s => s.academicYear).filter(Boolean))];
    const activeSem  = window._schedSem  || allSemesters[0] || '';
    const activeYear = window._schedYear || allYears[0]     || '';

    const filtered = list.filter(s => {
        const semOk  = !activeSem  || s.semester     === activeSem;
        const yearOk = !activeYear || s.academicYear === activeYear;
        return semOk && yearOk;
    });

    // Set filter handlers
    window.changeSchedFilter = function(key, val) {
        window['_sched' + key] = val;
        navigateTo('schedule');
    };

    // ---- Empty state ----
    if (!list.length) {
        return `
        <div class="animate-in">
            <div class="page-header">
                <h1 class="page-title">ตารางการเรียนการสอน</h1>
                <p class="page-subtitle">ตารางการสอนประจำภาคการศึกษา</p>
            </div>
            <div class="card"><div class="card-body" style="text-align:center; padding:70px; color:var(--text-muted);">
                <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom:16px; opacity:0.35;"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/></svg>
                <div style="font-weight:700; font-size:1.05rem; margin-bottom:8px;">ยังไม่มีข้อมูลตารางการสอน</div>
                <div style="font-size:0.88rem;">กรุณาเพิ่มข้อมูลในชีท "Schedule" โดยมีคอลัมน์: วันที่, เวลา, หัวข้อ, อาจารย์ผู้สอน</div>
            </div></div>
        </div>`;
    }

    // ---- Filter bar ----
    const filterBar = (allSemesters.length > 1 || allYears.length > 1) ? `
    <div style="display:flex; gap:12px; flex-wrap:wrap; margin-bottom:20px; align-items:center;">
        ${allYears.length > 1 ? `
        <div style="display:flex; align-items:center; gap:8px;">
            <label style="font-size:0.85rem; font-weight:600; color:var(--text-secondary);">ปีการศึกษา</label>
            <select class="form-input" style="height:36px; padding:0 10px; min-width:130px;" onchange="changeSchedFilter('Year', this.value)">
                <option value="">-- ทั้งหมด --</option>
                ${allYears.map(y => `<option value="${y}" ${y===activeYear?'selected':''}>${y}</option>`).join('')}
            </select>
        </div>` : ''}
        ${allSemesters.length > 1 ? `
        <div style="display:flex; align-items:center; gap:8px;">
            <label style="font-size:0.85rem; font-weight:600; color:var(--text-secondary);">ภาคเรียน</label>
            <select class="form-input" style="height:36px; padding:0 10px; min-width:130px;" onchange="changeSchedFilter('Sem', this.value)">
                <option value="">-- ทั้งหมด --</option>
                ${allSemesters.map(s => `<option value="${s}" ${s===activeSem?'selected':''}>${s}</option>`).join('')}
            </select>
        </div>` : ''}
        <span style="font-size:0.82rem; color:var(--text-muted); margin-left:auto;">${filtered.length} รายการ</span>
    </div>` : '';

    // ---- Table rows ----
    const rows = filtered.map((s, i) => {
        const instructors = (s.instructor || '').split(/[,\/\n]/).map(n => n.trim()).filter(Boolean);
        const instrHtml = instructors.length > 1
            ? `<ul style="margin:0; padding-left:18px; font-size:0.88rem;">${instructors.map(n => `<li>${n}</li>`).join('')}</ul>`
            : `<span style="font-size:0.88rem;">${instructors[0] || '-'}</span>`;

        const topicLines = (s.topic || '-').split(/\n/).map(l => l.trim()).filter(Boolean);
        const topicHtml = topicLines.length > 1
            ? `<div style="font-weight:600; font-size:0.9rem; margin-bottom:4px;">${topicLines[0]}</div>
               <ul style="margin:0; padding-left:18px; color:var(--text-secondary); font-size:0.85rem;">
                   ${topicLines.slice(1).map(l => `<li>${l}</li>`).join('')}
               </ul>`
            : `<div style="font-size:0.9rem;">${topicLines[0] || '-'}</div>`;

        const rowBg = i % 2 === 0 ? '' : 'background:var(--bg-secondary);';
        return `
        <tr style="${rowBg} transition:background 0.2s;" onmouseover="this.style.background='var(--accent-primary-glow)'" onmouseout="this.style.background='${i%2===0?'':'var(--bg-secondary)'}'">
            <td style="vertical-align:top; padding:14px 16px; white-space:nowrap; font-size:0.88rem; font-weight:600; color:var(--text-primary);">${s.date || '-'}</td>
            <td style="vertical-align:top; padding:14px 16px; white-space:nowrap; font-size:0.85rem; color:var(--text-secondary);">${s.time || '-'}</td>
            <td style="vertical-align:top; padding:14px 16px;">${topicHtml}</td>
            <td style="vertical-align:top; padding:14px 16px;">${instrHtml}</td>
        </tr>`;
    }).join('');

    return `
    <style>
        .sched-table th {
            background: var(--bg-secondary);
            font-size: 0.82rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: var(--text-muted);
            padding: 12px 16px;
            border-bottom: 2px solid var(--border-color);
            white-space: nowrap;
        }
        .sched-table td {
            border-bottom: 1px solid var(--border-color);
        }
        .sched-table tr:last-child td {
            border-bottom: none;
        }
    </style>
    <div class="animate-in">
        <div class="page-header" style="margin-bottom:20px;">
            <h1 class="page-title">ตารางการเรียนการสอน</h1>
            <p class="page-subtitle">ตารางการสอนประจำภาคการศึกษา${activeYear ? ' ปีการศึกษา ' + activeYear : ''}${activeSem ? ' ภาค' + activeSem : ''}</p>
        </div>

        ${filterBar}

        <div class="card animate-in animate-delay-1">
            <div class="card-body" style="padding:0; overflow-x:auto;">
                <table class="data-table sched-table" style="width:100%; border-collapse:collapse;">
                    <thead>
                        <tr>
                            <th style="min-width:110px;">วันที่</th>
                            <th style="min-width:110px;">เวลา</th>
                            <th style="min-width:280px;">หัวข้อ / เนื้อหา</th>
                            <th style="min-width:180px;">อาจารย์ผู้สอน</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows || `<tr><td colspan="4" style="text-align:center; padding:40px; color:var(--text-muted);">ไม่พบข้อมูลในเงื่อนไขที่เลือก</td></tr>`}
                    </tbody>
                </table>
            </div>
        </div>
    </div>`;
};
