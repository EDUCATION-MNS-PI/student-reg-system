// ============================
// Announcements Page
// ============================
pages.announcements = function() {
    const isAdmin = (window.currentUserRole === 'staff' || window.currentUserRole === 'admin');
    const typeColors = {
        'สำคัญ': 'danger', 'ผลการเรียน': 'info', 'การเงิน': 'warning',
        'ทุนการศึกษา': 'success', 'กิจกรรม': 'purple', 'ระบบ': 'neutral',
        'ทั่วไป': 'neutral'
    };

    // Clear notification badge when viewing announcements
    const latestAnn = MOCK.announcements && MOCK.announcements[0];
    if (latestAnn) {
        localStorage.setItem('lastSeenAnnouncementId', latestAnn.id);
        const badge = document.querySelector('.notif-badge');
        if (badge) badge.style.display = 'none';
    }

    return `
    <div class="animate-in">
        <div class="page-header" style="display:flex; justify-content:space-between; align-items:center;">
            <div>
                <h1 class="page-title">ประกาศ</h1>
                <p class="page-subtitle">ข่าวสารและประกาศจากสถาบันพระบรมราชชนก</p>
            </div>
            ${window.hasPermission('post_announcement') ? `
            <button class="btn btn-primary" onclick="openCreateAnnouncementModal()">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:8px;"><path d="M12 5v14M5 12h14"/></svg>
                สร้างประกาศใหม่
            </button>
            ` : ''}
        </div>
        <div class="announcement-list">
            ${(MOCK.announcements || []).length === 0 ? `
                <div class="card" style="text-align:center; padding:50px;">
                    <p style="color:var(--text-muted);">ยังไม่มีประกาศในขณะนี้</p>
                </div>
            ` : MOCK.announcements.map((a, i) => `
                <div class="announcement-card animate-in animate-delay-${Math.min(i+1,4)}" onclick="viewAnnouncementDetail('${a.id}')">
                    <div class="announcement-icon" style="background:var(--${typeColors[a.type] || 'neutral'}-bg, var(--bg-tertiary))">${a.icon || '📢'}</div>
                    <div class="announcement-content">
                        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
                            <h4>${a.title}</h4>
                            <span class="badge ${typeColors[a.type] || 'neutral'}">${a.type}</span>
                        </div>
                        <p>${a.content.substring(0, 100)}${a.content.length > 100 ? '...' : ''}</p>
                        <div class="announcement-date">📅 ${a.date ? window.formatDateThai(a.date) : '-'}</div>
                    </div>
                </div>
            `).join('')}
        </div>
    </div>`;
};

window.viewAnnouncementDetail = function(id) {
    const a = MOCK.announcements.find(x => x.id === id);
    if (!a) return;
    
    const typeColors = {
        'สำคัญ': 'danger', 'ผลการเรียน': 'info', 'การเงิน': 'warning',
        'ทุนการศึกษา': 'success', 'กิจกรรม': 'purple', 'ระบบ': 'neutral',
        'ทั่วไป': 'neutral'
    };

    openModal(a.title, `
        <div>
            <span class="badge ${typeColors[a.type] || 'neutral'}" style="margin-bottom:15px;">${a.type}</span>
            <div style="line-height:1.8; color:var(--text-secondary); white-space: pre-wrap; font-size:1.05rem;">${a.content}</div>
            <div style="margin-top:25px; padding-top:15px; border-top:1px solid var(--border-color); display:flex; justify-content:space-between; align-items:center;">
                <span style="font-size:0.85rem; color:var(--text-muted);">📅 วันที่ประกาศ: ${window.formatDateThai(a.date, true)}</span>
                <span style="font-size:0.85rem; color:var(--text-muted);">👤 โดย: ${a.author || 'Admin'}</span>
            </div>
            <div style="margin-top:20px; display:flex; justify-content:flex-end;">
                <button class="btn btn-secondary" onclick="closeModal()">ปิดหน้าต่าง</button>
            </div>
        </div>
    `, '700px');
};

