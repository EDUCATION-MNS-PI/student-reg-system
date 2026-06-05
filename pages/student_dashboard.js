// ============================
// Student Dashboard Page
// ============================
pages['student-dashboard'] = function () {
    const isAdmin = (window.currentUserRole === 'staff' || window.currentUserRole === 'admin');
    
    // Auto-select a student for preview if admin and no student is selected yet
    if (!MOCK.student && isAdmin && MOCK.students && MOCK.students.length > 0) {
        MOCK.student = MOCK.students[0];
    }
    
    const st = MOCK.student;

    if (!st) {
        return `
        <div class="animate-in">
            <div class="page-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 25px;">
                <div>
                    <h1 class="page-title">แดชบอร์ดนักศึกษา</h1>
                    <p class="page-subtitle">กรุณาเลือกนักศึกษาเพื่อแสดงหน้าแดชบอร์ดตัวอย่าง</p>
                </div>
                ${isAdmin ? `
                <div style="flex-grow: 1; max-width: 400px; margin-left: 20px;">
                    <select id="studentSelector" class="form-input" onchange="changeProfileStudent(this.value)">
                        <option value="">-- เลือกนักศึกษาเพื่อดูข้อมูล --</option>
                        ${(MOCK.students || []).map(s => `
                            <option value="${s.id || s.studentId}">
                                ${s.studentId || ''} - ${s.prefix || ''}${s.firstName || ''} ${s.lastName || ''}
                            </option>
                        `).join('')}
                    </select>
                </div>
                ` : ''}
            </div>
            <div class="card"><div class="card-body" style="text-align:center; padding:60px;">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5" style="margin-bottom:20px; opacity:0.5;"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <h3 style="color:var(--text-muted);">ไม่พบข้อมูลนักศึกษา</h3>
                <p style="color:var(--text-muted);">กรุณาเข้าสู่ระบบด้วยบัญชีนักศึกษา หรือเลือกข้อมูลนักศึกษาจากรายการ</p>
            </div></div>
        </div>`;
    }

    const studentId = st.studentId || st.id || '-';
    const prefix = st.prefix || '';
    const firstName = st.firstName || '';
    const lastName = st.lastName || '';
    const department = st.department || st.major || st.program || '-';
    const status = st.status || 'กำลังศึกษา';
    const gpa = typeof st.gpa === 'number' ? st.gpa : 3.45;
    const totalCredits = typeof st.totalCredits === 'number' ? st.totalCredits : 105;
    const requiredCredits = typeof st.requiredCredits === 'number' ? st.requiredCredits : 132;
    const creditPercent = Math.round((totalCredits / requiredCredits) * 100);
    const initial = firstName ? firstName[0] : '?';

    // 12 Menu Items
    const menuItems = [
        {
            title: "ข้อมูลนักศึกษา",
            desc: "ดูประวัติส่วนตัว ที่อยู่ และข้อมูลผู้ปกครอง",
            icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
            page: "student-profile",
            gradient: "linear-gradient(135deg, #a78bfa, #7c3aed)" // Purple
        },
        {
            title: "ตารางเรียนวันนี้",
            desc: "ตรวจสอบเวลาเรียน ห้องเรียน และอาจารย์ผู้สอน",
            icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`,
            page: "schedule",
            gradient: "linear-gradient(135deg, #2dd4bf, #0f766e)" // Teal
        },
        {
            title: "แผนการศึกษา",
            desc: "ตรวจสอบหลักสูตรและวิชาที่ต้องลงทะเบียน",
            icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>`,
            page: "study-plan",
            gradient: "linear-gradient(135deg, #fb923c, #c2410c)" // Orange
        },
        {
            title: "ผลการเรียนและเกรด",
            desc: "ดูเกรดเฉลี่ยรายภาคเรียน และผลการศึกษาทั้งหมด",
            icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line><line x1="2" y1="20" x2="22" y2="20"></line></svg>`,
            page: "grades",
            gradient: "linear-gradient(135deg, #60a5fa, #1d4ed8)" // Blue
        },
        {
            title: "ใบรายงานผล (Transcript)",
            desc: "ตรวจสอบความครบถ้วนและดาวน์โหลดใบเกรดไม่เป็นทางการ",
            icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`,
            page: "transcript",
            gradient: "linear-gradient(135deg, #818cf8, #4f46e5)" // Indigo
        },
        {
            title: "ตารางสอบ",
            desc: "ตรวจสอบวัน เวลา สถานที่สอบ และเลขที่นั่งสอบ",
            icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`,
            page: "exams",
            gradient: "linear-gradient(135deg, #f87171, #b91c1c)" // Red
        },
        {
            title: "ยื่นคำร้องออนไลน์",
            desc: "ส่งคำร้องวิชาการ เอกสารลาพัก หรือคำร้องขอเอกสารสำคัญ",
            icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>`,
            page: "petitions-student",
            gradient: "linear-gradient(135deg, #fbbf24, #b45309)" // Amber
        },
        {
            title: "ติดตามสถานะเอกสาร",
            desc: "ตรวจสอบผลการอนุมัติและขั้นตอนคำร้องต่างๆ",
            icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`,
            page: "documents-status",
            gradient: "linear-gradient(135deg, #22d3ee, #0369a1)" // Cyan
        },
        {
            title: "ข้อมูลการเงินและการชำระเงิน",
            desc: "ตรวจสอบค่าธรรมเนียมการศึกษาและพิมพ์ใบแจ้งชำระเงิน",
            icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>`,
            page: "payments",
            gradient: "linear-gradient(135deg, #34d399, #047857)" // Green
        },
        {
            title: "ประเมินการเรียนการสอน",
            desc: "ทำแบบประเมินผู้สอนและประเมินรายวิชาประจำภาคการศึกษา",
            icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>`,
            page: "eval-course",
            gradient: "linear-gradient(135deg, #f472b6, #be185d)" // Pink
        },
        {
            title: "วิทยานิพนธ์ (Thesis)",
            desc: "ติดตามการยื่นหัวข้อ ความคืบหน้า และการตรวจเล่มวิทยานิพนธ์",
            icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>`,
            page: "thesis-topic",
            gradient: "linear-gradient(135deg, #94a3b8, #475569)" // Slate
        },
        {
            title: "ปฏิทินการศึกษา",
            desc: "ติดตามวันเปิดเรียน วันลงทะเบียน และวันสำคัญทางวิชาการ",
            icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line><path d="M8 14h.01"></path><path d="M12 14h.01"></path><path d="M16 14h.01"></path><path d="M8 18h.01"></path><path d="M12 18h.01"></path><path d="M16 18h.01"></path></svg>`,
            page: "calendar",
            gradient: "linear-gradient(135deg, #d946ef, #86198f)" // Fuchsia
        }
    ];

    return `
    <style>
        .student-dashboard-container {
            display: flex;
            flex-direction: column;
            gap: 24px;
        }

        .welcome-card-premium {
            background: linear-gradient(135deg, #1e1b4b, #311042);
            color: #ffffff;
            border-radius: 16px;
            padding: 30px;
            box-shadow: 0 10px 30px rgba(49, 16, 66, 0.25);
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 20px;
            position: relative;
            overflow: hidden;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .welcome-card-premium::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -30%;
            width: 100%;
            height: 200%;
            background: radial-gradient(circle, rgba(239, 68, 68, 0.15) 0%, transparent 70%);
            pointer-events: none;
        }

        .welcome-avatar-wrapper {
            display: flex;
            align-items: center;
            gap: 20px;
        }

        .welcome-avatar {
            width: 70px;
            height: 70px;
            border-radius: 50%;
            background: linear-gradient(135deg, #ef4444, #f59e0b);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            font-weight: 700;
            color: #ffffff;
            border: 3px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        }

        .welcome-details h2 {
            margin: 0 0 6px 0;
            font-size: 1.6rem;
            font-weight: 700;
            background: linear-gradient(to right, #ffffff, #e2e8f0);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .welcome-details p {
            margin: 0;
            font-size: 0.95rem;
            opacity: 0.85;
            letter-spacing: 0.3px;
        }

        .welcome-badges {
            display: flex;
            gap: 10px;
            margin-top: 8px;
        }

        .welcome-badge {
            background: rgba(255, 255, 255, 0.12);
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 600;
            border: 1px solid rgba(255, 255, 255, 0.08);
            backdrop-filter: blur(5px);
        }

        .welcome-badge.status {
            background: rgba(16, 185, 129, 0.2);
            color: #34d399;
            border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .student-stats-row {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
        }

        @media (max-width: 1024px) {
            .student-stats-row {
                grid-template-columns: repeat(2, 1fr);
            }
        }
        @media (max-width: 576px) {
            .student-stats-row {
                grid-template-columns: 1fr;
            }
        }

        .student-stat-card {
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 14px;
            padding: 20px;
            display: flex;
            align-items: center;
            gap: 15px;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .student-stat-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 15px -3px rgba(0,0,0,0.08);
            border-color: var(--accent-primary-glow);
        }

        .student-stat-icon-wrap {
            width: 46px;
            height: 46px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
        }

        .student-stat-info {
            display: flex;
            flex-direction: column;
        }

        .student-stat-val {
            font-size: 1.4rem;
            font-weight: 700;
            color: var(--text-primary);
            line-height: 1.2;
        }

        .student-stat-lbl {
            font-size: 0.82rem;
            color: var(--text-muted);
            font-weight: 500;
            margin-top: 2px;
        }

        .menu-grid-title {
            font-size: 1.2rem;
            font-weight: 700;
            color: var(--text-primary);
            margin: 12px 0 4px 0;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .student-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
        }

        @media (max-width: 1024px) {
            .student-grid {
                grid-template-columns: repeat(2, 1fr);
            }
        }
        @media (max-width: 768px) {
            .student-grid {
                grid-template-columns: 1fr;
            }
        }

        .student-menu-card {
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 14px;
            padding: 24px;
            display: flex;
            flex-direction: column;
            gap: 16px;
            cursor: pointer;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.03);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
        }

        .student-menu-card::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0; height: 3px;
            background: transparent;
            transition: background 0.3s ease;
        }

        .student-menu-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 12px 24px -5px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.02);
            border-color: var(--border-color-hover);
        }

        .student-menu-card:hover::before {
            background: var(--menu-accent-color, var(--accent-primary));
        }

        .student-menu-card-header {
            display: flex;
            align-items: center;
            gap: 14px;
        }

        .student-menu-icon {
            width: 44px;
            height: 44px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            box-shadow: 0 4px 10px rgba(0,0,0,0.08);
            transition: transform 0.3s ease;
        }

        .student-menu-card:hover .student-menu-icon {
            transform: scale(1.1) rotate(5deg);
        }

        .student-menu-title {
            font-size: 1.05rem;
            font-weight: 700;
            color: var(--text-primary);
        }

        .student-menu-desc {
            font-size: 0.85rem;
            color: var(--text-secondary);
            line-height: 1.5;
            margin: 0;
            flex-grow: 1;
        }

        .student-menu-footer {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            color: var(--text-muted);
            font-size: 0.8rem;
            font-weight: 600;
            gap: 4px;
            transition: color 0.3s ease, transform 0.3s ease;
        }

        .student-menu-card:hover .student-menu-footer {
            color: var(--menu-accent-color, var(--accent-primary));
            transform: translateX(3px);
        }
    </style>
    
    <div class="student-dashboard-container animate-in">
        <div style="display:flex; justify-content:space-between; align-items:flex-end; flex-wrap:wrap; gap:15px;">
            <div>
                <h1 class="page-title">แดชบอร์ดนักศึกษา</h1>
                <p class="page-subtitle">ศูนย์บริการและข้อมูลการศึกษาแบบครบวงจร</p>
            </div>
            ${isAdmin ? `
            <div class="card" style="margin-bottom:0; padding:10px 15px; display:flex; align-items:center; gap:12px; border-color:var(--accent-primary-glow);">
                <span style="font-size:0.85rem; font-weight:700; color:var(--accent-primary);">⚡ โหมดทดสอบสำหรับบุคลากร/แอดมิน:</span>
                <select id="studentSelector" class="form-input" onchange="changeProfileStudent(this.value)" style="width:220px; height:34px; padding:0 10px; margin-bottom:0;">
                    ${(MOCK.students || []).map(s => `
                        <option value="${s.id || s.studentId}" ${(st && (st.id === s.id || st.studentId === s.studentId)) ? 'selected' : ''}>
                            ${s.studentId || ''} - ${s.prefix || ''}${s.firstName || ''} ${s.lastName || ''}
                        </option>
                    `).join('')}
                </select>
            </div>
            ` : ''}
        </div>

        <div class="welcome-card-premium animate-in animate-delay-1">
            <div class="welcome-avatar-wrapper">
                <div class="welcome-avatar">${initial}</div>
                <div class="welcome-details">
                    <h2>สวัสดีปีการศึกษาใหม่, ${prefix}${firstName} ${lastName}</h2>
                    <p>รหัสนักศึกษา: <strong>${studentId}</strong> | หลักสูตร: <strong>${department}</strong></p>
                    <div class="welcome-badges">
                        <span class="welcome-badge">ปีการศึกษาที่ ${st.year || '3'}</span>
                        <span class="welcome-badge status">${status}</span>
                    </div>
                </div>
            </div>
            <div style="text-align: right; min-width: 150px;">
                <div style="font-size: 0.8rem; opacity: 0.7; margin-bottom: 2px;">ภาคเรียนปัจจุบัน</div>
                <div style="font-size: 1.15rem; font-weight: 700; color: #fbbf24;">${MOCK.activeSemester}/${MOCK.activeYear}</div>
            </div>
        </div>

        <div class="student-stats-row animate-in animate-delay-2">
            <div class="student-stat-card">
                <div class="student-stat-icon-wrap" style="background: linear-gradient(135deg, #3b82f6, #1d4ed8);">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                </div>
                <div class="student-stat-info">
                    <div class="student-stat-val">${Number(gpa).toFixed(2)}</div>
                    <div class="student-stat-lbl">GPAX สะสม</div>
                </div>
            </div>

            <div class="student-stat-card">
                <div class="student-stat-icon-wrap" style="background: linear-gradient(135deg, #10b981, #047857);">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
                </div>
                <div class="student-stat-info">
                    <div class="student-stat-val">${totalCredits} / ${requiredCredits}</div>
                    <div class="student-stat-lbl">หน่วยกิตสะสม (${creditPercent}%)</div>
                </div>
            </div>

            <div class="student-stat-card">
                <div class="student-stat-icon-wrap" style="background: linear-gradient(135deg, #fb923c, #c2410c);">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
                </div>
                <div class="student-stat-info">
                    <div class="student-stat-val">18 หน่วยกิต</div>
                    <div class="student-stat-lbl">ลงทะเบียนเรียนเทอมนี้</div>
                </div>
            </div>

            <div class="student-stat-card">
                <div class="student-stat-icon-wrap" style="background: linear-gradient(135deg, #a78bfa, #7c3aed);">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                </div>
                <div class="student-stat-info">
                    <div class="student-stat-val" style="font-size:1.02rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px;">
                        ${st.advisor || 'ยังไม่มีที่ปรึกษา'}
                    </div>
                    <div class="student-stat-lbl">อาจารย์ที่ปรึกษา</div>
                </div>
            </div>
        </div>

        <div>
            <div class="menu-grid-title animate-in animate-delay-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" stroke-width="2.5"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                เมนูบริการวิชาการแบบกริด
            </div>
            <p style="color: var(--text-muted); font-size: 0.88rem; margin: 0 0 20px 0;" class="animate-in animate-delay-2">เข้าใช้งานระบบต่าง ๆ ของมหาวิทยาลัยผ่านทางลัดด้านล่าง</p>
            
            <div class="student-grid">
                ${menuItems.map((item, idx) => `
                    <div class="student-menu-card animate-in" style="--menu-accent-color: ${item.gradient.split(',')[1].replace(')', '')}; animation-delay: ${0.1 + idx * 0.03}s;" onclick="navigateTo('${item.page}')">
                        <div class="student-menu-card-header">
                            <div class="student-menu-icon" style="background: ${item.gradient};">
                                ${item.icon}
                            </div>
                            <div class="student-menu-title">${item.title}</div>
                        </div>
                        <p class="student-menu-desc">${item.desc}</p>
                        <div class="student-menu-footer">
                            เข้าใช้งานระบบ
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    </div>`;
};
