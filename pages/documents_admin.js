// ============================
// Admin Documents Approval Page
// ============================
pages['documents-admin'] = function() {
    const docs = MOCK.adminDocuments || [];

    return `
    <div class="animate-in">
        <div class="page-header">
            <h1 class="page-title">อนุมัติเอกสาร</h1>
            <p class="page-subtitle">ดาวน์โหลดเอกสารเพื่อลงนาม อัปโหลดเอกสารที่ลงนามแล้ว และส่งต่อตามขั้นตอนอุนมัติ</p>
        </div>

        <div class="card animate-in animate-delay-1">
            <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
                <h3 class="card-title">รายการเอกสารรออนุมัติ</h3>
                <div class="search-box" style="width: 250px; min-width: unset;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <input type="text" id="adminDocQuery" placeholder="ค้นหารหัสนักศึกษา, ชื่อ, นามสกุล, สาขาวิชา..." style="font-size:0.8rem; padding:4px 8px;" onkeyup="searchAdminDocs()">
                </div>
            </div>
            
            <div class="card-body" style="padding: 0;">
                <div class="table-wrapper">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>รหัสเอกสาร / แบบฟอร์ม</th>
                                <th>ข้อมูลนักศึกษา</th>
                                <th>สถานะ / ขั้นตอนปัจจุบัน</th>
                                <th>การดำเนินการ (ดาวน์โหลด/ลงนาม)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${docs.length === 0 ? `<tr><td colspan="4" style="text-align:center;color:var(--text-muted)">ไม่มีเอกสารรออนุมัติ</td></tr>` : ''}
                            ${docs.map(d => {
                                let badgeClass = 'warning';
                                if (d.status.includes('อนุมัติแล้ว')) badgeClass = 'success';
                                else if (d.status.includes('ปฏิเสธ')) badgeClass = 'danger';
                                
                                return `
                                <tr class="admin-doc-row" data-search="${[d.id, d.formName, d.senderName, d.studentId, d.status].join(' ').toLowerCase()}">
                                    <td>
                                        <div style="font-weight:600; color:var(--accent-primary)">${d.id}</div>
                                        <div style="font-size:0.85rem; margin-top:4px;">${d.formName}</div>
                                        <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">ส่งเมื่อ: ${d.submitDate}</div>
                                    </td>
                                    <td>
                                        <div style="font-weight:600;">${d.senderName}</div>
                                        <div style="font-size:0.85rem; color:var(--text-muted);">รหัส: ${d.studentId}</div>
                                    </td>
                                    <td>
                                        <span class="badge ${badgeClass}">${d.status}</span>
                                        ${d.nextStep ? `<div style="font-size:0.75rem; color:var(--text-muted); margin-top:6px;">รอ: ${d.nextStep}</div>` : ''}
                                    </td>
                                    <td>
                                        <div style="display:flex; flex-direction:column; gap:8px;">
                                            <div style="display:flex; gap:8px;">
                                                <button class="btn btn-sm btn-secondary" onclick="previewAdminDoc('${d.id}')" title="พรีวิวตรวจสอบเอกสาร">
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                                    พรีวิวเอกสาร
                                                </button>
                                                <button class="btn btn-sm btn-primary" onclick="openUploadSignedModal('${d.id}')" title="อัปโหลดไฟล์ที่ลงนามแล้ว">
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                                                    อัปโหลด
                                                </button>
                                            </div>
                                            <button class="btn btn-sm" style="background:var(--bg-tertiary); color:var(--text-primary); border:1px solid var(--border-color);" onclick="forwardAdminDoc('${d.id}')">
                                                ส่งต่อ / เปลี่ยนสถานะ
                                            </button>
                                        </div>
                                    </td>
                                </tr>`;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>`;
};

window.downloadAdminDoc = function(docId) {
    const doc = MOCK.adminDocuments.find(d => d.id === docId);
    if (doc) {
        const urlStr = doc.signedFileUrl || doc.fileUrl;
        if (urlStr) {
            const urls = urlStr.split(',').map(u => u.trim()).filter(Boolean);
            urls.forEach((url, index) => {
                setTimeout(() => {
                    const targetUrl = window.getDriveUrl(url, 'file');
                    const a = document.createElement('a');
                    a.href = targetUrl;
                    a.target = '_blank';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                }, index * 800);
            });
            return;
        }
    }
    alert('ไม่พบลิงก์สำหรับดาวน์โหลดเอกสารนี้');
};

