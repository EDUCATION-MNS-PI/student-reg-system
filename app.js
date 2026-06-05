﻿// ============================
// Main Application Controller
// (loaded AFTER core.js, data.js, and page scripts)
// ============================

let currentPage = 'dashboard';
window.apiDataLoaded = false;
window.APP_VERSION = "V.1.2 By Watcharaphon.c";

// Initialize or Restore session
const savedUser = localStorage.getItem('currentUser');
if (savedUser) {
    try {
        const { role, userData } = JSON.parse(savedUser);
        window.tempSession = { role, userData };
        // If student, the landing page should be their profile, not the dashboard
        if (role === 'student') {
            currentPage = 'student-dashboard';
        }
    } catch (e) {
        localStorage.removeItem('currentUser');
    }
}

// DOM Elements
const contentArea = document.getElementById('contentArea');
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const modalCloseBtn = document.getElementById('modalClose');

// ====== Navigation ======
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const page = item.dataset.page;
        if (page) navigateTo(page);
    });
});

function navigateTo(page) {
    currentPage = page;
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const activeNav = document.querySelector(`[data-page="${page}"]`);
    if (activeNav) activeNav.classList.add('active');
    renderPage();
    sidebar.classList.remove('mobile-open');
}

/**
 * check if current user role has permission for an action
 */
window.hasPermission = function (actionKey) {
    if (window.isSuperAdmin) return true; // Super Admin always YES
    if (!MOCK.permissions || MOCK.permissions.length === 0) return false;

    const rolePerms = MOCK.permissions.find(p => String(p.Role).toLowerCase() === String(window.currentUserRole).toLowerCase());
    if (!rolePerms) return false;

    return rolePerms[actionKey] === 'YES';
};

function renderPage() {
    if (!pages[currentPage]) {
        console.error('Page not found:', currentPage);
        currentPage = (window.currentUserRole === 'student') ? 'student-dashboard' : 'dashboard'; 
    }

    // Role-based Access Control: Prevent students from seeing the dashboard
    if (window.currentUserRole === 'student' && currentPage === 'dashboard') {
        currentPage = 'student-dashboard';
    }

    try {
        contentArea.innerHTML = pages[currentPage]();
        contentArea.scrollTop = 0;
        
        const initFn = window['init_' + currentPage.replace(/-/g, '_')];
        if (initFn) initFn();

        if (window.initThaiDatePickers) window.initThaiDatePickers();
    } catch (err) {
        console.error(`Error rendering page ${currentPage}:`, err);
        contentArea.innerHTML = `
            <div class="animate-in" style="padding:40px; text-align:center;">
                <div style="font-size:3rem; margin-bottom:20px;">⚠️</div>
                <h2 style="color:var(--danger-color); margin-bottom:10px;">เกิดข้อผิดพลาดในการแสดงผล</h2>
                <div style="background:#f8f9fa; padding:15px; border-radius:8px; font-family:monospace; font-size:0.85rem; color:var(--danger-color); margin-bottom:20px; text-align:left; overflow-x:auto;">
                    ${err.message}
                </div>
                <button class="btn btn-primary" onclick="navigateTo('dashboard')">กลับหน้าหลัก</button>
            </div>
        `;
    }
}

// ====== Notification Bell ======
const notifBtn = document.getElementById('notifBtn');
if (notifBtn) {
    notifBtn.addEventListener('click', () => {
        navigateTo('announcements');
        const badge = document.querySelector('.notif-badge');
        if (badge) badge.style.display = 'none';

        const latestId = MOCK.announcements && MOCK.announcements[0]?.id;
        if (latestId) localStorage.setItem('lastSeenAnnouncementId', latestId);
    });
}

// ====== Sidebar Toggle ======
sidebarToggle.addEventListener('click', () => sidebar.classList.toggle('collapsed'));
mobileMenuBtn.addEventListener('click', () => sidebar.classList.toggle('mobile-open'));

// ====== Theme Toggle ======
const themeToggleBtn = document.getElementById('themeToggleBtn');
if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => window.toggleTheme());
}

window.toggleTheme = function() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcons(newTheme);
};

function updateThemeIcons(theme) {
    const sun = document.querySelector('.sun-icon');
    const moon = document.querySelector('.moon-icon');
    if (sun && moon) {
        if (theme === 'dark') {
            sun.style.display = 'none';
            moon.style.display = 'block';
        } else {
            sun.style.display = 'block';
            moon.style.display = 'none';
        }
    }
}

// ====== Global DatePicker Init ======
window.initThaiDatePickers = function() {
    if (typeof flatpickr === 'undefined') return;
    
    // Find all uninitialized date inputs
    document.querySelectorAll('input[type="date"]').forEach(input => {
        if (input.classList.contains('flatpickr-input') || input.dataset.fpInitialized) return;
        input.dataset.fpInitialized = 'true';
        
        // Convert to text to disable browser's native picker which blocks BE year
        input.type = 'text';

        flatpickr(input, {
             locale: window.flatpickr?.l10ns?.th || 'th',
             dateFormat: "Y-m-d",
             altInput: true,
             altFormat: "d M Y_BE", // Placeholder to replace
             formatDate: (date, formatStr, locale) => {
                 // Intercept our custom string to push Buddhist Year
                 if (formatStr === 'd M Y_BE') {
                     const adStr = flatpickr.formatDate(date, "d M ", locale);
                     return adStr + (date.getFullYear() + 543);
                 }
                 return flatpickr.formatDate(date, formatStr, locale);
             },
             onReady: function(sl, st, instance) {
                 if (instance.currentYearElement) {
                     instance.currentYearElement.value = instance.currentYear + 543;
                     // Prevent user typing direct AD years and confusing the calendar
                     instance.currentYearElement.addEventListener('input', function(e) {
                         const v = parseInt(e.target.value);
                         if (v > 2400) { 
                             instance.changeYear(v - 543, false); 
                             e.target.value = v; 
                         }
                     });
                 }
             },
             onYearChange: function(sl, st, instance) {
                 setTimeout(() => { if (instance.currentYearElement) instance.currentYearElement.value = instance.currentYear + 543; }, 0);
             },
             onMonthChange: function(sl, st, instance) {
                 setTimeout(() => { if (instance.currentYearElement) instance.currentYearElement.value = instance.currentYear + 543; }, 0);
             }
         });
    });
};

// ====== Modal close button ======
modalCloseBtn.addEventListener('click', closeModal);
document.getElementById('modalOverlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('modalOverlay')) closeModal();
});

function updateHeaderSemester() {
    const el = document.getElementById('headerSemester');
    if (el) {
        let semText = window.CURRENT_SEMESTER === 1 ? 'ภาคเรียนที่ 1' : 
                      window.CURRENT_SEMESTER === 2 ? 'ภาคเรียนที่ 2' : 'ภาคฤดูร้อน';
        el.textContent = `${semText}/${window.CURRENT_ACADEMIC_YEAR}`;
    }
}

