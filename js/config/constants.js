'use strict';

/* ── ADMIN ─────────────────────────────────────────── */
const ADMIN_ACCOUNT = { username: 'admin', password: 'admin123' };

/* ── KARATE CATEGORIES ─────────────────────────────── */
const KAT_PUTRA = [
  'Kata Perorangan Putra','Kata Beregu Putra',
  'Kumite -55kg Putra','Kumite -60kg Putra','Kumite -67kg Putra',
  'Kumite -75kg Putra','Kumite -84kg Putra','Kumite +84kg Putra',
];
const KAT_PUTRI = [
  'Kata Perorangan Putri','Kata Beregu Putri',
  'Kumite -50kg Putri','Kumite -55kg Putri','Kumite -61kg Putri',
  'Kumite -68kg Putri','Kumite +68kg Putri',
];
const KAT_JUNIOR = [
  'Kata Perorangan Junior Putra','Kata Perorangan Junior Putri',
  'Kata Beregu Junior Putra','Kata Beregu Junior Putri',
  'Kumite -45kg Junior Putra','Kumite -55kg Junior Putra','Kumite -61kg Junior Putra',
  'Kumite -40kg Junior Putri','Kumite -47kg Junior Putri','Kumite -54kg Junior Putri',
];
const KAT_ALL = [...KAT_PUTRA, ...KAT_PUTRI, ...KAT_JUNIOR];

const KARATE_BELTS = [
  'Putih (9-Kyu)','Kuning (8-Kyu)','Kuning Strip Hijau (7-Kyu)',
  'Hijau (6-Kyu)','Hijau Strip Biru (5-Kyu)','Biru (4-Kyu)',
  'Biru Strip Coklat (3-Kyu)','Coklat (2-Kyu)','Coklat Strip Hitam (1-Kyu)',
  'Hitam (1-Dan)','Hitam (2-Dan)','Hitam (3-Dan)',
];

/* ── FILTERS ────────────────────────────────────────── */
const EVT_CATS = ['all','Kata','Kumite','Kata & Kumite','Junior','Open'];
const EVT_STATUS = { all:'Semua Status', open:'Dibuka', soon:'Segera', closed:'Ditutup' };
const KABUPATEN = [
  'Semua Wilayah','Kota Bengkulu','Bengkulu Utara','Bengkulu Tengah',
  'Bengkulu Selatan','Rejang Lebong','Kepahiang','Lebong','Kaur','Seluma','Mukomuko',
];

/* ── PAYMENT BANK ───────────────────────────────────── */
const PAYMENT_BANK = {
  bank:'BRI', account:'1234-5678-9012-3456',
  name:'FORKI Provinsi Bengkulu',
  hint:'Format: KODE_EVENT_NAMALENGKAP',
};

