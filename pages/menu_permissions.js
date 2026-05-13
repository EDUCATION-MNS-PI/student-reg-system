// ============================
// Menu Permissions Management Page
// ============================
pages['menu-permissions'] = function() {
    if (!window.isSuperAdmin) {
        return `<div class="animate-in" style="padding:40px; text-align:center;">
            <div style="font-size:3rem; margin-bottom:20px;">🚫</div>
            <h2>ไม่มีสิทธิ์เข้าถึงหน้านี้</h2>
            <p>เฉพาะ Super Admin เท่านั้นที่สามารถจัดการสิทธิ์การเข้าถึงเมนูได้</p>
            <button class="btn btn-primary" onclick="navigateTo('dashboard')" style="margin-top:20px;">กลับหน้าหลัก</button>
        </div>`;
    }

    // Dynamic Menu Discovery: Scan the sidebar to get all current menu items
    const menuItems = Array.from(document.querySelectorAll('.nav-section')).flatMap(section => {
        const sectionTitle = section.querySelector('.nav-section-title')?.innerText || 'ทั่วไป';
        return Array.from(section.querySelectorAll('.nav-item')).map(nav => ({
            id: nav.id,
            label: nav.querySelector('.nav-label')?.innerText || nav.innerText.trim(),
            section: sectionTitle
        }));
    });

    const roles = [
        { id: 'student', label: 'นักศึกษา' },
        { id: 'teacher', label: 'อาจารย์/บุคลากร' }
    ];

    // Group menu items by section
    const sections = {};
    menuItems.forEach(item => {
        if (!sections[item.section]) sections[item.section] = [];
        sections[item.section].push(item);
    });

    return `
    <style>
        .perm-toggle {
            position: relative;
            display: inline-block;
            width: 48px;
            height: 24px;
        }
        .perm-toggle input {
            opacity: 0;
            width: 0;
            height: 0;
        }
        .perm-slider {
            position: absolute;
            cursor: pointer;
            top: 0; left: 0; right: 0; bottom: 0;
            background-color: #ef4444;
            transition: .3s;
            border-radius: 24px;
        }
        .perm-slider:before {
            position: absolute;
            content: "";
            height: 18px;
            width: 18px;
            left: 3px;
            bottom: 3px;
            background-color: white;
            transition: .3s;
            border-radius: 50%;
            box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
        input:checked + .perm-slider {
            background-color: #10b981;
        }
        input:focus + .perm-slider {
            box-shadow: 0 0 1px #10b981;
        }
        input:checked + .perm-slider:before {
            transform: translateX(24px);
        }
        .perm-row:hover {
            background-color: var(--bg-card-hover) !important;
        }
    </style>
    <div class="animate-in">
        <div class="page-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 25px;">
            <div>
                <h1 class="page-title">จัดการสิทธิ์การเข้าถึงเมนู</h1>
                <p class="page-subtitle">เปิด-ปิดการมองเห็นเมนูสำหรับนักศึกษาและอาจารย์</p>
            </div>
            <div class="badge success" style="padding: 10px 15px; font-size: 0.9rem;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:8px;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                Super Admin Mode
            </div>
        </div>

        <div class="card" style="margin-bottom: 30px; overflow: hidden;">
            <div class="card-body" style="padding: 0;">
                <table class="table" style="margin-bottom: 0;">
                    <thead>
                        <tr style="background: var(--bg-secondary);">
                            <th style="padding: 15px 20px; width: 40%;">รายการเมนู</th>
                            ${roles.map(r => `<th style="text-align: center; padding: 15px 20px; width: 30%;">${r.label}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${Object.keys(sections).map(section => `
                            <tr style="background: var(--bg-tertiary);">
                                <td colspan="${roles.length + 1}" style="padding: 10px 20px; font-weight: 700; color: var(--accent-primary); font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.5px;">
                                    ${section}
                                </td>
                            </tr>
                            ${sections[section].map(item => `
                                <tr class="animate-in perm-row">
                                    <td style="padding: 12px 30px;">
                                        <div style="display: flex; align-items: center; gap: 10px;">
                                            <div style="width: 8px; height: 8px; border-radius: 50%; background: var(--bg-tertiary);"></div>
                                            <span>${item.label}</span>
                                            <code style="font-size: 0.7rem; color: var(--text-muted); opacity: 0.7;">(${item.id})</code>
                                        </div>
                                    </td>
                                    ${roles.map(role => {
                                        const hasPerm = (MOCK.permissions.find(p => String(p.Role).toLowerCase() === role.id) || {})[item.id] === 'YES';
                                        return `
                                            <td style="text-align: center; padding: 10px 20px;">
                                                <label class="perm-toggle">
                                                    <input type="checkbox" ${hasPerm ? 'checked' : ''} 
                                                        onchange="toggleMenuPermission('${role.id}', '${item.id}', this.checked)">
                                                    <span class="perm-slider"></span>
                                                </label>
                                            </td>
                                        `;
                                    }).join('')}
                                </tr>
                            `).join('')}
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        
        <div style="text-align: center; color: var(--text-muted); font-size: 0.9rem; padding: 20px;">
            <p>💡 การเปลี่ยนแปลงจะมีผลทันทีหลังจากที่ผู้ใช้ทำการเข้าสู่ระบบใหม่หรือรีเฟรชหน้าจอ</p>
        </div>
    </div>`;
};

window.toggleMenuPermission = async function(role, menuId, value) {
    console.log(`Setting permission: role=${role}, menuId=${menuId}, value=${value}`);
    
    // Update local MOCK immediately for UI reactivity
    const rolePerms = MOCK.permissions.find(p => String(p.Role).toLowerCase() === role);
    if (rolePerms) {
        rolePerms[menuId] = value ? 'YES' : 'NO';
    }

    try {
        const payload = {
            role: role,
            actionKey: menuId,
            value: value
        };
        
        // Use postData which calls updatePermission in Apps Script
        const res = await postData('updatePermission', payload);
        
        if (res.status === 'success') {
            console.log('Permission updated successfully on server');
        } else {
            throw new Error(res.message);
        }
    } catch (e) {
        alert('เกิดข้อผิดพลาดในการบันทึกสิทธิ์: ' + e.message);
        // Revert local MOCK on failure
        if (rolePerms) {
            rolePerms[menuId] = value ? 'NO' : 'YES';
        }
        renderPage(); // Refresh UI to show correct state
    }
};
