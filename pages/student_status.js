pages['student-status'] = function () {
    // Generate some mock students if MOCK.students is empty or map existing ones
    // We will ensure they have a 'Status' property like 'กำลังศึกษา', 'รักษาสภาพ', 'ลาพัก', 'สำเร็จการศึกษา', 'พ้นสภาพ'

    // Inject mock students for demonstration if missing
    if (!MOCK.statusStudents || MOCK.statusStudents.length === 0) {
        MOCK.statusStudents = [
            { id: '670001', name: 'นาย สมหญิง ใจดี', major: 'การพยาบาลเด็ก', gpa: '3.50', status: 'กำลังศึกษา' },
            { id: '660045', name: 'นางสาว สมชาย เข็มกลัด', major: 'การบริหารทางการพยาบาล', gpa: '3.12', status: 'กำลังศึกษา' },
            { id: '650123', name: 'นางสาว รักดี เรียนเก่ง', major: 'การพยาบาลผู้ใหญ่', gpa: '3.85', status: 'รักษาสภาพ' },
            { id: '640999', name: 'นาย วิริยะ อุตสาหะ', major: 'การพยาบาลจิตเวช', gpa: '-', status: 'ลาพัก' },
            { id: '630555', name: 'นาง สุรีย์ สว่างไสว', major: 'การผดุงครรภ์', gpa: '3.67', status: 'สำเร็จการศึกษา' },
            { id: '650888', name: 'นาย ทดสอบ พ้นสภาพ', major: 'การพยาบาลเวชปฏิบัติชุมชน', gpa: '1.20', status: 'พ้นสภาพ' },
        ];

        // Try merging from MOCK.students if available
        if (MOCK.students && MOCK.students.length > 0) {
            MOCK.students.forEach((ms, idx) => {
                const sId = ms.studentId || ms.id || ms.StudentID || ('680' + idx);
                if (!MOCK.statusStudents.find(s => s.id === sId)) {
                    const fullName = ms.firstName && ms.lastName
                        ? `${ms.prefix || ''}${ms.firstName} ${ms.lastName}`
                        : (ms.Name || ms.name || '-');

                    const major = ms.department || ms.program || ms.Major || ms.major || 'การพยาบาลผู้ใหญ่';
                    let gpaVal = ms.gpa || ms.GPAX || ms.gpax;
                    if (typeof gpaVal === 'number') gpaVal = gpaVal.toFixed(2);
                    else if (!gpaVal) gpaVal = '0.00';

                    MOCK.statusStudents.push({
                        id: sId,
                        name: fullName,
                        major: major,
                        gpa: gpaVal,
                        status: ms.status || ms.Status || 'กำลังศึกษา'
                    });
                }
            });
        }
    }

    const students = MOCK.statusStudents;

    // Helper to get status badge colors
    const getBadgeClass = (status) => {
        if (status === 'กำลังศึกษา') return 'info';
        if (status === 'สำเร็จการศึกษา') return 'success';
        if (status === 'ลาพัก' || status === 'รักษาสภาพ') return 'warning';
        if (status === 'พ้นสภาพ') return 'danger';
        return '';
    };

    return `
    <div class="animate-in">
        <div class="page-header">
            <h1 class="page-title">ตรวจสอบและอัปเดตสภาพนักศึกษา</h1>
            <p class="page-subtitle">ค้นหารายชื่อนักศึกษาและปรับปรุงสถานะทางการศึกษา</p>
        </div>

        <div class="card">
            <div class="card-header" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
                <h3 class="card-title">รายชื่อนักศึกษาทั้งหมด</h3>
                <div style="display:flex; gap:10px;">
                    <select class="form-input" id="statusFilter" onchange="filterStudentStatus()" style="width:160px; padding:6px 12px;">
                        <option value="">-- ทุกสถานะ --</option>
                        <option value="กำลังศึกษา">กำลังศึกษา</option>
                        <option value="รักษาสภาพ">รักษาสภาพ</option>
                        <option value="ลาพัก">ลาพัก</option>
                        <option value="สำเร็จการศึกษา">สำเร็จการศึกษา</option>
                        <option value="พ้นสภาพ">พ้นสภาพ</option>
                    </select>
                    <input type="text" class="form-input" id="statusSearch" placeholder="ค้นหา รหัสนักศึกษา, ชื่อ..." style="max-width:250px; padding:6px 12px;" onkeyup="filterStudentStatus()" />
                </div>
            </div>
            
            <div class="card-body">
                <div style="overflow-x:auto;">
                    <table class="data-table" id="studentStatusTable">
                        <thead>
                            <tr>
                                <th>รหัสนักศึกษา</th>
                                <th>ชื่อ-นามสกุล</th>
                                <th>สาขาวิชา</th>
                                <th style="text-align:center;">GPAX</th>
                                <th>สถานะปัจจุบัน</th>
                                <th style="text-align:center;">อัปเดตสถานะ</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${students.map((s, index) => `
                            <tr>
                                <td><strong>${s.id}</strong></td>
                                <td>${s.name}</td>
                                <td>${s.major}</td>
                                <td style="text-align:center;">${s.gpa}</td>
                                <td><span class="badge ${getBadgeClass(s.status)}" id="status-badge-${index}">${s.status}</span></td>
                                <td style="text-align:center;">
                                    <select class="form-input" onchange="updateStudentStatusInline(${index}, this.value)" style="padding:4px 8px; font-size:0.85rem; max-width:140px; border-radius:4px; display:inline-block;">
                                        <option value="กำลังศึกษา" ${s.status === 'กำลังศึกษา' ? 'selected' : ''}>กำลังศึกษา</option>
                                        <option value="รักษาสภาพ" ${s.status === 'รักษาสภาพ' ? 'selected' : ''}>รักษาสภาพ</option>
                                        <option value="ลาพัก" ${s.status === 'ลาพัก' ? 'selected' : ''}>ลาพัก</option>
                                        <option value="สำเร็จการศึกษา" ${s.status === 'สำเร็จการศึกษา' ? 'selected' : ''}>สำเร็จการศึกษา</option>
                                        <option value="พ้นสภาพ" ${s.status === 'พ้นสภาพ' ? 'selected' : ''}>พ้นสภาพ</option>
                                    </select>
                                </td>
                            </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>`;
};

window.filterStudentStatus = function () {
    const table = document.getElementById('studentStatusTable');
    if (!table) return;
    const rows = table.getElementsByTagName('tr');

    const term = document.getElementById('statusSearch').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;

    for (let i = 1; i < rows.length; i++) {
        const text = rows[i].textContent.toLowerCase();
        let show = true;

        if (term && !text.includes(term)) show = false;

        // Status is in the 5th column <td> (index 4)
        if (statusFilter) {
            const statusCell = rows[i].getElementsByTagName('td')[4].textContent.trim();
            if (statusCell !== statusFilter) show = false;
        }

        rows[i].style.display = show ? '' : 'none';
    }
};

window.updateStudentStatusInline = async function (index, newStatus) {
    const student = MOCK.statusStudents[index];
    if (!student) return;

    if (!confirm(`ยืนยันการเปลี่ยนสถานะของ ${student.name} เป็น: ${newStatus} หรือไม่?`)) {
        renderPage(); // re-render to revert select box
        return;
    }

    showApiLoading('กำลังส่งข้อมูลไปยัง ฐานข้อมูล...');
    try {
        // 1. Call real API from api.js
        const studentId = student.id;
        const result = await window.api.updateStudentStatus(studentId, newStatus);

        if (result && result.status === 'success') {
            // 2. Update local lists for UI consistency
            student.status = newStatus; // Update flat list used in this page

            // 3. Sync with main MOCK.students list (used by other pages like Profile)
            if (MOCK.students) {
                const globalIdx = MOCK.students.findIndex(s => (s.id || s.studentId || s.StudentID) === studentId);
                if (globalIdx !== -1) {
                    MOCK.students[globalIdx].status = newStatus;
                }
            }

            alert('อัปเดตสถานะลงใน ฐานข้อมูล สำเร็จเรียบร้อยครับ!');
            renderPage();
        } else {
            throw new Error(result ? result.message : 'ไม่สามารถเชื่อมต่อ Server ได้');
        }
    } catch (e) {
        console.error('Update Status Error:', e);
        alert('เกิดข้อผิดพลาดในการบันทึก: ' + e.message);
        renderPage(); // Revert UI
    } finally {
        hideApiLoading();
    }
};

