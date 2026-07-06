/**
 * Google Apps Script for Student Registration System
 * 
 * Instructions:
 * 1. Open your Google Sheet.
 * 2. Go to Extensions > Apps Script.
 * 3. Delete any code and paste this code.
 * 4. Click 'Save' and then 'Deploy' > 'New Deployment'.
 * 5. Choose 'Web App', set 'Execute as: Me' and 'Who has access: Anyone'.
 * 6. Copy the Web App URL and paste it into Script_URL / api.js in your project.
 */

const SS = SpreadsheetApp.getActiveSpreadsheet();

// Configure Sheet Names
const SHEETS = {
  USERS: 'Users',
  STUDENTS: 'Students',
  TEACHERS: 'Teachers',
  COURSES: 'Courses',
  ENROLLMENTS: 'Enrollments',
  PAYMENTS: 'Payments',
  EVALUATIONS: 'Evaluations',
  DOCUMENTS: 'Documents',
  ANNOUNCEMENTS: 'Announcements',
  PERMISSIONS: 'Permissions',
  EXAMS: 'Exams',
  EXAM_COMMITTEES: 'ExamCommittees',
  EVAL_QUESTIONS: 'EvalQuestions',
  COURSE_INSTRUCTORS: 'CourseInstructors',
  EVAL_INSTRUCTOR_QUESTIONS: 'EvalInstructorQuestions',
  APPLICANTS: 'Applicants',
  SCHEDULE: 'Schedule',
  DOCUMENT_TEMPLATES: 'DocumentTemplates',
  THESIS_PROGRESS: 'ThesisProgress',
  GRADUATION_REQUESTS: 'GraduationRequests'
};

const DRIVE_FOLDER_ID = '1zOq4BkaxMqZFyUvBz1eaYEzXjWd3lXrJ'; // Updated folder ID
let CACHED_FOLDER = null;

/**
 * Handle GET Requests
 */
function doGet(e) {
  // --- Support multi-page hosting (e.g. ?p=apply) ---
  if (e.parameter.p === 'apply') {
    try {
      return HtmlService.createTemplateFromFile('apply')
          .evaluate()
          .setTitle('ใบสมัครเข้าศึกษาต่อ | Graduate Admission')
          .addMetaTag('viewport', 'width=device-width, initial-scale=1')
          .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    } catch (err) {
      return ContentService.createTextOutput("Error loading page: " + err.toString());
    }
  }

  setupInitialSheets(); // Ensure all sheets and headers exist
  const action = e.parameter.action;
  let data = [];
  
  try {
    switch (action) {
      case 'getUsers':
        data = getSheetData(SHEETS.USERS);
        break;
      case 'getStudents':
        data = getSheetData(SHEETS.STUDENTS);
        break;
      case 'getTeachers':
        data = getSheetData(SHEETS.TEACHERS);
        break;
      case 'getCourses':
        data = getSheetData(SHEETS.COURSES);
        break;
      case 'getEnrollments':
        data = getSheetData(SHEETS.ENROLLMENTS);
        break;
      case 'getPayments':
        data = getSheetData(SHEETS.PAYMENTS);
        break;
      case 'getEvaluations':
        data = getSheetData(SHEETS.EVALUATIONS);
        break;
      case 'getAnnouncements':
        data = getSheetData(SHEETS.ANNOUNCEMENTS);
        break;
      case 'getAllData':
        data = {
          users: getSheetData(SHEETS.USERS),
          students: getSheetData(SHEETS.STUDENTS),
          teachers: getSheetData(SHEETS.TEACHERS),
          courses: getSheetData(SHEETS.COURSES),
          enrollments: getSheetData(SHEETS.ENROLLMENTS),
          payments: getSheetData(SHEETS.PAYMENTS),
          evaluations: getSheetData(SHEETS.EVALUATIONS),
          evalQuestions: getSheetData(SHEETS.EVAL_QUESTIONS),
          courseInstructors: getSheetData(SHEETS.COURSE_INSTRUCTORS),
          evalInstructorQuestions: getSheetData(SHEETS.EVAL_INSTRUCTOR_QUESTIONS),
          documents: getSheetData(SHEETS.DOCUMENTS),
          announcements: getSheetData(SHEETS.ANNOUNCEMENTS),
          permissions: getSheetData(SHEETS.PERMISSIONS),
          exams: getSheetData(SHEETS.EXAMS),
          examCommittees: getSheetData(SHEETS.EXAM_COMMITTEES),
          applicants: getSheetData(SHEETS.APPLICANTS),
          schedules: getSheetData(SHEETS.SCHEDULE),
          documentTemplates: getSheetData(SHEETS.DOCUMENT_TEMPLATES),
          thesisProgress: getSheetData(SHEETS.THESIS_PROGRESS),
          graduationRequests: getSheetData(SHEETS.GRADUATION_REQUESTS)
        };
        break;
      case 'getPermissions':
        data = getSheetData(SHEETS.PERMISSIONS);
        break;
      case 'getExams':
        data = getSheetData(SHEETS.EXAMS);
        break;
      case 'getEvalQuestions':
        data = getSheetData(SHEETS.EVAL_QUESTIONS);
        break;
      case 'getCourseInstructors':
        data = getSheetData(SHEETS.COURSE_INSTRUCTORS);
        break;
      case 'getEvalInstructorQuestions':
        data = getSheetData(SHEETS.EVAL_INSTRUCTOR_QUESTIONS);
        break;
      case 'getDocuments':
        data = getSheetData(SHEETS.DOCUMENTS);
        break;
      case 'getSchedule':
        data = getSheetData(SHEETS.SCHEDULE);
        break;
      default:
        return createResponse({ status: 'error', message: 'Unknown action' });
    }
    console.log(`Action ${action} completed successfully`);
    return createResponse(data);
  } catch (err) {
    console.error(`doGet Error (${action}):`, err);
    return createResponse({ status: 'error', message: err.toString() });
  }
}

/**
 * Handle POST Requests (All actions requiring authentication or write)
 */
function doPost(e) {
  // Use LockService to prevent race conditions during concurrent writes
  const lock = LockService.getScriptLock();
  try {
    // Wait for up to 10 seconds for a lock before giving up
    lock.waitLock(10000);
  } catch (err) {
    return createResponse({ status: 'busy', message: 'เซิร์ฟเวอร์ไม่ว่างเนื่องจากมีผู้ใช้งานจำนวนมาก กรุณาลองใหม่อีกครั้งใน 10 วินาที' });
  }

  try {
    setupInitialSheets();
    const request = JSON.parse(e.postData.contents);
    const action = request.action;
    const payload = request.payload;

    let response;
    switch (action) {
      case 'registerStudent':
        appendRow(SHEETS.STUDENTS, payload);
        appendRow(SHEETS.USERS, {
          Username: payload.username || payload.studentId || payload.idCard,
          Password: payload.password || '123456',
          Name: payload.name || (payload.firstName + ' ' + payload.lastName),
          Role: 'student',
          Status: 'ใช้งาน'
        });
        response = createResponse({ status: 'success' });
        break;
      case 'registerTeacher':
        appendRow(SHEETS.TEACHERS, payload);
        appendRow(SHEETS.USERS, {
          Username: payload.username || payload.email,
          Password: payload.password || '111111',
          Name: payload.name || (payload.firstName + ' ' + payload.lastName),
          Role: 'staff',
          Status: 'ใช้งาน'
        });
        response = createResponse({ status: 'success' });
        break;
      case 'registerCourse':
        appendRow(SHEETS.COURSES, payload);
        response = createResponse({ status: 'success' });
        break;
      case 'uploadDocument':
        response = uploadDocumentToDrive(payload);
        break;
      case 'uploadFileOnly':
        response = uploadFileOnly(payload);
        break;
      case 'saveDocumentRecord':
        response = saveDocumentRecord(payload);
        break;
      case 'uploadBatch':
        response = uploadBatch(payload);
        break;
      case 'updateDocumentStatus':
        response = updateDocumentStatus(payload);
        break;
      case 'importGrades':
        response = importGradesBatch(payload);
        break;
      case 'postAnnouncement':
        response = postAnnouncement(payload);
        break;
      case 'importSchedule':
        response = importScheduleBatch(payload);
        break;
      case 'importDocumentTemplates':
        response = importDocumentTemplatesBatch(payload);
        break;
      case 'updatePermission':
        response = updatePermission(payload);
        break;
      case 'updateExam':
        response = updateExamResult(payload);
        break;
      case 'importExams':
        response = importExamsBatch(payload);
        break;
      case 'batchImportExamCommittee':
        response = batchImportExamCommittee(payload);
        break;
      case 'submitEvaluation':
        response = submitEvaluationResult(payload);
        break;
      case 'initializeApplication':
        response = initializeApplication(payload);
        break;
      case 'uploadApplicationFile':
        response = uploadApplicationFile(payload);
        break;
      case 'submitApplication':
        response = submitApplication(payload);
        break;
      case 'updateApplicantStatus':
        response = updateApplicantStatus(payload);
        break;
      case 'updateStudentStatus':
        response = updateStudentStatus(payload);
        break;
      case 'updateStudentDetail':
        response = updateStudentDetail(payload);
        break;
      case 'updateThesisMilestone':
        response = updateThesisMilestone(payload);
        break;
      case 'submitGraduationRequest':
        response = submitGraduationRequest(payload);
        break;
      case 'approveGraduationRequest':
        response = approveGraduationRequest(payload);
        break;
      case 'enrollApplicant':
        response = enrollApplicantToStudent(payload);
        break;
      default:
        response = createResponse({ status: 'error', message: 'Unknown POST action' });
    }
    
    lock.releaseLock();
    return response || createResponse({ status: 'success' });
  } catch (err) {
    if (lock) lock.releaseLock();
    return createResponse({ status: 'error', message: err.toString() });
  }
}

