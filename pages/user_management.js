// ============================
// User Management Page (Super Admin Only)
// ============================

pages['user-management'] = function() {
    // Use real data from ฐานข้อมูล
    const finalUsers = (MOCK.users || []).map((u, i) => ({
        id: i + 1,
        username: u.Username || u.username,
        role: u.Role || u.role,
        name: u.Name || u.name,
        email: u.Email || u.email || '-',
        status: u.Status || u.status || 'ใช้งาน'
    }));

    return `
    <div class="animate-in">
        <div class="page-header">
            <h1 class="page-title">จัดการผู้ใช้งาน</h1>
            <p class="page-subtitle">จัดการบัญชีผู้ใช้งาน สิทธิ์การเข้าถึง และสถานะการใช้งานระบบ</p>
        </div>

        <div class="card">
            <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
                <h3 class="card-title">รายชื่อผู้ใช้งานในระบบ</h3>
                <button class="btn btn-primary" onclick="alert('ฟีเจอร์เพิ่มผู้ใช้งานกำลังพัฒนา')">+ เพิ่มผู้ใช้งาน</button>
            </div>
            <div class="card-body">
                <div style="margin-bottom: 20px;">
                    <input type="text" class="form-input" placeholder="ค้นหาผู้ใช้งาน (ชื่อ, อีเมล, บทบาท)..." style="max-width:300px;" onkeyup="filterUsers(this.value)" />
                </div>
                <div style="overflow-x:auto;">
                    <table class="data-table" id="userTable">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Username</th>
                                <th>ชื่อ-นามสกุล</th>
                                <th>อีเมล</th>
                                <th>บทบาท</th>
                                <th>สถานะ</th>
                                <th>จัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${finalUsers.map((u, i) => `
                            <tr>
                                <td>${u.id}</td>
                                <td><strong>${u.username}</strong></td>
                                <td>${u.name}</td>
                                <td>${u.email}</td>
                                <td><span class="badge ${u.role==='Super Admin' || u.role==='admin' ?'danger':'info'}">${u.role}</span></td>
                                <td><span class="badge success">${u.status}</span></td>
                                <td>
                                    <div style="display:flex; gap:6px;">
                                        <button class="btn btn-secondary" style="padding:4px 8px; font-size:0.75rem;" onclick="alert('แก้ไขผู้ใช้งาน ${u.username}')">แก้ไข</button>
                                        <button class="btn btn-outline-danger" style="padding:4px 8px; font-size:0.75rem; color:#ef4444; border-color:#ef4444;" onclick="alert('ระงับการใช้งาน ${u.username}')">ระงับ</button>
                                    </div>
                                </td>
                            </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        </div>
        
        ${window.isSuperAdmin ? `
        <!-- Role Permissions Matrix (Super Admin Only) -->
        <div class="card animate-in animate-delay-2" style="margin-top: 30px;">
            <div class="card-header">
                <h3 class="card-title">กำหนดสิทธิ์การใช้งาน (Role Permissions)</h3>
            </div>
            <div class="card-body">
                <p style="color:var(--text-muted); font-size: 0.9rem; margin-bottom: 20px;">Super Admin สามารถเปิด/ปิดสิทธิ์การเข้าถึงฟีเจอร์ต่างๆ ของแต่ละกลุ่มผู้ใช้งานได้ที่นี่</p>
                <div style="overflow-x:auto;">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>บทบาท (Role)</th>
                                <th>นำเข้าข้อมูลนศ.</th>
                                <th>โหลด Template</th>
                                <th>จัดการผู้ใช้</th>
                                <th>ส่งประกาศ</th>
                                <th>ลบข้อมูล</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${['admin', 'teacher', 'student'].map(role => {
                                const perms = (MOCK.permissions || []).find(p => String(p.Role).toLowerCase() === role) || {};
                                return `
                                <tr>
                                    <td><strong style="text-transform: capitalize;">${role}</strong></td>
                                    <td>${renderPermissionToggle(role, 'import_student', perms.import_student)}</td>
                                    <td>${renderPermissionToggle(role, 'export_template', perms.export_template)}</td>
                                    <td>${renderPermissionToggle(role, 'manage_users', perms.manage_users)}</td>
                                    <td>${renderPermissionToggle(role, 'post_announcement', perms.post_announcement)}</td>
                                    <td>${renderPermissionToggle(role, 'delete_data', perms.delete_data)}</td>
                                </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        ` : ''}
    </div>`;
};

// Helper: Render Toggle Switch for Permissions
function renderPermissionToggle(role, actionKey, value) {
    const isChecked = value === 'YES';
    const toggleId = `toggle-${role}-${actionKey}`;
    return `
    <div class="toggle-container" style="display: flex; align-items: center; justify-content: center;">
        <label class="switch" style="position: relative; display: inline-block; width: 40px; height: 22px;">
            <input type="checkbox" id="${toggleId}" ${isChecked ? 'checked' : ''} onchange="togglePerm('${role}', '${actionKey}', this.checked)">
            <span class="slider round"></span>
        </label>
    </div>
    <style>
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; transition: .4s; border-radius: 34px; }
        .slider:before { position: absolute; content: ""; height: 14px; width: 14px; left: 4px; bottom: 4px; background-color: white; transition: .4s; border-radius: 50%; }
        input:checked + .slider { background-color: var(--accent-primary); }
        input:checked + .slider:before { transform: translateX(18px); }
    </style>
    `;
}

window.togglePerm = async function(role, actionKey, isChecked) {
    showApiLoading('กำลังบันทึกการตั้งค่าสิทธิ์...');
    try {
        const res = await postData('updatePermission', {
            role: role,
            actionKey: actionKey,
            value: isChecked
        });
        
        if (res.status === 'success') {
            // Update local MOCK for immediate effect
            const pIdx = (MOCK.permissions || []).findIndex(p => String(p.Role).toLowerCase() === role);
            if (pIdx !== -1) {
                MOCK.permissions[pIdx][actionKey] = isChecked ? 'YES' : 'NO';
            }
            alert(`อัปเดตสิทธิ์ ${role} - ${actionKey} เรียบร้อยแล้ว`);
        } else {
            throw new Error(res.message);
        }
    } catch (e) {
        alert('เกิดข้อผิดพลาด: ' + e.message);
        // Revert UI toggle on failure if possible or just refresh
        renderPage();
    } finally {
        hideApiLoading();
    }
};

window.filterUsers = function(val) {
    const table = document.getElementById('userTable');
    if (!table) return;
    const rows = table.getElementsByTagName('tr');
    const term = val.toLowerCase();
    
    for (let i = 1; i < rows.length; i++) {
        const text = rows[i].textContent.toLowerCase();
        rows[i].style.display = text.includes(term) ? '' : 'none';
    }
};

