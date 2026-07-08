// ============================
// Course Evaluation Page — Wizard-style per-course assessment
// (ประเมินการจัดการเรียนการสอนของรายวิชา)
// ============================

// Helper to resolve instructor name from ID (Username in Teachers sheet)
function getInstructorDisplayName(id) {
    if (!id) return 'ไม่ระบุอาจารย์';
    const allTeachers = [...(MOCK.academicAdvisors || []), ...(MOCK.specialLecturers || [])];
    const teacher = allTeachers.find(t => String(t.username || t.id || '').trim() === String(id).trim());
    return teacher ? teacher.name : id;
}

// Helper to normalize course codes (removes leading zeros and trims)
// Helper to normalize course codes (removes leading zeros and trims)
const normalizeCode = (c) => String(c || '').trim().replace(/^0+/, '');


pages['eval-course'] = function () {
    const evals = MOCK.evaluations || [];
    const studentId = MOCK.student ? (MOCK.student.studentId || MOCK.student.id) : '';

    // 1. Build enrolled courses from student's grades (official Enrollments)
    let enrolled = (MOCK.grades || []).flatMap(sem =>
        (sem.courses || []).map(c => ({
            code: c.code,
            name: c.name,
            credits: c.credits,
            semester: sem.term,
            year: sem.year
        }))
    );

    // 2. Smart Fallback: If no enrollments, populate from Study Plan (Current semester only)
    if (enrolled.length === 0 && MOCK.student && typeof window.getStudyPlanForStudent === 'function') {
        const planInfo = window.getStudyPlanForStudent(MOCK.student);
        // Show all courses for the current relative year up to the current semester
        const relevantSems = (planInfo.data || []).filter(s =>
            s.year === planInfo.relYear && s.sem <= planInfo.relSem
        );

        relevantSems.forEach(currentSemData => {
            (currentSemData.courses || []).forEach(cStr => {
                const parts = cStr.split(' ');
                const code = String(parts[0]).trim();
                const name = parts.slice(1).join(' ');
                if (code) {
                    enrolled.push({
                        code: code,
                        name: name || 'รายวิชาตามแผนการศึกษา',
                        credits: '',
                        semester: currentSemData.sem,
                        year: planInfo.startYear + (currentSemData.year - 1)
                    });
                }
            });
        });
    }

    // Filter out courses from semesters before the student's admission year
    const admissionYear = parseInt((MOCK.student && MOCK.student.admissionYear) || 0);
    if (admissionYear > 0) {
        enrolled = enrolled.filter(c => !c.year || c.year >= admissionYear);
    }

    // Deduplicate by normalized course code
    const uniqueEnrolled = [];
    const seenCodes = new Set();
    enrolled.forEach(c => {
        const normCode = normalizeCode(c.code);
        if (normCode && !seenCodes.has(normCode)) {
            seenCodes.add(normCode);
            uniqueEnrolled.push(c);
        }
    });

    const total = uniqueEnrolled.length;
    const completed = uniqueEnrolled.filter(c =>
        evals.some(e => e.courseCode === c.code && e.type === 'course' && e.studentId === studentId)
    ).length;
    const pending = total - completed;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    return `
    <div class="animate-in">
        <div class="page-header">
            <h1 class="page-title">แบบประเมินการจัดการเรียนการสอนของรายวิชา</h1>
            <p class="page-subtitle">เลือกรายวิชาที่ต้องการประเมินจากรายวิชาที่ท่านลงทะเบียนเรียน</p>
        </div>
        
        <div class="stats-grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); margin-bottom: 24px;">
            <div class="stat-card animate-in animate-delay-1">
                <div class="stat-icon purple">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                </div>
                <div class="stat-value">${total}</div>
                <div class="stat-label">รายวิชาทั้งหมด</div>
            </div>
            <div class="stat-card animate-in animate-delay-2">
                <div class="stat-icon green">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                </div>
                <div class="stat-value" style="color:var(--success)">${completed}</div>
                <div class="stat-label">ประเมินแล้ว</div>
            </div>
            <div class="stat-card animate-in animate-delay-3">
                <div class="stat-icon orange">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                <div class="stat-value" style="color:var(--warning)">${pending}</div>
                <div class="stat-label">รอการประเมิน</div>
            </div>
        </div>

        <div class="card animate-in animate-delay-4">
            <div class="card-header" style="display:flex;justify-content:space-between;align-items:center;">
                <h3 class="card-title">เลือกรายวิชาที่ต้องการประเมิน</h3>
                <div style="display:flex;align-items:center;gap:12px;font-size:0.9rem;">
                    <span style="color:var(--text-muted)">ความคืบหน้า:</span>
                    <div style="width:100px;height:8px;background:var(--bg-tertiary);border-radius:4px;overflow:hidden;">
                        <div style="width:${percent}%;height:100%;background:var(--success);border-radius:4px;"></div>
                    </div>
                    <span style="font-weight:600">${percent}%</span>
                </div>
            </div>
            <div class="card-body" style="padding:0">
                <div style="display:grid; grid-template-columns: 1fr; gap:0;">
                    ${uniqueEnrolled.map(course => {
        const isEval = evals.find(e => e.courseCode === course.code && e.type === 'course' && e.studentId === studentId);
        // Check if course has questions in EvalQuestions sheet (including common ones)
        const hasQuestions = (MOCK.evalQuestions || []).some(q => {
            const cCode = normalizeCode(q.course_code);
            return cCode === normalizeCode(course.code) || cCode === 'ALL' || cCode === '' || cCode === '*';
        });
        // Get instructors for this course
        const instructors = (MOCK.courseInstructors || [])
            .filter(ci => normalizeCode(ci.course_code) === normalizeCode(course.code))
            .map(ci => getInstructorDisplayName(ci.instructor_id));

        return `
                        <div style="display:flex; align-items:center; justify-content:space-between; padding:16px 20px; border-bottom:1px solid var(--border-color); ${isEval ? 'background:rgba(40,167,69,0.05)' : ''}">
                            <div style="flex:1;">
                                <div style="display:flex; align-items:center; gap:10px; margin-bottom:4px;">
                                    <span style="font-weight:700; color:var(--accent-primary); font-size:0.95rem;">${window.formatDisplayCode(course.code)}</span>
                                    ${isEval ? '<span class="badge success" style="font-size:0.7rem;">ประเมินแล้ว ✓</span>' : '<span class="badge warning" style="font-size:0.7rem;">รอประเมิน</span>'}
                                </div>
                                <div style="font-weight:500; font-size:1rem; margin-bottom:2px;">${course.name}</div>
                                ${course.semester && course.year ? `<div style="font-size:0.85rem; color:var(--text-muted); margin-bottom:4px;">ภาคเรียนที่ ${course.semester}/${course.year}</div>` : ''}
                                <div style="font-size:0.8rem; color:var(--text-muted);">
                                    หน่วยกิต: ${course.credits || '-'} 
                                    ${instructors.length > 0 ? ' · อาจารย์: ' + instructors.slice(0, 3).join(', ') + (instructors.length > 3 ? ` +${instructors.length - 3}` : '') : ''}
                                </div>
                            </div>
                            <div>
                                ${isEval
                ? '<button class="btn btn-sm" disabled style="opacity:0.5;cursor:not-allowed;background:var(--success);color:white;border:none;">ประเมินแล้ว</button>'
                : `<button class="btn btn-primary btn-sm" onclick="startCourseEvalWizard('${course.code}', '${course.name.replace(/'/g, "\\\\'")}')">
                                        ${hasQuestions ? 'เริ่มประเมิน →' : 'ประเมินรายวิชา →'}
                                       </button>`
            }
                            </div>
                        </div>`;
    }).join('')}
                    ${uniqueEnrolled.length === 0 ? '<div style="padding:40px;text-align:center;color:var(--text-muted);">ไม่พบรายวิชาที่ลงทะเบียน</div>' : ''}
                </div>
            </div>
        </div>
    </div>`;
};

