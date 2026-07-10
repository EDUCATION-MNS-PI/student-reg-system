// ============================
// Courses Page
// ============================
pages.courses = function() {
    // Helper: count schedule entries for a given course code
    const scheduleList = MOCK.scheduleList || [];
    function getScheduleCount(courseCode) {
        if (!courseCode) return 0;
        return scheduleList.filter(s => String(s.courseCode || '').trim() === String(courseCode).trim()).length;
    }
    return `
    <div class="animate-in">
        <div class="page-header" style="display:flex;justify-content:space-between;align-items:flex-start">
            <div>
                <h1 class="page-title">รายวิชา</h1>
                <div style="display:flex; gap:8px; margin-top:8px;">
                    <select class="form-select" id="filterYear" style="width:auto;padding:6px 12px;font-size:0.85rem">
                        <option value="">เลือกปีการศึกษา...</option>
                        <option value="2566">2566</option>
                        <option value="2567">2567</option>
                        <option value="2568">2568</option>
                        <option value="2569">2569</option>
                    </select>
                    <select class="form-select" id="filterSemester" style="width:auto;padding:6px 12px;font-size:0.85rem">
                        <option value="">เลือกภาคเรียน...</option>
                        <option value="1">ภาคเรียนที่ 1</option>
                        <option value="2">ภาคเรียนที่ 2</option>
                        <option value="3">ภาคฤดูร้อน</option>
                    </select>
                </div>
            </div>
            <div style="display:flex;gap:8px; align-items:center;">
                ${(window.currentUserRole === 'staff' || window.currentUserRole === 'admin') ? `
                    <button class="btn btn-secondary" onclick="exportCoursesTemplate()" style="gap:6px; font-size:0.82rem; padding:8px 12px;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        Template
                    </button>
                    <button class="btn btn-primary" onclick="importCourses()" style="gap:6px; font-size:0.82rem; padding:8px 12px;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                        นำเข้าข้อมูล
                    </button>
                    <div style="width:1px; height:24px; background:var(--border-color); margin:0 4px;"></div>
                ` : ''}
                <select class="form-select" style="width:auto;padding:8px 12px;font-size:0.82rem" id="courseFilter">
                    <option value="">ทุกประเภท</option>
                    <option value="บังคับ">วิชาบังคับ</option>
                    <option value="เลือก">วิชาเลือก</option>
                    <option value="ศึกษาทั่วไป">ศึกษาทั่วไป</option>
                </select>
            </div>
        </div>
        <div class="card animate-in animate-delay-1">
            <div class="card-body" style="padding:0">
                <div class="table-wrapper">
                    <table class="data-table" id="courseTable">
                        <thead><tr><th>รหัส</th><th>ชื่อวิชา</th><th>หน่วยกิต</th><th>ประเภท</th><th>อาจารย์</th><th>เวลา</th><th>ห้อง</th><th>ที่นั่ง</th><th>ตารางเรียน</th><th>สถานะ</th></tr></thead>
                        <tbody>
                            ${MOCK.courses.map(c => {
                                const schedCount = getScheduleCount(c.code);
                                const schedBadge = schedCount > 0 
                                    ? `<a href="javascript:void(0)" onclick="window._courseNavToSchedule('${c.code}')" style="display:inline-flex; align-items:center; gap:4px; text-decoration:none; cursor:pointer; padding:3px 8px; background:var(--accent-primary-glow); color:var(--accent-primary); border-radius:6px; font-size:0.78rem; font-weight:600; transition:all 0.2s;" onmouseover="this.style.background='var(--accent-primary)';this.style.color='white'" onmouseout="this.style.background='var(--accent-primary-glow)';this.style.color='var(--accent-primary)'"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/></svg>${schedCount} คาบ</a>`
                                    : `<span style="font-size:0.78rem; color:var(--text-muted);">-</span>`;
                                return `
                                <tr data-type="${c.type}" data-year="${c.year}" data-semester="${c.semester}" data-code="${c.code}">
                                    <td style="color:var(--accent-primary-hover);font-weight:600">${window.formatDisplayCode(c.code)}</td>
                                    <td>${c.name}</td>
                                    <td style="text-align:center">${c.credits}</td>
                                    <td><span class="badge ${c.type==='บังคับ'?'purple':c.type==='เลือก'?'info':'neutral'}">${c.type}</span></td>
                                    <td>${c.instructor}</td>
                                    <td>${c.schedule}</td>
                                    <td>${c.room}</td>
                                    <td>${c.enrolled}/${c.seats}</td>
                                    <td style="text-align:center;">${schedBadge}</td>
                                    <td>${getStatusBadge(c.status)}</td>
                                </tr>`;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>`;
};

