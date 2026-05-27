/* main.js - Inicializador, Estado e Controladores por Página Física (MPA) */
import { auth } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { 
    mockLogin, 
    mockRegister, 
    mockLogout, 
    getTrainingsForUser, 
    getExercisesForUserSync, 
    saveTraining, 
    deleteTraining,
    formatDate
} from './utils.js';
import { 
    renderAuthView, 
    renderDashboardView, 
    renderTrainingFormView,
    renderHistoryView,
    renderTabBar,
    createHistoryCard
} from './views.js';

// Estado Global da Página
const state = {
    currentUser: null,
    selectedExercise: '',
    searchKeyword: '',
    trainings: [],
    chartInstance: null
};

// Promessa para carregamento assíncrono do Chart.js
let chartLoadedPromise = null;

function loadChartJS() {
    if (window.Chart) return Promise.resolve();
    if (chartLoadedPromise) return chartLoadedPromise;
    
    chartLoadedPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => {
            chartLoadedPromise = null;
            reject(new Error('Falha ao carregar o Chart.js.'));
        };
        document.head.appendChild(script);
    });
    return chartLoadedPromise;
}

/**
 * Inicialização principal do GymTrack.
 */
document.addEventListener('DOMContentLoaded', () => {
    const appContainer = document.getElementById('app-container');
    
    // Indicador de carregamento enquanto o Firebase verifica a sessão
    appContainer.innerHTML = '<div style="text-align:center; padding: 2rem; color: var(--text-muted);">Carregando...</div>';
    
    onAuthStateChanged(auth, async (user) => {
        appContainer.textContent = ''; // Limpeza anti-XSS segura
        
        if (user) {
            state.currentUser = { id: user.uid, email: user.email, displayName: user.displayName };
            await loadApp(appContainer);
        } else {
            state.currentUser = null;
            const authView = renderAuthView(false);
            setupAuthHandlers(authView);
            appContainer.appendChild(authView);
        }
    });
});

async function loadApp(appContainer) {
    const path = window.location.pathname;
    let activePage = 'dashboard';
    
    if (path.endsWith('treino.html')) {
        activePage = 'treino';
    } else if (path.endsWith('historico.html')) {
        activePage = 'historico';
    }
    
    // Carrega os dados do Firestore
    appContainer.innerHTML = '<div style="text-align:center; padding: 2rem; color: var(--text-muted);">Sincronizando treinos...</div>';
    state.trainings = await getTrainingsForUser(state.currentUser.id);
    const exercises = getExercisesForUserSync(state.trainings);
    
    appContainer.textContent = '';
    
    // Inicialização da Página Específica
    let pageView;
    
    if (activePage === 'dashboard') {
        if (!state.selectedExercise && exercises.length > 0) {
            state.selectedExercise = exercises[0];
        }
        pageView = renderDashboardView(state.currentUser, exercises, state.selectedExercise, state.trainings);
        setupDashboardHandlers(pageView);
        appContainer.appendChild(pageView);
        renderChart();
        
    } else if (activePage === 'treino') {
        const editId = new URLSearchParams(window.location.search).get('edit');
        const editRecord = editId ? state.trainings.find(t => t.id === editId) : null;
        
        pageView = renderTrainingFormView(exercises, editRecord);
        setupFormHandlers(pageView, editRecord);
        appContainer.appendChild(pageView);
        
    } else if (activePage === 'historico') {
        pageView = renderHistoryView(state.currentUser, exercises, state.selectedExercise, state.searchKeyword, state.trainings);
        setupHistoryHandlers(pageView);
        appContainer.appendChild(pageView);
    }
    
    // Injeta a Tab Bar
    if (pageView) {
        const tabBar = renderTabBar(activePage);
        appContainer.appendChild(tabBar);
    }
    
    // Handler do Logout Global
    const logoutBtn = document.getElementById('logout-action-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await mockLogout();
            // onAuthStateChanged irá recarregar a tela automaticamente
            if (activePage !== 'dashboard') {
                window.location.href = 'index.html';
            }
        });
    }
}

/* ==========================================================================
   Configuração de Handlers - Autenticação
   ========================================================================== */