window.downloadAdminDocOriginal = function(docId) {
    const doc = MOCK.adminDocuments.find(d => d.id === docId);
    if (doc && doc.fileUrl) {
        const urls = doc.fileUrl.split(',').map(u => u.trim()).filter(Boolean);
        urls.forEach((url, index) => {
            setTimeout(() => {
                const targetUrl = window.getDriveUrl(url, 'file');
                const a = document.createElement('a');
                a.href = targetUrl;
                a.target = '_blank';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }, index * 800);
        });
        return;
    }
    alert('ไม่พบไฟล์ต้นฉบับสำหรับเอกสารนี้');
};

window.syncAdminDocuments = async function() {
    showApiLoading('กำลังโหลดข้อมูลเอกสารจากฐานข้อมูล...');
    try {
        const data = await fetchData('getDocuments');
        if (data && Array.isArray(data)) {
            // Map Sheet data to MOCK format
            MOCK.adminDocuments = data.map((row, index) => {
                const docId = row['รหัสติดตาม'] || ('DOC-L' + (1000 + index));
                return {
                    id: docId,
                    studentId: row['รหัสนักศึกษา'] || '',
                    senderName: row['ชื่อผู้ส่ง'] || '',
                    studentName: row['ชื่อผู้ส่ง'] || '', // Fallback
                    formName: row['ประเภทเอกสาร'] || 'คำร้องทั่วไป',
                    documentType: row['ประเภทเอกสาร'] || 'คำร้องทั่วไป',
                    submitDate: row['วันที่ส่ง'] || '-',
                    status: row['สถานะ'] || 'รอตรวจสอบ',
                    nextStep: row['ผู้รับผิดชอบถัดไป'] || null,
                    attachment: row['ชื่อไฟล์'] || '-',
                    fileUrl: row['ลิงก์เอกสาร'] || null,
                    signedFileUrl: row['ลิงก์เอกสารที่ลงนาม'] || null,
                    note: row['หมายเหตุ'] || '',
                    history: row['ประวัติการดำเนินการ'] || '[]'
                };
            });
            
            // Reverse to show newest first
            MOCK.adminDocuments = MOCK.adminDocuments.reverse();
            
            hideApiLoading();
            renderPage(); 
        } else {
            hideApiLoading();
            alert('ไม่สามารถดึงข้อมูลได้ หรือไม่มีข้อมูลในระบบ');
        }
    } catch (err) {
        hideApiLoading();
        console.error('Sync Error:', err);
    }
};

window.init_documents_admin = function() {
    // If global data loaded successfully, we already have adminDocuments in MOCK. 
    // Only fetch if explicitly marked as not done or if we need a refresh.
    if (!MOCK.adminDocsSyncDone && window.apiDataLoaded === true) {
        // Data is already there from bootApp, just mark as done
        MOCK.adminDocsSyncDone = true;
    }
    
    if (!MOCK.adminDocsSyncDone) {
        window.syncAdminDocuments().then(() => {
            MOCK.adminDocsSyncDone = true;
        });
    }
};

window.openUploadSignedModal = function(docId) {
    const doc = MOCK.adminDocuments.find(d => d.id === docId);
    if (!doc) return;
    
    const modalHtml = `
        <div style="padding:10px;">
            <p style="margin-bottom:15px;">อัปโหลดไฟล์ที่ได้รับการลงนามแล้วสำหรับเอกสารรหัส <strong>${docId}</strong></p>
            
            <div class="form-group">
                <label class="form-label">เลือกไฟล์เอกสาร (PDF หรือรูปภาพ)</label>
                <div style="border: 2px dashed var(--border-color); padding: 25px; text-align: center; border-radius: var(--radius-md); background: var(--bg-tertiary); cursor: pointer;" onclick="document.getElementById('signedFile').click()">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2" style="margin-bottom: 8px;">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                    <p style="color: var(--text-muted); font-size: 0.85rem;" id="signedFileNameDisplay">คลิกเพื่อเลือกไฟล์ที่ลงนามแล้ว (เลือกได้หลายไฟล์)</p>
                    <input type="file" id="signedFile" style="display: none;" onchange="updateSignedFileName(this)" multiple>
                </div>
            </div>
            
            <div id="uploadPreviewSection" class="animate-in" style="display:none; margin-top:15px; padding:15px; background:var(--bg-secondary); border:1px solid var(--border-color); border-radius:var(--radius-md); text-align:center;">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="2" style="margin-bottom:10px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><polyline points="9 15 11 17 15 13"></polyline></svg>
                <div style="font-weight:500; color:var(--text-primary); font-size:0.95rem;">ไฟล์พร้อมสำหรับอัปโหลดเข้าสู่ระบบ</div>
                <div id="uploadFileSize" style="font-size:0.85rem; color:var(--text-muted); margin-top:4px;">ขนาดไฟล์: -</div>
            </div>
            
            <button class="btn btn-primary" style="width:100%; margin-top:15px;" onclick="submitSignedDoc('${docId}')">ยืนยันการอัปโหลดเข้าสู่ระบบ</button>
        </div>
    `;
    
    openModal('อัปโหลดเอกสารลงนาม', modalHtml);
};

