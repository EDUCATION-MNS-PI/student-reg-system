// ============================
// Transcript Page
// ============================

function getPlanIdFromDept(deptName) {
    if (!deptName) return 'nursing-adult';
    if (deptName.includes('เด็ก')) return 'nursing-pediatric';
    if (deptName.includes('ชุมชน')) return 'nursing-community';
    if (deptName.includes('ผดุงครรภ์')) return 'nursing-maternal';
    if (deptName.includes('ผู้ใหญ่')) return 'nursing-adult';
    if (deptName.includes('บริหาร')) return 'nursing-admin';
    if (deptName.includes('จิตเวช')) return 'nursing-mental';
    return 'generic';
}


function parseCourseString(str) {
    const match = str.match(/^([A-Za-z0-9x]+)\s+(.+?)\s+(\d+)\s*\((.+?)\)$/);
    if (match) {
        return { code: match[1], name: match[2], credits: parseInt(match[3]) || 0, format: match[4] };
    }
    const looseMatch = str.match(/^([A-Za-z0-9x]+)\s+(.*?)$/);
    if (looseMatch) {
        return { code: looseMatch[1], name: looseMatch[2], credits: 0, format: '' };
    }
    return { code: '', name: str, credits: 0, format: '' };
}

pages.transcript = function() {
    const isAdmin = (window.currentUserRole === 'staff' || window.currentUserRole === 'admin');
    const st = MOCK.student;

    if (!st && isAdmin) {
        return `
        <div class="animate-in">
            <div class="page-header" style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <h1 class="page-title">ใบแสดงผลการศึกษา</h1>
                    <p class="page-subtitle">กรุณาเลือกนักศึกษาเพื่อดูใบแสดงผลการศึกษา</p>
                </div>
                <div style="flex-grow: 1; max-width: 400px; margin: 0 20px;">
                    <div class="form-group" style="margin-bottom: 0;">
                        <select id="studentSelector" class="form-input" onchange="changeProfileStudent(this.value)" style="padding-right: 30px;">
                            <option value="">-- เลือกนักศึกษาเพื่อดูข้อมูล --</option>
                            ${(MOCK.students || []).map(s => `
                                <option value="${s.id || s.studentId}">
                                    ${s.studentId || ''} - ${s.prefix || ''}${s.firstName || ''} ${s.lastName || ''}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                </div>
            </div>
            <div class="card"><div class="card-body" style="text-align:center; padding:60px;">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5" style="margin-bottom:20px; opacity:0.5;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                <h3 style="color:var(--text-muted);">กรุณาเลือกนักศึกษา</h3>
                <p style="color:var(--text-muted);">ค้นหาและเลือกรายชื่อนักศึกษาจากรายการด้านบนเพื่อดูใบแสดงผลการศึกษา</p>
            </div></div>
        </div>`;
    }

    const studentData = st || {};
    const studentGrades = studentData.grades || MOCK.grades || [];
    
    // Fallbacks and Info
    const studentId = studentData.studentId || studentData.id || '---------';
    const studentPrefix = studentData.prefix || '';
    const studentFirstName = studentData.firstName || '';
    const studentLastName = studentData.lastName || '';
    const studentProgramRaw = studentData.program || '';
    const studentProgram = studentProgramRaw.includes('หลักสูตร') ? studentProgramRaw.replace('หลักสูตร', '').trim() : studentProgramRaw;
    const admissionYear = studentData.admissionYear || '----';
    const departmentName = studentData.department || '';

    const planId = getPlanIdFromDept(departmentName);
    const mockPlanData = window.getStudyPlanForStudent(studentData).data;

    // Data-Centric Rendering: Loop through actual grades grouped by semester in app.js
    let totalPointsGPA = 0;
    let totalCreditsGPA = 0;
    let totalCreditsEarned = 0;
    let semesterHtmlRows = '';

    // Collect all plan courses for matching
    const allPlanCourses = mockPlanData.flatMap(sem => sem.courses.map(c => parseCourseString(c)));

    studentGrades.forEach((semGroup, semIndex) => {
        let semCreditsTotal = 0;
        let semCreditsGPA = 0;
        let semPointsGPA = 0;
        let coursesHtml = '';

        (semGroup.courses || []).forEach(g => {
            const gCode = String(g.code || '').trim();
            const gName = String(g.name || '').trim();
            const gCred = Number(g.credits || 0);
            const gGrade = String(g.grade || '').trim();
            const gPoint = Number(g.point || 0);

            // Use raw credit string from sheet (e.g. "3(3-0-6)") if available
            const rawDisplay = String(g.creditsDisplay || '').trim();
            let creditsText = '';
            if (rawDisplay && rawDisplay.includes('(')) {
                // Sheet already has format like "3(3-0-6)"
                creditsText = rawDisplay;
            } else {
                // Fallback: try to find format from study plan
                const planMatch = allPlanCourses.find(pc => 
                    String(pc.code).replace(/[^0-9]/g, '') === gCode.replace(/[^0-9]/g, '') ||
                    String(pc.name).replace(/[^ก-๙A-Za-z]/g, '') === gName.replace(/[^ก-๙A-Za-z]/g, '')
                );
                const displayFormat = planMatch ? (planMatch.format || '') : '';
                creditsText = gCred + (displayFormat ? '(' + displayFormat + ')' : '');
            }

            if (gGrade && gGrade !== 'W' && gGrade !== 'I') {
                // All credits count toward total (including Thesis)
                semCreditsTotal += gCred;
                totalCreditsEarned += gCred;

                // Exclude Thesis and P/S/U from GPA only
                const isThesis = gName.includes('วิทยานิพนธ์') || 
                                 gName.toLowerCase().includes('thesis') ||
                                 gCode.startsWith('1005002') ||
                                 gCode.startsWith('1005003') ||
                                 gCode.startsWith('1005004');
                const isNonGPAGrade = ['P', 'S', 'U'].includes(gGrade);

                if (!isThesis && !isNonGPAGrade) {
                    semCreditsGPA += gCred;
                    semPointsGPA += (gCred * gPoint);
                    totalCreditsGPA += gCred;
                    totalPointsGPA += (gCred * gPoint);
                }
            }

            coursesHtml += `
                <tr>
                    <td class="center">${window.formatDisplayCode(gCode)}</td>
                    <td>${gName}</td>
                    <td class="center">${creditsText}</td>
                    <td class="center">${gGrade}</td>
                </tr>
            `;
        });

        const semGPA = semCreditsGPA > 0 ? (semPointsGPA / semCreditsGPA).toFixed(2) : '0.00';
        const cumGPAAtEnd = totalCreditsGPA > 0 ? (totalPointsGPA / totalCreditsGPA).toFixed(2) : '0.00';

        // Format Semester Title like in screenshot: "ภาคการศึกษาที่ 2 ปีการศึกษา 2565"
        const formattedSemTitle = `ภาคการศึกษาที่ ${semGroup.term} ปีการศึกษา ${semGroup.year}`;

        semesterHtmlRows += `
            <tbody ${semIndex === 2 ? 'style="page-break-after: always; break-after: page;"' : ''}>
                <tr>
                    <td colspan="4" class="center" style="font-weight:700;background:#f9f9f9;padding:10px;">${formattedSemTitle}</td>
                </tr>
                ${coursesHtml}
                <tr>
                    <td colspan="4" class="center" style="font-weight:700; font-size:0.85rem; padding:8px; border-bottom:2px solid #eee;">
                        หน่วยกิต ${semCreditsTotal} คะแนนเฉลี่ย ${semGPA} หน่วยกิตสะสม ${totalCreditsEarned} คะแนนเฉลี่ย ${cumGPAAtEnd}
                    </td>
                </tr>
            </tbody>
        `;
    });

    const cumulativeGPACalculated = totalCreditsGPA > 0 ? (totalPointsGPA / totalCreditsGPA).toFixed(2) : '0.00';

    return `
    <div class="animate-in">
        <div class="page-header" style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:15px;">
            <div>
                <h1 class="page-title">ใบแสดงผลการศึกษา</h1>
                <p class="page-subtitle">รายงานผลการเรียนแบบเป็นทางการ</p>
            </div>
            
            <div style="display:flex; gap:12px; align-items: center;">
                ${isAdmin ? `
                <div style="flex-grow: 1; min-width: 250px;">
                    <select id="studentSelector" class="form-input" onchange="changeProfileStudent(this.value)" style="padding-right: 30px; height:38px;">
                        <option value="">-- เลือกนักศึกษา --</option>
                        ${(MOCK.students || []).map(s => `
                            <option value="${s.id || s.studentId}" ${(studentData && (studentData.id === s.id || studentData.studentId === s.studentId)) ? 'selected' : ''}>
                                ${s.studentId || ''} - ${s.prefix || ''}${s.firstName || ''} ${s.lastName || ''}
                            </option>
                        `).join('')}
                    </select>
                </div>
                ` : ''}
                <button class="btn btn-primary" onclick="window.print()" style="height:38px;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                    พิมพ์ / ดาวน์โหลด
                </button>
            </div>
        </div>
        
        <div class="report-paper animate-in animate-delay-1" id="printable-transcript">
            <table class="report-table" style="width: 100%;">
                <thead>
                    <tr>
                        <td colspan="4" style="border: none !important; padding: 0;">
                            <div class="report-header">
                                <img src="assets/logo_faculty.png" alt="โลโก้คณะพยาบาลศาสตร์" style="width:70px;height:70px;object-fit:contain;margin-right:20px;">
                                <div class="report-header-text">
                                    <div style="font-size:1.2rem;margin-bottom:4px;">คณะพยาบาลศาสตร์ สถาบันพระบรมราชชนก</div>
                                    <div style="font-size:1rem;font-weight:600;">ระบบทะเบียนและประมวลผลการศึกษา</div>
                                </div>
                            </div>
                            
                            <div class="report-title-center">
                                <div>รายงานผลการเรียนนักศึกษารายปีการศึกษา</div>
                                <div>หลักสูตร${studentProgram}</div>
                                <div>${departmentName}</div>
                                <div>ปีที่เข้าศึกษา ${admissionYear}</div>
                                <div style="margin-top:10px;">รหัสนักศึกษา ${studentId} ชื่อ-สกุลนักศึกษา ${studentPrefix}${studentFirstName} ${studentLastName}</div>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <th style="width:15%">รหัสวิชา</th>
                        <th style="width:60%">รายวิชา</th>
                        <th style="width:12%">หน่วยกิต</th>
                        <th style="width:13%">ระดับคะแนน</th>
                    </tr>
                </thead>
                ${semesterHtmlRows}
                <tfoot>
                    <tr>
                        <td colspan="4" style="border: none !important; padding: 20px 0 0 0;">
                            <div class="report-footer" style="padding:0 20px; margin-bottom:20px;">
                                <div>
                                    <div style="margin-bottom:8px;">คะแนนเฉลี่ยตลอดปีการศึกษา: ${cumulativeGPACalculated}</div>
                                    <div>คะแนนเฉลี่ยสะสมตลอดหลักสูตร: ${cumulativeGPACalculated}</div>
                                </div>
                                <div>
                                    <div style="margin-bottom:8px;">รวมหน่วยกิตตลอดปีการศึกษา: ${totalCreditsEarned}</div>
                                    <div>รวมหน่วยกิตสะสมตลอดหลักสูตร: ${totalCreditsEarned}</div>
                                </div>
                            </div>
                            
                            <div style="display: flex; justify-content: space-between; align-items: flex-end;">
                                <div class="report-legend" style="margin-top: 0; width: 75%;">
                                    <strong>หมายเหตุ</strong>
                                    <div class="report-legend-grid">
                                        <div>A : ดีเยี่ยม</div>
                                        <div>B+ : ดีมาก</div>
                                        <div>B : ดี</div>
                                        <div>C+ : ค่อนข้างดี</div>
                                        <div>C : พอใช้</div>
                                        <div>D+ : อ่อน</div>
                                        <div>D : อ่อนมาก</div>
                                        <div>F : ตก</div>
                                        <div>S : พึงพอใจ</div>
                                        <div>U : ไม่พึงพอใจ</div>
                                        <div>I : ยังไม่สมบูรณ์</div>
                                        <div>W : ถอนรายวิชา</div>
                                        <div style="grid-column: span 2;">AU : เรียนโดยไม่เข้ารับการประเมิน</div>
                                        <div>IP : มีความก้าวหน้า</div>
                                        <div>X : ไม่รายงาน</div>
                                        <div>P : มีความก้าวหน้า</div>
                                        <div>N : ไม่มีความก้าวหน้า</div>
                                    </div>
                                </div>
                                <div style="text-align: center; padding-right: 40px; padding-bottom: 5px; font-size: 0.95rem;">
                                    <div style="margin-bottom: 6px;">รัชฎาพร เขษมโตมณี</div>
                                    <div>หัวหน้างานทะเบียน</div>
                                </div>
                            </div>
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
    </div>`;
};