/**
 * Helper: Get data from sheet as JSON
 */
function getSheetData(sheetName) {
  const sheet = SS.getSheetByName(sheetName);
  if (!sheet) return [];
  
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  
  const headers = values[0].map(h => String(h).trim());
  const rows = values.slice(1);
  
  return rows.map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      let val = row[index];
      if (val instanceof Date) {
          val = Utilities.formatDate(val, Session.getScriptTimeZone(), "yyyy-MM-dd'T'HH:mm:ss");
      }
      obj[header] = val;
    });
    return obj;
  });
}

/**
 * UTILITY: Run this once to fix missing Tracking IDs in the Documents sheet
 */
function fixMissingIds() {
  const sheet = SS.getSheetByName(SHEETS.DOCUMENTS);
  if (!sheet) return;
  
  const values = sheet.getDataRange().getValues();
  const headers = values[0].map(h => String(h).trim());
  const idCol = headers.indexOf('รหัสติดตาม');
  
  if (idCol === -1) {
    setupInitialSheets();
    return fixMissingIds(); // Try again after setup
  }
  
  for (let i = 1; i < values.length; i++) {
    if (!values[i][idCol]) {
      const newId = 'DOC-FIX-' + new Date().getTime() + '-' + i;
      sheet.getRange(i + 1, idCol + 1).setValue(newId);
    }
  }
  SpreadsheetApp.getUi().alert('✅ แก้ไขรหัสติดตาม (Tracking ID) เสร็จเรียบร้อยแล้ว!\n\nกรุณากลับไปที่หน้าเว็บแล้วกด REFRESH (F5) 1 ครั้งเพื่อใช้งาน');
}

/**
 * Helper: Append a new row to a sheet
 */
function appendRow(sheetName, payload) {
  let sheet = SS.getSheetByName(sheetName);
  
  // Create sheet if not exists
  if (!sheet) {
    sheet = SS.insertSheet(sheetName);
    const headers = Object.keys(payload);
    sheet.appendRow(headers);
  }
  
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const newRow = headers.map(h => payload[h] || '');
  
  sheet.appendRow(newRow);
}

/**
 * Helper: Get or Create Folder for Documents
 */
function getDocumentsFolder() {
  if (CACHED_FOLDER) return CACHED_FOLDER;
  
  let folder;
  try {
    if (DRIVE_FOLDER_ID && DRIVE_FOLDER_ID !== '') {
      folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
    } else {
      throw new Error('No folder ID provided');
    }
  } catch (e) {
    const folderName = "Admission_Documents";
    const folders = DriveApp.getFoldersByName(folderName);
    folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);
  }
  
  CACHED_FOLDER = folder;
  return folder;
}

/**
 * Helper: Upload Base64 File to Google Drive
 * Supports groupId to group multiple files under one tracking ID
 */
function uploadDocumentToDrive(payload) {
  console.log('Starting uploadDocumentToDrive for: ' + payload.fileName);
  // 1. Get or Create Folder for Documents
  const folder = getDocumentsFolder();
  
  // 2. Decode and create file
  let data = payload.base64Data;
  if (data && data.indexOf(',') > -1) {
    data = data.split(',')[1];
  }
  
  const blob = Utilities.newBlob(Utilities.base64Decode(data), payload.mimeType || 'application/pdf', payload.fileName || 'document.pdf');
  const file = folder.createFile(blob);
  
  // Set sharing to anyone with the link can view
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  
  const fileUrl = file.getUrl();
  
  // 3. Save to Sheets
  const docId = payload.id;
  const groupId = payload.groupId;
  const sheet = SS.getSheetByName(SHEETS.DOCUMENTS);
  
  // --- Case A: Admin signed upload (has docId) ---
  if (docId && sheet) {
    const values = sheet.getDataRange().getValues();
    const headers = values[0];
    const idCol = headers.indexOf('รหัสติดตาม');
    
    let rowIndex = -1;
    for (let i = 1; i < values.length; i++) {
      if (values[i][idCol] == docId) {
        rowIndex = i + 1;
        break;
      }
    }
    
    if (rowIndex > 0) {
      const signedCol = headers.indexOf('ลิงก์เอกสารที่ลงนาม') + 1;
      if (signedCol > 0) {
        sheet.getRange(rowIndex, signedCol).setValue(fileUrl);
      }
      const statusCol = headers.indexOf('สถานะ') + 1;
      if (statusCol > 0) {
        sheet.getRange(rowIndex, statusCol).setValue('ลงนามเรียบร้อยแล้ว');
      }
      return createResponse({ status: 'success', id: docId, fileUrl: fileUrl, action: 'update' });
    } else {
      console.warn('uploadDocumentToDrive: docId ' + docId + ' not found in sheet.');
    }
  }

  // --- Case B: Grouped upload (has groupId, append to existing row) ---
  if (groupId && sheet) {
    const values = sheet.getDataRange().getValues();
    const headers = values[0];
    const idCol = headers.indexOf('รหัสติดตาม');
    
    let rowIndex = -1;
    for (let i = 1; i < values.length; i++) {
      if (String(values[i][idCol]).trim() === String(groupId).trim()) {
        rowIndex = i + 1;
        break;
      }
    }
    
    if (rowIndex > 0) {
      // Append file name and link to existing row
      const fileNameCol = headers.indexOf('ชื่อไฟล์') + 1;
      const linkCol = headers.indexOf('ลิงก์เอกสาร') + 1;
      
      if (fileNameCol > 0) {
        const oldName = sheet.getRange(rowIndex, fileNameCol).getValue();
        sheet.getRange(rowIndex, fileNameCol).setValue(oldName + ', ' + payload.fileName);
      }
      if (linkCol > 0) {
        const oldLink = sheet.getRange(rowIndex, linkCol).getValue();
        sheet.getRange(rowIndex, linkCol).setValue(oldLink + ', ' + fileUrl);
      }
      
      console.log('Appended file to existing group: ' + groupId);
      return createResponse({ status: 'success', id: groupId, fileUrl: fileUrl, action: 'append' });
    }
  }

  // --- Case C: New Row (first file in group or standalone) ---
  const newId = groupId || ('DOC-' + new Date().getTime());
  const newRowPayload = {
    'รหัสติดตาม': newId,
    'รหัสนักศึกษา': payload.studentId || '',
    'ชื่อผู้ส่ง': payload.senderName || '',
    'ประเภทเอกสาร': payload.documentType || 'ทั่วไป',
    'ชื่อไฟล์': payload.fileName || '',
    'ลิงก์เอกสาร': fileUrl,
    'วันที่ส่ง': Utilities.formatDate(new Date(), 'Asia/Bangkok', 'dd/MM/yyyy HH:mm'),
    'สถานะ': 'รอตรวจสอบ'
  };
  console.log('Inserting new document row:', newRowPayload);
  appendRow(SHEETS.DOCUMENTS, newRowPayload);
        return createResponse({ status: 'success', id: newId, fileUrl: fileUrl, action: 'insert' });
}

/**
 * Specialized: Upload File to Drive ONLY (No Sheet record)
 */
function uploadFileOnly(payload) {
  try {
    const folder = getDocumentsFolder();
    let data = payload.base64Data;
    if (data && data.indexOf(',') > -1) data = data.split(',')[1];
    
    const blob = Utilities.newBlob(Utilities.base64Decode(data), payload.mimeType || 'application/pdf', payload.fileName || 'document.pdf');
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    return createResponse({ status: 'success', fileUrl: file.getUrl(), fileName: payload.fileName });
  } catch (err) {
    console.error('uploadFileOnly Error:', err);
    return createResponse({ status: 'error', message: err.toString() });
  }
}

