import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// ============================================================
// COLA AQUI A CONFIGURAÇÃO DO TEU PROJETO FIREBASE
// (Vais buscar isto em: Firebase Console > Definições do projeto > Geral > As tuas apps > SDK setup)
// ============================================================
const firebaseConfig = {
  apiKey: "AIzaSyDkWgzel-JJDRlGrNA4zOnDsBR0my8X1dQ",
  authDomain: "famsev-eec31.firebaseapp.com",
  projectId: "famsev-eec31",
  storageBucket: "famsev-eec31.firebasestorage.app",
  messagingSenderId: "330781149725",
  appId: "1:330781149725:web:b1d06b46e2871d726a94f4"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
