// ============================
// Evaluation Reports Dashboard (Admin/Staff only)
// ============================

pages['eval-reports'] = function() {
    // 1. Base Data Collections
    const evals = MOCK.evaluations || [];
    const courses = MOCK.courses || [];
    const allEvalQuestions = MOCK.evalQuestions || [];
    const instructorQuestions = MOCK.evalInstructorQuestions || [];
    const courseInstructors = MOCK.courseInstructors || [];

    // Pre-calculate basic stats
    const totalEvals = evals.length;
    const courseEvalsCount = evals.filter(e => e.type === 'course').length;
    const instructorEvalsCount = evals.filter(e => e.type === 'instructor' && !e.skipped).length;

    // Filter Controls HTML
    const uniqueCourses = [...new Set(evals.map(e => e.courseCode))].filter(c => c);
    
    // Create UI Structure
    return `
    <div class="animate-in">
        <div class="page-header" style="display:flex; justify-content:space-between; align-items:flex-end;">
            <div>
                <h1 class="page-title">รายงานผลการประเมิน</h1>
                <p class="page-subtitle">รายงานสรุปผลสัมฤทธิ์ระดับรายวิชาและการประเมินผู้สอน มคอ.5 (AUN-QA v4)</p>
            </div>
            <div style="display:flex; gap:12px;">
                <select id="evalReportCourseFilter" class="form-control" style="width:250px;" onchange="renderEvalReports()">
                    <option value="all">-- ทุกรายวิชา (All Courses) --</option>
                    ${uniqueCourses.map(code => {
                        const name = (courses.find(c => c.code === code) || {}).name || '';
                        return `<option value="${code}">${window.formatDisplayCode(code)} ${name}</option>`;
                    }).join('')}
                </select>
                <button class="btn btn-primary" onclick="printEvalReport()">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px;"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                    พิมพ์รายงาน
                </button>
            </div>
        </div>

        <div class="stats-grid" style="grid-template-columns: repeat(3, 1fr); margin-bottom: 24px;">
            <div class="stat-card">
                <div class="stat-icon purple"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg></div>
                <div class="stat-value" id="statTotalEvals">${totalEvals}</div>
                <div class="stat-label">ชุดประเมินทั้งหมด</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon blue"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/></svg></div>
                <div class="stat-value" id="statCourseEvals">${courseEvalsCount}</div>
                <div class="stat-label">ประเมินรายวิชาแล้ว</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon orange"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/></svg></div>
                <div class="stat-value" id="statInstructorEvals">${instructorEvalsCount}</div>
                <div class="stat-label">ประเมินผู้สอนแล้ว</div>
            </div>
        </div>

        <!-- Render Target for Filtered Content -->
        <div id="evalReportsContainer">
            <!-- Populated via renderEvalReports() -->
        </div>
    </div>
    
    <style>
        .report-section {
            background: white;
            border-radius: var(--radius-lg);
            border: 1px solid var(--border-color);
            padding: 24px;
            margin-bottom: 24px;
            box-shadow: var(--shadow-sm);
        }
        .report-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 20px;
            padding-bottom: 12px;
            border-bottom: 2px solid var(--bg-tertiary);
        }
        .report-title {
            font-size: 1.2rem;
            font-weight: 700;
            color: var(--text-primary);
            margin: 0;
        }
        .score-bar-container {
            width: 100%;
            height: 12px;
            background: var(--bg-tertiary);
            border-radius: 6px;
            margin-top: 8px;
            overflow: hidden;
        }
        .score-bar {
            height: 100%;
            border-radius: 6px;
            transition: width 0.5s ease;
        }
        .data-table th {
            font-weight: 600;
            color: var(--text-muted);
            text-transform: uppercase;
            font-size: 0.8rem;
            letter-spacing: 0.5px;
        }
        @media print {
            .sidebar, .header, select, button { display: none !important; }
            .app { padding: 0 !important; }
            .main-content { margin: 0 !important; width: 100% !important; }
            .report-section { box-shadow: none; border: 1px solid #ddd; break-inside: avoid; }
        }
    </style>
    
    <script>
        // Trigger initial render after short delay to ensure DOM is ready
        setTimeout(renderEvalReports, 100);
    </script>
    `;
};

