/**
 * JavaScript для мини-приложения винодельни "Золотая Балка"
 */

// Глобальные переменные
let tg = window.Telegram.WebApp;
let user = tg.initDataUnsafe?.user || {};
let currentPage = 'wines';
let wines = [];
let userNotes = [];
let selectedWine = null;
let selectedRating = 0;

// API конфигурация
const API_BASE = '/api'; // Относительный путь к API

// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    initApp();
});

async function initApp() {
    try {
        console.log('Инициализация приложения...');
        
        // Настройка Telegram Web App
        tg.expand();
        tg.setHeaderColor('#2D1B69'); // Фиолетовый цвет винодельни
        
        // Отображение имени пользователя
        const userName = user.first_name || user.username || 'Друг';
        document.getElementById('user-name').textContent = `Привет, ${userName}!`;
        
        // Загрузка данных
        await loadWines();
        await loadUserNotes();
        
        // Настройка обработчиков событий
        setupEventListeners();
        
        // Скрытие загрузчика и показ основного контента
        document.getElementById('loader').classList.add('hidden');
        document.getElementById('main-page').classList.remove('hidden');
        
        console.log('Приложение инициализировано');
        
    } catch (error) {
        console.error('Ошибка инициализации:', error);
        showToast('Ошибка загрузки приложения', 'error');
    }
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Навигация
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const page = e.target.dataset.page;
            switchPage(page);
        });
    });
    
    // Фильтры в каталоге
    document.getElementById('type-filter').addEventListener('change', filterWines);
    document.getElementById('price-filter').addEventListener('change', filterWines);
    document.getElementById('search-input').addEventListener('input', filterWines);
    document.getElementById('awards-filter').addEventListener('change', filterWines);
    
    // ИИ-сомелье
    document.querySelectorAll('.ai-quick-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const query = e.target.dataset.query;
            askAI(query);
        });
    });
    
    document.getElementById('ai-send').addEventListener('click', sendAIMessage);
    document.getElementById('ai-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendAIMessage();
        }
    });
    
    // Модальные окна
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', closeModals);
    });
    
    // Клик вне модального окна для закрытия
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModals();
        }
    });
    
    // Форма заметки
    document.getElementById('note-form').addEventListener('submit', saveNote);
    
    // Рейтинг звезды
    document.querySelectorAll('.star').forEach(star => {
        star.addEventListener('click', (e) => {
            selectedRating = parseInt(e.target.dataset.rating);
            updateRatingDisplay();
        });
    });
    
    // Вкладки дневника
    document.querySelectorAll('.diary-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            const tabName = e.target.dataset.tab;
            switchDiaryTab(tabName);
        });
    });
}

// Переключение страниц
function switchPage(page) {
    // Обновление навигации
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.page === page);
    });
    
    // Обновление контента
    document.querySelectorAll('.page-content').forEach(content => {
        content.classList.toggle('active', content.id === `${page}-content`);
    });
    
    currentPage = page;
    
    // Загрузка данных для страницы
    switch(page) {
        case 'wines':
            displayWines();
            break;
        case 'diary':
            displayNotes();
            displayStats();
            break;
        case 'tour':
            loadTourData();
            break;
    }
}

// =============== КАТАЛОГ ВИН ===============

async function loadWines() {
    try {
        const response = await apiCall('/wines');
        wines = response.wines || [];
        displayWines();
    } catch (error) {
        console.error('Ошибка загрузки вин:', error);
        showToast('Ошибка загрузки каталога', 'error');
    }
}

function displayWines(filteredWines = null) {
    const container = document.getElementById('wines-grid');
    const winesToShow = filteredWines || wines;
    
    if (winesToShow.length === 0) {
        container.innerHTML = '<div class="no-results">🔍 Ничего не найдено</div>';
        return;
    }
    
    container.innerHTML = winesToShow.map(wine => `
        <div class="wine-card" onclick="showWineDetails(${wine.id})">
            <div class="wine-image">
                <img src="${wine.image_url || '/images/wine-default.jpg'}" 
                     alt="${wine.name}" loading="lazy">
                ${wine.awards ? '<div class="award-badge">🏆</div>' : ''}
            </div>
            <div class="wine-info">
                <h3 class="wine-name">${wine.name}</h3>
                <p class="wine-type">${getTypeEmoji(wine.type)} ${wine.type}</p>
                <p class="wine-price">${wine.price}₽</p>
                <p class="wine-description">${wine.description.substring(0, 100)}...</p>
                <div class="wine-details">
                    <span class="wine-alcohol">${wine.alcohol_content}%</span>
                    <span class="wine-grapes">${wine.grape_varieties}</span>
                </div>
                ${wine.awards ? `<div class="wine-awards">🏆 ${wine.awards}</div>` : ''}
            </div>
            <div class="wine-actions">
                <button class="btn-note" onclick="event.stopPropagation(); openNoteModal(${wine.id})">
                    📝
                </button>
                <button class="btn-ai" onclick="event.stopPropagation(); askWineAI(${wine.id})">
                    🤖
                </button>
            </div>
        </div>
    `).join('');
}

