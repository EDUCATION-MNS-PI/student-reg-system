// ============================
// Authentication & Login Control
// ============================

function renderLoginUI() {
    const loginHtml = `
    <div class="login-container animate-in">
        <div class="login-card">
            <div class="login-header">
                <div style="display: flex; justify-content: center; margin-bottom: 30px;">
                    <img src="assets/logo_pi.png" alt="PI Logo" style="width: 480px; max-width: 100%; transform: translateX(15px);">
                </div>
                <h2 style="font-size: 1.8rem; margin-bottom: 12px; color: var(--text-primary); font-weight: 800;">เข้าสู่ระบบ</h2>
                <div style="font-size: 1.3rem; color: var(--text-primary); font-weight: 800; margin-bottom: 35px; line-height: 1.2;">
                    ระบบทะเบียนนักศึกษา<br>
                    <span style="font-size: 1.05rem; color: var(--text-muted); font-weight: 600;">หลักสูตรพยาบาลศาสตรมหาบัณฑิต คณะพยาบาลศาสตร์</span>
                </div>
            </div>
            
            <div class="login-tabs">
                <button class="login-tab active" data-role="student" onclick="switchLoginTab('student')">นักศึกษา</button>
                <button class="login-tab" data-role="staff" onclick="switchLoginTab('staff')">บุคลากร</button>
                <button class="login-tab" data-role="admin" onclick="switchLoginTab('admin')">Admin</button>
            </div>
            
            <div id="loginError" class="login-error" style="display: none; color: #ef4444; background: #fef2f2; padding: 12px; border-radius: 8px; margin-bottom: 20px; text-align: center; font-size: 0.9rem; font-weight: 500;"></div>
            
            <div class="login-form" id="loginFormStudent">
                <div class="form-group">
                    <label class="form-label">เลขประจำตัวประชาชน (13 หลัก)</label>
                    <input type="text" id="studentIdInput" class="form-input" placeholder="x-xxxx-xxxxx-xx-x" maxlength="17" oninput="formatLoginIdCard(this)" onkeydown="if(event.key === 'Enter') handleLogin('student')">
                </div>
                <button class="btn btn-primary" style="width: 100%; justify-content: center; padding: 12px; font-size: 1rem; margin-top: 10px;" onclick="handleLogin('student')">เข้าสู่ระบบ</button>
            </div>
            
            <div class="login-form" id="loginFormStaff" style="display: none;">
                <div class="form-group">
                    <label class="form-label">อีเมลสถาบัน</label>
                    <input type="email" id="staffEmailInput" class="form-input" placeholder="email@pi.ac.th" onkeydown="if(event.key === 'Enter') handleLogin('staff')">
                </div>
                <div class="form-group">
                    <label class="form-label">รหัสผ่าน (6 หลัก)</label>
                    <input type="password" id="staffPassInput" class="form-input" placeholder="ตัวเลข 6 หลัก" maxlength="6" oninput="this.value = this.value.replace(/[^0-9]/g, '')" onkeydown="if(event.key === 'Enter') handleLogin('staff')">
                </div>
                <button class="btn btn-primary" style="width: 100%; justify-content: center; padding: 12px; font-size: 1rem; margin-top: 10px;" onclick="handleLogin('staff')">เข้าสู่ระบบ</button>
            </div>
            
            <div class="login-form" id="loginFormAdmin" style="display: none;">
                <div class="form-group">
                    <label class="form-label">รหัสผ่าน Admin (6 หลัก)</label>
                    <input type="password" id="adminPassInput" class="form-input" placeholder="ตัวเลข 6 หลัก" maxlength="6" oninput="this.value = this.value.replace(/[^0-9]/g, '')" onkeydown="if(event.key === 'Enter') handleLogin('admin')">
                </div>
                <button class="btn btn-primary" style="width: 100%; justify-content: center; padding: 12px; font-size: 1rem; margin-top: 10px;" onclick="handleLogin('admin')">เข้าสู่ระบบ</button>
            </div>
            
            <div id="connectionStatus" style="text-align: center; margin-top: 15px; font-size: 0.85rem; color: var(--text-secondary);">
                <span class="status-dot" style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #94a3b8; margin-right: 6px;"></span>
                <span id="statusText">กำลังตรวจสอบการเชื่อมต่อ...</span>
            </div>

        </div>
    </div>
    `;

    const overlay = document.createElement('div');
    overlay.id = 'loginOverlay';
    overlay.className = 'login-overlay';
    overlay.innerHTML = `
        ${loginHtml}
        <div style="position: fixed; bottom: 15px; right: 20px; font-size: 0.8rem; color: #64748b; font-weight: 500; pointer-events: none;">(อัปเดทระบบ ${window.APP_VERSION || 'V.1.2'})</div>
    `;
    document.body.appendChild(overlay);
}