// ====== Boot ======
async function bootApp() {
    // Initial Theme Load
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcons(savedTheme);

    updateHeaderSemester();
    // Restore or Check Session
    if (window.currentUserRole) {
        // Session already active, do nothing
    } else if (window.tempSession) {
        // Restore from tempSession (initial script load)
        if (typeof applyLoginState === 'function') {
            applyLoginState(window.tempSession.role, window.tempSession.userData);
        }
        delete window.tempSession;
    } else {
        // Try to restore from localStorage directly or show login
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            try {
                const { role, userData } = JSON.parse(savedUser);
                if (typeof applyLoginState === 'function') {
                    applyLoginState(role, userData);
                }
            } catch (e) {
                if (typeof renderLoginUI === 'function') renderLoginUI();
            }
        } else {
            if (typeof renderLoginUI === 'function') renderLoginUI();
        }
    }

    if (typeof showApiLoading === 'function') {
        showApiLoading('กำลังโหลดข้อมูลเบื้องต้น...');
    }
    try {
        // Fetch all necessary data from Google Sheets API
        const allData = await fetchData('getAllData');
        if (!allData || allData.status === 'error') throw new Error(allData?.message || 'Failed to fetch data');

        const {
            users: usersData,
            students: studentsData,
            teachers: teachersData,
            courses: coursesData,
            enrollments: enrollmentsData,
            payments: paymentsData,
            evaluations: evaluationsData,
            documents: documentsData,
            announcements: announcementsData,
            exams: examsData,
            examCommittees: examCommitteesData,
            evalQuestions: evalQuestionsData,
            courseInstructors: courseInstructorsData,
            evalInstructorQuestions: evalInstructorQuestionsData,
            applicants: applicantsData,
            schedules: schedulesData,
            documentTemplates: documentTemplatesData,
            thesisProgress: thesisProgressData,
            graduationRequests: graduationRequestsData
        } = allData;

        MOCK.applicants = applicantsData || [];
        MOCK.documentTemplates = documentTemplatesData || [];
        MOCK.thesisProgress = thesisProgressData || [];
        MOCK.graduationRequests = graduationRequestsData || [];
        MOCK.allExams = examsData || []; 

        MOCK.schedule.items = (schedulesData || []).map(s => ({
            day: parseInt(s.Day) || 0,
            startSlot: parseInt(s.StartSlot) || 0,
            endSlot: parseInt(s.EndSlot) || 0,
            code: s.CourseCode || '',
            name: s.CourseName || '',
            room: s.Room || '',
            color: s.Color || 'blue',
            instructorId: s.InstructorID || '',
            instructorName: s.InstructorName || '',
            semester: s.Semester || '',
            academicYear: s.AcademicYear || '',
            section: s.Section || ''
        }));

        // Sync header semester badge with global state
        const headerSemEl = document.getElementById('headerSemester');
        if (headerSemEl) {
            headerSemEl.textContent = `${MOCK.activeSemester}/${MOCK.activeYear}`;
        }

        // Map Students and attach Grades from Enrollments
        if (studentsData && studentsData.length > 0) {
            MOCK.students = studentsData.map(s => {
                const sId = String(s['รหัสนักศึกษา'] || s.studentId || s.id || '').trim();

                // Find enrollments for this student (Robust matching)
                const studentEnrollments = (enrollmentsData || []).filter(e => {
                    const eId = String(e['รหัสนักศึกษา'] || e.student_id || e.studentId || '').trim();
                    return eId === sId && eId !== '';
                });

                if (studentEnrollments.length > 0) {
                    console.log(`[bootApp] Found ${studentEnrollments.length} enrollments for student ${sId}`);
                }
                
                // Group enrollments into student.grades format
                const gradesMap = {};
                studentEnrollments.forEach(e => {
                    const year = parseInt(e['ปีการศึกษา'] || e['academic_year'] || e.academicYear || '0');
                    const sem = parseInt(e['ภาคเรียน'] || e['semester'] || '0');
                    const semKey = `${year}_${sem}`;
                    const semName = `ภาคเรียนที่ ${sem}/${year}`;

                    const cGrade = String(e['เกรด'] || e['grade'] || '').trim();
                    const creditsRaw = String(e['หน่วยกิต'] || e['credits'] || '0').trim();
                    const cCredits = parseInt(creditsRaw.split('(')[0]) || 0;

                    let point = 0;
                    const g = cGrade.toUpperCase();
                    if (g === 'A') point = 4.0;
                    else if (g === 'B+') point = 3.5;
                    else if (g === 'B') point = 3.0;
                    else if (g === 'C+') point = 2.5;
                    else if (g === 'C') point = 2.0;
                    else if (g === 'D+') point = 1.5;
                    else if (g === 'D') point = 1.0;
                    else if (g === 'F') point = 0.0;

                    if (!gradesMap[semKey]) {
                        gradesMap[semKey] = { 
                            semester: semName, 
                            year: year,
                            term: sem,
                            gpa: 0, 
                            totalCredits: 0, 
                            gpaCredits: 0,
                            gpaPoints: 0,
                            courses: [] 
                        };
                    }

                    gradesMap[semKey].courses.push({
                        code: String(e['รหัสวิชา'] || e['course_code'] || '-').trim(),
                        name: String(e['ชื่อวิชา'] || e['course_name'] || '-').trim(),
                        credits: cCredits,
                        creditsDisplay: creditsRaw,
                        grade: cGrade,
                        point: point
                    });

                    // All credits count toward total (including Thesis)
                    gradesMap[semKey].totalCredits += cCredits;

                    // Exclude Thesis and non-GPA grades from GPA calculation
                    const courseName = String(e['course_name'] || e['ชื่อวิชา'] || '').trim();
                    const courseCode = String(e['course_code'] || e['รหัสวิชา'] || '').trim();
                    const isThesis = courseName.includes('วิทยานิพนธ์') || 
                                     courseName.toLowerCase().includes('thesis') ||
                                     courseCode.startsWith('1005002') ||
                                     courseCode.startsWith('1005003') ||
                                     courseCode.startsWith('1005004');
                    const isNonGPA = ['P', 'S', 'U', 'W', 'I'].includes(cGrade.toUpperCase());

                    if (!isThesis && !isNonGPA) {
                        gradesMap[semKey].gpaCredits += cCredits;
                        gradesMap[semKey].gpaPoints += (point * cCredits);
                    }
                });

                const finalGrades = Object.values(gradesMap)
                    .sort((a, b) => {
                        if (a.year !== b.year) return a.year - b.year;
                        return a.term - b.term;
                    })
                    .map(g => ({
                        semester: g.semester,
                        year: g.year,
                        term: g.term,
                        totalCredits: g.totalCredits,
                        gpa: g.gpaCredits > 0 ? (g.gpaPoints / g.gpaCredits) : 0,
                        courses: g.courses
                    }));

                // Overall Stats
                const allCourses = finalGrades.flatMap(g => g.courses);
                const overallCredits = allCourses.reduce((sum, c) => sum + (c.credits || 0), 0);
                
                // GPA excludes Thesis and non-GPA grades
                const gpaCourses = allCourses.filter(c => {
                    const isThesis = (c.name || '').includes('วิทยานิพนธ์') || (c.name || '').toLowerCase().includes('thesis') ||
                                     (c.code || '').startsWith('1005002') || (c.code || '').startsWith('1005003') || (c.code || '').startsWith('1005004');
                    const isNonGPA = ['P', 'S', 'U', 'W', 'I'].includes(String(c.grade || '').toUpperCase());
                    return !isThesis && !isNonGPA;
                });
                const overallGpaCredits = gpaCourses.reduce((sum, c) => sum + (c.credits || 0), 0);
                const overallGpaPoints = gpaCourses.reduce((sum, c) => sum + ((c.point || 0) * (c.credits || 0)), 0);
                const overallGpa = overallGpaCredits > 0 ? (overallGpaPoints / overallGpaCredits) : 0;

                return {
                    id: sId || s['เลขประจำตัวประชาชน'] || s['เลขบัตรประชาชน'] || s.id,
                    studentId: sId,
                    citizenId: s['เลขประจำตัวประชาชน'] || s.citizenId || '',
                    prefix: s['คำนำหน้า'] || s.prefix,
                    firstName: s['ชื่อ (ไทย)'] || s['ชื่อ'] || s.firstName,
                    lastName: s['นามสกุล (ไทย)'] || s['นามสกุล'] || s.lastName,
                    firstNameEn: s['ชื่อ (LN)'] || s['firstNameEn'] || s['ชื่อ (EN)'] || '',
                    lastNameEn: s['นามสกุล (LN)'] || s['lastNameEn'] || s['นามสกุล (EN)'] || '',
                    faculty: s['คณะ'] || s.faculty,
                    department: s['สาขาวิชา'] || s.department,
                    major: s['สาขาวิชา'] || s.department || s.major || '-',
                    cohort: s['รุ่น'] || s.cohort || (sId ? sId.substring(0, 2) : '-'),
                    program: s['หลักสูตร'] || s.program,
                    year: parseInt(s['ชั้นปี'] || s.year) || 1,
                    status: s['สถานะ'] || s.status || 'กำลังศึกษา',
                    admissionYear: s['ปีการศึกษาที่เข้า'] || s['admissionYear'] || s['ปีการศึกษา'] || s['ปีที่เข้าศึกษา'] || s.admissionYear,
                    advisor: s['อาจารย์ที่ปรึกษา (ทั่วไป)'] || s['อาจารย์ที่ปรึกษา'] || s.advisor || '-',
                    thesisAdvisor: s['อาจารย์ที่ปรึกษาวิทยานิพนธ์'] || s.thesisAdvisor || '-',
                    mainAdvisor: s['อาจารย์ที่ปรึกษาหลัก'] || s.mainAdvisor || '-',
                    coAdvisorInternal: s['อาจารย์ที่ปรึกษาร่วมภายใน'] || s.coAdvisorInternal || '-',
                    coAdvisorExternal: s['อาจารย์ที่ปรึกษาร่วมภายนอก'] || s.coAdvisorExternal || '-',
                    thesisTopic: s['หัวข้อวิทยานิพนธ์'] || s.thesisTopic || '-',
                    thesisInfo: { title: s['หัวข้อวิทยานิพนธ์'] || '', titleEn: '' },
                    email: s['E-mail ของสถาบัน'] || s['อีเมล'] || s.email || '-',
                    personalEmail: s['ที่อยู่อีเมล'] || s['อีเมลส่วนตัว'] || s.personalEmail || '-',
                    phone: s['เบอร์โทร'] || s['โทรศัพท์'] || s.phone || '-',
                    workplace: s['สถานที่ปฏิบัติงาน'] || s.workplace || '-',
                    position: s['ตำแหน่ง'] || s.position || '-',
                    dob: s['วันเกิด (YYYY-MM-DD)'] || s['วันเกิด'] || s.dob || '-',
                    address: s['ที่อยู่'] || s.address || '-',
                    gender: s['เพศ'] || s.gender || 'ไม่ระบุ',
                    parentName: s['ผู้ปกครอง'] || s.parentName || '-',
                    parentPhone: s['เบอร์ผู้ปกครอง'] || s.parentPhone || '-',
                    gpa: overallGpa,
                    totalCredits: overallCredits,
                    requiredCredits: parseInt(s['หน่วยกิตที่ต้องเรียน']) || s.requiredCredits || 36,
                    grades: finalGrades,
                    exams: (examsData || []).filter(ex => String(ex.student_id || '').trim() === sId)
                };
            });
        }

        if (teachersData && teachersData.length > 0) {
            const allMappedTeachers = teachersData.map(t => {
                // Robust name resolution
                let fullName = t.Name || t.name || '';
                if (!fullName) {
                    fullName = (t['คำนำหน้า'] || '') + (t['ชื่อ'] ? (' ' + t['ชื่อ']) : '') + (t['นามสกุล'] ? (' ' + t['นามสกุล']) : '');
                }
                if (!fullName) {
                    fullName = (t.prefix || '') + (t.firstName ? (' ' + t.firstName) : '') + (t.lastName ? (' ' + t.lastName) : '');
                }

                return {
                    name: fullName.trim() || 'ไม่ระบุชื่อ',
                    position: t['ตำแหน่งทางวิชาการ'] || t['ตำแหน่ง'] || t.position || t.Position || 'อาจารย์',
                    expertise: t['ความเชี่ยวชาญ'] || t.expertise || t.Expertise || '-',
                    email: t['อีเมล'] || t.email || t.Email || '-',
                    phone: t['เบอร์โทร'] || t['โทรศัพท์'] || t.phone || t.Phone || '-',
                    studentCount: parseInt(t['นศ. ในที่ปรึกษา'] || t['นศ.ในที่ปรึกษา'] || t.studentCount || t.StudentCount) || 0,
                    faculty: t['คณะ/สังกัด'] || t['คณะ'] || t.faculty || t.Faculty || 'คณะพยาบาลศาสตร์',
                    username: t['Username'] || t.username,
                    password: t['Password'] || t.password,
                    type: t['ประเภทอาจารย์'] || t.type || t.Type || 'อาจารย์ประจำ'
                };
            });

            // Filter for different roles/views
            MOCK.teachers = allMappedTeachers;
            MOCK.academicAdvisors = allMappedTeachers.filter(t => t.type === 'อาจารย์ประจำ');
            MOCK.specialLecturers = allMappedTeachers.filter(t => t.type === 'อาจารย์พิเศษ');
            
            // If academic advisors list is empty (e.g. initial setup), fall back to all teachers for compatibility
            if (MOCK.academicAdvisors.length === 0) MOCK.academicAdvisors = allMappedTeachers;
            
            MOCK.thesisAdvisors = []; // Start empty, only fill if student-specific data exists
        }

        if (usersData && usersData.length > 0) {
            MOCK.users = usersData.map(u => ({
                ...u, // Keep all dynamic fields
                username: u['Username'] || u.username,
                password: u['Password'] || u.password,
                name: u['Name'] || u.name,
                role: u['Role'] || u.role,
                status: u['Status'] || u.status || 'ใช้งาน'
            }));
            console.log('Successfully loaded Users from Sheet:', MOCK.users);
        } else {
            console.warn('No users found in Google Sheets data.');
        }

        if (coursesData && coursesData.length > 0) {
            MOCK.courses = coursesData.map(c => ({
                code: c['รหัสวิชา'] || c.code,
                name: c['ชื่อวิชา'] || c.name,
                credits: parseInt(c['หน่วยกิต'] || c.credits) || 0,
                semester: c['ภาคการศึกษา'] || c.semester || '',
                year: c['ปีการศึกษา'] || c.academicYear || c.year || '',
                group: c['กลุ่ม'] || c.group || '',
                instructor: c['อาจารย์ผู้สอน'] || c.instructor || '-',
                seats: parseInt(c['จำนวนรับ'] || c.seats) || 30,
                enrolled: parseInt(c['ลงทะเบียนแล้ว'] || c.enrolled) || 0,
                schedule: c['วัน-เวลาเรียน'] || c.schedule || '-',
                room: c['ห้องเรียน'] || c.room || '-',
                type: c['หมวดหมู่'] || c.type || 'แกน',
                status: c['สถานะ'] || c.status || 'เปิด'
            }));
        }

        // MOCK.enrollments is now handled within student mapping in bootApp
        // if (enrollmentsData && enrollmentsData.length > 0) {
        //     MOCK.enrollments = enrollmentsData;
        // }

        if (paymentsData && paymentsData.length > 0) {
            MOCK.payments = paymentsData.map(p => ({
                id: p['รหัสอ้างอิง'] || p.id,
                description: p['รายการ'] || p.description,
                amount: parseFloat(p['จำนวนเงิน'] || p.amount) || 0,
                dueDate: p['วันที่ครบกำหนด'] || p.dueDate,
                paidDate: p['วันที่ชำระ'] || p.paidDate,
                status: p['สถานะ'] || p.status,
                type: p['ประเภท'] || p.type
            }));
        }

        if (evaluationsData && evaluationsData.length > 0) {
            MOCK.evaluations = evaluationsData.map(e => ({
                id: e.id || e['id'],
                type: e.type || e['type'] || 'course',
                studentId: e.student_id || e['student_id'] || e.studentId,
                courseCode: e.course_code || e['course_code'] || e['รหัสวิชา'] || e.courseCode,
                courseName: e.course_name || e['course_name'],
                instructor: e.instructor || e['instructor'],
                scores: e.scores || e['scores'] || '{}',
                comment: e.comment || e['comment'] || '',
                skipped: e.skipped === 'true' || e.skipped === true,
                date: e.date || e['date'] || ''
            }));
        }

        // Load evaluation questions (per-course)
        if (evalQuestionsData && evalQuestionsData.length > 0) {
            MOCK.evalQuestions = evalQuestionsData;
        }

        // Load course-instructor mapping
        if (courseInstructorsData && courseInstructorsData.length > 0) {
            MOCK.courseInstructors = courseInstructorsData;
        }

        // Load instructor evaluation questions
        if (evalInstructorQuestionsData && evalInstructorQuestionsData.length > 0) {
            MOCK.evalInstructorQuestions = evalInstructorQuestionsData;
        }

        if (documentsData && documentsData.length > 0) {
            MOCK.documents = documentsData.map(d => {
                const sId = String(d['รหัสนักศึกษา'] || d['รหัสประจำตัว'] || d.studentId || d.id || '').trim();
                const name = d['ชื่อผู้ส่ง'] || d['ชื่อ-นามสกุล'] || d.senderName;
                const type = d['ประเภทเอกสาร'] || d['ประเภท'] || d.documentType;
                const dateRaw = d['วันที่ส่ง'] || d['วันที่'] || d.date;
                const trackId = d['รหัสติดตาม'] || d.id;

                return {
                    studentId: sId || 'Unknown',
                    senderName: name || 'Unknown',
                    documentType: type || 'คำร้องทั่วไป',
                    fileName: d['ชื่อไฟล์'] || d.fileName || 'document.pdf',
                    fileUrl: d['ลิงก์เอกสาร'] || d.fileUrl || '',
                    signedFileUrl: d['ลิงก์เอกสารที่ลงนาม'] || d.signedFileUrl || '',
                    date: dateRaw,
                    status: d['สถานะ'] || d.status || 'รอตรวจสอบ',
                    nextStep: d['ผู้รับผิดชอบถัดไป'] || d.nextStep || 'เจ้าหน้าที่งานทะเบียน',
                    note: d['หมายเหตุ'] || d.note || '',
                    history: d['ประวัติการดำเนินการ'] || d.history || '[]',
                    id: trackId || ('DOC-' + new Date().getTime())
                };
            });

            // Populate studentDocuments for all users, but filter if student is logged in
            let docsToMap = MOCK.documents;
            if (window.currentUserRole === 'student' && window.currentUserData) {
                const sId = String(window.currentUserData.username || window.currentUserData.id || '').trim();
                docsToMap = MOCK.documents.filter(d => String(d.studentId || '').trim() === sId);
            }
            MOCK.studentDocuments = docsToMap.map(d => {
                let displayDate = String(d.date || '-');
                try {
                    const dateObj = new Date(d.date);
                    if (!isNaN(dateObj.getTime())) {
                        const day = String(dateObj.getDate()).padStart(2, '0');
                        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                        let year = dateObj.getFullYear();
                        if (year < 2400) year += 543;
                        const hours = String(dateObj.getHours()).padStart(2, '0');
                        const minutes = String(dateObj.getMinutes()).padStart(2, '0');
                        displayDate = `${day}/${month}/${year} ${hours}:${minutes} น.`;
                    }
                } catch (e) {}

                let lastUpdate = displayDate;
                try {
                    const hist = JSON.parse(d.history || '[]');
                    if (hist.length > 0 && hist[hist.length - 1].timestamp) {
                        lastUpdate = hist[hist.length - 1].timestamp;
                    }
                } catch (e) {}

                return {
                    id: d.id,
                    studentId: d.studentId,
                    senderName: d.senderName,
                    formName: d.documentType,
                    submitDate: displayDate,
                    lastUpdate: lastUpdate,
                    status: d.status,
                    attachment: d.fileName,
                    fileUrl: d.fileUrl,
                    signedFileUrl: d.signedFileUrl,
                    note: d.note,
                    history: d.history
                };
            });

            // Sync for Admin view
            MOCK.adminDocuments = MOCK.documents.map((d) => {
                let displayDate = String(d.date || '-');
                try {
                    const dateObj = new Date(d.date);
                    if (!isNaN(dateObj.getTime())) {
                        const day = String(dateObj.getDate()).padStart(2, '0');
                        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                        let year = dateObj.getFullYear();
                        if (year < 2400) year += 543;
                        const hours = String(dateObj.getHours()).padStart(2, '0');
                        const minutes = String(dateObj.getMinutes()).padStart(2, '0');
                        displayDate = `${day}/${month}/${year} ${hours}:${minutes} น.`;
                    }
                } catch (e) {}
                
                return {
                    ...d,
                    formName: d.documentType,
                    submitDate: displayDate,
                    attachment: d.fileName
                };
            }).reverse();
        }

        if (announcementsData && announcementsData.length > 0) {
            MOCK.announcements = announcementsData.map(a => ({
                id: a['รหัสประกาศ'] || a.id,
                type: a['ประเภท'] || a.type || 'ทั่วไป',
                title: a['หัวข้อ'] || a.title || 'ไม่มีหัวข้อ',
                content: a['เนื้อหา'] || a.content || '',
                date: a['วันที่ประกาศ'] || a.date || '',
                icon: a['ไอคอน'] || a.icon || '📢',
                author: a['ผู้ประกาศ'] || a.author || 'Admin'
            }));

            // Notification Badge Logic
            const lastSeen = localStorage.getItem('lastSeenAnnouncementId');
            const latestId = MOCK.announcements[0]?.id;
            if (latestId && lastSeen !== latestId) {
                const badge = document.querySelector('.notif-badge');
                if (badge) {
                    badge.style.display = 'block';
                    badge.textContent = '!'; // Or calculate count
                }
            }
        }
 
        // Sync Exam Committees
        if (examCommitteesData && examCommitteesData.length > 0) {
            const grouped = {};
            examCommitteesData.forEach(m => {
                const eId = String(m.ExamID || m['ExamID'] || '').trim();
                const sId = String(m.StudentID || m['StudentID'] || '').trim();
                if (!eId) return;

                if (!grouped[eId]) {
                    const examInfo = (examsData || []).find(ex => String(ex.id).trim() === eId);
                    const student = (studentsData || []).find(s => String(s['รหัสนักศึกษา'] || s.studentId || '').trim() === sId);
                    
                    grouped[eId] = {
                        id: eId,
                        studentId: sId,
                        type: m.ExamType || m['ExamType'] || (examInfo ? (examInfo.exam_type || 'สอบวิทยานิพนธ์') : 'สอบวิทยานิพนธ์'),
                        status: examInfo ? (examInfo.status || 'approved') : 'approved',
                        date: m.ExamDate || m['ExamDate'] || (examInfo ? (examInfo.date || '-') : '-'),
                        time: m.ExamTime || m['ExamTime'] || '-',
                        room: m.ExamRoom || m['ExamRoom'] || '-',
                        advisor: m.Advisor || m['Advisor'] || '-',
                        thesisTitle: m.ThesisTitle || m['ThesisTitle'] || (student ? (student['หัวข้อวิทยานิพนธ์'] || '-') : '-'),
                        members: []
                    };
                }
                grouped[eId].members.push({
                    name: (m.Prefix || '') + (m.FirstName || '') + ' ' + (m.LastName || ''),
                    role: m.Role || 'กรรมการ',
                    position: m.Position || '-',
                    affiliation: m.Affiliation || '-'
                });
            });
            MOCK.examCommittees = Object.values(grouped);
            console.log('Exam Committees loaded:', MOCK.examCommittees);
        }

        // Calculate Dashboard Stats from Real Data
        const allStudents = MOCK.students || [];
        const activeStudents = allStudents.filter(s => s.status !== 'สำเร็จการศึกษา' && s.status !== 'Graduated');
        const alumni = allStudents.filter(s => s.status === 'สำเร็จการศึกษา' || s.status === 'Graduated');

        MOCK.dashboardStats = {
            totalStudents: activeStudents.length,
            totalAlumni: alumni.length,
            totalTeachers: MOCK.academicAdvisors ? MOCK.academicAdvisors.length : 0,
            totalCourses: MOCK.courses ? MOCK.courses.length : 0,
            pendingPayments: MOCK.payments ? MOCK.payments.filter(p => p.status === 'ค้างชำระ').length : 0,
            pendingGraduation: (MOCK.graduationRequests || []).filter(r => r.status === 'Pending').length || 0,
            recentTopicChanges: (MOCK.thesisTopicHistory || []).length || 0,
            avgGPA: 0
        };

        if (MOCK.students && MOCK.students.length > 0) {
            const studentsWithGPA = MOCK.students.filter(s => s.gpa > 0);
            if (studentsWithGPA.length > 0) {
                const totalGPA = studentsWithGPA.reduce((acc, s) => acc + parseFloat(s.gpa || 0), 0);
                MOCK.dashboardStats.avgGPA = parseFloat((totalGPA / studentsWithGPA.length).toFixed(2));
            }
        }

        // Maintain or Update current mock references based on logged in user
        if (studentsData && studentsData.length > 0) {
            if (window.currentUserRole === 'student' && window.currentUserData && window.currentUserData.id) {
                const myId = String(window.currentUserData.id).trim();
                const myName = window.currentUserData.name ? String(window.currentUserData.name).trim() : '';

                let me = (MOCK.students || []).find(s =>
                    String(s.id || '').trim() === myId ||
                    String(s.studentId || '').trim() === myId ||
                    String(s.citizenId || '').trim() === myId
                );

                // Fallback name matching if ID fails (case-insensitive contains)
                if (!me && myName) {
                    const normMyName = myName.toLowerCase();
                    me = (MOCK.students || []).find(s => {
                        const sFull = String(s.name || '').toLowerCase();
                        const sParts = String(`${s.firstName || ''} ${s.lastName || ''}`).toLowerCase();
                        return (sFull && sFull.includes(normMyName)) || (sParts && sParts.includes(normMyName)) || normMyName.includes(sParts);
                    });
                }

                MOCK.student = me || null; // Force null if no match to prevent leakage
                syncActiveStudentData();
            } else {
                // Admin/Staff - No auto-selection of mock students.
                // Reset active student context to ensure we only see real data selected by admin
                MOCK.student = null;
                syncActiveStudentData();
            }
        }
        if (allData.permissions && allData.permissions.length > 0) { MOCK.permissions = allData.permissions; }

        // Set sync flags to prevent redundant per-page syncs
        MOCK.adminDocsSyncDone = true;
        MOCK.studentDocumentsSyncDone = true;
        MOCK.studentExamsSyncDone = true;
        MOCK.studentGradesSyncDone = true;
        MOCK.studentPaymentsSyncDone = true;

        window.apiDataLoaded = true;
    } catch (e) {
        console.error('Failed to load API data:', e);
        window.apiDataLoaded = 'error'; // Indicate error state
        if (typeof showError === 'function') {
            showError(`การเชื่อมต่อผิดพลาด: ${e.message || e}\nกรุณาตรวจสอบการตั้งค่า Apps Script (Deployment) หรือสิทธิ์การเข้าถึง`);
        }
    }

    if (typeof hideApiLoading === 'function') {
        hideApiLoading();
    }
    renderPage();
}