function setupAuthHandlers(viewNode, initialMode = false) {
    let isRegisterMode = initialMode;
    
    const attachSubmitListener = () => {
        const form = viewNode.querySelector('#auth-form');
        const messageContainer = viewNode.querySelector('#auth-message');
        const submitBtn = viewNode.querySelector('#auth-submit-btn');
        
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = viewNode.querySelector('#auth-email').value.trim();
                const password = viewNode.querySelector('#auth-password').value;
                const nameInput = viewNode.querySelector('#auth-name');
                const name = nameInput ? nameInput.value.trim() : '';
                
                messageContainer.textContent = '';
                messageContainer.className = 'form-message';
                submitBtn.disabled = true;
                submitBtn.textContent = 'Aguarde...';
                
                let res;
                if (isRegisterMode) {
                    res = await mockRegister(email, password, name);
                } else {
                    res = await mockLogin(email, password);
                }
                
                if (res.success) {
                    messageContainer.textContent = isRegisterMode ? 'Cadastro concluído! Acessando...' : 'Acesso concedido! Redirecionando...';
                    messageContainer.classList.add('success');
                    // Não precisamos recarregar a página. onAuthStateChanged atuará, mas podemos forçar:
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                } else {
                    messageContainer.textContent = res.error;
                    messageContainer.classList.add('error');
                    submitBtn.disabled = false;
                    submitBtn.textContent = isRegisterMode ? 'Cadastrar' : 'Entrar';
                }
            });
        }
    };
    
    const switchMode = () => {
        const newMode = !isRegisterMode;
        
        const appContainer = document.getElementById('app-container');
        appContainer.textContent = '';
        
        const newAuthView = renderAuthView(newMode);
        setupAuthHandlers(newAuthView, newMode);
        appContainer.appendChild(newAuthView);
    };
    
    attachSubmitListener();
    
    const switchBtn = viewNode.querySelector('#auth-switch-btn');
    if (switchBtn) {
        switchBtn.addEventListener('click', switchMode);
    }
}

/* ==========================================================================
   Configuração de Handlers - Dashboard
   ========================================================================== */
function setupDashboardHandlers(viewNode) {
    const select = viewNode.querySelector('#exercise-select');
    
    if (select) {
        select.addEventListener('change', (e) => {
            state.selectedExercise = e.target.value;
            
            destroyChart();
            
            const appContainer = document.getElementById('app-container');
            appContainer.textContent = '';
            
            const exercises = getExercisesForUserSync(state.trainings);
            const newView = renderDashboardView(state.currentUser, exercises, state.selectedExercise, state.trainings);
            setupDashboardHandlers(newView);
            appContainer.appendChild(newView);
            
            const tabBar = renderTabBar('dashboard');
            appContainer.appendChild(tabBar);
            
            // Re-bind logout listener since header was recreated
            const logoutBtn = document.getElementById('logout-action-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', async () => {
                    await mockLogout();
                });
            }
            
            renderChart();
        });
    }
}

/* ==========================================================================
   Configuração de Handlers - Formulário de Treino
   ========================================================================== */
function setupFormHandlers(viewNode, editRecord = null) {
    const form = viewNode.querySelector('#training-form');
    const messageContainer = viewNode.querySelector('#form-message');
    const submitBtn = viewNode.querySelector('button[type="submit"]');
    
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const exercicio = viewNode.querySelector('#form-exercise').value;
            const data = viewNode.querySelector('#form-date').value;
            const peso = viewNode.querySelector('#form-weight').value;
            const series = viewNode.querySelector('#form-series').value;
            const descricao = viewNode.querySelector('#form-desc').value;
            
            messageContainer.textContent = '';
            messageContainer.className = 'form-message';
            submitBtn.disabled = true;
            submitBtn.textContent = 'Salvando...';
            
            const dataToSave = {
                exercicio,
                data,
                peso,
                series,
                descricao_opcional: descricao
            };
            
            if (editRecord) {
                dataToSave.id = editRecord.id;
            }
            
            const res = await saveTraining(state.currentUser.id, dataToSave);
            
            if (res.success) {
                messageContainer.textContent = editRecord ? 'Treino atualizado com sucesso!' : 'Treino registrado com sucesso!';
                messageContainer.classList.add('success');
                
                setTimeout(() => {
                    if (editRecord) {
                        window.location.href = 'historico.html';
                    } else {
                        state.selectedExercise = exercicio.trim();
                        window.location.href = 'index.html';
                    }
                }, 1000);
            } else {
                messageContainer.textContent = res.error;
                messageContainer.classList.add('error');
                submitBtn.disabled = false;
                submitBtn.textContent = editRecord ? 'Salvar Alterações' : 'Salvar Treino';
            }
        });
    }
}

/* ==========================================================================
   Configuração de Handlers - Histórico
   ========================================================================== */