window.updateSignedFileName = function(input) {
    const display = document.getElementById('signedFileNameDisplay');
    const previewSection = document.getElementById('uploadPreviewSection');
    const sizeDisplay = document.getElementById('uploadFileSize');
    
    if (input.files && input.files.length > 0) {
        if (input.files.length === 1) {
            display.textContent = input.files[0].name;
        } else {
            display.textContent = `เลือกแล้ว ${input.files.length} ไฟล์`;
        }
        display.style.color = 'var(--text-primary)';
        display.style.fontWeight = '600';
        
        if (previewSection) {
            previewSection.style.display = 'block';
            let totalSize = 0;
            for (let i = 0; i < input.files.length; i++) totalSize += input.files[i].size;
            const sizeInMB = (totalSize / (1024 * 1024)).toFixed(2);
            sizeDisplay.textContent = `ขนาดรวม: ${sizeInMB > 0.00 ? sizeInMB : '0.01'} MB`;
        }
    } else {
        if (previewSection) previewSection.style.display = 'none';
        display.textContent = 'คลิกเพื่อเลือกไฟล์ที่ลงนามแล้ว (เลือกได้หลายไฟล์)';
        display.style.color = 'var(--text-muted)';
        display.style.fontWeight = 'normal';
    }
};

window.previewAdminDoc = function(docId) {
    const doc = MOCK.adminDocuments.find(d => d.id === docId);
    if (!doc) return;
    
    showApiLoading('กำลังเปิดเครื่องมือดูเอกสาร...');
    setTimeout(() => {
        hideApiLoading();
        
        let previewContent = '';
        const displayUrl = doc.signedFileUrl || doc.fileUrl;

        if (displayUrl) {
            const urls = displayUrl.split(',').map(u => u.trim());
            const names = (doc.attachment || '').split(',').map(n => n.trim());

            // 1. List of ALL files (Show on TOP per user request)
            let filesListHtml = '';
            if (urls.length > 1) {
                filesListHtml = `
                    <div style="background:#f8fafc; border:1px solid var(--border-color); border-radius:var(--radius-md); padding:15px; margin-bottom:15px;">
                        <h4 style="margin-top:0; margin-bottom:12px; color:var(--text-primary); font-size:1rem; display:flex; align-items:center; gap:8px;">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                            รายการไฟล์แนบทั้งหมด (${urls.length} ไฟล์)
                        </h4>
                        <div style="display:flex; flex-direction:column; gap:8px;">
                            ${urls.map((url, idx) => {
                                const name = names[idx] || `ไฟล์ที่ ${idx + 1}`;
                                const targetUrl = window.getDriveUrl(url, 'file');
                                return `
                                    <a href="${targetUrl}" target="_blank" style="display:flex; align-items:center; gap:10px; padding:10px; background:white; border:1px solid var(--border-color); border-radius:var(--radius-sm); color:var(--accent-primary); text-decoration:none; font-weight:500; font-size:0.9rem; transition:all 0.2s;" onmouseover="this.style.borderColor='var(--accent-primary)';" onmouseout="this.style.borderColor='var(--border-color)';">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                                        <span style="flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${name}</span>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                                    </a>
                                `;
                            }).join('')}
                        </div>
                    </div>
                `;
            }

            // 2. Visual Preview for the FIRST file (Now at BOTTOM)
            const embedUrl = window.getDriveUrl(urls[0], 'preview');
            const iframeHtml = `<iframe src="${embedUrl}" style="width:100%; height:550px; border:none; border-radius:var(--radius-sm);" allow="autoplay"></iframe>`;

            previewContent = filesListHtml + iframeHtml;
        } else {
            previewContent = `
                <div class="animate-in" style="background:#f1f5f9; border:1px solid var(--border-color); border-radius:var(--radius-md); padding:20px; text-align:center; min-height:450px; display:flex; flex-direction:column; justify-content:center; align-items:center;">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5" style="margin-bottom:15px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                    <div style="color:var(--text-primary); font-weight:500; font-size:1.1rem; margin-bottom:5px;">ไม่พบไฟล์เอกสาร</div>
                    <div style="color:var(--text-muted); font-size:0.9rem;">(เอกสารนี้อาจถูกส่งก่อนที่จะมีการอัปเกรดระบบจัดเก็บไฟล์)</div>
                </div>
            `;
        }

        let downloadBtn = '';
        if (doc.fileUrl) {
            const urls = doc.fileUrl.split(',').map(u => u.trim()).filter(Boolean);
            const label = urls.length > 1 ? `ดาวน์โหลดต้นฉบับทั้งหมด (${urls.length})` : `เปิดไฟล์ต้นฉบับ`;
            downloadBtn = `
                <button class="btn btn-primary btn-sm" onclick="window.downloadAdminDocOriginal('${doc.id}')">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    ${label}
                </button>
            `;
        }

        // 3. Document Timeline (ประวัติการดำเนินการ)
        let history = [];
        try { history = JSON.parse(doc.history || '[]'); } catch(e) { history = []; }
        
        let timelineHtml = '';
        if (history.length > 0) {
            timelineHtml = `
                <div style="margin-top:25px; padding-top:20px; border-top:1px solid var(--border-color);">
                    <h4 style="margin:0 0 15px; color:var(--text-primary); font-size:1rem; display:flex; align-items:center; gap:8px;">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        เส้นเวลาการดำเนินงาน (Timeline)
                    </h4>
                    <div class="timeline">
                        ${history.map((h, idx) => {
                            const isActive = (idx === history.length - 1);
                            let statusBadge = '';
                            if (h.status) {
                                let badgeClass = 'neutral';
                                if (h.status.includes('อนุมัติ')) badgeClass = 'success';
                                if (h.status.includes('ปฏิเสธ')) badgeClass = 'danger';
                                if (h.status.includes('รอ') || h.status.includes('กำลัง')) badgeClass = 'warning';
                                statusBadge = `<span class="timeline-status badge ${badgeClass}">${h.status}</span>`;
                            }

                            return `
                                <div class="timeline-item ${isActive ? 'active' : ''}">
                                    <div class="timeline-dot"></div>
                                    <div class="timeline-content">
                                        <div class="timeline-header">
                                            <div class="timeline-title">${h.event || 'เปลี่ยนสถานะ'}</div>
                                            <div class="timeline-time">${h.timestamp || ''}</div>
                                        </div>
                                        <div style="display:flex; justify-content:space-between; align-items:center;">
                                            ${statusBadge}
                                            <div style="font-size:0.75rem; color:var(--text-muted);">โดย: ${h.actor || '-'}</div>
                                        </div>
                                        ${h.note ? `<div class="timeline-note">${h.note}</div>` : ''}
                                    </div>
                                </div>
                            `;
                        }).reverse().join('')}
                    </div>
                </div>
            `;
        }

        const modalHtml = `
            <div style="padding:10px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; padding-bottom:10px; border-bottom:1px solid var(--border-color);">
                    <div>
                        <h3 style="margin:0; color:var(--accent-primary); font-size:1.1rem;">${doc.id}</h3>
                        <div style="font-size:0.9rem; color:var(--text-muted);">${doc.formName}</div>
                    </div>
                    ${downloadBtn}
                </div>
                
                ${previewContent}
                ${timelineHtml}

                <div style="margin-top:15px; padding:15px; background:var(--bg-secondary); border-radius:var(--radius-sm); border:1px solid var(--border-color);">
                    <p style="margin:0 0 4px; font-size:0.95rem;"><strong>ชื่อนักศึกษา:</strong> ${doc.senderName}</p>
                    <p style="margin:0 0 4px; font-size:0.95rem;"><strong>รหัส:</strong> ${doc.studentId}</p>
                    <p style="margin:0 0 0; font-size:0.95rem;"><strong>วันที่ส่ง:</strong> ${doc.submitDate}</p>
                </div>
            </div>
        `;
        openModal('พรีวิวเอกสารคำร้อง', modalHtml, '850px');
    }, 600);
};