/**
 * Specialized: Save a single Document Record to the Sheet
 */
function saveDocumentRecord(payload) {
  try {
    const newId = 'DOC-' + new Date().getTime();
    const newRowPayload = {
      'รหัสติดตาม': newId,
      'รหัสนักศึกษา': payload.studentId || '',
      'ชื่อผู้ส่ง': payload.senderName || '',
      'ประเภทเอกสาร': payload.documentType || 'ทั่วไป',
      'ชื่อไฟล์': payload.fileNames || '', // Combined names
      'ลิงก์เอกสาร': payload.fileUrls || '', // Combined URLs
      'วันที่ส่ง': Utilities.formatDate(new Date(), 'Asia/Bangkok', 'dd/MM/yyyy HH:mm'),
      'สถานะ': 'รอตรวจสอบ',
      'ประวัติการดำเนินการ': JSON.stringify([{
        event: 'ยื่นคำร้อง',
        status: 'รอตรวจสอบ',
        actor: payload.senderName || 'นักศึกษา',
        timestamp: Utilities.formatDate(new Date(), 'Asia/Bangkok', 'dd/MM/yyyy HH:mm'),
        note: payload.note || 'ยื่นคำร้องผ่านระบบ'
      }])
    };
    
    appendRow(SHEETS.DOCUMENTS, newRowPayload);
    return createResponse({ status: 'success', id: newId });
  } catch (err) {
    console.error('saveDocumentRecord Error:', err);
    return createResponse({ status: 'error', message: err.toString() });
  }
}

/**
 * Handle Batch File Uploads for Speed
 */
function uploadBatch(payloads) {
  if (!Array.isArray(payloads)) return createResponse({ status: 'error', message: 'Payload must be an array' });
  
  const folderName = "Student_Documents";
  let folder;
  const folders = DriveApp.getFoldersByName(folderName);
  folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);
  
  const sheet = SS.getSheetByName(SHEETS.DOCUMENTS);
  if (!sheet) return createResponse({ status: 'error', message: 'Documents sheet not found' });
  
  // Get headers to ensure correct column mapping
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(h => String(h).trim());
  
  const results = payloads.map(payload => {
    try {
      let data = payload.base64Data;
      if (data && data.indexOf(',') > -1) data = data.split(',')[1];
      
      const blob = Utilities.newBlob(Utilities.base64Decode(data), payload.mimeType || 'application/pdf', payload.fileName || 'document.pdf');
      const file = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      const fileUrl = file.getUrl();
      
      const newId = payload.id || ('DOC-' + new Date().getTime() + '-' + Math.floor(Math.random() * 1000));
      const newRowPayload = {
        'รหัสติดตาม': newId,
        'รหัสนักศึกษา': payload.studentId || '',
        'ชื่อผู้ส่ง': payload.senderName || '',
        'ประเภทเอกสาร': payload.documentType || 'ทั่วไป',
        'ชื่อไฟล์': payload.fileName || '',
        'ลิงก์เอกสาร': fileUrl,
        'วันที่ส่ง': Utilities.formatDate(new Date(), 'Asia/Bangkok', 'dd/MM/yyyy HH:mm'),
        'สถานะ': 'รอตรวจสอบ',
        'ประวัติการดำเนินการ': JSON.stringify([{
          event: 'ยื่นคำร้อง (อัปโหลดไฟล์)',
          status: 'รอตรวจสอบ',
          actor: payload.senderName || 'นักศึกษา',
          timestamp: Utilities.formatDate(new Date(), 'Asia/Bangkok', 'dd/MM/yyyy HH:mm'),
          note: payload.note || 'ยื่นคำร้องและอัปโหลดไฟล์ผ่านระบบ'
        }])
      };
      
      // Efficient append: build row based on headers
      const row = headers.map(h => newRowPayload[h] || '');
      sheet.appendRow(row); 
      
      return { status: 'success', id: newId, fileName: payload.fileName, fileUrl: fileUrl };
    } catch (err) {
      console.error('Upload Error for ' + payload.fileName, err);
      return { status: 'error', fileName: payload.fileName, message: err.toString() };
    }
  });
  
  return createResponse({ status: 'success', results: results });
}

/**
 * Batch Import Exam Committee Members
 */
function batchImportExamCommittee(payload) {
  try {
    const sheet = SS.getSheetByName(SHEETS.EXAM_COMMITTEES);
    if (!sheet) return createResponse({ status: 'error', message: 'ExamCommittees sheet not found' });
    
    // Get headers to ensure correct column mapping
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(h => String(h).trim());
    
    if (Array.isArray(payload)) {
      payload.forEach(m => {
        const row = headers.map(h => {
          // Map incoming data to sheet headers
          // Headers are: ['ExamID', 'StudentID', 'Role', 'Prefix', 'FirstName', 'LastName', 'Position', 'Affiliation']
          return m[h] || '';
        });
        sheet.appendRow(row);
      });
      return createResponse({ status: 'success' });
    }
    return createResponse({ status: 'error', message: 'Invalid payload format' });
  } catch (err) {
    console.error('batchImportExamCommittee Error:', err);
    return createResponse({ status: 'error', message: err.toString() });
  }
}

/**
 * Helper: Update Document Status in Sheets
 */
function updateDocumentStatus(payload) {
  console.log('updateDocumentStatus payload:', payload);
  const sheet = SS.getSheetByName(SHEETS.DOCUMENTS);
  if (!sheet) return createResponse({ status: 'error', message: 'Documents sheet not found' });
  
  const values = sheet.getDataRange().getValues();
  const headers = values[0].map(h => String(h).trim());
  const rows = values.slice(1);
  
  console.log('Cleaned Headers:', headers);
  
  // Find row by ID
  let rowIndex = -1;
  const idCol = headers.indexOf('รหัสติดตาม');
  
  if (idCol !== -1 && payload.id) {
    for (let i = 0; i < rows.length; i++) {
        // Use loose equality and trim to match strings/numbers
        if (String(rows[i][idCol]).trim() == String(payload.id).trim()) {
          rowIndex = i + 2;
          console.log(`Match found by ID at row ${rowIndex}`);
          break;
        }
    }
  }
  
  // Fallback to studentId + documentType if ID not found
  if (rowIndex === -1) {
    console.log('ID match failed, attempting fallback match...');
    const sIdCol = headers.indexOf('รหัสนักศึกษา');
    const typeCol = headers.indexOf('ประเภทเอกสาร');
    
    if (sIdCol !== -1 && typeCol !== -1) {
        // Use studentId and documentName to find. 
        // We look for the MOST RECENT row (bottom-up) to avoid duplicates
        for (let i = rows.length - 1; i >= 0; i--) {
          const sId = String(rows[i][sIdCol]).trim();
          const type = String(rows[i][typeCol]).trim();
          const targetSId = String(payload.studentId).trim();
          const targetType = String(payload.documentType).trim();
          
          if (sId == targetSId && type == targetType) {
            rowIndex = i + 2;
            console.log(`Match found by fallback at row ${rowIndex}`);
            break;
          }
        }
    }
  }
  
  if (rowIndex === -1) {
    const debugInfo = `ID: ${payload.id}, Student: ${payload.studentId}, Type: ${payload.documentType}. Available Headers: ${headers.join(',')}`;
    console.error('Document not found:', debugInfo);
    return createResponse({ status: 'error', message: `ไม่พบข้อมูลเอกสารในระบบ (Document not found).\n\nรายละเอียด: ${debugInfo}\n\nคำแนะนำ: กรุณา Refresh หน้าเว็บ 1 ครั้งแล้วลองใหม่` });
  }
  
  // Update fields
  const updateMap = {
    'สถานะ': payload.status,
    'ผู้รับผิดชอบถัดไป': payload.nextStep,
    'หมายเหตุ': payload.note
  };
  
  if (payload.signedFileUrl) {
    updateMap['ลิงก์เอกสารที่ลงนาม'] = payload.signedFileUrl;
  }
  
  Object.keys(updateMap).forEach(headerName => {
    const colIndex = headers.indexOf(headerName) + 1;
    if (colIndex > 0) {
      sheet.getRange(rowIndex, colIndex).setValue(updateMap[headerName]);
    }
  });

  // Update History (ประวัติการดำเนินการ)
  const histCol = headers.indexOf('ประวัติการดำเนินการ');
  if (histCol !== -1) {
    let history = [];
    const histVal = rows[rowIndex - 2][histCol];
    if (histVal) {
      try {
        history = JSON.parse(histVal);
      } catch (e) {
        history = [{ event: 'ข้อมูลเดิม', status: rows[rowIndex-2][headers.indexOf('สถานะ')], timestamp: '-', note: histVal }];
      }
    }
    
    history.push({
      event: 'ปรับปรุงสถานะ',
      status: payload.status,
      actor: 'เจ้าหน้าที่',
      timestamp: Utilities.formatDate(new Date(), 'Asia/Bangkok', 'dd/MM/yyyy HH:mm'),
      note: payload.note || ''
    });
    
    sheet.getRange(rowIndex, histCol + 1).setValue(JSON.stringify(history));
  }
  
  return createResponse({ status: 'success' });
}

