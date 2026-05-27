/* views.js - Construção Dinâmica de Views (DOM Programático sem innerHTML) */
import { formatDate } from './utils.js';

/**
 * Helper para criar elementos com propriedades de forma mais concisa.
 */
function el(tag, attributes = {}, ...children) {
    const element = document.createElement(tag);
    for (const [key, value] of Object.entries(attributes)) {
        if (key === 'className') {
            element.className = value;
        } else if (key === 'dataset') {
            for (const [dKey, dValue] of Object.entries(value)) {
                element.dataset[dKey] = dValue;
            }
        } else if (key.startsWith('on') && typeof value === 'function') {
            element.addEventListener(key.substring(2).toLowerCase(), value);
        } else {
            element.setAttribute(key, value);
        }
    }
    for (const child of children) {
        if (typeof child === 'string') {
            element.appendChild(document.createTextNode(child));
        } else if (child instanceof HTMLElement) {
            element.appendChild(child);
        }
    }
    return element;
}

/**
 * Cria um SVG de forma dinâmica para evitar innerHTML.
 */
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

/* ==========================================================================
   Componente: Tab Bar Navegação Inferior Comum
   ========================================================================== */
export function renderTabBar(activePageName) {
    const dashboardIcon = svgEl('M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z');
    const workoutIcon = svgEl('M12 4v16m8-8H4');
    const historyIcon = svgEl('M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z');
    
    const tabDashboard = el('a', { 
        className: `tab-btn${activePageName === 'dashboard' ? ' active' : ''}`, 
        href: 'index.html' 
    }, dashboardIcon, 'Dashboard');
    
    const tabWorkout = el('a', { 
        className: `tab-btn${activePageName === 'treino' ? ' active' : ''}`, 
        href: 'treino.html' 
    }, workoutIcon, 'Treinar');
    
    const tabHistory = el('a', { 
        className: `tab-btn${activePageName === 'historico' ? ' active' : ''}`, 
        href: 'historico.html' 
    }, historyIcon, 'Histórico');
    
    const nav = el('nav', { className: 'tab-bar' }, tabDashboard, tabWorkout, tabHistory);
    return nav;
}

/**
 * Cria a barra de cabeçalho padrão com o botão de Logout.
 */
function renderHeaderBar() {
    const logoIcon = svgEl('M13 10V3L4 14h7v7l9-11h-7z');
    const logoText = el('div', { className: 'header-logo' }, logoIcon, 'GymTrack');
    
    const logoutIcon = svgEl('M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1');
    const logoutButton = el('button', {
        className: 'logout-btn',
        id: 'logout-action-btn',
        title: 'Sair',
        style: 'display: flex; align-items: center; gap: 6px; width: auto; padding: 0 10px;'
    }, logoutIcon, el('span', {style: 'font-size: 14px; font-weight: 500; font-family: Outfit;'}, 'Sair'));
    
    return el('header', { className: 'header-bar' }, logoText, logoutButton);
}

/* ==========================================================================
   Componente: Card de Histórico Individual (Mantendo o DRY)
   ========================================================================== */
export function createHistoryCard(t, showExerciseName = true) {
    // Carga
    const wLabel = el('span', { className: 'detail-label' }, 'Carga');
    const wValue = el('span', { className: 'detail-value' }, `${t.peso} kg`);
    const wDetail = el('div', { className: 'detail-item' }, wLabel, wValue);
    
    // Séries
    const sLabel = el('span', { className: 'detail-label' }, 'Séries');
    const sValue = el('span', { className: 'detail-value' }, `${t.series}`);
    const sDetail = el('div', { className: 'detail-item' }, sLabel, sValue);
    
    const detailsRow = el('div', { className: 'history-card-details' }, wDetail, sDetail);
    
    // Data
    const cardDate = el('div', { className: 'history-card-date' }, formatDate(t.data));
    
    // Ações (Editar / Excluir)
    const deleteIcon = svgEl('M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16');
    const deleteBtn = el('button', {
        className: 'history-card-btn delete',
        dataset: { id: t.id },
        title: 'Excluir registro',
        style: 'display: flex; align-items: center; gap: 4px;'
    }, deleteIcon, el('span', {style: 'font-size: 12px; font-family: Outfit;'}, 'Excluir'));
    
    const editIcon = svgEl('M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z');
    const editBtn = el('button', {
        className: 'history-card-btn edit',
        dataset: { id: t.id },
        title: 'Editar registro'
    }, editIcon);
    
    const actions = el('div', { className: 'history-card-actions' }, editBtn, deleteBtn);
    const cardHeader = el('div', { className: 'history-card-header' }, cardDate, actions);
    
    if (showExerciseName) {
        const cardTitleText = el('div', { className: 'history-card-exercise' }, t.exercicio);
        cardHeader.insertBefore(cardTitleText, actions);
    }
    
    const historyCard = el('div', {
        className: 'history-card',
        dataset: { id: t.id }
    }, cardHeader, detailsRow);
    
    if (t.descricao_opcional) {
        const desc = el('div', { className: 'history-card-description' }, t.descricao_opcional);
        historyCard.appendChild(desc);
    }
    
    return historyCard;
}

