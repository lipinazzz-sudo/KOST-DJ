/* ============================================================
 * DJ FAMILY KOST — AI AGENT CORE V1
 * ============================================================
 * Peran V1:
 * - Menyimpan task/event dari 4 core: PAYMENT, REGISTRATION,
 *   MAINTENANCE, LAUNDRY.
 * - Master tetap menjadi pengambil keputusan.
 * - PAYMENT: approve/reject hanya setelah Master memilih.
 * - REGISTRATION: approval memakai adapter existing bila tersedia.
 * - MAINTENANCE/LAUNDRY: notification/info; WhatsApp eksternal
 *   tidak dikirim oleh AI.
 * - Tidak melakukan direct write ke business sheets.
 *
 * Penting:
 * - File ini adalah engine baru dan tidak menggantikan engine lama.
 * - Event hook dan router API dipasang terpisah setelah endpoint
 *   produksi diverifikasi.
 * ============================================================ */

const DJ_AI_AGENT_V1 = {
  VERSION: '1.0',
  SHEET: 'AI_Action',
  CORE: { PAYMENT:'PAYMENT', REGISTRATION:'REGISTRATION', MAINTENANCE:'MAINTENANCE', LAUNDRY:'LAUNDRY' },
  STATUS: { PENDING:'PENDING', SNOOZED:'SNOOZED', DONE:'DONE', INFO:'INFO', CANCELLED:'CANCELLED' },
  ACTION: {
    PAYMENT_APPROVE:'PAYMENT_APPROVE', PAYMENT_REJECT:'PAYMENT_REJECT',
    REGISTRATION_APPROVE:'REGISTRATION_APPROVE', REGISTRATION_REVISION:'REGISTRATION_REVISION',
    REGISTRATION_REJECT:'REGISTRATION_REJECT', SNOOZE:'SNOOZE', ACKNOWLEDGE:'ACKNOWLEDGE'
  },
  HEADERS: [
    'Action_ID','Core','Event_Type','Reference_ID','Tenant_ID','Room',
    'Tenant_Name','Title','Summary','Amount','Period','Proof_URL',
    'Status','Allowed_Actions','Created_At','Snooze_Until',
    'Handled_By','Handled_At','Decision','Notes','Last_Update'
  ]
};

/* ========================= SETUP ========================= */

function setupAIAgentCoreV1() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('Spreadsheet DJ Family Kost tidak ditemukan.');

  let sh = ss.getSheetByName(DJ_AI_AGENT_V1.SHEET);
  if (!sh) sh = ss.insertSheet(DJ_AI_AGENT_V1.SHEET);

  aiAgentEnsureHeadersV1_(sh);
  sh.setFrozenRows(1);

  return { ok:true, sheet:DJ_AI_AGENT_V1.SHEET, headers:aiAgentHeadersV1_(sh) };
}

/* ====================== EVENT CREATE ====================== */

function createAIActionV1(data) {
  data = data || {};
  const core = aiAgentCoreV1_(data.core);
  const ref = String(data.referenceId || '').trim();

  if (!core) throw new Error('AI Core tidak valid.');
  if (!ref) throw new Error('Reference_ID wajib diisi.');

  const sh = aiAgentSheetV1_();
  const lock = LockService.getDocumentLock();
  lock.waitLock(30000);

  try {
    const table = aiAgentTableV1_(sh);
    const duplicate = aiAgentFindActiveV1_(table, core, ref);
    if (duplicate) {
      return {ok:true, duplicate:true, actionId:duplicate.actionId, status:duplicate.status};
    }

    const now = new Date();
    const row = {
      Action_ID: aiAgentNextIdV1_(table),
      Core: core,
      Event_Type: String(data.eventType || '').trim(),
      Reference_ID: ref,
      Tenant_ID: String(data.tenantId || '').trim(),
      Room: String(data.room || '').trim(),
      Tenant_Name: String(data.tenantName || '').trim(),
      Title: String(data.title || 'AI Task').trim(),
      Summary: String(data.summary || '').trim(),
      Amount: aiAgentNumberV1_(data.amount),
      Period: String(data.period || '').trim(),
      Proof_URL: String(data.proofUrl || '').trim(),
      Status: String(data.status || aiAgentDefaultStatusV1_(core)).trim(),
      Allowed_Actions: aiAgentAllowedV1_(data.allowedActions),
      Created_At: now,
      Snooze_Until: '',
      Handled_By: '',
      Handled_At: '',
      Decision: '',
      Notes: String(data.notes || '').trim(),
      Last_Update: now
    };

    aiAgentAppendV1_(sh, row);
    SpreadsheetApp.flush();

    return {ok:true, duplicate:false, actionId:row.Action_ID, status:row.Status};
  } finally {
    lock.releaseLock();
  }
}

function createAIPaymentTaskV1(data) {
  data = data || {};
  return createAIActionV1({
    core:DJ_AI_AGENT_V1.CORE.PAYMENT, eventType:'PAYMENT_SUBMITTED',
    referenceId:data.paymentId, tenantId:data.tenantId, room:data.room,
    tenantName:data.tenantName, title:'Pembayaran Menunggu Persetujuan',
    summary:data.summary || 'Pembayaran baru menunggu keputusan Master.',
    amount:data.amount, period:data.period, proofUrl:data.proofUrl,
    allowedActions:[
      DJ_AI_AGENT_V1.ACTION.PAYMENT_APPROVE,
      DJ_AI_AGENT_V1.ACTION.PAYMENT_REJECT,
      DJ_AI_AGENT_V1.ACTION.SNOOZE
    ]
  });
}