window.init_courses = function() {
    const filterType = document.getElementById('courseFilter');
    const filterYear = document.getElementById('filterYear');
    const filterSemester = document.getElementById('filterSemester');
    
    function applyFilters() {
        const typeVal = filterType ? filterType.value : '';
        const yearVal = filterYear ? filterYear.value : '';
        const semVal = filterSemester ? filterSemester.value : '';
        
        let hasCourses = false;
        document.querySelectorAll('#courseTable tbody tr').forEach(row => {
            const matchesType = !typeVal || row.dataset.type === typeVal;
            const matchesYear = !yearVal || String(row.dataset.year) === String(yearVal);
            
            // Map ภาคฤดูร้อน to 3 if needed, or exact match
            let rowSem = String(row.dataset.semester);
            if (rowSem === 'ฤดูร้อน') rowSem = '3';
            
            const matchesSem = !semVal || rowSem === String(semVal);
            
            // User requested "instead of showing everything", so if no year/sem chosen, maybe show none?
            // Let's hide if neither year nor semester is selected, OR just let it filter normally.
            // Normally, empty dropdowns mean "Show All".
            if (!yearVal && !semVal) {
                row.style.display = 'none'; // Hide all implicitly until user selects something.
            } else {
                if (matchesType && matchesYear && matchesSem) {
                    row.style.display = '';
                    hasCourses = true;
                } else {
                    row.style.display = 'none';
                }
            }
        });
        
        // Show empty state if nothing matches
        let tbody = document.querySelector('#courseTable tbody');
        let emptyRow = document.getElementById('emptyCourseRow');
        if (!hasCourses) {
            if (!emptyRow) {
                emptyRow = document.createElement('tr');
                emptyRow.id = 'emptyCourseRow';
                emptyRow.innerHTML = `<td colspan="10" style="text-align:center; padding:30px; color:var(--text-muted);">ไม่พบรายวิชาที่ค้นหา กรุณาเลือกปีการศึกษาและภาคเรียน</td>`;
                tbody.appendChild(emptyRow);
            } else {
                emptyRow.style.display = '';
            }
        } else if (emptyRow) {
            emptyRow.style.display = 'none';
        }
    }

    if (filterType) filterType.addEventListener('change', applyFilters);
    if (filterYear) filterYear.addEventListener('change', applyFilters);
    if (filterSemester) filterSemester.addEventListener('change', applyFilters);
    
    // Handle auto-filter from schedule page navigation
    if (window._courseFilterYear && filterYear) {
        filterYear.value = window._courseFilterYear;
    }
    if (window._courseFilterSem && filterSemester) {
        filterSemester.value = window._courseFilterSem;
    }
    // Highlight specific course if navigating from schedule
    if (window._courseFilterCode) {
        const targetCode = window._courseFilterCode;
        // Clear the navigation state
        window._courseFilterCode = null;
        window._courseFilterYear = null;
        window._courseFilterSem = null;
        
        applyFilters();
        
        // Highlight the matching row after render
        setTimeout(() => {
            const rows = document.querySelectorAll('#courseTable tbody tr');
            rows.forEach(row => {
                if (row.dataset.code === targetCode) {
                    row.style.background = 'var(--accent-primary-glow)';
                    row.style.transition = 'background 0.5s ease';
                    row.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    setTimeout(() => { row.style.background = ''; }, 3000);
                }
            });
        }, 100);
        return;
    }
    
    // Auto preset active year if available
    if (filterYear && MOCK.activeYear) {
        // filterYear.value = MOCK.activeYear; // Uncomment if we want to auto-fill
    }
    
    applyFilters();
};

// Navigate to schedule page filtered by course code
window._courseNavToSchedule = function(courseCode) {
    if (!courseCode) return;
    window._schedCourse = courseCode;
    window._schedView = 'list'; // list view shows more detail for single course
    navigateTo('schedule');
};