/**
 * Helper: Import Grades in Batch
 */
function importGradesBatch(payload) {
  const sheet = SS.getSheetByName(SHEETS.ENROLLMENTS);
  if (!sheet) return createResponse({ status: 'error', message: 'Enrollments sheet not found' });
  
  const data = payload.grades; // Array of objects
  if (!data || !Array.isArray(data)) return createResponse({ status: 'error', message: 'Invalid grades data' });
  
  const sheetData = sheet.getDataRange().getValues();
  const headers = sheetData[0].map(h => String(h).trim());
  const rows = sheetData.slice(1);
  
  const sIdIdx = headers.indexOf('รหัสนักศึกษา');
  const cCodeIdx = headers.indexOf('รหัสวิชา');
  const semIdx = headers.indexOf('ภาคเรียน');
  const yearIdx = headers.indexOf('ปีการศึกษา');
  
  if (sIdIdx === -1) return createResponse({ status: 'error', message: 'Enrollments sheet headers missing "รหัสนักศึกษา"' });
  
  // Helper to get value using multiple possible keys
  const getVal = (item, thKey, enKey) => item[thKey] || item[enKey] || '';

  const newRows = [];
  const updates = []; // {row, values}

  data.forEach(item => {
    const sId = String(getVal(item, 'รหัสนักศึกษา', 'student_id')).trim();
    const cCode = String(getVal(item, 'รหัสวิชา', 'course_code')).trim();
    const sem = String(getVal(item, 'ภาคเรียน', 'semester')).trim();
    const year = String(getVal(item, 'ปีการศึกษา', 'academic_year')).trim();
    
    if (!sId) return;

    let existingRowIdx = -1;
    for (let i = 0; i < rows.length; i++) {
      if (String(rows[i][sIdIdx]).trim() === sId && 
          String(rows[i][cCodeIdx]).trim() === cCode && 
          String(rows[i][semIdx]).trim() === sem && 
          String(rows[i][yearIdx]).trim() === year) {
        existingRowIdx = i + 2; // +1 for slice, +1 for 1-based range
        break;
      }
    }

    const rowValues = headers.map(h => {
      // Map common Thai headers to possible EN keys
      if (h === 'รหัสนักศึกษา') return sId;
      if (h === 'รหัสวิชา') return cCode;
      if (h === 'ชื่อวิชา') return getVal(item, 'ชื่อวิชา', 'course_name');
      if (h === 'หน่วยกิต') return getVal(item, 'หน่วยกิต', 'credits');
      if (h === 'ภาคเรียน') return sem;
      if (h === 'ปีการศึกษา') return year;
      if (h === 'เกรด') return getVal(item, 'เกรด', 'grade');
      return item[h] || '';
    });

    if (existingRowIdx > 0) {
      updates.push({ row: existingRowIdx, values: rowValues });
    } else {
      newRows.push(rowValues);
    }
  });

  // Execute updates
  updates.forEach(u => {
    sheet.getRange(u.row, 1, 1, headers.length).setValues([u.values]);
  });
  
  // Execute appends
  if (newRows.length > 0) {
    sheet.getRange(sheet.getLastRow() + 1, 1, newRows.length, headers.length).setValues(newRows);
  }
  
  return createResponse({ status: 'success', count: data.length });
}

/**
 * Post a new announcement
 */
function postAnnouncement(payload) {
  setupInitialSheets();
  const sheet = SS.getSheetByName(SHEETS.ANNOUNCEMENTS);
  if (!sheet) return createResponse({ status: 'error', message: 'Announcements sheet not found' });
  
  const announcementId = 'ANN-' + new Date().getTime();
  const dateStr = new Date().toISOString();
  
  const row = [
    announcementId,
    payload.type || 'ทั่วไป',
    payload.title || 'ไม่มีหัวข้อ',
    payload.content || '',
    dateStr,
    payload.icon || '📢',
    payload.author || 'Admin'
  ];
  
  sheet.appendRow(row);
  return createResponse({ status: 'success', id: announcementId });
}

/**
 * Update a specific permission
 */
function updatePermission(payload) {
  const sheet = SS.getSheetByName(SHEETS.PERMISSIONS);
  if (!sheet) return createResponse({ status: 'error', message: 'Permissions sheet not found' });
  
  let data = sheet.getDataRange().getValues();
  let headers = data[0];
  let roleIdx = headers.indexOf('Role');
  let actionIdx = headers.indexOf(payload.actionKey);
  
  // If column doesn't exist, create it!
  if (actionIdx === -1) {
    const lastCol = sheet.getLastColumn();
    sheet.getRange(1, lastCol + 1).setValue(payload.actionKey);
    // Fill new column with 'NO' for all rows by default
    if (sheet.getLastRow() > 1) {
      sheet.getRange(2, lastCol + 1, sheet.getLastRow() - 1, 1).setValue('NO');
    }
    // Refresh data/headers
    data = sheet.getDataRange().getValues();
    headers = data[0];
    actionIdx = headers.indexOf(payload.actionKey);
  }
  
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][roleIdx]).toLowerCase() === String(payload.role).toLowerCase()) {
      sheet.getRange(i + 1, actionIdx + 1).setValue(payload.value ? 'YES' : 'NO');
      return createResponse({ status: 'success' });
    }
  }
  
  return createResponse({ status: 'error', message: 'Role not found' });
}

/**
 * Helper: Import Schedule in Batch
 */
function importScheduleBatch(payload) {
  const sheet = SS.getSheetByName(SHEETS.SCHEDULE);
  if (!sheet) return createResponse({ status: 'error', message: 'Schedule sheet not found' });
  
  const data = payload.schedules; // Array of objects
  if (!data || !Array.isArray(data)) return createResponse({ status: 'error', message: 'Invalid schedule data' });
  
  const sheetData = sheet.getDataRange().getValues();
  const headers = sheetData[0].map(h => String(h).trim());
  
  const newRows = data.map(item => {
    return headers.map(h => {
      // Map case-insensitive or common variants
      if (item[h] !== undefined) return item[h];
      const lowerH = h.toLowerCase();
      const keys = Object.keys(item);
      for (let k of keys) {
        if (k.toLowerCase() === lowerH) return item[k];
      }
      return '';
    });
  });

  if (newRows.length > 0) {
    // For Schedule, we typically CLEAR and REPLACE or APPEND. 
    // Usually, a new import REPLACES the whole schedule for a semester.
    // However, to be safe, let's APPEND and user can clear manually or we add a 'clear' flag.
    if (payload.clearExisting) {
       if (sheet.getLastRow() > 1) {
         sheet.getRange(2, 1, sheet.getLastRow() - 1, headers.length).clearContent();
       }
       sheet.getRange(2, 1, newRows.length, headers.length).setValues(newRows);
    } else {
       sheet.getRange(sheet.getLastRow() + 1, 1, newRows.length, headers.length).setValues(newRows);
    }
  }
  
  return createResponse({ status: 'success', count: data.length });
}

/**
 * Helper: Import Document Templates in Batch
 */
function importDocumentTemplatesBatch(payload) {
  const sheet = SS.getSheetByName(SHEETS.DOCUMENT_TEMPLATES);
  if (!sheet) return createResponse({ status: 'error', message: 'Document Templates sheet not found' });
  
  const data = payload.templates;
  if (!data || !Array.isArray(data)) return createResponse({ status: 'error', message: 'Invalid templates data' });
  
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  if (payload.clearExisting) {
    if (sheet.getLastRow() > 1) {
      sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clearContent();
    }
  }
  
  const newRows = data.map(item => {
    return headers.map(h => item[h] || '');
  });
  
  if (newRows.length > 0) {
    sheet.getRange(sheet.getLastRow() + 1, 1, newRows.length, headers.length).setValues(newRows);
  }
  
  return createResponse({ status: 'success', count: data.length });
}

/**
 * Run this once to initialize all sheets
 */