function createAIRegistrationTaskV1(data) {
  data = data || {};
  return createAIActionV1({
    core:DJ_AI_AGENT_V1.CORE.REGISTRATION, eventType:'REGISTRATION_SUBMITTED',
    referenceId:data.registrationId, tenantId:data.tenantId, room:data.room,
    tenantName:data.tenantName, title:'Pendaftaran Baru',
    summary:data.summary || 'Pendaftaran baru menunggu keputusan Master.',
    allowedActions:[
      DJ_AI_AGENT_V1.ACTION.REGISTRATION_APPROVE,
      DJ_AI_AGENT_V1.ACTION.REGISTRATION_REVISION,
      DJ_AI_AGENT_V1.ACTION.REGISTRATION_REJECT,
      DJ_AI_AGENT_V1.ACTION.SNOOZE
    ]
  });
}

function createAIMaintenanceTaskV1(data) {
  data = data || {};
  return createAIActionV1({
    core:DJ_AI_AGENT_V1.CORE.MAINTENANCE, eventType:'MAINTENANCE_SUBMITTED',
    referenceId:data.maintenanceId, tenantId:data.tenantId, room:data.room,
    tenantName:data.tenantName, title:'Maintenance Baru',
    summary:data.summary || 'Laporan maintenance baru diterima.',
    allowedActions:[DJ_AI_AGENT_V1.ACTION.ACKNOWLEDGE],
    status:DJ_AI_AGENT_V1.STATUS.INFO
  });
}

function createAILaundryTaskV1(data) {
  data = data || {};
  return createAIActionV1({
    core:DJ_AI_AGENT_V1.CORE.LAUNDRY, eventType:'LAUNDRY_SUBMITTED',
    referenceId:data.laundryId, tenantId:data.tenantId, room:data.room,
    tenantName:data.tenantName, title:'Laundry Baru',
    summary:data.summary || 'Order laundry baru diterima.',
    allowedActions:[DJ_AI_AGENT_V1.ACTION.ACKNOWLEDGE],
    status:DJ_AI_AGENT_V1.STATUS.INFO
  });
}

/* ======================= MASTER INBOX ====================== */

function getAIMasterActionsV1(masterId) {
  const table = aiAgentTableV1_(aiAgentSheetV1_());
  const now = new Date();

  const items = table.rows.map(function(row, index) {
    return aiAgentObjectV1_(row, table.headers, index + 2);
  }).filter(function(item) {
    const status = String(item.Status || '').toUpperCase();
    if (!item.Action_ID || status === DJ_AI_AGENT_V1.STATUS.DONE || status === DJ_AI_AGENT_V1.STATUS.CANCELLED) return false;
    if (status === DJ_AI_AGENT_V1.STATUS.SNOOZED) {
      const d = aiAgentDateV1_(item.Snooze_Until);
      if (d && d.getTime() > now.getTime()) return false;
    }
    return true;
  }).map(function(item) {
    item.allowedActions = aiAgentParseAllowedV1_(item.Allowed_Actions);
    item.amount = aiAgentNumberV1_(item.Amount);
    item.createdAt = aiAgentIsoV1_(item.Created_At);
    item.snoozeUntil = aiAgentIsoV1_(item.Snooze_Until);
    return item;
  }).sort(function(a,b) {
    return (new Date(b.Created_At || 0)).getTime() - (new Date(a.Created_At || 0)).getTime();
  });

  return {ok:true, masterId:String(masterId || '').trim(), count:items.length, items:items};
}

/* ====================== MASTER ACTION ====================== */

function processAIMasterActionV1(actionId, command, masterId, options) {
  actionId = String(actionId || '').trim();
  command = String(command || '').trim().toUpperCase();
  masterId = String(masterId || '').trim();
  options = options || {};

  if (!actionId) throw new Error('Action_ID wajib diisi.');
  if (!masterId) throw new Error('Master_ID wajib diisi.');

  const sh = aiAgentSheetV1_();
  const lock = LockService.getDocumentLock();
  lock.waitLock(30000);

  try {
    const table = aiAgentTableV1_(sh);
    const found = aiAgentFindByIdV1_(table, actionId);
    if (!found) throw new Error('AI Action tidak ditemukan.');

    const item = found.item;
    const status = String(item.Status || '').toUpperCase();

    if (status === DJ_AI_AGENT_V1.STATUS.DONE || status === DJ_AI_AGENT_V1.STATUS.CANCELLED) {
      return {ok:true, alreadyHandled:true, actionId:actionId, status:status};
    }

    const allowed = aiAgentParseAllowedV1_(item.Allowed_Actions);
    if (command !== DJ_AI_AGENT_V1.ACTION.SNOOZE && allowed.indexOf(command) < 0) {
      throw new Error('Action tidak diizinkan untuk task ini.');
    }

    const now = new Date();
    let result;

    if (command === DJ_AI_AGENT_V1.ACTION.SNOOZE) {
      const until = aiAgentRequireDateV1_(options.snoozeUntil);
      aiAgentUpdateV1_(sh, found.rowNumber, table.headers, {
        Status:DJ_AI_AGENT_V1.STATUS.SNOOZED, Snooze_Until:until,
        Handled_By:masterId, Handled_At:now, Decision:command,
        Notes:String(options.note || 'Task ditunda oleh Master.').trim(), Last_Update:now
      });
      result = {ok:true,status:DJ_AI_AGENT_V1.STATUS.SNOOZED,snoozeUntil:aiAgentIsoV1_(until)};
    } else {
      result = aiAgentExecuteV1_(item, command, masterId, options);
      if (!result || result.ok !== true) throw new Error(result && result.message ? result.message : 'Aksi AI gagal.');
      aiAgentUpdateV1_(sh, found.rowNumber, table.headers, {
        Status:result.status || DJ_AI_AGENT_V1.STATUS.DONE,
        Handled_By:masterId, Handled_At:now, Decision:command,
        Notes:String(result.message || options.note || '').trim(), Last_Update:now
      });
      result.actionId = actionId;
    }

    SpreadsheetApp.flush();
    return result;
  } finally {
    lock.releaseLock();
  }
}