/* ==========================================================================
   View: Autenticação (Login / Cadastro)
   ========================================================================== */
export function renderAuthView(isRegisterMode = false) {
    const view = el('div', { className: 'view' });
    
    // Header
    const rayIcon = svgEl(
        'M13 10V3L4 14h7v7l9-11h-7z',
        'auth-logo-svg'
    );
    const logo = el('div', { className: 'auth-logo' }, rayIcon, el('span', {}, 'GymTrack'));
    const tagline = el('p', {}, 'Acompanhamento de Evolução de Carga');
    const header = el('header', { className: 'auth-header' }, logo, tagline);
    
    // Card
    const title = el('h2', {}, isRegisterMode ? 'Criar Nova Conta' : 'Acessar Conta');
    
    // Formulário
    let nameGroup = null;
    if (isRegisterMode) {
        const nameLabel = el('label', { className: 'form-label', for: 'auth-name' }, 'Nome ', el('span', {}, '*'));
        const nameInput = el('input', {
            className: 'form-input',
            id: 'auth-name',
            type: 'text',
            required: 'true',
            placeholder: 'Como quer ser chamado?',
            autocomplete: 'name'
        });
        nameGroup = el('div', { className: 'form-group' }, nameLabel, nameInput);
    }
    
    const emailLabel = el('label', { className: 'form-label', for: 'auth-email' }, 'E-mail ', el('span', {}, '*'));
    const emailInput = el('input', {
        className: 'form-input',
        id: 'auth-email',
        type: 'email',
        required: 'true',
        placeholder: 'seu@email.com',
        autocomplete: 'email'
    });
    const emailGroup = el('div', { className: 'form-group' }, emailLabel, emailInput);
    
    const passwordLabel = el('label', { className: 'form-label', for: 'auth-password' }, 'Senha ', el('span', {}, '*'));
    const passwordInput = el('input', {
        className: 'form-input',
        id: 'auth-password',
        type: 'password',
        required: 'true',
        placeholder: '••••••••',
        autocomplete: 'current-password'
    });
    const passwordGroup = el('div', { className: 'form-group' }, passwordLabel, passwordInput);
    
    const submitBtn = el('button', {
        className: 'btn btn-primary',
        type: 'submit',
        id: 'auth-submit-btn'
    }, isRegisterMode ? 'Cadastrar' : 'Entrar');
    
    const messageContainer = el('div', { className: 'form-message', id: 'auth-message' });
    
    const formFields = [];
    if (nameGroup) formFields.push(nameGroup);
    formFields.push(emailGroup, passwordGroup, submitBtn, messageContainer);
    
    const form = el('form', { id: 'auth-form' }, ...formFields);
    
    // Switch Mode
    const switchLabel = el('span', {}, isRegisterMode ? 'Já possui uma conta?' : 'Ainda não tem conta?');
    const switchLink = el('button', {
        className: 'auth-switch-link',
        id: 'auth-switch-btn',
        type: 'button'
    }, isRegisterMode ? 'Fazer Login' : 'Cadastre-se');
    
    const switchContainer = el('div', { className: 'auth-switch-text' }, switchLabel, switchLink);
    
    const card = el('div', { className: 'auth-card' }, title, form, switchContainer);
    const container = el('div', { className: 'auth-container' }, header, card);
    
    view.appendChild(container);
    return view;
}

/* ==========================================================================
   View: Dashboard (Painel Principal - Foco em Gráficos)
   ========================================================================== */
