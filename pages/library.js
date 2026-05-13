// ============================
// Library Information Resource Database
// ============================

// Mock Data for Library
if (!MOCK.libraryResources) {
    MOCK.libraryResources = [
        { id: 'LIB001', title: 'Advanced Nursing Research', author: 'Polit, D. F., & Beck, C. T.', type: 'book', year: 2021, publisher: 'Wolters Kluwer', tags: ['Research', 'Nursing'], url: '#' },
        { id: 'LIB002', title: 'Journal of Advanced Nursing', author: 'Various', type: 'journal', year: 2024, publisher: 'Wiley', tags: ['Nursing', 'Academic'], url: '#' },
        { id: 'LIB003', title: 'Qualitative Research in Nursing', author: 'Holloway, I., & Galvin, K.', type: 'book', year: 2022, publisher: 'Wiley-Blackwell', tags: ['Qualitative', 'Research'], url: '#' },
        { id: 'LIB004', title: 'The Effect of Clinical Simulation on Nursing Students', author: 'Somsri, J.', type: 'thesis', year: 2023, program: 'Master of Nursing', tags: ['Simulation', 'Education'], url: '#' },
        { id: 'LIB005', title: 'Nursing Leadership and Management', author: 'Kelly, P.', type: 'book', year: 2020, publisher: 'Cengage', tags: ['Leadership', 'Management'], url: '#' }
    ];
}

pages.library = function() {
    return renderLibraryPage('search');
};

pages['library-repository'] = function() {
    return renderLibraryPage('repository');
};

function renderLibraryPage(activeTab) {
    return `
    <div class="animate-in">
        <div class="page-header" style="display:flex; justify-content:space-between; align-items:flex-start;">
            <div>
                <h1 class="page-title">ห้องสมุดและสารสนเทศ (Library)</h1>
                <p class="page-subtitle">สืบค้นทรัพยากรการเรียนรู้ งานวิจัย และเครื่องมืออ้างอิงสำหรับบัณฑิตศึกษา</p>
            </div>
            <div style="display:flex; gap:10px;">
                <button class="btn btn-outline" onclick="openCitationTool()" style="gap:8px;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    สร้างการอ้างอิง (Cite)
                </button>
            </div>
        </div>

        <!-- Library Tabs -->
        <div class="card" style="margin-bottom:24px; padding: 5px;">
            <div style="display:flex; gap:5px;">
                <button class="btn ${activeTab==='search'?'btn-primary':'btn-ghost'}" onclick="navigateTo('library')" style="flex:1">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px;"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    สืบค้นทรัพยากร
                </button>
                <button class="btn ${activeTab==='repository'?'btn-primary':'btn-ghost'}" onclick="navigateTo('library-repository')" style="flex:1">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px;"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                    คลังวิทยานิพนธ์
                </button>
                <button class="btn btn-ghost" onclick="window.open('https://pubmed.ncbi.nlm.nih.gov/', '_blank')" style="flex:1">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px;"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    ฐานข้อมูลสากล (PubMed/Scopus)
                </button>
            </div>
        </div>

        ${activeTab === 'search' ? renderResourceSearch() : renderThesisRepository()}

    </div>`;
}

function renderResourceSearch() {
    return `
    <div class="card animate-in animate-delay-1" style="margin-bottom:24px;">
        <div class="card-body">
            <div style="display:flex; gap:12px; margin-bottom:20px;">
                <div class="search-box" style="flex:1; display:flex; background:var(--bg-secondary);">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <input type="text" id="libSearchInput" placeholder="ค้นหาชื่อหนังสือ, ผู้แต่ง, หรือ ISBN..." style="background:transparent; border:none; outline:none; color:var(--text-primary); flex:1; padding:10px;" onkeyup="filterLibraryResources()">
                </div>
                <select class="form-select" id="libTypeFilter" style="width:150px;" onchange="filterLibraryResources()">
                    <option value="all">ทุกประเภท</option>
                    <option value="book">หนังสือ</option>
                    <option value="journal">วารสาร</option>
                    <option value="e-book">E-Book</option>
                </select>
            </div>

            <div id="libResourceList" class="grid-3" style="gap:20px;">
                ${MOCK.libraryResources.filter(r => r.type !== 'thesis').map(renderResourceCard).join('')}
            </div>
        </div>
    </div>
    
    <div class="card animate-in animate-delay-2" style="background:var(--bg-tertiary); border-left:4px solid var(--accent-primary);">
        <div class="card-body" style="display:flex; align-items:center; gap:15px;">
            <div style="font-size:2rem;">📚</div>
            <div>
                <h4 style="margin:0 0 5px 0;">ไม่พบสิ่งที่ต้องการ?</h4>
                <p style="margin:0; font-size:0.9rem; color:var(--text-muted);">อาจารย์และนักศึกษาสามารถยื่นคำร้องขอให้ห้องสมุดจัดซื้อทรัพยากรเพิ่มเติมได้ผ่านเมนู "ยื่นคำร้องออนไลน์"</p>
            </div>
        </div>
    </div>`;
}