// ============================
// Instructor Evaluation Page
// ============================
pages['eval-instructor'] = function () {
    const evals = MOCK.evaluations || [];
    const studentId = MOCK.student ? (MOCK.student.studentId || MOCK.student.id) : '';

    // Group instructors by course+semester+year (key = normCode_sem_year)
    // This ensures each year's class has a separate instructor list
    const courseInstructors = MOCK.courseInstructors || [];
    const courseMap = {}; // key: normCode_sem_year → { code, name, semester, academicYear, instructors[] }
    courseInstructors.forEach(ci => {
        const code   = String(ci.course_code || '').trim();
        const sem    = String(ci.semester || '').trim();
        const year   = String(ci.academic_year || ci.year || '').trim();
        const normCode = normalizeCode(code);
        const mapKey = `${normCode}_${sem}_${year}`;

        if (!courseMap[mapKey]) {
            courseMap[mapKey] = {
                code: code,
                normCode: normCode,
                name: ci.course_name || '',
                semester: sem,
                academicYear: year,
                instructors: []
            };
        }
        const instId = String(ci.instructor_id || ci.instructor_name || '').trim();
        const instName = getInstructorDisplayName(instId);
        if (instId && !courseMap[mapKey].instructors.find(ins => ins.id === instId)) {
            courseMap[mapKey].instructors.push({ id: instId, name: instName });
        }
    });

    // Build enrollment lookup: normCode → { term, year } from student's actual enrollment
    const enrolledSemMap = {};
    (MOCK.grades || []).forEach(sem => {
        (sem.courses || []).forEach(c => {
            const norm = normalizeCode(c.code);
            if (norm && !enrolledSemMap[norm]) {
                enrolledSemMap[norm] = { term: String(sem.term), year: String(sem.year) };
            }
        });
    });

    // Fallback to Study Plan if enrollment data is empty
    const enrolledCodes = new Set(Object.keys(enrolledSemMap));
    if (enrolledCodes.size === 0 && MOCK.student && typeof window.getStudyPlanForStudent === 'function') {
        const planInfo = window.getStudyPlanForStudent(MOCK.student);
        const relevantSems = (planInfo.data || []).filter(s =>
            s.year === planInfo.relYear && s.sem <= planInfo.relSem
        );
        relevantSems.forEach(currentSemData => {
            (currentSemData.courses || []).forEach(cStr => {
                const code = String(cStr.split(' ')[0]).trim();
                const norm = normalizeCode(code);
                if (norm) {
                    enrolledCodes.add(norm);
                    enrolledSemMap[norm] = {
                        term: String(currentSemData.sem),
                        year: String(planInfo.startYear + (currentSemData.year - 1))
                    };
                }
            });
        });
    }

    // Match CourseInstructors entries to the student's specific semester+year for each enrolled course
    const evalItems = [];
    Object.entries(enrolledSemMap).forEach(([normCode, enrollment]) => {
        const mapKey = `${normCode}_${enrollment.term}_${enrollment.year}`;
        const entry = courseMap[mapKey];
        if (entry && entry.instructors.length > 0) {
            evalItems.push(entry);
        }
    });

    let totalInstructors = 0;
    let completedInstructors = 0;
    evalItems.forEach(item => {
        item.instructors.forEach(ins => {
            totalInstructors++;
            // Check by ID or Name (for backward compatibility during migration)
            if (evals.some(e => (e.instructor === ins.id || e.instructor === ins.name) && e.courseCode === item.code && e.type === 'instructor' && e.studentId === studentId)) {
                completedInstructors++;
            }
        });
    });
    const pendingInstructors = totalInstructors - completedInstructors;

    return `
    <div class="animate-in">
        <div class="page-header">
            <h1 class="page-title">แบบประเมินอาจารย์ผู้สอน</h1>
            <p class="page-subtitle">เลือกประเมินเฉพาะอาจารย์ที่ท่านเรียนด้วยในแต่ละวิชา</p>
        </div>

        <div class="stats-grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); margin-bottom: 24px;">
            <div class="stat-card animate-in animate-delay-1">
                <div class="stat-icon purple">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
                <div class="stat-value">${totalInstructors}</div>
                <div class="stat-label">รายการประเมินทั้งหมด</div>
            </div>
            <div class="stat-card animate-in animate-delay-2">
                <div class="stat-icon green">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                </div>
                <div class="stat-value" style="color:var(--success)">${completedInstructors}</div>
                <div class="stat-label">ประเมินแล้ว</div>
            </div>
            <div class="stat-card animate-in animate-delay-3">
                <div class="stat-icon orange">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                <div class="stat-value" style="color:var(--warning)">${pendingInstructors}</div>
                <div class="stat-label">รอการประเมิน</div>
            </div>
        </div>

        <div style="display:grid; grid-template-columns: 1fr; gap:20px;">
        ${evalItems.length > 0 ? evalItems.map((item, idx) => `
            <div class="card animate-in animate-delay-${Math.min(idx + 2, 4)}">
                <div class="card-body">
                    <div style="margin-bottom:16px; border-bottom:1px solid var(--border-color); padding-bottom:12px;">
                        <span style="font-weight:600; font-size:1.15rem; color:var(--accent-primary);">${window.formatDisplayCode(item.code)}</span>
                        <span style="font-size:1.1rem; margin-left:8px;">${item.name}</span>
                        ${item.semester && item.academicYear ? `<div style="font-size:0.9rem; color:var(--text-muted); margin-top:4px; font-weight:500;">ภาคเรียนที่ ${item.semester}/${item.academicYear}</div>` : ''}
                        <p style="margin:4px 0 0; font-size:0.85rem; color:var(--text-muted)">เลือกประเมินเฉพาะอาจารย์ที่ท่านเรียนด้วยในวิชานี้</p>
                    </div>
                    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap:12px;">
                    ${item.instructors.map(ins => {
        const isEval = evals.find(e => (e.instructor === ins.id || e.instructor === ins.name) && e.courseCode === item.code && e.type === 'instructor' && e.studentId === studentId);
        return `
                        <div style="display:flex; align-items:center; justify-content:space-between; padding:12px 16px; background:var(--bg-secondary); border-radius:var(--radius-sm); border: 1px solid ${isEval ? 'var(--success)' : 'transparent'};">
                            <div style="display:flex; align-items:center; gap:12px; flex: 1; min-width: 0;">
                                <div style="width:40px;height:40px;border-radius:50%;background:${isEval ? 'var(--success)' : 'var(--border-color)'};display:flex;align-items:center;justify-content:center;color:${isEval ? 'white' : 'var(--text-muted)'};font-weight:600;font-size:1rem; flex-shrink:0;">${ins.name[0] || '?'}</div>
                                <div style="min-width: 0;">
                                    ${(() => {
                let nameStr = String(ins.name || '').trim();
                let nameTokens = nameStr.split(/\s+/);
                let htmlName = `<div style="font-weight:600; font-size:0.95rem; color:${isEval ? 'var(--success)' : 'inherit'}; line-height: 1.3;">${ins.name}</div>`;
                if (nameTokens.length > 1) {
                    let splitIndex = nameTokens.length >= 3 ? 2 : 1;
                    let fName = nameTokens.slice(0, splitIndex).join(' ');
                    let lName = nameTokens.slice(splitIndex).join(' ');
                    htmlName = `<div style="font-weight:600; font-size:0.95rem; color:${isEval ? 'var(--success)' : 'inherit'}; line-height: 1.3;">${fName}</div>
                                <div style="font-weight:500; font-size:0.95rem; color:${isEval ? 'var(--success)' : 'var(--text-primary)'}; line-height: 1.2; margin-top:2px; white-space:nowrap;">${lName}</div>`;
                }
                return htmlName;
            })()}
                                    <div style="font-size:0.8rem; color:var(--text-muted); margin-top:4px;">
                                        ID: ${ins.id} · ${isEval ? '<span style="color:var(--success)">✓ ทำการประเมินแล้ว</span>' : 'ยังไม่ได้ประเมิน'}
                                    </div>
                                </div>
                            </div>
                            <div style="display:flex; flex-direction:column; gap:6px; width: 155px; flex-shrink: 0;">
                                ${isEval
                ? (isEval.skipped
                    ? `<button class="btn btn-sm" style="border:1px solid var(--warning); color:var(--warning); background:transparent; width:100%; padding: 6px 8px; font-size: 0.85rem;" onclick="openInstructorEvalModal('${ins.id.replace(/'/g, "\\\\'").replace(/"/g, '\\\\"')}', '${item.code}', '${item.name.replace(/'/g, "\\\\'").replace(/"/g, '\\\\"')}')">ยกเลิก (เปลี่ยนเป็นประเมิน)</button>`
                    : '<button class="btn btn-sm" disabled style="opacity:0.5; background:var(--success); color:white; border:none; cursor:not-allowed; width:100%; padding: 6px 8px; font-size: 0.85rem;">ประเมินแล้ว</button>')
                : `<button class="btn btn-primary btn-sm" style="width:100%; padding: 6px 8px; font-size: 0.9rem;" onclick="openInstructorEvalModal('${ins.id.replace(/'/g, "\\\\'").replace(/"/g, '\\\\"')}', '${item.code}', '${item.name.replace(/'/g, "\\\\'").replace(/"/g, '\\\\"')}')">ทำแบบประเมิน</button>
                                       <button class="btn btn-sm" style="border:1px solid var(--border-color); color:var(--text-muted); background:white; width:100%; padding: 4px 6px; font-size: 0.8rem; line-height: 1.2;" onclick="quickSkipInstructor('${ins.id.replace(/'/g, "\\\\'").replace(/"/g, '\\\\"')}', '${item.code}', '${item.name.replace(/'/g, "\\\\'").replace(/"/g, '\\\\"')}')">ไม่ได้เรียนกับอาจารย์ท่านนี้</button>`
            }
                            </div>
                        </div>`;
    }).join('')}
                    </div>
                </div>
            </div>`).join('') : `
            <div class="card"><div class="card-body" style="text-align:center; padding:40px; color:var(--text-muted);">
                <p>ยังไม่มีข้อมูลอาจารย์ผู้สอนในระบบ</p>
                <p style="font-size:0.85rem;">กรุณาเพิ่มข้อมูลในระบบ "CourseInstructors"</p>
            </div></div>`}
        </div>
    </div>`;
};