function switchLoginTab(role) {
    document.querySelectorAll('.login-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.login-tab[data-role="${role}"]`).classList.add('active');

    document.querySelectorAll('.login-form').forEach(f => f.style.display = 'none');

    let targetForm = document.getElementById('loginForm' + role.charAt(0).toUpperCase() + role.slice(1));
    targetForm.style.display = 'block';
    document.getElementById('loginError').style.display = 'none';
}

function showError(msg) {
    const errEl = document.getElementById('loginError');
    errEl.textContent = msg;
    errEl.style.display = 'block';
}

function handleLogin(role) {
    if (role === 'student') {
        const rawId = document.getElementById('studentIdInput').value;
        const id = rawId.replace(/\D/g, ''); // Strip hyphens for validation and matching
        if (id.length !== 13) {
            return showError("กรุณากรอกเลขบัตรประชาชนให้ครบ 13 หลัก");
        }

        // Find matching student by 13-digit ID or Student ID
        const idTrimmed = id.trim();
        const studentRecord = (MOCK.students || []).find(s =>
            String(s.id || '').trim() === idTrimmed ||
            String(s.studentId || '').trim() === idTrimmed ||
            String(s.citizenId || s['เลขประจำตัวประชาชน'] || '').trim() === idTrimmed
        );
        const userRecord = (MOCK.users || []).find(u =>
            (String(u.id || '').trim() === idTrimmed || String(u.username || '').trim() === idTrimmed) &&
            u.role && (String(u.role).toLowerCase().trim() === 'student' || String(u.role).trim() === 'นักศึกษา')
        );

        if (studentRecord || userRecord) {
            const name = studentRecord ? ((studentRecord.firstName && studentRecord.lastName) ? studentRecord.firstName + ' ' + studentRecord.lastName : studentRecord.name || id) : (userRecord.name || id);
            performLogin('student', { id: id, name: name });
        } else {
            return showError("ไม่พบข้อมูลนักศึกษาในระบบ หรือบัญชียังไม่ถูกสร้าง");
        }

    } else if (role === 'staff') {
        const email = document.getElementById('staffEmailInput').value;
        const pass = document.getElementById('staffPassInput').value;
        if (!email) {
            return showError("กรุณากรอกอีเมล/ชื่อผู้ใช้");
        }
        if (pass.length === 0) {
            return showError("กรุณากรอกรหัสผ่าน");
        }

        // Find matching staff by searching ALL fields for Email and Password
        const emailTrimmed = email.trim();
        const passTrimmed = pass.trim();
        const userRecord = (MOCK.users || []).find(u => Object.values(u).some(v => String(v).trim() === emailTrimmed) && Object.values(u).some(v => String(v).trim() === passTrimmed) && (!u.role || String(u.role).toLowerCase().trim() !== 'admin'));
        const teacherRecord = (MOCK.academicAdvisors || []).find(t => Object.values(t).some(v => String(v).trim() === emailTrimmed) && Object.values(t).some(v => String(v).trim() === passTrimmed));

        if (userRecord || teacherRecord) {
            const roleName = userRecord ? userRecord.role : (teacherRecord.position || 'บุคลากร');
            const name = userRecord ? userRecord.name : teacherRecord.name;
            performLogin('staff', { email: email, name: name, roleName: roleName });
        } else {
            return showError("ชือผู้ใช้ หรือรหัสผ่านไม่ถูกต้อง");
        }

    } else if (role === 'admin') {
        const pass = document.getElementById('adminPassInput').value;
        if (pass.length === 0) {
            return showError("กรุณากรอกรหัสผ่าน");
        }

        const passTrimmed = pass.trim();
        console.log('Admin Login Attempt. Entered password:', passTrimmed);
        console.log('Validating against MOCK.users:', MOCK.users);

        // Find matching admin by checking role and ANY field matching the password
        const adminUser = (MOCK.users || []).find(u => {
            const roleStr = String(u.role || u['Role'] || '').toLowerCase().trim();
            const isAdmin = (roleStr === 'admin' || roleStr === 'super admin');
            
            // Check all values in the user object for a match with password
            const hasMatchingPass = Object.values(u).some(v => String(v).trim() === passTrimmed);
            
            return isAdmin && hasMatchingPass;
        });

        if (adminUser) {
            performLogin('admin', { 
                username: adminUser.username || adminUser.Username, 
                name: adminUser.name || 'ผู้ดูแลระบบ', 
                roleName: 'Admin' 
            });
        } else {
            console.error('Admin Login Failed: No matching admin record found for password:', passTrimmed);
            return showError("รหัสผ่านไม่ถูกต้อง");
        }
    }
}

function performLogin(role, userData) {
    applyLoginState(role, userData);
    
    // Save to localStorage for persistence across refreshes
    localStorage.setItem('currentUser', JSON.stringify({ role, userData }));

    // Force a re-render/navigate to landing page only on fresh login
    if (typeof navigateTo === 'function') {
        const landingPage = (role === 'student') ? 'student-dashboard' : 'dashboard';
        navigateTo(landingPage);
    }
}

window.applyLoginState = function(role, userData) {
    window.currentUserRole = role;
    if (typeof currentPage !== 'undefined' && currentPage === 'dashboard' && role === 'student') { currentPage = 'student-dashboard'; }
    window.currentUserData = userData;
    window.isAdmin = (role === 'admin');
    
    // Super Admin check: Username must be "Super admin" or Name "Super Admin"
    const username = String(userData.username || '').toLowerCase().trim();
    const name = String(userData.name || '').toLowerCase().trim();
    window.isSuperAdmin = (role === 'admin' && (username === 'super admin' || name === 'super admin'));

    // Bind current user to MOCK globally for profile rendering
    if (role === 'student' && userData.id) {
        const idStr = String(userData.id).trim();
        const nameStr = userData.name ? String(userData.name).trim() : null;

        let loggedInStudent = (MOCK.students || []).find(s =>
            String(s.id || '').trim() === idStr ||
            String(s.studentId || '').trim() === idStr ||
            String(s.citizenId || s['เลขประจำตัวประชาชน'] || '').trim() === idStr
        );

        if (!loggedInStudent && nameStr) {
            const normName = nameStr.toLowerCase();
            loggedInStudent = (MOCK.students || []).find(s => {
                const sFull = String(s.name || '').toLowerCase();
                const sParts = String(`${s.firstName || ''} ${s.lastName || ''}`).toLowerCase();
                return (sFull && sFull.includes(normName)) || (sParts && sParts.includes(normName)) || normName.includes(sParts);
            });
        }

        if (loggedInStudent) MOCK.student = loggedInStudent;
    } else if (role === 'staff' && userData.email) {
        const emailStr = String(userData.email).trim();
        const loggedInTeacher = (MOCK.academicAdvisors || []).find(t =>
            String(t.email || '').trim() === emailStr ||
            String(t.personalEmail || '').trim() === emailStr ||
            String(t.username || '').trim() === emailStr
        );
        if (loggedInTeacher) MOCK.teacher = loggedInTeacher;
    }

    // Update Layout Profile Info
    const userNameEl = document.querySelector('.user-name');
    const userRoleEl = document.querySelector('.user-role');
    const userAvatarEl = document.querySelector('.user-avatar');

    const roleMap = {
        'student': 'นักศึกษา',
        'staff': userData.roleName || 'เจ้าหน้าที่',
        'admin': window.isSuperAdmin ? 'Super Admin' : 'Admin'
    };

    const displayName = userData.name || userData.id;
    if (userNameEl) userNameEl.textContent = displayName;
    if (userRoleEl) userRoleEl.textContent = roleMap[role];
    if (userAvatarEl) userAvatarEl.textContent = displayName.charAt(0).toUpperCase();

    // Cleanup UI (if login overlay exists)
    const overlay = document.getElementById('loginOverlay');
    if (overlay) overlay.remove();
    
    const appEl = document.querySelector('.app');
    if (appEl) appEl.style.display = 'flex';

    // Enforce role-based access to sidebar items
    applyRolePermissions(role);

    // Inject Logout Button into header if not present
    if (!document.getElementById('logoutBtn')) {
        const headerRight = document.querySelector('.header-right');
        if (headerRight) {
            const logoutHtml = `
            <button class="header-btn" id="logoutBtn" aria-label="Logout" onclick="performLogout()" style="color:#ef4444; margin-left:10px;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                <span class="nav-label" style="display:none;">ออกจากระบบ</span>
            </button>`;
            headerRight.insertAdjacentHTML('beforeend', logoutHtml);
        }
    }
}

window.performLogout = function () {
    // Clear persistent storage
    localStorage.removeItem('currentUser');
    
    window.currentUserRole = null;
    window.currentUserData = null;
    window.isAdmin = false;
    
    // Clear mock state
    if (MOCK) {
        MOCK.student = null;
        MOCK.teacher = null;
    }

    document.querySelector('.app').style.display = 'none';
    
    // Remove logout button from header
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.remove();

    renderLoginUI();
};

function applyRolePermissions(role) {
    const allNavItems = document.querySelectorAll('.nav-item');

    // Super Admin always sees everything
    if (window.isSuperAdmin) {
        allNavItems.forEach(el => el.style.display = 'flex');
        return;
    }

    allNavItems.forEach(el => {
        const menuId = el.id;
        // Check if role has permission for this specific menu ID
        if (window.hasPermission(menuId)) {
            el.style.display = 'flex';
        } else {
            // Default behavior for items not yet in permissions sheet
            // Admins see most things by default unless specifically restricted
            if (role === 'admin' && !['nav-user-management', 'nav-manage-evals', 'nav-teacher-registration'].includes(menuId)) {
                 el.style.display = 'flex';
            } else {
                 el.style.display = 'none';
            }
        }
    });

    // Special case for nav-user-management and other sensitive menus
    // Ensure they stay hidden for non-super admins if not explicitly allowed
    if (!window.isSuperAdmin) {
        const sensitiveMenus = ['nav-user-management', 'nav-manage-evals', 'nav-teacher-registration', 'nav-menu-permissions'];
        sensitiveMenus.forEach(id => {
            const el = document.getElementById(id);
            if (el && !window.hasPermission(id)) {
                el.style.display = 'none';
            }
        });
    }

    // Hide sections that have no visible children
    document.querySelectorAll('.nav-section').forEach(section => {
        const hasVisibleItems = Array.from(section.querySelectorAll('.nav-item')).some(el => el.style.display !== 'none');
        section.style.display = hasVisibleItems ? 'block' : 'none';
    });
}

// Ensure Login UI kicks off
// renderLoginUI(); // Now handled by app.js to ensure window.APP_VERSION is ready

// Update connection status dot periodically
setInterval(() => {
    const dot = document.querySelector('.status-dot');
    const text = document.getElementById('statusText');
    const buttons = document.querySelectorAll('.login-form .btn');
    
    const activeStatus = window.apiDataLoaded;
    
    if (activeStatus === true) {
        if (dot) dot.style.background = '#10b981'; // Success Green
        if (text) text.textContent = 'เชื่อมต่อกับ Google Sheets แล้ว';
        buttons.forEach(b => b.disabled = false);
    } else if (activeStatus === 'error') {
        if (dot) dot.style.background = '#ef4444'; // Error Red
        if (text) text.textContent = 'การเชื่อมต่อผิดพลาด (ดูที่ Console)';
        buttons.forEach(b => b.disabled = true);
    } else {
        if (dot) dot.style.background = '#f59e0b'; // Warning Amber
        if (text) text.textContent = 'กำลังรอข้อมูลจาก Google Sheets...';
        buttons.forEach(b => b.disabled = true);
    }
}, 1000);

function formatLoginIdCard(input) {
    let value = input.value.replace(/\D/g, '');
    let formatted = '';
    if (value.length > 0) {
        formatted += value.substring(0, 1);
        if (value.length > 1) {
            formatted += '-' + value.substring(1, 5);
            if (value.length > 5) {
                formatted += '-' + value.substring(5, 10);
                if (value.length > 10) {
                    formatted += '-' + value.substring(10, 12);
                    if (value.length > 12) {
                        formatted += '-' + value.substring(12, 13);
                    }
                }
            }
        }
    }
    input.value = formatted;
}