window.openCreateAnnouncementModal = function() {
    openModal('สร้างประกาศใหม่', `
        <div style="padding:10px;">
            <div class="form-group">
                <label class="form-label">ประเภทประกาศ</label>
                <select id="annType" class="form-input">
                    <option value="ทั่วไป">ทั่วไป</option>
                    <option value="สำคัญ">สำคัญ (แดง)</option>
                    <option value="ผลการเรียน">ผลการเรียน (ฟ้า)</option>
                    <option value="การเงิน">การเงิน (เหลือง)</option>
                    <option value="ทุนการศึกษา">ทุนการศึกษา (เขียว)</option>
                    <option value="กิจกรรม">กิจกรรม (ม่วง)</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">ไอคอน (Emoji)</label>
                <input type="text" id="annIcon" class="form-input" value="📢" placeholder="เช่น 📢, 🚨, 📅">
            </div>
            <div class="form-group">
                <label class="form-label">หัวข้อประกาศ</label>
                <input type="text" id="annTitle" class="form-input" placeholder="ใส่หัวข้อสั้นๆ...">
            </div>
            <div class="form-group">
                <label class="form-label">เนื้อหาประกาศ</label>
                <textarea id="annContent" class="form-input" style="height:200px;" placeholder="ใส่รายละเอียดข่าวสาร..."></textarea>
            </div>
            <div style="display:flex; justify-content:flex-end; gap:12px; margin-top:20px;">
                <button class="btn btn-secondary" onclick="closeModal()">ยกเลิก</button>
                <button class="btn btn-primary" onclick="submitAnnouncement()">📣 ยืนยันการประกาศ</button>
            </div>
        </div>
    `, '600px');
};

window.submitAnnouncement = async function() {
    const type = document.getElementById('annType').value;
    const title = document.getElementById('annTitle').value;
    const content = document.getElementById('annContent').value;
    const icon = document.getElementById('annIcon').value;
    
    if (!title || !content) {
        alert('กรุณากรอกหัวข้อและเนื้อหาประกาศ');
        return;
    }
    
    showApiLoading('กำลังส่งประกาศและแจ้งเตือน...');
    try {
        const payload = {
            type, title, content, icon,
            author: window.currentUserData?.name || 'Admin'
        };
        
        const res = await postData('postAnnouncement', payload);
        if (res.status === 'success') {
            alert('📢 ประกาศข่าวสารเรียบร้อยแล้ว!');
            closeModal();
            // Refresh app to get new data
            location.reload();
        } else {
            throw new Error(res.message);
        }
    } catch (e) {
        alert('เกิดข้อผิดพลาด: ' + e.message);
    } finally {
        hideApiLoading();
    }
};