/* ── SEED: EVENTS ───────────────────────────────────── */
const SEED_EVENTS = [
  { id:'evt-001', name:'Kejuaraan Karate Piala Gubernur Bengkulu 2025',
    category:'Kata & Kumite', status:'open',
    dateStart:'2025-08-15', dateEnd:'2025-08-17', deadline:'2025-08-01',
    fee:'Rp 150.000', location:'GOR Rafflesia, Kota Bengkulu',
    organizer:'FORKI Provinsi Bengkulu',
    desc:'Kejuaraan bergengsi memperebutkan Piala Gubernur Bengkulu. Mempertemukan atlet terbaik dari seluruh kabupaten/kota se-Provinsi Bengkulu.',
    published:true, kabupaten:'Kota Bengkulu', photo:null,
    maxParticipants:120, registrationApproval:false,
    createdAt:Date.now()-86400000*5 },
  { id:'evt-002', name:'Open Tournament FORKI Rejang Lebong 2025',
    category:'Kumite', status:'open',
    dateStart:'2025-09-06', dateEnd:'2025-09-07', deadline:'2025-08-25',
    fee:'Rp 125.000', location:'GOR Curup, Kabupaten Rejang Lebong',
    organizer:'FORKI Rejang Lebong',
    desc:'Turnamen kumite terbuka se-Provinsi Bengkulu. Digelar di jantung kota Curup.',
    published:true, kabupaten:'Rejang Lebong', photo:null,
    maxParticipants:80, registrationApproval:false,
    createdAt:Date.now()-86400000*3 },
  { id:'evt-003', name:'Junior Cup Karate Bengkulu Selatan 2025',
    category:'Junior', status:'soon',
    dateStart:'2025-10-11', dateEnd:'2025-10-12', deadline:'2025-09-28',
    fee:'Rp 85.000', location:'Aula GOR Manna, Bengkulu Selatan',
    organizer:'FORKI Bengkulu Selatan',
    desc:'Kompetisi khusus karateka muda usia 8–17 tahun.',
    published:true, kabupaten:'Bengkulu Selatan', photo:null,
    maxParticipants:60, registrationApproval:true,
    createdAt:Date.now()-86400000*1 },
  { id:'evt-004', name:'Selekda PON Karate Provinsi Bengkulu 2025',
    category:'Kata & Kumite', status:'closed',
    dateStart:'2025-05-20', dateEnd:'2025-05-21', deadline:'2025-05-10',
    fee:'Rp 100.000', location:'Pusat Pelatihan Daerah Bengkulu',
    organizer:'FORKI Provinsi Bengkulu & KONI Bengkulu',
    desc:'Seleksi daerah untuk menentukan atlet karate Bengkulu yang akan bertarung di PON.',
    published:true, kabupaten:'Kota Bengkulu', photo:null,
    maxParticipants:50, registrationApproval:false,
    createdAt:Date.now()-86400000*20 },
  { id:'evt-005', name:'Bengkulu North Open Karate 2025',
    category:'Kata', status:'open',
    dateStart:'2025-09-20', dateEnd:'2025-09-21', deadline:'2025-09-10',
    fee:'Rp 110.000', location:'GOR Arga Makmur, Bengkulu Utara',
    organizer:'FORKI Bengkulu Utara',
    desc:'Turnamen kata bergengsi memperebutkan trofi bergilir Bupati Bengkulu Utara.',
    published:true, kabupaten:'Bengkulu Utara', photo:null,
    maxParticipants:64, registrationApproval:false,
    createdAt:Date.now()-86400000*4 },
];

