// Pintu masuk serverless Vercel. Semua pengaturan ada di src/app.js, yang
// tidak memanggil .listen(), jadi file yang sama dipakai server lokal
// (src/server.js) dan Vercel.
export { app as default } from '../src/app.js';