// ============================
// Wizard State Management
// ============================
let wizardState = {};

window.startCourseEvalWizard = function (courseCode, courseName) {
    // Get per-course questions from EvalQuestions sheet, including common questions (ALL, *, or blank)
    const allQuestions = (MOCK.evalQuestions || []).filter(q => {
        const cCode = String(q.course_code || '').trim().toUpperCase();
        return cCode === String(courseCode).trim().toUpperCase() || cCode === 'ALL' || cCode === '*' || cCode === '';
    });

    // Group questions by category/section
    const sections = {};
    const sectionOrder = ['course_structure', 'pre_learning', 'post_learning', 'clo', 'llo'];
    const sectionLabels = {
        'course_structure': 'โครงสร้างรายวิชา',
        'pre_learning': 'คำถามก่อนเรียน',
        'post_learning': 'คำถามหลังเรียน ท่านคิดว่าท่านมีความสามารถตามผลลัพธ์การเรียนรู้ที่คาดหวังของรายวิชาในแต่ละข้อ เท่าใด',
        'clo': 'CLO (Course Learning Outcomes)',
        'llo': 'LLO (Lesson Learning Outcomes)'
    };

    allQuestions.forEach(q => {
        const cat = String(q.category && q.category !== '-' ? q.category : (q.section && q.section !== '-' ? q.section : 'course_structure')).trim().toLowerCase().replace(/\s+/g, '_');
        if (!sections[cat]) {
            sections[cat] = {
                label: sectionLabels[cat] || (q.category && q.category !== '-' ? q.category : (q.section && q.section !== '-' ? q.section : cat)),
                questions: []
            };
        }
        sections[cat].questions.push({
            id: q.question_id,
            text: q.question_text
        });
    });

    // If sheet has no questions, use fallback questions
    const orderedSections = [];
    sectionOrder.forEach(key => {
        if (sections[key]) orderedSections.push({ key, ...sections[key] });
    });
    // Add any remaining sections not in sectionOrder
    Object.keys(sections).forEach(key => {
        if (!sectionOrder.includes(key)) orderedSections.push({ key, ...sections[key] });
    });

    // Fallback if no questions found
    if (orderedSections.length === 0) {
        orderedSections.push({
            key: 'course_structure',
            label: 'โครงสร้างรายวิชา',
            questions: [
                { id: 1, text: 'ผลลัพธ์การเรียนรู้รายวิชาชัดเจน' },
                { id: 2, text: 'หน่วยกิตของรายวิชามีความเหมาะสม' },
                { id: 3, text: 'การปฐมนิเทศรายวิชามีความชัดเจน' },
                { id: 4, text: 'รายวิชาจัดให้มีการประเมินผู้เรียนก่อนเข้าเรียน (Placement test)' },
                { id: 5, text: 'ความพึงพอใจโดยรวมต่อรายวิชา' }
            ]
        });
    }

    // Get instructors for this course
    const instructors = (MOCK.courseInstructors || [])
        .filter(ci => String(ci.course_code || '').trim() === String(courseCode).trim())
        .map(ci => ({
            id: String(ci.instructor_id || ci.instructor_name || '').trim(),
            name: getInstructorDisplayName(ci.instructor_id || ci.instructor_name)
        }))
        .filter(ins => ins.id);

    // Deduplicate by ID
    const uniqueInstructors = [];
    const seenIds = new Set();
    instructors.forEach(ins => {
        if (!seenIds.has(ins.id)) {
            seenIds.add(ins.id);
            uniqueInstructors.push(ins);
        }
    });

    // Add instructor evaluation sections
    const instQuestions = MOCK.evalInstructorQuestions || [];
    if (instQuestions.length === 0) {
        // Default instructor questions
        instQuestions.push(
            { question_id: 1, question_text: 'เนื้อหาตอดคล้องกับวัตถุประสงค์' },
            { question_id: 2, question_text: 'เนื้อหาเหมาะสมกับเวลา' },
            { question_id: 3, question_text: 'สื่อการสอนชัดเจนและตอดคล้องกับเนื้อหา' },
            { question_id: 4, question_text: 'ชี้แจงผลลัพธ์การเรียนรู้ กิจกรรมการเรียนการสอน และการประเมินผลลัพธ์การเรียนรู้' },
            { question_id: 5, question_text: 'การสอนของอาจารย์ทำให้นักศึกษาบรรลุผลลัพธ์การเรียนรู้รายวิชา' },
            { question_id: 6, question_text: 'เทคนิคการสอนทำให้นักศึกษาเข้าใจง่าย' }
        );
    }

    // Build wizard pages: course sections + instructor sections
    const wizardPages = [];

    // Course evaluation pages
    orderedSections.forEach(section => {
        wizardPages.push({
            type: 'course',
            key: section.key,
            label: section.label,
            questions: section.questions
        });
    });

    wizardState = {
        courseCode,
        courseName,
        pages: wizardPages,
        currentPage: 0,
        scores: {},
        instructorSkipped: {},
        comments: {}
    };

    renderWizardPage();
};

