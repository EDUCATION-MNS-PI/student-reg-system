pages['login-history'] = function() {
    const logs = MOCK.loginHistory || [];

    // Role badge color
    function roleBadgeClass(role) {
        const r = (role || '').toLowerCase();
        if (r.includes('admin') || r.includes('super')) return 'danger';
        if (r.includes('teacher') || r.includes('staff') || r.includes('บุคลากร') || r.includes('อาจารย์')) return 'warning';
        return 'info';
    }

    // Download CSV handler
    window.downloadLoginLog = function() {
        if (!logs.length) {
            alert('ยังไม่มีประวัติการเข้าสู่ระบบในเซสชันนี้');
            return;
        }
        const rows = [['วันเวลา', 'Username', 'Role', 'IP Address', 'สถานะ']];
        logs.forEach(l => {
            rows.push([
                l.time instanceof Date ? l.time.toLocaleString('th-TH') : l.time,
                l.user, l.role, l.ip, l.status
            ]);
        });
        const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'login_history.csv'; a.click();
        URL.revokeObjectURL(url);
    };

    const tableRows = logs.length > 0
        ? logs.map((log, i) => {
            const timeStr = log.time instanceof Date
                ? log.time.toLocaleString('th-TH')
                : String(log.time);
            const isSuccess = !String(log.status).includes('ล้มเหลว');
            return `
            <tr style="animation: fadeInUp 0.3s ease both; animation-delay: ${i * 0.04}s;">
                <td style="color:var(--text-secondary); font-size:0.88rem;">${timeStr}</td>
                <td><strong>${log.user}</strong></td>
                <td><span class="badge ${roleBadgeClass(log.role)}">${log.role}</span></td>
                <td style="font-family:monospace; color:var(--text-secondary); font-size:0.88rem;">${log.ip}</td>
                <td>
                    <span style="display:inline-flex; align-items:center; gap:5px; font-weight:600; font-size:0.88rem; color:${isSuccess ? '#10b981' : '#ef4444'};">
                        ${isSuccess
                            ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>`
                            : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`
                        }
                        ${log.status}
                    </span>
                </td>
            </tr>`;
        }).join('')
        : `<tr><td colspan="5" style="text-align:center; padding:60px; color:var(--text-muted);">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom:12px; opacity:0.4;"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                <div style="font-weight:600; margin-bottom:6px;">ยังไม่มีประวัติการเข้าสู่ระบบ</div>
                <div style="font-size:0.85rem;">ประวัติจะปรากฏที่นี่เมื่อมีการเข้าสู่ระบบในเซสชันนี้</div>
           </td></tr>`;

    // Summary counts
    const total = logs.length;
    const success = logs.filter(l => !String(l.status).includes('ล้มเหลว')).length;
    const failed = total - success;
    const uniqueUsers = new Set(logs.map(l => l.user)).size;

    return `
    <style>
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(8px); }
            to   { opacity: 1; transform: translateY(0); }
        }
    </style>
    <div class="animate-in">
        <div class="page-header" style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:24px;">
            <div>
                <h1 class="page-title">ประวัติการเข้าสู่ระบบ (Login History)</h1>
                <p class="page-subtitle">บันทึกประวัติการเข้าใช้งานระบบเพื่อการตรวจสอบความปลอดภัย</p>
            </div>
            <button class="btn btn-outline" onclick="downloadLoginLog()" style="display:flex; align-items:center; gap:8px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                Download CSV
            </button>
        </div>

        <!-- Summary Cards -->
        <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:24px;">
            <div class="card" style="margin-bottom:0; padding:18px 20px; display:flex; align-items:center; gap:14px;">
                <div style="width:42px; height:42px; border-radius:10px; background:linear-gradient(135deg,#3b82f6,#1d4ed8); display:flex; align-items:center; justify-content:center; color:#fff; flex-shrink:0;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
                </div>
                <div>
                    <div style="font-size:1.5rem; font-weight:700; color:var(--text-primary);">${total}</div>
                    <div style="font-size:0.8rem; color:var(--text-muted);">รายการทั้งหมด</div>
                </div>
            </div>
            <div class="card" style="margin-bottom:0; padding:18px 20px; display:flex; align-items:center; gap:14px;">
                <div style="width:42px; height:42px; border-radius:10px; background:linear-gradient(135deg,#10b981,#047857); display:flex; align-items:center; justify-content:center; color:#fff; flex-shrink:0;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <div>
                    <div style="font-size:1.5rem; font-weight:700; color:#10b981;">${success}</div>
                    <div style="font-size:0.8rem; color:var(--text-muted);">เข้าสู่ระบบสำเร็จ</div>
                </div>
            </div>
            <div class="card" style="margin-bottom:0; padding:18px 20px; display:flex; align-items:center; gap:14px;">
                <div style="width:42px; height:42px; border-radius:10px; background:linear-gradient(135deg,#ef4444,#b91c1c); display:flex; align-items:center; justify-content:center; color:#fff; flex-shrink:0;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </div>
                <div>
                    <div style="font-size:1.5rem; font-weight:700; color:#ef4444;">${failed}</div>
                    <div style="font-size:0.8rem; color:var(--text-muted);">ล้มเหลว</div>
                </div>
            </div>
            <div class="card" style="margin-bottom:0; padding:18px 20px; display:flex; align-items:center; gap:14px;">
                <div style="width:42px; height:42px; border-radius:10px; background:linear-gradient(135deg,#f59e0b,#b45309); display:flex; align-items:center; justify-content:center; color:#fff; flex-shrink:0;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                </div>
                <div>
                    <div style="font-size:1.5rem; font-weight:700; color:var(--text-primary);">${uniqueUsers}</div>
                    <div style="font-size:0.8rem; color:var(--text-muted);">ผู้ใช้ (ไม่ซ้ำ)</div>
                </div>
            </div>
        </div>

        <div class="card">
            <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
                <h3 class="card-title">รายการเข้าสู่ระบบล่าสุด</h3>
                <span style="font-size:0.82rem; color:var(--text-muted);">บันทึกในเซสชันปัจจุบัน ${total} รายการ</span>
            </div>
            <div class="card-body">
                <div style="overflow-x:auto;">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>วันเวลาที่เข้าสู่ระบบ</th>
                                <th>บัญชีผู้ใช้งาน (Username)</th>
                                <th>ระดับสิทธิ์ (Role)</th>
                                <th>IP Address</th>
                                <th>สถานะ</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tableRows}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>`;
};
