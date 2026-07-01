pages['thesis-advising-log'] = function() {
    // Generate Mock Advising Logs
    if (!MOCK.advisingLogs) {
        MOCK.advisingLogs = [
            { id: 1, date: '2026-03-01', studentId: '670001', studentName: 'นาย สมหญิง ใจดี', topic: 'ปรึกษาการตั้งชื่อหัวข้อวิทยานิพนธ์', notes: 'แนะนำให้จำกัด scope ของกลุ่มตัวอย่างให้แคบลงเฉพาะในเขตภาคเหนือ', nextSteps: 'ทบทวนวรรณกรรมเพิ่มเติม 10 บทความ' },
            { id: 2, date: '2026-03-15', studentId: '670001', studentName: 'นาย สมหญิง ใจดี', topic: 'ส่งดราฟท์บทที่ 1', notes: 'แก้ไขวัตถุประสงค์ให้สอดคล้องกับคำถามวิจัยมากขึ้น', nextSteps: 'แก้บทที่ 1 และเริ่มเขียนโครงร่างบทที่ 2' },
            { id: 3, date: '2026-04-10', studentId: '660045', studentName: 'นางสาว สมชาย เข็มกลัด', topic: 'ปรึกษาเรื่องการวิเคราะห์สถิติ', notes: 'แนะนำให้ใช้สถิติแบบ Non-parametric แทน เนื่องจาก data กระจายไม่ปกติ', nextSteps: 'Run SPSS ใหม่แล้วนำผลมาให้ดูอาทิตย์หน้า' },
        ];
    }

    const isStudent = currentUserRole === 'student';

    // If student, filter only their own logs (using a mock studentId)
    // Here we'll just mock '670001' as the logged-in student for demonstration
    const myStudentId = '670001'; 
    const logs = isStudent ? MOCK.advisingLogs.filter(l => l.studentId === myStudentId) : MOCK.advisingLogs;

    return `
    <div class="animate-in">
        <div class="page-header" style="display:flex; justify-content:space-between; align-items:flex-end;">
            <div>
                <h1 class="page-title">บันทึกการพบอาจารย์ที่ปรึกษา</h1>
                <p class="page-subtitle">บันทึกประวัติการให้คำปรึกษาและติดตามความก้าวหน้าวิทยานิพนธ์</p>
            </div>
            ${isStudent ? `<button class="btn btn-primary" onclick="showAddAdvisingLogModal()">+ เพิ่มบันทึกการเข้าพบ</button>` : ''}
        </div>

        <div class="card">
            <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
                <h3 class="card-title">${isStudent ? 'ประวัติการเข้าพบที่ปรึกษาของฉัน' : 'บันทึกการให้คำปรึกษา (นักศึกษาในควมดูแล)'}</h3>
                ${!isStudent ? `<input type="text" class="form-input" id="logSearch" placeholder="ค้นหารหัสนักศึกษา, ชื่อ..." style="width:200px; padding:6px 12px;" onkeyup="filterAdvisingLogs()" />` : ''}
            </div>
            <div class="card-body">
                <div style="overflow-x:auto;">
                    <table class="data-table" id="advisingLogTable">
                        <thead>
                            <tr>
                                <th style="width:120px;">วันที่เข้าพบ</th>
                                ${!isStudent ? `<th>รหัสนักศึกษา</th><th>ชื่อนักศึกษา</th>` : ''}
                                <th>หัวข้อที่ปรึกษา</th>
                                <th>คำแนะนำ/สิ่งที่ให้แก้ไข</th>
                                <th>สิ่งที่ต้องทำต่อ (Next Steps)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${logs.length > 0 ? logs.sort((a,b) => new Date(b.date) - new Date(a.date)).map(l => `
                            <tr>
                                <td>${window.formatDateThai(l.date)}</td>
                                ${!isStudent ? `<td><strong>${l.studentId}</strong></td><td>${l.studentName}</td>` : ''}
                                <td><strong>${l.topic}</strong></td>
                                <td>${l.notes}</td>
                                <td style="color:var(--primary-color);">${l.nextSteps}</td>
                            </tr>
                            `).join('') : `<tr><td colspan="${isStudent ? 4 : 6}" style="text-align:center; padding:20px;">ไม่มีประวัติการเข้าพบ</td></tr>`}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>`;
};

window.filterAdvisingLogs = function() {
    const table = document.getElementById('advisingLogTable');
    if (!table) return;
    const rows = table.getElementsByTagName('tr');
    const term = document.getElementById('logSearch').value.toLowerCase();
    
    for (let i = 1; i < rows.length; i++) {
        if(rows[i].cells.length <= 1) continue;
        const text = rows[i].textContent.toLowerCase();
        rows[i].style.display = text.includes(term) ? '' : 'none';
    }
};

window.showAddAdvisingLogModal = function() {
    const html = `
        <div class="form-group">
            <label class="form-label">วันที่เข้าพบ <span class="required">*</span></label>
            <input type="date" class="form-input" id="logDate" value="${new Date().toISOString().split('T')[0]}" />
        </div>
        <div class="form-group">
            <label class="form-label">หัวข้อที่ปรึกษา <span class="required">*</span></label>
            <input type="text" class="form-input" id="logTopic" placeholder="เช่น ปรึกษาหัวข้อ, ส่งดราฟท์บทที่ 3" />
        </div>
        <div class="form-group">
            <label class="form-label">คำแนะนำจากอาจารย์ที่ปรึกษา</label>
            <textarea class="form-input" id="logNotes" rows="3" placeholder="สรุปคำแนะนำหรือความเห็นของอาจารย์"></textarea>
        </div>
        <div class="form-group">
            <label class="form-label">สิ่งที่ต้องทำต่อ (Next Steps)</label>
            <textarea class="form-input" id="logNext" rows="2" placeholder="งานที่ต้องไปทำมาส่งครั้งถัดไป"></textarea>
        </div>
        <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:20px;">
            <button class="btn btn-secondary" onclick="closeModal()">ยกเลิก</button>
            <button class="btn btn-primary" onclick="saveAdvisingLog()">บันทึกข้อมูล</button>
        </div>
    `;
    openModal('เพิ่มบันทึกการเข้าพบใหม่', html);
};

window.saveAdvisingLog = async function() {
    const date = document.getElementById('logDate').value;
    const topic = document.getElementById('logTopic').value;
    const notes = document.getElementById('logNotes').value;
    const nextSteps = document.getElementById('logNext').value;
    
    if(!date || !topic) {
        alert('กรุณากรอกวันที่ และหัวข้อที่ปรึกษา');
        return;
    }
    
    showApiLoading('กำลังบันทึกข้อมูล...');
    try {
        await new Promise(r => setTimeout(r, 500));
        
        MOCK.advisingLogs.push({
            id: Date.now(),
            date: date,
            studentId: '670001', // mock student
            studentName: 'นาย สมหญิง ใจดี',
            topic: topic,
            notes: notes,
            nextSteps: nextSteps
        });
        
        closeModal();
        renderPage();
        alert('บันทึกการเข้าพบสำเร็จ');
    } catch(e) {
        alert('Error: ' + e.message);
    } finally {
        hideApiLoading();
    }
};
