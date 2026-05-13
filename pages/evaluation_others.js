// ============================
// Other Evaluations Pages (แบบประเมินอื่นๆ)
// ============================

// --- ชุดคำถามจำลอง (สามารถมาแก้ไขหรือเพิ่มเติมได้ในภายหลัง) ---

const EVAL_QUESTIONS = {
    'curriculum': [
        "โครงสร้างหลักสูตรมีความทันสมัยและตอบสนองต่อความต้องการของสังคม",
        "การจัดตารางสอนและรายวิชามีความเหมาะสมและสอดคล้องกับแผนการศึกษา",
        "กระบวนการรับฟังความคิดเห็นของนักศึกษาเพื่อนำไปพัฒนาหลักสูตรมีประสิทธิภาพ",
        "ความพร้อมของคู่มือและเอกสารแนะนำการศึกษาของหลักสูตร",
        "การบริหารจัดการและการประสานงานของประธาน/กรรมการหลักสูตร"
    ],
    'facilities': [
        "ความพร้อมและคุณภาพของห้องเรียนและอุปกรณ์โสตทัศนูปกรณ์",
        "ความเพียงพอของหนังสือ ตำรา และฐานข้อมูลออนไลน์ในห้องสมุด",
        "ความเสถียรและความรวดเร็วของระบบเครือข่ายอินเทอร์เน็ต (Wi-Fi) ของคณะ/มหาวิทยาลัย",
        "ความเพียงพอและสภาพแวดล้อมของพื้นที่นั่งอ่านหนังสือ หรือพื้นที่ทำงานกลุ่ม (Co-working space)",
        "ความสะอาดและสุขอนามัยของสิ่งอำนวยความสะดวก (เช่น ห้องน้ำ โรงอาหาร)"
    ],
    'services': [
        "ความรวดเร็ว ถูกต้อง และเป็นมิตรในการให้บริการของเจ้าหน้าที่สายสนับสนุน",
        "ประสิทธิภาพและเสถียรภาพของระบบสารสนเทศ (เช่น ระบบลงทะเบียน ระบบคำร้อง)",
        "การเข้าถึงและการให้ความช่วยเหลือในด้านสวัสดิการและทุนการศึกษา",
        "การประชาสัมพันธ์ข่าวสารและกิจกรรมต่างๆ ของคณะ/มหาวิทยาลัยมีความชัดเจนและทั่วถึง",
        "ช่องทางการร้องเรียนหรือข้อเสนอแนะมีความสะดวกและได้รับการตอบสนอง"
    ],
    'learning-outcomes': [
        "ความสามารถในการประยุกต์ใช้ความรู้เชิงทฤษฎีสู่การปฏิบัติและการทำงานวิจัย",
        "ทักษะการคิดวิเคราะห์ สังเคราะห์ และการแก้ปัญหาที่ซับซ้อนอย่างเป็นระบบ",
        "ทักษะการสื่อสาร การนำเสนอ และการใช้เทคโนโลยีสารสนเทศอย่างเหมาะสม",
        "ความสามารถในการทำงานร่วมกับผู้อื่นและการปรับตัวในสภาพแวดล้อมที่หลากหลาย",
        "ความรับผิดชอบต่อหน้าที่ จรรยาบรรณทางวิชาชีพ และจริยธรรมการวิจัย"
    ],
    'leadership': [
        "ความสามารถในการเป็นผู้นำกลุ่มและการเคารพ/รับฟังความคิดเห็นของผู้ร่วมงาน",
        "ความกล้าแสดงออกและการนำเสนอแนวคิดเชิงนำหรือริเริ่มสร้างสรรค์สิ่งใหม่",
        "ความรับผิดชอบในการตัดสินใจและการมีวุฒิภาวะในการแก้ไขปัญหาความขัดแย้ง",
        "ความสามารถในการสร้างแรงบันดาลใจและกระตุ้นให้เกิดการทำงานเป็นทีมที่มีประสิทธิภาพ",
        "ความเสียสละและการคำนึงถึงประโยชน์ส่วนรวมมากกว่าประโยชน์ส่วนตน"
    ]
};

