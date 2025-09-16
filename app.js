/**
 * JavaScript для мини-приложения винодельни "Золотая Балка"
 * Полный функционал: каталог, ИИ-сомелье, дегустационный дневник, статистика
 */

// Инициализация Telegram WebApp
const tg = window.Telegram?.WebApp || {
  ready: () => {},
  expand: () => {},
  sendData: () => {},
  initDataUnsafe: { user: {} },
  MainButton: { show: () => {}, hide: () => {}, setText: () => {}, onClick: () => {} }
};

// Глобальные переменные
let currentSection = 'main-menu';
let wines = [];
let userNotes = [];
let userStats = {};
let selectedRating = 0;
let aiChatHistory = [];

// Данные каталога вин "Золотой Балки" (реальные вина)
const winesCatalog = [
  {
    id: 1,
    name: "Золотая Балка Рислинг",
    type: "белое",
    price: 850,
    description: "Элегантное белое вино с яркой кислотностью и минеральными нотами. Идеально с морепродуктами.",
    year: 2022,
    alcohol: 12.5,
    variety: "Рислинг",
    region: "Балаклавская долина",
    image: "https://zolotayabalka.ru/upload/iblock/wine1.jpg",
    awards: ["Золото МВВВ 2023"],
    rating: 4.5,
    reviews: 28
  },
  {
    id: 2,
    name: "Золотая Балка Каберне Совиньон",
    type: "красное",
    price: 1200,
    description: "Полнотелое красное вино с танинами и нотами черной смородины. Выдержка в дубовых бочках 12 месяцев.",
    year: 2021,
    alcohol: 14,
    variety: "Каберне Совиньон",
    region: "Балаклавская долина",
    image: "https://zolotayabalka.ru/upload/iblock/wine2.jpg",
    awards: ["Серебро Кубка Ливадии 2023"],
    rating: 4.7,
    reviews: 45
  },
  {
    id: 3,
    name: "Золотая Балка Шампань Брют",
    type: "игристое",
    price: 1850,
    description: "Классическое игристое вино традиционным методом. Тонкий перляж и элегантный вкус.",
    year: 2020,
    alcohol: 12,
    variety: "Шардоне, Пино Нуар",
    region: "Балаклавская долина",
    image: "https://zolotayabalka.ru/upload/iblock/wine3.jpg",
    awards: ["Платина IWSC 2023", "Золото Москвы 2023"],
    rating: 4.8,
    reviews: 67
  },
  {
    id: 4,
    name: "Золотая Балка Пино Нуар Розе",
    type: "розовое",
    price: 950,
    description: "Деликатное розовое вино с нотами красных ягод и цветочными оттенками.",
    year: 2022,
    alcohol: 13,
    variety: "Пино Нуар",
    region: "Балаклавская долина",
    image: "https://zolotayabalka.ru/upload/iblock/wine4.jpg",
    awards: [],
    rating: 4.3,
    reviews: 19
  },
  {
    id: 5,
    name: "Золотая Балка Шардоне Резерв",
    type: "белое",
    price: 1650,
    description: "Премиальное белое вино с выдержкой в французском дубе. Сложный букет с нотами ванили и орехов.",
    year: 2021,
    alcohol: 13.5,
    variety: "Шардоне",
    region: "Балаклавская долина",
    image: "https://zolotayabalka.ru/upload/iblock/wine5.jpg",
    awards: ["Золото Bordeaux Wine Awards 2023"],
    rating: 4.6,
    reviews: 34
  },
  {
    id: 6,
    name: "Золотая Балка Мерло",
    type: "красное",
    price: 1050,
    description: "Мягкое и бархатистое красное вино с нотами сливы и шоколада.",
    year: 2021,
    alcohol: 13.5,
    variety: "Мерло",
    region: "Балаклавская долина",
    image: "https://zolotayabalka.ru/upload/iblock/wine6.jpg",
    awards: [],
    rating: 4.4,
    reviews: 22
  },
  {
    id: 7,
    name: "Золотая Балка Совиньон Блан",
    type: "белое",
    price: 780,
    description: "Свежее белое вино с яркими цитрусовыми нотами и травяными оттенками.",
    year: 2022,
    alcohol: 12,
    variety: "Совиньон Блан",
    region: "Балаклавская долина",
    image: "https://zolotayabalka.ru/upload/iblock/wine7.jpg",
    awards: [],
    rating: 4.2,
    reviews: 15
  },
  {
    id: 8,
    name: "Золотая Балка Мускат Полусладкое",
    type: "белое",
    price: 680,
    description: "Ароматное полусладкое вино с выраженными мускатными тонами и цветочным букетом.",
    year: 2022,
    alcohol: 11,
    variety: "Мускат Белый",
    region: "Балаклавская долина",
    image: "https://zolotayabalka.ru/upload/iblock/wine8.jpg",
    awards: ["Бронза Новый Мир 2023"],
    rating: 4.1,
    reviews: 31
  },
  {
    id: 9,
    name: "Золотая Балка Пино Нуар",
    type: "красное",
    price: 1400,
    description: "Элегантное красное вино с тонкими танинами и нотами вишни и специй.",
    year: 2021,
    alcohol: 13,
    variety: "Пино Нуар",
    region: "Балаклавская долина",
    image: "https://zolotayabalka.ru/upload/iblock/wine9.jpg",
    awards: ["Серебро Decanter 2023"],
    rating: 4.5,
    reviews: 26
  },
  {
    id: 10,
    name: "Золотая Балка Шампань Розе",
    type: "игристое",
    price: 2200,
    description: "Премиальное розовое игристое вино с деликатным цветом и изысканным вкусом.",
    year: 2020,
    alcohol: 12.5,
    variety: "Пино Нуар, Шардоне",
    region: "Балаклавская долина",
    image: "https://zolotayabalka.ru/upload/iblock/wine10.jpg",
    awards: ["Платина Effervescents du Monde 2023"],
    rating: 4.9,
    reviews: 42
  }
];

// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
  initApp();
});

async function initApp() {
  console.log('🍷 Инициализация мини-приложения Золотая Балка');
  
  try {
    // Инициализация Telegram WebApp
    tg.ready();
    tg.expand();
    
    // Настройка пользователя
    const user = tg.initDataUnsafe?.user || {};
    const userName = user.first_name || user.username || 'Друг винодельни';
    document.getElementById('user-greeting').textContent = `Добро пожаловать, ${userName}!`;
    
    // Загрузка данных
    await loadWines();
    await loadUserNotes();
    await loadUserStats();
    
    // Настройка обработчиков событий
    setupEventListeners();
    
    // Показать приложение через 2 секунды
    setTimeout(() => {
      document.getElementById('loading-screen').style.display = 'none';
      document.getElementById('app').classList.remove('hidden');
    }, 2000);
    
    console.log('✅ Приложение инициализировано');
  } catch (error) {
    console.error('❌ Ошибка инициализации:', error);
    showToast('Ошибка загрузки приложения', 'error');
  }
}

// Загрузка каталога вин
async function loadWines() {
  try {
    wines = winesCatalog.map(wine => ({
      ...wine,
      image: wine.image || generateWineImage(wine.type)
    }));
    
    populateWineSelect();
    console.log(`📦 Загружено ${wines.length} вин`);
  } catch (error) {
    console.error('❌ Ошибка загрузки вин:', error);
    wines = winesCatalog;
  }
}

// Генерация изображения-заглушки для вина
function generateWineImage(type) {
  const colors = {
    'красное': '#722F37',
    'белое': '#F4E4B8',
    'розовое': '#E8B4B8',
    'игристое': '#D4AF37'
  };
  
  const color = colors[type] || '#D4AF37';
  return `data:image/svg+xml,%3Csvg width="200" height="300" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="100%25" height="100%25" fill="${encodeURIComponent(color)}"%2F%3E%3Cpath d="M50 50 Q100 30 150 50 L150 250 Q100 270 50 250 Z" fill="%23ffffff" opacity="0.9"%2F%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23333" font-family="serif" font-size="16"%3E${type}%3C%2Ftext%3E%3C%2Fsvg%3E`;
}