function setupInitialSheets() {
  const defaultHeaders = {
    [SHEETS.USERS]: ['Username', 'Password', 'Name', 'Role', 'Status'],
    [SHEETS.STUDENTS]: ['รหัสนักศึกษา', 'คำนำหน้า', 'ชื่อ (ไทย)', 'นามสกุล (ไทย)', 'ชื่อ (EN)', 'นามสกุล (EN)', 'เลขประจำตัวประชาชน', 'เพศ', 'วันเกิด (YYYY-MM-DD)', 'ที่อยู่', 'เบอร์โทร', 'อีเมลส่วนตัว', 'E-mail ของสถาบัน', 'คณะ', 'สาขาวิชา', 'หลักสูตร', 'ชั้นปี', 'สถานะ', 'ปีการศึกษาที่เข้า', 'อาจารย์ที่ปรึกษา', 'อาจารย์ที่ปรึกษาวิทยานิพนธ์', 'หัวข้อวิทยานิพนธ์', 'สถานที่ปฏิบัติงาน', 'ตำแหน่ง', 'ผู้ปกครอง', 'เบอร์ผู้ปกครอง'],
    [SHEETS.TEACHERS]: ['คำนำหน้า','ชื่อ','นามสกุล','ตำแหน่งทางวิชาการ','ความเชี่ยวชาญ','อีเมล','เบอร์โทร','คณะ/สังกัด','นศ. ในกำกับ','Username','Password','ประเภทอาจารย์'],
    [SHEETS.COURSES]: ['รหัสวิชา', 'ชื่อวิชา', 'หน่วยกิต', 'กลุ่ม', 'อาจารย์ผู้สอน'],
    [SHEETS.ENROLLMENTS]: ['รหัสนักศึกษา', 'ชื่อ-นามสกุล', 'รหัสวิชา', 'ชื่อวิชา', 'หน่วยกิต', 'หมวดวิชา', 'กลุ่มเรียน', 'เกรด', 'ภาคเรียน', 'ปีการศึกษา'],
    [SHEETS.PAYMENTS]: ['รหัสนักศึกษา', 'รายการ', 'จำนวนเงิน', 'สถานะ', 'วันที่'],
    [SHEETS.EVALUATIONS]: ['รหัสวิชา', 'คะแนน', 'ข้อคิดเห็น', 'วันที่'],
    [SHEETS.DOCUMENTS]: ['รหัสติดตาม', 'รหัสนักศึกษา', 'ชื่อผู้ส่ง', 'ประเภทเอกสาร', 'ชื่อไฟล์', 'ลิงก์เอกสาร', 'วันที่ส่ง', 'สถานะ', 'ผู้รับผิดชอบถัดไป', 'ลิงก์เอกสารที่ลงนาม', 'หมายเหตุ', 'ประวัติการดำเนินการ'],
    [SHEETS.ANNOUNCEMENTS]: ['รหัสประกาศ', 'ประเภท', 'หัวข้อ', 'เนื้อหา', 'วันที่ประกาศ', 'ไอคอน', 'ผู้ประกาศ'],
    [SHEETS.PERMISSIONS]: ['Role', 'import_student', 'export_template', 'manage_users', 'post_announcement', 'delete_data', 
                            'nav-dashboard', 'nav-student-profile', 'nav-teacher-profile', 'nav-special-lecturers', 'nav-alumni', 'nav-new-registration', 'nav-teacher-registration', 'nav-courses', 'nav-study-plan', 
                            'nav-grades', 'nav-schedule', 'nav-eval-course', 'nav-eval-instructor', 'nav-transcript', 'nav-exams', 'nav-graduation', 
                            'nav-thesis-advisor', 'nav-thesis-topic', 'nav-academic-advisor', 'nav-exam-committee', 
                            'nav-payments', 'nav-petitions-student', 'nav-documents-status', 'nav-documents-admin', 'nav-manage-evals', 'nav-eval-reports', 'nav-teaching-fees', 'nav-calendar', 'nav-announcements', 'nav-settings', 'nav-user-management', 'nav-admission', 'nav-manage-schedule', 'nav-manage-forms', 'nav-thesis-dashboard', 'nav-thesis-update'],
    [SHEETS.EXAMS]: ['id', 'student_id', 'exam_type', 'status', 'score', 'date', 'note'],
    [SHEETS.EXAM_COMMITTEES]: ['ExamID', 'StudentID', 'ExamType', 'ExamDate', 'ExamTime', 'ExamRoom', 'Advisor', 'ThesisTitle', 'Role', 'Prefix', 'FirstName', 'LastName', 'Position', 'Affiliation'],
    [SHEETS.EVAL_QUESTIONS]: ['course_code', 'section', 'category', 'question_id', 'question_text'],
    [SHEETS.COURSE_INSTRUCTORS]: ['course_code', 'course_name', 'instructor_id', 'instructor_name', 'group', 'semester', 'academic_year'],
    [SHEETS.EVAL_INSTRUCTOR_QUESTIONS]: ['question_id', 'question_text'],
    [SHEETS.APPLICANTS]: ['ApplicationID', 'Status', 'Date', 'Prefix', 'FirstName', 'LastName', 'FirstNameEn', 'LastNameEn', 'IdCard', 'Dob', 'Age', 'Religion', 'Nationality', 'Email', 'Phone', 'PhoneHome', 'PhoneWork', 'Program', 'Major', 'Address', 'EducationHistory', 'TrainingHistory', 'WorkStatus', 'WorkHistory', 'CurrentWorkplace', 'ResearchTopic', 'DocumentsLink', 'Notes'],
    [SHEETS.SCHEDULE]: ['วันที่', 'เวลา', 'หัวข้อ', 'อาจารย์ผู้สอน', 'ภาคเรียน', 'ปีการศึกษา'],
    [SHEETS.DOCUMENT_TEMPLATES]: ['id', 'name', 'type'],
    [SHEETS.THESIS_PROGRESS]: [
      'StudentID','StudentName','Major','Cohort','AdvisorName',
      'M1_Status','M1_Date','M1_Note',
      'M2_Status','M2_Date','M2_Note',
      'M3_Status','M3_Date','M3_Note',
      'M4_Status','M4_EthicsDate1','M4_EthicsNo1','M4_EthicsNote1','M4_EthicsDate2','M4_EthicsNo2','M4_EthicsNote2','M4_Note',
      'M5_Status','M5_Date','M5_Score','M5_Note',
      'M6_Status','M6_Date','M6_Journal','M6_Note',
      'M7_Status','M7_Date','M7_Note',
      'M8_Status','M8_Date','M8_Note',
      'LastUpdated','UpdatedBy'
    ],
    [SHEETS.GRADUATION_REQUESTS]: ['id', 'studentId', 'studentName', 'requestDate', 'status', 'note']
  };

  const defaultPermissions = [
    ['admin',   'YES','YES','YES','YES','YES','YES','YES','YES','YES','YES','YES','YES','YES','YES','YES','YES','YES','YES','YES','YES','YES','YES','YES','YES','YES','YES','YES','YES','YES','YES','YES','YES','YES','YES','YES','YES','YES','YES','YES'],
    ['teacher', 'NO', 'YES','NO', 'YES','NO', 'YES','YES','YES','YES','YES','YES','NO', 'YES','YES','YES','YES','YES','YES','YES','YES','NO', 'YES','YES','YES','YES','YES','YES','YES','YES','NO', 'YES','YES','YES','YES','NO', 'NO', 'YES','YES'],
    ['student', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'YES','NO', 'NO', 'NO', 'NO', 'NO', 'YES','YES','YES','YES','YES','YES','YES','YES','YES','YES','YES','YES','YES','YES','YES','YES','NO', 'NO', 'NO', 'YES','YES','YES','NO', 'NO', 'YES','NO']
  ];

  Object.keys(defaultHeaders).forEach(sheetName => {
    let sheet = SS.getSheetByName(sheetName);
    if (!sheet) {
      sheet = SS.insertSheet(sheetName);
      sheet.appendRow(defaultHeaders[sheetName]);
      
      // Special initialization for Permissions
      if (sheetName === SHEETS.PERMISSIONS) {
        defaultPermissions.forEach(p => sheet.appendRow(p));
      }
    } else {
      // Check if we need to add missing columns to existing sheets
      const currentHeaders = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0].map(h => String(h).trim());
      defaultHeaders[sheetName].forEach(h => {
        if (currentHeaders.indexOf(h) === -1) {
          sheet.getRange(1, sheet.getLastColumn() + 1).setValue(h);
        }
      });
    }
  });

  // Add a sample admin if Users sheet was just created
  const userSheet = SS.getSheetByName(SHEETS.USERS);
  if (userSheet.getLastRow() === 1) {
    userSheet.appendRow(['admin', '999999', 'Super Admin', 'admin', 'ใช้งาน']);
  }
}

/**
 * Helper: Create a standardized JSON response for Apps Script
 */
function createResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Update or Insert an Exam Result
 */