/* ── SEED: REGISTRATIONS ────────────────────────────── */
const SEED_REGS = [
  { id:'reg-001', eventId:'evt-001', userId:'u-demo', name:'Ahmad Fauzi',       email:'ahmad@mail.com',  phone:'081234567890', dojo:'Dojo Rafflesia',        category:'Kumite -67kg Putra',       belt:'Coklat (2-Kyu)',  age:22, regency:'Kota Bengkulu',    note:'', status:'approved', createdAt:Date.now()-86400000*3 },
  { id:'reg-002', eventId:'evt-001', userId:'u-demo', name:'Sari Dewi Lestari', email:'sari@mail.com',   phone:'082345678901', dojo:'Dojo Putri Bengkulu',   category:'Kata Perorangan Putri',     belt:'Hijau (6-Kyu)',   age:18, regency:'Bengkulu Tengah', note:'', status:'approved', createdAt:Date.now()-86400000*2 },
  { id:'reg-003', eventId:'evt-001', userId:'u-demo', name:'Reza Maulana',      email:'reza@mail.com',   phone:'083456789012', dojo:'Dojo Mukomuko',          category:'Kumite -60kg Putra',       belt:'Coklat (2-Kyu)',  age:20, regency:'Mukomuko',        note:'', status:'approved', createdAt:Date.now()-86400000*1 },
  { id:'reg-004', eventId:'evt-001', userId:'u-demo', name:'Dewi Safitri',      email:'dewi@mail.com',   phone:'084567890123', dojo:'Dojo Arga Raya',         category:'Kumite -55kg Putri',       belt:'Biru (4-Kyu)',    age:17, regency:'Bengkulu Utara',  note:'', status:'approved', createdAt:Date.now()-3600000*8 },
  { id:'reg-005', eventId:'evt-001', userId:'u-demo', name:'Budi Santoso',      email:'budi@mail.com',   phone:'085678901234', dojo:'Dojo Curup Raya',        category:'Kumite -67kg Putra',       belt:'Hitam (1-Dan)',   age:25, regency:'Rejang Lebong',   note:'', status:'approved', createdAt:Date.now()-3600000*5 },
  { id:'reg-006', eventId:'evt-001', userId:'u-demo', name:'Rizal Hidayat',     email:'rizal@mail.com',  phone:'086789012345', dojo:'Dojo Kepahiang',         category:'Kumite -67kg Putra',       belt:'Coklat (2-Kyu)',  age:23, regency:'Kepahiang',       note:'', status:'approved', createdAt:Date.now()-3600000*3 },
  { id:'reg-007', eventId:'evt-002', userId:'u-demo', name:'Citra Lestari',     email:'citra@mail.com',  phone:'087890123456', dojo:'Dojo Junior Manna',      category:'Kata Perorangan Putri',     belt:'Kuning (8-Kyu)', age:13, regency:'Bengkulu Selatan', note:'', status:'approved', createdAt:Date.now()-3600000*5 },
  { id:'reg-008', eventId:'evt-003', userId:'u-demo', name:'Fajar Nugroho',     email:'fajar@mail.com',  phone:'088901234567', dojo:'Dojo Bengkulu Utara',    category:'Kata Perorangan Junior Putra', belt:'Hitam (2-Dan)', age:15, regency:'Bengkulu Utara', note:'', status:'pending',  createdAt:Date.now()-3600000*2 },
  { id:'reg-009', eventId:'evt-004', userId:'u-demo', name:'Teguh Wibowo',      email:'teguh@mail.com',  phone:'089012345678', dojo:'Dojo Seluma',            category:'Kumite -75kg Putra',       belt:'Hitam (1-Dan)',   age:27, regency:'Seluma',          note:'', status:'approved', createdAt:Date.now()-86400000*18 },
  { id:'reg-010', eventId:'evt-001', userId:'u-demo', name:'Nanda Safitri',     email:'nanda@mail.com',  phone:'081345678901', dojo:'Dojo Bengkulu Tengah',   category:'Kata Perorangan Putri',     belt:'Biru (4-Kyu)',   age:19, regency:'Bengkulu Tengah', note:'', status:'approved', createdAt:Date.now()-3600000*1 },
];

/* ── SEED: RESULTS ──────────────────────────────────── */
const SEED_RESULTS = [
  { id:'res-001', eventId:'evt-004', category:'Kata Perorangan Putra',
    gold:{name:'Rizal Hidayat',dojo:'Dojo Kota Bengkulu'},
    silver:{name:'Bambang Setiawan',dojo:'Dojo Rejang Lebong'},
    bronze1:{name:'Fajar Nugroho',dojo:'Dojo Bengkulu Utara'},
    bronze2:{name:'Eko Prasetyo',dojo:'Dojo Kepahiang'},
    published:true, createdAt:Date.now()-86400000*15 },
  { id:'res-002', eventId:'evt-004', category:'Kumite -67kg Putra',
    gold:{name:'Dimas Raharjo',dojo:'Dojo Rejang Lebong'},
    silver:{name:'Teguh Santoso',dojo:'Dojo Bengkulu Selatan'},
    bronze1:{name:'Irwan Saputra',dojo:'Dojo Kota Bengkulu'},
    bronze2:null,
    published:true, createdAt:Date.now()-86400000*15 },
  { id:'res-003', eventId:'evt-004', category:'Kata Perorangan Putri',
    gold:{name:'Fitri Handayani',dojo:'Dojo Putri Bengkulu'},
    silver:{name:'Nanda Safitri',dojo:'Dojo Bengkulu Tengah'},
    bronze1:{name:'Rina Wulandari',dojo:'Dojo Kaur'},
    bronze2:null,
    published:true, createdAt:Date.now()-86400000*15 },
];