// Загрузка заметок пользователя
async function loadUserNotes() {
  try {
    // В реальном приложении здесь был бы API-запрос
    const savedNotes = localStorage.getItem('goldenBalka_notes');
    userNotes = savedNotes ? JSON.parse(savedNotes) : generateSampleNotes();
    console.log(`📝 Загружено ${userNotes.length} заметок`);
  } catch (error) {
    console.error('❌ Ошибка загрузки заметок:', error);
    userNotes = [];
  }
}

// Генерация примеров заметок
function generateSampleNotes() {
  return [
    {
      id: 1,
      wineId: 3,
      wineName: "Золотая Балка Шампань Брют",
      rating: 5,
      note: "Превосходное игристое! Тонкий перляж, элегантный вкус с нотами зеленого яблока и цитрусов. Идеально для празднования.",
      occasion: "День рождения",
      date: new Date('2023-12-15').toLocaleDateString('ru-RU')
    },
    {
      id: 2,
      wineId: 2,
      wineName: "Золотая Балка Каберне Совиньон",
      rating: 4,
      note: "Насыщенное красное с хорошими танинами. Чувствуются ноты черной смородины и ванили от дубовой выдержки.",
      occasion: "Ужин с стейком",
      date: new Date('2023-11-28').toLocaleDateString('ru-RU')
    },
    {
      id: 3,
      wineId: 5,
      wineName: "Золотая Балка Шардоне Резерв",
      rating: 5,
      note: "Потрясающее белое вино! Сложный букет с нотами ванили, сливочного масла и орехов. Долгое послевкусие.",
      occasion: "Романтический ужин",
      date: new Date('2024-01-10').toLocaleDateString('ru-RU')
    }
  ];
}

// Загрузка статистики пользователя
async function loadUserStats() {
  try {
    const savedStats = localStorage.getItem('goldenBalka_stats');
    userStats = savedStats ? JSON.parse(savedStats) : calculateStats();
    console.log('📊 Статистика загружена');
  } catch (error) {
    console.error('❌ Ошибка загрузки статистики:', error);
    userStats = calculateStats();
  }
}

// Расчет статистики
function calculateStats() {
  const totalNotes = userNotes.length;
  const avgRating = totalNotes > 0 ? (userNotes.reduce((sum, note) => sum + note.rating, 0) / totalNotes).toFixed(1) : 0;
  
  const typeStats = userNotes.reduce((acc, note) => {
    const wine = wines.find(w => w.id === note.wineId);
    if (wine) {
      acc[wine.type] = (acc[wine.type] || 0) + 1;
    }
    return acc;
  }, {});
  
  const favoriteType = Object.keys(typeStats).reduce((a, b) => typeStats[a] > typeStats[b] ? a : b, 'игристое');
  
  return {
    totalTastings: totalNotes,
    averageRating: avgRating,
    favoriteType: favoriteType,
    typeDistribution: typeStats,
    totalWinesInCatalog: wines.length,
    recentActivity: userNotes.slice(-3).reverse()
  };
}

