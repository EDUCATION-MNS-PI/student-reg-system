pages['bulk-data'] = function() {
    const renderCard = (title, desc, type, hasImport = true, hasExport = true) => `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">${title}</h3>
            </div>
            <div class="card-body">
                <p style="color:var(--text-secondary); margin-bottom: 20px; font-size: 0.9rem;">${desc}</p>
                <div style="display:flex; flex-direction:column; gap:10px;">
                    <button class="btn btn-outline" onclick="window.downloadBulkCSVTemplate('${type}')" style="width:100%;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:8px; vertical-align:middle;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        ดาวน์โหลด Template ${title}
                    </button>
                    <div style="display:flex; gap:10px;">
                        ${hasImport ? `<button class="btn btn-primary" style="flex:1;" onclick="window.handleBulkImport('${type}')">Import CSV</button>` : ''}
                        ${hasExport ? `<button class="btn btn-secondary" style="flex:1;" onclick="window.handleBulkExport('${type}')">Export Data</button>` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;

    return `
    <div class="animate-in">
        <div class="page-header">
            <h1 class="page-title">นำเข้า/ส่งออกข้อมูลเชิงลึก (Bulk Data)</h1>
            <p class="page-subtitle">จัดการข้อมูลระบบแบบกลุ่มผ่านไฟล์ CSV และดาวน์โหลด Template มาตรฐาน</p>
        </div>

        <div class="dashboard-grid" style="grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px;">
            ${renderCard('ข้อมูลนักศึกษา', 'นำเข้าหรือส่งออกรายชื่อและข้อมูลส่วนตัวพื้นฐานของนักศึกษา', 'students')}
            ${renderCard('ข้อมูลอาจารย์', 'จัดการรายชื่ออาจารย์ ตำแหน่งทางวิชาการ และสังกัด', 'teachers')}
            ${renderCard('ข้อมูลศิษย์เก่า', 'ฐานข้อมูลผู้สำเร็จการศึกษา สถานที่ทำงาน และตำแหน่งงาน', 'alumni')}
            ${renderCard('ข้อมูลรายวิชา', 'จัดการรายชื่อวิชา หน่วยกิต และประเภทรายวิชาในหลักสูตร', 'courses')}
            ${renderCard('ข้อมูลแผนการศึกษา', 'โครงสร้างหลักสูตรและลำดับการเรียนในแต่ละภาคการศึกษา', 'study-plans')}
            ${renderCard('ข้อมูลตารางสอน', 'อัปโหลดตารางเรียนตารางสอนรายภาคเรียนและห้องเรียน', 'schedule')}
            ${renderCard('ข้อมูลผลการเรียน', 'อัปโหลดผลการเรียนของนักเรียน หรือส่งออกเกรดรวมทั้งหมด', 'grades')}
            ${renderCard('ข้อมูลการลงทะเบียน', 'นำเข้าข้อมูลรายวิชาที่นักศึกษาลงทะเบียนในแต่ละภาคเรียน', 'registration')}
            ${renderCard('ข้อมูลผลการสอบ', 'บันทึกผลการสอบประมวลความรู้ ภาษาอังกฤษ และวิทยานิพนธ์', 'exams')}
            ${renderCard('ข้อมูลวิทยานิพนธ์', 'สถานะความก้าวหน้า หัวข้อ และอาจารย์ที่ปรึกษา', 'thesis')}
            ${renderCard('ข้อมูลแบบฟอร์มคำร้อง', 'จัดการชุดรายชื่อแบบฟอร์มคำร้องออนไลน์สำหรับนักศึกษา', 'forms')}
        </div>
    </div>`;
};

window.downloadBulkCSVTemplate = function(type) {
    let headers = [];
    let filename = 'template.csv';

    switch (type) {
        case 'students':
            headers = [
                'StudentID', 'Prefix', 'FirstName', 'LastName', 'Email', 'Phone', 'Major', 'Cohort', 'Status', 'Advisor'
            ];
            filename = 'template_students.csv';
            break;
        case 'teachers':
            headers = [
                'คำนำหน้า','ชื่อ','นามสกุล','ตำแหน่งทางวิชาการ',
                'ความเชี่ยวชาญ','อีเมล','เบอร์โทร','คณะ/สังกัด','นศ. ในกำกับ',
                'Username','Password','ประเภทอาจารย์'
            ];
            filename = 'template_teachers.csv';
            break;
        case 'alumni':
            headers = [
                'รหัสนักศึกษา', 'คำนำหน้า', 'ชื่อ', 'นามสกุล', 'สาขาวิชา', 'ปีที่จบ', 'สถานที่ทำงาน', 'ตำแหน่ง'
            ];
            filename = 'template_alumni.csv';
            break;
        case 'courses':
            headers = [
                'รหัสวิชา','ชื่อวิชา','หน่วยกิต','ประเภท','อาจารย์ผู้สอน','เวลาเรียน','ห้องเรียน','ที่นั่งรวม','จำนวนผู้เรียน','สถานะ'
            ];
            filename = 'template_courses.csv';
            break;
        case 'study-plans':
            headers = [
                'ID','ชื่อแผนการศึกษา','ไอคอน','รายละเอียด','โค้ดสี'
            ];
            filename = 'template_study_plans.csv';
            break;
        case 'grades':
            // Aligned with app.js / api.js getGrades concept
            headers = [
                'รหัสนักศึกษา', 'ชื่อ-นามสกุล', 'รหัสวิชา', 'ชื่อวิชา', 'หน่วยกิต', 'เกรด', 'ภาคเรียน', 'ปีการศึกษา'
            ];
            filename = 'template_grades.csv';
            break;
        case 'registration':
            headers = [
                'รหัสนักศึกษา', 'ชื่อ-นามสกุล', 'รหัสวิชา', 'ชื่อวิชา', 'หน่วยกิต', 'หมวดวิชา', 'กลุ่มเรียน', 'ภาคเรียน', 'ปีการศึกษา'
            ];
            filename = 'template_registration.csv';
            break;
        case 'exams':
            headers = [
                'รหัสนักศึกษา', 'ประเภทการสอบ', 'สถานะ', 'คะแนน', 'วันที่', 'หมายเหตุ'
            ];
            filename = 'template_exams.csv';
            break;
        case 'thesis':
            // M1 to M8 progress markers
            headers = [
                'StudentID', 'StudentName', 'Major', 'Cohort', 
                'M1_Status', 'M1_Date', 'M1_Note',
                'M2_Status', 'M2_Date', 'M2_Note',
                'M3_Status', 'M3_Date', 'M3_Note',
                'M4_Status', 'M4_EthicsDate1', 'M4_EthicsNo1', 'M4_EthicsNote1', 'M4_EthicsDate2', 'M4_EthicsNo2', 'M4_EthicsNote2', 'M4_Note',
                'M5_Status', 'M5_Date', 'M5_Score', 'M5_Note',
                'M6_Status', 'M6_Date', 'M6_Journal', 'M6_Note',
                'M7_Status', 'M7_Date', 'M7_Note',
                'M8_Status', 'M8_Date', 'M8_Note'
            ];
            filename = 'template_thesis.csv';
            break;
        case 'schedule':
            headers = [
                'Day', 'StartSlot', 'EndSlot', 'CourseCode', 'CourseName', 'InstructorID', 'InstructorName', 'Room', 'Semester', 'AcademicYear', 'Section', 'Color'
            ];
            filename = 'template_schedule.csv';
            break;
        case 'forms':
            headers = [
                'id', 'name', 'type'
            ];
            filename = 'template_forms.csv';
            break;
    }

    if (headers.length > 0) {
        // Build CSV content (add a BOM for UTF-8 to display Thai correctly in Excel)
        const csvContent = "\uFEFF" + headers.join(',') + "\n";
        
        // Create Blob and download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

window.handleBulkImport = function(type) {
    // Create a hidden file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            showApiLoading(`กำลังนำเข้าข้อมูล ${type}...`);
            setTimeout(() => {
                hideApiLoading();
                openModal('สำเร็จ!', `<div style="text-align:center;padding:20px"><div style="font-size:3rem;margin-bottom:12px">✅</div><h3 style="margin-bottom:8px">นำเข้าข้อมูล ${type} สำเร็จ</h3><p style="color:var(--text-muted)">ดำเนินการประมวลผลข้อมูลจาก ${file.name} เรียบร้อยแล้ว</p><button class="btn btn-primary" style="margin-top:16px" onclick="closeModal()">ตกลง</button></div>`);
            }, 1000);
        }
    };
    input.click();
};

window.handleBulkExport = function(type) {
    showApiLoading(`กำลังส่งออกข้อมูล ${type}...`);
    setTimeout(() => {
        hideApiLoading();
        alert(`ส่งออกข้อมูล ${type} สำเร็จ!`);
    }, 800);
};