// --- ฟังก์ชันสร้างหน้าจอแบบประเมินแบบ Generic ---
function renderGenericEvaluationForm(evalId, title, subtitle, questions) {
    const likertLabels = ['น้อยที่สุด', 'น้อย', 'ปานกลาง', 'มาก', 'มากที่สุด'];
    const questionRows = questions.map((q, idx) => `
        <div style="margin-bottom:12px; padding:12px 16px; background:var(--bg-secondary); border-radius:var(--radius-md); border:2px solid transparent;">
            <label style="font-size:0.92rem; font-weight:500; display:block; margin-bottom:8px; color:var(--text-primary); line-height:1.3;">
                ${idx + 1}. ${q} <span style="color:var(--danger)">*</span>
            </label>
            <div style="display:grid; grid-template-columns:repeat(5, 1fr); gap:6px; max-width:100%;">
                ${[1, 2, 3, 4, 5].map(s => `
                    <label style="display:block; cursor:pointer;" class="likert-label-wrapper">
                        <input type="radio" name="q_${evalId}_${idx}" value="${s}" required style="display:none;" onchange="window.updateGenericLikertUI(this.name)">
                        <div class="likert-btn-mock" id="lbl_q_${evalId}_${idx}_${s}"
                                style="border:2px solid var(--border-color); background:var(--bg-card); color:inherit; text-align:center; padding:12px 4px; border-radius:var(--radius-sm); transition:0.2s;">
                            <span style="font-weight:700; font-size:1.15rem; line-height:1; display:block;">${s}</span>
                            <span class="likert-wrapper-label" style="display:block; font-size:0.75rem; color:var(--text-muted); margin-top:6px;">${likertLabels[s - 1]}</span>
                        </div>
                    </label>
                `).join('')}
            </div>
        </div>
    `).join('');

    return `
    <div class="animate-in">
        <div class="page-header" style="margin-bottom:24px;">
            <h1 class="page-title">${title}</h1>
            <p class="page-subtitle">${subtitle}</p>
        </div>

        <div class="card" style="max-width:900px; margin:0 auto;">
            <div class="card-header" style="background:#f8fafc; border-bottom:1px solid #e2e8f0;">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
                    <h3 class="card-title">แบบสอบถามระดับความพึงพอใจ</h3>
                    <div style="font-size:0.8rem; color:var(--text-secondary); display:flex; gap:10px; flex-wrap:wrap;">
                        <span style="display:flex; align-items:center; gap:4px;"><span style="width:12px;height:12px;border-radius:50%;background:var(--danger);display:inline-block;"></span> 1 = น้อยที่สุด</span>
                        <span style="display:flex; align-items:center; gap:4px;"><span style="width:12px;height:12px;border-radius:50%;background:#f59e0b;display:inline-block;"></span> 2 = น้อย</span>
                        <span style="display:flex; align-items:center; gap:4px;"><span style="width:12px;height:12px;border-radius:50%;background:var(--success);display:inline-block;"></span> 3 = ปานกลาง</span>
                        <span style="display:flex; align-items:center; gap:4px;"><span style="width:12px;height:12px;border-radius:50%;background:#3b82f6;display:inline-block;"></span> 4 = มาก</span>
                        <span style="display:flex; align-items:center; gap:4px;"><span style="width:12px;height:12px;border-radius:50%;background:#8b5cf6;display:inline-block;"></span> 5 = มากที่สุด</span>
                    </div>
                </div>
            </div>
            <div class="card-body" style="padding:20px; background:var(--bg-tertiary);">
                <form id="form_${evalId}" onsubmit="window.submitGenericEvaluation(event, '${evalId}', '${title}')">
                    <div style="display:flex; flex-direction:column;">
                        ${questionRows}
                    </div>
                    
                    <div style="margin-top:12px; padding:16px; background:var(--bg-secondary); border-radius:var(--radius-md);">
                        <label class="form-label" style="font-weight:600; margin-bottom:8px; display:block;">ข้อเสนอแนะเพิ่มเติม (ถ้ามี)</label>
                        <textarea id="comment_${evalId}" class="form-input" rows="3" placeholder="ระบุข้อเสนอแนะหรือความคิดเห็นเพิ่มเติมเพื่อการพัฒนา..."></textarea>
                    </div>

                    <div style="margin-top:24px; display:flex; justify-content:flex-end; gap:12px;">
                        <button type="button" class="btn btn-secondary" onclick="document.getElementById('form_${evalId}').reset(); window.resetGenericLikertUI('${evalId}', ${questions.length});">ล้างข้อมูล</button>
                        <button type="submit" class="btn btn-primary" style="gap:8px;">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                            ส่งผลการประเมิน
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    `;
}

window.updateGenericLikertUI = function (radioName) {
    const radios = document.getElementsByName(radioName);
    radios.forEach(r => {
        const box = document.getElementById(`lbl_${radioName}_${r.value}`);
        if (box) {
            if (r.checked) {
                box.style.borderColor = 'var(--accent-primary)';
                box.style.background = 'var(--accent-primary)';
                box.style.color = 'white';
                box.querySelector('.likert-wrapper-label').style.color = 'white';
            } else {
                box.style.borderColor = 'var(--border-color)';
                box.style.background = 'var(--bg-card)';
                box.style.color = 'inherit';
                box.querySelector('.likert-wrapper-label').style.color = 'var(--text-muted)';
            }
        }
    });
};