/* ── SEED: PAYMENTS ─────────────────────────────────── */
const SEED_PAYMENTS = [
  { id:'pay-001', regId:'reg-001', eventId:'evt-001', userId:'u-demo', amount:'Rp 150.000', status:'verified', buktiUrl:null, createdAt:Date.now()-86400000*3, verifiedAt:Date.now()-86400000*2 },
  { id:'pay-002', regId:'reg-002', eventId:'evt-001', userId:'u-demo', amount:'Rp 150.000', status:'pending',  buktiUrl:null, createdAt:Date.now()-86400000*2, verifiedAt:null },
  { id:'pay-003', regId:'reg-003', eventId:'evt-002', userId:'u-demo', amount:'Rp 125.000', status:'pending',  buktiUrl:null, createdAt:Date.now()-86400000*1, verifiedAt:null },
];

/* ── SEED: ANNOUNCEMENTS ────────────────────────────── */
const SEED_ANNOUNCEMENTS = [
  { id:'ann-001', eventId:'evt-001', title:'Perubahan Lokasi Parkir',
    body:'Area parkir utama GOR dipindahkan ke Lapangan Belakang. Peserta diharapkan datang 30 menit lebih awal.',
    type:'warning', published:true, createdAt:Date.now()-86400000*2 },
  { id:'ann-002', eventId:'evt-001', title:'Technical Meeting',
    body:'Technical meeting wajib dihadiri oleh perwakilan setiap kontingen pada 14 Agustus 2025 pukul 19.00 WIB di Aula GOR Rafflesia.',
    type:'info', published:true, createdAt:Date.now()-86400000*3 },
  { id:'ann-003', eventId:'evt-004', title:'Hasil Lengkap Selekda PON',
    body:'Selamat kepada seluruh atlet yang lolos seleksi. Daftar lengkap dan jadwal pemusatan latihan akan diumumkan segera.',
    type:'success', published:true, createdAt:Date.now()-86400000*14 },
];

