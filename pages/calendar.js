// ============================
// Academic Calendar Page
// ============================

// Store current calendar state globally
window._calMonth = new Date().getMonth(); // current month (0-indexed)
window._calYear = new Date().getFullYear();
window._calViewMode = 'grid'; // 'grid' or 'table'

window.toggleCalView = function(mode) {
    window._calViewMode = mode;
    renderPage();
};

window.buildCalendarHTML = function(year, month) {
    const monthNames = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
    const dayNames = ['อา.','จ.','อ.','พ.','พฤ.','ศ.','ส.'];

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    const now = new Date();
    const todayDay = (now.getFullYear() === year && now.getMonth() === month) ? now.getDate() : -1;

    let days = [];
    for (let i = firstDay - 1; i >= 0; i--) {
        days.push({ day: daysInPrevMonth - i, otherMonth: true });
    }
    const parseLocalDate = (dateStr) => {
        const parts = dateStr.split('-');
        return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    };

    for (let d = 1; d <= daysInMonth; d++) {
        const dObj = new Date(year, month, d);
        const events = (MOCK.calendarEvents || []).map(e => {
            const start = parseLocalDate(e.startDate);
            const end = parseLocalDate(e.endDate);
            const durationDays = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
            
            const curYear = dObj.getFullYear();
            const curMonth = String(dObj.getMonth() + 1).padStart(2, '0');
            const curDay = String(dObj.getDate()).padStart(2, '0');
            const curDateStr = `${curYear}-${curMonth}-${curDay}`;
            
            const isStart = curDateStr === e.startDate;
            const isEnd = curDateStr === e.endDate;
            
            return {
                ...e,
                durationDays,
                isStart,
                isEnd,
                inRange: dObj >= start && dObj <= end
            };
        }).filter(e => {
            if (!e.inRange) return false;
            if (e.durationDays >= 3) {
                return e.isStart || e.isEnd;
            }
            return true;
        }).map(e => {
            let displayTitle = e.title;
            if (e.durationDays >= 3) {
                if (e.isStart) displayTitle += ' (เริ่ม)';
                else if (e.isEnd) displayTitle += ' (สิ้นสุด)';
            }
            return {
                ...e,
                displayTitle
            };
        });
        days.push({ day: d, today: d === todayDay, events });
    }
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
        days.push({ day: i, otherMonth: true });
    }

    // Build month options
    const monthOptions = monthNames.map((m, i) =>
        `<option value="${i}" ${i === month ? 'selected' : ''}>${m}</option>`
    ).join('');

    // Build year options (2568-2570 BE = 2025-2027 CE)
    const yearOptions = [];
    for (let y = 2025; y <= 2027; y++) {
        yearOptions.push(`<option value="${y}" ${y === year ? 'selected' : ''}>${y + 543}</option>`);
    }

    return `
        <div class="card-header" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
            <div style="display:flex; align-items:center; gap:10px;">
                <button class="btn" style="padding:6px 12px; background:var(--bg-tertiary); border:1px solid var(--border-color); color:var(--text-primary); font-size:1.1rem;" onclick="calNavigate(-1)" title="เดือนก่อนหน้า">‹</button>
                <div style="display:flex; gap:8px; align-items:center;">
                    <select class="form-select" id="calMonthSelect" onchange="calSelectChanged()" style="min-width:130px; padding:6px 10px; font-size:0.95rem;">
                        ${monthOptions}
                    </select>
                    <select class="form-select" id="calYearSelect" onchange="calSelectChanged()" style="min-width:100px; padding:6px 10px; font-size:0.95rem;">
                        ${yearOptions.join('')}
                    </select>
                </div>
                <button class="btn" style="padding:6px 12px; background:var(--bg-tertiary); border:1px solid var(--border-color); color:var(--text-primary); font-size:1.1rem;" onclick="calNavigate(1)" title="เดือนถัดไป">›</button>
                <button class="btn" style="padding:6px 12px; background:var(--accent-primary); color:white; border:none; font-size:0.85rem; border-radius:var(--radius-md);" onclick="calGoToday()">วันนี้</button>
            </div>
            <div style="display:flex; gap:8px; flex-wrap:wrap;">
                <span class="badge" style="background:rgba(239,68,68,0.15);color:#f87171">สอบ</span>
                <span class="badge" style="background:rgba(185,28,28,0.15);color:var(--accent-primary)">วิทยานิพนธ์</span>
                <span class="badge" style="background:rgba(99,102,241,0.15);color:#818cf8">ทะเบียน</span>
                <span class="badge" style="background:rgba(34,197,94,0.15);color:#4ade80">วันหยุด</span>
                <span class="badge" style="background:rgba(245,158,11,0.15);color:#fbbf24">กิจกรรม</span>
            </div>
        </div>
        <div class="card-body">
            <div class="calendar-grid">
                ${dayNames.map(d => `<div class="calendar-day-header">${d}</div>`).join('')}
                ${days.map(d => `
                    <div class="calendar-day ${d.otherMonth ? 'other-month' : ''} ${d.today ? 'today' : ''}">
                        <div class="calendar-day-number">${d.day}</div>
                        ${(d.events || []).map(e => `
                            <div class="calendar-event event-${e.type}" title="${e.title} ${e.cohort !== 'all' ? '('+e.cohort+')' : ''}">
                                ${e.cohort !== 'all' ? `<small style="font-weight:800; opacity:0.8; margin-right:2px;">[${e.cohort}]</small>` : ''}
                                ${e.displayTitle || e.title}
                            </div>
                        `).join('')}
                    </div>
                `).join('')}
            </div>
        </div>`;
};