window.syncActiveStudentData = async function () {
    // Refresh student data from Google Sheets
    showApiLoading('กำลังอัปเดตข้อมูล...');
    try {
        const [enrollments, payments, documents, exams] = await Promise.all([
            fetchData('getEnrollments'),
            fetchData('getPayments'),
            fetchData('getDocuments'),
            fetchData('getExams')
        ]);

        // Global Update
        if (exams) MOCK.allExams = exams;

        if (!MOCK.student) return;

        const sId = String(MOCK.student.studentId || '').trim();
        const sDbId = String(MOCK.student.id || '').trim();
        const sCitizenId = String(MOCK.student.citizenId || MOCK.student['เลขประจำตัวประชาชน'] || '').trim();
        
        const isMatch = (rowId) => {
            if (!rowId) return false;
            const rId = String(rowId).trim();
            return (sId !== '' && rId === sId) || (sDbId !== '' && rId === sDbId) || (sCitizenId !== '' && rId === sCitizenId);
        };

        // 1. Sync Grades
        const studentEnrollments = (enrollments || []).filter(e => {
            const rowId = String(e['รหัสนักศึกษา'] || e['student_id'] || e.studentId || e.id || '').trim();
            return isMatch(rowId);
        });
        
        console.log(`[syncActiveStudentData] Found ${studentEnrollments.length} enrollments for student ${sId}`);

        const gradesMap = {};
        studentEnrollments.forEach(e => {
            const year = parseInt(e['ปีการศึกษา'] || e['academic_year'] || e.academicYear || '0');
            const sem = parseInt(e['ภาคเรียน'] || e['semester'] || '0');
            const semKey = `${year}_${sem}`;
            const semName = `ภาคเรียนที่ ${sem}/${year}`;

            const cGrade = String(e['เกรด'] || e['grade'] || '').trim();
            const creditsRaw = String(e['หน่วยกิต'] || e['credits'] || '0').trim();
            const cCredits = parseInt(creditsRaw.split('(')[0]) || 0;

            let point = 0;
            const g = cGrade.toUpperCase();
            if (g === 'A') point = 4.0;
            else if (g === 'B+') point = 3.5;
            else if (g === 'B') point = 3.0;
            else if (g === 'C+') point = 2.5;
            else if (g === 'C') point = 2.0;
            else if (g === 'D+') point = 1.5;
            else if (g === 'D') point = 1.0;
            else if (g === 'F') point = 0.0;

            if (!gradesMap[semKey]) {
                gradesMap[semKey] = { 
                    semester: semName, 
                    year: year,
                    term: sem,
                    totalCredits: 0, 
                    gpaCredits: 0, 
                    gpaPoints: 0, 
                    courses: [] 
                };
            }

            let courseName = e['course_name'] || e['ชื่อวิชา'] || '';
            const courseCode = String(e['course_code'] || e['รหัสวิชา'] || '-').trim();
            
            // Critical Fix: If course name is missing in enrollment, look it up in the Master Course list
            if (!courseName || courseName === '-') {
                const masterCourse = (MOCK.courses || []).find(c => String(c.code || c.courseCode || c['รหัสวิชา'] || '').trim() === courseCode);
                if (masterCourse) {
                    courseName = masterCourse.name || masterCourse['ชื่อวิชา'] || '';
                }
            }
            
            // Fallback to '-' if still empty
            if (!courseName) courseName = '-';
            
            gradesMap[semKey].courses.push({
                code: courseCode,
                name: courseName,
                credits: cCredits,
                creditsDisplay: creditsRaw,
                grade: cGrade,
                point: point
            });

            const isThesis = String(courseName).includes('วิทยานิพนธ์') || 
                             String(courseName).toLowerCase().includes('thesis') ||
                             String(courseCode).startsWith('1005002') || 
                             String(courseCode).startsWith('1005003') ||
                             String(courseCode).startsWith('1005004');
            
            const isNonGPA = ['P', 'S', 'U', 'W', 'I'].includes(String(cGrade).toUpperCase());

            // All credits count toward total (including Thesis)
            gradesMap[semKey].totalCredits += cCredits;
            if (!isThesis && !isNonGPA) {
                gradesMap[semKey].gpaCredits += cCredits;
                gradesMap[semKey].gpaPoints += (point * cCredits);
            }
        });

        MOCK.grades = Object.values(gradesMap)
            .sort((a, b) => {
                if (a.year !== b.year) return a.year - b.year;
                return a.term - b.term;
            })
            .map(g => ({
                semester: g.semester,
                year: g.year,
                term: g.term,
                totalCredits: g.totalCredits,
                gpa: g.gpaCredits > 0 ? (g.gpaPoints / g.gpaCredits) : 0,
                courses: g.courses
            }));

        // Update student object stats
        const allCourses = MOCK.grades.flatMap(g => g.courses);
        MOCK.student.totalCredits = allCourses.reduce((sum, c) => sum + (c.credits || 0), 0);
        
        // Filter for aggregate GPA calculation
        const gpaCourses = allCourses.filter(c => {
            const isThesis = (c.name || '').includes('วิทยานิพนธ์') || (c.name || '').toLowerCase().includes('thesis');
            const isNonGPA = ['P', 'S', 'U', 'W', 'I'].includes(String(c.grade || '').toUpperCase());
            return !isThesis && !isNonGPA;
        });
        
        const aggregateGPACredits = gpaCourses.reduce((sum, c) => sum + (c.credits || 0), 0);
        const aggregateGPAPoints = gpaCourses.reduce((sum, c) => sum + ((c.point || 0) * (c.credits || 0)), 0);
        
        MOCK.student.gpa = aggregateGPACredits > 0 ? (aggregateGPAPoints / aggregateGPACredits) : 0;
        MOCK.student.grades = MOCK.grades;

        // 2. Sync Payments
        if (payments && payments.length > 0) {
            MOCK.studentPayments = payments
                .filter(p => {
                    const rowId = String(p['รหัสนักศึกษา'] || p.studentId || p.student_id || p.id || '').trim();
                    return isMatch(rowId);
                })
                .map(p => ({
                    id: p['รหัสอ้างอิง'] || p.id,
                    description: p['รายการ'] || p.description,
                    amount: parseFloat(p['จำนวนเงิน'] || p.amount) || 0,
                    status: p['สถานะ'] || p.status,
                    date: p['วันที่'] || p.paidDate || p.dueDate
                }));
        }

        // 3. Sync Documents
        if (documents && documents.length > 0) {
            MOCK.studentDocuments = documents
                .filter(d => {
                    const rowId = String(d['รหัสนักศึกษา'] || d['studentId'] || d['student_id'] || d.id || '').trim();
                    return isMatch(rowId);
                })
                .map((d, index) => ({
                    id: d['รหัสติดตาม'] || d['id'] || ('DOC-S' + (1000 + index)),
                    studentId: String(d['รหัสนักศึกษา'] || d['studentId'] || d['student_id'] || '').trim(),
                    formName: d['ประเภทเอกสาร'] || d.documentType || 'คำร้องทั่วไป',
                    submitDate: d['วันที่ส่ง'] || d.date || '-',
                    lastUpdate: d['วันที่ส่ง'] || d.date || '-',
                    status: d['สถานะ'] || d.status || 'รอตรวจสอบ',
                    attachment: d['ชื่อไฟล์'] || d.fileName || '-',
                    fileUrl: d['ลิงก์เอกสาร'] || d.fileUrl || '',
                    signedFileUrl: d['ลิงก์เอกสารที่ลงนาม'] || d.signedFileUrl || '',
                    note: d['หมายเหตุ'] || d.note || ''
                }));
        }

        // 4. Sync Exams
        if (exams && exams.length > 0) {
            MOCK.studentExams = exams.filter(ex => {
                const rowId = String(ex.student_id || ex['รหัสนักศึกษา'] || ex.studentId || ex.id || '').trim();
                return isMatch(rowId);
            });
            MOCK.student.exams = MOCK.studentExams;
        }
    } catch (err) {
        console.error('Sync student data failed:', err);
    } finally {
        hideApiLoading();
        renderPage();
    }
};