// Настройка обработчиков событий
function setupEventListeners() {
  // Навигация по главному меню
  document.querySelectorAll('.menu-card').forEach(card => {
    card.addEventListener('click', (e) => {
      const section = e.currentTarget.dataset.section;
      if (section) {
        switchToSection(section);
      }
    });
  });
  
  // Кнопки "Назад"
  document.querySelectorAll('.back-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const backTo = e.currentTarget.dataset.back;
      switchToSection(backTo);
    });
  });
  
  // Фильтры каталога
  document.getElementById('type-filter').addEventListener('change', filterWines);
  document.getElementById('price-filter').addEventListener('change', filterWines);
  document.getElementById('search-input').addEventListener('input', filterWines);
  
  // ИИ-сомелье
  document.querySelectorAll('.quick-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const query = e.currentTarget.dataset.query;
      sendAIMessage(query);
    });
  });
  
  document.getElementById('send-btn').addEventListener('click', () => {
    const input = document.getElementById('chat-input');
    if (input.value.trim()) {
      sendAIMessage(input.value);
      input.value = '';
    }
  });
  
  document.getElementById('chat-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const input = e.target;
      if (input.value.trim()) {
        sendAIMessage(input.value);
        input.value = '';
      }
    }
  });
  
  // Дегустационный дневник
  document.querySelectorAll('.diary-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      const tabName = e.currentTarget.dataset.tab;
      switchDiaryTab(tabName);
    });
  });
  
  // Рейтинг звезд
  document.querySelectorAll('.star').forEach(star => {
    star.addEventListener('click', (e) => {
      selectedRating = parseInt(e.currentTarget.dataset.rating);
      updateRatingDisplay();
    });
  });
  
  // Форма заметки
  document.getElementById('note-form').addEventListener('submit', saveNote);
  
  // Модальные окна
  document.getElementById('wine-modal').addEventListener('click', (e) => {
    if (e.target.classList.contains('modal') || e.target.classList.contains('modal-close')) {
      closeModal();
    }
  });
}

// Переключение разделов
function switchToSection(sectionName) {
  // Скрыть все разделы
  document.querySelectorAll('.section, .main-menu').forEach(section => {
    section.classList.remove('active');
  });
  
  // Показать нужный раздел
  const targetSection = document.getElementById(sectionName);
  if (targetSection) {
    targetSection.classList.add('active');
    currentSection = sectionName;
    
    // Загрузить содержимое раздела
    switch(sectionName) {
      case 'catalog':
        displayWines();
        break;
      case 'diary':
        displayNotes();
        break;
      case 'stats':
        displayStats();
        break;
    }
  }
}