/* ── SEED: TATAMI ────────────────────────────────────── */
const SEED_TATAMI = [
  { id:'tat-001', eventId:'evt-001', date:'2025-08-15', tatami:1, timeStart:'08:00', timeEnd:'10:00', category:'Kumite -60kg Putra',          referee:'Drs. Bambang Waluyo', notes:'Babak penyisihan', createdAt:Date.now()-86400000*4 },
  { id:'tat-002', eventId:'evt-001', date:'2025-08-15', tatami:1, timeStart:'10:30', timeEnd:'12:00', category:'Kumite -67kg Putra',          referee:'Drs. Bambang Waluyo', notes:'Babak penyisihan', createdAt:Date.now()-86400000*4 },
  { id:'tat-003', eventId:'evt-001', date:'2025-08-15', tatami:1, timeStart:'13:00', timeEnd:'15:00', category:'Kumite -55kg Putri',          referee:'Drs. Bambang Waluyo', notes:'Babak penyisihan', createdAt:Date.now()-86400000*4 },
  { id:'tat-004', eventId:'evt-001', date:'2025-08-15', tatami:2, timeStart:'08:00', timeEnd:'10:30', category:'Kata Perorangan Putra',        referee:'Sri Handayani, S.Pd', notes:'Babak penyisihan', createdAt:Date.now()-86400000*4 },
  { id:'tat-005', eventId:'evt-001', date:'2025-08-15', tatami:2, timeStart:'11:00', timeEnd:'13:00', category:'Kata Perorangan Putri',        referee:'Sri Handayani, S.Pd', notes:'Babak penyisihan', createdAt:Date.now()-86400000*4 },
  { id:'tat-006', eventId:'evt-001', date:'2025-08-15', tatami:3, timeStart:'08:30', timeEnd:'11:00', category:'Kata Perorangan Junior Putra', referee:'Hendra Gunawan',      notes:'',                createdAt:Date.now()-86400000*4 },
  { id:'tat-007', eventId:'evt-001', date:'2025-08-15', tatami:3, timeStart:'11:30', timeEnd:'13:30', category:'Kata Perorangan Junior Putri', referee:'Hendra Gunawan',      notes:'',                createdAt:Date.now()-86400000*4 },
  { id:'tat-008', eventId:'evt-001', date:'2025-08-16', tatami:1, timeStart:'08:00', timeEnd:'09:30', category:'Kumite -60kg Putra',          referee:'Drs. Bambang Waluyo', notes:'Semifinal',        createdAt:Date.now()-86400000*4 },
  { id:'tat-009', eventId:'evt-001', date:'2025-08-16', tatami:1, timeStart:'10:00', timeEnd:'11:30', category:'Kumite -67kg Putra',          referee:'Drs. Bambang Waluyo', notes:'Semifinal',        createdAt:Date.now()-86400000*4 },
  { id:'tat-010', eventId:'evt-001', date:'2025-08-16', tatami:2, timeStart:'08:00', timeEnd:'09:30', category:'Kata Perorangan Putra',        referee:'Sri Handayani, S.Pd', notes:'Final',            createdAt:Date.now()-86400000*4 },
  { id:'tat-011', eventId:'evt-001', date:'2025-08-16', tatami:2, timeStart:'10:00', timeEnd:'11:00', category:'Kata Perorangan Putri',        referee:'Sri Handayani, S.Pd', notes:'Final',            createdAt:Date.now()-86400000*4 },
  { id:'tat-012', eventId:'evt-001', date:'2025-08-17', tatami:1, timeStart:'09:00', timeEnd:'10:00', category:'Kumite -67kg Putra',          referee:'Drs. Bambang Waluyo', notes:'FINAL',            createdAt:Date.now()-86400000*4 },
  { id:'tat-013', eventId:'evt-001', date:'2025-08-17', tatami:2, timeStart:'09:00', timeEnd:'10:00', category:'Kata Perorangan Putra',        referee:'Sri Handayani, S.Pd', notes:'FINAL',            createdAt:Date.now()-86400000*4 },
  { id:'tat-014', eventId:'evt-001', date:'2025-08-17', tatami:3, timeStart:'10:30', timeEnd:'12:00', category:'Kata Beregu Putra',            referee:'Hendra Gunawan',      notes:'FINAL',            createdAt:Date.now()-86400000*4 },
  { id:'tat-015', eventId:'evt-002', date:'2025-09-06', tatami:1, timeStart:'08:00', timeEnd:'12:00', category:'Kumite -75kg Putra',          referee:'Ahmad Rasyid, S.Pd',  notes:'Penyisihan & Semi',createdAt:Date.now()-86400000*2 },
  { id:'tat-016', eventId:'evt-002', date:'2025-09-06', tatami:2, timeStart:'08:00', timeEnd:'12:00', category:'Kumite -67kg Putra',          referee:'Rizky Pratama',       notes:'Penyisihan & Semi',createdAt:Date.now()-86400000*2 },
  { id:'tat-017', eventId:'evt-002', date:'2025-09-07', tatami:1, timeStart:'09:00', timeEnd:'11:00', category:'Kumite -75kg Putra',          referee:'Ahmad Rasyid, S.Pd',  notes:'Final',            createdAt:Date.now()-86400000*2 },
  { id:'tat-018', eventId:'evt-002', date:'2025-09-07', tatami:2, timeStart:'09:00', timeEnd:'11:00', category:'Kumite -67kg Putra',          referee:'Rizky Pratama',       notes:'Final',            createdAt:Date.now()-86400000*2 },
];

/* ── SEED: WEIGHINS (demo data for evt-001) ──────────── */
const SEED_WEIGHINS = [
  { id:'wi-001', evtId:'evt-001', regId:'reg-001', weight:66.2, limitKg:67, isOver:false, recordedAt:Date.now()-86400000 },
  { id:'wi-002', evtId:'evt-001', regId:'reg-003', weight:61.5, limitKg:60, isOver:true,  recordedAt:Date.now()-86400000 },
  { id:'wi-003', evtId:'evt-001', regId:'reg-005', weight:67.0, limitKg:67, isOver:false, recordedAt:Date.now()-3600000*6 },
  { id:'wi-004', evtId:'evt-001', regId:'reg-006', weight:66.8, limitKg:67, isOver:false, recordedAt:Date.now()-3600000*5 },
];