window.refreshAllData = async function() {
    showApiLoading('กำลังอัปเดตข้อมูลทั้งหมดจากเซิร์ฟเวอร์...');
    try {
        await bootApp();
        alert('อัปเดตข้อมูลล่าสุดเรียบร้อยแล้ว');
    } catch (err) {
        console.error('Refresh All Data failed:', err);
        alert('ไม่สามารถอัปเดตข้อมูลได้: ' + err.message);
    } finally {
        hideApiLoading();
    }
};

window.changeAdvisorFilter = function (advisorName) {
    window.activeAdvisorName = advisorName || null;
    // When advisor changes, we might want to reset student selection if they don't belong to this advisor
    const st = MOCK.student;
    if (st && advisorName && advisorName !== '-') {
        const isAssigned = (st.advisor === advisorName || st.thesisAdvisor === advisorName);
        if (!isAssigned) {
            MOCK.student = null;
            if (typeof window.syncActiveStudentData === 'function') {
                window.syncActiveStudentData();
            }
        }
    }
    renderPage();
};

window.changeProfileStudent = function (studentId) {
    if (!studentId) {
        MOCK.student = null;
    } else {
        const selected = (MOCK.students || []).find(s => (s.id || s.studentId) === studentId);
        if (selected) {
            MOCK.student = selected;
        }
    }
    
    if (typeof window.syncActiveStudentData === 'function') {
        window.syncActiveStudentData();
    } else {
        renderPage();
    }
};

