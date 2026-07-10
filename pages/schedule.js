// ============================
// Schedule Page — ตารางการเรียนการสอน (Date-based format & Grid view)
// ============================
pages.schedule = function() {
    const list = MOCK.scheduleList || [];
    const coursesData = MOCK.courses || [];

    // Helper: look up course details from MOCK.courses by courseCode
    function findCourseInfo(courseCode) {
        if (!courseCode) return null;
        return coursesData.find(c => String(c.code || '').trim() === String(courseCode).trim()) || null;
    }

    const monthMap = {
        'ม.ค.': 'มกราคม', 'ก.พ.': 'กุมภาพันธ์', 'มี.ค.': 'มีนาคม', 'เม.ย.': 'เมษายน',
        'พ.ค.': 'พฤษภาคม', 'มิ.ย.': 'มิถุนายน', 'ก.ค.': 'กรกฎาคม', 'ส.ค.': 'สิงหาคม',
        'ก.ย.': 'กันยายน', 'ต.ค.': 'ตุลาคม', 'พ.ย.': 'พฤศจิกายน', 'ธ.ค.': 'ธันวาคม'
    };
    function getFullDate(shortDate) {
        if (!shortDate) return '-';
        let d = shortDate;
        for (let short in monthMap) {
            let shortNoDot = short.replace(/\.$/, '');
            if (d.includes(short)) {
                return d.replace(short, monthMap[short]);
            } else if (d.includes(shortNoDot)) {
                let regex = new RegExp(shortNoDot.replace(/\./g, '\\.') + '\\.?', 'g');
                return d.replace(regex, monthMap[short]);
            }
        }
        return d;
    }

    // ---- Filter Controls ----
    const allSemesters = [...new Set(list.map(s => s.semester).filter(Boolean))];
    const allYears     = [...new Set(list.map(s => s.academicYear).filter(Boolean))];
    const activeSem  = window._schedSem  || allSemesters[0] || '';
    const activeYear = window._schedYear || allYears[0]     || '';
    const activeCourse = window._schedCourse || '';
    const viewMode   = window._schedView || 'grid'; // 'grid' or 'list'

    let preFiltered = list.filter(s => {
        const semOk  = !activeSem  || s.semester     === activeSem;
        const yearOk = !activeYear || s.academicYear === activeYear;
        return semOk && yearOk;
    });

    const allCourses = [];
    const courseSet = new Set();
    preFiltered.forEach(s => {
        if (s.courseCode && !courseSet.has(s.courseCode)) {
            courseSet.add(s.courseCode);
            allCourses.push({ code: s.courseCode, name: s.courseName || '' });
        }
    });

    const filtered = activeCourse ? preFiltered.filter(s => s.courseCode === activeCourse) : preFiltered;

    const courseColors = ['#fbcfe8', '#ddd6fe', '#bae6fd', '#fed7aa', '#fecaca', '#bbf7d0', '#e9d5ff', '#fde047'];
    const courseColorMap = {};
    let colorIdx = 0;
    allCourses.forEach(c => {
        courseColorMap[c.code] = courseColors[colorIdx % courseColors.length];
        colorIdx++;
    });

    const monthShorts = [
        'ม.ค', 'ก.พ', 'มี.ค', 'เม.ย', 'พ.ค', 'มิ.ย',
        'ก.ค', 'ส.ค', 'ก.ย', 'ต.ค', 'พ.ย', 'ธ.ค'
    ];
    function parseThaiDate(dateString) {
        if (!dateString) return 0;
        let parts = dateString.trim().split(/\s+/);
        if (parts.length < 3) return 0;
        let day = parseInt(parts[0], 10) || 0;
        let monthStr = parts[1];
        let year = parseInt(parts[2], 10) || 0;
        let monthIdx = 0;
        for (let i = 0; i < monthShorts.length; i++) {
            let fullMonth = monthMap[monthShorts[i] + '.'];
            if (monthStr.includes(monthShorts[i]) || (fullMonth && monthStr.includes(fullMonth))) {
                monthIdx = i;
                break;
            }
        }
        return (year * 10000) + (monthIdx * 100) + day;
    }

    const daysThai = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
    function getDayOfWeekThai(dateString) {
        if (!dateString) return '';
        let parts = dateString.trim().split(/\s+/);
        if (parts.length < 3) return '';
        let day = parseInt(parts[0], 10);
        let monthStr = parts[1];
        let year = parseInt(parts[2], 10);
        let adYear = year > 2500 ? year - 543 : year;
        let monthIdx = 0;
        for (let i = 0; i < monthShorts.length; i++) {
            let fullMonth = monthMap[monthShorts[i] + '.'];
            if (monthStr.includes(monthShorts[i]) || (fullMonth && monthStr.includes(fullMonth))) {
                monthIdx = i;
                break;
            }
        }
        let d = new Date(adYear, monthIdx, day);
        if (isNaN(d.getTime())) return '';
        return daysThai[d.getDay()];
    }

    filtered.sort((a, b) => parseThaiDate(a.date) - parseThaiDate(b.date));

    // Set filter handlers
    window.changeSchedFilter = function(key, val) {
        window['_sched' + key] = val;
        navigateTo('schedule');
    };

    // Navigate to courses page filtered by course code
    window._schedNavToCourse = function(courseCode) {
        if (!courseCode) return;
        // Find matching course to auto-set year/semester filters
        const matchedCourse = (MOCK.courses || []).find(c => String(c.code || '').trim() === String(courseCode).trim());
        if (matchedCourse) {
            window._courseFilterCode = courseCode;
            window._courseFilterYear = matchedCourse.year || '';
            window._courseFilterSem = matchedCourse.semester || '';
        }
        navigateTo('courses');
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

    // ---- Filter bar & View Toggle ----
    const filterBar = `
    <div style="display:flex; justify-content:space-between; flex-wrap:wrap; margin-bottom:20px; align-items:center; gap:16px;">
        <div style="display:flex; gap:12px; flex-wrap:wrap; align-items:center;">
            ${allYears.length > 1 ? `
            <div style="display:flex; align-items:center; gap:8px;">
                <label style="font-size:0.85rem; font-weight:600; color:var(--text-secondary);">ปีการศึกษา</label>
                <select class="form-input" style="height:36px; padding:0 10px; min-width:110px;" onchange="changeSchedFilter('Year', this.value)">
                    <option value="">-- ทั้งหมด --</option>
                    ${allYears.map(y => `<option value="${y}" ${y===activeYear?'selected':''}>${y}</option>`).join('')}
                </select>
            </div>` : ''}
            ${allSemesters.length > 1 ? `
            <div style="display:flex; align-items:center; gap:8px;">
                <label style="font-size:0.85rem; font-weight:600; color:var(--text-secondary);">ภาคเรียน</label>
                <select class="form-input" style="height:36px; padding:0 10px; min-width:110px;" onchange="changeSchedFilter('Sem', this.value)">
                    <option value="">-- ทั้งหมด --</option>
                    ${allSemesters.map(s => `<option value="${s}" ${s===activeSem?'selected':''}>${s}</option>`).join('')}
                </select>
            </div>` : ''}
            ${allCourses.length > 0 ? `
            <div style="display:flex; align-items:center; gap:8px;">
                <label style="font-size:0.85rem; font-weight:600; color:var(--text-secondary);">วิชา</label>
                <select class="form-input" style="height:36px; padding:0 10px; max-width:300px; text-overflow:ellipsis;" onchange="changeSchedFilter('Course', this.value)">
                    <option value="">-- ทุกวิชา --</option>
                    ${allCourses.map(c => `<option value="${c.code}" ${c.code===activeCourse?'selected':''}>${c.code} ${c.name}</option>`).join('')}
                </select>
            </div>` : ''}
            <span style="font-size:0.82rem; color:var(--text-muted); margin-left:8px;">${filtered.length} รายการ</span>
        </div>
        
        <!-- View Toggle -->
        <div style="display:flex; background:var(--bg-secondary); border-radius:8px; padding:4px;">
            <button onclick="changeSchedFilter('View', 'grid')" style="border:none; padding:6px 14px; border-radius:6px; cursor:pointer; font-size:0.85rem; font-weight:600; transition:all 0.2s; ${viewMode === 'grid' ? 'background:white; color:var(--accent-primary); box-shadow:0 1px 3px rgba(0,0,0,0.1);' : 'background:transparent; color:var(--text-secondary);'}">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px; vertical-align:-2px;"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg> แบบตาราง
            </button>
            <button onclick="changeSchedFilter('View', 'list')" style="border:none; padding:6px 14px; border-radius:6px; cursor:pointer; font-size:0.85rem; font-weight:600; transition:all 0.2s; ${viewMode === 'list' ? 'background:white; color:var(--accent-primary); box-shadow:0 1px 3px rgba(0,0,0,0.1);' : 'background:transparent; color:var(--text-secondary);'}">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px; vertical-align:-2px;"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg> แบบรายการ
            </button>
        </div>
    </div>`;

    // ==========================================
    // 1. LIST VIEW RENDERING
    // ==========================================
    const listHtml = `
    <div class="card animate-in animate-delay-1">
        <div class="card-body" style="padding:0; overflow-x:auto;">
            <table class="data-table sched-table" style="width:100%; border-collapse:collapse;">
                <thead>
                    <tr>
                        <th style="min-width:110px;">วันที่</th>
                        <th style="min-width:110px;">เวลา</th>
                        ${!activeCourse ? `<th style="min-width:200px;">วิชา</th>` : ''}
                        <th style="min-width:280px;">หัวข้อ / เนื้อหา</th>
                        <th style="min-width:180px;">อาจารย์ผู้สอน</th>
                    </tr>
                </thead>
                <tbody>
                    ${filtered.length === 0 ? `<tr><td colspan="5" style="text-align:center; padding:40px; color:var(--text-muted);">ไม่พบข้อมูลในเงื่อนไขที่เลือก</td></tr>` : 
                    filtered.map((s, i) => {
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

                        const cInfo = findCourseInfo(s.courseCode);
                        const creditsHtml = cInfo && cInfo.credits ? `<span style="display:inline-block; padding:1px 6px; background:var(--accent-primary-glow); color:var(--accent-primary); border-radius:4px; font-size:0.75rem; font-weight:600; margin-left:6px;">${cInfo.credits} หน่วยกิต</span>` : '';
                        const typeHtml = cInfo && cInfo.type ? `<span class="badge ${cInfo.type==='บังคับ'?'purple':cInfo.type==='เลือก'?'info':'neutral'}" style="font-size:0.72rem; padding:1px 6px; margin-left:4px;">${cInfo.type}</span>` : '';
                        const roomHtml = cInfo && cInfo.room && cInfo.room !== '-' && !s.room ? `<div style="font-size:0.78rem; color:var(--text-muted); margin-top:3px;">🏫 ${cInfo.room}</div>` : (s.room ? `<div style="font-size:0.78rem; color:var(--text-muted); margin-top:3px;">🏫 ${s.room}</div>` : '');
                        const courseHtml = `
                            ${s.courseCode ? `<div style="display:flex; align-items:center; flex-wrap:wrap; gap:2px;"><a href="javascript:void(0)" onclick="window._schedNavToCourse('${s.courseCode}')" style="font-weight:700; font-size:0.85rem; color:var(--accent-primary); text-decoration:none; cursor:pointer;" onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'">${s.courseCode}</a>${creditsHtml}${typeHtml}</div>` : ''}
                            ${s.courseName ? `<div style="font-size:0.85rem; color:var(--text-secondary); margin-top:2px;">${s.courseName}</div>` : (s.courseCode ? '' : '-')}
                            ${roomHtml}
                        `;

                        const rowBg = i % 2 === 0 ? '' : 'background:var(--bg-secondary);';
                        return `
                        <tr style="${rowBg} transition:background 0.2s;" onmouseover="this.style.background='var(--accent-primary-glow)'" onmouseout="this.style.background='${i%2===0?'':'var(--bg-secondary)'}'">
                            <td style="vertical-align:top; padding:16px 16px; white-space:nowrap; font-size:0.88rem; font-weight:700; color:var(--text-primary);">${getFullDate(s.date)}</td>
                            <td style="vertical-align:top; padding:16px 16px; white-space:nowrap; font-size:0.85rem; color:var(--text-secondary);"><span style="display:inline-block; padding:4px 8px; background:var(--bg-primary); border:1px solid var(--border-color); border-radius:6px; font-weight:600;">${s.time || '-'}</span></td>
                            ${!activeCourse ? `<td style="vertical-align:top; padding:16px 16px;">${courseHtml}</td>` : ''}
                            <td style="vertical-align:top; padding:16px 16px;">${topicHtml}</td>
                            <td style="vertical-align:top; padding:16px 16px;">${instrHtml}</td>
                        </tr>`;
                    }).join('')}
                </tbody>
            </table>
        </div>
    </div>`;

    // ==========================================
    // 2. GRID VIEW RENDERING
    // ==========================================
    const timeSlots = [
        { label: '08.00-09.00', start: 8 },
        { label: '09.00-10.00', start: 9 },
        { label: '10.00-11.00', start: 10 },
        { label: '11.00-12.00', start: 11 },
        { label: '12.00-13.00', start: 12 }, // Lunch
        { label: '13.00-14.00', start: 13 },
        { label: '14.00-15.00', start: 14 },
        { label: '15.00-16.00', start: 15 },
        { label: '16.00-17.00', start: 16 }
    ];

    const groupedByDate = {};
    const dateKeys = [];
    const dateDisplayMap = {};
    filtered.forEach(item => {
        const origD = item.date || 'ไม่ระบุวันที่';
        const parsed = parseThaiDate(origD);
        const dKey = parsed > 0 ? parsed.toString() : origD.trim().replace(/\s+/g, ' ');
        if (!groupedByDate[dKey]) {
            groupedByDate[dKey] = [];
            dateKeys.push(dKey);
            dateDisplayMap[dKey] = origD;
        }
        groupedByDate[dKey].push(item);
    });

    let gridHtml = `
    <div class="card animate-in animate-delay-1" style="background:white; border-radius:12px; box-shadow:0 2px 10px rgba(0,0,0,0.03);">
        <div class="card-body" style="padding:0; overflow-x:auto;">
            <table style="width:100%; min-width:1100px; table-layout:fixed; border-collapse:collapse; font-size:0.85rem;">
                <thead>
                    <tr>
                        <th style="padding:16px 10px; border:1px solid var(--border-color); background:var(--bg-secondary); border-top:none; border-left:none; text-align:center; width:160px; font-weight:700; color:var(--text-secondary); position:relative;">
                            <div style="position:absolute; top:0; left:0; width:100%; height:100%; background:linear-gradient(to top right, transparent 49%, var(--border-color) 49%, var(--border-color) 51%, transparent 51%);"></div>
                            <span style="position:absolute; bottom:6px; right:12px;">วัน</span>
                            <span style="position:absolute; top:6px; left:12px;">เวลา</span>
                        </th>
                        ${timeSlots.map(t => `<th style="padding:12px 4px; border:1px solid var(--border-color); background:var(--bg-secondary); border-top:none; ${t.start===16?'border-right:none;':''} text-align:center; font-weight:600; color:var(--text-secondary);">${t.label}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
    `;

    if (dateKeys.length === 0) {
        gridHtml += `<tr><td colspan="${timeSlots.length + 1}" style="text-align:center; padding:50px; color:var(--text-muted);">ไม่พบข้อมูลในเงื่อนไขที่เลือก</td></tr>`;
    } else {
        dateKeys.forEach((dKey, rowIdx) => {
            let origDateStr = dateDisplayMap[dKey];
            let displayDate = getFullDate(origDateStr);
            let dayOfWeek = getDayOfWeekThai(origDateStr);
            let combinedDate = dayOfWeek ? `${dayOfWeek} ${displayDate}` : displayDate;
            let rowHtml = `<tr>
                <td style="padding:12px 10px; border:1px solid var(--border-color); border-left:none; font-weight:700; text-align:center; vertical-align:middle; background:#f8fafc; white-space:normal; line-height:1.4; color:#334155; font-size:0.85rem;">
                    ${combinedDate}
                </td>`;
            
            let slotOccupied = new Array(timeSlots.length).fill(false);
            let slotHtml = new Array(timeSlots.length).fill('');
            let items = groupedByDate[dKey];

            items.forEach(item => {
                let tStr = String(item.time || '').replace(/น\./gi, '').trim();
                let parts = tStr.split('-');
                if (parts.length === 2) {
                    let startStr = parts[0].replace(':', '.').trim();
                    let endStr = parts[1].replace(':', '.').trim();
                    let startHr = parseInt(startStr);
                    let endHr = parseInt(endStr);
                    let endMin = parseFloat(endStr) - endHr; // e.g. 10.30 -> 0.30
                    
                    if (!isNaN(startHr) && !isNaN(endHr)) {
                        let startIndex = timeSlots.findIndex(ts => ts.start === startHr);
                        
                        // ถ้านาที > 0 หรือชั่วโมงเท่ากัน (เช่น 10.00-10.30) ให้ block สุดท้ายเป็นชั่วโมงนั้น
                        // ถ้าจบตรงชั่วโมงพอดี (เช่น 08.00-12.00) ให้ block สุดท้ายคือชั่วโมงก่อนหน้า (11)
                        let endBlockHr = (endMin > 0 || startHr === endHr) ? endHr : endHr - 1;
                        let endIndex = timeSlots.findIndex(ts => ts.start === endBlockHr);
                        
                        if (endHr === 12 && endMin === 0 && startIndex !== -1) endIndex = 3; // 11.00-12.00
                        if (endBlockHr >= 17 && startIndex !== -1) endIndex = timeSlots.length - 1;

                        if (startIndex !== -1 && endIndex !== -1 && endIndex >= startIndex) {
                            let span = (endIndex - startIndex) + 1;
                            slotOccupied[startIndex] = true;
                            for (let i = startIndex + 1; i <= endIndex; i++) slotOccupied[i] = 'skip';
                            
                            // Determine block color
                            let bgColor = (item.courseCode && courseColorMap[item.courseCode]) ? courseColorMap[item.courseCode] : '#f8fafc';
                            let textColor = '#1e293b'; // slightly darker for better contrast on pastel
                            
                            let cInfoGrid = findCourseInfo(item.courseCode);
                            let courseInfo = [];
                            if (item.courseCode) courseInfo.push(item.courseCode);
                            if (item.courseName) courseInfo.push(item.courseName);
                            let creditsGrid = cInfoGrid && cInfoGrid.credits ? `<div style="font-size:0.72rem; color:${textColor}; opacity:0.7; margin-top:2px;">${cInfoGrid.credits} หน่วยกิต${cInfoGrid.type ? ' · ' + cInfoGrid.type : ''}</div>` : '';
                            let courseDisplay = courseInfo.length > 0 ? 
                                `<a href="javascript:void(0)" onclick="window._schedNavToCourse('${item.courseCode || ''}')" style="display:block; text-decoration:none; cursor:pointer;" onmouseover="this.querySelector('.cname').style.textDecoration='underline'" onmouseout="this.querySelector('.cname').style.textDecoration='none'"><div class="cname" style="font-size:0.85rem; font-weight:700; color:${textColor}; line-height:1.4;">${courseInfo.join(' ')}</div>${creditsGrid}</a>` : '';

                            slotHtml[startIndex] = `<td colspan="${span}" style="padding:12px; border:1px solid var(--border-color); ${endIndex === timeSlots.length-1 ? 'border-right:none;' : ''} background:${bgColor}; text-align:center; vertical-align:middle; position:relative;">
                                ${courseDisplay}
                            </td>`;
                        }
                    }
                }
            });

            // Handle Lunch break (index 4 = 12.00-13.00)
            const lunchIdx = 4;
            if (slotOccupied[lunchIdx] === false) {
                slotOccupied[lunchIdx] = true;
                slotHtml[lunchIdx] = `<td style="padding:10px; border:1px solid var(--border-color); text-align:center; color:#94a3b8; font-size:0.8rem; background:#f8fafc; font-weight:500;">พักกลางวัน</td>`;
            }

            // Render row cells
            for (let i = 0; i < timeSlots.length; i++) {
                if (slotOccupied[i] === 'skip') continue;
                if (slotOccupied[i] === false) {
                    let span = 1;
                    for (let j = i + 1; j < timeSlots.length; j++) {
                        if (slotOccupied[j] === false) span++;
                        else break;
                    }
                    let bRight = ((i + span - 1) === timeSlots.length - 1) ? 'border-right:none;' : '';
                    rowHtml += `<td colspan="${span}" style="padding:10px; border:1px solid var(--border-color); ${bRight} text-align:center; color:#64748b; font-size:0.8rem; background:#ffffff;">Self-study</td>`;
                    
                    for (let j = i + 1; j < i + span; j++) {
                        slotOccupied[j] = 'skip';
                    }
                } else {
                    rowHtml += slotHtml[i];
                }
            }
            
            rowHtml += `</tr>`;
            gridHtml += rowHtml;
        });
    }

    gridHtml += `
                </tbody>
            </table>
        </div>
    </div>`;

    // ==========================================
    // FINAL RENDER
    // ==========================================
    return `
    <style>
        .sched-table th { background: #f8fafc; font-size: 0.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #475569; padding: 14px 16px; border-bottom: 1px solid #e2e8f0; border-top: 1px solid #e2e8f0; white-space: nowrap; }
        .sched-table td { border-bottom: 1px solid #f1f5f9; }
        .sched-table tr:last-child td { border-bottom: none; }
    </style>
    <div class="animate-in">
        <div class="page-header" style="margin-bottom:20px;">
            <h1 class="page-title">ตารางการเรียนการสอน</h1>
            <p class="page-subtitle">ตารางการสอนประจำภาคการศึกษา${activeYear ? ' ปีการศึกษา ' + activeYear : ''}${activeSem ? ' ภาค' + activeSem : ''}</p>
        </div>

        ${filterBar}
        ${viewMode === 'grid' ? gridHtml : listHtml}
    </div>`;
};