window.submitSignedDoc = async function(docId) {
    const fileInput = document.getElementById('signedFile');
    if (!fileInput.files || fileInput.files.length === 0) {
        alert('กรุณาเลือกไฟล์ก่อนอัปโหลด');
        return;
    }
    
    const doc = MOCK.adminDocuments.find(d => d.id === docId);
    if (!doc) return;

    showApiLoading(`กำลังอัปโหลดไฟล์ (0/${fileInput.files.length})...`);
    
    try {
        const uploadResults = [];
        const metadata = {
            id: doc.id,
            studentId: doc.studentId,
            senderName: doc.senderName,
            documentType: doc.documentType || doc.formName
        };

        // 1. Sequentially upload all selected signed files
        for (let i = 0; i < fileInput.files.length; i++) {
            const file = fileInput.files[i];
            showApiLoading(`กำลังอัปโหลดไฟล์ (${i + 1}/${fileInput.files.length}): ${file.name}`);
            
            const res = await window.uploadFile(file, metadata);
            if (res && res.status === 'success') {
                uploadResults.push(res);
            } else {
                throw new Error(`ไม่สามารถอัปโหลดไฟล์ ${file.name} ได้: ${res ? res.message : 'Unknown error'}`);
            }
        }

        const signedUrls = uploadResults.map(r => r.fileUrl).join(', ');
        const signedNames = uploadResults.map(r => r.fileName).join(', ');

        // 2. Update the status in Sheet with atomic record
        showApiLoading('กำลังบันทึกข้อมูลสถานะเข้าสู่ระบบ...');
        const updatePayload = {
            id: doc.id,
            studentId: doc.studentId,
            documentType: doc.documentType || doc.formName,
            submitDate: doc.submitDate,
            status: 'ลงนามเรียบร้อยแล้ว',
            signedFileUrl: signedUrls,
            attachment: signedNames || doc.attachment, // Update signed names to reflect uploaded files
            note: 'อัปโหลดเอกสารลงนามแล้วโดยผู้ดูแลระบบ'
        };

        const updateRes = await postData('updateDocumentStatus', updatePayload);
        
        hideApiLoading();
        if (updateRes && updateRes.status === 'success') {
            closeModal();
            alert('อัปโหลดไฟล์ลงนาม (' + fileInput.files.length + ' ไฟล์) และอัปเดตข้อมูลสำเร็จ');
            MOCK.adminDocsSyncDone = false; // Trigger re-sync
            renderPage();
        } else {
            alert('อัปโหลดไฟล์สำเร็จ แต่ไม่สามารถอัปเดตสถานะในระบบ ได้: ' + (updateRes ? updateRes.message : 'Unknown'));
        }
    } catch (err) {
        hideApiLoading();
        console.error('Submit Signed Doc Error:', err);
        alert('เกิดข้อผิดพลาดในการอัปโหลด: ' + err.message);
    }
};