/**
 * Bulk Assign Advisor Modal
 * @param {string} advisorName 
 * @param {string} type - 'advisor' or 'thesisAdvisor'
 */
window.openBulkAssignAdvisor = function(advisorName, type) {
    if (!advisorName) return;
    
    const students = MOCK.students || [];
    // Suggest students who DON'T have this advisor yet
    const unassignedStudents = students.filter(s => s[type] !== advisorName);

    const modalHtml = `
    <div style="padding:10px;">
        <p style="margin-bottom:15px; color:var(--text-secondary);">เลือกนักศึกษาที่คุณต้องการมอบหมายให้เป็นลูกศิษย์ของ <strong>${advisorName}</strong></p>
        
        <div style="margin-bottom:15px;">
            <input type="text" id="bulkStudentSearch" class="form-input" placeholder="🔍 ค้นหาชื่อหรือรหัสนักศึกษา..." onkeyup="window.filterBulkStudents(this.value)">
        </div>

        <div style="max-height:350px; overflow-y:auto; border:1px solid var(--border-color); border-radius:var(--radius-md); padding:5px; margin-bottom:20px;">
            <table class="data-table" style="font-size:0.85rem;">
                <thead>
                    <tr>
                        <th style="width:40px;"><input type="checkbox" id="selectAllBulk" onclick="window.toggleAllBulkStudents(this.checked)"></th>
                        <th>รหัส</th>
                        <th>ชื่อ-นามสกุล</th>
                        <th>อาจารย์เดิม</th>
                    </tr>
                </thead>
                <tbody id="bulkStudentTableBody">
                    ${unassignedStudents.map(s => `
                        <tr class="bulk-student-row">
                            <td><input type="checkbox" name="bulkStudent" value="${s.id || s.studentId}" onchange="window.updateBulkCounter()"></td>
                            <td style="font-weight:600;">${s.studentId || ''}</td>
                            <td>${s.prefix||''}${s.firstName} ${s.lastName}</td>
                            <td style="font-size:0.75rem; color:var(--text-muted);">${s[type] || '-'}</td>
                        </tr>
                    `).join('')}
                    ${unassignedStudents.length === 0 ? '<tr><td colspan="4" style="text-align:center; padding:20px;">ไม่พบรายชื่อนักศึกษาเพิ่มเติม</td></tr>' : ''}
                </tbody>
            </table>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center;">
             <div id="selectionCounter" style="font-size:0.85rem; font-weight:700; color:var(--accent-primary);">เลือกแล้ว 0 คน</div>
             <div style="display:flex; gap:10px;">
                <button class="btn btn-secondary" onclick="closeModal()">ยกเลิก</button>
                <button class="btn btn-primary" onclick="saveBulkAdvisorAssignment('${advisorName}', '${type}')">บันทึกการมอบหมาย</button>
             </div>
        </div>
    </div>
    `;
    
    openModal('มอบหมายนักศึกษา : ' + advisorName, modalHtml);
};