export function renderDashboardView(user, exercises = [], selectedExercise = '', trainings = []) {
    const view = el('div', { className: 'view' });
    
    // 1. Header Bar
    view.appendChild(renderHeaderBar());
    
    // 2. Boas Vindas
    const welcomeTitle = el('h1', {}, 'Seu Progresso');
    const displayName = user.displayName || user.email.split('@')[0];
    const capitalizedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
    const welcomeSub = el('p', {}, `Foco nos treinos, ${capitalizedName}!`);
    const welcomeSec = el('section', { className: 'welcome-section' }, welcomeTitle, welcomeSub);
    view.appendChild(welcomeSec);
    
    // 3. Seletor de Exercício
    const selectLabel = el('label', { className: 'form-label', for: 'exercise-select' }, 'Selecionar Exercício para Gráfico');
    const select = el('select', { className: 'form-select', id: 'exercise-select' });
    
    if (exercises.length === 0) {
        const option = el('option', { value: '' }, 'Nenhum exercício cadastrado');
        select.appendChild(option);
    } else {
        const placeholderOpt = el('option', { value: '' }, '-- Selecione um Exercício --');
        select.appendChild(placeholderOpt);
        
        exercises.forEach(ex => {
            const attrs = { value: ex };
            if (ex === selectedExercise) {
                attrs.selected = 'selected';
            }
            select.appendChild(el('option', attrs, ex));
        });
    }
    
    const selectorCard = el('section', { className: 'selector-card' }, selectLabel, select);
    view.appendChild(selectorCard);
    
    // 4. Card do Gráfico
    const chartTitle = el('span', { className: 'chart-card-title' }, selectedExercise || 'Evolução de Carga');
    const chartHeader = el('div', { className: 'chart-card-header' }, chartTitle);
    
    const canvas = el('canvas', { id: 'evolution-chart' });
    const chartContainer = el('div', { className: 'chart-container' }, canvas);
    
    const chartCard = el('section', { className: 'chart-card' }, chartHeader, chartContainer);
    view.appendChild(chartCard);
    
    // 5. Cards de Resumo Rápido (Se houver exercício selecionado com registros)
    const exerciseTrainings = selectedExercise 
        ? trainings.filter(t => t.exercicio === selectedExercise) 
        : [];
        
    if (selectedExercise && exerciseTrainings.length > 0) {
        // Obter métricas
        const weights = exerciseTrainings.map(t => t.peso);
        const maxWeight = Math.max(...weights);
        const totalSeries = exerciseTrainings.reduce((acc, t) => acc + t.series, 0);
        
        // Ordenar por data para obter o último registro
        const sortedTrainings = [...exerciseTrainings].sort((a, b) => new Date(b.data) - new Date(a.data));
        const lastRecord = sortedTrainings[0];
        
        const summaryTitle = el('h3', { 
            style: 'font-size: var(--font-md); font-weight: var(--weight-bold); margin: var(--space-md) 0 var(--space-xs); color: var(--text-main);' 
        }, 'Estatísticas Recentes');
        
        // Card Carga Máxima (PR)
        const prLabel = el('span', { className: 'detail-label' }, 'Recorde Pessoal (PR)');
        const prValue = el('span', { className: 'detail-value', style: 'color: var(--color-secondary);' }, `${maxWeight} kg`);
        const prCard = el('div', { className: 'history-card', style: 'flex: 1; border-left-color: var(--color-secondary); padding: var(--space-sm);' }, prLabel, prValue);
        
        // Card Volume Total
        const volLabel = el('span', { className: 'detail-label' }, 'Séries Acumuladas');
        const volValue = el('span', { className: 'detail-value', style: 'color: var(--color-primary);' }, `${totalSeries}`);
        const volCard = el('div', { className: 'history-card', style: 'flex: 1; border-left-color: var(--color-primary); padding: var(--space-sm);' }, volLabel, volValue);
        
        // Card Último Registro
        const lastLabel = el('span', { className: 'detail-label' }, 'Último Registro');
        const lastValue = el('span', { className: 'detail-value', style: 'color: var(--color-accent);' }, formatDate(lastRecord.data));
        const lastCard = el('div', { className: 'history-card', style: 'flex: 1; border-left-color: var(--color-accent); padding: var(--space-sm);' }, lastLabel, lastValue);
        
        const statsGrid = el('div', { 
            style: 'display: flex; gap: var(--space-xs); width: 100%; margin-bottom: var(--space-md);' 
        }, prCard, volCard, lastCard);
        
        view.appendChild(summaryTitle);
        view.appendChild(statsGrid);
    } else if (exercises.length === 0) {
        // Incentivo para novo registro
        const textIncentive = el('p', { style: 'text-align: center; font-size: var(--font-sm); color: var(--text-muted); padding: var(--space-lg) var(--space-md);' }, 
            'Ainda não há dados cadastrados. Vá na aba "Treinar" para adicionar sua primeira série!'
        );
        const linkIncentive = el('a', { 
            className: 'btn btn-primary', 
            href: 'treino.html',
            style: 'max-width: 200px; margin: 0 auto;' 
        }, 'Começar Treino');
        
        const incentiveCard = el('div', { 
            className: 'empty-state', 
            style: 'margin-bottom: var(--space-md);' 
        }, textIncentive, linkIncentive);
        
        view.appendChild(incentiveCard);
    }
    
    return view;
}

