// --- IMPORTS ---
import { dbProfiles } from './data/profiles.js';
import { dbTournaments } from './data/tournaments.js';

// --- CONFIG ---
const CONFIG = {
    registerUrl: "https://google.com/search?q=registration_form"
};

const availableTags = ["No Toxic", "Tryhard", "Chill", "Mic On", "18+", "Funny", "Newbie", "Pro"];

// --- STATE ---
let isLoggedIn = false;
let isProfileCompleted = false; 
let currentIndex = 0;
let filteredProfiles = [...dbProfiles];
let myTags = [];
let myProfileData = { 
    name: "Player_One", 
    game: "CS2", 
    desc: "...", 
    img: "https://avatars.akamai.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg" 
};

// --- UTILS ---
function showToast(message, type = 'error') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = type === 'error' ? '<i class="fa-solid fa-circle-exclamation"></i>' : '<i class="fa-solid fa-circle-check"></i>';
    
    toast.innerHTML = `${icon} <span>${message}</span>`;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.5s forwards';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

// --- AUTH ---
function toggleAuth() {
    isLoggedIn = !isLoggedIn;
    updateInterface();
}

function updateInterface() {
    const landing = document.getElementById('public-landing');
    const app = document.getElementById('app-dashboard');
    const authBtn = document.getElementById('header-auth-btn');
    const nav = document.getElementById('header-nav');

    if (isLoggedIn) {
        landing.style.display = 'none';
        app.style.display = 'block'; // Стал Flex или Block
        nav.classList.remove('hidden'); 
        
        authBtn.innerHTML = '<i class="fa-solid fa-right-from-bracket"></i>';
        authBtn.style.background = '#e74c3c';
        authBtn.style.borderColor = '#e74c3c';
        authBtn.title = "Выйти";
        
        switchTab('home'); 
    } else {
        landing.style.display = 'block';
        app.style.display = 'none';
        nav.classList.add('hidden');
        
        authBtn.innerHTML = '<i class="fa-brands fa-steam"></i> Войти через Steam';
        authBtn.style.background = '#171a21';
        authBtn.style.borderColor = '#3a3d45';
        authBtn.removeAttribute('title');
    }
}

function redirectToReg() {
    window.location.href = CONFIG.registerUrl;
}

// --- NAVIGATION ---
function switchTab(tabName) {
    // Проверка анкеты для социальных вкладок
    const socialTabs = ['search', 'matches', 'likes'];
    
    if (socialTabs.includes(tabName) && !isProfileCompleted) {
        showToast("Сначала заполните анкету!", "error");
        switchTab('profile');
        return;
    }

    // Обновление навигации в Хедере
    document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
    
    // Если мы в подразделах поиска, подсвечиваем "Поиск" в шапке
    if(socialTabs.includes(tabName)) {
        document.getElementById('link-search').classList.add('active');
    } else if(document.getElementById(`link-${tabName}`)) {
        document.getElementById(`link-${tabName}`).classList.add('active');
    }

    // Смена экранов
    document.querySelectorAll('.app-view').forEach(el => el.classList.add('hidden'));
    document.getElementById(`view-${tabName}`).classList.remove('hidden');

    // Логика Сайдбаров
    const grid = document.getElementById('main-app-grid');
    const leftSidebar = document.getElementById('sidebar-left');
    const rightSidebar = document.getElementById('sidebar-right');
    
    if (socialTabs.includes(tabName)) {
        grid.classList.remove('full-width');
        leftSidebar.classList.remove('hidden');
        rightSidebar.classList.remove('hidden');
        
        // Подсветка меню в левом сайдбаре
        document.querySelectorAll('#sidebar-left .menu-item').forEach(el => el.classList.remove('active'));
        if(tabName === 'search') document.getElementById('menu-search').classList.add('active');
        if(tabName === 'matches') document.getElementById('menu-matches').classList.add('active');
        if(tabName === 'likes') document.getElementById('menu-likes').classList.add('active');

        if(tabName === 'search') renderCards();
    } else {
        grid.classList.add('full-width');
        leftSidebar.classList.add('hidden');
        rightSidebar.classList.add('hidden');
    }

    // Рендер контента в зависимости от вкладки
     if(tabName === 'home') renderDashboard();
    if(tabName === 'tournaments') renderTournaments();
    
    // Используем setTimeout, чтобы код выполнился ПОСЛЕ того, 
    // как браузер покажет div#view-profile
    if(tabName === 'profile') {
        setTimeout(() => {
            renderTagsEditor();
        }, 10);
    }
}