function updateExamResult(payload) {
  const sheet = SS.getSheetByName(SHEETS.EXAMS);
  if (!sheet) return createResponse({ status: 'error', message: 'Exams sheet not found' });
  
  const values = sheet.getDataRange().getValues();
  const headers = values[0].map(h => String(h).trim());
  const rows = values.slice(1);
  
  const sIdIdx = headers.indexOf('student_id');
  const typeIdx = headers.indexOf('exam_type');
  const idColIdx = headers.indexOf('id');
  
  if (sIdIdx === -1 || typeIdx === -1) {
    return createResponse({ status: 'error', message: 'Exams sheet headers missing' });
  }
  
  let rowIndex = -1;
  const id = payload.id ? String(payload.id).trim() : null;
  const sId = String(payload.student_id).trim();
  const type = String(payload.exam_type).trim();
  
  if (id) {
    // If ID is provided, look for that specific record to update
    for (let i = 0; i < rows.length; i++) {
      if (String(rows[i][idColIdx]).trim() === id) {
        rowIndex = i + 2;
        break;
      }
    }
  }
  
  // If no ID or ID not found, and we want to prevent duplicates for SAME TYPE on SAME DATE? 
  // No, user specifically wants "multiple times", so we should allow separate records.
  // If no ID provided, it's a NEW attempt. Generate a new ID.
  const finalId = id || ('EXM-' + new Date().getTime() + '-' + Math.floor(Math.random() * 1000));
  
  const rowData = headers.map(h => {
    if (h === 'id') return finalId;
    return payload[h] !== undefined ? payload[h] : '';
  });
  
  if (rowIndex !== -1) {
    sheet.getRange(rowIndex, 1, 1, headers.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }
  
  return createResponse({ status: 'success' });
}

/**
 * Helper: Import Exams in Batch
 */
function importExamsBatch(payload) {
  const sheet = SS.getSheetByName(SHEETS.EXAMS);
  if (!sheet) return createResponse({ status: 'error', message: 'Exams sheet not found' });
  
  const data = payload.exams; // Array of objects
  if (!data || !Array.isArray(data)) return createResponse({ status: 'error', message: 'Invalid exams data' });
  
  const sheetData = sheet.getDataRange().getValues();
  const headers = sheetData[0].map(h => String(h).trim());
  const rows = sheetData.slice(1);
  
  const sIdIdx = headers.indexOf('student_id');
  const typeIdx = headers.indexOf('exam_type');
  
  if (sIdIdx === -1 || typeIdx === -1) return createResponse({ status: 'error', message: 'Exams sheet headers missing' });
  
  const updates = [];
  const newRows = [];

  data.forEach(item => {
    const sId = String(item.student_id || '').trim();
    const type = String(item.exam_type || '').trim();
    const itemId = item.id ? String(item.id).trim() : null;
    if (!sId || !type) return;

    let existingRowIdx = -1;
    if (itemId) {
        for (let i = 0; i < rows.length; i++) {
            if (String(rows[i][headers.indexOf('id')]).trim() === itemId) {
                existingRowIdx = i + 2;
                break;
            }
        }
    }

    const finalId = itemId || ('EXM-' + new Date().getTime() + '-' + Math.floor(Math.random() * 1000) + '-' + updates.length + newRows.length);
    const rowValues = headers.map(h => {
        if (h === 'id') return finalId;
        return item[h] !== undefined ? item[h] : '';
    });
    if (existingRowIdx > 0) {
        updates.push({ row: existingRowIdx, values: rowValues });
    } else {
        newRows.push(rowValues);
    }
  });

  // Execute updates
  updates.forEach(u => {
    sheet.getRange(u.row, 1, 1, headers.length).setValues([u.values]);
  });
  
  // Execute insertions
  if (newRows.length > 0) {
    sheet.getRange(sheet.getLastRow() + 1, 1, newRows.length, headers.length).setValues(newRows);
  }

  return createResponse({ status: 'success', count: data.length });
}

/**
 * Submit Evaluation Result (Course or Instructor)
 */
function submitEvaluationResult(payload) {
  const sheet = SS.getSheetByName(SHEETS.EVALUATIONS);
  if (!sheet) return createResponse({ status: 'error', message: 'Evaluations sheet not found' });
  
  const evalId = 'EVAL-' + new Date().getTime() + '-' + Math.floor(Math.random() * 1000);
  const dateStr = new Date().toISOString().split('T')[0];
  
  const rowPayload = {
    'id': evalId,
    'type': payload.type || 'course',
    'student_id': payload.studentId || '',
    'course_code': payload.courseCode || '',
    'course_name': payload.courseName || '',
    'instructor_id': payload.instructor || '',
    'scores': JSON.stringify(payload.scores || {}),
    'comment': payload.comment || '',
    'skipped': payload.skipped ? 'true' : 'false',
    'date': dateStr
  };
  
  const data = sheet.getDataRange().getValues();
  const currentHeaders = data[0].map(h => String(h).trim());
  const rows = data.slice(1);
  
  // Find existing row (to prevent duplicates and allow undo)
  let existingRowIdx = -1;
  const sIdIdx = currentHeaders.indexOf('student_id');
  const typeIdx = currentHeaders.indexOf('type');
  const cCodeIdx = currentHeaders.indexOf('course_code');
  const instIdx = currentHeaders.indexOf('instructor_id');
  
  if (sIdIdx > -1 && typeIdx > -1 && cCodeIdx > -1) {
      for (let i = 0; i < rows.length; i++) {
          if (String(rows[i][sIdIdx]).trim() === String(payload.studentId).trim() &&
              String(rows[i][typeIdx]).trim() === String(payload.type).trim() &&
              String(rows[i][cCodeIdx]).trim() === String(payload.courseCode).trim()) {
              
              if (payload.type === 'instructor' && instIdx > -1) {
                  if (String(rows[i][instIdx]).trim() === String(payload.instructor).trim()) {
                      existingRowIdx = i + 2;
                      break;
                  }
              } else if (payload.type === 'course') {
                  existingRowIdx = i + 2;
                  break;
              }
          }
      }
  }

  const requiredHeaders = Object.keys(rowPayload);
  
  requiredHeaders.forEach(h => {
    if (currentHeaders.indexOf(h) === -1) {
      sheet.getRange(1, sheet.getLastColumn() + 1).setValue(h);
      currentHeaders.push(h);
    }
  });
  
  // Build row based on actual header order
  const updatedHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(h => String(h).trim());
  const newRow = updatedHeaders.map(h => rowPayload[h] || '');
  
  if (existingRowIdx > 0) {
      // Preserve ID
      const idCol = updatedHeaders.indexOf('id');
      if (idCol > -1) newRow[idCol] = sheet.getRange(existingRowIdx, idCol + 1).getValue();
      sheet.getRange(existingRowIdx, 1, 1, updatedHeaders.length).setValues([newRow]);
  } else {
      sheet.appendRow(newRow);
  }
  
  return createResponse({ status: 'success' });
}

/**
 * Public: Step 1 - Initialize Application (Text Details & Folder Creation)
 */
function initializeApplication(payload) {
  try {
    const appId = 'APP-' + new Date().getTime() + '-' + Math.floor(Math.random() * 1000);
    const dateStr = new Date().toISOString().split('T')[0];
    
    // Create dedicated folder
    const applicantName = (payload.FirstName || '') + '_' + (payload.LastName || '');
    const folderName = `Admission_${appId}_${applicantName}`;
    const parentFolder = getDocumentsFolder();
    const applicantFolder = parentFolder.createFolder(folderName);
    applicantFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    const folderUrl = applicantFolder.getUrl();
    const docLinks = { '_folder': folderUrl };
    
    const rowData = {
      ...payload,
      'ApplicationID': appId,
      'Status': 'Pending',
      'Date': dateStr,
      'DocumentsLink': JSON.stringify(docLinks)
    };
    
    // Remove temporary attachments if they exist (should be empty in step 1)
    delete rowData.attachments;
    
    appendRow(SHEETS.APPLICANTS, rowData);
    
    return createResponse({ 
      status: 'success', 
      appId: appId, 
      folderId: applicantFolder.getId(),
      folderUrl: folderUrl
    });
  } catch (e) {
    return createResponse({ status: 'error', message: e.toString() });
  }
}

/**
 * Public: Step 2 - Upload a single file and update sheet mapping
 */
function uploadApplicationFile(payload) {
  try {
    const { appId, folderId, fileName, mimeType, docType, base64Data } = payload;
    const folder = DriveApp.getFolderById(folderId);
    
    let data = base64Data;
    if (data && data.indexOf(',') > -1) data = data.split(',')[1];
    
    const blob = Utilities.newBlob(Utilities.base64Decode(data), mimeType, fileName);
    const driveFile = folder.createFile(blob);
    driveFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    const fileUrl = driveFile.getUrl();
    
    // Update Sheet with the new link
    const sheet = SS.getSheetByName(SHEETS.APPLICANTS);
    const dataRange = sheet.getDataRange().getValues();
    const headers = dataRange[0].map(h => String(h).trim());
    const appIdIdx = headers.indexOf('ApplicationID');
    const docLinkIdx = headers.indexOf('DocumentsLink');
    
    if (appIdIdx === -1 || docLinkIdx === -1) throw new Error('Sheet headers missing required columns');
    
    for (let i = 1; i < dataRange.length; i++) {
        if (dataRange[i][appIdIdx] === appId) {
            const currentLinksStr = dataRange[i][docLinkIdx] || '{}';
            let links = {};
            try { links = JSON.parse(currentLinksStr); } catch(e) {}
            
            links[docType] = fileUrl;
            sheet.getRange(i + 1, docLinkIdx + 1).setValue(JSON.stringify(links));
            break;
        }
    }
    
    return createResponse({ status: 'success', url: fileUrl });
  } catch (e) {
    return createResponse({ status: 'error', message: e.toString() });
  }
}

/**
 * Public: Standard Submission (Legacy Fallback)
 */
function submitApplication(payload) {
  // Use the new functions sequentially for legacy support if needed
  // But prefer calling Step 1 and Step 2 separately from frontend
  const appId = 'APP-' + new Date().getTime() + '-' + Math.floor(Math.random() * 1000);
  const dateStr = new Date().toISOString().split('T')[0];
  
  let docLinks = {};
  if (payload.attachments && Array.isArray(payload.attachments)) {
    try {
      const applicantName = (payload.FirstName || '') + '_' + (payload.LastName || '');
      const folderName = `Admission_${appId}_${applicantName}`;
      const parentFolder = getDocumentsFolder();
      const applicantFolder = parentFolder.createFolder(folderName);
      applicantFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      
      const folderUrl = applicantFolder.getUrl();
      docLinks['_folder'] = folderUrl;
      
      payload.attachments.forEach(file => {
        let data = file.base64Data;
        if (data && data.indexOf(',') > -1) data = data.split(',')[1];
        
        const blob = Utilities.newBlob(Utilities.base64Decode(data), file.mimeType, `${applicantName}_${file.type}.${file.mimeType.split('/')[1]}`);
        const driveFile = applicantFolder.createFile(blob);
        driveFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        docLinks[file.type] = driveFile.getUrl();
      });
    } catch (e) {
      console.error('Error saving attachments: ' + e.toString());
    }
  }

  const rowData = {
    ...payload,
    'ApplicationID': appId,
    'Status': 'Pending',
    'Date': dateStr,
    'DocumentsLink': JSON.stringify(docLinks)
  };
  
  delete rowData.attachments;
  return appendRowAsResponse(SHEETS.APPLICANTS, rowData);
}

/**
 * Admin: Update Applicant Status
 */
function updateApplicantStatus(payload) {
  const sheet = SS.getSheetByName(SHEETS.APPLICANTS);
  if (!sheet) return createResponse({ status: 'error', message: 'Applicants sheet not found' });
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0].map(h => String(h).trim());
  const rows = data.slice(1);
  
  const idIdx = headers.indexOf('ApplicationID');
  const statusIdx = headers.indexOf('Status');
  
  for (let i = 0; i < rows.length; i++) {
    if (String(rows[i][idIdx]).trim() === String(payload.id).trim()) {
      sheet.getRange(i + 2, statusIdx + 1).setValue(payload.status);
      return createResponse({ status: 'success' });
    }
  }
  
  return createResponse({ status: 'error', message: 'Applicant not found' });
}