function setupHistoryHandlers(viewNode) {
    const searchInput = viewNode.querySelector('#history-search-input');
    const filterSelect = viewNode.querySelector('#history-filter-select');
    
    const updateFilteredList = () => {
        const keyword = searchInput ? searchInput.value.toLowerCase().trim() : '';
        const selectedEx = filterSelect ? filterSelect.value : '';
        
        const listContainer = viewNode.querySelector('.history-list');
        const countBadge = viewNode.querySelector('.count-badge');
        
        if (!listContainer) return;
        
        let filtered = state.trainings;
        
        if (selectedEx) {
            filtered = filtered.filter(t => t.exercicio === selectedEx);
        }
        
        if (keyword) {
            filtered = filtered.filter(t => 
                t.exercicio.toLowerCase().includes(keyword) || 
                (t.descricao_opcional && t.descricao_opcional.toLowerCase().includes(keyword))
            );
        }
        
        filtered.sort((a, b) => new Date(b.data) - new Date(a.data));
        
        if (countBadge) {
            countBadge.textContent = `${filtered.length} registros`;
        }
        
        listContainer.textContent = '';
        
        if (filtered.length === 0) {
            const searchIcon = svgEl('M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z', 'empty-icon', '0 0 24 24', '1.5');
            const emptyText = document.createElement('p');
            emptyText.textContent = 'Nenhum registro encontrado correspondente aos filtros.';
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.appendChild(searchIcon);
            emptyState.appendChild(emptyText);
            listContainer.appendChild(emptyState);
        } else {
            filtered.forEach(t => {
                listContainer.appendChild(createHistoryCard(t, true));
            });
        }
    };
    
    if (searchInput) {
        searchInput.addEventListener('input', updateFilteredList);
    }
    
    if (filterSelect) {
        filterSelect.addEventListener('change', updateFilteredList);
    }
    
    const listContainer = viewNode.querySelector('.history-list');
    if (listContainer) {
        listContainer.addEventListener('click', async (e) => {
            const btnDelete = e.target.closest('.history-card-btn.delete');
            const btnEdit = e.target.closest('.history-card-btn.edit');
            
            if (btnDelete) {
                const id = btnDelete.dataset.id;
                if (confirm('Deseja realmente excluir este registro de treino?')) {
                    const res = await deleteTraining(state.currentUser.id, id);
                    if (res.success) {
                        state.trainings = state.trainings.filter(t => t.id !== id);
                        updateFilteredList();
                    } else {
                        alert(res.error || 'Erro ao excluir o treino.');
                    }
                }
            } else if (btnEdit) {
                const id = btnEdit.dataset.id;
                window.location.href = `treino.html?edit=${id}`;
            }
        });
    }
}

/* ==========================================================================
   Lógica do Gráfico (Chart.js)
   ========================================================================== */
function destroyChart() {
    if (state.chartInstance) {
        state.chartInstance.destroy();
        state.chartInstance = null;
    }
}

async function renderChart() {
    const canvas = document.getElementById('evolution-chart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    destroyChart();
    
    if (!state.selectedExercise) {
        drawChartMessage(ctx, canvas, 'Selecione ou adicione um exercício');
        return;
    }
    
    const exerciseTrainings = state.trainings.filter(t => t.exercicio === state.selectedExercise);
    
    if (exerciseTrainings.length === 0) {
        drawChartMessage(ctx, canvas, 'Sem registros para este exercício');
        return;
    }
    
    exerciseTrainings.sort((a, b) => new Date(a.data) - new Date(b.data));
    
    const labels = exerciseTrainings.map(t => formatDate(t.data).substring(0, 5));
    const dataPoints = exerciseTrainings.map(t => t.peso);
    
    try {
        await loadChartJS();
        
        const primaryGradient = ctx.createLinearGradient(0, 0, 0, canvas.height || 200);
        primaryGradient.addColorStop(0, 'rgba(83, 86, 255, 0.4)');
        primaryGradient.addColorStop(1, 'rgba(0, 242, 254, 0.0)');
        
        state.chartInstance = new window.Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Carga (kg)',
                    data: dataPoints,
                    borderColor: '#00f2fe',
                    borderWidth: 3,
                    backgroundColor: primaryGradient,
                    fill: true,
                    tension: 0.3,
                    pointBackgroundColor: '#5356ff',
                    pointBorderColor: '#00f2fe',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#131a26',
                        titleColor: '#f3f4f6',
                        titleFont: { family: 'Outfit', weight: 'bold' },
                        bodyColor: '#00f2fe',
                        bodyFont: { family: 'Outfit' },
                        borderColor: 'rgba(255, 255, 255, 0.08)',
                        borderWidth: 1,
                        padding: 10,
                        displayColors: false
                    }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(255, 255, 255, 0.03)', drawTicks: false },
                        ticks: { color: '#9ca3af', font: { family: 'Outfit', size: 11 } }
                    },
                    y: {
                        grid: { color: 'rgba(255, 255, 255, 0.05)', drawTicks: false },
                        ticks: {
                            color: '#9ca3af',
                            font: { family: 'Outfit', size: 11 },
                            callback: value => value + ' kg'
                        }
                    }
                }
            }
        });
    } catch (err) {
        console.error(err);
        drawChartMessage(ctx, canvas, 'Erro ao renderizar gráfico');
    }
}

function drawChartMessage(ctx, canvas, message) {
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#9ca3af';
    ctx.font = '14px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(message, width / 2, height / 2);
}

function svgEl(pathData, className = '', viewBox = '0 0 24 24', strokeWidth = '2') {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', viewBox);
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', strokeWidth);
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    if (className) {
        svg.setAttribute('class', className);
    }
    
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathData);
    svg.appendChild(path);
    
    return svg;
}