window.filterBulkStudents = function(query) {
    const trs = document.querySelectorAll('.bulk-student-row');
    trs.forEach(tr => {
        const text = tr.innerText.toLowerCase();
        tr.style.display = text.includes(query.toLowerCase()) ? '' : 'none';
    });
};

window.toggleAllBulkStudents = function(checked) {
    const cbs = document.querySelectorAll('input[name="bulkStudent"]');
    cbs.forEach(cb => {
        if (cb.parentElement.parentElement.style.display !== 'none') {
            cb.checked = checked;
        }
    });
    window.updateBulkCounter();
};

window.updateBulkCounter = function() {
    const selected = document.querySelectorAll('input[name="bulkStudent"]:checked').length;
    const counter = document.getElementById('selectionCounter');
    if (counter) counter.innerText = "เลือกแล้ว " + selected + " คน";
};

window.saveBulkAdvisorAssignment = async function(advisorName, type) {
    const selectedCbs = document.querySelectorAll('input[name="bulkStudent"]:checked');
    if (selectedCbs.length === 0) {
        alert('กรุณาเลือกนักศึกษาอย่างน้อย 1 คน');
        return;
    }

    if (!confirm('คุณยืนยันที่จะมอบหมายนักศึกษาทั้ง ' + selectedCbs.length + ' คน ให้แก่อาจารย์ ' + advisorName + ' ใช่หรือไม่?')) {
        return;
    }

    const studentIds = Array.from(selectedCbs).map(cb => cb.value);
    const updateData = { [type]: advisorName };

    showApiLoading('กำลังบันทึกข้อมูลนักศึกษา ' + studentIds.length + ' คน...');
    
    let successCount = 0;
    let failCount = 0;

    for (const sid of studentIds) {
        try {
            const res = await window.api.updateStudentDetail(sid, updateData);
            if (res && res.status === 'success') {
                successCount++;
                // Sync local state for each success
                const idx = (MOCK.students || []).findIndex(s => (s.id || s.studentId) === sid);
                if (idx !== -1) {
                    MOCK.students[idx][type] = advisorName;
                    if (MOCK.student && (MOCK.student.id === sid || MOCK.student.studentId === sid)) {
                        MOCK.student[type] = advisorName;
                    }
                }
            } else {
                failCount++;
            }
        } catch (e) {
            console.error('Failed to update student ' + sid, e);
            failCount++;
        }
    }

    hideApiLoading();
    closeModal();
    renderPage();
    alert('มอบหมายนักศึกษาสำเร็จ ' + successCount + ' คน' + (failCount > 0 ? ' (ผิดพลาด ' + failCount + ' คน)' : ''));
};