/**
 * Admin: Enroll Applicant as Student
 */
function enrollApplicantToStudent(payload) {
  const applicantSheet = SS.getSheetByName(SHEETS.APPLICANTS);
  const studentSheet = SS.getSheetByName(SHEETS.STUDENTS);
  const userSheet = SS.getSheetByName(SHEETS.USERS);
  
  if (!applicantSheet || !studentSheet || !userSheet) {
    return createResponse({ status: 'error', message: 'Required sheets not found' });
  }
  
  const applicantData = applicantSheet.getDataRange().getValues();
  const aHeaders = applicantData[0].map(h => String(h).trim());
  const aRows = applicantData.slice(1);
  const aIdIdx = aHeaders.indexOf('ApplicationID');
  const aStatusIdx = aHeaders.indexOf('Status');
  
  let applicant = null;
  let applicantRowIndex = -1;
  for (let i = 0; i < aRows.length; i++) {
    if (String(aRows[i][aIdIdx]).trim() === String(payload.id).trim()) {
      applicantRowIndex = i + 2;
      applicant = {};
      aHeaders.forEach((h, idx) => applicant[h] = aRows[i][idx]);
      break;
    }
  }
  
  if (!applicant) return createResponse({ status: 'error', message: 'Applicant not found' });
  
  // Mapping Applicant data to Student headers
  const sHeaders = studentSheet.getRange(1, 1, 1, studentSheet.getLastColumn()).getValues()[0].map(h => String(h).trim());
  
  const studentPayload = {
    'คำนำหน้า': applicant.Prefix,
    'ชื่อ (ไทย)': applicant.FirstName,
    'นามสกุล (ไทย)': applicant.LastName,
    'ชื่อ (EN)': applicant.FirstNameEn,
    'นามสกุล (EN)': applicant.LastNameEn,
    'เลขบัตรประชาชน': applicant.IdCard,
    'รหัสนักศึกษา': payload.studentId, // ID assigned by admin
    'วันเกิด (YYYY-MM-DD)': applicant.Dob,
    'เพศ': applicant.Gender || '-',
    'อีเมล': applicant.Email,
    'E-mail ของสถาบัน': payload.studentId + '@pi.ac.th',
    'เบอร์โทร': applicant.Phone,
    'สาขาวิชา': applicant.Major,
    'ปีการศึกษาที่เข้า': applicant.AdmissionYear || new Date().getFullYear() + 543,
    'ที่อยู่': applicant.Address,
    'Username': payload.studentId,
    'Password': payload.password || '123456'
  };
  
  const studentRow = sHeaders.map(h => studentPayload[h] || '');
  studentSheet.appendRow(studentRow);
  
  // Add to Users sheet
  const uHeaders = userSheet.getRange(1, 1, 1, userSheet.getLastColumn()).getValues()[0].map(h => String(h).trim());
  const userPayload = {
    Username: payload.studentId,
    Password: payload.password || '123456',
    Name: applicant.FirstName + ' ' + applicant.LastName,
    Role: 'student',
    Status: 'ใช้งาน'
  };
  const userRow = uHeaders.map(h => userPayload[h] || '');
  userSheet.appendRow(userRow);
  
  // Update Applicant Status to Enrolled
  applicantSheet.getRange(applicantRowIndex, aStatusIdx + 1).setValue('Enrolled');
  
  return createResponse({ status: 'success', studentId: payload.studentId });
}

/**
 * Admin: Update Student Status (Studying, On Leave, Resigned, Graduated)
 */
function updateStudentStatus(payload) {
  const sheet = SS.getSheetByName(SHEETS.STUDENTS);
  if (!sheet) return createResponse({ status: 'error', message: 'Students sheet not found' });
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0].map(h => String(h).trim());
  const rows = data.slice(1);
  
  const idIdx = headers.indexOf('รหัสนักศึกษา');
  const statusIdx = headers.indexOf('สถานะ');
  
  if (idIdx === -1 || statusIdx === -1) {
    return createResponse({ status: 'error', message: 'Students sheet headers missing (Required: รหัสนักศึกษา, สถานะ)' });
  }
  
  const targetId = String(payload.studentId || payload.id || '').trim();
  const newStatus = payload.status;
  
  for (let i = 0; i < rows.length; i++) {
    if (String(rows[i][idIdx]).trim() === targetId) {
      sheet.getRange(i + 2, statusIdx + 1).setValue(newStatus);
      return createResponse({ status: 'success' });
    }
  }
  
  return createResponse({ status: 'error', message: 'Student not found: ' + targetId });
}

/**
 * Helper: Get or Create the root folder for Admission Documents
 */
function getDocumentsFolder_Legacy() {
  return getDocumentsFolder(); // Redirect to consolidated function above
}

/**
 * Standard createResponse JSON helper
 */
function createResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Update Student Detail Data (General)
 */
