/* ═══════════════════════════════════════════════
   KarateChamp Bengkulu — data.js
   Seed data & constants (extended with multi-cabang, bracket, results, payment)
═══════════════════════════════════════════════ */

'use strict';

const ADMIN_ACCOUNT = { username: 'admin', password: 'admin123' };

const MARTIAL_ARTS = [
  { key: 'Karate',     label: 'Karate',            icon: '🥋' },
  { key: 'Taekwondo',  label: 'Taekwondo',         icon: '🦵' },
  { key: 'Judo',       label: 'Judo',              icon: '🤼' },
  { key: 'BJJ',        label: 'Brazilian Jiu-jitsu',icon: '🤺' },
  { key: 'Kickboxing', label: 'Kickboxing',         icon: '🥊' },
  { key: 'Pencak Silat',label:'Pencak Silat',       icon: '🏆' },
];

const SEED_EVENTS = [
  { id:'evt-001', martialArt:'Karate', name:'Kejuaraan Karate Piala Gubernur Bengkulu 2025', category:'Kata & Kumite', status:'open', dateStart:'2025-08-15', dateEnd:'2025-08-17', deadline:'2025-08-01', fee:'Rp 150.000', location:'GOR Rafflesia, Kota Bengkulu', organizer:'FORKI Provinsi Bengkulu', desc:'Kejuaraan bergengsi memperebutkan Piala Gubernur Bengkulu yang mempertemukan atlet terbaik dari seluruh kabupaten/kota se-Provinsi Bengkulu. Event ini terbuka untuk semua kategori usia dan kelas.', published:true, createdAt:Date.now()-86400000*5, photo:null, kabupaten:'Kota Bengkulu' },
  { id:'evt-002', martialArt:'Karate', name:'Open Tournament FORKI Rejang Lebong 2025', category:'Kumite', status:'open', dateStart:'2025-09-06', dateEnd:'2025-09-07', deadline:'2025-08-25', fee:'Rp 125.000', location:'GOR Curup, Kabupaten Rejang Lebong', organizer:'FORKI Rejang Lebong', desc:'Turnamen kumite terbuka se-Provinsi Bengkulu, digelar di jantung kota Curup.', published:true, createdAt:Date.now()-86400000*3, photo:null, kabupaten:'Rejang Lebong' },
  { id:'evt-003', martialArt:'Karate', name:'Junior Cup Karate Bengkulu Selatan', category:'Junior', status:'soon', dateStart:'2025-10-11', dateEnd:'2025-10-12', deadline:'2025-09-28', fee:'Rp 85.000', location:'Aula Gor Manna, Bengkulu Selatan', organizer:'FORKI Bengkulu Selatan', desc:'Kompetisi khusus karateka muda usia 8–17 tahun dari seluruh Bengkulu Selatan.', published:true, createdAt:Date.now()-86400000*1, photo:null, kabupaten:'Bengkulu Selatan' },
  { id:'evt-004', martialArt:'Karate', name:'Selekda PON Karate Provinsi Bengkulu', category:'Kata & Kumite', status:'closed', dateStart:'2025-05-20', dateEnd:'2025-05-21', deadline:'2025-05-10', fee:'Rp 100.000', location:'Pusat Pelatihan Daerah Bengkulu', organizer:'FORKI Provinsi Bengkulu & KONI Bengkulu', desc:'Seleksi daerah untuk menentukan atlet karate Bengkulu yang akan bertarung di PON.', published:true, createdAt:Date.now()-86400000*20, photo:null, kabupaten:'Kota Bengkulu' },
  { id:'evt-005', martialArt:'Taekwondo', name:'Bengkulu Taekwondo Open Championship 2025', category:'Kyorugi & Poomsae', status:'open', dateStart:'2025-09-14', dateEnd:'2025-09-15', deadline:'2025-09-01', fee:'Rp 120.000', location:'GOR Sawah Lebar, Kota Bengkulu', organizer:'Pengprov Taekwondo Bengkulu', desc:'Kejuaraan taekwondo terbuka se-Provinsi Bengkulu. Kategori kyorugi (sparring) dan poomsae (jurus).', published:true, createdAt:Date.now()-86400000*2, photo:null, kabupaten:'Kota Bengkulu' },
  { id:'evt-006', martialArt:'Judo', name:'Judo Cup Provinsi Bengkulu 2025', category:'Open', status:'soon', dateStart:'2025-10-25', dateEnd:'2025-10-26', deadline:'2025-10-12', fee:'Rp 110.000', location:'GOR Arga Makmur, Bengkulu Utara', organizer:'Pengprov Judo Bengkulu', desc:'Turnamen judo terbuka pertama di Bengkulu Utara. Kategori senior dan junior putra/putri.', published:true, createdAt:Date.now()-86400000*4, photo:null, kabupaten:'Bengkulu Utara' },
  { id:'evt-007', martialArt:'Kickboxing', name:'Bengkulu Kickboxing Championship 2025', category:'Open', status:'open', dateStart:'2025-09-28', dateEnd:'2025-09-29', deadline:'2025-09-15', fee:'Rp 130.000', location:'Hall Olahraga Seluma', organizer:'Asosiasi Kickboxing Bengkulu', desc:'Turnamen kickboxing terbuka se-Bengkulu. Full-contact dan light-contact. Kategori berat badan penuh.', published:true, createdAt:Date.now()-86400000*1, photo:null, kabupaten:'Seluma' },
  { id:'evt-008', martialArt:'BJJ', name:'Bengkulu BJJ Open 2025', category:'Gi & No-Gi', status:'soon', dateStart:'2025-11-15', dateEnd:'2025-11-16', deadline:'2025-11-01', fee:'Rp 160.000', location:'GOR Kota Bengkulu', organizer:'IBJJF Bengkulu Chapter', desc:'Turnamen Brazilian Jiu-Jitsu pertama di Bengkulu! Kategori gi dan no-gi, semua sabuk/tingkat.', published:true, createdAt:Date.now()-86400000*1, photo:null, kabupaten:'Kota Bengkulu' },
];