// --- HOME DASHBOARD ---
function renderDashboard() {
    const container = document.getElementById('view-home');
    if (!isProfileCompleted) {
        container.innerHTML = `
            <div class="dash-state-container">
                <h1 style="font-size: 2.5rem; margin-bottom: 10px;">Добро пожаловать!</h1>
                <p style="color: var(--text-muted); margin-bottom: 30px; font-size: 1.2rem;">Чтобы начать свайпать и искать тиммейтов, вам нужно создать свою карточку.</p>
                <button class="cta-btn" onclick="switchTab('profile')">Создать анкету <i class="fa-solid fa-arrow-right"></i></button>
            </div>
        `;
    } else {
        container.innerHTML = `
            <div class="dash-hero">
                <div>
                    <h1 style="margin-bottom: 10px;">С возвращением, ${myProfileData.name}!</h1>
                    <p style="color: var(--text-muted);">Ваша статистика за все время:</p>
                </div>
                <img src="${myProfileData.img}" style="width: 80px; height: 80px; border-radius: 50%; border: 2px solid var(--primary);">
            </div>
            <div class="dash-stats-grid">
                <div class="stat-card"><div class="stat-num">0</div><div class="stat-label">Лайков</div></div>
                <div class="stat-card"><div class="stat-num">0</div><div class="stat-label">Мэтчей</div></div>
                <div class="stat-card"><div class="stat-num">12</div><div class="stat-label">Просмотров</div></div>
            </div>
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid var(--border);">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h3 style="color: var(--text-main);">Ваша анкета в поиске</h3>
                    <p style="color: var(--text-muted); font-size: 0.9rem;">Так вас видят другие игроки</p>
                </div>
                <div class="preview-card-wrapper">
                    ${getCardHTML(myProfileData)}
                </div>
                <div style="text-align: center; margin-top: 30px;">
                    <button class="cta-btn" onclick="switchTab('search')">Перейти к поиску <i class="fa-solid fa-magnifying-glass"></i></button>
                    <button class="cta-btn outline" style="margin-left: 10px;" onclick="switchTab('profile')">Редактировать</button>
                </div>
            </div>
        `;
        // Убираем абсолютное позиционирование у превью карточки, чтобы она встала ровно
        const card = container.querySelector('.profile-card');
        if(card) { 
            card.style.position = 'relative'; 
            card.style.transform = 'none'; 
        }
    }
}

// --- TOURNAMENTS ---
function renderTournaments() {
    const list = document.getElementById('tourney-list-container');
    list.innerHTML = '';
    dbTournaments.forEach(t => {
        let icon = getGameIcon(t.game);
        list.innerHTML += `
            <div class="tourney-item full">
                <div style="display:flex; align-items:center; gap: 15px;">
                    <div style="font-size: 1.5rem; width: 40px; text-align: center;">${icon}</div>
                    <div class="tourney-meta">
                        <h3>${t.title}</h3>
                        <div style="color: var(--gold); font-weight: bold; font-size: 0.9rem;">Приз: ${t.prize}</div>
                    </div>
                </div>
                <div style="text-align: right;">
                    <span class="slots-badge">${t.slots}</span>
                    <button class="btn-full" style="margin-left: 10px;">Мест нет</button>
                </div>
            </div>
        `;
    });
}

// --- CARDS & SEARCH ---
function setFilter(game, el) {
    document.querySelectorAll('.filter-opt').forEach(e => e.classList.remove('selected'));
    el.classList.add('selected');
    currentIndex = 0;
    
    if(game === 'all') {
        filteredProfiles = [...dbProfiles];
    } else {
        filteredProfiles = dbProfiles.filter(p => p.game === game);
    }
    renderCards();
}

function renderCards() {
    const container = document.getElementById('card-container');
    container.innerHTML = '';
    
    // Циклическая прокрутка
    if (filteredProfiles.length > 0 && currentIndex >= filteredProfiles.length) {
        currentIndex = 0;
    }
    
    let nextIndex = currentIndex + 1;
    if (nextIndex >= filteredProfiles.length) nextIndex = 0;

    if (filteredProfiles.length > 0) {
        // Следующая карта (подложка)
        container.appendChild(createCardElement(filteredProfiles[nextIndex], 'next'));
        // Текущая карта (активная)
        container.appendChild(createCardElement(filteredProfiles[currentIndex], 'active'));
        
        const controls = document.createElement('div');
        controls.className = 'actions-floating';
        controls.innerHTML = `
            <button class="act-btn btn-pass" onclick="handleSwipe('left')"><i class="fa-solid fa-xmark"></i></button>
            <button class="act-btn btn-like" onclick="handleSwipe('right')"><i class="fa-solid fa-heart"></i></button>
        `;
        container.appendChild(controls);
    } else {
         container.innerHTML = `<div style="text-align:center; color:#555; padding-top:100px;"><h3>Никого не найдено :(</h3></div>`;
    }
}

