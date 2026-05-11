pages['bulk-data'] = function() {
    return `
    <div class="animate-in">
        <div class="page-header">
            <h1 class="page-title">นำเข้า/ส่งออกข้อมูลเชิงลึก (Bulk Data)</h1>
            <p class="page-subtitle">จัดการข้อมูลระบบแบบกลุ่มผ่านไฟล์ CSV และดาวน์โหลด Template มาตรฐาน</p>
        </div>

        <div class="dashboard-grid" style="grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px;">
            
            <!-- Student Data -->
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">ข้อมูลนักศึกษา</h3>
                </div>
                <div class="card-body">
                    <p style="color:var(--text-secondary); margin-bottom: 20px; font-size: 0.9rem;">นำเข้าหรือส่งออกรายชื่อและข้อมูลส่วนตัวพื้นฐานของนักศึกษา</p>
                    <div style="display:flex; flex-direction:column; gap:10px;">
                        <button class="btn btn-outline" onclick="window.downloadBulkCSVTemplate('students')" style="width:100%;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:8px; vertical-align:middle;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                            ดาวน์โหลด Template ข้อมูลนักศึกษา
                        </button>
                        <div style="display:flex; gap:10px;">
                            <button class="btn btn-primary" style="flex:1;" onclick="document.getElementById('importStudentFile').click()">Import CSV</button>
                            <input type="file" id="importStudentFile" style="display:none;" accept=".csv" onchange="alert('อัปโหลดไฟล์ข้อมูลนักศึกษาแล้ว')" />
                            <button class="btn btn-secondary" style="flex:1;" onclick="alert('ดาวน์โหลดข้อมูลนักศึกษาสำเร็จ')">Export Data</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Grades Data -->
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">ข้อมูลผลการศึกษา (เกรด)</h3>
                </div>
                <div class="card-body">
                    <p style="color:var(--text-secondary); margin-bottom: 20px; font-size: 0.9rem;">อัปโหลดผลการเรียนของนักเรียน หรือส่งออกเกรดรวมทั้งหมด</p>
                    <div style="display:flex; flex-direction:column; gap:10px;">
                        <button class="btn btn-outline" onclick="window.downloadBulkCSVTemplate('grades')" style="width:100%;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:8px; vertical-align:middle;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                            ดาวน์โหลด Template ผลการศึกษา
                        </button>
                        <div style="display:flex; gap:10px;">
                            <button class="btn btn-primary" style="flex:1;" onclick="document.getElementById('importGradeFile').click()">Import CSV</button>
                            <input type="file" id="importGradeFile" style="display:none;" accept=".csv" onchange="alert('อัปโหลดไฟล์เกรดแล้ว สำเร็จ!')" />
                            <button class="btn btn-secondary" style="flex:1;" onclick="alert('ดาวน์โหลดผลการเรียนทั้งหมด สำเร็จ')">Export Data</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Registration Data -->
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">ข้อมูลการลงทะเบียนเรียน</h3>
                </div>
                <div class="card-body">
                    <p style="color:var(--text-secondary); margin-bottom: 20px; font-size: 0.9rem;">นำเข้าข้อมูลรายวิชาที่นักศึกษาลงทะเบียนในแต่ละภาคเรียน</p>
                    <div style="display:flex; flex-direction:column; gap:10px;">
                        <button class="btn btn-outline" onclick="window.downloadBulkCSVTemplate('registration')" style="width:100%;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:8px; vertical-align:middle;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                            ดาวน์โหลด Template ลงทะเบียน
                        </button>
                        <div style="display:flex; gap:10px;">
                            <button class="btn btn-primary" style="flex:1;" onclick="alert('เตรียมอัปโหลดการลงทะเบียน')">Import CSV</button>
                            <button class="btn btn-secondary" style="flex:1;" onclick="alert('ดาวน์โหลดการลงทะเบียนเรียนสำเร็จ')">Export Data</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Thesis Tracking Data -->
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">ข้อมูลความก้าวหน้าวิทยานิพนธ์</h3>
                </div>
                <div class="card-body">
                    <p style="color:var(--text-secondary); margin-bottom: 20px; font-size: 0.9rem;">ข้อมูลสถานะสอบ เค้าโครง และวันสอบป้องกัน (Milestones)</p>
                    <div style="display:flex; flex-direction:column; gap:10px;">
                        <button class="btn btn-outline" onclick="window.downloadBulkCSVTemplate('thesis')" style="width:100%;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:8px; vertical-align:middle;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                            ดาวน์โหลด Template ความก้าวหน้า
                        </button>
                        <div style="display:flex; gap:10px;">
                            <button class="btn btn-primary" style="flex:1;" onclick="alert('ฟีเจอร์นำเข้ากำลังพัฒนา')">Import CSV</button>
                            <button class="btn btn-secondary" style="flex:1;" onclick="alert('ดาวน์โหลดข้อมูลวิทยานิพนธ์ สำเร็จ')">Export Data</button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Schedule/Calendar Data -->
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">ตารางสอนและปฏิทิน</h3>
                </div>
                <div class="card-body">
                    <p style="color:var(--text-secondary); margin-bottom: 20px; font-size: 0.9rem;">อัปโหลดตารางเรียนตารางสอนรายภาคเรียนและห้องเรียน</p>
                    <div style="display:flex; flex-direction:column; gap:10px;">
                        <button class="btn btn-outline" onclick="window.downloadBulkCSVTemplate('schedule')" style="width:100%;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:8px; vertical-align:middle;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                            ดาวน์โหลด Template ตารางสอน
                        </button>
                        <div style="display:flex; gap:10px;">
                            <button class="btn btn-primary" style="flex:1;" onclick="alert('ฟีเจอร์นำเข้ากำลังพัฒนา')">Import CSV</button>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>`;
};

window.downloadBulkCSVTemplate = function(type) {
    let headers = [];
    let filename = '';
    
    switch (type) {
        case 'students':
            // Aligned with app.js mapping
            headers = [
                'รหัสนักศึกษา', 'คำนำหน้า', 'ชื่อ (ไทย)', 'นามสกุล (ไทย)', 'ชื่อ (EN)', 'นามสกุล (EN)', 
                'เลขประจำตัวประชาชน', 'เพศ', 'วันเกิด (YYYY-MM-DD)', 'ที่อยู่', 'เบอร์โทร', 'อีเมลส่วนตัว', 'E-mail ของสถาบัน', 
                'คณะ', 'สาขาวิชา', 'หลักสูตร', 'ชั้นปี', 'สถานะ', 'ปีการศึกษาที่เข้า', 
                'อาจารย์ที่ปรึกษา', 'อาจารย์ที่ปรึกษาวิทยานิพนธ์', 'หัวข้อวิทยานิพนธ์', 
                'สถานที่ปฏิบัติงาน', 'ตำแหน่ง', 'ผู้ปกครอง', 'เบอร์ผู้ปกครอง'
            ];
            filename = 'template_students.csv';
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
    }

    if (headers.length > 0) {
        // Build CSV content (add a BOM for UTF-8 to display Thai correctly in Excel)
        const csvContent = "\\uFEFF" + headers.join(',') + "\\n";
        
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
