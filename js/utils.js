/* utils.js - Funções Utilitárias e Integração com Firebase (Auth e Firestore) */
import { auth, db } from './firebase-config.js';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { 
    collection, 
    addDoc, 
    getDocs, 
    doc, 
    updateDoc, 
    deleteDoc, 
    query, 
    where, 
    orderBy 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/* ==========================================================================
   Autenticação Firebase
   ========================================================================== */

export async function mockRegister(email, password, name) {
    if (!email || !password) {
        return { success: false, error: 'Email e senha são obrigatórios.' };
    }
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (name) {
            await updateProfile(userCredential.user, { displayName: name });
        }
        return { success: true, user: { id: userCredential.user.uid, email: userCredential.user.email, displayName: name } };
    } catch (error) {
        console.error("Erro completo do Firebase Auth:", error);
        let errorMsg = `Erro: ${error.message}`;
        if (error.code === 'auth/email-already-in-use') errorMsg = 'Este e-mail já está cadastrado.';
        if (error.code === 'auth/weak-password') errorMsg = 'A senha deve ter pelo menos 6 caracteres.';
        if (error.code === 'auth/operation-not-allowed') errorMsg = 'O login por E-mail e Senha não foi ativado no Firebase Console!';
        return { success: false, error: errorMsg };
    }
}

export async function mockLogin(email, password) {
    if (!email || !password) {
        return { success: false, error: 'Email e senha são obrigatórios.' };
    }
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { success: true, user: { id: userCredential.user.uid, email: userCredential.user.email } };
    } catch (error) {
        return { success: false, error: 'E-mail ou senha incorretos.' };
    }
}

export async function mockLogout() {
    try {
        await signOut(auth);
    } catch (error) {
        console.error('Erro ao sair:', error);
    }
}

// A função mockGetCurrentUser() não será mais usada da mesma forma (síncrona), 
// pois main.js usará onAuthStateChanged. Mas mantemos para compatibilidade parcial se necessário.
export function mockGetCurrentUser() {
    const user = auth.currentUser;
    return user ? { id: user.uid, email: user.email } : null;
}

/* ==========================================================================
   Banco de Dados Firestore (Tabela registros_treino)
   ========================================================================== */

const TRAININGS_COLLECTION = 'registros_treino';

export async function getTrainingsForUser(userId) {
    if (!userId) return [];
    try {
        const q = query(
            collection(db, TRAININGS_COLLECTION),
            where("user_id", "==", userId)
        );
        const querySnapshot = await getDocs(q);
        const trainings = [];
        querySnapshot.forEach((doc) => {
            trainings.push({ id: doc.id, ...doc.data() });
        });
        return trainings;
    } catch (error) {
        console.error("Erro ao buscar treinos:", error);
        return [];
    }
}

export async function saveTraining(userId, trainingData) {
    if (!userId) return { success: false, error: 'Usuário não autenticado.' };
    
    if (!trainingData.exercicio || !trainingData.peso || !trainingData.series || !trainingData.data) {
        return { success: false, error: 'Por favor, preencha todos os campos obrigatórios.' };
    }

    const peso = parseFloat(trainingData.peso);
    const series = parseInt(trainingData.series, 10);

    if (isNaN(peso) || peso <= 0) {
        return { success: false, error: 'O peso deve ser um número maior que zero.' };
    }

    if (isNaN(series) || series <= 0) {
        return { success: false, error: 'A quantidade de séries deve ser maior que zero.' };
    }

    const newRecord = {
        user_id: userId,
        data: trainingData.data, // formato YYYY-MM-DD
        exercicio: trainingData.exercicio.trim(),
        peso: peso,
        series: series,
        descricao_opcional: trainingData.descricao_opcional ? trainingData.descricao_opcional.trim() : '',
        created_at: new Date().toISOString()
    };

    try {
        if (trainingData.id) {
            // Edição
            const docRef = doc(db, TRAININGS_COLLECTION, trainingData.id);
            await updateDoc(docRef, newRecord);
            return { success: true, record: { id: trainingData.id, ...newRecord } };
        } else {
            // Novo
            const docRef = await addDoc(collection(db, TRAININGS_COLLECTION), newRecord);
            return { success: true, record: { id: docRef.id, ...newRecord } };
        }
    } catch (error) {
        console.error("Erro ao salvar treino:", error);
        return { success: false, error: `Erro do Firestore: ${error.message}` };
    }
}

export async function deleteTraining(userId, trainingId) {
    if (!userId) return { success: false, error: 'Usuário não autenticado.' };
    
    try {
        await deleteDoc(doc(db, TRAININGS_COLLECTION, trainingId));
        return { success: true };
    } catch (error) {
        console.error("Erro ao deletar treino:", error);
        return { success: false, error: 'Erro ao remover registro.' };
    }
}

// Essa função agora espera que a lista de treinos já tenha sido carregada no estado principal
export function getExercisesForUserSync(trainings) {
    const exercisesSet = new Set(trainings.map(t => t.exercicio));
    return Array.from(exercisesSet).sort();
}

/* ==========================================================================
   Formatadores & Sanitização
   ========================================================================== */

export function formatDate(dateString) {
    if (!dateString) return '';
    const parts = dateString.split('-');
    if (parts.length !== 3) return dateString;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

export function sanitize(text) {
    if (typeof text !== 'string') return '';
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