const SEED_REGS = [
  { id:'reg-001', eventId:'evt-001', userId:'u-demo', name:'Ahmad Fauzi', email:'ahmad@mail.com', phone:'081234567890', dojo:'Dojo Rafflesia Bengkulu', category:'Kumite -67kg', belt:'Coklat', age:22, regency:'Kota Bengkulu', note:'', createdAt:Date.now()-86400000*3 },
  { id:'reg-002', eventId:'evt-001', userId:'u-demo', name:'Sari Dewi Lestari', email:'sari@mail.com', phone:'082345678901', dojo:'Dojo Putri Bengkulu', category:'Kata Perorangan', belt:'Hijau', age:18, regency:'Bengkulu Tengah', note:'', createdAt:Date.now()-86400000*2 },
  { id:'reg-003', eventId:'evt-002', userId:'u-demo', name:'Budi Santoso', email:'budi@mail.com', phone:'083456789012', dojo:'Dojo Curup Raya', category:'Kumite -75kg', belt:'Hitam', age:25, regency:'Rejang Lebong', note:'', createdAt:Date.now()-86400000*1 },
  { id:'reg-004', eventId:'evt-003', userId:'u-demo', name:'Citra Lestari', email:'citra@mail.com', phone:'084567890123', dojo:'Dojo Junior Manna', category:'Kata Perorangan', belt:'Kuning', age:13, regency:'Bengkulu Selatan', note:'', createdAt:Date.now()-3600000*5 },
  { id:'reg-005', eventId:'evt-001', userId:'u-demo', name:'Reza Maulana', email:'reza@mail.com', phone:'085678901234', dojo:'Dojo Mukomuko', category:'Kumite -60kg', belt:'Coklat', age:20, regency:'Mukomuko', note:'', createdAt:Date.now()-3600000*2 },
  { id:'reg-006', eventId:'evt-001', userId:'u-demo', name:'Dewi Safitri', email:'dewi@mail.com', phone:'086789012345', dojo:'Dojo Arga Raya', category:'Kata Beregu', belt:'Biru', age:17, regency:'Bengkulu Utara', note:'Bergabung sebagai tim', createdAt:Date.now()-3600000*8 },
  { id:'reg-007', eventId:'evt-005', userId:'u-demo', name:'Hendra Putra', email:'hendra@mail.com', phone:'087890123456', dojo:'Club TKD Bengkulu', category:'Kyorugi -68kg', belt:'Sabuk Merah', age:21, regency:'Kota Bengkulu', note:'', createdAt:Date.now()-3600000*3 },
  { id:'reg-008', eventId:'evt-007', userId:'u-demo', name:'Yusri Ananda', email:'yusri@mail.com', phone:'088901234567', dojo:'Kickboxing Seluma', category:'Light Contact -70kg', belt:'-', age:24, regency:'Seluma', note:'', createdAt:Date.now()-3600000*6 },
];