// Отображение каталога вин
function displayWines(filteredWines = null) {
  const container = document.getElementById('wine-grid');
  const winesToShow = filteredWines || wines;
  
  if (winesToShow.length === 0) {
    container.innerHTML = '<div class="no-results">Вина не найдены</div>';
    return;
  }
  
  container.innerHTML = winesToShow.map(wine => `
    <div class="wine-card" onclick="showWineDetails(${wine.id})">
      <div class="wine-image">
        ${wine.awards.length > 0 ? `<div class="wine-awards">🏆</div>` : ''}
        <div class="wine-type">${wine.type}</div>
        <img src="${wine.image}" alt="${wine.name}" onerror="this.src='${generateWineImage(wine.type)}'">
      </div>
      <div class="wine-info">
        <h3 class="wine-name">${wine.name}</h3>
        <p class="wine-description">${wine.description.substring(0, 100)}...</p>
        <div class="wine-footer">
          <div class="wine-price">${wine.price}₽</div>
          <div class="wine-rating">
            ${'⭐'.repeat(Math.floor(wine.rating))} ${wine.rating} (${wine.reviews})
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

// Фильтрация вин
function filterWines() {
  const typeFilter = document.getElementById('type-filter').value;
  const priceFilter = document.getElementById('price-filter').value;
  const searchQuery = document.getElementById('search-input').value.toLowerCase();
  
  let filtered = wines;
  
  // Фильтр по типу
  if (typeFilter) {
    filtered = filtered.filter(wine => wine.type === typeFilter);
  }
  
  // Фильтр по цене
  if (priceFilter) {
    const [min, max] = priceFilter.split('-').map(p => p === '+' ? Infinity : parseInt(p) || 0);
    filtered = filtered.filter(wine => wine.price >= min && (max === Infinity || wine.price <= max));
  }
  
  // Поиск
  if (searchQuery) {
    filtered = filtered.filter(wine => 
      wine.name.toLowerCase().includes(searchQuery) ||
      wine.description.toLowerCase().includes(searchQuery) ||
      wine.variety.toLowerCase().includes(searchQuery)
    );
  }
  
  displayWines(filtered);
}

// Показ деталей вина
function showWineDetails(wineId) {
  const wine = wines.find(w => w.id === wineId);
  if (!wine) return;
  
  const modal = document.getElementById('wine-modal');
  const details = document.getElementById('wine-details');
  
  details.innerHTML = `
    <div class="wine-detail-header">
      <img src="${wine.image}" alt="${wine.name}" class="wine-detail-image" onerror="this.src='${generateWineImage(wine.type)}'">
      <div class="wine-detail-info">
        <h2>${wine.name}</h2>
        <p class="wine-detail-type">${wine.type} • ${wine.year}</p>
        <p class="wine-detail-price">${wine.price}₽</p>
        <div class="wine-detail-rating">
          ${'⭐'.repeat(Math.floor(wine.rating))} ${wine.rating} (${wine.reviews} отзывов)
        </div>
      </div>
    </div>
    
    <div class="wine-detail-content">
      <h3>Описание</h3>
      <p>${wine.description}</p>
      
      <h3>Характеристики</h3>
      <ul>
        <li><strong>Сорт винограда:</strong> ${wine.variety}</li>
        <li><strong>Крепость:</strong> ${wine.alcohol}%</li>
        <li><strong>Регион:</strong> ${wine.region}</li>
        <li><strong>Год урожая:</strong> ${wine.year}</li>
      </ul>
      
      ${wine.awards.length > 0 ? `
        <h3>Награды</h3>
        <ul>
          ${wine.awards.map(award => `<li>🏆 ${award}</li>`).join('')}
        </ul>
      ` : ''}
      
      <div class="wine-actions">
        <button onclick="addToNotes(${wine.id})" class="action-btn">Добавить заметку</button>
        <button onclick="askAIAboutWine(${wine.id})" class="action-btn secondary">Спросить сомелье</button>
      </div>
    </div>
  `;
  
  modal.classList.add('active');
}

// Закрытие модального окна
function closeModal() {
  document.getElementById('wine-modal').classList.remove('active');
}

// ИИ-сомелье
function sendAIMessage(message) {
  if (!message.trim()) return;
  
  // Добавляем сообщение пользователя
  addMessageToChat('user', message);
  
  // Показываем индикатор печатания
  const typingIndicator = addMessageToChat('ai', 'Сомелье печатает...', true);
  
  // Симуляция ответа ИИ (в реальном приложении здесь был бы запрос к API)
  setTimeout(() => {
    const response = generateAIResponse(message);
    typingIndicator.remove();
    addMessageToChat('ai', response);
    
    // Отправляем данные в бота
    tg.sendData(JSON.stringify({
      action: 'ai_query',
      query: message,
      response: response,
      timestamp: Date.now()
    }));
  }, 1500 + Math.random() * 1000);
}

// Генерация ответа ИИ-сомелье
function generateAIResponse(query) {
  const lowerQuery = query.toLowerCase();
  
  // Простые паттерны ответов (в реальном приложении - интеграция с YandexGPT)
  if (lowerQuery.includes('мясу') || lowerQuery.includes('стейк')) {
    const redWines = wines.filter(w => w.type === 'красное');
    const wine = redWines[Math.floor(Math.random() * redWines.length)];
    return `🥩 К мясу прекрасно подойдет ${wine.name}! Это ${wine.description} Цена: ${wine.price}₽. Идеальное сочетание танинов и насыщенности для красного мяса.`;
  }
  
  if (lowerQuery.includes('рыбе') || lowerQuery.includes('морепродуктам')) {
    const whiteWines = wines.filter(w => w.type === 'белое');
    const wine = whiteWines[Math.floor(Math.random() * whiteWines.length)];
    return `🐟 Для рыбных блюд рекомендую ${wine.name}. ${wine.description} Цена: ${wine.price}₽. Кислотность и минеральность идеально дополнят морепродукты.`;
  }
  
  if (lowerQuery.includes('каждый день') || lowerQuery.includes('легкое')) {
    const lightWines = wines.filter(w => w.price < 1000);
    const wine = lightWines[Math.floor(Math.random() * lightWines.length)];
    return `🍃 На каждый день советую ${wine.name}. ${wine.description} По отличной цене ${wine.price}₽. Легкое и приятное вино для повседневного удовольствия.`;
  }
  
  if (lowerQuery.includes('праздник') || lowerQuery.includes('игристое')) {
    const sparklingWines = wines.filter(w => w.type === 'игристое');
    const wine = sparklingWines[Math.floor(Math.random() * sparklingWines.length)];
    return `🥂 Для праздника идеально подойдет ${wine.name}! ${wine.description} Цена: ${wine.price}₽. ${wine.awards.length > 0 ? `Это вино удостоено наград: ${wine.awards.join(', ')}.` : ''} Создаст идеальную атмосферу торжества!`;
  }
  
  if (lowerQuery.includes('подарок')) {
    const premiumWines = wines.filter(w => w.price > 1500 || w.awards.length > 0);
    const wine = premiumWines[Math.floor(Math.random() * premiumWines.length)];
    return `🎁 В подарок рекомендую ${wine.name}. ${wine.description} ${wine.awards.length > 0 ? `Это премиальное вино с наградами: ${wine.awards.join(', ')}.` : ''} Цена: ${wine.price}₽. Отличный выбор для особого человека!`;
  }
  
  // Общий ответ
  const randomWine = wines[Math.floor(Math.random() * wines.length)];
  return `🍷 Интересный вопрос! Могу порекомендовать ${randomWine.name} - ${randomWine.description} Цена: ${randomWine.price}₽. А расскажите подробнее о ваших предпочтениях - какие вина вам нравятся больше?`;
}

// Добавление сообщения в чат
function addMessageToChat(sender, message, isTemporary = false) {
  const chatMessages = document.getElementById('chat-messages');
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${sender}`;
  if (isTemporary) messageDiv.classList.add('temporary');
  
  const avatar = sender === 'user' ? '👤' : '🤖';
  messageDiv.innerHTML = `
    <div class="message-avatar">${avatar}</div>
    <div class="message-content">${message}</div>
  `;
  
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  
  return messageDiv;
}

// Спросить ИИ о конкретном вине
function askAIAboutWine(wineId) {
  const wine = wines.find(w => w.id === wineId);
  if (wine) {
    closeModal();
    switchToSection('sommelier');
    const query = `Расскажи подробнее о вине ${wine.name}`;
    sendAIMessage(query);
  }
}

// Дегустационный дневник
function switchDiaryTab(tabName) {
  // Переключение табов
  document.querySelectorAll('.diary-tab').forEach(tab => {
    tab.classList.remove('active');
  });
  document.querySelectorAll('.diary-content').forEach(content => {
    content.classList.remove('active');
  });
  
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
  document.getElementById(`diary-${tabName}`).classList.add('active');
  
  if (tabName === 'notes') {
    displayNotes();
  }
}

// Отображение заметок
function displayNotes() {
  const container = document.getElementById('notes-list');
  
  if (userNotes.length === 0) {
    container.innerHTML = `
      <div class="no-notes">
        <div class="no-notes-icon">📝</div>
        <h3>У вас пока нет заметок</h3>
        <p>Начните дегустировать вина и добавлять свои впечатления!</p>
        <button onclick="switchDiaryTab('add')" class="action-btn">Добавить первую заметку</button>
      </div>
    `;
    return;
  }
  
  container.innerHTML = userNotes.map(note => `
    <div class="note-card">
      <div class="note-header">
        <div class="note-wine">${note.wineName}</div>
        <div class="note-date">${note.date}</div>
      </div>
      <div class="note-rating">${'⭐'.repeat(note.rating)} (${note.rating}/5)</div>
      ${note.note ? `<div class="note-text">${note.note}</div>` : ''}
      ${note.occasion ? `<div class="note-occasion">Повод: ${note.occasion}</div>` : ''}
    </div>
  `).reverse().join('');
}

// Заполнение селекта вин
function populateWineSelect() {
  const select = document.getElementById('wine-select');
  select.innerHTML = '<option value="">-- Выберите вино --</option>' +
    wines.map(wine => `<option value="${wine.id}">${wine.name}</option>`).join('');
}

// Обновление отображения рейтинга
function updateRatingDisplay() {
  document.querySelectorAll('.star').forEach(star => {
    const rating = parseInt(star.dataset.rating);
    star.classList.toggle('active', rating <= selectedRating);
  });
  document.getElementById('rating').value = selectedRating;
}

// Сохранение заметки
function saveNote(e) {
  e.preventDefault();
  
  const wineId = parseInt(document.getElementById('wine-select').value);
  const rating = selectedRating;
  const noteText = document.getElementById('note-text').value;
  const occasion = document.getElementById('occasion').value;
  
  if (!wineId || !rating) {
    showToast('Пожалуйста, выберите вино и поставьте оценку', 'error');
    return;
  }
  
  const wine = wines.find(w => w.id === wineId);
  const newNote = {
    id: Date.now(),
    wineId: wineId,
    wineName: wine.name,
    rating: rating,
    note: noteText,
    occasion: occasion,
    date: new Date().toLocaleDateString('ru-RU')
  };
  
  userNotes.push(newNote);
  localStorage.setItem('goldenBalka_notes', JSON.stringify(userNotes));
  
  // Обновляем статистику
  userStats = calculateStats();
  localStorage.setItem('goldenBalka_stats', JSON.stringify(userStats));
  
  // Отправляем данные в бота
  tg.sendData(JSON.stringify({
    action: 'new_note',
    note: newNote,
    timestamp: Date.now()
  }));
  
  // Сбрасываем форму
  document.getElementById('note-form').reset();
  selectedRating = 0;
  updateRatingDisplay();
  
  showToast('Заметка сохранена!', 'success');
  switchDiaryTab('notes');
}

// Добавление заметки к конкретному вину
function addToNotes(wineId) {
  closeModal();
  switchToSection('diary');
  switchDiaryTab('add');
  document.getElementById('wine-select').value = wineId;
}

// Отображение статистики
function displayStats() {
  const container = document.getElementById('stats-content');
  
  if (userNotes.length === 0) {
    container.innerHTML = `
      <div class="no-stats">
        <div class="stats-icon">📊</div>
        <h3>Статистика появится после дегустаций</h3>
        <p>Добавьте первые заметки о винах, чтобы увидеть вашу статистику!</p>
      </div>
    `;
    return;
  }
  
  const stats = userStats;
  
  container.innerHTML = `
    <div class="stat-card">
      <div class="stat-number">${stats.totalTastings}</div>
      <div class="stat-label">Дегустаций проведено</div>
    </div>
    
    <div class="stat-card">
      <div class="stat-number">${stats.averageRating}</div>
      <div class="stat-label">Средняя оценка</div>
    </div>
    
    <div class="stat-card">
      <div class="stat-number">${stats.favoriteType}</div>
      <div class="stat-label">Любимый тип вина</div>
    </div>
    
    <div class="stat-card">
      <div class="stat-number">${stats.totalWinesInCatalog}</div>
      <div class="stat-label">Вин в каталоге</div>
    </div>
    
    ${Object.keys(stats.typeDistribution).length > 0 ? `
    <div class="stat-card full-width">
      <h3>Распределение по типам</h3>
      <div class="type-stats">
        ${Object.entries(stats.typeDistribution).map(([type, count]) => `
          <div class="type-stat">
            <span class="type-name">${type}</span>
            <span class="type-count">${count}</span>
          </div>
        `).join('')}
      </div>
    </div>
    ` : ''}
    
    ${stats.recentActivity.length > 0 ? `
    <div class="stat-card full-width">
      <h3>Последние дегустации</h3>
      <div class="recent-notes">
        ${stats.recentActivity.map(note => `
          <div class="recent-note">
            <strong>${note.wineName}</strong>
            <span>${'⭐'.repeat(note.rating)} • ${note.date}</span>
          </div>
        `).join('')}
      </div>
    </div>
    ` : ''}
  `;
}

// Показ уведомлений
function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type} show`;
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// Обработка данных от Telegram WebApp
tg.onEvent = function(eventType, eventData) {
  console.log('🔗 Telegram WebApp событие:', eventType, eventData);
};

// Инициализация при загрузке DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

console.log('🍷 Золотая Балка - мини-приложение загружено');