/* ========================= EXECUTOR ======================== */

function aiAgentExecuteV1(item, command, masterId, options) {
  options = options || {};

  if (item.Core === DJ_AI_AGENT_V1.CORE.PAYMENT) {
    if (command === DJ_AI_AGENT_V1.ACTION.PAYMENT_APPROVE) {
      return aiAgentPaymentV1_(item, 'approve', masterId, options);
    }
    if (command === DJ_AI_AGENT_V1.ACTION.PAYMENT_REJECT) {
      return aiAgentPaymentV1_(item, 'reject', masterId, options);
    }
  }

  if (item.Core === DJ_AI_AGENT_V1.CORE.REGISTRATION) {
    if (command === DJ_AI_AGENT_V1.ACTION.REGISTRATION_APPROVE) {
      return aiAgentRegistrationApproveV1_(item, masterId, options);
    }
    throw new Error(
      'Pendaftaran: adapter MINTA REVISI/TOLAK belum dihubungkan ke endpoint produksi. Tidak ada perubahan data dilakukan.'
    );
  }

  if (item.Core === DJ_AI_AGENT_V1.CORE.MAINTENANCE &&
      command === DJ_AI_AGENT_V1.ACTION.ACKNOWLEDGE) {
    return {ok:true,status:DJ_AI_AGENT_V1.STATUS.DONE,
      message:'Notifikasi maintenance diakui Master; data bisnis tetap dikelola engine existing.'};
  }

  if (item.Core === DJ_AI_AGENT_V1.CORE.LAUNDRY &&
      command === DJ_AI_AGENT_V1.ACTION.ACKNOWLEDGE) {
    return {ok:true,status:DJ_AI_AGENT_V1.STATUS.DONE,
      message:'Notifikasi laundry diakui Master; order tetap dikelola engine existing.'};
  }

  throw new Error('Tidak ada executor AI yang cocok.');
}

/* ========================= PAYMENT ========================= */

function aiAgentPaymentV1(item, decision, masterId, options) {
  const paymentId = String(item.Reference_ID || '').trim();
  if (!paymentId) throw new Error('Payment_ID pada AI Action kosong.');

  if (typeof djApiVerifyPaymentV5_ !== 'function') {
    throw new Error('djApiVerifyPaymentV5_ tidak tersedia di runtime.');
  }

  if (decision === 'reject' && !String(options.reason || '').trim()) {
    throw new Error('Alasan penolakan pembayaran wajib diisi.');
  }

  const reason = String(
    options.reason ||
    (decision === 'approve'
      ? 'Disetujui Master melalui AI Agent.'
      : '')
  ).trim();

  const result = djApiVerifyPaymentV5_(paymentId, decision, reason, masterId);

  if (!result || result.ok !== true) {
    throw new Error(result && result.error ? result.error : 'Proses pembayaran gagal.');
  }

  return {
    ok:true, status:DJ_AI_AGENT_V1.STATUS.DONE,
    message:'Pembayaran diproses melalui Payment Engine existing.', data:result
  };
}

/* ======================= REGISTRATION ====================== */

function aiAgentRegistrationApproveV1(item, masterId, options) {
  const id = String(item.Reference_ID || '').trim();
  const room = String(options.finalRoom || item.Room || '').trim();

  if (!id) throw new Error('Pendaftaran_ID pada AI Action kosong.');
  if (!room) throw new Error('Kamar final wajib ditentukan.');

  if (typeof djApiMasterApproveRegistrationV6_ !== 'function') {
    throw new Error(
      'Adapter approval registration belum tersedia di runtime. Tidak ada perubahan data dilakukan.'
    );
  }

  const result = djApiMasterApproveRegistrationV6_(id, room, masterId);

  if (!result || result.ok === false) {
    throw new Error(result && result.error ? result.error : 'Approval pendaftaran gagal.');
  }

  return {
    ok:true, status:DJ_AI_AGENT_V1.STATUS.DONE,
    message:'Pendaftaran diproses melalui adapter approval existing.', data:result
  };
}

/* ========================= DAILY BRIEF ===================== */