/**
 * Searchable Select Component Utilities
 */
window.renderSearchableSelect = function(id, options, selectedValue = '', placeholder = '--- เลือกรายการ ---') {
    const selectedOption = options.find(o => o.value === selectedValue);
    const displayText = selectedOption ? selectedOption.label : placeholder;

    return `
    <div class="search-select-container" id="${id}_container">
        <div class="search-select-display" onclick="window.toggleSearchSelect('${id}')">
            <span class="search-select-label" id="${id}_label">${displayText}</span>
            <input type="text" class="search-select-input" id="${id}_input" 
                   placeholder="พิมพ์เพื่อค้นหา..." 
                   onkeyup="window.filterSearchSelect('${id}', this.value)" 
                   onclick="event.stopPropagation()">
            <svg id="${id}_arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="transition: transform 0.2s;">
                <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
        </div>
        <div class="search-select-dropdown" id="${id}_dropdown" style="display:none;">
            ${options.map(o => `
                <div class="search-select-option ${selectedValue === o.value ? 'selected' : ''}" 
                     data-value="${o.value}" 
                     onclick="window.selectSearchOption('${id}', '${o.value.replace(/'/g, "\\'")}', '${o.label.replace(/'/g, "\\'")}')">
                    ${o.label}
                </div>
            `).join('')}
            ${options.length === 0 ? '<div class="search-select-no-results">ไม่พบข้อมูลอาจารย์</div>' : ''}
            <div class="search-select-no-results" id="${id}_no_results" style="display:none;">ไม่พบข้อมูล</div>
        </div>
        <input type="hidden" id="${id}" value="${selectedValue}">
    </div>
    `;
};