function renderWizardPage() {
    const ws = wizardState;
    if (!ws.pages || !ws.pages[ws.currentPage]) return;

    const page = ws.pages[ws.currentPage];
    const totalPages = ws.pages.length;
    const pageNum = ws.currentPage + 1;
    const progressPercent = Math.round((pageNum / totalPages) * 100);

    const isInstructor = page.type === 'instructor';
    const currentInstId = isInstructor ? page.instructorId : null;
    const isSkipped = isInstructor && ws.instructorSkipped[currentInstId];

    let questionsHtml = '';
    if (isInstructor) {
        questionsHtml = `
        <div style="display:flex; align-items:center; justify-content:space-between; padding:10px 16px; background:var(--bg-tertiary); border-radius:var(--radius-md); margin-bottom:12px;">
            <span style="font-weight:500; font-size:0.95rem;">ฉันไม่ได้เรียนกับอาจารย์ท่านนี้</span>
            <label style="position:relative; display:inline-block; width:48px; height:26px; cursor:pointer;">
                <input type="checkbox" ${isSkipped ? 'checked' : ''} onchange="toggleInstructorSkip('${currentInstId.replace(/'/g, "\\\\'")}', this.checked)" style="opacity:0;width:0;height:0;">
                <span style="position:absolute;inset:0;background:${isSkipped ? 'var(--accent-primary)' : 'var(--border-color)'};border-radius:26px;transition:0.3s;"></span>
                <span style="position:absolute;left:${isSkipped ? '24px' : '3px'};top:3px;width:20px;height:20px;background:white;border-radius:50%;transition:0.3s;box-shadow:0 1px 3px rgba(0,0,0,0.2);"></span>
            </label>
        </div>`;
    }

    if (!isSkipped) {
        page.questions.forEach((q, i) => {
            const scoreKey = `${page.key}_${q.id}`;
            const currentVal = ws.scores[scoreKey];
            const isText = String(q.text).includes('ข้อเสนอแนะ') || String(q.id).toLowerCase().includes('text');
            const likertLabels = ['น้อยที่สุด', 'น้อย', 'ปานกลาง', 'มาก', 'มากที่สุด'];

            questionsHtml += `
            <div id="q_container_${i}" style="margin-bottom:12px; padding:12px 16px; background:var(--bg-secondary); border-radius:var(--radius-md); border:2px solid transparent; transition:0.3s;">
                <label style="font-size:0.92rem; font-weight:500; display:block; margin-bottom:8px; color:var(--text-primary); line-height:1.3;">
                    ${i + 1}. ${q.text} <span style="color:var(--danger)">${isText ? '(ไม่บังคับ)' : '*'}</span>
                </label>
                ${isText ? `
                    <textarea class="form-control" placeholder="ข้อเสนอแนะเพิ่มเติม..." rows="2" onchange="setWizardText('${scoreKey}', this.value, ${i})" style="width:100%; border:1px solid var(--border-color); border-radius:var(--radius-sm); padding:10px; font-size:0.9rem;">${currentVal || ''}</textarea>
                ` : `
                    <div style="display:grid; grid-template-columns:repeat(5, 1fr); gap:6px; max-width:100%;" id="likert_${i}">
                        ${[1, 2, 3, 4, 5].map(s => `
                            <button type="button" class="likert-btn"
                                    onclick="setWizardScore('${scoreKey}', ${s}, ${i}); document.getElementById('q_container_${i}').style.borderColor='transparent'; document.getElementById('q_container_${i}').style.background='var(--bg-secondary)';" 
                                    style="border:2px solid ${currentVal === s ? 'var(--accent-primary)' : 'var(--border-color)'}; 
                                           background:${currentVal === s ? 'var(--accent-primary)' : 'var(--bg-card)'}; 
                                           color:${currentVal === s ? 'white' : 'inherit'};">
                                <span style="font-weight:700; font-size:1.15rem; line-height:1;">${s}</span>
                                <span class="likert-btn-label">${likertLabels[s - 1]}</span>
                            </button>
                        `).join('')}
                    </div>
                `}
            </div>`;
        });
    } else {
        questionsHtml += `
        <div style="padding:40px; text-align:center; color:var(--text-muted);">
            <div style="font-size:2rem; margin-bottom:12px;">⏭️</div>
            <p>ข้ามการประเมินอาจารย์ท่านนี้</p>
        </div>`;
    }

    const sectionColor = isInstructor ? '#e74c3c' : '#3498db';

    const modalHtml = `
    <div>
        <div style="position: sticky; top: -16px; z-index: 100; background: var(--bg-modal); padding: 4px 20px 4px 20px; margin: -16px -20px 0 -20px;">
            <div style="width:100%; height:3px; background:var(--bg-tertiary); border-radius:2px; margin-bottom:6px; overflow:hidden;">
                <div style="width:${progressPercent}%; height:100%; background:var(--accent-primary); border-radius:2px; transition:width 0.3s;"></div>
            </div>

            <div style="background:var(--bg-tertiary);padding:6px 12px;border-radius:var(--radius-sm);border-left:4px solid ${sectionColor}; box-shadow: 0 2px 8px rgba(0,0,0,0.03);">
                <div style="font-weight:700;font-size:1.1rem;color:var(--text-primary);margin-bottom:0;line-height:1.2;">${ws.courseCode} — ${ws.courseName}</div>
                <div style="font-size:1rem;color:${sectionColor};font-weight:600;display:flex;align-items:center;gap:6px;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                    <span>หัวข้อ: ${page.label}</span>
                </div>
            </div>
        </div>

        <div id="wizardQuestionsScrollArea" style="padding: 12px 0;">
            ${questionsHtml}
        </div>

        <div style="position: sticky; bottom: -16px; z-index: 100; background: var(--bg-modal); padding: 12px 20px 16px 20px; margin: 0 -20px -16px -20px; display:flex; justify-content:space-between; gap:12px; border-top: 1px solid var(--border-color);">
            <button class="btn btn-secondary" onclick="${ws.currentPage > 0 ? 'wizardPrev()' : 'closeModal()'}" style="flex:1;">
                ${ws.currentPage > 0 ? '← ย้อนกลับ' : '✕ ยกเลิก'}
            </button>
            <button class="btn btn-primary" onclick="${ws.currentPage < totalPages - 1 ? 'wizardNext()' : 'submitWizardEval()'}" style="flex:1;">
                ${ws.currentPage < totalPages - 1 ? 'หน้าถัดไป →' : '✓ ส่งแบบประเมิน'}
            </button>
        </div>
    </div>`;

    const mainTitle = ws.pages.length > 1 && ws.pages[ws.currentPage].type === 'instructor' ? 'ประเมินอาจารย์ผู้สอน' : 'ประเมินรายวิชา';
    openModal(mainTitle, modalHtml, `หน้า ${pageNum}/${totalPages} (${progressPercent}%)`);
}