function getAIDailyBriefV1() {
  const inbox = getAIMasterActionsV1('');
  const count = {payment:0,registration:0,maintenance:0,laundry:0,total:inbox.items.length};

  inbox.items.forEach(function(item) {
    const core = String(item.Core || '').toUpperCase();
    if (core === 'PAYMENT') count.payment++;
    else if (core === 'REGISTRATION') count.registration++;
    else if (core === 'MAINTENANCE') count.maintenance++;
    else if (core === 'LAUNDRY') count.laundry++;
  });

  return {ok:true,generatedAt:new Date(),count:count,items:inbox.items};
}

/* ========================== HELPERS ======================== */

function aiAgentSheetV1_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('Spreadsheet DJ Family Kost tidak ditemukan.');
  let sh = ss.getSheetByName(DJ_AI_AGENT_V1.SHEET);
  if (!sh) { setupAIAgentCoreV1(); sh = ss.getSheetByName(DJ_AI_AGENT_V1.SHEET); }
  if (!sh) throw new Error('Sheet AI_Action tidak dapat dibuat.');
  aiAgentEnsureHeadersV1_(sh);
  return sh;
}

function aiAgentEnsureHeadersV1_(sh) {
  const last = Math.max(sh.getLastColumn(), 1);
  const current = sh.getRange(1,1,1,last).getValues()[0].map(function(v){return String(v || '').trim();});
  if (current.every(function(v){return !v;})) {
    sh.getRange(1,1,1,DJ_AI_AGENT_V1.HEADERS.length).setValues([DJ_AI_AGENT_V1.HEADERS]);
    return;
  }
  DJ_AI_AGENT_V1.HEADERS.forEach(function(h) {
    if (current.indexOf(h) >= 0) return;
    sh.getRange(1,sh.getLastColumn()+1).setValue(h);
    current.push(h);
  });
}

function aiAgentHeadersV1_(sh) {
  return sh.getRange(1,1,1,Math.max(sh.getLastColumn(),1)).getValues()[0]
    .map(function(v){return String(v || '').trim();});
}

function aiAgentTableV1_(sh) {
  const headers = aiAgentHeadersV1_(sh);
  if (sh.getLastRow() < 2) return {headerRow:1,headers:headers,rows:[]};
  return {
    headerRow:1, headers:headers,
    rows:sh.getRange(2,1,sh.getLastRow()-1,headers.length).getValues()
  };
}

function aiAgentObjectV1_(row, headers, rowNumber) {
  const o={};
  headers.forEach(function(h,i){if(h)o[h]=row[i];});
  o._rowNumber = Number(rowNumber || 0);
  return o;
}

function aiAgentAppendV1_(sh, row) {
  const headers = aiAgentHeadersV1_(sh);
  sh.getRange(sh.getLastRow()+1,1,1,headers.length).setValues([
    headers.map(function(h){return Object.prototype.hasOwnProperty.call(row,h) ? row[h] : '';})
  ]);
}

function aiAgentUpdateV1_(sh, rowNumber, headers, changes) {
  const row=sh.getRange(rowNumber,1,1,headers.length).getValues()[0];
  headers.forEach(function(h,i){
    if(Object.prototype.hasOwnProperty.call(changes,h)) row[i]=changes[h];
  });
  sh.getRange(rowNumber,1,1,headers.length).setValues([row]);
}

function aiAgentFindByIdV1_(table, id) {
  for(let i=0;i<table.rows.length;i++){
    const item=aiAgentObjectV1_(table.rows[i],table.headers,i+2);
    if(String(item.Action_ID || '').trim()===id){
      return {rowNumber:i+2,item:item};
    }
  }
  return null;
}

function aiAgentFindActiveV1_(table, core, ref) {
  for(let i=0;i<table.rows.length;i++){
    const item=aiAgentObjectV1_(table.rows[i],table.headers,i+2);
    const status=String(item.Status || '').trim().toUpperCase();
    if(aiAgentCoreV1_(item.Core)!==core) continue;
    if(String(item.Reference_ID || '').trim()!==ref) continue;
    if(status!==DJ_AI_AGENT_V1.STATUS.DONE && status!==DJ_AI_AGENT_V1.STATUS.CANCELLED){
      return {rowNumber:i+2,actionId:String(item.Action_ID || '').trim(),status:status};
    }
  }
  return null;
}

function aiAgentNextIdV1_(table) {
  let max=0;
  table.rows.forEach(function(row){
    const id=String(row[table.headers.indexOf('Action_ID')] || '').trim().toUpperCase();
    const m=id.match(/^AI-(\d+)$/);
    if(m) max=Math.max(max,Number(m[1]));
  });
  return 'AI-'+String(max+1).padStart(4,'0');
}

function aiAgentCoreV1_(value) {
  const v=String(value || '').trim().toUpperCase();
  return ['PAYMENT','REGISTRATION','MAINTENANCE','LAUNDRY'].indexOf(v)>=0 ? v : '';
}

function aiAgentDefaultStatusV1_(core) {
  return (core==='MAINTENANCE'||core==='LAUNDRY')
    ? DJ_AI_AGENT_V1.STATUS.INFO
    : DJ_AI_AGENT_V1.STATUS.PENDING;
}

function aiAgentAllowedV1_(value) {
  const a=Array.isArray(value) ? value : String(value || '').split(',');
  return a.map(function(v){return String(v || '').trim().toUpperCase();})
    .filter(function(v,i,x){return v && x.indexOf(v)===i;}).join('|');
}

function aiAgentParseAllowedV1_(value) {
  return String(value || '').split('|').map(function(v){return v.trim().toUpperCase();})
    .filter(function(v){return !!v;});
}