window.resetGenericLikertUI = function(evalId, qCount) {
    for(let idx=0; idx<qCount; idx++) {
        for(let s=1; s<=5; s++) {
            const box = document.getElementById(`lbl_q_${evalId}_${idx}_${s}`);
            if(box) {
                box.style.borderColor = 'var(--border-color)';
                box.style.background = 'var(--bg-card)';
                box.style.color = 'inherit';
                box.querySelector('.likert-wrapper-label').style.color = 'var(--text-muted)';
            }
        }
    }
};

window.submitGenericEvaluation = function(e, evalId, title) {
    e.preventDefault();
    
    // แบบจำลองการส่งข้อมูล (Mock Processing)
    window.showLoading && window.showLoading();
    
    setTimeout(() => {
        window.hideLoading && window.hideLoading();
        
        const modalHtml = `
            <div style="text-align:center; padding:20px;">
            <div style="font-size:3.5rem; margin-bottom:16px;">🙏</div>
            <h3 style="color:var(--success); margin-bottom:12px;">ขอบคุณสำหรับการประเมิน!</h3>
            <p style="color:var(--text-secondary); margin-bottom:24px; line-height:1.6;">
                ผลการประเมิน <b>${title}</b> ของคุณถูกส่งเข้าสู่ระบบเรียบร้อยแล้ว<br>
                ข้อมูลของคุณจะถูกนำไปใช้เพื่อการพัฒนาและปรับปรุงให้ดียิ่งขึ้น
            </p>
            <button class="btn btn-primary" onclick="window.closeModalAndRedirect()">ตกลง</button>
            </div>
        `;
        
        if (typeof openModal === 'function') {
            openModal('ส่งผลการประเมินสำเร็จ', modalHtml);
            document.getElementById(`form_${evalId}`).reset();
        } else {
            alert('ส่งผลการประเมินสำเร็จ');
        }
    }, 800);
};

window.closeModalAndRedirect = function() {
    if (typeof closeModal === 'function') closeModal();
    navigateTo('dashboard');
};

// --- การสร้างเมนูหน้าประเมินเชื่อมกับ Routing ---

// Helper: ดึงคำถามจาก MOCK ถ้ามี ไม่งั้นใช้ EVAL_QUESTIONS เดิม
function getEvalQuestions(mockKey, fallbackKey) {
    const fromMock = MOCK[mockKey];
    if (fromMock && fromMock.length > 0) {
        return fromMock.map(q => q.question_text || q.question || '');
    }
    return EVAL_QUESTIONS[fallbackKey] || [];
}

// 1. ประเมินความพึงพอใจต่อการบริหารหลักสูตร
pages['eval-curriculum'] = function () {
    return renderGenericEvaluationForm('curriculum', "แบบประเมินความพึงพอใจต่อการบริหารหลักสูตร", "กรุณาประเมินระดับความพึงพอใจต่อภาพรวมของการบริหารหลักสูตร", getEvalQuestions('evalCurriculumQuestions', 'curriculum'));
};

// 2. ประเมินความพึงพอใจต่อสิ่งสนับสนุนการเรียนรู้
pages['eval-facilities'] = function () {
    return renderGenericEvaluationForm('facilities', "แบบประเมินความพึงพอใจต่อสิ่งสนับสนุนการเรียนรู้", "แบบประเมินทรัพยากร ห้องสมุด ระบบอินเทอร์เน็ต คอมพิวเตอร์ และสถานที่", getEvalQuestions('evalFacilitiesQuestions', 'facilities'));
};

// 3. ประเมินความพึงพอใจต่อการบริการนักศึกษา
pages['eval-services'] = function () {
    return renderGenericEvaluationForm('services', "แบบประเมินความพึงพอใจต่อการบริการนักศึกษา", "ประเมินการบริการของเจ้าหน้าที่ การให้คำปรึกษา และสวัสดิการมหาวิทยาลัย", getEvalQuestions('evalServicesQuestions', 'services'));
};

// 4. ประเมินผลลัพธ์การเรียนรู้ระดับหลักสูตร
pages['eval-learning-outcomes'] = function () {
    return renderGenericEvaluationForm('learning-outcomes', "แบบประเมินผลลัพธ์การเรียนรู้ (หลักสูตร)", "ประเมินพัฒนาการของตนเองตามเกณฑ์มาตรฐานผลลัพธ์การเรียนรู้ (PLOs)", getEvalQuestions('evalLearningOutcomesQuestions', 'learning-outcomes'));
};

// 5. ประเมินอัตลักษณ์ผู้นำ
pages['eval-leadership'] = function () {
    return renderGenericEvaluationForm('leadership', "แบบประเมินอัตลักษณ์ผู้นำ", "แบบประเมินทักษะและพฤติกรรมสะท้อนความเป็นผู้นำของนักศึกษา", getEvalQuestions('evalLeadershipQuestions', 'leadership'));
};