window.setWizardText = function (scoreKey, text, questionIdx) {
    wizardState.scores[scoreKey] = text;
};

window.setWizardScore = function (scoreKey, score, questionIdx) {
    wizardState.scores[scoreKey] = score;
    // Re-render buttons for this question
    const container = document.getElementById('likert_' + questionIdx);
    if (container) {
        container.querySelectorAll('button').forEach((btn, idx) => {
            const s = idx + 1;
            btn.style.borderColor = score === s ? 'var(--accent-primary)' : 'var(--border-color)';
            btn.style.background = score === s ? 'var(--accent-primary)' : 'var(--bg-card)';
            btn.style.color = score === s ? 'white' : 'inherit';
        });
    }
};

window.toggleInstructorSkip = function (instructorId, checked) {
    wizardState.instructorSkipped[instructorId] = checked;
    renderWizardPage();
};

window.wizardNext = function () {
    // Validate current page
    const page = wizardState.pages[wizardState.currentPage];
    const isInstructor = page.type === 'instructor';
    const isSkipped = isInstructor && wizardState.instructorSkipped[page.instructorId];

    if (!isSkipped) {
        const unansweredIndices = [];
        const unanswered = page.questions.filter((q, i) => {
            const isText = String(q.text).includes('ข้อเสนอแนะ') || String(q.id).toLowerCase().includes('text');
            if (isText) return false; // Text fields are optional

            const scoreKey = `${page.key}_${q.id}`;
            if (!wizardState.scores[scoreKey]) {
                unansweredIndices.push(i);
                return true;
            }
            return false;
        });

        if (unanswered.length > 0) {
            unansweredIndices.forEach(idx => {
                const el = document.getElementById('q_container_' + idx);
                if (el) {
                    el.style.borderColor = 'var(--danger)';
                    el.style.background = '#fff5f5';
                }
            });

            const firstUnansweredEl = document.getElementById('q_container_' + unansweredIndices[0]);
            if (firstUnansweredEl) firstUnansweredEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

            const alertMsg = `โปรดระบุคำตอบให้ครบถ้วน\n(คุณข้ามคำถามไป ${unanswered.length} ข้อ)`;
            if (typeof showToast === 'function') showToast(alertMsg, 'error');
            else alert(alertMsg);

            return;
        }
    }

    wizardState.currentPage++;
    renderWizardPage();
};