function createCardElement(data, type) {
    const div = document.createElement('div');
    div.className = `profile-card ${type}`;
    if(type === 'active') div.id = 'active-card';
    div.innerHTML = getCardHTML(data);
    return div;
}

function getCardHTML(data) {
    let icon = getGameIcon(data.game);
    let tags = data.tags && data.tags.length > 0 ? data.tags : ["Newbie"]; 

    return `
        <img src="${data.img}" class="card-photo">
        <div class="card-content">
            <div class="user-name-large">${data.name}</div>
            <div style="color:#ccc; margin-bottom:10px;">${icon} ${data.game}</div>
            <div style="display:flex; gap:5px; margin-bottom:10px;">
                ${tags.map(t => `<span style="background:rgba(255,255,255,0.1); padding:2px 8px; border-radius:4px; font-size:0.8rem;">${t}</span>`).join('')}
            </div>
            <p style="color:#aaa; font-size:0.9rem;">"${data.desc}"</p>
        </div>
    `;
}

function getGameIcon(gameName) {
    if(gameName === 'CS2') return '<i class="fa-solid fa-crosshairs"></i>';
    if(gameName === 'Rust') return '<i class="fa-solid fa-radiation"></i>';
    if(gameName === 'Dota 2') return '<i class="fa-brands fa-d-and-d"></i>';
    if(gameName === 'Deadlock') return '<i class="fa-solid fa-ghost"></i>';
    return '<i class="fa-solid fa-gamepad"></i>';
}

function handleSwipe(dir) {
    const card = document.getElementById('active-card');
    if(!card) return;
    
    card.classList.add(dir === 'left' ? 'swipe-left' : 'swipe-right');
    
    // Имитация задержки перед показом следующей карты
    setTimeout(() => { 
        currentIndex++; 
        renderCards(); 
    }, 300);
}

// --- PROFILE EDITOR ---
function triggerPhotoUpload() {
    document.getElementById('photo-input').click();
}

function previewPhoto(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) { 
            document.getElementById('profile-preview').src = e.target.result;
            myProfileData.img = e.target.result; // Сохраняем в объект профиля
        }
        reader.readAsDataURL(input.files[0]);
    }
}

function renderTagsEditor() {
    const container = document.getElementById('tags-selector');
    if(!container) return; // Защита от ошибок, если элемент не найден
    
    container.innerHTML = '';
    availableTags.forEach(tag => {
        const isSelected = myTags.includes(tag);
        const el = document.createElement('div');
        el.className = `tag-option ${isSelected ? 'selected' : ''}`;
        el.innerText = tag;
        el.onclick = () => toggleTag(tag, el);
        container.appendChild(el);
    });
}

function toggleTag(tag, el) {
    if (myTags.includes(tag)) {
        myTags = myTags.filter(t => t !== tag);
        el.classList.remove('selected');
    } else {
        if(myTags.length >= 3) { 
            showToast("Максимум 3 тега!", "error"); 
            return; 
        }
        myTags.push(tag);
        el.classList.add('selected');
    }
}

function saveProfile() {
    const nick = document.getElementById('input-nick').value;
    const game = document.getElementById('input-game').value;
    const desc = document.getElementById('input-desc').value;

    if(myTags.length === 0) { 
        showToast("Выберите хотя бы 1 тег", "error"); 
        return; 
    }

    // Сохраняем данные
    myProfileData.name = nick;
    myProfileData.game = game;
    myProfileData.desc = desc;
    myProfileData.tags = myTags;

    const btn = document.getElementById('save-btn');
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Сохранение...';
    
    setTimeout(() => {
        isProfileCompleted = true;
        showToast("Анкета успешно создана!", "success");
        btn.innerHTML = 'Сохранить';
        
        // Переходим на главную
        switchTab('home');
    }, 800);
}

// --- EXPOSE TO WINDOW ---
// Обязательно делаем функции доступными для HTML onclick="..."
window.showToast = showToast;
window.toggleAuth = toggleAuth;
window.updateInterface = updateInterface;
window.redirectToReg = redirectToReg;
window.switchTab = switchTab;
window.setFilter = setFilter;
window.handleSwipe = handleSwipe;
window.triggerPhotoUpload = triggerPhotoUpload;
window.previewPhoto = previewPhoto;
window.saveProfile = saveProfile;
window.toggleTag = toggleTag;

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
    // Если нужно что-то инициализировать при старте
    console.log("App initialized");
});