// Global render function
window.renderEvalReports = function() {
    const container = document.getElementById('evalReportsContainer');
    const courseFilterStr = document.getElementById('evalReportCourseFilter') ? document.getElementById('evalReportCourseFilter').value : 'all';
    
    if (!container) return;

    const evals = MOCK.evaluations || [];
    const students = MOCK.students || [];
    
    // Determine which evaluations to process
    let filteredEvals = evals;
    if (courseFilterStr !== 'all') {
        filteredEvals = evals.filter(e => e.courseCode === courseFilterStr);
    }

    // --- 1. Advanced Stats Calculations ---
    const selTotal = filteredEvals.length;
    const selCourse = filteredEvals.filter(e => e.type === 'course').length;
    const selInst = filteredEvals.filter(e => e.type === 'instructor' && !e.skipped).length;
    
    // Participation Rate Calculation
    let totalExpected = students.length; // Simplified: all students. In real app, filter by enrollment in course.
    if (courseFilterStr !== 'all') {
        totalExpected = (MOCK.enrollments || []).filter(en => en.courseCode === courseFilterStr).length || 15; // fallback
    }
    const responseRate = Math.min(100, Math.round((selCourse / (totalExpected || 1)) * 100));

    // Update Top Stats
    if(document.getElementById('statTotalEvals')) document.getElementById('statTotalEvals').textContent = selTotal;
    if(document.getElementById('statCourseEvals')) document.getElementById('statCourseEvals').textContent = selCourse;
    if(document.getElementById('statInstructorEvals')) document.getElementById('statInstructorEvals').textContent = selInst;

    // --- 2. Data Aggregations ---
    let courseScoreSums = {};
    let courseScoreCounts = {};
    let allComments = [];
    let instScoreSums = {};
    let instScoreCounts = {};

    filteredEvals.forEach(e => {
        if (e.comment && String(e.comment).trim() !== '') {
            allComments.push({
                type: e.type, course: e.courseCode, instructor: e.instructor || '-',
                text: e.comment, date: e.date
            });
        }

        let scoresDict = {};
        try { scoresDict = typeof e.scores === 'string' ? JSON.parse(e.scores) : e.scores; } catch (err) {}

        if (e.type === 'course') {
            for (let qId in scoresDict) {
                if (!courseScoreSums[qId]) { courseScoreSums[qId] = 0; courseScoreCounts[qId] = 0; }
                courseScoreSums[qId] += parseFloat(scoresDict[qId] || 0);
                courseScoreCounts[qId]++;
            }
        } else if (e.type === 'instructor' && !e.skipped) {
            let iId = e.instructor;
            if (!instScoreSums[iId]) { instScoreSums[iId] = {}; instScoreCounts[iId] = {}; }
            for (let qId in scoresDict) {
                if (!instScoreSums[iId][qId]) { instScoreSums[iId][qId] = 0; instScoreCounts[iId][qId] = 0; }
                instScoreSums[iId][qId] += parseFloat(scoresDict[qId] || 0);
                instScoreCounts[iId][qId]++;
            }
        }
    });

    const courseQuestionsToRender = [];
    Object.keys(courseScoreSums).forEach(qId => {
        const qData = (MOCK.evalQuestions || []).find(q => String(q.question_id) === String(qId)) || { question_text: 'ระบบ: คำถามข้อ ' + qId, section: 'ทั่วไป' };
        courseQuestionsToRender.push({
            id: qId, text: qData.question_text, section: qData.section || qData.category || 'ทั่วไป',
            avg: (courseScoreSums[qId] / courseScoreCounts[qId]).toFixed(2),
            count: courseScoreCounts[qId]
        });
    });

    const courseSections = {};
    courseQuestionsToRender.forEach(q => {
        if (!courseSections[q.section]) courseSections[q.section] = { name: q.section, totalAvg: 0, items: [] };
        courseSections[q.section].items.push(q);
    });
    
    // Insights: Strengths & Weaknesses
    const allItemsSorted = [...courseQuestionsToRender].sort((a,b) => b.avg - a.avg);
    const strengths = allItemsSorted.slice(0, 3);
    const weaknesses = allItemsSorted.filter(i => i.avg < 3.5).sort((a,b) => a.avg - b.avg).slice(0, 3);

    // Build Layout
    let html = `
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px; margin-bottom: 24px;">
            <!-- Trend & Participation -->
            <div class="report-section" style="margin-bottom:0;">
                <div class="report-header">
                    <h2 class="report-title">บทวิเคราะห์แนวโน้มและการมีส่วนร่วม (Trend & Participation)</h2>
                </div>
                <div style="display:flex; gap:20px; align-items:center;">
                    <div style="flex:1; height:200px;">
                        <canvas id="evalTrendChart"></canvas>
                    </div>
                    <div style="width:150px; text-align:center;">
                        <div style="font-size:0.8rem; color:var(--text-muted); margin-bottom:10px;">Response Rate</div>
                        <div style="position:relative; width:100px; height:100px; margin:0 auto;">
                            <svg width="100" height="100" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="45" fill="none" stroke="var(--bg-tertiary)" stroke-width="8" />
                                <circle cx="50" cy="50" r="45" fill="none" stroke="var(--success)" stroke-width="8" 
                                    stroke-dasharray="${(responseRate/100)*283} 283" transform="rotate(-90 50 50)" style="transition: stroke-dasharray 1s ease;"/>
                            </svg>
                            <div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); font-weight:800; font-size:1.2rem;">${responseRate}%</div>
                        </div>
                        <p style="font-size:0.75rem; margin-top:10px; color:var(--text-muted);">${selCourse} จาก ${totalExpected} คน</p>
                    </div>
                </div>
            </div>

            <!-- Category Analysis Radar -->
            <div class="report-section" style="margin-bottom:0;">
                <div class="report-header">
                    <h2 class="report-title">สรุปตามหมวดหมู่ (AUN-QA Matrix)</h2>
                </div>
                <div style="height:200px;">
                    <canvas id="evalRadarChart"></canvas>
                </div>
            </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px;">
            <!-- Key Strengths -->
            <div class="report-section" style="border-left: 5px solid var(--success); margin-bottom:0;">
                <h4 style="color:var(--success); margin-bottom:15px; display:flex; align-items:center; gap:8px;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                    จุดแข็งของรายวิชา (Top Strengths)
                </h4>
                <ul style="padding-left:20px; font-size:0.9rem;">
                    ${strengths.map(s => `<li style="margin-bottom:8px;">${s.text} <strong style="color:var(--success)">(${s.avg})</strong></li>`).join('')}
                </ul>
            </div>
            <!-- Areas for Improvement -->
            <div class="report-section" style="border-left: 5px solid var(--warning); margin-bottom:0;">
                <h4 style="color:var(--warning); margin-bottom:15px; display:flex; align-items:center; gap:8px;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    จุดที่ควรพัฒนา (Areas for Improvement)
                </h4>
                <ul style="padding-left:20px; font-size:0.9rem;">
                    ${weaknesses.length ? weaknesses.map(w => `<li style="margin-bottom:8px;">${w.text} <strong style="color:var(--warning)">(${w.avg})</strong></li>`).join('') : '<li>ไม่มีหัวข้อที่ได้คะแนนต่ำกว่าเกณฑ์ 3.50</li>'}
                </ul>
            </div>
        </div>
    `;

    // Add existing detailed sections
    // --- Detailed Course Report ---
    html += `<div class="report-section">
        <div class="report-header">
            <div class="stat-icon purple" style="width:36px; height:36px;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20v-6M6 20V10M18 20V4"/></svg></div>
            <div>
                <h2 class="report-title">รายงานผลสัมฤทธิ์รายวิชาแบบละเอียด (Detailed Course Achievement)</h2>
            </div>
        </div>`;
    
    Object.keys(courseSections).forEach(secKey => {
        const sec = courseSections[secKey];
        sec.items.sort((a,b) => parseInt(a.id) - parseInt(b.id));
        let secSum = 0; sec.items.forEach(i => secSum += parseFloat(i.avg));
        sec.totalAvg = (secSum / sec.items.length).toFixed(2);
        let secColor = 'var(--primary)';
        if (secKey.toLowerCase().includes('clo') || secKey.toLowerCase().includes('llo')) secColor = 'var(--success)';

        html += `
            <div style="margin-bottom: 24px;">
                <h4 style="margin: 0 0 12px 0; color:var(--text-primary); display:flex; justify-content:space-between; align-items:center; border-bottom:1px dashed var(--border-color); padding-bottom:8px;">
                    <span>หมวดหมู่: <span style="color:${secColor}">${sec.name}</span></span>
                    <span style="font-size:0.9rem; font-weight:600; color:var(--text-muted);">เฉลี่ยหมวด: <strong>${sec.totalAvg}</strong></span>
                </h4>
                <table class="data-table">
                    <thead><tr><th style="width:50px;">ข้อ</th><th>รายละเอียด</th><th style="width:100px;text-align:center;">เฉลี่ย</th><th style="width:150px;">กราฟ</th></tr></thead>
                    <tbody>
                        ${sec.items.map(item => {
                            let color = 'var(--success)';
                            if (item.avg < 3.5) color = 'var(--warning)';
                            if (item.avg < 2.5) color = 'var(--danger)';
                            return `<tr><td>${item.id}</td><td>${item.text}</td><td style="text-align:center; font-weight:700;">${item.avg}</td><td><div class="score-bar-container" style="margin:0; height:8px;"><div class="score-bar" style="width:${(item.avg/5)*100}%; background:${color};"></div></div></td></tr>`
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    });
    html += `</div>`;

    // Detailed Instructor Report
    let instHtml = '';
    const instQuestionsDict = {};
    (MOCK.evalInstructorQuestions || []).forEach(q => { instQuestionsDict[String(q.question_id)] = q.question_text; });
    Object.keys(instScoreSums).forEach(instId => {
        const teacher = (MOCK.academicAdvisors || []).find(t => String(t.username) === instId) || { name: instId };
        let iRows = ''; let totalSum = 0; let totalCount = 0;
        Object.keys(instScoreSums[instId]).forEach(qId => {
            const avg = (instScoreSums[instId][qId] / instScoreCounts[instId][qId]).toFixed(2);
            totalSum += parseFloat(avg); totalCount++;
            let color = avg < 3.5 ? 'var(--warning)' : 'var(--success)';
            iRows += `<tr><td>${instQuestionsDict[qId] || 'ข้อ '+qId}</td><td style="text-align:center; font-weight:600;">${avg}</td><td><div class="score-bar-container" style="margin:0;"><div class="score-bar" style="width:${(avg/5)*100}%; background:${color};"></div></div></td></tr>`;
        });
        const overallAvg = (totalSum / totalCount).toFixed(2);
        instHtml += `
            <div style="margin-bottom: 24px;">
                <h4 style="margin: 0 0 12px 0; color:var(--text-primary); display:flex; justify-content:space-between;">
                    <span>อาจารย์: ${teacher.name}</span>
                    <span class="badge ${overallAvg >= 3.5 ? 'success' : 'warning'}">เฉลี่ยรวม: ${overallAvg}/5.00</span>
                </h4>
                <table class="data-table"><tbody>${iRows}</tbody></table>
            </div>
        `;
    });

    html += `<div class="report-section"><div class="report-header"><h2 class="report-title">รายงานประเมินคุณภาพอาจารย์ผู้สอน</h2></div>${instHtml || 'ไม่มีข้อมูล'}</div>`;

    // Qualitative
    html += `<div class="report-section">
        <div class="report-header"><h2 class="report-title">ข้อเสนอแนะเชิงคุณภาพ (CQI)</h2></div>
        ${allComments.length === 0 ? '<p style="text-align:center; color:var(--text-muted);">ไม่มีข้อมูล</p>' : `
        <table class="data-table">
            <thead><tr><th>วิชา</th><th>อาจารย์</th><th>ข้อเสนอแนะ</th><th>วันที่</th></tr></thead>
            <tbody>
                ${allComments.map(c => `<tr><td style="font-weight:600;">${c.course}</td><td>${c.instructor}</td><td>${c.text}</td><td>${window.formatDateThai(c.date)}</td></tr>`).join('')}
            </tbody>
        </table>
        `}
    </div>`;

    container.innerHTML = html;

    // --- 3. Initialize Charts ---
    setTimeout(() => {
        // Trend Chart
        const ctxTrend = document.getElementById('evalTrendChart');
        if (ctxTrend) {
            new Chart(ctxTrend, {
                type: 'line',
                data: {
                    labels: ['1/2566', '2/2566', 'ฤดูร้อน/2566', '1/2567'],
                    datasets: [{
                        label: 'คะแนนเฉลี่ยรายวิชา',
                        data: [4.12, 4.25, 4.18, 4.35],
                        borderColor: '#6366f1',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: { 
                    responsive: true, 
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { min: 3, max: 5 } }
                }
            });
        }

        // Radar Chart
        const ctxRadar = document.getElementById('evalRadarChart');
        if (ctxRadar) {
            const labels = Object.keys(courseSections);
            const data = labels.map(l => courseSections[l].totalAvg);
            new Chart(ctxRadar, {
                type: 'radar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'คะแนนตามหมวดหมู่',
                        data: data,
                        backgroundColor: 'rgba(153, 27, 27, 0.2)',
                        borderColor: '#991b1b',
                        pointBackgroundColor: '#991b1b'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: { r: { min: 0, max: 5, ticks: { display: false } } }
                }
            });
        }
    }, 200);
};

window.printEvalReport = function() {
    window.print();
};