/* ==========================================================================
   View: Formulário de Registro / Edição de Treino (Página treino.html)
   ========================================================================== */
export function renderTrainingFormView(existingExercises = [], editRecord = null) {
    const view = el('div', { className: 'view' });
    
    const isEdit = !!editRecord;
    
    // Header Bar
    view.appendChild(renderHeaderBar());
    
    // Conteúdo do formulário
    const formTitle = el('h2', { className: 'form-title' }, isEdit ? 'Editar Registro de Carga' : 'Registrar Novo Treino');
    
    // Campo: Exercício (com Autocomplete)
    const exerciseLabel = el('label', { className: 'form-label', for: 'form-exercise' }, 'Nome do Exercício ', el('span', {}, '*'));
    const exerciseInput = el('input', {
        className: 'form-input',
        id: 'form-exercise',
        type: 'text',
        required: 'true',
        placeholder: 'Ex: Supino Reto',
        autocomplete: 'off',
        value: isEdit ? editRecord.exercicio : ''
    });
    const autocompleteList = el('div', { className: 'autocomplete-list hidden', id: 'exercise-autocomplete' });
    const exerciseGroup = el('div', { className: 'form-group' }, exerciseLabel, exerciseInput, autocompleteList);
    
    // Lógica de autocomplete
    exerciseInput.addEventListener('input', (e) => {
        const value = e.target.value.toLowerCase().trim();
        autocompleteList.textContent = '';
        
        if (!value) {
            autocompleteList.classList.add('hidden');
            return;
        }
        
        const filtered = existingExercises.filter(ex => ex.toLowerCase().includes(value));
        
        if (filtered.length === 0) {
            autocompleteList.classList.add('hidden');
            return;
        }
        
        filtered.forEach(ex => {
            const item = el('div', { 
                className: 'autocomplete-item',
                onMouseDown: () => {
                    exerciseInput.value = ex;
                    autocompleteList.classList.add('hidden');
                }
            }, ex);
            autocompleteList.appendChild(item);
        });
        
        autocompleteList.classList.remove('hidden');
    });
    
    exerciseInput.addEventListener('blur', () => {
        setTimeout(() => {
            autocompleteList.classList.add('hidden');
        }, 200);
    });
    
    // Campo: Data
    const today = new Date().toISOString().split('T')[0];
    const dateLabel = el('label', { className: 'form-label', for: 'form-date' }, 'Data do Treino ', el('span', {}, '*'));
    const dateInput = el('input', {
        className: 'form-input',
        id: 'form-date',
        type: 'date',
        required: 'true',
        value: isEdit ? editRecord.data : today
    });
    const dateGroup = el('div', { className: 'form-group' }, dateLabel, dateInput);
    
    // Campo: Peso (kg)
    const weightLabel = el('label', { className: 'form-label', for: 'form-weight' }, 'Peso Utilizado (kg) ', el('span', {}, '*'));
    const weightInput = el('input', {
        className: 'form-input',
        id: 'form-weight',
        type: 'number',
        inputmode: 'decimal',
        required: 'true',
        step: '0.1',
        min: '0.1',
        placeholder: 'Ex: 50',
        value: isEdit ? editRecord.peso : ''
    });
    const weightGroup = el('div', { className: 'form-group' }, weightLabel, weightInput);
    
    // Campo: Séries
    const seriesLabel = el('label', { className: 'form-label', for: 'form-series' }, 'Séries Feitas ', el('span', {}, '*'));
    const seriesInput = el('input', {
        className: 'form-input',
        id: 'form-series',
        type: 'number',
        inputmode: 'numeric',
        required: 'true',
        min: '1',
        placeholder: 'Ex: 3',
        value: isEdit ? editRecord.series : ''
    });
    const seriesGroup = el('div', { className: 'form-group' }, seriesLabel, seriesInput);
    
    // Campo: Descrição / Notas Opcionais
    const descLabel = el('label', { className: 'form-label', for: 'form-desc' }, 'Observações (Opcional)');
    const descTextarea = el('textarea', {
        className: 'form-textarea',
        id: 'form-desc',
        rows: '3',
        placeholder: 'Ex: RPE 9, sentindo leve desconforto no ombro'
    }, isEdit ? editRecord.descricao_opcional : '');
    const descGroup = el('div', { className: 'form-group' }, descLabel, descTextarea);
    
    // Mensagem de Feedback
    const messageContainer = el('div', { className: 'form-message', id: 'form-message' });
    
    // Botões
    const submitText = isEdit ? 'Salvar Alterações' : 'Salvar Treino';
    const submitBtn = el('button', {
        className: 'btn btn-primary',
        type: 'submit'
    }, submitText);
    
    const cancelBtn = el('a', {
        className: 'btn btn-secondary',
        href: isEdit ? 'historico.html' : 'index.html',
        id: 'form-cancel-btn'
    }, 'Cancelar');
    
    const hiddenId = isEdit ? el('input', { type: 'hidden', id: 'form-record-id', value: editRecord.id }) : '';
    
    const form = el('form', { id: 'training-form' }, 
        hiddenId,
        exerciseGroup, 
        dateGroup, 
        weightGroup, 
        seriesGroup, 
        descGroup, 
        messageContainer, 
        submitBtn, 
        cancelBtn
    );
    
    const formContainer = el('div', { className: 'form-card' }, form);
    
    view.appendChild(formTitle);
    view.appendChild(formContainer);
    
    return view;
}