window.forwardAdminDoc = function(docId) {
    const doc = MOCK.adminDocuments.find(d => d.id === docId);
    if (!doc) return;
    
    const steps = [
        'รอเจ้าหน้าที่งานบัณฑิตศึกษาตรวจสอบ',
        'รอประธานหลักสูตรลงนาม',
        'รอคณบดีลงนาม',
        'อนุมัติแล้ว',
        'ไม่อนุมัติ/ถูกปฏิเสธ'
    ];
    
    const nextPersons = [
        'เจ้าหน้าที่งานบัณฑิตศึกษา',
        'ประธานกรรมการบริหารหลักสูตร',
        'คณบดีคณะพยาบาลศาสตร์',
        'นักศึกษา (' + (doc.studentName || doc.studentId || 'ไม่ระบุชื่อ') + ')',
        'นักศึกษา (' + (doc.studentName || doc.studentId || 'ไม่ระบุชื่อ') + ')'
    ];
    
    let optionsHtml = steps.map((s, idx) => `
        <option value="${idx}" ${doc.status === s ? 'selected' : ''}>${s}</option>
    `).join('');
    
    const modalHtml = `
        <div style="padding:10px;">
            <p style="margin-bottom:15px;">อัปเดตสถานะและส่งต่อเอกสาร <strong>${docId}</strong></p>
            
            <div class="form-group">
                <label class="form-label">สถานะใหม่ / ขัั้นตอนปัจจุบัน</label>
                <select class="form-select" id="newStatusStep">
                    ${optionsHtml}
                </select>
            </div>
            
            <div class="form-group">
                <label class="form-label">ผู้รับผิดชอบขั้นต่อไป (ถ้ามี)</label>
                <div style="display:flex; gap:10px;">
                    <select class="form-select" id="nextPersonSelect" style="flex:1;">
                        <option value="">-- ระบุผู้รับ --</option>
                        ${[...new Set(nextPersons)].map(p => `<option value="${p}" ${doc.nextStep === p ? 'selected' : ''}>${p}</option>`).join('')}
                    </select>
                </div>
            </div>
            
            <div class="form-group">
                <label class="form-label">ความเห็นเพิ่มเติม / เหตุผล (ถ้าปฏิเสธ)</label>
                <textarea class="form-textarea" id="forwardNote" placeholder="ระบุข้อความถึงขั้นตอนถัดไปหรือแจ้งนักศึกษา..."></textarea>
            </div>
            
            <button class="btn btn-primary" style="width:100%; margin-top:10px;" onclick="submitForwardDoc('${docId}')">บันทึกและส่งต่อ</button>
        </div>
    `;
    
    // Auto sync person with status change for convenience
    setTimeout(() => {
        document.getElementById('newStatusStep')?.addEventListener('change', function(e) {
            const idx = e.target.value;
            const personSelect = document.getElementById('nextPersonSelect');
            if (personSelect && nextPersons[idx]) {
                personSelect.value = nextPersons[idx];
            }
        });
    }, 100);
    
    openModal('ส่งต่อ/เปลี่ยนสถานะเอกสาร', modalHtml);
};