window.toggleSearchSelect = function(id) {
    const container = document.getElementById(id + '_container');
    const input = document.getElementById(id + '_input');
    const label = document.getElementById(id + '_label');
    const dropdown = document.getElementById(id + '_dropdown');
    const arrow = document.getElementById(id + '_arrow');
    
    if (!container || !dropdown) return;
    
    const isOpen = container.classList.contains('open');

    if (isOpen) {
        window.closeSearchSelect(id);
    } else {
        // Close other open selects
        document.querySelectorAll('.search-select-container.open').forEach(c => {
            const otherId = c.id.replace('_container', '');
            window.closeSearchSelect(otherId);
        });

        container.classList.add('open');
        dropdown.style.display = 'block';
        label.style.display = 'none';
        input.style.display = 'block';
        input.value = '';
        input.focus();
        arrow.style.transform = 'rotate(180deg)';
        window.filterSearchSelect(id, ''); 
    }
};

window.closeSearchSelect = function(id) {
    const container = document.getElementById(id + '_container');
    const dropdown = document.getElementById(id + '_dropdown');
    const input = document.getElementById(id + '_input');
    const label = document.getElementById(id + '_label');
    const arrow = document.getElementById(id + '_arrow');
    
    if (container && container.classList.contains('open')) {
        container.classList.remove('open');
        if (dropdown) dropdown.style.display = 'none';
        if (label) label.style.display = 'block';
        if (input) {
            input.style.display = 'none';
            input.value = '';
        }
        if (arrow) arrow.style.transform = 'rotate(0deg)';
    }
};

window.filterSearchSelect = function(id, query) {
    const dropdown = document.getElementById(id + '_dropdown');
    if (!dropdown) return;
    const options = dropdown.querySelectorAll('.search-select-option');
    const noResults = document.getElementById(id + '_no_results');
    let count = 0;

    options.forEach(opt => {
        const text = opt.innerText.toLowerCase();
        if (text.includes(query.toLowerCase())) {
            opt.style.display = 'block';
            count++;
        } else {
            opt.style.display = 'none';
        }
    });

    if (noResults) noResults.style.display = (count === 0 && options.length > 0) ? 'block' : 'none';
};

window.selectSearchOption = function(id, value, label) {
    const hiddenInput = document.getElementById(id);
    const displayLabel = document.getElementById(id + '_label');
    
    if (hiddenInput) hiddenInput.value = value;
    if (displayLabel) displayLabel.innerText = label;
    
    // Trigger callback if defined
    if (typeof window.onSearchSelectChange === 'function') {
        window.onSearchSelectChange(id, value, label);
    }
    
    // Legacy support for advisor filter
    if (id === 'advisorSearchSelect' && typeof window.changeAdvisorFilter === 'function') {
        window.changeAdvisorFilter(value);
    }
    
    window.closeSearchSelect(id);
};

// Global click listener to close dropdowns when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-select-container')) {
        document.querySelectorAll('.search-select-container.open').forEach(container => {
            const id = container.id.replace('_container', '');
            window.closeSearchSelect(id);
        });
    }
});

// Fallback for Toast notifications
if (typeof window.showToast !== 'function') {
    window.showToast = function(msg, type = 'info') {
        alert(`${type.toUpperCase()}: ${msg}`);
    };
}

bootApp();
