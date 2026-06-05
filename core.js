// ============================
// Core utilities - loaded first
// ============================

// Page renderers map (populated by page scripts)
const pages = {};

// Registration wizard state
let registrationStep = 1;

// ====== Global Academic State ======
window.CURRENT_ACADEMIC_YEAR = 2568;
window.CURRENT_SEMESTER = 3; // 1=First, 2=Second, 3=Summer

// ====== Sync localStorage with CURRENT_SEMESTER ======
// This ensures MOCK.activeSemester always reflects the configured semester,
// overriding any stale localStorage value from a previous semester.
(function syncActiveSemester() {
    const semLabel = window.CURRENT_SEMESTER === 1 ? 'ภาคการศึกษาที่ 1' :
                     window.CURRENT_SEMESTER === 2 ? 'ภาคการศึกษาที่ 2' : 'ภาคฤดูร้อน';
    localStorage.setItem('activeSemester', semLabel);
    localStorage.setItem('activeYear', String(window.CURRENT_ACADEMIC_YEAR));
})();

// ====== Utility Functions ======
function formatMoney(n) {
    return n.toLocaleString('th-TH');
}

function getStatusBadge(status) {
    const map = {
        'เปิด': 'success', 'เต็ม': 'danger', 'ปิด': 'neutral',
        'ชำระแล้ว': 'success', 'ค้างชำระ': 'danger',
        'กำลังศึกษา': 'success', 'พ้นสภาพ': 'danger', 'ลาออก': 'danger', 'Resigned': 'danger',
        'ลาพักการศึกษา': 'warning', 'Leave of Absence': 'warning',
        'สำเร็จการศึกษา': 'purple', 'Graduated': 'purple',
    };
    return `<span class="badge ${map[status] || 'neutral'}">${status}</span>`;
}

function gradeToPoint(grade) {
    const map = {
        'A': 4.0, 'B+': 3.5, 'B': 3.0, 'C+': 2.5, 'C': 2.0, 'D+': 1.5, 'D': 1.0, 'F': 0.0, 'S': 0.0, 'U': 0.0
    };
    return map[grade] || 0.0;
}

// Modal functions (need to be available to page scripts)
let modalOverlay, modalTitle, modalBody;

function openModal(title, bodyHtml, subtitleHtml = '') {
    if (!modalOverlay) modalOverlay = document.getElementById('modalOverlay');
    if (!modalTitle) modalTitle = document.getElementById('modalTitle');
    if (!modalBody) modalBody = document.getElementById('modalBody');
    if (modalTitle) {
        modalTitle.innerHTML = `<span style="flex: 1;">${title}</span>` + 
            (subtitleHtml ? `<span style="font-size:0.85rem; font-weight:normal; color:var(--text-muted); margin-left:auto; padding-right:12px; white-space: nowrap;">${subtitleHtml}</span>` : '');
    }
    if (modalBody) modalBody.innerHTML = bodyHtml;
    if (modalOverlay) modalOverlay.classList.add('show');
}

function closeModal() {
    if (!modalOverlay) modalOverlay = document.getElementById('modalOverlay');
    if (modalOverlay) modalOverlay.classList.remove('show');
}

function showApiLoading(msg = 'กำลังโหลดข้อมูล...') {
    const loader = document.getElementById('apiLoader');
    const loaderText = document.getElementById('apiLoaderText');
    if (loader) loader.classList.add('show');
    if (loaderText) loaderText.textContent = msg;
}

function hideApiLoading() {
    const loader = document.getElementById('apiLoader');
    if (loader) loader.classList.remove('show');
}

// Generic CSV Import Helper
window.handleGenericCSVImport = function(callback) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = e => {
        const file = e.target.files[0];
        if (!file) return;
        
        showApiLoading('กำลังวิเคราะห์ไฟล์ CSV...');
        const reader = new FileReader();
        reader.onload = function(errEv) {
            let text = errEv.target.result;
            
            // Robust line splitting
            const lines = text.split(/\r?\n|\r/).filter(l => l.trim());
            if (lines.length < 2) {
                hideApiLoading();
                alert('ไฟล์ไม่มีข้อมูล (ต้องมีอย่างน้อย 1 แถวหัวตาราง + 1 แถวข้อมูล)');
                return;
            }
            
            const headers = parseCSVLine(lines[0]);
            const data = [];
            for (let i = 1; i < lines.length; i++) {
                const cols = parseCSVLine(lines[i]);
                if (cols.length < 1) continue;
                const row = {};
                headers.forEach((h, idx) => { 
                    row[h.trim()] = (cols[idx] || '').trim(); 
                });
                data.push(row);
            }
            hideApiLoading();
            callback(data, headers);
        };
        reader.readAsText(file, 'UTF-8');
    };
    input.click();
};

function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuote = false;
    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') { inQuote = !inQuote; }
        else if (ch === ',' && !inQuote) { result.push(current); current = ''; }
        else { current += ch; }
    }
    result.push(current);
    return result;
}

window.downloadCSVTemplate = function(filename, headers, sampleRow) {
    const BOM = '\uFEFF';
    const csv = BOM + headers.join(',') + '\n' + sampleRow.join(',') + '\n';
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
};

// Global Helper to format Course Codes (ensure 10 digits/leading zero)
window.formatDisplayCode = function(c) {
    let s = String(c || '').trim();
    if (s.length === 9 && /^\d+$/.test(s)) return '0' + s;
    return s;
};

// Intelligent Google Drive URL Resolver
window.getDriveUrl = function(idOrUrl, type = 'file') {
    if (!idOrUrl) return '';
    const trimmed = String(idOrUrl).trim();
    
    // 1. If it's already a full URL, return as is
    if (trimmed.startsWith('http')) {
        let url = trimmed;
        // If it's a Drive file view URL and we want a preview, swap /view for /preview
        if (url.includes('drive.google.com')) {
            if (type === 'preview' && url.includes('/view')) {
                url = url.replace('/view', '/preview');
            } else if (type === 'file' && url.includes('/preview')) {
                url = url.replace('/preview', '/view');
            }
        }
        return url;
    }
    
    // 2. Otherwise assume it's a Drive ID
    if (type === 'folder') {
        return 'https://drive.google.com/drive/folders/' + trimmed;
    } else if (type === 'preview') {
        return 'https://drive.google.com/file/d/' + trimmed + '/preview';
    } else {
        // Default file view
        return 'https://drive.google.com/open?id=' + trimmed;
    }
};