/* ==========================================================================
   View: Histórico / Lista de Treinos (Página historico.html)
   ========================================================================== */
export function renderHistoryView(user, exercises = [], selectedExercise = '', searchKeyword = '', trainings = []) {
    const view = el('div', { className: 'view' });
    
    // 1. Header Bar
    view.appendChild(renderHeaderBar());
    
    // 2. Título da Seção
    const titleSec = el('h1', { 
        style: 'font-size: var(--font-xl); font-weight: var(--weight-bold); margin-bottom: var(--space-md);' 
    }, 'Histórico Completo');
    view.appendChild(titleSec);
    
    // 3. Bloco de Filtros (Pesquisa por Texto e Seletor por Exercício)
    const searchInput = el('input', {
        className: 'form-input',
        id: 'history-search-input',
        type: 'text',
        placeholder: 'Pesquisar exercício ou nota...',
        value: searchKeyword
    });
    
    const filterSelect = el('select', { 
        className: 'form-select', 
        id: 'history-filter-select',
        style: 'margin-top: var(--space-xs);'
    });
    
    const defaultOpt = el('option', { value: '' }, 'Todos os Exercícios');
    filterSelect.appendChild(defaultOpt);
    
    exercises.forEach(ex => {
        const attrs = { value: ex };
        if (ex === selectedExercise) {
            attrs.selected = 'selected';
        }
        filterSelect.appendChild(el('option', attrs, ex));
    });
    
    const filterCard = el('section', { 
        className: 'selector-card',
        style: 'display: flex; flex-direction: column; gap: var(--space-2xs); margin-bottom: var(--space-md);'
    }, el('span', { className: 'form-label' }, 'Filtrar Treinos'), searchInput, filterSelect);
    
    view.appendChild(filterCard);
    
    // 4. Filtragem
    let filteredTrainings = trainings;
    
    if (selectedExercise) {
        filteredTrainings = filteredTrainings.filter(t => t.exercicio === selectedExercise);
    }
    
    if (searchKeyword.trim()) {
        const term = searchKeyword.toLowerCase().trim();
        filteredTrainings = filteredTrainings.filter(t => 
            t.exercicio.toLowerCase().includes(term) || 
            (t.descricao_opcional && t.descricao_opcional.toLowerCase().includes(term))
        );
    }
    
    filteredTrainings.sort((a, b) => new Date(b.data) - new Date(a.data));
    
    // 5. Cabeçalho de Resultados
    const countBadge = el('span', { className: 'count-badge' }, `${filteredTrainings.length} registros`);
    const listHeader = el('div', { className: 'history-header' }, el('h3', {}, 'Resultados'), countBadge);
    view.appendChild(listHeader);
    
    // Lista de Cards Contêiner
    const historyList = el('div', { className: 'history-list' });
    
    if (filteredTrainings.length === 0) {
        const searchIcon = svgEl('M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z', 'empty-icon', '0 0 24 24', '1.5');
        const emptyStateText = el('p', {}, 'Nenhum registro encontrado correspondente aos filtros.');
        const emptyState = el('div', { className: 'empty-state' }, searchIcon, emptyStateText);
        historyList.appendChild(emptyState);
    } else {
        filteredTrainings.forEach(t => {
            historyList.appendChild(createHistoryCard(t, true));
        });
    }
    
    view.appendChild(historyList);
    return view;
}
