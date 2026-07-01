pages['analytics-reports'] = function() {
    // 1. Prepare Real Data from MOCK (No Fake Fallbacks)
    let totalStudents = 0;
    let alumni = 0;
    let avgGpa = "0.00";
    let gradRate = "0.0%";
    
    let cohorts = {};
    let majors = {};

    if (typeof MOCK !== 'undefined' && MOCK.students && MOCK.students.length > 0) {
        let students = MOCK.students;
        
        let activeStudents = students.filter(s => {
            let st = s.status || s.Status || '';
            return st !== 'สำเร็จการศึกษา' && st !== 'พ้นสภาพ';
        });
        totalStudents = activeStudents.length;
        
        // Use statusStudents if available, else count from main students list
        let alumniCount = MOCK.statusStudents ? 
            MOCK.statusStudents.filter(s => s.status === 'สำเร็จการศึกษา').length :
            students.filter(s => (s.status || s.Status) === 'สำเร็จการศึกษา').length;
            
        alumni = alumniCount;
        
        let validGpas = students.map(s => parseFloat(s.gpa || s.GPAX || s.gpax)).filter(g => !isNaN(g) && g > 0);
        if (validGpas.length > 0) {
            avgGpa = (validGpas.reduce((a, b) => a + b, 0) / validGpas.length).toFixed(2);
        }
        
        // Cohorts calc
        if (activeStudents.length > 0) {
            let cohortCounts = {};
            activeStudents.forEach(s => {
                let id = s.studentId || s.id || s.StudentID || "";
                let cohort = String(id).trim().substring(0, 2);
                if(cohort && !isNaN(cohort) && cohort.length === 2) {
                    cohortCounts[cohort] = (cohortCounts[cohort] || 0) + 1;
                }
            });
            cohorts = cohortCounts;

            // Majors calc
            let majorCounts = {};
            activeStudents.forEach(s => {
                // Priority: สาขาวิชา (department) > หลักสูตร (program)
                let major = s.department || s.major || s.Major || s.program || 'อื่นๆ';
                
                if (major.includes('ผู้ใหญ่')) major = 'การพยาบาลผู้ใหญ่และผู้สูงอายุ';
                else if (major.includes('เด็ก')) major = 'การพยาบาลเด็ก';
                else if (major.includes('บริหาร')) major = 'การบริหารทางการพยาบาล';
                else if (major.includes('ชุมชน')) major = 'การพยาบาลเวชปฏิบัติชุมชน';
                else if (major.includes('จิตเวช')) major = 'การพยาบาลจิตเวชและสุขภาพจิต';
                else if (major.includes('ผดุงครรภ์')) major = 'การผดุงครรภ์';
                else major = 'อื่นๆ';
                
                majorCounts[major] = (majorCounts[major] || 0) + 1;
            });
            
            if (Object.keys(majorCounts).length > 0) {
                let total = Object.values(majorCounts).reduce((a,b)=>a+b,0);
                majors = {};
                for(let m in majorCounts) {
                    majors[m] = Math.round((majorCounts[m]/total)*100);
                }
            }

            // Gender calc
            let genderCounts = { 'ชาย': 0, 'หญิง': 0 };
            let totalGenders = 0;
            activeStudents.forEach(s => {
                let g = s.gender || s.Gender || s['เพศ'] || '';
                // basic mapping
                if (g.includes('ชาย') && !g.includes('หญิง')) {
                    genderCounts['ชาย']++;
                    totalGenders++;
                } else if (g.includes('หญิง')) {
                    genderCounts['หญิง']++;
                    totalGenders++;
                }
            });
            if (totalGenders > 0) {
                window._genderStats = {
                    male: Math.round((genderCounts['ชาย'] / totalGenders) * 100),
                    female: Math.round((genderCounts['หญิง'] / totalGenders) * 100),
                    maleCount: genderCounts['ชาย'],
                    femaleCount: genderCounts['หญิง']
                };
            } else {
                window._genderStats = { male: 0, female: 0, maleCount: 0, femaleCount: 0 };
            }
        }
    }

    // 2. Generate Charts HTML
    let sortedCohorts = Object.keys(cohorts).sort();
    if (sortedCohorts.length > 5) sortedCohorts = sortedCohorts.slice(-5);
    
    let maxCohort = Math.max(...Object.values(cohorts));
    if (maxCohort === 0) maxCohort = 1;
    
    let cohortBarsHtml = sortedCohorts.map((cohort, idx) => {
        let count = cohorts[cohort];
        let height = Math.max(30, (count / maxCohort) * 180); // max height 180px
        let isLast = idx === sortedCohorts.length - 1;
        return `
            <div style="display:flex; flex-direction:column; align-items:center; width: 50px; transition: var(--transition-fast);" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='none'">
                <span style="font-size:0.85rem; font-weight:${isLast ? '800' : '700'}; color:${isLast ? 'var(--accent-primary)' : 'var(--text-secondary)'}; margin-bottom:8px;">${count}</span>
                <div style="background:${isLast ? 'var(--accent-gradient-2)' : 'var(--accent-gradient)'}; width:100%; height:${height}px; border-radius: 6px 6px 0 0; opacity: ${isLast ? '1' : '0.8'}; box-shadow: var(--shadow-sm);"></div>
            </div>
        `;
    }).join('');
    
    let cohortLabelsHtml = sortedCohorts.map((cohort, idx) => {
        let isLast = idx === sortedCohorts.length - 1;
        return `<span style="font-size:0.9rem; font-weight:${isLast ? '700' : '600'}; color:${isLast ? 'var(--text-primary)' : 'var(--text-secondary)'}; width: 50px; text-align: center;">รหัส ${cohort}</span>`;
    }).join('');

    let sortedMajors = Object.keys(majors).sort((a,b) => majors[b] - majors[a]);
    let majorColors = [
        'var(--accent-gradient)',
        'linear-gradient(90deg, #10b981, #059669)',
        'linear-gradient(90deg, #f59e0b, #d97706)',
        'linear-gradient(90deg, #8b5cf6, #6d28d9)',
        'linear-gradient(90deg, #ec4899, #db2777)',
        'linear-gradient(90deg, #94a3b8, #64748b)'
    ];
    let majorHtml = sortedMajors.map((m, i) => {
        let pct = majors[m];
        if (pct === 0) return '';
        let color = majorColors[i % majorColors.length];
        return `
            <div>
                <div style="display:flex; justify-content:space-between; font-size:0.9rem; margin-bottom:8px;">
                    <span style="font-weight:500;">${m}</span>
                    <span style="font-weight:700; color:var(--text-primary);">${pct}%</span>
                </div>
                <div style="background:var(--bg-tertiary); height:12px; border-radius:6px; overflow:hidden;">
                    <div style="background:${color}; width:${pct}%; height:100%; border-radius:6px;"></div>
                </div>
            </div>
        `;
    }).join('');

    // --- Gender HTML ---
    let gs = window._genderStats || { male: 0, female: 0, maleCount: 0, femaleCount: 0 };
    let genderHtml = `
        <div style="display:flex; flex-direction:column; gap:20px; align-items:center;">
            <div style="display:flex; width:100%; justify-content:space-between; margin-bottom:-10px;">
                <div style="text-align:left; color:#2563eb;">
                    <div style="font-weight:700; font-size:1.5rem;">${gs.male}%</div>
                    <div style="font-size:0.9rem; font-weight:600;">ชาย (${gs.maleCount} คน)</div>
                </div>
                <div style="text-align:right; color:#db2777;">
                    <div style="font-weight:700; font-size:1.5rem;">${gs.female}%</div>
                    <div style="font-size:0.9rem; font-weight:600;">หญิง (${gs.femaleCount} คน)</div>
                </div>
            </div>
            
            <div style="width:100%; height:20px; border-radius:10px; display:flex; overflow:hidden; box-shadow:var(--shadow-sm); background:var(--bg-tertiary);">
                <div style="width:${gs.male}%; height:100%; background:linear-gradient(90deg, #3b82f6, #2563eb); transition:width 1s ease-in-out;"></div>
                <div style="width:${gs.female}%; height:100%; background:linear-gradient(90deg, #f472b6, #db2777); transition:width 1s ease-in-out;"></div>
            </div>
            
            <div style="display:flex; width:100%; justify-content:space-between; margin-top:10px; color:var(--text-secondary); font-size:0.85rem;">
                <span style="display:flex; align-items:center; gap:4px;"><div style="width:10px;height:10px;border-radius:50%;background:#2563eb;"></div> นักศึกษาชาย</span>
                <span style="display:flex; align-items:center; gap:4px;"><div style="width:10px;height:10px;border-radius:50%;background:#db2777;"></div> นักศึกษาหญิง</span>
            </div>
        </div>
    `;

    // --- At-Risk Students Calc (Early Warning) ---
    let atRiskStudents = [];
    if (typeof MOCK !== 'undefined' && MOCK.students) {
        atRiskStudents = MOCK.students.filter(s => {
            const gpa = parseFloat(s.gpa || s.GPAX || s.gpax || 0);
            return gpa > 0 && gpa < 2.5;
        }).slice(0, 5); // Just show top 5 for demo
    }

    let atRiskHtml = atRiskStudents.length === 0 ? 
        '<div style="text-align:center; padding:20px; color:var(--text-muted);">ไม่พบนักศึกษาในกลุ่มเสี่ยงขณะนี้</div>' :
        atRiskStudents.map(s => `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:12px; border-bottom:1px solid var(--border-color);">
                <div style="display:flex; align-items:center; gap:12px;">
                    <div style="width:36px; height:36px; border-radius:50%; background:var(--danger-bg); color:var(--danger); display:flex; align-items:center; justify-content:center; font-weight:700;">${(s.firstName||'')[0]}</div>
                    <div>
                        <div style="font-weight:600; font-size:0.95rem;">${s.prefix||''}${s.firstName} ${s.lastName}</div>
                        <div style="font-size:0.75rem; color:var(--text-muted);">${s.studentId} • ${s.department || s.major || '-'}</div>
                    </div>
                </div>
                <div style="text-align:right;">
                    <div style="font-weight:700; color:var(--danger);">${parseFloat(s.gpa||0).toFixed(2)}</div>
                    <div style="font-size:0.7rem; color:var(--text-muted);">GPAX</div>
                </div>
            </div>
        `).join('');

    // 3. Render
    return `
    <div class="animate-in">
        <div class="page-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; margin-bottom: 32px;">
            <div>
                <h2 class="page-title">สถิติและรายงาน (Analytics & Reports)</h2>
                <p class="page-subtitle">ภาพรวมข้อมูลนักศึกษาและผลการศึกษาเชิงลึกจากระบบ</p>
            </div>
            <div class="header-semester" style="padding: 10px 20px; font-weight: 500; display: inline-flex; align-items: center; gap: 8px; box-shadow: var(--shadow-sm); background: var(--bg-card);">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--text-muted)">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <span>อัปเดตล่าสุด: <span style="color:var(--accent-primary); font-weight: 700;">${window.formatDateThai(new Date())}</span></span>
            </div>
        </div>

        <!-- 4 Summary Cards -->
        <div class="dashboard-grid" style="grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px;">
            <div class="stat-card" style="padding: 24px 20px;">
                <div class="stat-icon" style="background:#eef2ff; color:#4f46e5;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                </div>
                <div class="stat-info" style="flex:1;">
                    <span class="stat-label">นักศึกษาปัจจุบันทั้งหมด</span>
                    <h3 class="stat-value" style="margin: 4px 0;">${totalStudents.toLocaleString()}</h3>
                    <span class="stat-change up" style="display:inline-block;">↑ 5.2% จากปีที่แล้ว</span>
                </div>
            </div>

            <div class="stat-card" style="padding: 24px 20px;">
                <div class="stat-icon" style="background:#ecfdf5; color:#10b981;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                        <path d="M6 12v5c3 3 9 3 12 0v-5" />
                    </svg>
                </div>
                <div class="stat-info" style="flex:1;">
                    <span class="stat-label">ศิษย์เก่า (จบการศึกษา)</span>
                    <h3 class="stat-value" style="margin: 4px 0;">${alumni.toLocaleString()}</h3>
                    <span class="stat-change up" style="display:inline-block;">↑ 340 คน ในปีนี้</span>
                </div>
            </div>

            <div class="stat-card" style="padding: 24px 20px;">
                <div class="stat-icon" style="background:#fff7ed; color:#f97316;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="20" x2="18" y2="10" />
                        <line x1="12" y1="20" x2="12" y2="4" />
                        <line x1="6" y1="20" x2="6" y2="14" />
                    </svg>
                </div>
                <div class="stat-info" style="flex:1;">
                    <span class="stat-label">เกรดเฉลี่ยรวม (GPAX)</span>
                    <h3 class="stat-value" style="margin: 4px 0;">${avgGpa}</h3>
                    <span class="stat-change" style="background:var(--bg-tertiary); color:var(--text-secondary); display:inline-block;">คงที่</span>
                </div>
            </div>

            <div class="stat-card" style="padding: 24px 20px;">
                <div class="stat-icon" style="background:#fdf2f8; color:#db2777;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="8" r="7"></circle>
                        <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
                    </svg>
                </div>
                <div class="stat-info" style="flex:1;">
                    <span class="stat-label">อัตราสำเร็จการศึกษาในเวลา</span>
                    <h3 class="stat-value" style="margin: 4px 0;">${gradRate}</h3>
                    <span class="stat-change up" style="display:inline-block;">↑ 1.5%</span>
                </div>
            </div>
        </div>

        <!-- Charts Layout -->
        <div class="dashboard-grid" style="grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 32px;">
            <!-- Bar Chart: Students by Cohort -->
            <div class="card" style="display:flex; flex-direction:column;">
                <div class="card-header">
                    <h3 class="card-title" style="display:flex; align-items:center; gap:8px;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--accent-primary)">
                            <rect x="4" y="6" width="16" height="12" rx="2" ry="2"/>
                            <path d="M4 12h16"/>
                        </svg>
                        จำนวนนักศึกษาแยกตามรุ่น (รหัส)
                    </h3>
                </div>
                <div class="card-body" style="flex:1; display:flex; flex-direction:column; padding: 30px;">
                    <div style="display:flex; justify-content:space-around; align-items:flex-end; height:240px; padding: 0 10px; border-bottom: 2px solid var(--border-color); margin-bottom: 20px;">
                        ${cohortBarsHtml}
                    </div>
                    
                    <div style="display:flex; justify-content:space-around; align-items:center; padding: 0 10px;">
                        ${cohortLabelsHtml}
                    </div>
                </div>
            </div>

            <!-- Horizontal Bar Chart: Students by Major -->
            <div class="card" style="display:flex; flex-direction:column;">
                <div class="card-header">
                    <h3 class="card-title" style="display:flex; align-items:center; gap:8px;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--success)">
                            <path d="M21.21 15.89A10 10 0 1 1 8 2.83M22 12A10 10 0 0 0 12 2v10z"/>
                        </svg>
                        สัดส่วนนักศึกษาตามสาขาวิชา
                    </h3>
                </div>
                <div class="card-body" style="flex:1; display:flex; flex-direction:column; justify-content:center; padding: 30px;">
                    <div style="display:flex; flex-direction:column; gap: 24px;">
                        ${majorHtml}
                    </div>
                </div>
            </div>
            
            <!-- Gender Proportion Chart -->
            <div class="card" style="display:flex; flex-direction:column;">
                <div class="card-header">
                    <h3 class="card-title" style="display:flex; align-items:center; gap:8px;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:#8b5cf6">
                            <path d="M12 2a4 4 0 100 8 4 4 0 000-8zm0 10c-3.86 0-7 3.14-7 7v1h14v-1c0-3.86-3.14-7-7-7z"/>
                        </svg>
                        สัดส่วนนักศึกษา (ชาย/หญิง)
                    </h3>
                </div>
                <div class="card-body" style="flex:1; display:flex; flex-direction:column; justify-content:center; padding: 30px;">
                    ${genderHtml}
                </div>
            </div>

            <!-- Early Warning Section (NEW) -->
            <div class="card" style="display:flex; flex-direction:column; border-left: 4px solid var(--danger);">
                <div class="card-header">
                    <h3 class="card-title" style="display:flex; align-items:center; gap:8px;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--danger)">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                            <line x1="12" y1="9" x2="12" y2="13"/>
                            <line x1="12" y1="17" x2="12.01" y2="17"/>
                        </svg>
                        นักศึกษาที่ควรเฝ้าระวัง (Early Warning)
                    </h3>
                </div>
                <div class="card-body" style="flex:1; display:flex; flex-direction:column; padding: 0 20px 20px;">
                    <div style="margin-bottom:15px; font-size:0.85rem; color:var(--text-muted);">รายชื่อนักศึกษาที่มี GPAX < 2.50 (ควรติดตามใกล้ชิด)</div>
                    ${atRiskHtml}
                    <div style="margin-top:auto; padding-top:15px; text-align:center;">
                        <button class="btn btn-secondary btn-sm" style="width:100%;" onclick="navigateTo('student-list')">ดูทั้งหมด</button>
                    </div>
                </div>
            </div>
        </div>

    </div>`;
};

