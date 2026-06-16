// ============================
// Data Model & State Management
// ============================

const MOCK = {
    // ===== Global Active Semester =====
    activeYear: localStorage.getItem('activeYear') || '2568',
    activeSemester: localStorage.getItem('activeSemester') || 'ภาคฤดูร้อน',
    // Teaching Fees filter state (defaults to active semester on page load)
    selectedFeeYear: null,
    selectedFeeSemester: null,

    // ข้อมูลนักศึกษา (จาก API)
    student: null,
    students: [],

    // สถิติ Dashboard
    dashboardStats: {
        totalStudents: 0,
        totalTeachers: 0,
        totalCourses: 0,
        pendingPayments: 0,
        avgGPA: 0,
    },
    permissions: [
        { Role: 'admin', 'nav-dashboard': 'YES', 'nav-student-dashboard': 'YES', 'nav-student-profile': 'YES', 'nav-teacher-profile': 'YES', 'nav-special-lecturers': 'YES', 'nav-alumni': 'YES', 'nav-new-registration': 'YES', 'nav-teacher-registration': 'YES', 'nav-courses': 'YES', 'nav-study-plan': 'YES', 'nav-grades': 'YES', 'nav-schedule': 'YES', 'nav-eval-course': 'YES', 'nav-eval-instructor': 'YES', 'nav-transcript': 'YES', 'nav-exams': 'YES', 'nav-graduation': 'YES', 'nav-thesis-advisor': 'YES', 'nav-thesis-topic': 'YES', 'nav-academic-advisor': 'YES', 'nav-exam-committee': 'YES', 'nav-payments': 'YES', 'nav-petitions-student': 'YES', 'nav-documents-status': 'YES', 'nav-documents-admin': 'YES', 'nav-manage-evals': 'YES', 'nav-eval-reports': 'YES', 'nav-calendar': 'YES', 'nav-announcements': 'YES', 'nav-settings': 'YES', 'nav-user-management': 'YES', 'nav-menu-permissions': 'YES', 'nav-admission': 'YES', 'nav-teaching-fees': 'YES' },
        { Role: 'staff', 'nav-dashboard': 'YES', 'nav-student-dashboard': 'YES', 'nav-student-profile': 'YES', 'nav-teacher-profile': 'YES', 'nav-special-lecturers': 'YES', 'nav-alumni': 'YES', 'nav-new-registration': 'YES', 'nav-teacher-registration': 'YES', 'nav-courses': 'YES', 'nav-study-plan': 'YES', 'nav-grades': 'YES', 'nav-schedule': 'YES', 'nav-eval-course': 'YES', 'nav-eval-instructor': 'YES', 'nav-transcript': 'YES', 'nav-exams': 'YES', 'nav-graduation': 'YES', 'nav-thesis-advisor': 'YES', 'nav-thesis-topic': 'YES', 'nav-academic-advisor': 'YES', 'nav-exam-committee': 'YES', 'nav-payments': 'YES', 'nav-petitions-student': 'YES', 'nav-documents-status': 'YES', 'nav-documents-admin': 'YES', 'nav-manage-evals': 'YES', 'nav-eval-reports': 'YES', 'nav-calendar': 'YES', 'nav-announcements': 'YES', 'nav-settings': 'YES', 'nav-user-management': 'NO', 'nav-menu-permissions': 'NO', 'nav-admission': 'NO', 'nav-teaching-fees': 'YES' },
        { Role: 'student', 'nav-dashboard': 'NO', 'nav-student-dashboard': 'YES', 'nav-student-profile': 'YES', 'nav-teacher-profile': 'NO', 'nav-special-lecturers': 'NO', 'nav-alumni': 'NO', 'nav-new-registration': 'NO', 'nav-teacher-registration': 'NO', 'nav-courses': 'NO', 'nav-study-plan': 'YES', 'nav-grades': 'YES', 'nav-schedule': 'YES', 'nav-eval-course': 'YES', 'nav-eval-instructor': 'YES', 'nav-transcript': 'YES', 'nav-exams': 'YES', 'nav-graduation': 'YES', 'nav-thesis-advisor': 'YES', 'nav-thesis-topic': 'YES', 'nav-academic-advisor': 'YES', 'nav-exam-committee': 'YES', 'nav-payments': 'YES', 'nav-petitions-student': 'YES', 'nav-documents-status': 'YES', 'nav-documents-admin': 'NO', 'nav-manage-evals': 'NO', 'nav-eval-reports': 'NO', 'nav-calendar': 'YES', 'nav-announcements': 'YES', 'nav-settings': 'YES', 'nav-user-management': 'NO', 'nav-menu-permissions': 'NO', 'nav-admission': 'NO', 'nav-teaching-fees': 'NO' }
    ],
    
    applicants: [
        { 
            ApplicationID: 'APP-1700000001', Status: 'Pending', Date: '2026-03-20', 
            Prefix: 'นางสาว', FirstName: 'นภา', LastName: 'สดใส', FirstNameEn: 'Napha', LastNameEn: 'Sodsai', 
            IdCard: '1-1234-56789-01-2', Dob: '1998-05-12', Age: '25', Religion: 'พุทธ', Nationality: 'ไทย',
            Email: 'napha@email.com', Phone: '081-111-2222', PhoneHome: '02-123-4567', PhoneWork: '',
            Program: 'หลักสูตรพยาบาลศาสตรมหาบัณฑิต', Major: 'การพยาบาลเด็ก', 
            Address: '123 ม.4 ต.ช้างเผือก อ.เมือง จ.เชียงใหม่',
            EducationHistory: JSON.stringify([{degree:'ป.ตรี', inst:'ม.เชียงใหม่', major:'พยาบาลศาสตร์', year:'2560', gpa:'3.65'}]),
            TrainingHistory: JSON.stringify([{name:'การช่วยฟื้นคืนชีพขั้นสูง', inst:'รพ.นครพิงค์', dur:'2 วัน', year:'2565'}]),
            WorkStatus: 'ทำงานแล้ว',
            WorkHistory: JSON.stringify([{inst:'รพ.มหาราชนครเชียงใหม่', pos:'พยาบาลวิชาชีพ', dur:'3 ปี', start:'2561', end:'2564'}]),
            CurrentWorkplace: 'โรงพยาบาลเชียงใหม่ราษฎร์',
            ResearchTopic: 'การศึกษาพฤติกรรมการดูแลสุขภาพของเด็กที่มีโรคประจำตัวเรื้อรังในเขตพื้นที่ภาคเหนือ',
            DocumentsLink: 'https://drive.google.com/drive/my-drive'
        },
        { 
            ApplicationID: 'APP-1700000002', Status: 'Interview', Date: '2026-03-21', 
            Prefix: 'นาย', FirstName: 'สมชาย', LastName: 'หมายคง', FirstNameEn: 'Somchai', LastNameEn: 'Maikhong', 
            IdCard: '1-2222-33333-44-5', Dob: '1995-12-05', Age: '28', Religion: 'พุทธ', Nationality: 'ไทย',
            Email: 'somchai@email.com', Phone: '082-333-4444', PhoneHome: '', PhoneWork: '038-777-888',
            Program: 'หลักสูตรพยาบาลศาสตรมหาบัณฑิต', Major: 'การพยาบาลเวชปฏิบัติชุมชน', 
            Address: '45/1 ถ.สุขุมวิท อ.เมือง จ.ชลบุรี',
            EducationHistory: JSON.stringify([{degree:'ป.ตรี', inst:'ม.บูรพา', major:'พยาบาลศาสตร์', year:'2558', gpa:'3.42'}]),
            TrainingHistory: '[]',
            WorkStatus: 'ทำงานแล้ว',
            WorkHistory: JSON.stringify([{inst:'สสจ.ชลบุรี', pos:'นักวิชาการสาธารณสุข', dur:'5 ปี', start:'2559', end:'2564'}]),
            CurrentWorkplace: 'สถานีอนามัยบางแสน',
            ResearchTopic: 'การพัฒนาระบบการดูแลผู้สูงอายุติดบ้านติดเตียงในระดับชุมชนเมือง',
            DocumentsLink: JSON.stringify({
                '_folder': 'https://drive.google.com/drive/my-drive',
                'ปพ.1': 'https://drive.google.com/drive/my-drive',
                'สำเนาบัตรประชาชน': 'https://drive.google.com/drive/my-drive'
            })
        }
    ],

    // สาขาวิชา (Programs/Majors) - Keep for form rendering
    programs: [
        { name: 'การพยาบาลผู้ใหญ่และผู้สูงอายุ' },
        { name: 'การพยาบาลเวชปฏิบัติชุมชน' },
        { name: 'การพยาบาลเด็ก' },
        { name: 'การพยาบาลจิตเวชและสุขภาพจิต' },
        { name: 'การผดุงครรภ์' },
        { name: 'การบริหารทางการพยาบาล' }
    ],

    // รายวิชาทั้งหมด (จาก API)
    courses: [],

    // รายวิชาที่ลงทะเบียนแล้ว (จาก API)
    enrolledCourses: [],

    // ผลการเรียน (จาก API)
    grades: [],

    // ตารางเรียน 
    schedule: {
        timeSlots: ['08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00', '13:00-14:00', '14:00-15:00', '15:00-16:00'],
        days: ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์'],
                        items: [
            // === ปีการศึกษา 2567 ภาคเรียนที่ 1 ===
            // วิชาแกนร่วม
            { day: 0, startSlot: 0, endSlot: 2, code: '0100500101', name: 'วิทยาศาสตร์สุขภาพขั้นสูงทางการพยาบาล', room: 'R401', color: 'blue', instructorId: 'teacher-01', instructorName: 'รศ.ดร.สุขใจ ดีเสมอ', semester: '1', academicYear: '2567', section: '01', credits: 3 },
            { day: 1, startSlot: 0, endSlot: 1, code: '0100500102', name: 'ระเบียบวิธีวิจัยทางการพยาบาล', room: 'R402', color: 'green', instructorId: 'teacher-02', instructorName: 'ผศ.ดร.สมชาย ใจทน', semester: '1', academicYear: '2567', section: '01', credits: 2 },
            { day: 2, startSlot: 0, endSlot: 1, code: '0100500102', name: 'ระเบียบวิธีวิจัยทางการพยาบาล', room: 'R402', color: 'green', instructorId: 'teacher-02', instructorName: 'ผศ.ดร.สมชาย ใจทน', semester: '1', academicYear: '2567', section: '02', credits: 2 },
            // วิชาเฉพาะสาขา - ผู้ใหญ่และผู้สูงอายุ
            { day: 2, startSlot: 4, endSlot: 6, code: '0100504105', name: 'การพยาบาลผู้ใหญ่และผู้สูงอายุที่มีปัญหาซับซ้อน', room: 'R405', color: 'purple', instructorId: 'teacher-03', instructorName: 'อ.มานี มีตา', semester: '1', academicYear: '2567', section: '01', credits: 3 },
            { day: 3, startSlot: 0, endSlot: 2, code: '0100504106', name: 'สัมมนาการพยาบาลผู้สูงอายุ', room: 'R406', color: 'orange', instructorId: 'teacher-01', instructorName: 'รศ.ดร.สุขใจ ดีเสมอ', semester: '1', academicYear: '2567', section: '01', credits: 3 },
            // วิชาเฉพาะสาขา - การผดุงครรภ์
            { day: 1, startSlot: 4, endSlot: 5, code: '0100502105', name: 'การพยาบาลมารดาทารกที่มีภาวะเสี่ยง', room: 'R301', color: 'pink', instructorId: 'teacher-04', instructorName: 'รศ.ดร.วิไลวรรณ รักเรียน', semester: '1', academicYear: '2567', section: '01', credits: 2 },
            // วิชาเฉพาะสาขา - เด็ก
            { day: 4, startSlot: 0, endSlot: 1, code: '0100503101', name: 'การพยาบาลเด็กขั้นสูง', room: 'R302', color: 'teal', instructorId: 'EXT-01', instructorName: 'ศ.ดร.สมศักดิ์ ภักดี', semester: '1', academicYear: '2567', section: '01', credits: 2 },
            // วิชาเฉพาะสาขา - จิตเวช
            { day: 4, startSlot: 4, endSlot: 5, code: '0100505102', name: 'เภสัชวิทยา (Psychopharmacology)', room: 'R501', color: 'red', instructorId: 'teacher-05', instructorName: 'ผศ.ดร.ปิยนุช สว่างจิต', semester: '1', academicYear: '2567', section: '01', credits: 2 },
            // วิชาเฉพาะสาขา - บริหาร
            { day: 3, startSlot: 4, endSlot: 5, code: '0100508101', name: 'ภาวะผู้นำทางการพยาบาล', room: 'R502', color: 'indigo', instructorId: 'teacher-06', instructorName: 'รศ.ดร.นภาพร แสงจันทร์', semester: '1', academicYear: '2567', section: '01', credits: 2 },

            // === ปีการศึกษา 2567 ภาคเรียนที่ 2 ===
            { day: 0, startSlot: 0, endSlot: 1, code: '0100500103', name: 'สถิติประยุกต์ทางการพยาบาล', room: 'R401', color: 'blue', instructorId: 'teacher-02', instructorName: 'ผศ.ดร.สมชาย ใจทน', semester: '2', academicYear: '2567', section: '01', credits: 2 },
            { day: 0, startSlot: 4, endSlot: 5, code: '0100500104', name: 'นโยบายและระบบสุขภาพ', room: 'R402', color: 'green', instructorId: 'teacher-06', instructorName: 'รศ.ดร.นภาพร แสงจันทร์', semester: '2', academicYear: '2567', section: '01', credits: 2 },
            { day: 1, startSlot: 0, endSlot: 2, code: '0100504107', name: 'ปฏิบัติการพยาบาลผู้สูงอายุ 1', room: 'โรงพยาบาล A', color: 'purple', instructorId: 'teacher-03', instructorName: 'อ.มานี มีตา', semester: '2', academicYear: '2567', section: '01', credits: 3 },
            { day: 2, startSlot: 0, endSlot: 2, code: '0100502108', name: 'ปฏิบัติการพยาบาลมารดาทารก', room: 'โรงพยาบาล B', color: 'pink', instructorId: 'teacher-04', instructorName: 'รศ.ดร.วิไลวรรณ รักเรียน', semester: '2', academicYear: '2567', section: '01', credits: 3 },
            { day: 3, startSlot: 0, endSlot: 1, code: '0100503102', name: 'การพยาบาลเด็กป่วยเรื้อรัง', room: 'R302', color: 'teal', instructorId: 'EXT-01', instructorName: 'ศ.ดร.สมศักดิ์ ภักดี', semester: '2', academicYear: '2567', section: '01', credits: 2 },
            { day: 3, startSlot: 4, endSlot: 6, code: '0100505105', name: 'ปฏิบัติการพยาบาลจิตเวชขั้นสูง', room: 'โรงพยาบาล C', color: 'red', instructorId: 'teacher-05', instructorName: 'ผศ.ดร.ปิยนุช สว่างจิต', semester: '2', academicYear: '2567', section: '01', credits: 3 },
            { day: 4, startSlot: 0, endSlot: 1, code: '0100508102', name: 'การจัดการคุณภาพทางการพยาบาล', room: 'R502', color: 'indigo', instructorId: 'teacher-06', instructorName: 'รศ.ดร.นภาพร แสงจันทร์', semester: '2', academicYear: '2567', section: '01', credits: 2 },

            // === ปีการศึกษา 2567 ภาคฤดูร้อน ===
            { day: 0, startSlot: 0, endSlot: 2, code: '0100504108', name: 'ปฏิบัติการพยาบาลผู้สูงอายุ 2', room: 'โรงพยาบาล A', color: 'purple', instructorId: 'teacher-01', instructorName: 'รศ.ดร.สุขใจ ดีเสมอ', semester: 'ภาคฤดูร้อน', academicYear: '2567', section: '01', credits: 3 },
            { day: 1, startSlot: 0, endSlot: 2, code: '0100502109', name: 'สัมมนาการผดุงครรภ์ขั้นสูง', room: 'R301', color: 'pink', instructorId: 'teacher-04', instructorName: 'รศ.ดร.วิไลวรรณ รักเรียน', semester: 'ภาคฤดูร้อน', academicYear: '2567', section: '01', credits: 3 },
            { day: 2, startSlot: 0, endSlot: 2, code: '0100505109', name: 'สัมมนาปัญหาสุขภาพจิตและจิตเวช', room: 'R501', color: 'red', instructorId: 'teacher-05', instructorName: 'ผศ.ดร.ปิยนุช สว่างจิต', semester: 'ภาคฤดูร้อน', academicYear: '2567', section: '01', credits: 3 },

            // === ปีการศึกษา 2568 ภาคเรียนที่ 1 (ปัจจุบัน) ===
            { day: 0, startSlot: 0, endSlot: 2, code: '0100500101', name: 'วิทยาศาสตร์สุขภาพขั้นสูงทางการพยาบาล', room: 'R401', color: 'blue', instructorId: 'teacher-01', instructorName: 'รศ.ดร.สุขใจ ดีเสมอ', semester: '1', academicYear: '2568', section: '01', credits: 3 },
            { day: 1, startSlot: 0, endSlot: 1, code: '0100500102', name: 'ระเบียบวิธีวิจัยทางการพยาบาล', room: 'R402', color: 'green', instructorId: 'teacher-02', instructorName: 'ผศ.ดร.สมชาย ใจทน', semester: '1', academicYear: '2568', section: '01', credits: 2 },
            { day: 2, startSlot: 4, endSlot: 6, code: '0100504105', name: 'การพยาบาลผู้ใหญ่และผู้สูงอายุที่มีปัญหาซับซ้อน', room: 'R405', color: 'purple', instructorId: 'teacher-03', instructorName: 'อ.มานี มีตา', semester: '1', academicYear: '2568', section: '01', credits: 3 },
            { day: 3, startSlot: 0, endSlot: 2, code: '0100504106', name: 'สัมมนาการพยาบาลผู้สูงอายุ', room: 'R406', color: 'orange', instructorId: 'teacher-01', instructorName: 'รศ.ดร.สุขใจ ดีเสมอ', semester: '1', academicYear: '2568', section: '01', credits: 3 },
            { day: 1, startSlot: 4, endSlot: 5, code: '0100502105', name: 'การพยาบาลมารดาทารกที่มีภาวะเสี่ยง', room: 'R301', color: 'pink', instructorId: 'teacher-04', instructorName: 'รศ.ดร.วิไลวรรณ รักเรียน', semester: '1', academicYear: '2568', section: '01', credits: 2 },
            { day: 4, startSlot: 0, endSlot: 1, code: '0100503101', name: 'การพยาบาลเด็กขั้นสูง', room: 'R302', color: 'teal', instructorId: 'EXT-01', instructorName: 'ศ.ดร.สมศักดิ์ ภักดี', semester: '1', academicYear: '2568', section: '01', credits: 2 },
            { day: 4, startSlot: 4, endSlot: 5, code: '0100505102', name: 'เภสัชวิทยา (Psychopharmacology)', room: 'R501', color: 'red', instructorId: 'teacher-05', instructorName: 'ผศ.ดร.ปิยนุช สว่างจิต', semester: '1', academicYear: '2568', section: '01', credits: 2 },
            { day: 3, startSlot: 4, endSlot: 5, code: '0100508101', name: 'ภาวะผู้นำทางการพยาบาล', room: 'R502', color: 'indigo', instructorId: 'teacher-06', instructorName: 'รศ.ดร.นภาพร แสงจันทร์', semester: '1', academicYear: '2568', section: '01', credits: 2 },

            // === ปีการศึกษา 2568 ภาคฤดูร้อน (ปัจจุบัน) ===
            { day: 0, startSlot: 0, endSlot: 2, code: '0100504108', name: 'ปฏิบัติการพยาบาลผู้สูงอายุ 2', room: 'โรงพยาบาล A', color: 'purple', instructorId: 'teacher-01', instructorName: 'รศ.ดร.สุขใจ ดีเสมอ', semester: 'ภาคฤดูร้อน', academicYear: '2568', section: '01', credits: 3 },
            { day: 1, startSlot: 0, endSlot: 2, code: '0100500103', name: 'สถิติประยุกต์ทางการพยาบาล', room: 'R401', color: 'blue', instructorId: 'teacher-02', instructorName: 'ผศ.ดร.สมชาย ใจทน', semester: 'ภาคฤดูร้อน', academicYear: '2568', section: '01', credits: 2 }
        ]
    },

    // อัตราค่าสอนเริ่มต้น (ต่อชั่วโมง)
    teachingRateDefaults: [
        { type: 'internal_phd', label: 'อาจารย์ภายใน (ปริญญาเอก)', rate: 600 },
        { type: 'internal_master', label: 'อาจารย์ภายใน (ปริญญาโท)', rate: 450 },
        { type: 'external_specialist', label: 'อาจารย์พิเศษ/ผู้เชี่ยวชาญ', rate: 1000 },
    ],

    // ค่าธรรมเนียม (จาก API)
    payments: [],

    // ปฏิทินการศึกษา
    // ปฏิทินการศึกษา 2568
    calendarEvents: [
        // Semester 1/2568
        { startDate: '2025-06-02', endDate: '2025-06-15', title: 'ชำระค่าลงทะเบียนและค่าธรรมเนียมการศึกษา ภาคการศึกษาที่ 1', type: 'register', cohort: '65,66,67' },
        { startDate: '2025-02-01', endDate: '2025-02-12', title: 'ชำระค่าลงทะเบียนและค่าธรรมเนียมการศึกษา ภาคการศึกษาที่ 1 (รอบที่ 1)', type: 'register', cohort: '68' },
        { startDate: '2025-05-05', endDate: '2025-05-17', title: 'ชำระค่าลงทะเบียนและค่าธรรมเนียมการศึกษา ภาคการศึกษาที่ 1 (รอบที่ 2)', type: 'register', cohort: '68' },
        
        { startDate: '2025-05-26', endDate: '2025-05-28', title: 'กิจกรรม Research camp', type: 'activity', cohort: '65,66,67' },
        { startDate: '2025-05-31', endDate: '2025-06-01', title: 'สอบประมวลความรู้', type: 'exam', cohort: '67' },
        
        { startDate: '2025-06-07', endDate: '2025-06-08', title: 'นักศึกษาใหม่รายงานตัวเพื่อเข้าศึกษา/ปฐมนิเทศและเตรียมความพร้อมการเรียน', type: 'activity', cohort: '67,68' },
        { startDate: '2025-06-20', endDate: '2025-06-20', title: 'เปิดภาคการศึกษาที่ 1', type: 'activity', cohort: 'all' },
        
        { startDate: '2025-06-21', endDate: '2025-06-22', title: 'นำเสนอความก้าวหน้าในการทำโครงร่างวิทยานิพนธ์ (Draft)', type: 'thesis', cohort: '65' },
        { startDate: '2025-06-27', endDate: '2025-06-28', title: 'นำเสนอความก้าวหน้าในการทำโครงร่างวิทยานิพนธ์ (Draft)', type: 'thesis', cohort: '66' },
        { startDate: '2025-06-29', endDate: '2025-06-30', title: 'นำเสนอความก้าวหน้าในการทำโครงร่างวิทยานิพนธ์ (Draft)', type: 'thesis', cohort: '67' },
        
        { startDate: '2025-07-24', endDate: '2025-07-24', title: 'พิธีไหว้ครู', type: 'activity', cohort: 'all' },
        { startDate: '2025-08-09', endDate: '2025-08-09', title: 'สอบวัดมาตรฐานภาษาอังกฤษของสถาบัน ครั้งที่ 1', type: 'exam', cohort: 'all' },
        
        { startDate: '2025-09-26', endDate: '2025-09-28', title: 'นำเสนอความก้าวหน้า (Final)', type: 'thesis', cohort: '65' },
        { startDate: '2025-10-01', endDate: '2025-10-05', title: 'นำเสนอความก้าวหน้า (Final)', type: 'thesis', cohort: '66' },
        { startDate: '2025-10-10', endDate: '2025-10-12', title: 'นำเสนอความก้าวหน้า (Final)', type: 'thesis', cohort: '67' },
        
        { startDate: '2025-10-12', endDate: '2025-10-12', title: 'วันสุดท้าย ภาคการศึกษาที่ 1', type: 'activity', cohort: 'all' },
        
        // Semester 2/2568
        { startDate: '2025-10-13', endDate: '2025-10-30', title: 'ชำระค่าลงทะเบียนและค่าธรรมเนียมการศึกษา หรือค่ารักษาสถานภาพ ภาคเรียนที่ 2', type: 'register', cohort: 'all' },
        { startDate: '2025-10-31', endDate: '2025-10-31', title: 'เปิดภาคการศึกษาที่ 2', type: 'activity', cohort: 'all' },
        
        { startDate: '2025-11-01', endDate: '2025-11-02', title: 'นำเสนอความก้าวหน้าในการทำโครงร่างวิทยานิพนธ์ (Draft)', type: 'thesis', cohort: '65' },
        { startDate: '2025-11-08', endDate: '2025-11-09', title: 'นำเสนอความก้าวหน้าในการทำโครงร่างวิทยานิพนธ์ (Draft)', type: 'thesis', cohort: '66' },
        { startDate: '2025-11-15', endDate: '2025-11-16', title: 'นำเสนอความก้าวหน้าในการทำโครงร่างวิทยานิพนธ์ (Draft)', type: 'thesis', cohort: '67' },
        
        { startDate: '2025-11-24', endDate: '2025-11-24', title: 'สอบประมวลความรู้ ครั้งที่ 2', type: 'exam', cohort: 'all' },
        { startDate: '2025-12-27', endDate: '2025-12-27', title: 'สอบภาษาอังกฤษ (เฉพาะนักศึกษาชั้นปีสุดท้ายที่คาดว่าจะสำเร็จการศึกษา)', type: 'exam', cohort: 'all' },
        
        { startDate: '2026-02-06', endDate: '2026-02-08', title: 'นำเสนอความก้าวหน้า (Final)', type: 'thesis', cohort: '65,66' },
        { startDate: '2026-02-13', endDate: '2026-02-15', title: 'นำเสนอความก้าวหน้า (Final)', type: 'thesis', cohort: '67' },
        
        { startDate: '2026-02-22', endDate: '2026-02-22', title: 'วันสุดท้าย ภาคการศึกษาที่ 2', type: 'activity', cohort: 'all' },
        
        // Summer/2568
        { startDate: '2026-02-23', endDate: '2026-03-12', title: 'ชำระค่าลงทะเบียนและค่าธรรมเนียมการศึกษา หรือค่ารักษาสถานภาพ ภาคฤดูร้อน', type: 'register', cohort: 'all' },
        { startDate: '2026-03-13', endDate: '2026-03-13', title: 'เปิดเรียนภาคฤดูร้อน', type: 'activity', cohort: 'all' },
        { startDate: '2026-05-17', endDate: '2026-05-17', title: 'วันสุดท้ายภาคการศึกษาภาคฤดูร้อน', type: 'activity', cohort: 'all' },
        
        { startDate: '2026-05-18', endDate: '2026-06-18', title: 'ปิดภาคเรียน (Vacation)', type: 'holiday', cohort: 'all' },
        
        // Semester 1/2569 (2026 CE)
        { startDate: '2026-05-22', endDate: '2026-05-24', title: 'กิจกรรม Research camp (Online)', type: 'activity', cohort: '65,66,67,68' },
        { startDate: '2026-05-30', endDate: '2026-05-31', title: 'สอบประมวลความรู้', type: 'exam', cohort: 'all' },
        
        { startDate: '2026-06-01', endDate: '2026-06-18', title: 'ชำระค่าลงทะเบียนและค่าธรรมเนียมการศึกษา ภาคการศึกษาที่ 1', type: 'register', cohort: '65,66,67,68' },
        { startDate: '2026-06-13', endDate: '2026-06-14', title: 'นักศึกษาใหม่รายงานตัวเพื่อเข้าศึกษา/ปฐมนิเทศและเตรียมความพร้อมการเรียน (69)', type: 'activity', cohort: '69' },
        
        { startDate: '2026-06-19', endDate: '2026-06-19', title: 'เปิดภาคการศึกษาที่ 1', type: 'activity', cohort: 'all' },
        
        { startDate: '2026-06-20', endDate: '2026-06-21', title: 'นำเสนอความก้าวหน้าในการทำโครงร่างวิทยานิพนธ์ (Draft)', type: 'thesis', cohort: '65,68' },
        { startDate: '2026-06-27', endDate: '2026-06-28', title: 'นำเสนอความก้าวหน้าในการทำโครงร่างวิทยานิพนธ์ (Draft)', type: 'thesis', cohort: '66' },
        { startDate: '2026-07-04', endDate: '2026-07-05', title: 'นำเสนอความก้าวหน้าในการทำโครงร่างวิทยานิพนธ์ (Draft)', type: 'thesis', cohort: '67' },
        
        { startDate: '2026-07-11', endDate: '2026-07-12', title: 'สอบหัวข้อวิทยานิพนธ์', type: 'thesis', cohort: '68' },
        
        { startDate: '2026-07-23', endDate: '2026-07-23', title: 'พิธีไหว้ครู (2569)', type: 'activity', cohort: 'all' },
        { startDate: '2026-08-15', endDate: '2026-08-16', title: 'สอบวัดมาตรฐานภาษาอังกฤษของสถาบัน ครั้งที่ 1', type: 'exam', cohort: 'all' },
        
        { startDate: '2026-09-02', endDate: '2026-09-03', title: 'นำเสนอความก้าวหน้า (Final)', type: 'thesis', cohort: '65,68' },
        { startDate: '2026-10-10', endDate: '2026-10-11', title: 'นำเสนอความก้าวหน้า (Final)', type: 'thesis', cohort: '66' },
        { startDate: '2026-10-17', endDate: '2026-10-18', title: 'นำเสนอความก้าวหน้า (Final)', type: 'thesis', cohort: '67' },
        
        { startDate: '2026-10-18', endDate: '2026-10-18', title: 'วันสุดท้าย ภาคการศึกษาที่ 1', type: 'activity', cohort: 'all' },
        
        // Semester 2/2569
        { startDate: '2026-10-19', endDate: '2026-10-30', title: 'ชำระค่าลงทะเบียนและค่าธรรมเนียมการศึกษา หรือค่ารักษาสถานภาพ ภาคเรียนที่ 2', type: 'register', cohort: 'all' },
        { startDate: '2026-10-31', endDate: '2026-10-31', title: 'เปิดภาคการศึกษาที่ 2', type: 'activity', cohort: 'all' },
        
        { startDate: '2026-11-01', endDate: '2026-11-02', title: 'นำเสนอความก้าวหน้าในการทำโครงร่างวิทยานิพนธ์ (Draft)', type: 'thesis', cohort: '65,68' },
        { startDate: '2026-11-08', endDate: '2026-11-09', title: 'นำเสนอความก้าวหน้าในการทำโครงร่างวิทยานิพนธ์ (Draft)', type: 'thesis', cohort: '66' },
        { startDate: '2026-11-22', endDate: '2026-11-23', title: 'นำเสนอความก้าวหน้าในการทำโครงร่างวิทยานิพนธ์ (Draft)', type: 'thesis', cohort: '67' },
        
        { startDate: '2026-12-26', endDate: '2026-12-26', title: 'สอบวัดมาตรฐานภาษาอังกฤษของสถาบัน ครั้งที่ 2', type: 'exam', cohort: 'all' },
        
        { startDate: '2027-02-21', endDate: '2027-02-21', title: 'วันสุดท้าย ภาคการศึกษาที่ 2', type: 'activity', cohort: 'all' },
        
        // Summer/2569 (2027 CE)
        { startDate: '2027-02-22', endDate: '2027-03-14', title: 'ชำระค่าลงทะเบียนและค่าธรรมเนียมการศึกษา หรือค่ารักษาสถานภาพ ภาคฤดูร้อน', type: 'register', cohort: 'all' },
        { startDate: '2027-03-15', endDate: '2027-03-15', title: 'เปิดเรียนภาคฤดูร้อน', type: 'activity', cohort: 'all' },
        { startDate: '2027-05-16', endDate: '2027-05-16', title: 'วันสุดท้ายภาคการศึกษาภาคฤดูร้อน', type: 'activity', cohort: 'all' },
    ],

    // ประกาศ
    announcements: [],

    // กิจกรรมล่าสุด
    recentActivities: [],

    // GPA History for chart
    gpaHistory: [],

    // แบบประเมินการสอน (ชุดข้อมูลทดสอบเบื้องต้น)
    evaluations: [
        { id: 'EV-001', type: 'course', studentId: '6701001', courseCode: 'NSG601', scores: '{"1":5,"2":4,"3":5,"4":4,"5":5}', comment: 'เนื้อหามีความทันสมัยมากครับ แต่อยากให้เพิ่มเคสศึกษาที่หลากหลายกว่านี้', date: '2026-04-10' },
        { id: 'EV-002', type: 'course', studentId: '6701002', courseCode: 'NSG601', scores: '{"1":4,"2":4,"3":4,"4":3,"5":4}', comment: 'อยากให้เพิ่มเวลาในการทำเวิร์กชอป', date: '2026-04-11' },
        { id: 'EV-003', type: 'instructor', studentId: '6701001', courseCode: 'NSG601', instructor: 'teacher-01', scores: '{"1":5,"2":5,"3":4,"4":5,"5":5}', comment: 'อาจารย์ถ่ายทอดความรู้ได้ดีมากครับ', date: '2026-04-10' },
        { id: 'EV-004', type: 'course', studentId: '6701003', courseCode: 'NSG602', scores: '{"1":3,"2":3,"3":4,"4":3,"5":3}', comment: 'เอกสารประกอบการสอนบางส่วนอ่านยากครับ', date: '2026-04-12' },
        { id: 'EV-005', type: 'course', studentId: '6701004', courseCode: 'NSG602', scores: '{"1":4,"2":3,"3":3,"4":4,"5":3}', comment: '', date: '2026-04-13' },
        { id: 'EV-006', type: 'instructor', studentId: '6701003', courseCode: 'NSG602', instructor: 'teacher-02', scores: '{"1":4,"2":4,"3":5,"4":4,"5":4}', comment: 'อาจารย์เตรียมการสอนมาดีมาก', date: '2026-04-12' }
    ],

    // คำถามประเมินแยกตามวิชา (AUN-QA v4 Focused)
    evalQuestions: [
        { question_id: '1', question_text: 'ความชัดเจนของวัตถุประสงค์การเรียนรู้ (CLO)', section: 'ด้านหลักสูตรและการจัดการ' },
        { question_id: '2', question_text: 'เนื้อหาความสอดคล้องกับวัตถุประสงค์ (LLO)', section: 'ด้านหลักสูตรและการจัดการ' },
        { question_id: '3', question_text: 'ความทันสมัยของสื่อและเอกสารประกอบการสอน', section: 'ด้านสิ่งสนับสนุนการเรียนรู้' },
        { question_id: '4', question_text: 'ความเหมาะสมของวิธีการประเมินผล', section: 'ด้านการวัดผลและประเมินผล' },
        { question_id: '5', question_text: 'การได้รับข้อมูลป้อนกลับเพื่อพัฒนาการเรียนรู้', section: 'ด้านการวัดผลและประเมินผล' }
    ],

    // อาจารย์ที่สอนแต่ละวิชา
    courseInstructors: [
        { CourseCode: 'NSG601', InstructorID: 'teacher-01' },
        { CourseCode: 'NSG602', InstructorID: 'teacher-02' }
    ],

    // คำถามประเมินอาจารย์
    evalInstructorQuestions: [
        { question_id: '1', question_text: 'อาจารย์เข้าสอนตรงเวลาและสม่ำเสมอ' },
        { question_id: '2', question_text: 'ความเชี่ยวชาญและความแม่นยำในเนื้อหาของอาจารย์' },
        { question_id: '3', question_text: 'อาจารย์เปิดโอกาสให้ซักถามและแสดงความคิดเห็น' },
        { question_id: '4', question_text: 'ความสามารถในการถ่ายทอดเนื้อหาให้เข้าใจง่าย' },
        { question_id: '5', question_text: 'อาจารย์เป็นแบบอย่างที่ดีด้านจริยธรรมวิชาชีพ' }
    ],

    // คำถามแบบประเมินการบริหารหลักสูตร
    evalCurriculumQuestions: [
        { question_id: '1', question_text: 'โครงสร้างหลักสูตรมีความทันสมัยและตอบสนองต่อความต้องการของวิชาชีพและสังคม' },
        { question_id: '2', question_text: 'รายวิชาในหลักสูตรมีความสอดคล้องและเชื่อมโยงกันอย่างเป็นระบบ' },
        { question_id: '3', question_text: 'การจัดตารางสอนและภาระงานในแต่ละภาคการศึกษามีความเหมาะสม' },
        { question_id: '4', question_text: 'กระบวนการรับฟังความคิดเห็นของนักศึกษาเพื่อนำไปพัฒนาหลักสูตรมีประสิทธิภาพ' },
        { question_id: '5', question_text: 'การประชาสัมพันธ์และให้ข้อมูลเกี่ยวกับหลักสูตรมีความชัดเจนและครบถ้วน' },
        { question_id: '6', question_text: 'ความพร้อมของคู่มือและเอกสารแนะนำการศึกษาของหลักสูตร' },
        { question_id: '7', question_text: 'การบริหารจัดการและการประสานงานของประธานและกรรมการบริหารหลักสูตร' },
        { question_id: '8', question_text: 'ผลลัพธ์การเรียนรู้ของหลักสูตร (PLOs) มีความชัดเจนและสามารถวัดได้จริง' },
        { question_id: '9', question_text: 'ภาพรวมความพึงพอใจต่อการบริหารจัดการหลักสูตรในภาพรวม' }
    ],

    // คำถามแบบประเมินสิ่งสนับสนุนการเรียนรู้
    evalFacilitiesQuestions: [
        { question_id: '1', question_text: 'ความพร้อมและคุณภาพของห้องเรียน เช่น แสงสว่าง เสียง อุณหภูมิ และที่นั่ง' },
        { question_id: '2', question_text: 'คุณภาพและความเพียงพอของอุปกรณ์โสตทัศนูปกรณ์ เช่น โปรเจคเตอร์ ไมโครโฟน' },
        { question_id: '3', question_text: 'ความเพียงพอของหนังสือ ตำรา วารสาร และฐานข้อมูลออนไลน์ในห้องสมุด' },
        { question_id: '4', question_text: 'ความเสถียรและความรวดเร็วของระบบเครือข่ายอินเทอร์เน็ต Wi-Fi ภายในคณะ/มหาวิทยาลัย' },
        { question_id: '5', question_text: 'ความเพียงพอและสภาพแวดล้อมของพื้นที่นั่งอ่านหนังสือ หรือพื้นที่ทำงานกลุ่ม' },
        { question_id: '6', question_text: 'ความพร้อมใช้งานของคอมพิวเตอร์และอุปกรณ์สำหรับนักศึกษา' },
        { question_id: '7', question_text: 'ความสะอาดและสุขอนามัยของสิ่งอำนวยความสะดวก เช่น ห้องน้ำ โรงอาหาร' },
        { question_id: '8', question_text: 'ความปลอดภัยของพื้นที่และสิ่งแวดล้อมภายในสถาบัน' },
        { question_id: '9', question_text: 'ภาพรวมความพึงพอใจต่อสิ่งสนับสนุนการเรียนรู้ในภาพรวม' }
    ],

    // คำถามแบบประเมินการบริการนักศึกษา
    evalServicesQuestions: [
        { question_id: '1', question_text: 'ความรวดเร็วและถูกต้องในการให้บริการของเจ้าหน้าที่สายสนับสนุน' },
        { question_id: '2', question_text: 'ความเป็นมิตร สุภาพ และเต็มใจให้บริการของเจ้าหน้าที่' },
        { question_id: '3', question_text: 'ประสิทธิภาพและเสถียรภาพของระบบสารสนเทศ เช่น ระบบลงทะเบียน ระบบคำร้อง' },
        { question_id: '4', question_text: 'ความสะดวกและครบถ้วนของช่องทางการให้บริการออนไลน์' },
        { question_id: '5', question_text: 'การเข้าถึงและการให้ความช่วยเหลือในด้านสวัสดิการและทุนการศึกษา' },
        { question_id: '6', question_text: 'คุณภาพของการให้คำปรึกษาด้านวิชาการและด้านส่วนตัว' },
        { question_id: '7', question_text: 'การประชาสัมพันธ์ข่าวสารและกิจกรรมต่างๆ ของคณะ/มหาวิทยาลัย มีความชัดเจนและทั่วถึง' },
        { question_id: '8', question_text: 'ช่องทางการร้องเรียนหรือข้อเสนอแนะมีความสะดวกและได้รับการตอบสนองอย่างรวดเร็ว' },
        { question_id: '9', question_text: 'ภาพรวมความพึงพอใจต่อการบริการนักศึกษาในภาพรวม' }
    ],

    // คำถามแบบประเมินผลลัพธ์การเรียนรู้ (หลักสูตร)
    evalLearningOutcomesQuestions: [
        { question_id: '1', question_text: 'ความสามารถในการประยุกต์ใช้ความรู้เชิงทฤษฎีสู่การปฏิบัติจริงและการทำงานวิจัย' },
        { question_id: '2', question_text: 'ทักษะการคิดวิเคราะห์ สังเคราะห์ และการแก้ปัญหาที่ซับซ้อนอย่างเป็นระบบ' },
        { question_id: '3', question_text: 'ทักษะการสื่อสาร การนำเสนอ และการเขียนทางวิชาการในระดับสากล' },
        { question_id: '4', question_text: 'ความสามารถในการใช้เทคโนโลยีสารสนเทศและเครื่องมือดิจิทัลในการเรียนและวิจัย' },
        { question_id: '5', question_text: 'ความสามารถในการทำงานร่วมกับผู้อื่นและการปรับตัวในสภาพแวดล้อมที่หลากหลาย' },
        { question_id: '6', question_text: 'ความรับผิดชอบต่อหน้าที่ จรรยาบรรณทางวิชาชีพ และจริยธรรมการวิจัย' },
        { question_id: '7', question_text: 'ความสามารถในการเรียนรู้ด้วยตนเอง และพัฒนาตนเองอย่างต่อเนื่อง (Lifelong Learning)' },
        { question_id: '8', question_text: 'ความพร้อมในการนำความรู้ที่ได้รับไปประยุกต์ใช้ในสายอาชีพ' },
        { question_id: '9', question_text: 'ภาพรวมความพึงพอใจต่อผลลัพธ์การเรียนรู้ที่ได้รับจากหลักสูตร' }
    ],

    // คำถามแบบประเมินอัตลักษณ์ผู้นำ
    evalLeadershipQuestions: [
        { question_id: '1', question_text: 'ความสามารถในการวางแผนและกำหนดทิศทางการทำงานอย่างชัดเจนและมีเป้าหมาย' },
        { question_id: '2', question_text: 'ความสามารถในการเป็นผู้นำกลุ่มและการเคารพ รับฟัง และยอมรับความคิดเห็นของผู้ร่วมงาน' },
        { question_id: '3', question_text: 'ความกล้าแสดงออก กล้าตัดสินใจ และการนำเสนอแนวคิดใหม่อย่างสร้างสรรค์' },
        { question_id: '4', question_text: 'ความรับผิดชอบในการตัดสินใจและการมีวุฒิภาวะในการแก้ไขปัญหาและความขัดแย้ง' },
        { question_id: '5', question_text: 'ความสามารถในการสร้างแรงบันดาลใจและกระตุ้นให้ทีมทำงานร่วมกันอย่างมีประสิทธิภาพ' },
        { question_id: '6', question_text: 'ความเสียสละและการคำนึงถึงประโยชน์ส่วนรวมมากกว่าประโยชน์ส่วนตน' },
        { question_id: '7', question_text: 'การมีจิตสาธารณะ มีส่วนร่วมในกิจกรรมพัฒนาวิชาชีพและชุมชน' },
        { question_id: '8', question_text: 'ความสามารถในการปรับตัวและรับมือกับสถานการณ์ที่ไม่แน่นอนหรือเปลี่ยนแปลงได้ดี' },
        { question_id: '9', question_text: 'ภาพรวมการแสดงออกถึงอัตลักษณ์ผู้นำตามเกณฑ์ของสถาบัน' }
    ],

    // แผนการศึกษาคณะพยาบาลศาสตร์
    studyPlans: [
        {
            id: 'nursing-adult',
            name: 'สาขาวิชาการพยาบาลผู้ใหญ่และผู้สูงอายุ (ป.โท)',
            icon: '🧓',
            description: 'หลักสูตรพยาบาลศาสตรมหาบัณฑิต เน้นการวิจัยเชิงประจักษ์ ปฏิบัติการพยาบาลขั้นสูงสำหรับผู้ใหญ่และผู้สูงอายุ',
            color: 'var(--warning)',
            requiredCredits: 36
        },
        {
            id: 'nursing-pediatric',
            name: 'สาขาวิชาการพยาบาลเด็ก (ป.โท)',
            icon: '👶',
            description: 'หลักสูตรพยาบาลศาสตรมหาบัณฑิต เน้นการวิเคราะห์ ปฏิบัติการพยาบาลขั้นสูง และทำวิจัยเพื่อสุขภาพเด็ก',
            color: 'var(--success)',
            requiredCredits: 36
        },
        {
            id: 'nursing-maternal',
            name: 'สาขาวิชาการผดุงครรภ์ (ป.โท)',
            icon: '👩‍👧‍👦',
            description: 'หลักสูตรพยาบาลศาสตรมหาบัณฑิต เน้นการวิเคราะห์ วิจัย และปฏิบัติการผดุงครรภ์ขั้นสูง ทั้งในภาวะปกติและเสี่ยงสูง',
            color: 'var(--accent-primary)',
            requiredCredits: 36
        },
        {
            id: 'nursing-mental',
            name: 'สาขาวิชาการพยาบาลจิตเวชและสุขภาพจิต (ป.โท)',
            icon: '🧠',
            description: 'หลักสูตรพยาบาลศาสตรมหาบัณฑิต เน้นวิทยาเขตบำบัด จิตเภสัชวิทยา และการพยาบาลจิตเวชฉุกเฉิน',
            color: '#ec4899',
            requiredCredits: 36
        },
        {
            id: 'nursing-community',
            name: 'สาขาวิชาการพยาบาลเวชปฏิบัติชุมชน (ป.โท)',
            icon: '🏡',
            description: 'หลักสูตรพยาบาลศาสตรมหาบัณฑิต เน้นการวิเคราะห์และพัฒนาระบบสุขภาพชุมชน การรักษาโรคเบื้องต้น',
            color: '#10b981',
            requiredCredits: 36
        },
        {
            id: 'nursing-admin',
            name: 'สาขาวิชาการบริหารทางการพยาบาล (ป.โท)',
            icon: '🏢',
            description: 'หลักสูตรพยาบาลศาสตรมหาบัณฑิต เน้นสร้างภาวะผู้นำ การจัดการคุณภาพองค์กร และกลยุทธ์สาธารณสุข',
            color: '#8b5cf6',
            requiredCredits: 36
        }
    ],

    // รายการคำร้องขอสำเร็จการศึกษา
    graduationRequests: [],

    // แบบฟอร์มคำร้องออนไลน์ (Document Templates - loaded from API)
        documentTemplates: [
        { id: "PI-GST-01", name: "แบบขออนุมัติแต่งตั้งอาจารย์ที่ปรึกษาวิทยานิพนธ์" },
        { id: "PI-GST-02", name: "แบบขออนุมัติหัวข้อวิทยานิพนธ์" },
        { id: "PI-GST-07", name: "แบบประเมินผลการสอบโครงร่างวิทยานิพนธ์" },
        { id: "PI-GST-08", name: "แบบแจ้งผลการสอบโครงร่างวิทยานิพนธ์" },
        { id: "PI-GST-09", name: "แบบรายงานแก้ไขและอนุมัติโครงร่างวิทยานิพนธ์" },
        { id: "PI-GST-10", name: "แบบขอหนังสือเชิญผู้เชี่ยวชาญพิจารณาเครื่องมือการวิจัย" },
        { id: "PI-GST-11", name: "แบบขอหนังสือลงพื้นที่เพื่อเก็บข้อมูลการวิจัย" },
        { id: "PI-GST-12", name: "แบบขอหนังสือขออนุญาตใช้/ดัดแปลงเครื่องมือวิจัย" },
        { id: "PI-GST-17", name: "แบบประเมินผลการสอบวิทยานิพนธ์" },
        { id: "PI-GST-18", name: "แบบแจ้งผลการสอบวิทยานิพนธ์" },
        { id: "PI-GST-19", name: "แบบสรุปการปรับปรุงแก้ไขวิทยานิพนธ์" },
        { id: "PI-GST-20", name: "แบบรายงานการปรับปรุงแก้ไขวิทยานิพนธ์" },
        { id: "PI-GST-21", name: "แบบขออนุมัติเปลี่ยนแปลงอาจารย์ที่ปรึกษาวิทยานิพนธ์" },
        { id: "PI-GST-22", name: "แบบขออนุมัติเปลี่ยนแปลงคณะกรรมการสอบวิทยานิพนธ์" },
        { id: "PI-GST-23", name: "แบบประเมินความก้าวหน้าการทำวิทยานิพนธ์" },
        { id: "PI-GST-24", name: "แบบคำร้องขอขยายเวลาแก้ไขวิทยานิพนธ์" },
        { id: "PI-GST-25", name: "แบบหนังสือยินยอมมอบลิขสิทธิ์" },
        { id: "PI-GST-26", name: "แบบขอส่งวิทยานิพนธ์ฉบับสมบูรณ์" },
        { id: "PI-GST-27", name: "แบบข้อมูลการเผยแพร่ผลงานวิทยานิพนธ์" }
    ],

    // เอกสารที่นักศึกษาส่ง (จาก API)
    studentDocuments: [],

    // เอกสารทั้งหมดที่รออนุมัติ (จาก API)
    adminDocuments: [],

    // ข้อมูลวิทยานิพนธ์ (จาก API)
    thesisInfo: {
        title: '-',
        titleEn: '-',
        status: '-'
    },

    // อาจารย์ที่ปรึกษาวิทยานิพนธ์ (จาก API)
    thesisAdvisors: [],

    // อาจารย์ที่ปรึกษาด้านวิชาการ (จาก API)
    academicAdvisors: [],

    // ตารางให้คำปรึกษา
    consultationSchedule: [],

    // คณะกรรมการสอบ (จาก API)
    examCommittees: [],

    // ประวัติการแจ้งหัวข้อวิทยานิพนธ์
    thesisTopicHistory: [],

    // ติดตามความก้าวหน้าวิทยานิพนธ์ (จาก API — ThesisProgress sheet)
    thesisProgress: []
};