function filterWines() {
    const typeFilter = document.getElementById('type-filter').value;
    const priceFilter = document.getElementById('price-filter').value;
    const searchQuery = document.getElementById('search-input').value.toLowerCase();
    const awardsOnly = document.getElementById('awards-filter').checked;
    
    let filtered = wines;
    
    // Фильтр по типу
    if (typeFilter) {
        filtered = filtered.filter(wine => wine.type === typeFilter);
    }
    
    // Фильтр по цене
    if (priceFilter) {
        const [min, max] = priceFilter.split('-').map(Number);
        filtered = filtered.filter(wine => {
            return wine.price >= min && (max ? wine.price <= max : true);
        });
    }
    
    // Поиск
    if (searchQuery) {
        filtered = filtered.filter(wine => 
            wine.name.toLowerCase().includes(searchQuery) ||
            wine.description.toLowerCase().includes(searchQuery) ||
            wine.grape_varieties.toLowerCase().includes(searchQuery)
        );
    }
    
    // Только награждённые
    if (awardsOnly) {
        filtered = filtered.filter(wine => wine.awards && wine.awards.trim());
    }
    
    displayWines(filtered);
}

async function showWineDetails(wineId) {
    try {
        const response = await apiCall(`/wines/${wineId}`);
        const wine = response.wine;
        
        document.getElementById('wine-details').innerHTML = `
            <div class="wine-detail-header">
                <img src="${wine.image_url || '/images/wine-default.jpg'}" 
                     alt="${wine.name}" class="wine-detail-image">
                <div class="wine-detail-info">
                    <h2>${wine.name}</h2>
                    <p class="wine-detail-type">${getTypeEmoji(wine.type)} ${wine.type}</p>
                    <p class="wine-detail-price">${wine.price}₽</p>
                    ${wine.awards ? `<div class="wine-awards">🏆 ${wine.awards}</div>` : ''}
                </div>
            </div>
            
            <div class="wine-detail-content">
                <div class="wine-section">
                    <h3>📝 Описание</h3>
                    <p>${wine.description}</p>
                </div>
                
                <div class="wine-section">
                    <h3>🍇 Характеристики</h3>
                    <ul>
                        <li><strong>Сорта винограда:</strong> ${wine.grape_varieties}</li>
                        <li><strong>Крепость:</strong> ${wine.alcohol_content}%</li>
                        <li><strong>Регион:</strong> ${wine.region}</li>
                        <li><strong>Подача:</strong> ${wine.serving_temp}</li>
                        <li><strong>Выдержка:</strong> ${wine.aging_period || 'Не указано'}</li>
                    </ul>
                </div>
                
                <div class="wine-section">
                    <h3>🍽️ Гастрономические пары</h3>
                    <p>${wine.food_pairing}</p>
                </div>
                
                ${response.reviews && response.reviews.length > 0 ? `
                <div class="wine-section">
                    <h3>💬 Отзывы дегустаторов</h3>
                    <div class="reviews">
                        ${response.reviews.slice(0, 3).map(review => `
                            <div class="review">
                                <div class="review-header">
                                    <strong>${review.first_name || review.username || 'Аноним'}</strong>
                                    <span class="review-rating">${'⭐'.repeat(review.rating)}</span>
                                </div>
                                <p class="review-text">${review.note}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
                
                <div class="wine-actions-modal">
                    <button class="btn btn-primary" onclick="openNoteModal(${wine.id})">
                        📝 Добавить заметку
                    </button>
                    <button class="btn btn-secondary" onclick="askWineAI(${wine.id})">
                        🤖 Спросить сомелье
                    </button>
                </div>
            </div>
        `;
        
        document.getElementById('wine-modal').classList.add('active');
    } catch (error) {
        console.error('Ошибка загрузки деталей вина:', error);
        showToast('Ошибка загрузки информации о вине', 'error');
    }
}

// =============== ИИ-СОМЕЛЬЕ ===============

async function askAI(query) {
    addAIMessage(query, 'user');
    
    // Показать индикатор набора
    const typingIndicator = addAIMessage('Думаю...', 'bot', true);
    
    try {
        const response = await apiCall('/ai-sommelier', 'POST', { query });
        
        // Убрать индикатор набора
        typingIndicator.remove();
        
        addAIMessage(response.response, 'bot');
        
    } catch (error) {
        typingIndicator.remove();
        console.error('Ошибка ИИ-сомелье:', error);
        addAIMessage('Извините, возникла ошибка. Попробуйте позже.', 'bot');
    }
}

async function sendAIMessage() {
    const input = document.getElementById('ai-input');
    const query = input.value.trim();
    
    if (!query) return;
    
    input.value = '';
    await askAI(query);
}

async function askWineAI(wineId) {
    const wine = wines.find(w => w.id === wineId);
    if (!wine) return;
    
    // Переключаемся на страницу ИИ-сомелье
    switchPage('ai-sommelier');
    
    // Задаём вопрос о конкретном вине
    const query = `Расскажи подробнее о вине ${wine.name}. К каким блюдам оно подходит?`;
    await askAI(query);
}

function addAIMessage(text, sender, isTyping = false) {
    const messagesContainer = document.getElementById('ai-messages');
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `ai-message ${sender} ${isTyping ? 'typing' : ''}`;
    
    messageDiv.innerHTML = `
        <div class="message-content">
            ${isTyping ? '<div class="typing-dots"><span></span><span></span><span></span></div>' : `<p>${text}</p>`}
        </div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    return messageDiv;
}

// =============== ДЕГУСТАЦИОННЫЙ ДНЕВНИК ===============

async function loadUserNotes() {
    try {
        const response = await apiCall('/tasting-notes');
        userNotes = response.notes || [];
        updateDiaryStats(response.stats);
    } catch (error) {
        console.error('Ошибка загрузки заметок:', error);
        showToast('Ошибка загрузки дневника', 'error');
    }
}

function displayNotes() {
    const container = document.getElementById('notes-list');
    
    if (userNotes.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>📖 Ваш дневник пуст</h3>
                <p>Начните дегустировать вина и добавлять заметки!</p>
                <button class="btn btn-primary" onclick="switchPage('wines')">
                    🍷 Перейти к каталогу
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = userNotes.map(note => `
        <div class="note-card">
            <div class="note-header">
                <h3>${note.wine_name}</h3>
                <div class="note-rating">${'⭐'.repeat(note.rating)}</div>
            </div>
            <div class="note-content">
                <p class="note-text">${note.note}</p>
                ${note.aroma_notes ? `<p class="note-detail"><strong>Аромат:</strong> ${note.aroma_notes}</p>` : ''}
                ${note.taste_notes ? `<p class="note-detail"><strong>Вкус:</strong> ${note.taste_notes}</p>` : ''}
                ${note.finish_notes ? `<p class="note-detail"><strong>Послевкусие:</strong> ${note.finish_notes}</p>` : ''}
            </div>
            <div class="note-meta">
                <span class="note-date">${formatDate(note.created_at)}</span>
            </div>
        </div>
    `).join('');
}

function displayStats() {
    // Статистика будет отображена в updateDiaryStats
}

function updateDiaryStats(stats) {
    if (!stats) return;
    
    document.getElementById('diary-stats').innerHTML = `
        <div class="stat-item">
            <span class="stat-number">${stats.total_notes || 0}</span>
            <span class="stat-label">заметок</span>
        </div>
        <div class="stat-item">
            <span class="stat-number">${stats.avg_rating || 0}</span>
            <span class="stat-label">ср. оценка</span>
        </div>
        <div class="stat-item">
            <span class="stat-type">${getTypeEmoji(stats.favorite_type)} ${stats.favorite_type || 'н/д'}</span>
            <span class="stat-label">любимый тип</span>
        </div>
    `;
    
    // Обновление статистического контента
    const statsContent = document.getElementById('diary-stats-content');
    if (stats.wines_by_type) {
        statsContent.innerHTML = `
            <div class="stats-section">
                <h3>📊 По типам вин</h3>
                <div class="stats-bars">
                    ${Object.entries(stats.wines_by_type).map(([type, data]) => `
                        <div class="stat-bar">
                            <div class="stat-bar-label">
                                ${getTypeEmoji(type)} ${type}
                            </div>
                            <div class="stat-bar-container">
                                <div class="stat-bar-fill" 
                                     style="width: ${(data.count / stats.total_notes) * 100}%"></div>
                                <span class="stat-bar-value">${data.count}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
}

function switchDiaryTab(tab) {
    document.querySelectorAll('.diary-tab').forEach(t => {
        t.classList.toggle('active', t.dataset.tab === tab);
    });
    
    document.querySelectorAll('.diary-tab-content').forEach(content => {
        content.classList.toggle('active', content.id === `diary-${tab}${tab === 'stats' ? '-content' : ''}`);
    });
}

// =============== МОДАЛЬНЫЕ ОКНА ===============

function openNoteModal(wineId) {
    selectedWine = wines.find(w => w.id === wineId);
    if (!selectedWine) return;
    
    selectedRating = 0;
    updateRatingDisplay();
    
    // Очищаем форму
    document.getElementById('note-form').reset();
    document.getElementById('note-modal').classList.add('active');
}

function closeModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
}

function closeNoteModal() {
    closeModals();
    selectedWine = null;
    selectedRating = 0;
}

function updateRatingDisplay() {
    document.querySelectorAll('.star').forEach((star, index) => {
        star.classList.toggle('selected', index < selectedRating);
    });
    
    const ratingText = selectedRating > 0 ? 
        `${selectedRating}/10 - ${getRatingText(selectedRating)}` : 
        'Выберите оценку';
    
    document.getElementById('rating-text').textContent = ratingText;
}

async function saveNote(e) {
    e.preventDefault();
    
    if (!selectedWine || selectedRating === 0) {
        showToast('Выберите оценку', 'error');
        return;
    }
    
    const noteData = {
        wine_id: selectedWine.id,
        rating: selectedRating,
        note: document.getElementById('note-text').value,
        aroma_notes: document.getElementById('aroma-notes').value,
        taste_notes: document.getElementById('taste-notes').value,
        finish_notes: document.getElementById('finish-notes').value
    };
    
    try {
        await apiCall('/tasting-notes', 'POST', noteData);
        
        showToast('Заметка сохранена!', 'success');
        closeNoteModal();
        
        // Обновляем данные
        await loadUserNotes();
        
        // Отправляем данные в бот через Web App
        tg.sendData(JSON.stringify({
            action: 'add_tasting_note',
            ...noteData
        }));
        
    } catch (error) {
        console.error('Ошибка сохранения заметки:', error);
        showToast('Ошибка сохранения заметки', 'error');
    }
}

// =============== ВИРТУАЛЬНАЯ ЭКСКУРСИЯ ===============

async function loadTourData() {
    try {
        const response = await apiCall('/virtual-tour');
        displayTourSections(response.sections);
        displayBookingOptions(response.booking_info);
    } catch (error) {
        console.error('Ошибка загрузки экскурсии:', error);
        showToast('Ошибка загрузки экскурсии', 'error');
    }
}

function displayTourSections(sections) {
    const container = document.getElementById('tour-sections');
    
    container.innerHTML = sections.map(section => `
        <div class="tour-section">
            <div class="tour-section-image">
                <img src="${section.image}" alt="${section.title}" loading="lazy">
            </div>
            <div class="tour-section-content">
                <h3>${section.title}</h3>
                <p>${section.description}</p>
                <ul>
                    ${section.details.map(detail => `<li>${detail}</li>`).join('')}
                </ul>
            </div>
        </div>
    `).join('');
}

function displayBookingOptions(bookingInfo) {
    const container = document.querySelector('.booking-options');
    
    container.innerHTML = Object.entries(bookingInfo).map(([type, info]) => `
        <div class="booking-option">
            <h4>${getBookingTitle(type)}</h4>
            <div class="booking-price">${info.price}₽</div>
            <div class="booking-details">
                <p><strong>Длительность:</strong> ${info.duration}</p>
                <p><strong>Включено:</strong> ${info.includes}</p>
            </div>
            <button class="btn btn-primary booking-btn" onclick="bookTour('${type}')">
                📅 Записаться
            </button>
        </div>
    `).join('');
}

function bookTour(type) {
    tg.sendData(JSON.stringify({
        action: 'book_tour',
        tour_type: type
    }));
    
    showToast('Заявка отправлена! С вами свяжутся.', 'success');
}

// =============== УТИЛИТЫ ===============

async function apiCall(endpoint, method = 'GET', data = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `tma ${tg.initData}`
        }
    };
    
    if (data) {
        options.body = JSON.stringify(data);
    }
    
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function getTypeEmoji(type) {
    const emojis = {
        'игристое': '🥂',
        'белое': '🤍',
        'красное': '🍷',
        'розовое': '🌹'
    };
    return emojis[type] || '🍾';
}

function getRatingText(rating) {
    const texts = {
        1: 'Ужасно',
        2: 'Плохо',
        3: 'Неудовлетворительно',
        4: 'Ниже среднего',
        5: 'Средне',
        6: 'Неплохо',
        7: 'Хорошо',
        8: 'Очень хорошо',
        9: 'Превосходно',
        10: 'Идеально'
    };
    return texts[rating] || '';
}

function getBookingTitle(type) {
    const titles = {
        'standard': '📍 Стандартная экскурсия',
        'premium': '🍷 Премиум программа',
        'vip': '👑 VIP-экскурсия'
    };
    return titles[type] || type;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
}

// Инициализация при загрузке страницы
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}