window.wizardPrev = function () {
    if (wizardState.currentPage > 0) {
        wizardState.currentPage--;
        renderWizardPage();
    }
};

window.submitWizardEval = async function () {
    // Validate last page
    const lastPage = wizardState.pages[wizardState.currentPage];
    const isInstructor = lastPage.type === 'instructor';
    const isSkipped = isInstructor && wizardState.instructorSkipped[lastPage.instructorId];

    if (!isSkipped) {
        const unansweredIndices = [];
        const unanswered = lastPage.questions.filter((q, i) => {
            const isText = String(q.text).includes('ข้อเสนอแนะ') || String(q.id).toLowerCase().includes('text');
            if (isText) return false;

            const scoreKey = `${lastPage.key}_${q.id}`;
            if (!wizardState.scores[scoreKey]) {
                unansweredIndices.push(i);
                return true;
            }
            return false;
        });
        if (unanswered.length > 0) {
            unansweredIndices.forEach(idx => {
                const el = document.getElementById('q_container_' + idx);
                if (el) {
                    el.style.borderColor = 'var(--danger)';
                    el.style.background = '#fff5f5';
                }
            });
            const firstUnansweredEl = document.getElementById('q_container_' + unansweredIndices[0]);
            if (firstUnansweredEl) firstUnansweredEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

            const alertMsg = `โปรดระบุคำตอบให้ครบถ้วน\n(คุณข้ามคำถามไป ${unanswered.length} ข้อ)`;
            if (typeof showToast === 'function') showToast(alertMsg, 'error');
            else alert(alertMsg);

            return;
        }
    }

    const studentId = MOCK.student ? (MOCK.student.studentId || MOCK.student.id) : '';
    showApiLoading('กำลังบันทึกผลการประเมิน...');

    try {
        // Submit course evaluation (all course-type scores)
        const courseScores = {};
        wizardState.pages.filter(p => p.type === 'course').forEach(p => {
            p.questions.forEach(q => {
                const key = `${p.key}_${q.id}`;
                courseScores[key] = wizardState.scores[key] || 0;
            });
        });

        await postData('submitEvaluation', {
            type: 'course',
            studentId: studentId,
            courseCode: wizardState.courseCode,
            courseName: wizardState.courseName,
            scores: courseScores,
            comment: ''
        });

        // Save locally
        if (!MOCK.evaluations) MOCK.evaluations = [];
        MOCK.evaluations.push({
            type: 'course',
            studentId: studentId,
            courseCode: wizardState.courseCode,
            courseName: wizardState.courseName,
            scores: JSON.stringify(courseScores),
            date: new Date().toISOString().split('T')[0]
        });

        // Submit instructor evaluations
        for (const page of wizardState.pages.filter(p => p.type === 'instructor')) {
            const skipped = wizardState.instructorSkipped[page.instructorId];
            const instScores = {};
            if (!skipped) {
                page.questions.forEach(q => {
                    const key = `${page.key}_${q.id}`;
                    instScores[key] = wizardState.scores[key] || 0;
                });
            }

            await postData('submitEvaluation', {
                type: 'instructor',
                studentId: studentId,
                courseCode: wizardState.courseCode,
                courseName: wizardState.courseName,
                instructor: page.instructorId, // Send ID
                scores: instScores,
                skipped: skipped,
                comment: ''
            });

            MOCK.evaluations.push({
                type: 'instructor',
                studentId: studentId,
                courseCode: wizardState.courseCode,
                courseName: wizardState.courseName,
                instructor: page.instructorId,
                scores: JSON.stringify(instScores),
                skipped: skipped,
                date: new Date().toISOString().split('T')[0]
            });
        }

        hideApiLoading();
        closeModal();

        // Show success
        openModal('สำเร็จ', `
            <div style="text-align:center;padding:20px;">
                <div style="font-size:3rem;margin-bottom:12px">✅</div>
                <h3 style="margin-bottom:8px">ส่งแบบประเมินสำเร็จ</h3>
                <p style="color:var(--text-muted)">ขอขอบคุณที่ให้ข้อเสนอแนะเพื่อพัฒนาการเรียนการสอน</p>
                <button class="btn btn-primary" style="margin-top:16px" onclick="closeModal(); renderPage();">ปิด</button>
            </div>
        `);
    } catch (err) {
        hideApiLoading();
        alert('เกิดข้อผิดพลาดในการบันทึก: ' + err.message);
    }
};

