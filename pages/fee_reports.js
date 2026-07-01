pages['fee-reports'] = function() {
    // Generate Mock Fee Data
    const feeStats = {
        totalExpected: 3500000,
        totalCollected: 2850000,
        totalPending: 650000,
        studentsPaid: 190,
        studentsPending: 25
    };

    const pendingStudents = [
        { id: '670012', name: 'นาย มานะ อดทน', cohort: '67', amount: 25000, due: '2026-02-15' },
        { id: '670034', name: 'นางสาว สมฤดี สุขใจ', cohort: '67', amount: 25000, due: '2026-02-15' },
        { id: '660088', name: 'นาย รักชาติ ยิ่งชีพ', cohort: '66', amount: 12000, due: '2026-01-30' },
        { id: '650110', name: 'นาง กัลยาณี ศรีสวัสดิ์', cohort: '65', amount: 8000, due: '2025-12-15' },
    ];

    const formatCurrency = (num) => {
        return new Intl.NumberFormat('th-TH').format(num) + ' ฿';
    };

    return `
    <div class="animate-in">
        <div class="page-header" style="display:flex; justify-content:space-between; align-items:flex-end;">
            <div>
                <h1 class="page-title">รายงานการชำระค่าธรรมเนียม</h1>
                <p class="page-subtitle">สถิติการรับชำระเงินและติดตามยอดค้างชำระ ภาคเรียน ${MOCK.activeSemester}/${MOCK.activeYear}</p>
            </div>
            <button class="btn btn-secondary" onclick="alert('ส่งออกรายงาน Excel สำเร็จ')">Export Excel</button>
        </div>

        <div class="dashboard-grid" style="grid-template-columns: repeat(3, 1fr); margin-bottom: 24px;">
            <div class="stat-card" style="border-left: 4px solid var(--primary-color);">
                <div class="stat-info">
                    <span class="stat-label">ยอดเรียกเก็บทั้งหมด (คาดการณ์)</span>
                    <h3 class="stat-value" style="color:var(--text-color);">${formatCurrency(feeStats.totalExpected)}</h3>
                    <span class="stat-trend" style="color:var(--text-secondary);">นักศึกษาทั้งหมด ${feeStats.studentsPaid + feeStats.studentsPending} คน</span>
                </div>
            </div>

            <div class="stat-card" style="border-left: 4px solid #10b981;">
                <div class="stat-info">
                    <span class="stat-label">ยอดชำระแล้ว</span>
                    <h3 class="stat-value" style="color:#10b981;">${formatCurrency(feeStats.totalCollected)}</h3>
                    <span class="stat-trend trend-up">ชำระแล้ว ${feeStats.studentsPaid} คน</span>
                </div>
            </div>

            <div class="stat-card" style="border-left: 4px solid #ef4444;">
                <div class="stat-info">
                    <span class="stat-label">ยอดค้างชำระ</span>
                    <h3 class="stat-value" style="color:#ef4444;">${formatCurrency(feeStats.totalPending)}</h3>
                    <span class="stat-trend trend-down">รอชำระ ${feeStats.studentsPending} คน</span>
                </div>
            </div>
        </div>

        <div class="card">
            <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
                <h3 class="card-title">รายชื่อนักศึกษาที่มียอดค้างชำระ (Pending)</h3>
                <button class="btn btn-primary" onclick="alert('ระบบกำลังส่งอีเมลแจ้งเตือนให้นักศึกษาทั้ง ${feeStats.studentsPending} คน')">ส่งอีเมลแจ้งเตือนทั้งหมด</button>
            </div>
            <div class="card-body">
                <div style="overflow-x:auto;">
                    <table class="data-table">
                        <thead style="background:#fef2f2;">
                            <tr>
                                <th>รหัสนักศึกษา</th>
                                <th>ชื่อ-นามสกุล</th>
                                <th>รุ่น</th>
                                <th style="text-align:right;">ยอดค้างชำระ</th>
                                <th>กำหนดชำระ</th>
                                <th style="text-align:center;">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${pendingStudents.map(s => `
                            <tr>
                                <td><strong>${s.id}</strong></td>
                                <td>${s.name}</td>
                                <td>รหัส ${s.cohort}</td>
                                <td style="text-align:right; color:#ef4444; font-weight:bold;">${formatCurrency(s.amount)}</td>
                                <td><span class="badge danger">${window.formatDateThai(s.due)}</span></td>
                                <td style="text-align:center;">
                                    <button class="btn btn-secondary" style="padding:4px 8px; font-size:0.75rem;" onclick="alert('ส่งอีเมลแจ้งเตือนไปยัง ${s.name} เรียบร้อย')">แจ้งเตือน</button>
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
    </div>`;
};