// ============================
// Settings Page
// ============================
pages.settings = function() {
    const isAdmin = (window.currentUserRole === 'admin' || window.currentUserRole === 'staff' || window.isSuperAdmin);
    const userEmail = MOCK.student ? MOCK.student.email : (window.currentUserData?.email || '-');
    const userPhone = MOCK.student ? MOCK.student.phone : (window.currentUserData?.phone || '-');

    // Build year options for admin semester setting
    const yearOpts = [];
    for (let y = 2565; y <= 2575; y++) {
        yearOpts.push(`<option value="${y}" ${String(y) === String(MOCK.activeYear) ? 'selected' : ''}>${y}</option>`);
    }

    const semOpts = [
        { val: 'ภาคเรียนที่ 1', label: 'ภาคเรียนที่ 1' },
        { val: 'ภาคเรียนที่ 2', label: 'ภาคเรียนที่ 2' },
        { val: 'ภาคฤดูร้อน', label: 'ภาคฤดูร้อน (Summer)' },
    ].map(s => `<option value="${s.val}" ${s.val === MOCK.activeSemester ? 'selected' : ''}>${s.label}</option>`).join('');

    return `
    <div class="animate-in">
        <div class="page-header">
            <h1 class="page-title">ตั้งค่า</h1>
            <p class="page-subtitle">จัดการการตั้งค่าบัญชีและระบบ</p>
        </div>

        ${isAdmin ? `
        <!-- ===== Admin: Active Semester Setting ===== -->
        <div class="card animate-in" style="margin-bottom:24px; border:2px solid #6366f1; border-radius:16px; background:linear-gradient(135deg, #eef2ff 0%, #faf5ff 100%); box-shadow:0 4px 6px -1px rgba(99,102,241,0.1);">
            <div class="card-body" style="padding:24px;">
                <div style="display:flex; align-items:center; gap:12px; margin-bottom:20px;">
                    <div style="width:42px; height:42px; border-radius:12px; background:#6366f1; color:white; display:flex; align-items:center; justify-content:center;">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    </div>
                    <div>
                        <h3 style="margin:0; font-size:1.15rem; font-weight:700; color:#312e81;">ตั้งค่าภาคเรียนปัจจุบัน</h3>
                        <p style="margin:2px 0 0; font-size:0.85rem; color:#6366f1;">กำหนดภาคเรียนและปีการศึกษาที่ใช้งานอยู่ในระบบทั้งหมด</p>
                    </div>
                </div>
                <div style="display:flex; gap:16px; flex-wrap:wrap; align-items:flex-end;">
                    <div style="flex:1; min-width:180px;">
                        <label style="font-size:0.8rem; font-weight:600; color:#4338ca; display:block; margin-bottom:6px;">ปีการศึกษา</label>
                        <select id="settingActiveYear" class="form-select" style="height:46px; border-radius:12px; border:2px solid #c7d2fe; font-size:1rem; font-weight:600; background:white; padding:0 14px; width:100%;">
                            ${yearOpts.join('')}
                        </select>
                    </div>
                    <div style="flex:1; min-width:220px;">
                        <label style="font-size:0.8rem; font-weight:600; color:#4338ca; display:block; margin-bottom:6px;">ภาคเรียน</label>
                        <select id="settingActiveSemester" class="form-select" style="height:46px; border-radius:12px; border:2px solid #c7d2fe; font-size:1rem; font-weight:600; background:white; padding:0 14px; width:100%;">
                            ${semOpts}
                        </select>
                    </div>
                    <button class="btn" style="height:46px; padding:0 28px; border-radius:12px; font-size:0.95rem; font-weight:700; background:#6366f1; color:white; border:none; cursor:pointer; white-space:nowrap; display:flex; align-items:center; gap:8px;" onclick="window.saveActiveSemester()">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                        บันทึกการตั้งค่า
                    </button>
                </div>
                <div style="margin-top:14px; padding:10px 16px; background:rgba(99,102,241,0.08); border-radius:10px; display:flex; align-items:center; gap:10px;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                    <span style="font-size:0.8rem; color:#4338ca;">ค่านี้จะแสดงที่ส่วนหัวของระบบ และใช้เป็นค่าเริ่มต้นสำหรับหน้าค่าตอบแทนการสอน</span>
                </div>
            </div>
        </div>
        ` : ''}

        <div class="grid-2">
            <div>
                <div class="card animate-in animate-delay-1" style="margin-bottom:18px">
                    <div class="card-body">
                        <div class="settings-section">
                            <h3 class="settings-title">ข้อมูลบัญชี</h3>
                            <div class="form-group"><label class="form-label">อีเมล</label><input class="form-input" value="${userEmail}" /></div>
                            <div class="form-group"><label class="form-label">เบอร์โทรศัพท์</label><input class="form-input" value="${userPhone}" /></div>
                            <button class="btn btn-primary">บันทึกการเปลี่ยนแปลง</button>
                        </div>
                    </div>
                </div>
                <div class="card animate-in animate-delay-2">
                    <div class="card-body">
                        <div class="settings-section">
                            <h3 class="settings-title">เปลี่ยนรหัสผ่าน</h3>
                            <div class="form-group"><label class="form-label">รหัสผ่านปัจจุบัน</label><input class="form-input" type="password" placeholder="••••••••" /></div>
                            <div class="form-group"><label class="form-label">รหัสผ่านใหม่</label><input class="form-input" type="password" placeholder="••••••••" /></div>
                            <div class="form-group"><label class="form-label">ยืนยันรหัสผ่านใหม่</label><input class="form-input" type="password" placeholder="••••••••" /></div>
                            <button class="btn btn-primary">เปลี่ยนรหัสผ่าน</button>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <div class="card animate-in animate-delay-2" style="margin-bottom:18px">
                    <div class="card-body">
                        <div class="settings-section">
                            <h3 class="settings-title">การแจ้งเตือน</h3>
                            <div class="setting-row">
                                <div class="setting-info"><h4>แจ้งเตือนอีเมล</h4><p>รับข่าวสารผ่านอีเมล</p></div>
                                <label class="toggle"><input type="checkbox" checked /><span class="toggle-slider"></span></label>
                            </div>
                            <div class="setting-row">
                                <div class="setting-info"><h4>แจ้งเตือนผลการเรียน</h4><p>แจ้งเตือนเมื่อประกาศเกรด</p></div>
                                <label class="toggle"><input type="checkbox" checked /><span class="toggle-slider"></span></label>
                            </div>
                            <div class="setting-row">
                                <div class="setting-info"><h4>แจ้งเตือนค่าธรรมเนียม</h4><p>แจ้งเตือนกำหนดชำระเงิน</p></div>
                                <label class="toggle"><input type="checkbox" checked /><span class="toggle-slider"></span></label>
                            </div>
                            <div class="setting-row">
                                <div class="setting-info"><h4>แจ้งเตือนประกาศ</h4><p>แจ้งเตือนข่าวสารใหม่</p></div>
                                <label class="toggle"><input type="checkbox" /><span class="toggle-slider"></span></label>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="card animate-in animate-delay-3">
                    <div class="card-body">
                        <div class="settings-section">
                            <h3 class="settings-title">ธีมและการแสดงผล</h3>
                            <div class="setting-row">
                                <div class="setting-info"><h4>โหมดกลางคืน</h4><p>ใช้ธีมสีเข้ม</p></div>
                                <label class="toggle"><input type="checkbox" checked /><span class="toggle-slider"></span></label>
                            </div>
                            <div class="setting-row">
                                <div class="setting-info"><h4>แสดง Animation</h4><p>เปิด/ปิดภาพเคลื่อนไหว</p></div>
                                <label class="toggle"><input type="checkbox" checked /><span class="toggle-slider"></span></label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>`;
};

window.saveActiveSemester = function() {
    const yearEl = document.getElementById('settingActiveYear');
    const semEl = document.getElementById('settingActiveSemester');
    if (!yearEl || !semEl) return;

    const newYear = yearEl.value;
    const newSem = semEl.value;

    // Update global state
    MOCK.activeYear = newYear;
    MOCK.activeSemester = newSem;

    // Persist to localStorage
    localStorage.setItem('activeYear', newYear);
    localStorage.setItem('activeSemester', newSem);

    // Update header badge immediately
    const headerSemEl = document.getElementById('headerSemester');
    if (headerSemEl) {
        headerSemEl.textContent = `${newSem}/${newYear}`;
    }

    // Reset teaching fees filter to follow the new active semester
    MOCK.selectedFeeYear = null;
    MOCK.selectedFeeSemester = null;

    alert(`✅ บันทึกการตั้งค่าเรียบร้อย!\n\nภาคเรียนปัจจุบัน: ${newSem}/${newYear}\n\nค่านี้จะถูกใช้เป็นค่าเริ่มต้นในทุกหน้าที่เกี่ยวข้อง`);
};