function updateStudentDetail(payload) {
  try {
    const sheet = SS.getSheetByName(SHEETS.STUDENTS);
    if (!sheet) return createResponse({ status: 'error', message: 'ERROR: Students sheet not found' });
    
    const values = sheet.getDataRange().getValues();
    const rawHeaders = values[0].map(h => String(h).trim());
    const headers = rawHeaders.map(h => h.toLowerCase());
    
    // Flexible header lookup for ID
    const possibleIdHeaders = ['รหัสนักศึกษา', 'student id', 'id', 'student_id', 'studentid', 'รหัส', 'code'];
    let idIdx = -1;
    for (let h of possibleIdHeaders) {
      idIdx = headers.indexOf(h.toLowerCase());
      if (idIdx !== -1) break;
    }
    
    // Citizen ID lookup (fallback)
    const citizenIdx = headers.indexOf('เลขบัตรประชาชน') !== -1 ? headers.indexOf('เลขบัตรประชาชน') : headers.indexOf('citizenid');
    
    const targetId = String(payload.studentId || payload.id || '').trim().replace(/\.0$/, '');
    const data = payload.data || {};
    
    let rowIndex = -1;
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      const stId = String(row[idIdx] || '').trim().replace(/\.0$/, '');
      const ctId = String(row[citizenIdx] || '').trim().replace(/\.0$/, '');
      
      // 1. Direct match with Primary/Citizen ID
      if (stId === targetId || ctId === targetId || (targetId && stId.includes(targetId))) {
        rowIndex = i + 1;
        break;
      }
      
      // 2. Soft Search fallback: Check if the ID exists in ANY column for this row (case-insensitive)
      if (rowIndex === -1) {
        for (let cell of row) {
          if (String(cell).trim().replace(/\.0$/, '') === targetId) {
            rowIndex = i + 1;
            break;
          }
        }
      }
      if (rowIndex !== -1) break;
    }
    
    if (rowIndex === -1) {
      // Diagnostic Error Message
      const sampleIds = values.slice(1, 6).map(row => String(row[idIdx] || 'N/A')).join(', ');
      const diagnosticMsg = [
        'ไม่พบข้อมูลนักศึกษาในระบบ: ' + targetId,
        'Found Headers: ' + rawHeaders.join(' | '),
        'ID Column Index: ' + idIdx,
        'Sample IDs Found: ' + sampleIds
      ].join('\n');
      
      console.error('updateStudentDetail DIAGNOSTIC Fail:', diagnosticMsg);
      return createResponse({ status: 'error', message: diagnosticMsg });
    }
    
    // Update fields
    Object.keys(data).forEach(key => {
      let colIdx = rawHeaders.indexOf(key);
      // Mapping from camelCase keys to Thai Headers
      if (colIdx === -1) {
        const lowerKey = key.toLowerCase();
        if (lowerKey.includes('mainadvisor')) colIdx = rawHeaders.indexOf('อาจารย์ที่ปรึกษาหลัก');
        if (lowerKey.includes('cointernal')) colIdx = rawHeaders.indexOf('อาจารย์ที่ปรึกษาร่วมภายใน');
        if (lowerKey.includes('coexternal')) colIdx = rawHeaders.indexOf('อาจารย์ที่ปรึกษาร่วมภายนอก');
        if (lowerKey.includes('thesistopic')) colIdx = rawHeaders.indexOf('หัวข้อวิทยานิพนธ์');
        
        // Final fallback heuristics
        if (colIdx === -1) {
          if (key === 'advisor') colIdx = rawHeaders.indexOf('อาจารย์ที่ปรึกษา');
          if (key === 'thesisAdvisor') colIdx = rawHeaders.indexOf('อาจารย์ที่ปรึกษาวิทยานิพนธ์');
          if (key === 'workplace') colIdx = rawHeaders.indexOf('สถานที่ปฏิบัติงาน');
          if (key === 'position') colIdx = rawHeaders.indexOf('ตำแหน่ง');
          if (key === 'phone') colIdx = rawHeaders.indexOf('เบอร์โทร');
          if (key === 'personalEmail') colIdx = rawHeaders.indexOf('อีเมลส่วนตัว');
        }
      }
      
      if (colIdx !== -1) {
        sheet.getRange(rowIndex, colIdx + 1).setValue(data[key]);
      }
    });
    
    return createResponse({ status: 'success' });
  } catch (err) {
    console.error('updateStudentDetail Error:', err);
    return createResponse({ status: 'error', message: 'SERVER ERROR: ' + err.toString() });
  }
}

/**
 * Update or create a Thesis Progress record for a student
 */
function updateThesisMilestone(payload) {
  try {
    const sheet = SS.getSheetByName(SHEETS.THESIS_PROGRESS);
    if (!sheet) return createResponse({ status: 'error', message: 'ThesisProgress sheet not found' });

    const studentId = String(payload.studentId || '').trim();
    if (!studentId) return createResponse({ status: 'error', message: 'StudentID is required' });

    const data = sheet.getDataRange().getValues();
    const headers = data[0].map(h => String(h).trim());

    // Find existing row
    let rowIndex = -1;
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]).trim() === studentId) {
        rowIndex = i + 1; // 1-indexed for Sheets API
        break;
      }
    }

    // Build merged update object
    const updateObj = {
      StudentID: studentId,
      StudentName: payload.studentName || '',
      Major: payload.major || '',
      Cohort: payload.cohort || '',
      AdvisorName: payload.advisorName || '',
      LastUpdated: new Date().toISOString(),
      UpdatedBy: payload.updatedBy || 'Admin'
    };

    // Merge milestone data
    const milestones = payload.milestones || {};
    Object.keys(milestones).forEach(k => { updateObj[k] = milestones[k]; });

    if (rowIndex === -1) {
      // Create new row
      const newRow = headers.map(h => updateObj[h] !== undefined ? updateObj[h] : '');
      sheet.appendRow(newRow);
    } else {
      // Update existing row — only write fields that are present in payload
      headers.forEach((h, colIdx) => {
        if (updateObj[h] !== undefined) {
          sheet.getRange(rowIndex, colIdx + 1).setValue(updateObj[h]);
        }
      });
    }

    return createResponse({ status: 'success', studentId: studentId });
  } catch (err) {
    console.error('updateThesisMilestone Error:', err);
    return createResponse({ status: 'error', message: 'SERVER ERROR: ' + err.toString() });
  }
}

/**
 * Submit a graduation request
 */
function submitGraduationRequest(payload) {
  try {
    const sheet = SS.getSheetByName(SHEETS.GRADUATION_REQUESTS);
    if (!sheet) return createResponse({ status: 'error', message: 'GraduationRequests sheet not found' });
    
    // Check if pending request exists
    const data = sheet.getDataRange().getValues();
    if (data.length > 1) {
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][1]) === String(payload.studentId) && String(data[i][4]) !== 'Approved') {
          return createResponse({ status: 'error', message: 'คุณมีคำร้องที่กำลังรอตรวจสอบอยู่แล้ว' });
        }
      }
    }

    const newRequest = [
      payload.id,
      payload.studentId,
      payload.studentName,
      payload.requestDate,
      payload.status,
      payload.note || ''
    ];
    sheet.appendRow(newRequest);
    return createResponse({ status: 'success', data: payload });
  } catch (err) {
    return createResponse({ status: 'error', message: err.toString() });
  }
}

/**
 * Approve a graduation request
 */
function approveGraduationRequest(payload) {
  try {
    const sheet = SS.getSheetByName(SHEETS.GRADUATION_REQUESTS);
    if (!sheet) return createResponse({ status: 'error', message: 'GraduationRequests sheet not found' });
    
    let rowIndex = -1;
    let studentId = "";
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(payload.id)) {
        rowIndex = i + 1;
        studentId = String(data[i][1]);
        break;
      }
    }
    
    if (rowIndex === -1) return createResponse({ status: 'error', message: 'Request not found' });
    
    // Update request status to Approved (column 5)
    sheet.getRange(rowIndex, 5).setValue('Approved');
    
    // Auto-update student profile
    const studentSheet = SS.getSheetByName(SHEETS.STUDENTS);
    if (studentSheet && studentId) {
       const studentsData = studentSheet.getDataRange().getValues();
       const sHeaders = studentsData[0].map(h => String(h).trim());
       const idCol = sHeaders.indexOf('รหัสนักศึกษา');
       const statusCol = sHeaders.indexOf('สถานะ');
       
       if(idCol > -1 && statusCol > -1) {
         for(let i=1; i < studentsData.length; i++){
            if(String(studentsData[i][idCol]) === studentId) {
               studentSheet.getRange(i+1, statusCol+1).setValue('สำเร็จการศึกษา');
               // Optionally update workplace/year if headers exist, but normally handled in separate sheet or custom fields.
               break;
            }
         }
       }
    }
    
    return createResponse({ status: 'success' });
  } catch (err) {
    return createResponse({ status: 'error', message: err.toString() });
  }
}
