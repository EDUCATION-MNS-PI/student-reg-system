// ============================
// Dashboard Page (Merged with Analytics & Enhanced)
// ============================
pages.dashboard = function() {
    // 1. Data Preparation
    const allStudents = MOCK.students || [];
    const activeStudents = allStudents.filter(s => s.status !== 'สำเร็จการศึกษา' && s.status !== 'Graduated' && s.status !== 'พ้นสภาพ');
    const alumniStudents = allStudents.filter(s => s.status === 'สำเร็จการศึกษา' || s.status === 'Graduated');
    const advisors = MOCK.academicAdvisors || [];
    const enrolledCourses = MOCK.enrolledCourses || [];
    const uniqueCourseNames = new Set(enrolledCourses.map(c => c.name));
    
    const s = MOCK.dashboardStats || { totalStudents: 0, totalAlumni: 0, totalTeachers: 0, totalCourses: 0, avgGPA: 0 };
    
    const totalStudents = activeStudents.length || s.totalStudents;
    const totalAlumni = alumniStudents.length || s.totalAlumni;
    const totalAdvisors = advisors.length || s.totalTeachers;
    const totalCourses = uniqueCourseNames.size || s.totalCourses || (MOCK.courses ? MOCK.courses.length : 0);
    const avgGpa = Number(s.avgGPA || 0).toFixed(2);

    // Analytics Data Processing
    let cohorts = {};
    let majors = {};
    let genderStats = { male: 0, female: 0, maleCount: 0, femaleCount: 0 };
    let atRiskStudents = [];

    if (activeStudents.length > 0) {
        // Cohorts
        activeStudents.forEach(st => {
            let id = st.studentId || st.id || "";
            let cohort = String(id).trim().substring(0, 2);
            if(cohort && !isNaN(cohort) && cohort.length === 2) {
                cohorts[cohort] = (cohorts[cohort] || 0) + 1;
            }
        });

        // Majors
        activeStudents.forEach(st => {
            let major = st.department || st.major || st.program || 'อื่นๆ';
            if (major.includes('ผู้ใหญ่')) major = 'การพยาบาลผู้ใหญ่';
            else if (major.includes('เด็ก')) major = 'การพยาบาลเด็ก';
            else if (major.includes('บริหาร')) major = 'การบริหารการพยาบาล';
            else if (major.includes('ชุมชน')) major = 'การพยาบาลชุมชน';
            else if (major.includes('จิตเวช')) major = 'การพยาบาลจิตเวช';
            else major = 'อื่นๆ';
            majors[major] = (majors[major] || 0) + 1;
        });

        // Gender
        let maleCount = activeStudents.filter(st => (st.gender || '').includes('ชาย')).length;
        let femaleCount = activeStudents.filter(st => (st.gender || '').includes('หญิง')).length;
        let totalG = maleCount + femaleCount;
        if (totalG > 0) {
            genderStats = {
                male: Math.round((maleCount / totalG) * 100),
                female: Math.round((femaleCount / totalG) * 100),
                maleCount,
                femaleCount
            };
        }

        // At Risk (GPA < 2.5)
        atRiskStudents = allStudents.filter(st => {
            const g = parseFloat(st.gpa || 0);
            return g > 0 && g < 2.5;
        }).slice(0, 5);
    }

    // Default Tab
    if (!window._dashboardActiveTab) window._dashboardActiveTab = 'overview';

    // 2. Render UI
    return `
    <div class="animate-in">
        <div class="page-header" style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 24px;">
            <div>
                <h1 class="page-title">แดชบอร์ด</h1>
                <p class="page-subtitle">ภาพรวมข้อมูลระบบและการวิเคราะห์สถิติอัจฉริยะ</p>
            </div>
            <div class="header-semester" style="margin-bottom: 5px;">
                อัปเดตล่าสุด: <span style="font-weight: 700; color: var(--accent-primary);">${window.formatDateThai(new Date())}</span>
            </div>
        </div>

        <!-- Unified Summary Cards -->
        <div class="stats-grid">
            <div class="stat-card animate-in animate-delay-1">
                <div class="stat-icon purple">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
                <div class="stat-info">
                    <div class="stat-value">${totalStudents}</div>
                    <div class="stat-label">นักศึกษาปัจจุบัน</div>
                </div>
                <span class="stat-change up" style="position: absolute; right: 15px; top: 15px;">↑ 5.2%</span>
            </div>
            <div class="stat-card animate-in animate-delay-2">
                <div class="stat-icon blue">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                </div>
                <div class="stat-info">
                    <div class="stat-value">${totalCourses}</div>
                    <div class="stat-label">วิชาที่เปิดสอน</div>
                </div>
            </div>
            <div class="stat-card animate-in animate-delay-3">
                <div class="stat-icon orange">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
                <div class="stat-info">
                    <div class="stat-value">${totalAdvisors}</div>
                    <div class="stat-label">อาจารย์/บุคลากร</div>
                </div>
            </div>
            <div class="stat-card animate-in animate-delay-4">
                <div class="stat-icon pink">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                </div>
                <div class="stat-info">
                    <div class="stat-value">${totalAlumni}</div>
                    <div class="stat-label">ศิษย์เก่า (Alumni)</div>
                </div>
            </div>
            <div class="stat-card animate-in animate-delay-5">
                <div class="stat-icon green">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                </div>
                <div class="stat-info">
                    <div class="stat-value">${avgGpa}</div>
                    <div class="stat-label">GPAX เฉลี่ย</div>
                </div>
            </div>
        </div>

        <!-- Tabs Navigation -->
        <div class="tabs" style="margin-bottom: 24px;">
            <button class="tab-btn ${window._dashboardActiveTab === 'overview' ? 'active' : ''}" onclick="switchDashboardTab('overview')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 6px;"><path d="M21.21 15.89A10 10 0 1 1 8 2.83M22 12A10 10 0 0 0 12 2v10z"/></svg>
                ภาพรวม (Overview)
            </button>
            <button class="tab-btn ${window._dashboardActiveTab === 'data' ? 'active' : ''}" onclick="switchDashboardTab('data')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 6px;"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
                จัดการข้อมูล (Data Management)
            </button>
        </div>

        <!-- Tab Content -->
        <div id="dashboardTabContent">
            ${window._dashboardActiveTab === 'overview' ? renderDashboardOverview(cohorts, majors, genderStats, atRiskStudents) : renderDashboardData(activeStudents, advisors)}
        </div>

        <!-- Footer Activity (Always show) -->
        <div class="card animate-in animate-delay-4" style="margin-top: 24px;">
            <div class="card-header">
                <h3 class="card-title">กิจกรรมล่าสุดในระบบ</h3>
            </div>
            <div class="card-body" style="padding: 10px 22px;">
                <div class="activity-list">
                    ${(MOCK.recentActivities || []).slice(0, 5).map(a => `
                        <div class="activity-item">
                            <div class="activity-dot ${a.color || 'purple'}"></div>
                            <div>
                                <div class="activity-text">${a.text || '-'}</div>
                                <div class="activity-time">${a.time || '-'}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    </div>`;
};

// ============================
// Sub-renderers for Tabs
// ============================

function renderDashboardOverview(cohorts, majors, genderStats, atRiskStudents) {
    // Process Cohorts HTML
    let sortedCohorts = Object.keys(cohorts).sort();
    let maxCohort = Math.max(...Object.values(cohorts), 1);
    const barColors = [
        'linear-gradient(180deg, #6366f1, #4338ca)', // Indigo
        'linear-gradient(180deg, #ec4899, #be185d)', // Pink
        'linear-gradient(180deg, #f59e0b, #d97706)', // Orange
        'linear-gradient(180deg, #10b981, #059669)', // Green
        'linear-gradient(180deg, #06b6d4, #0891b2)', // Cyan
        'linear-gradient(180deg, #8b5cf6, #6d28d9)'  // Purple
    ];

    let cohortHtml = sortedCohorts.map((c, idx) => {
        let count = cohorts[c];
        let height = (count / maxCohort) * 150;
        let color = barColors[idx % barColors.length];
        return `
            <div style="display:flex; flex-direction:column; align-items:center; gap:8px; width:45px;">
                <span style="font-size:0.75rem; font-weight:700;">${count}</span>
                <div style="background:${color}; width:100%; height:${height}px; border-radius:4px 4px 0 0; transition: height 0.5s ease;"></div>
                <span style="font-size:0.75rem; color:var(--text-muted);">รุ่น ${c}</span>
            </div>
        `;
    }).join('');

    // Process Majors HTML
    let majorHtml = Object.keys(majors).sort((a,b) => majors[b] - majors[a]).map((m, idx) => {
        let count = majors[m];
        let total = Object.values(majors).reduce((a,b)=>a+b, 0);
        let pct = Math.round((count/total)*100);
        let color = barColors[idx % barColors.length];
        return `
            <div style="margin-bottom:15px;">
                <div style="display:flex; justify-content:space-between; font-size:0.82rem; margin-bottom:5px;">
                    <span>${m}</span>
                    <span style="font-weight:700;">${count} คน (${pct}%)</span>
                </div>
                <div style="height:8px; background:var(--bg-tertiary); border-radius:4px; overflow:hidden;">
                    <div style="width:${pct}%; height:100%; background:${color}; border-radius:4px; transition: width 0.5s ease;"></div>
                </div>
            </div>
        `;
    }).join('');

    return `
    <div class="dashboard-grid" style="grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 24px;">
        <!-- Students by Cohort -->
        <div class="card animate-in">
            <div class="card-header"><h3 class="card-title">จำนวนนักศึกษาแยกตามรุ่น</h3></div>
            <div class="card-body">
                <div style="display:flex; justify-content:space-around; align-items:flex-end; height:180px; padding-bottom:10px; border-bottom:1px solid var(--border-color);">
                    ${cohortHtml || '<div style="color:var(--text-muted);">ไม่มีข้อมูล</div>'}
                </div>
            </div>
        </div>

        <!-- Students by Major -->
        <div class="card animate-in animate-delay-1">
            <div class="card-header"><h3 class="card-title">สัดส่วนตามสาขาวิชา</h3></div>
            <div class="card-body">
                ${majorHtml || '<div style="color:var(--text-muted);">ไม่มีข้อมูล</div>'}
            </div>
        </div>

        <!-- Gender & Early Warning -->
        <div style="display:flex; flex-direction:column; gap:24px;">
            <div class="card animate-in animate-delay-2">
                <div class="card-header"><h3 class="card-title">สัดส่วนนักศึกษา (เพศ)</h3></div>
                <div class="card-body">
                    <div style="display:flex; justify-content:space-between; margin-bottom:10px; font-weight:600; font-size:0.9rem;">
                        <span style="color:var(--info);">ชาย ${genderStats.male}%</span>
                        <span style="color:var(--danger);">หญิง ${genderStats.female}%</span>
                    </div>
                    <div style="height:15px; display:flex; border-radius:10px; overflow:hidden; background:var(--bg-tertiary);">
                        <div style="width:${genderStats.male}%; background:var(--info);"></div>
                        <div style="width:${genderStats.female}%; background:var(--accent-primary);"></div>
                    </div>
                    <div style="display:flex; justify-content:space-between; margin-top:8px; font-size:0.75rem; color:var(--text-muted);">
                        <span>${genderStats.maleCount} คน</span>
                        <span>${genderStats.femaleCount} คน</span>
                    </div>
                </div>
            </div>

            <div class="card animate-in animate-delay-3" style="border-left: 4px solid var(--danger);">
                <div class="card-header" style="background: rgba(220, 38, 38, 0.05); display: flex; justify-content: space-between; align-items: center;">
                    <h3 class="card-title" style="color:var(--danger);">นักศึกษาที่ควรเฝ้าระวัง (GPA < 2.5)</h3>
                    <span class="badge danger" style="font-size: 0.7rem;">ต้องการความช่วยเหลือด่วน</span>
                </div>
                <div class="card-body" style="padding:0;">
                    ${atRiskStudents.length === 0 ? '<div style="padding:20px; text-align:center; color:var(--text-muted);">ไม่พบข้อมูล</div>' : 
                        atRiskStudents.map(st => `
                            <div style="display:flex; justify-content:space-between; align-items: center; padding:12px 20px; border-bottom:1px solid var(--border-color);">
                                <div style="cursor:pointer;" onclick="viewStudentProfile('${st.studentId}')">
                                    <div style="font-weight:600; font-size:0.9rem;">${st.prefix}${st.firstName} ${st.lastName}</div>
                                    <div style="font-size:0.72rem; color:var(--text-muted);">${st.studentId} • GPAX: <span style="color:var(--danger); font-weight:700;">${Number(st.gpa).toFixed(2)}</span></div>
                                </div>
                                <button class="btn btn-secondary btn-sm" style="color: var(--danger); border-color: var(--danger); font-size: 0.7rem;" onclick="notifyAdvisor('${st.studentId}')">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                                    แจ้งที่ปรึกษา
                                </button>
                            </div>
                        `).join('')
                    }
                </div>
            </div>
        </div>
    </div>`;
}

function renderDashboardData(activeStudents, advisors) {
    const allStudents = MOCK.students || [];
    const departments = [...new Set(allStudents.map(s => s.department).filter(Boolean))].sort();
    const cohorts = [...new Set(allStudents.map(s => String(s.studentId || '').substring(0, 2)).filter(c => c && !isNaN(c)))].sort();

    return `
    <div class="animate-in">
        <!-- Advanced Filter Bar -->
        <div class="card" style="margin-bottom: 24px; border-bottom: 3px solid var(--accent-primary);">
            <div class="card-body" style="padding: 20px;">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; align-items: flex-end;">
                    <div class="form-group" style="margin-bottom: 0;">
                        <label class="form-label" style="font-size: 0.75rem;">ค้นหาด้วยคำสำคัญ</label>
                        <div style="position: relative;">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%);"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                            <input type="text" id="dashboardSearchInput" class="form-input" placeholder="ชื่อ, รหัส, วิชา..." style="padding-left: 35px; font-size: 0.82rem;" oninput="filterDashboardLists()">
                        </div>
                    </div>
                    <div class="form-group" style="margin-bottom: 0;">
                        <label class="form-label" style="font-size: 0.75rem;">รุ่น (Cohort)</label>
                        <select id="filterCohort" class="form-select" style="font-size: 0.82rem;" onchange="filterDashboardLists()">
                            <option value="">ทั้งหมด</option>
                            ${cohorts.map(c => `<option value="${c}">รุ่น ${c}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group" style="margin-bottom: 0;">
                        <label class="form-label" style="font-size: 0.75rem;">สาขาวิชา</label>
                        <select id="filterMajor" class="form-select" style="font-size: 0.82rem;" onchange="filterDashboardLists()">
                            <option value="">ทั้งหมด</option>
                            ${departments.map(d => `<option value="${d}">${d}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group" style="margin-bottom: 0;">
                        <label class="form-label" style="font-size: 0.75rem;">สถานะ</label>
                        <select id="filterStatus" class="form-select" style="font-size: 0.82rem;" onchange="filterDashboardLists()">
                            <option value="">ทั้งหมด</option>
                            <option value="กำลังศึกษา">กำลังศึกษา</option>
                            <option value="สำเร็จการศึกษา">สำเร็จการศึกษา</option>
                            <option value="ลาพักการเรียน">ลาพักการเรียน</option>
                            <option value="พ้นสภาพ">พ้นสภาพ</option>
                        </select>
                    </div>
                    <div style="display: flex; gap: 8px;">
                        <button class="btn btn-secondary" style="flex: 1; padding: 8px;" onclick="exportDashboardData('csv')">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                            Excel
                        </button>
                        <button class="btn btn-primary" style="flex: 1; padding: 8px;" onclick="window.print()">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                            Print
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div style="display:grid; grid-template-columns: 1fr; gap:24px;">
            <!-- Student Table -->
            <div class="card">
                <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
                    <h3 class="card-title">รายชื่อนักศึกษา</h3>
                    <span class="badge info" id="studentCountBadge">${activeStudents.length} คน</span>
                </div>
                <div class="card-body" style="padding:0;">
                    <div class="table-wrapper" style="max-height:450px; overflow-y:auto;" id="studentListContainer">
                        ${renderStudentListTable(activeStudents)}
                    </div>
                </div>
            </div>

            <!-- Teacher Table -->
            <div class="card">
                <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
                    <h3 class="card-title">รายชื่ออาจารย์</h3>
                    <span class="badge info" id="teacherCountBadge">${advisors.length} คน</span>
                </div>
                <div class="card-body" style="padding:0;">
                    <div class="table-wrapper" style="max-height:450px; overflow-y:auto;" id="teacherListContainer">
                        ${renderTeacherListTable(advisors)}
                    </div>
                </div>
            </div>
        </div>
    </div>`;
}

// ============================
// Actions & Handlers
// ============================

window.switchDashboardTab = function(tab) {
    window._dashboardActiveTab = tab;
    const content = pages.dashboard();
    const contentArea = document.getElementById('contentArea');
    if (contentArea) contentArea.innerHTML = content;
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.includes(tab === 'overview' ? 'ภาพรวม' : 'จัดการข้อมูล')) {
            btn.classList.add('active');
        }
    });
};

window.filterDashboardLists = function() {
    const query = (document.getElementById('dashboardSearchInput')?.value || '').trim().toLowerCase();
    const cohort = document.getElementById('filterCohort')?.value || '';
    const major = document.getElementById('filterMajor')?.value || '';
    const status = document.getElementById('filterStatus')?.value || '';

    const allStudents = MOCK.students || [];
    const filteredStudents = allStudents.filter(st => {
        const fullName = `${st.prefix || ''}${st.firstName || ''} ${st.lastName || ''}`.toLowerCase();
        const studentId = String(st.studentId || st.id || '').toLowerCase();
        const dept = String(st.department || '').toLowerCase();
        const stStatus = String(st.status || 'กำลังศึกษา');
        const stCohort = studentId.substring(0, 2);

        const matchesSearch = !query || fullName.includes(query) || studentId.includes(query) || dept.includes(query);
        const matchesCohort = !cohort || stCohort === cohort;
        const matchesMajor = !major || dept === major;
        const matchesStatus = !status || stStatus === status;

        return matchesSearch && matchesCohort && matchesMajor && matchesStatus;
    });

    const studentContainer = document.getElementById('studentListContainer');
    if (studentContainer) studentContainer.innerHTML = renderStudentListTable(filteredStudents);
    
    const studentBadge = document.getElementById('studentCountBadge');
    if (studentBadge) studentBadge.textContent = `${filteredStudents.length} คน`;

    // Teachers filter (only matches search)
    const allTeachers = MOCK.academicAdvisors || [];
    const filteredTeachers = allTeachers.filter(t => {
        const name = String(t.name || '').toLowerCase();
        const expertise = String(t.expertise || '').toLowerCase();
        return !query || name.includes(query) || expertise.includes(query);
    });

    const teacherContainer = document.getElementById('teacherListContainer');
    if (teacherContainer) teacherContainer.innerHTML = renderTeacherListTable(filteredTeachers);
    
    const teacherBadge = document.getElementById('teacherCountBadge');
    if (teacherBadge) teacherBadge.textContent = `${filteredTeachers.length} คน`;
};

window.notifyAdvisor = function(studentId) {
    const student = (MOCK.students || []).find(s => s.studentId === studentId);
    if (student) {
        showSuccessNotification(`ส่งข้อความแจ้งเตือนอาจารย์ที่ปรึกษาของ ${student.firstName} เรียบร้อยแล้ว`);
    }
};

window.exportDashboardData = function(format) {
    const query = (document.getElementById('dashboardSearchInput')?.value || '').trim().toLowerCase();
    const cohort = document.getElementById('filterCohort')?.value || '';
    const major = document.getElementById('filterMajor')?.value || '';
    const status = document.getElementById('filterStatus')?.value || '';

    const allStudents = MOCK.students || [];
    const filtered = allStudents.filter(st => {
        const fullName = `${st.prefix || ''}${st.firstName || ''} ${st.lastName || ''}`.toLowerCase();
        const studentId = String(st.studentId || st.id || '').toLowerCase();
        const dept = String(st.department || '').toLowerCase();
        const stStatus = String(st.status || 'กำลังศึกษา');
        const stCohort = studentId.substring(0, 2);

        const matchesSearch = !query || fullName.includes(query) || studentId.includes(query) || dept.includes(query);
        const matchesCohort = !cohort || stCohort === cohort;
        const matchesMajor = !major || dept === major;
        const matchesStatus = !status || stStatus === status;

        return matchesSearch && matchesCohort && matchesMajor && matchesStatus;
    });

    if (format === 'csv') {
        let csv = 'รหัสนักศึกษา,ชื่อ-นามสกุล,สาขาวิชา,สถานะ,GPAX\n';
        filtered.forEach(st => {
            csv += `${st.studentId},${st.prefix}${st.firstName} ${st.lastName},${st.department},${st.status || 'กำลังศึกษา'},${st.gpa || '0.00'}\n`;
        });
        
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', `student_report_${new Date().getTime()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

// Reusable Helpers
function renderStudentListTable(list) {
    if (!list || list.length === 0) return '<div style="padding:40px; text-align:center; color:var(--text-muted);">ไม่พบข้อมูลที่ค้นหา</div>';
    return `<table class="data-table" style="font-size:0.85rem;">
        <thead><tr><th>#</th><th>รหัสนักศึกษา</th><th>ชื่อ-นามสกุล</th><th>สาขาวิชา</th><th>สถานะ</th><th>จัดการ</th></tr></thead>
        <tbody>
            ${list.map((st, i) => `
                <tr>
                    <td>${i+1}</td>
                    <td style="font-weight:600; color:var(--accent-primary);">${st.studentId || st.id}</td>
                    <td>${st.prefix || ''}${st.firstName} ${st.lastName}</td>
                    <td>${st.department || '-'}</td>
                    <td>${getStatusBadge(st.status || 'กำลังศึกษา')}</td>
                    <td><button class="btn btn-secondary btn-sm" onclick="viewStudentProfile('${st.studentId || st.id}')">ดูข้อมูล</button></td>
                </tr>
            `).join('')}
        </tbody>
    </table>`;
}

function renderTeacherListTable(list) {
    if (!list || list.length === 0) return '<div style="padding:40px; text-align:center; color:var(--text-muted);">ไม่พบข้อมูล</div>';
    return `<table class="data-table" style="font-size:0.85rem;">
        <thead><tr><th>#</th><th>ชื่อ-นามสกุล</th><th>ตำแหน่ง</th><th>ความเชี่ยวชาญ</th><th>นศ. ในกำกับ</th></tr></thead>
        <tbody>
            ${list.map((t, i) => `
                <tr>
                    <td>${i+1}</td>
                    <td style="font-weight:600;">${t.name}</td>
                    <td><span class="badge info" style="font-size:0.75rem;">${t.position || '-'}</span></td>
                    <td style="font-size:0.82rem;">${t.expertise || '-'}</td>
                    <td style="text-align:center; font-weight:600;">${t.studentCount || 0}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>`;
}

window.viewStudentProfile = function(id) {
    const student = (MOCK.students || []).find(st => String(st.studentId || st.id) === String(id));
    if (student) {
        MOCK.student = student;
        if (typeof window.syncActiveStudentData === 'function') window.syncActiveStudentData();
        navigateTo('student-profile');
    }
};

function showSuccessNotification(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: var(--success);
        color: white;
        padding: 15px 25px;
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-lg);
        z-index: 9999;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideInRight 0.3s ease;
    `;
    toast.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