function aiAgentNumberV1_(value) {
  if(value===''||value===null||value===undefined) return '';
  const n=Number(value);
  return isFinite(n) ? n : '';
}

function aiAgentDateV1_(value) {
  if(value instanceof Date && !isNaN(value.getTime())) return new Date(value.getTime());
  if(!value) return null;
  const d=new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

function aiAgentIsoV1_(value) {
  const d=aiAgentDateV1_(value);
  return d ? d.toISOString() : '';
}

function aiAgentRequireDateV1_(value) {
  const d=aiAgentDateV1_(value);
  if(!d) throw new Error('Waktu pengingat tidak valid.');
  return d;
}


/* ============================================================
 * BUSINESS SYNC V1.1
 * ============================================================
 * READ ONLY terhadap business sheets.
 * SATU-SATUNYA sheet yang ditulis oleh sync adalah AI_Action.
 *
 * Sumber:
 * - Pembayaran
 * - Pendaftaran
 * - Maintenance
 * - Laundry
 *
 * Prinsip:
 * - tidak mengubah transaksi bisnis
 * - tidak membuat approval logic baru
 * - tidak mengirim WhatsApp
 * - tidak membuat task aktif duplikat
 * - task hanya selesai otomatis jika source sudah terminal
 * ============================================================
 */

function runAIAgentSyncV1() {

  setupAIAgentCoreV1();

  const result = {
    ok: true,
    startedAt: new Date(),
    created: 0,
    existing: 0,
    reconciled: 0,
    byCore: {
      PAYMENT: 0,
      REGISTRATION: 0,
      MAINTENANCE: 0,
      LAUNDRY: 0
    },
    errors: []
  };

  const states = {
    PAYMENT: {},
    REGISTRATION: {},
    MAINTENANCE: {},
    LAUNDRY: {}
  };

  const scanners = [
    ['PAYMENT', aiAgentScanPaymentsV1_],
    ['REGISTRATION', aiAgentScanRegistrationsV1_],
    ['MAINTENANCE', aiAgentScanMaintenanceV1_],
    ['LAUNDRY', aiAgentScanLaundryV1_]
  ];

  scanners.forEach(function(pair) {

    const core = pair[0];
    const scanner = pair[1];

    try {
      const scan = scanner();
      states[core] = scan.terminalRefs || {};

      result.byCore[core] = Number(scan.activeCount || 0);
      result.created += Number(scan.created || 0);
      result.existing += Number(scan.existing || 0);
    } catch (error) {
      result.ok = false;
      result.errors.push(
        core + ': ' +
        String(
          error && error.message
            ? error.message
            : error
        )
      );
    }

  });

  try {
    result.reconciled =
      aiAgentReconcileV1_(states);
  } catch (error) {
    result.ok = false;
    result.errors.push(
      'RECONCILE: ' +
      String(
        error && error.message
          ? error.message
          : error
      )
    );
  }

  result.finishedAt = new Date();

  Logger.log(
    JSON.stringify(
      result,
      null,
      2
    )
  );

  return result;
}


/* ============================================================
 * SCANNER HELPERS
 * ============================================================
 */

function aiAgentScanPaymentsV1_() {

  const table =
    aiAgentReadBusinessTableV1_(
      'Pembayaran',
      [
        'Pembayaran_ID',
        'Payment_ID',
        'Tenant_ID'
      ]
    );

  if (!table) {
    return {
      activeCount: 0,
      created: 0,
      existing: 0,
      terminalRefs: {}
    };
  }

  const aiTable =
    aiAgentTableV1_(
      aiAgentSheetV1_()
    );

  const terminalRefs = {};

  let created = 0;
  let existing = 0;
  let activeCount = 0;

  table.rows.forEach(function(row) {

    const paymentId =
      aiAgentStringFieldV1_(
        row,
        table.headers,
        [
          'Payment_ID',
          'Pembayaran_ID'
        ]
      );

    if (!paymentId) {
      return;
    }

    const verification =
      aiAgentUpperFieldV1_(
        row,
        table.headers,
        [
          'Status_Verifikasi'
        ]
      );

    if (
      verification === 'TERVERIFIKASI' ||
      verification === 'VERIFIED' ||
      verification === 'DISETUJUI' ||
      verification === 'APPROVED'
    ) {
      terminalRefs[paymentId] = verification;
      return;
    }

    if (
      verification === 'DITOLAK' ||
      verification === 'REJECTED'
    ) {
      terminalRefs[paymentId] = verification;
      return;
    }

    const amount =
      aiAgentNumberFieldV1_(
        row,
        table.headers,
        [
          'Nominal_Dibayar'
        ]
      );

    const proofUrl =
      aiAgentStringFieldV1_(
        row,
        table.headers,
        [
          'Bukti_Pembayaran_URL',
          'Bukti_URL'
        ]
      );

    /*
     * Generated billing rows biasanya amount=0 dan
     * tidak memiliki bukti. Jangan dibuat sebagai task.
     */
    if (
      amount <= 0 &&
      !proofUrl
    ) {
      return;
    }

    activeCount++;

    if (
      aiAgentFindAnyV1_(
        aiTable,
        DJ_AI_AGENT_V1.CORE.PAYMENT,
        paymentId
      )
    ) {
      existing++;
      return;
    }

    const tenantId =
      aiAgentStringFieldV1_(
        row,
        table.headers,
        [
          'Tenant_ID'
        ]
      );

    const room =
      aiAgentStringFieldV1_(
        row,
        table.headers,
        [
          'No_Kamar',
          'Room'
        ]
      );

    const tenantName =
      aiAgentStringFieldV1_(
        row,
        table.headers,
        [
          'Nama_Tenant',
          'Nama_Lengkap'
        ]
      );

    const period =
      aiAgentStringFieldV1_(
        row,
        table.headers,
        [
          'Periode_Pembayaran',
          'Periode'
        ]
      );

    const total =
      aiAgentNumberFieldV1_(
        row,
        table.headers,
        [
          'Total_Tagihan'
        ]
      );

    const result =
      createAIPaymentTaskV1({
        paymentId: paymentId,
        tenantId: tenantId,
        room: room,
        tenantName: tenantName,
        amount: amount,
        period: period,
        proofUrl: proofUrl,
        summary:
          'Pembayaran ' +
          paymentId +
          ' menunggu keputusan Master. ' +
          'Verifikasi saat ini: ' +
          (verification || 'BELUM DIVERIFIKASI') +
          '. Total tagihan: Rp' +
          total.toLocaleString('id-ID') +
          '.'
      });

    if (result && result.duplicate) {
      existing++;
    } else {
      created++;
    }

  });

  return {
    activeCount: activeCount,
    created: created,
    existing: existing,
    terminalRefs: terminalRefs
  };
}


function aiAgentScanRegistrationsV1_() {

  const table =
    aiAgentReadBusinessTableV1_(
      'Pendaftaran',
      [
        'Pendaftaran_ID',
        'Status_Pendaftaran'
      ]
    );

  if (!table) {
    return {
      activeCount: 0,
      created: 0,
      existing: 0,
      terminalRefs: {}
    };
  }

  const aiTable =
    aiAgentTableV1_(
      aiAgentSheetV1_()
    );

  const terminalRefs = {};

  let created = 0;
  let existing = 0;
  let activeCount = 0;

  table.rows.forEach(function(row) {

    const registrationId =
      aiAgentStringFieldV1_(
        row,
        table.headers,
        [
          'Pendaftaran_ID'
        ]
      );

    if (!registrationId) {
      return;
    }

    const status =
      aiAgentUpperFieldV1_(
        row,
        table.headers,
        [
          'Status_Pendaftaran'
        ]
      );

    const terminal =
      [
        'DITOLAK',
        'REJECTED',
        'DISETUJUI',
        'APPROVED',
        'MENUNGGU AKTIVASI AKUN'
      ];

    if (
      terminal.indexOf(status) >= 0
    ) {
      terminalRefs[registrationId] = status;
      return;
    }

    activeCount++;

    if (
      aiAgentFindAnyV1_(
        aiTable,
        DJ_AI_AGENT_V1.CORE.REGISTRATION,
        registrationId
      )
    ) {
      existing++;
      return;
    }

    const tenantId =
      aiAgentStringFieldV1_(
        row,
        table.headers,
        [
          'Tenant_ID'
        ]
      );

    const room =
      aiAgentStringFieldV1_(
        row,
        table.headers,
        [
          'No_Kamar'
        ]
      );

    const name =
      aiAgentStringFieldV1_(
        row,
        table.headers,
        [
          'Nama_Lengkap',
          'Nama_Tenant'
        ]
      );

    const phone =
      aiAgentStringFieldV1_(
        row,
        table.headers,
        [
          'No_HP'
        ]
      );

    const summaryParts = [];

    if (name) {
      summaryParts.push(
        'Nama: ' + name
      );
    }

    if (room) {
      summaryParts.push(
        'Kamar: ' + room
      );
    }

    if (phone) {
      summaryParts.push(
        'WA: ' + phone
      );
    }

    const result =
      createAIRegistrationTaskV1({
        registrationId: registrationId,
        tenantId: tenantId,
        room: room,
        tenantName: name,
        summary:
          summaryParts.join(' · ') ||
          'Pendaftaran baru menunggu keputusan Master.'
      });

    if (result && result.duplicate) {
      existing++;
    } else {
      created++;
    }

  });

  return {
    activeCount: activeCount,
    created: created,
    existing: existing,
    terminalRefs: terminalRefs
  };
}


function aiAgentScanMaintenanceV1_() {

  const table =
    aiAgentReadBusinessTableV1_(
      'Maintenance',
      [
        'Maintenance_ID',
        'Status'
      ]
    );

  if (!table) {
    return {
      activeCount: 0,
      created: 0,
      existing: 0,
      terminalRefs: {}
    };
  }

  const aiTable =
    aiAgentTableV1_(
      aiAgentSheetV1_()
    );

  const terminalRefs = {};

  let created = 0;
  let existing = 0;
  let activeCount = 0;

  table.rows.forEach(function(row) {

    const id =
      aiAgentStringFieldV1_(
        row,
        table.headers,
        [
          'Maintenance_ID'
        ]
      );

    if (!id) {
      return;
    }

    const status =
      aiAgentUpperFieldV1_(
        row,
        table.headers,
        [
          'Status'
        ]
      );

    if (
      status === 'SELESAI' ||
      status === 'COMPLETED' ||
      status === 'BATAL' ||
      status === 'CANCELLED'
    ) {
      terminalRefs[id] = status;
      return;
    }

    /*
     * Hanya status operasional yang terisi yang dianggap aktif.
     */
    if (!status) {
      return;
    }

    activeCount++;

    if (
      aiAgentFindAnyV1_(
        aiTable,
        DJ_AI_AGENT_V1.CORE.MAINTENANCE,
        id
      )
    ) {
      existing++;
      return;
    }

    const tenantId =
      aiAgentStringFieldV1_(
        row,
        table.headers,
        [
          'Tenant_ID'
        ]
      );

    const room =
      aiAgentStringFieldV1_(
        row,
        table.headers,
        [
          'No_Kamar'
        ]
      );

    const name =
      aiAgentStringFieldV1_(
        row,
        table.headers,
        [
          'Nama_Tenant',
          'Nama_Lengkap'
        ]
      );

    const issueType =
      aiAgentStringFieldV1_(
        row,
        table.headers,
        [
          'Jenis_Masalah'
        ]
      );

    const description =
      aiAgentStringFieldV1_(
        row,
        table.headers,
        [
          'Deskripsi'
        ]
      );

    const urgency =
      aiAgentStringFieldV1_(
        row,
        table.headers,
        [
          'Urgensi'
        ]
      );

    const summary =
      [
        issueType
          ? 'Masalah: ' + issueType
          : '',
        description
          ? 'Detail: ' + description
          : '',
        urgency
          ? 'Urgensi: ' + urgency
          : ''
      ]
      .filter(Boolean)
      .join(' · ') ||
      'Laporan maintenance baru diterima.';

    const result =
      createAIMaintenanceTaskV1({
        maintenanceId: id,
        tenantId: tenantId,
        room: room,
        tenantName: name,
        summary: summary
      });

    if (result && result.duplicate) {
      existing++;
    } else {
      created++;
    }

  });

  return {
    activeCount: activeCount,
    created: created,
    existing: existing,
    terminalRefs: terminalRefs
  };
}


function aiAgentScanLaundryV1_() {

  const table =
    aiAgentReadBusinessTableV1_(
      'Laundry',
      [
        'Laundry_ID',
        'Status'
      ]
    );

  if (!table) {
    return {
      activeCount: 0,
      created: 0,
      existing: 0,
      terminalRefs: {}
    };
  }

  const aiTable =
    aiAgentTableV1_(
      aiAgentSheetV1_()
    );

  const terminalRefs = {};

  let created = 0;
  let existing = 0;
  let activeCount = 0;

  table.rows.forEach(function(row) {

    const id =
      aiAgentStringFieldV1_(
        row,
        table.headers,
        [
          'Laundry_ID'
        ]
      );

    if (!id) {
      return;
    }

    const status =
      aiAgentUpperFieldV1_(
        row,
        table.headers,
        [
          'Status'
        ]
      );

    if (
      status === 'SELESAI' ||
      status === 'COMPLETED' ||
      status === 'BATAL' ||
      status === 'CANCELLED'
    ) {
      terminalRefs[id] = status;
      return;
    }

    if (!status) {
      return;
    }

    activeCount++;

    if (
      aiAgentFindAnyV1_(
        aiTable,
        DJ_AI_AGENT_V1.CORE.LAUNDRY,
        id
      )
    ) {
      existing++;
      return;
    }

    const tenantId =
      aiAgentStringFieldV1_(
        row,
        table.headers,
        [
          'Tenant_ID'
        ]
      );

    const room =
      aiAgentStringFieldV1_(
        row,
        table.headers,
        [
          'No_Kamar'
        ]
      );

    const name =
      aiAgentStringFieldV1_(
        row,
        table.headers,
        [
          'Nama_Tenant',
          'Nama_Lengkap'
        ]
      );

    const service =
      aiAgentStringFieldV1_(
        row,
        table.headers,
        [
          'Layanan',
          'Service'
        ]
      );

    const pickupLocation =
      aiAgentStringFieldV1_(
        row,
        table.headers,
        [
          'Lokasi_Pickup',
          'Pickup_Location'
        ]
      );

    const note =
      aiAgentStringFieldV1_(
        row,
        table.headers,
        [
          'Catatan',
          'Note'
        ]
      );

    const result =
      createAILaundryTaskV1({
        laundryId: id,
        tenantId: tenantId,
        room: room,
        tenantName: name,
        summary:
          [
            service
              ? 'Layanan: ' + service
              : '',
            pickupLocation
              ? 'Pickup: ' + pickupLocation
              : '',
            note
              ? 'Catatan: ' + note
              : ''
          ]
          .filter(Boolean)
          .join(' · ') ||
          'Order laundry baru diterima.'
      });

    if (result && result.duplicate) {
      existing++;
    } else {
      created++;
    }

  });

  return {
    activeCount: activeCount,
    created: created,
    existing: existing,
    terminalRefs: terminalRefs
  };
}


/* ============================================================
 * RECONCILIATION
 * ============================================================
 */

function aiAgentReconcileV1_(states) {

  states = states || {};

  const sh = aiAgentSheetV1_();

  const table =
    aiAgentTableV1_(sh);

  const lock =
    LockService.getDocumentLock();

  lock.waitLock(30000);

  let reconciled = 0;

  try {

    table.rows.forEach(function(row, index) {

      const item =
        aiAgentObjectV1_(
          row,
          table.headers,
          index + 2
        );

      const core =
        aiAgentCoreV1_(
          item.Core
        );

      if (!core) {
        return;
      }

      const ref =
        String(
          item.Reference_ID || ''
        ).trim();

      if (!ref) {
        return;
      }

      const status =
        String(
          item.Status || ''
        )
        .trim()
        .toUpperCase();

      if (
        status === DJ_AI_AGENT_V1.STATUS.DONE ||
        status === DJ_AI_AGENT_V1.STATUS.CANCELLED
      ) {
        return;
      }

      const terminalMap =
        states[core] || {};

      if (
        !Object.prototype.hasOwnProperty.call(
          terminalMap,
          ref
        )
      ) {
        return;
      }

      const sourceStatus =
        String(
          terminalMap[ref] || 'TERMINAL'
        );

      aiAgentUpdateV1_(
        sh,
        index + 2,
        table.headers,
        {
          Status: DJ_AI_AGENT_V1.STATUS.DONE,
          Handled_By: 'SYSTEM_SYNC_V1',
          Handled_At: new Date(),
          Decision: 'AUTO_RECONCILE',
          Notes:
            'Source ' +
            core +
            ' sudah terminal: ' +
            sourceStatus,
          Last_Update: new Date()
        }
      );

      reconciled++;

    });

    SpreadsheetApp.flush();

  } finally {
    lock.releaseLock();
  }

  return reconciled;
}


/* ============================================================
 * BUSINESS TABLE READER
 * ============================================================
 */

function aiAgentReadBusinessTableV1_(
  sheetName,
  requiredHeaders
) {

  const ss =
    SpreadsheetApp.getActiveSpreadsheet();

  if (!ss) {
    throw new Error(
      'Spreadsheet DJ Family Kost tidak ditemukan.'
    );
  }

  const sh =
    ss.getSheetByName(
      sheetName
    );

  if (!sh) {
    return null;
  }

  const maxColumns =
    Math.max(
      sh.getLastColumn(),
      1
    );

  const rowsToProbe =
    Math.min(
      Math.max(
        sh.getLastRow(),
        1
      ),
      10
    );

  if (rowsToProbe < 1) {
    return null;
  }

  const probe =
    sh
      .getRange(
        1,
        1,
        rowsToProbe,
        maxColumns
      )
      .getValues();

  let headerRowNumber =
    -1;

  let headers =
    [];

  for (
    let i = 0;
    i < probe.length;
    i++
  ) {

    const rowHeaders =
      probe[i].map(function(value) {
        return String(
          value || ''
        ).trim();
      });

    const hitCount =
      requiredHeaders.filter(function(required) {
        return rowHeaders.indexOf(required) >= 0;
      }).length;

    if (
      hitCount >=
      Math.min(
        requiredHeaders.length,
        1
      )
    ) {
      headerRowNumber = i + 1;
      headers = rowHeaders;
      break;
    }

  }

  if (
    headerRowNumber < 0
  ) {
    return null;
  }

  if (
    sh.getLastRow() <=
    headerRowNumber
  ) {
    return {
      headerRow: headerRowNumber,
      headers: headers,
      rows: []
    };
  }

  return {
    headerRow: headerRowNumber,
    headers: headers,
    rows:
      sh.getRange(
        headerRowNumber + 1,
        1,
        sh.getLastRow() - headerRowNumber,
        headers.length
      ).getValues()
  };
}


function aiAgentStringFieldV1_(
  row,
  headers,
  aliases
) {

  const value =
    aiAgentValueFieldV1_(
      row,
      headers,
      aliases
    );

  return String(
    value == null
      ? ''
      : value
  ).trim();
}


function aiAgentUpperFieldV1_(
  row,
  headers,
  aliases
) {

  return aiAgentStringFieldV1_(
    row,
    headers,
    aliases
  )
  .toUpperCase();
}


function aiAgentNumberFieldV1_(
  row,
  headers,
  aliases
) {

  const value =
    aiAgentValueFieldV1_(
      row,
      headers,
      aliases
    );

  return aiAgentNumberV1_(
    value
  ) || 0;
}


function aiAgentValueFieldV1_(
  row,
  headers,
  aliases
) {

  aliases =
    Array.isArray(
      aliases
    )
      ? aliases
      : [];

  for (
    let i = 0;
    i < aliases.length;
    i++
  ) {

    const index =
      headers.indexOf(
        aliases[i]
      );

    if (
      index >= 0
    ) {
      return row[index];
    }

  }

  return '';
}


/* ============================================================
 * FIND EXISTING TASK — INCLUDING RESOLVED
 * ============================================================
 */

function aiAgentFindAnyV1_(
  table,
  core,
  ref
) {

  if (!table) {
    return null;
  }

  for (
    let i = 0;
    i < table.rows.length;
    i++
  ) {

    const item =
      aiAgentObjectV1_(
        table.rows[i],
        table.headers,
        i + 2
      );

    if (
      aiAgentCoreV1_(
        item.Core
      ) !==
      core
    ) {
      continue;
    }

    if (
      String(
        item.Reference_ID || ''
      ).trim() !==
      String(
        ref || ''
      ).trim()
    ) {
      continue;
    }

    return {
      rowNumber: i + 2,
      actionId:
        String(
          item.Action_ID || ''
        ).trim(),
      status:
        String(
          item.Status || ''
        ).trim()
    };

  }

  return null;
}