// ============================
// Instructor Modal (Standalone)
// ============================
window.openInstructorEvalModal = function (instructorId, courseCode, courseName) {
    const instName = getInstructorDisplayName(instructorId);
    const instQuestions = MOCK.evalInstructorQuestions || [];
    const questions = instQuestions.length > 0
        ? instQuestions.map(q => ({ id: q.question_id, text: q.question_text }))
        : [
            { id: 1, text: 'เนื้อหาตอดคล้องกับวัตถุประสงค์' },
            { id: 2, text: 'เนื้อหาเหมาะสมกับเวลา' },
            { id: 3, text: 'สื่อการสอนชัดเจนและตอดคล้องกับเนื้อหา' },
            { id: 4, text: 'ชี้แจงผลลัพธ์การเรียนรู้ กิจกรรมการเรียนการสอน และการประเมินผลลัพธ์การเรียนรู้' },
            { id: 5, text: 'การสอนของอาจารย์ทำให้นักศึกษาบรรลุผลลัพธ์การเรียนรู้รายวิชา' },
            { id: 6, text: 'เทคนิคการสอนทำให้นักศึกษาเข้าใจง่าย' }
        ];

    let currentScores = {};
    let skipped = false;

    const buildHtml = () => `
    <div>
        <div style="position: sticky; top: -16px; z-index: 100; background: var(--bg-modal); padding: 4px 20px 4px 20px; margin: -16px -20px 0 -20px;">
            <div style="background:var(--bg-tertiary);padding:6px 12px;border-radius:var(--radius-sm);margin-bottom:6px; box-shadow: 0 2px 8px rgba(0,0,0,0.03);">
                <div style="font-weight:600;font-size:1.1rem;color:var(--accent-primary)">${instName}</div>
                <div style="font-size:0.82rem;color:var(--text-muted);margin-top:4px;">ID: ${instructorId} · วิชา: ${courseCode} ${courseName}</div>
            </div>
            
            <div style="display:flex; align-items:center; justify-content:space-between; padding:10px 16px; background:var(--bg-tertiary); border-radius:var(--radius-md);">
                <span style="font-weight:500; font-size:0.95rem;">ฉันไม่ได้เรียนกับอาจารย์ท่านนี้</span>
                <label style="position:relative; display:inline-block; width:48px; height:26px; cursor:pointer;">
                    <input type="checkbox" id="instSkipToggle" ${skipped ? 'checked' : ''} onchange="window._instSkipped=this.checked; document.getElementById('instQuestionsArea').style.display=this.checked?'none':'block'; document.getElementById('instSkipBg').style.background=this.checked?'var(--accent-primary)':'var(--border-color)'; document.getElementById('instSkipKnob').style.left=this.checked?'24px':'3px';" style="opacity:0;width:0;height:0;">
                    <span id="instSkipBg" style="position:absolute;inset:0;background:${skipped ? 'var(--accent-primary)' : 'var(--border-color)'};border-radius:26px;transition:0.3s;"></span>
                    <span id="instSkipKnob" style="position:absolute;left:${skipped ? '24px' : '3px'};top:3px;width:20px;height:20px;background:white;border-radius:50%;transition:0.3s;box-shadow:0 1px 3px rgba(0,0,0,0.2);"></span>
                </label>
            </div>
        </div>

        <div id="instQuestionsArea" style="padding: 12px 0;">
            ${questions.map((q, i) => {
        const likertLabels = ['น้อยที่สุด', 'น้อย', 'ปานกลาง', 'มาก', 'มากที่สุด'];
        const isText = String(q.text).includes('ข้อเสนอแนะ') || String(q.id).toLowerCase().includes('text');
        return `
            <div id="inst_q_container_${i}" style="margin-bottom:12px; padding:12px 16px; background:var(--bg-secondary); border-radius:var(--radius-md); border:2px solid transparent; transition:0.3s;">
                <label style="font-size:0.92rem; font-weight:500; display:block; margin-bottom:8px; line-height:1.3;">
                    ${i + 1}. ${q.text} <span style="color:var(--danger)">${isText ? '(ไม่บังคับ)' : '*'}</span>
                </label>
                ${isText ? `
                    <textarea class="form-control" placeholder="ข้อเสนอแนะเพิ่มเติม..." rows="2" onchange="window._instScores=window._instScores||{}; window._instScores['q_${q.id}']=this.value;" style="width:100%; border:1px solid var(--border-color); border-radius:var(--radius-sm); padding:10px; font-size:0.9rem;"></textarea>
                ` : `
                    <div style="display:grid; grid-template-columns:repeat(5, 1fr); gap:6px; max-width:100%;" id="instLikert_${i}">
                        ${[1, 2, 3, 4, 5].map(s => `
                            <button type="button" class="likert-btn"
                                    onclick="window._instScores=window._instScores||{}; window._instScores['q_${q.id}']=${s}; document.getElementById('inst_q_container_${i}').style.borderColor='transparent'; document.getElementById('inst_q_container_${i}').style.background='var(--bg-secondary)'; document.querySelectorAll('#instLikert_${i} button').forEach((b,idx)=>{b.style.borderColor=idx===${s - 1}?'var(--accent-primary)':'var(--border-color)';b.style.background=idx===${s - 1}?'var(--accent-primary)':'var(--bg-card)';b.style.color=idx===${s - 1}?'white':'inherit';})" 
                                    style="border:2px solid var(--border-color); background:var(--bg-card);">
                                <span style="font-weight:700; font-size:1.15rem; line-height:1;">${s}</span>
                                <span class="likert-btn-label">${likertLabels[s - 1]}</span>
                            </button>
                        `).join('')}
                    </div>
                `}
            </div>`}).join('')}
        </div>

        <div style="position: sticky; bottom: -16px; z-index: 100; background: var(--bg-modal); padding: 12px 20px 16px 20px; margin: 0 -20px -16px -20px; border-top: 1px solid var(--border-color);">
            <button class="btn btn-primary" style="width:100%;font-size:1.05rem;padding:10px;" onclick="submitStandaloneInstructorEval('${instructorId.replace(/'/g, "\\\\'")}', '${courseCode}', '${courseName.replace(/'/g, "\\\\'")}')">ส่งแบบประเมินอาจารย์</button>
        </div>
    </div>`;

    window._instScores = {};
    window._instSkipped = false;
    openModal('ประเมินอาจารย์ผู้สอน', buildHtml());
};