window.submitForwardDoc = async function(docId) {
    const select = document.getElementById('newStatusStep');
    const newStatus = select.options[select.selectedIndex].text;
    const nextPerson = document.getElementById('nextPersonSelect').value;
    const note = document.getElementById('forwardNote').value;
    
    const doc = MOCK.adminDocuments.find(d => d.id === docId);
    if (!doc) return;

    showApiLoading('กำลังบันทึกข้อมูลเข้าสู่ระบบ...');
    
    try {
        const payload = {
            id: doc.id,
            studentId: doc.studentId,
            documentType: doc.documentType || doc.formName,
            submitDate: doc.submitDate,
            status: newStatus,
            nextStep: nextPerson,
            note: note
        };

        const result = await postData('updateDocumentStatus', payload);
        hideApiLoading();

        if (result && result.status === 'success') {
            closeModal();
            alert('อัปเดตสถานะและส่งต่อเอกสารสำเร็จ');
            MOCK.adminDocsSyncDone = false; // Trigger re-sync
            renderPage();
        } else {
            alert('ไม่สามารถอัปเดตสถานะในระบบ ได้: ' + (result ? result.message : 'Unknown error'));
        }
    } catch (err) {
        hideApiLoading();
        console.error('Forward Doc Error:', err);
        alert('เกิดข้อผิดพลาด: ' + err.message);
    }
};

window.searchAdminDocs = function() {
    const query = document.getElementById('adminDocQuery').value.toLowerCase();
    const rows = document.querySelectorAll('.admin-doc-row');
    let hasVisibleRows = false;
    
    rows.forEach(row => {
        const searchData = row.getAttribute('data-search') || '';
        if (searchData.includes(query)) {
            row.style.display = '';
            hasVisibleRows = true;
        } else {
            row.style.display = 'none';
        }
    });

    let noResultMsg = document.getElementById('noAdminDocMatch');
    if (hasVisibleRows || rows.length === 0) {
        if (noResultMsg) noResultMsg.style.display = 'none';
    } else {
        if (!noResultMsg) {
            const tbody = document.querySelector('.data-table tbody');
            if (tbody) {
                const tr = document.createElement('tr');
                tr.id = 'noAdminDocMatch';
                tr.innerHTML = '<td colspan="4" style="text-align:center;color:var(--text-muted);padding:20px;">ไม่พบเอกสารที่ค้นหา</td>';
                tbody.appendChild(tr);
            }
        } else {
            noResultMsg.style.display = '';
        }
    }
};