window.buildEventListHTML = function(year, month) {
    const firstOfMonth = new Date(year, month, 1);
    const lastOfMonth = new Date(year, month + 1, 0);

    const monthEvents = (MOCK.calendarEvents || []).filter(e => {
        const start = new Date(e.startDate);
        const end = new Date(e.endDate);
        // Overlaps with current month
        return start <= lastOfMonth && end >= firstOfMonth;
    }).sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

    if (monthEvents.length === 0) {
        return `<div style="text-align:center; padding:20px; color:var(--text-muted); font-size:0.9rem;">ไม่มีกำหนดการในเดือนนี้</div>`;
    }

    return `<div class="activity-list">
        ${monthEvents.map(e => {
            const start = new Date(e.startDate);
            const end = new Date(e.endDate);
            let dateText = start.toLocaleDateString('th-TH', { day:'numeric', month:'short', year:'numeric' });
            if (e.startDate !== e.endDate) {
                const endText = end.toLocaleDateString('th-TH', { day:'numeric', month:'short', year:'numeric' });
                // If same month and year, simplify
                if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
                    dateText = `${start.getDate()} - ${endText}`;
                } else {
                    dateText = `${start.toLocaleDateString('th-TH', { day:'numeric', month:'short' })} - ${endText}`;
                }
            }
            
            return `
            <div class="activity-item">
                <div class="activity-dot ${e.type === 'exam' ? 'orange' : e.type === 'holiday' ? 'green' : e.type === 'register' ? 'purple' : e.type === 'thesis' ? 'red' : 'blue'}"></div>
                <div>
                    <div class="activity-text">
                        ${e.cohort !== 'all' ? `<span class="badge" style="padding:1px 6px; font-size:0.75rem; margin-right:5px; background:var(--bg-tertiary); color:var(--text-secondary);">รหัส ${e.cohort}</span>` : ''}
                        ${e.title}
                    </div>
                    <div class="activity-time">${dateText}</div>
                </div>
            </div>`;
        }).join('')}
    </div>`;
};