// ============================
// Enrollment Page
// ============================
pages.enrollment = function() {
    const totalCredits = MOCK.enrolledCourses.reduce((s,c) => s+c.credits, 0);
    const availableCourses = MOCK.courses.filter(c => c.status === 'เปิด' && !MOCK.enrolledCourses.find(e => e.code === c.code));
    return `
    <div class="animate-in">
        <div class="page-header">
            <h1 class="page-title">ลงทะเบียนเรียน</h1>
            <p class="page-subtitle">เลือกรายวิชาเพื่อลงทะเบียนเรียน ภาคฤดูร้อน/2568</p>
        </div>
        <div class="grid-2">
            <div>
                <div class="card animate-in animate-delay-1" style="margin-bottom:18px">
                    <div class="card-header"><h3 class="card-title">รายวิชาที่เปิดให้ลงทะเบียน</h3></div>
                    <div class="card-body">
                        <div class="enrollment-list">
                            ${availableCourses.map(c => `
                                <div class="enrollment-card">
                                    <div class="course-info">
                                        <span class="course-code">${window.formatDisplayCode(c.code)}</span>
                                        <span class="course-name">${c.name}</span>
                                        <span class="course-meta">${c.credits} หน่วยกิต · ${c.instructor} · ${c.schedule}</span>
                                    </div>
                                    <button class="btn btn-primary btn-sm" onclick="addCourseModal('${c.code}','${c.name}',${c.credits})">+ เพิ่ม</button>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <div class="card animate-in animate-delay-2">
                    <div class="card-header">
                        <h3 class="card-title">ตะกร้ารายวิชา</h3>
                        <span class="badge info">${totalCredits} หน่วยกิต</span>
                    </div>
                    <div class="card-body">
                        <div class="enrollment-list">
                            ${MOCK.enrolledCourses.map(c => `
                                <div class="enrollment-card">
                                    <div class="course-info">
                                        <span class="course-code">${c.code}</span>
                                        <span class="course-name">${c.name}</span>
                                        <span class="course-meta">${c.credits} หน่วยกิต · ${c.schedule}</span>
                                    </div>
                                    <button class="btn btn-ghost btn-sm" style="color:var(--danger)" onclick="removeCourseModal('${c.code}')">✕</button>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div class="card-footer">
                        <span style="font-size:0.85rem;color:var(--text-muted)">รวม ${MOCK.enrolledCourses.length} วิชา · ${totalCredits} หน่วยกิต</span>
                        <button class="btn btn-primary" onclick="confirmEnrollment()">ยืนยันลงทะเบียน</button>
                    </div>
                </div>
            </div>
        </div>
    </div>`;
};

function addCourseModal(code, name, credits) {
    openModal('เพิ่มรายวิชา', `<p style="margin-bottom:16px">ต้องการเพิ่มวิชา <strong>${code} ${name}</strong> (${credits} หน่วยกิต) ใช่หรือไม่?</p><div style="display:flex;gap:8px;justify-content:flex-end"><button class="btn btn-secondary" onclick="closeModal()">ยกเลิก</button><button class="btn btn-primary" onclick="closeModal()">ยืนยัน</button></div>`);
}

function removeCourseModal(code) {
    openModal('ถอนรายวิชา', `<p style="margin-bottom:16px">ต้องการถอนวิชา <strong>${code}</strong> ใช่หรือไม่?</p><div style="display:flex;gap:8px;justify-content:flex-end"><button class="btn btn-secondary" onclick="closeModal()">ยกเลิก</button><button class="btn btn-danger" onclick="closeModal()">ถอนรายวิชา</button></div>`);
}

function confirmEnrollment() {
    openModal('ยืนยันการลงทะเบียน', `<div style="text-align:center;padding:12px"><div style="font-size:3rem;margin-bottom:12px">✅</div><p style="margin-bottom:16px">ยืนยันลงทะเบียนทั้งหมด ${MOCK.enrolledCourses.length} วิชา?</p><div style="display:flex;gap:8px;justify-content:center"><button class="btn btn-secondary" onclick="closeModal()">ยกเลิก</button><button class="btn btn-primary" onclick="closeModal()">ยืนยัน</button></div></div>`);
}

window.exportCoursesTemplate = function() {
    const headers = ['รหัสวิชา','ชื่อวิชา','หน่วยกิต','ประเภท','อาจารย์ผู้สอน','เวลาเรียน','ห้องเรียน','ที่นั่งรวม','จำนวนผู้เรียน','สถานะ'];
    const sample = ['01005000109','การพยาบาลชุมชนขั้นสูง','2','บังคับ','รศ.ดร.ใจดี มานะ','ศ. 13:00-16:00','NB307','30','0','เปิด'];
    downloadCSVTemplate('template_รายวิชา.csv', headers, sample);
};

window.importCourses = function() {
    handleGenericCSVImport((data) => {
        if (data && data.length > 0) {
            data.forEach(row => {
                const newCourse = {
                    code: row['รหัสวิชา'] || '',
                    name: row['ชื่อวิชา'] || '',
                    credits: parseInt(row['หน่วยกิต']) || 0,
                    type: row['ประเภท'] || 'บังคับ',
                    instructor: row['อาจารย์ผู้สอน'] || '',
                    schedule: row['เวลาเรียน'] || '',
                    room: row['ห้องเรียน'] || '',
                    seats: parseInt(row['ที่นั่งรวม']) || 30,
                    enrolled: parseInt(row['จำนวนผู้เรียน']) || 0,
                    status: row['สถานะ'] || 'เปิด'
                };
                if (newCourse.code && newCourse.name) {
                    MOCK.courses.push(newCourse);
                }
            });
            alert(`นำเข้ารายวิชาสำเร็จ ${data.length} รายการ`);
            renderPage();
        }
    });
};