window.submitStandaloneInstructorEval = async function (instructorId, courseCode, courseName) {
    const studentId = MOCK.student ? (MOCK.student.studentId || MOCK.student.id) : '';
    const skipped = window._instSkipped || false;
    const scores = window._instScores || {};

    // Check validation
    if (!skipped) {
        const instQuestions = MOCK.evalInstructorQuestions || [];
        const questionsList = instQuestions.length > 0 ? instQuestions.map(q => ({ id: q.question_id, text: q.question_text })) : [1, 2, 3, 4, 5, 6].map(id => ({ id, text: 'Question' }));
        let unansweredCount = 0;
        const unansweredIndices = [];

        questionsList.forEach((q, i) => {
            const isText = String(q.text).includes('ข้อเสนอแนะ') || String(q.id).toLowerCase().includes('text');
            if (!isText && !scores['q_' + q.id]) {
                unansweredCount++;
                unansweredIndices.push(i);
            }
        });

        if (unansweredCount > 0) {
            unansweredIndices.forEach(idx => {
                const el = document.getElementById('inst_q_container_' + idx);
                if (el) {
                    el.style.borderColor = 'var(--danger)';
                    el.style.background = '#fff5f5';
                }
            });
            const firstUnansweredEl = document.getElementById('inst_q_container_' + unansweredIndices[0]);
            if (firstUnansweredEl) firstUnansweredEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

            const alertMsg = `โปรดระบุคำตอบให้ครบถ้วน\n(คุณข้ามคำถามไป ${unansweredCount} ข้อ)`;
            if (typeof showToast === 'function') showToast(alertMsg, 'error');
            else alert(alertMsg);

            return;
        }
    }

    showApiLoading('กำลังบันทึกผลการประเมินอาจารย์...');

    await postData('submitEvaluation', {
        type: 'instructor',
        studentId: studentId,
        courseCode: courseCode,
        courseName: courseName,
        instructor: instructorId, // Send ID
        scores: scores,
        skipped: skipped,
        comment: ''
    });

    hideApiLoading();

    if (!MOCK.evaluations) MOCK.evaluations = [];
    MOCK.evaluations.push({
        type: 'instructor',
        studentId: studentId,
        courseCode: courseCode,
        instructor: instructorId,
        scores: JSON.stringify(scores),
        skipped: skipped,
        date: new Date().toISOString().split('T')[0]
    });
    closeModal();
    renderPage();
};

window.quickSkipInstructor = async function (instructorId, courseCode, courseName) {
    if (!confirm('คุณยืนยันที่จะ "ข้าม" การประเมินอาจารย์ท่านนี้ เนื่องจากไม่ได้เรียนด้วย ใช่หรือไม่?')) return;

    const studentId = MOCK.student ? (MOCK.student.studentId || MOCK.student.id) : '';
    showApiLoading('กำลังบันทึก...');

    try {
        await postData('submitEvaluation', {
            type: 'instructor',
            studentId: studentId,
            courseCode: courseCode,
            courseName: courseName,
            instructor: instructorId,
            scores: {},
            skipped: true,
            comment: ''
        });

        // Update locally
        if (!MOCK.evaluations) MOCK.evaluations = [];
        const existingIdx = MOCK.evaluations.findIndex(e => e.studentId === studentId && e.courseCode === courseCode && e.instructor === instructorId && e.type === 'instructor');
        if (existingIdx !== -1) {
            MOCK.evaluations[existingIdx].scores = '{}';
            MOCK.evaluations[existingIdx].skipped = true;
            MOCK.evaluations[existingIdx].date = new Date().toISOString().split('T')[0];
        } else {
            MOCK.evaluations.push({
                type: 'instructor',
                studentId: studentId,
                courseCode: courseCode,
                courseName: courseName,
                instructor: instructorId,
                scores: '{}',
                skipped: true,
                date: new Date().toISOString().split('T')[0]
            });
        }

        hideApiLoading();
        renderPage();
        if (typeof showToast === 'function') showToast('ข้ามการประเมินสำเร็จ', 'success');

    } catch (err) {
        hideApiLoading();
        alert('เกิดข้อผิดพลาดในการบันทึก: ' + err.message);
    }
};