window.renderCalendarTable = function(selectedYear) {
    const is2569 = selectedYear >= 2026;
    const yearBE = is2569 ? 2569 : 2568;
    
    // Header based on cohorts active in that year
    const cohorts = is2569 ? [66, 67, 68, 69] : [65, 66, 67, 68];
    const cohortLabels = cohorts.map(c => `รหัส 25${c} (รุ่น ${c-64})`);

    const data2568 = [
        { label: 'ชำระค่าลงทะเบียนและค่าธรรมเนียมการศึกษา ภาคการศึกษาที่ 1', dates: { 65: '2 - 15 มิ.ย. 68', 66: '2 - 15 มิ.ย. 68', 67: '2 - 15 มิ.ย. 68', 68: '1-12 ก.พ. / 5-17 พ.ค.' } },
        { label: 'กิจกรรม Research camp', dates: { 65: '26 - 28 พ.ค. 68', 66: '26 - 28 พ.ค. 68', 67: '26 - 28 พ.ค. 68', 68: '-' } },
        { label: 'สอบประมวลความรู้', dates: { 65: '-', 66: '-', 67: '31 พ.ค. - 1 มิ.ย. 68', 68: '-' } },
        { label: 'นักศึกษาใหม่รายงานตัว/ปฐมนิเทศ', dates: { 65: '-', 66: '-', 67: '7 - 8 มิ.ย. 68', 68: '7 - 8 มิ.ย. 68' } },
        { label: 'เปิดภาคการศึกษาที่ 1', dates: { 65: '20 มิ.ย. 68', 66: '20 มิ.ย. 68', 67: '20 มิ.ย. 68', 68: '20 มิ.ย. 68' }, highlight: true },
        { label: 'นำเสนอความก้าวหน้าในการทำโครงร่างวิทยานิพนธ์ (Draft)', dates: { 65: '21 - 22 มิ.ย. 68', 66: '27 - 28 มิ.ย. 68', 67: '29 - 30 มิ.ย. 68', 68: '-' } },
        { label: 'สอบวัดมาตรฐานภาษาอังกฤษฯ ครั้งที่ 1', dates: { 65: '9 ส.ค. 68', 66: '9 ส.ค. 68', 67: '9 ส.ค. 68', 68: '9 ส.ค. 68' } },
        { label: 'นำเสนอความก้าวหน้าในการทำโครงร่างวิทยานิพนธ์ (Final)', dates: { 65: '26 - 28 ก.ย. 68', 66: '1 - 5 ต.ค. 68', 67: '10 - 12 ต.ค. 68', 68: '-' } },
        { label: 'เปิดภาคการศึกษาที่ 2', dates: { 65: '31 ต.ค. 68', 66: '31 ต.ค. 68', 67: '31 ต.ค. 68', 68: '31 ต.ค. 68' }, highlight: true },
        { label: 'นำเสนอความก้าวหน้าฯ ภาคเรียนที่ 2', dates: { 65: '6 - 8 ก.พ. 69', 66: '6 - 8 ก.พ. 69', 67: '13 - 15 ก.พ. 69', 68: '-' } },
    ];

    const data2569 = [
        { label: 'ชำระค่าลงทะเบียนและค่าธรรมเนียมการศึกษา ภาคการศึกษาที่ 1', dates: { 66: '1 - 18 มิ.ย. 69', 67: '1 - 18 มิ.ย. 69', 68: '1 - 18 มิ.ย. 69', 69: 'ตามประกาศ' } },
        { label: 'กิจกรรม Research camp (Online)', dates: { 66: '22 - 24 พ.ค. 69', 67: '22 - 24 พ.ค. 69', 68: '22 - 24 พ.ค. 69', 69: '-' } },
        { label: 'สอบประมวลความรู้', dates: { 66: '-', 67: '-', 68: '-', 69: '30 - 31 พ.ค. 69' } },
        { label: 'นักศึกษาใหม่รายงานตัว/ปฐมนิเทศ (69)', dates: { 66: '-', 67: '-', 68: '-', 69: '13 - 14 มิ.ย. 69' } },
        { label: 'เปิดภาคการศึกษาที่ 1', dates: { 66: '19 มิ.ย. 69', 67: '19 มิ.ย. 69', 68: '19 มิ.ย. 69', 69: '19 มิ.ย. 69' }, highlight: true },
        { label: 'นำเสนอความก้าวหน้าในการทำโครงร่างวิทยานิพนธ์ (Draft)', dates: { 66: '27 - 28 มิ.ย. 69', 67: '4 - 5 ก.ค. 69', 68: '20 - 21 มิ.ย. 69', 69: '-' } },
        { label: 'สอบหัวข้อวิทยานิพนธ์ (Topic)', dates: { 66: '-', 67: '-', 68: '11 - 12 ก.ค. 69', 69: '-' } },
        { label: 'สอบวัดมาตรฐานภาษาอังกฤษฯ ครั้งที่ 1', dates: { 66: '15 - 16 ส.ค. 69', 67: '15 - 16 ส.ค. 69', 68: '15 - 16 ส.ค. 69', 69: '15 - 16 ส.ค. 69' } },
        { label: 'นำเสนอความก้าวหน้าในการทำโครงร่างวิทยานิพนธ์ (Final)', dates: { 66: '10 - 11 ต.ค. 69', 67: '17 - 18 ต.ค. 69', 68: '2 - 3 ก.ย. 69', 69: '-' } },
        { label: 'เปิดภาคการศึกษาที่ 2', dates: { 66: '31 ต.ค. 69', 67: '31 ต.ค. 69', 68: '31 ต.ค. 69', 69: '31 ต.ค. 69' }, highlight: true },
    ];

    const rows = is2569 ? data2569 : data2568;

    return `
    <div class="card animate-in">
        <div class="card-header">
            <h3 class="card-title">สรุปปฏิทินการศึกษาแยกตามรุ่น ปีการศึกษา ${yearBE}</h3>
        </div>
        <div class="card-body" style="padding:0; overflow-x:auto;">
            <table class="data-table">
                <thead>
                    <tr>
                        <th style="min-width:250px;">กิจกรรม</th>
                        ${cohortLabels.map(label => `<th style="text-align:center;">${label}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${rows.map(row => `
                        <tr ${row.highlight ? 'style="background:rgba(239,68,68,0.05);"' : ''}>
                            <td style="font-weight:600; ${row.highlight ? 'color:var(--accent-primary);' : ''}">${row.label}</td>
                            ${cohorts.map(c => `<td style="text-align:center; font-size:0.9rem;">${row.dates[c] || '-'}</td>`).join('')}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    </div>`;
};

pages.calendar = function() {
    const year = window._calYear;
    const month = window._calMonth;
    const monthNames = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
    const viewMode = window._calViewMode;

    return `
    <div class="animate-in">
        <div class="page-header" style="display:flex; justify-content:space-between; align-items:center;">
            <div>
                <h1 class="page-title">ปฏิทินการศึกษา</h1>
                <p class="page-subtitle">ปฏิทินกิจกรรมและกำหนดการสำคัญปีการศึกษา ${year + 543}</p>
            </div>
            <div class="view-toggles" style="display:flex; background:var(--bg-tertiary); padding:4px; border-radius:var(--radius-md);">
                <button class="btn ${viewMode === 'grid' ? 'active' : ''}" style="padding:6px 16px; font-size:0.85rem; border-radius:6px; ${viewMode === 'grid' ? 'background:white; box-shadow:var(--shadow-sm); color:var(--accent-primary);' : 'color:var(--text-muted);'}" onclick="toggleCalView('grid')">
                    ปฏิทินรายเดือน
                </button>
                <button class="btn ${viewMode === 'table' ? 'active' : ''}" style="padding:6px 16px; font-size:0.85rem; border-radius:6px; ${viewMode === 'table' ? 'background:white; box-shadow:var(--shadow-sm); color:var(--accent-primary);' : 'color:var(--text-muted);'}" onclick="toggleCalView('table')">
                    ตารางสรุปตามรุ่น
                </button>
            </div>
        </div>

        ${viewMode === 'table' ? renderCalendarTable(year) : `
            <div class="calendar-layout-container">
                <div class="card animate-in animate-delay-1" id="calendarCard">
                    ${buildCalendarHTML(year, month)}
                </div>
                <div class="card animate-in animate-delay-2" id="calendarEventList">
                    <div class="card-header"><h3 class="card-title">กำหนดการสำคัญ — ${monthNames[month]} ${year + 543}</h3></div>
                    <div class="card-body">
                        ${buildEventListHTML(year, month)}
                    </div>
                </div>
            </div>
        `}
    </div>`;
};

// Navigation helpers
window.calNavigate = function(dir) {
    window._calMonth += dir;
    if (window._calMonth > 11) { window._calMonth = 0; window._calYear++; }
    if (window._calMonth < 0) { window._calMonth = 11; window._calYear--; }
    calRefresh();
};

window.calSelectChanged = function() {
    window._calMonth = parseInt(document.getElementById('calMonthSelect').value);
    window._calYear = parseInt(document.getElementById('calYearSelect').value);
    calRefresh();
};

window.calGoToday = function() {
    const now = new Date();
    window._calMonth = now.getMonth();
    window._calYear = now.getFullYear();
    calRefresh();
};

window.calRefresh = function() {
    const monthNames = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
    const card = document.getElementById('calendarCard');
    const eventList = document.getElementById('calendarEventList');
    if (card) {
        card.innerHTML = buildCalendarHTML(window._calYear, window._calMonth);
    }
    if (eventList) {
        eventList.innerHTML = `
            <div class="card-header"><h3 class="card-title">กำหนดการสำคัญ — ${monthNames[window._calMonth]} ${window._calYear + 543}</h3></div>
            <div class="card-body">
                ${buildEventListHTML(window._calYear, window._calMonth)}
            </div>`;
    }
};