// Seed results for closed event
const SEED_RESULTS = [
  { id:'res-001', eventId:'evt-004', category:'Kata Perorangan Putra', gold:{ name:'Rizal Hidayat', dojo:'Dojo Kota Bengkulu' }, silver:{ name:'Bambang Setiawan', dojo:'Dojo Rejang Lebong' }, bronze1:{ name:'Fajar Nugroho', dojo:'Dojo Bengkulu Utara' }, bronze2:{ name:'Eko Prasetyo', dojo:'Dojo Kepahiang' }, published:true, createdAt:Date.now()-86400000*15 },
  { id:'res-002', eventId:'evt-004', category:'Kumite -75kg Putra', gold:{ name:'Dimas Raharjo', dojo:'Dojo Rejang Lebong' }, silver:{ name:'Teguh Santoso', dojo:'Dojo Bengkulu Selatan' }, bronze1:{ name:'Irwan Saputra', dojo:'Dojo Kota Bengkulu' }, bronze2:{ name:'Lukman Hakim', dojo:'Dojo Mukomuko' }, published:true, createdAt:Date.now()-86400000*15 },
  { id:'res-003', eventId:'evt-004', category:'Kata Perorangan Putri', gold:{ name:'Fitri Handayani', dojo:'Dojo Putri Bengkulu' }, silver:{ name:'Nanda Safitri', dojo:'Dojo Bengkulu Tengah' }, bronze1:{ name:'Rina Wulandari', dojo:'Dojo Kaur' }, bronze2:null, published:true, createdAt:Date.now()-86400000*15 },
];

// Seed payments
const SEED_PAYMENTS = [
  { id:'pay-001', regId:'reg-001', eventId:'evt-001', userId:'u-demo', amount:'Rp 150.000', status:'verified', buktiUrl:null, createdAt:Date.now()-86400000*3, verifiedAt:Date.now()-86400000*2 },
  { id:'pay-002', regId:'reg-002', eventId:'evt-001', userId:'u-demo', amount:'Rp 150.000', status:'pending', buktiUrl:null, createdAt:Date.now()-86400000*2, verifiedAt:null },
  { id:'pay-003', regId:'reg-003', eventId:'evt-002', userId:'u-demo', amount:'Rp 125.000', status:'pending', buktiUrl:null, createdAt:Date.now()-86400000*1, verifiedAt:null },
];

const CATS = ['all','Kata','Kumite','Kata & Kumite','Junior','Senior','Open'];
const STATS_MAP = { all:'Semua Status', open:'Dibuka', soon:'Segera', closed:'Ditutup' };

const KABUPATEN_BENGKULU = [
  'Semua Wilayah','Kota Bengkulu','Bengkulu Utara','Bengkulu Tengah',
  'Bengkulu Selatan','Rejang Lebong','Kepahiang','Lebong','Kaur','Seluma','Mukomuko'
];

const PAYMENT_BANK = {
  bank: 'BRI',
  account: '1234-5678-9012',
  name: 'FORKI Provinsi Bengkulu',
  note: 'Format transfer: NAMA_EVENT_NAMALENGKAP'
};