function renderThesisRepository() {
    const thesis = MOCK.libraryResources.filter(r => r.type === 'thesis');
    return `
    <div class="card animate-in animate-delay-1">
        <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
            <h3 class="card-title">คลังวิทยานิพนธ์ (Research Repository)</h3>
            <span class="badge info">${thesis.length} รายการ</span>
        </div>
        <div class="card-body" style="padding:0;">
            <div class="table-wrapper">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>หัวข้อวิทยานิพนธ์ / งานวิจัย</th>
                            <th>ผู้แต่ง / ผู้วิจัย</th>
                            <th>หลักสูตร</th>
                            <th>ปีที่เผยแพร่</th>
                            <th style="text-align:right;">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${thesis.map(t => `
                            <tr>
                                <td>
                                    <div style="font-weight:600; color:var(--accent-primary);">${t.title}</div>
                                    <div style="font-size:0.75rem; margin-top:4px;">
                                        ${t.tags.map(tag => `<span class="badge" style="background:var(--bg-secondary); color:var(--text-muted); padding:2px 6px; font-size:0.7rem; margin-right:4px;">#${tag}</span>`).join('')}
                                    </div>
                                </td>
                                <td>${t.author}</td>
                                <td><span class="badge purple">${t.program}</span></td>
                                <td style="text-align:center;">${t.year}</td>
                                <td style="text-align:right;">
                                    <div style="display:flex; gap:8px; justify-content:flex-end;">
                                        <button class="btn btn-ghost btn-sm" onclick="alert('กำลังดาวน์โหลดไฟล์ Full-text PDF...')">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                            PDF
                                        </button>
                                        <button class="btn btn-primary btn-sm" onclick="showCitation('${t.id}')">อ้างอิง</button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    </div>`;
}

function renderResourceCard(r) {
    return `
    <div class="card hover-scale lib-card" data-title="${r.title.toLowerCase()}" data-author="${r.author.toLowerCase()}" data-type="${r.type}">
        <div class="card-body">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
                <span class="badge ${r.type==='book'?'info':r.type==='journal'?'success':'warning'}" style="text-transform:uppercase; font-size:0.7rem;">${r.type}</span>
                <span style="font-size:0.8rem; color:var(--text-muted);">${r.year}</span>
            </div>
            <h4 style="margin:0 0 8px 0; font-size:1rem; line-height:1.4; height:2.8em; overflow:hidden;">${r.title}</h4>
            <p style="margin:0 0 15px 0; font-size:0.85rem; color:var(--text-muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">โดย ${r.author}</p>
            <div style="display:flex; gap:8px; margin-top:auto;">
                <button class="btn btn-outline btn-sm" style="flex:1;" onclick="showCitation('${r.id}')">Cite</button>
                <button class="btn btn-primary btn-sm" style="flex:1;" onclick="alert('ต้องการยืม: ${r.title}')">Reserve</button>
            </div>
        </div>
    </div>`;
}

window.filterLibraryResources = function() {
    const query = document.getElementById('libSearchInput').value.toLowerCase();
    const type = document.getElementById('libTypeFilter').value;
    
    document.querySelectorAll('.lib-card').forEach(card => {
        const title = card.dataset.title;
        const author = card.dataset.author;
        const cardType = card.dataset.type;
        
        const matchesQuery = title.includes(query) || author.includes(query);
        const matchesType = type === 'all' || cardType === type;
        
        card.style.display = (matchesQuery && matchesType) ? 'block' : 'none';
    });
};

window.openCitationTool = function() {
    const html = `
    <div style="padding:15px;">
        <p style="margin-bottom:15px; color:var(--text-muted);">ป้อนข้อมูลทรัพยากรเพื่อสร้างรูปแบบการอ้างอิงอัตโนมัติ (APA 7th Edition)</p>
        <div class="form-group">
            <label class="form-label">ประเภททรัพยากร</label>
            <select id="cite_type" class="form-select">
                <option value="book">หนังสือ (Book)</option>
                <option value="journal">บทความวารสาร (Journal Article)</option>
                <option value="web">เว็บไซต์ (Webpage)</option>
            </select>
        </div>
        <div class="form-row">
            <div class="form-group" style="flex:2;"><label class="form-label">ชื่อผู้แต่ง</label><input id="cite_author" class="form-input" placeholder="เช่น Polit, D. F., & Beck, C. T."></div>
            <div class="form-group" style="flex:1;"><label class="form-label">ปีที่พิมพ์</label><input id="cite_year" class="form-input" placeholder="2024"></div>
        </div>
        <div class="form-group">
            <label class="form-label">ชื่อเรื่อง</label>
            <input id="cite_title" class="form-input" placeholder="ชื่อหนังสือหรือชื่อบทความ">
        </div>
        <div class="form-group">
            <label class="form-label">ชื่อสำนักพิมพ์ / ชื่อวารสาร</label>
            <input id="cite_source" class="form-input" placeholder="เช่น Wiley-Blackwell หรือ Journal of Nursing">
        </div>
        <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:20px;">
            <button class="btn btn-secondary" onclick="closeModal()">ยกเลิก</button>
            <button class="btn btn-primary" onclick="generateAPA()">สร้างการอ้างอิง</button>
        </div>
    </div>`;
    openModal('เครื่องมือช่วยอ้างอิง (Citation Generator)', html);
};

window.generateAPA = function() {
    const author = document.getElementById('cite_author').value;
    const year = document.getElementById('cite_year').value;
    const title = document.getElementById('cite_title').value;
    const source = document.getElementById('cite_source').value;
    const type = document.getElementById('cite_type').value;

    let citation = `${author}. (${year}). *${title}*. ${source}.`;
    if (type === 'journal') {
        citation = `${author}. (${year}). ${title}. *${source}*.`;
    }

    const resHtml = `
    <div style="padding:15px; background:var(--bg-secondary); border-radius:var(--radius-md); border:1px dashed var(--border-color); margin-top:15px;">
        <h4 style="margin-bottom:10px; font-size:0.9rem; color:var(--accent-primary);">ผลลัพธ์ (APA 7th Edition):</h4>
        <div id="apaResult" style="padding:12px; background:var(--bg-card); border-radius:4px; font-family:monospace; font-size:0.95rem; margin-bottom:15px; border-left:4px solid var(--success);">${citation}</div>
        <button class="btn btn-outline" style="width:100%;" onclick="copyCitation()">คัดลอกไปยัง Clipboard</button>
    </div>`;
    
    // Replace the generator UI with result or append it? Let's just update modal content or show toast.
    openModal('ผลการสร้างการอ้างอิง', resHtml);
};

window.showCitation = function(id) {
    const r = MOCK.libraryResources.find(res => res.id === id);
    if (!r) return;
    
    let citation = '';
    if (r.type === 'book') {
        citation = `${r.author}. (${r.year}). *${r.title}*. ${r.publisher}.`;
    } else if (r.type === 'thesis') {
        citation = `${r.author}. (${r.year}). *${r.title}* [Master's thesis]. PBRI Research Repository.`;
    } else {
        citation = `${r.author}. (${r.year}). ${r.title}. *${r.publisher}*.`;
    }

    const html = `
    <div style="padding:15px;">
        <h4 style="margin-bottom:15px;">การอ้างอิงรูปแบบ APA 7th Edition</h4>
        <div style="padding:20px; background:var(--bg-secondary); border-radius:var(--radius-md); border-left:4px solid var(--accent-primary); line-height:1.6; font-family:serif;">
            ${citation}
        </div>
        <div style="margin-top:20px; display:flex; gap:10px; justify-content:flex-end;">
            <button class="btn btn-secondary" onclick="closeModal()">ปิด</button>
            <button class="btn btn-primary" onclick="navigator.clipboard.writeText('${citation}'); showToast('คัดลอกการอ้างอิงแล้ว', 'success'); closeModal();">คัดลอก</button>
        </div>
    </div>`;
    openModal('อ้างอิงทรัพยากร', html);
};

window.copyCitation = function() {
    const text = document.getElementById('apaResult').innerText;
    navigator.clipboard.writeText(text);
    showToast('คัดลอกไปยังคลิปบอร์ดแล้ว', 'success');
};
