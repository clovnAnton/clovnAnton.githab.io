import { dbProfiles } from './data/profiles.js';
import { dbTournaments } from './data/tournaments.js';

const CONFIG = { registerUrl: "https://google.com/search?q=registration_form" };

const availableTags = [
    "No Toxic", "Tryhard", "Chill", "Mic On", "18+", "Funny", "Newbie", "Pro", 
    "Support", "Carry", "IGL", "Weekend Only", "Night Owl", "Streamer",
    "No Tilt", "Teamplay", "Voice Chat", "Discord", "Strategy", "Aggressive", "Passive",
    "Sniper", "Entry", "Lurker", "Tank", "Roamer", "Ranked", "Casual", "Grind", 
    "Coach", "Student", "Friendly"
];

// --- STATE ---
let isLoggedIn = false;
let isProfileCompleted = false; 
let profileQueue = []; // Случайная очередь
let filteredProfiles = [...dbProfiles];
let myTags = [];
let superLikeLogs = [];

let myProfileData = { 
    name: "Player_One", 
    gender: "Male",
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
    setTimeout(() => { toast.style.animation = 'fadeOut 0.5s forwards'; setTimeout(() => toast.remove(), 500); }, 3000);
}

// --- LANDING ---
function renderLandingProfiles() {
    const container = document.getElementById('landing-profiles-list');
    if(!container) return;
    
    // Берем 3 случайные анкеты
    const previewProfiles = dbProfiles.sort(() => 0.5 - Math.random()).slice(0, 3);
    
    container.innerHTML = '';
    previewProfiles.forEach(p => {
        let genderIcon = p.gender === 'Male' ? '<i class="fa-solid fa-mars" style="color:#3498db"></i>' : '<i class="fa-solid fa-venus" style="color:#e84393"></i>';
        
        container.innerHTML += `
            <div class="lobby-card" style="align-items: flex-start;">
                <div class="player-info" style="align-items: flex-start;">
                    <img src="${p.img}" class="avatar" style="width:60px; height:60px;">
                    <div>
                        <div style="font-weight: bold; font-size: 1.1rem;">${p.name} ${genderIcon}</div>
                        <span class="game-tag">${p.game}</span>
                        <p style="color:#aaa; font-size:0.85rem; margin-top:5px; max-width:300px; line-height: 1.3;">${p.desc}</p>
                    </div>
                </div>
                <button class="cta-btn outline" onclick="redirectToReg()">Connect</button>
            </div>
        `;
    });
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
        app.style.display = 'block'; 
        nav.classList.remove('hidden'); 
        
        authBtn.innerHTML = '<i class="fa-solid fa-right-from-bracket"></i>';
        authBtn.style.background = '#e74c3c';
        authBtn.style.borderColor = '#e74c3c';
        authBtn.title = "Log Out";
        
        // При входе сразу инициализируем случайную очередь
        profileQueue = [...dbProfiles].sort(() => Math.random() - 0.5);
        switchTab('home'); 
    } else {
        landing.style.display = 'block';
        app.style.display = 'none';
        nav.classList.add('hidden');
        
        authBtn.innerHTML = '<i class="fa-brands fa-steam"></i> Login with Steam';
        authBtn.style.background = '#171a21';
        authBtn.style.borderColor = '#3a3d45';
        authBtn.removeAttribute('title');
        
        renderLandingProfiles();
    }
}

function redirectToReg() { window.location.href = CONFIG.registerUrl; }

// --- NAVIGATION ---
function switchTab(tabName) {
    const socialTabs = ['search', 'matches', 'likes'];
    
    if (socialTabs.includes(tabName) && !isProfileCompleted) {
        showToast("Please fill out your profile first!", "error");
        switchTab('profile');
        return;
    }

    document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
    
    if(socialTabs.includes(tabName)) {
        document.getElementById('link-search').classList.add('active');
    } else if(document.getElementById(`link-${tabName}`)) {
        document.getElementById(`link-${tabName}`).classList.add('active');
    }

    document.querySelectorAll('.app-view').forEach(el => el.classList.add('hidden'));
    document.getElementById(`view-${tabName}`).classList.remove('hidden');

    const grid = document.getElementById('main-app-grid');
    const leftSidebar = document.getElementById('sidebar-left');
    const rightSidebar = document.getElementById('sidebar-right');
    
    if (socialTabs.includes(tabName)) {
        grid.classList.remove('full-width');
        leftSidebar.classList.remove('hidden');
        rightSidebar.classList.remove('hidden');
        
        document.querySelectorAll('#sidebar-left .menu-item').forEach(el => el.classList.remove('active'));
        if(tabName === 'search') {
            document.getElementById('menu-search').classList.add('active');
            renderCards();
        }
        if(tabName === 'matches') document.getElementById('menu-matches').classList.add('active');
        if(tabName === 'likes') document.getElementById('menu-likes').classList.add('active');
    } else {
        grid.classList.add('full-width');
        leftSidebar.classList.add('hidden');
        rightSidebar.classList.add('hidden');
    }

    if(tabName === 'home') renderDashboard();
    if(tabName === 'tournaments') renderTournaments();
    if(tabName === 'profile') setTimeout(() => renderTagsEditor(), 10);
}

// --- HOME DASHBOARD ---
function renderDashboard() {
    const container = document.getElementById('view-home');
    if (!isProfileCompleted) {
        container.innerHTML = `
            <div class="dash-state-container">
                <h1 style="font-size: 2.5rem; margin-bottom: 10px;">Welcome!</h1>
                <p style="color: var(--text-muted); margin-bottom: 30px; font-size: 1.2rem;">To start swiping and finding teammates, create your profile card.</p>
                <button class="cta-btn" onclick="switchTab('profile')">Create Profile <i class="fa-solid fa-arrow-right"></i></button>
            </div>
        `;
    } else {
        container.innerHTML = `
            <div class="dash-hero">
                <div>
                    <h1 style="margin-bottom: 10px;">Welcome back, ${myProfileData.name}!</h1>
                    <p style="color: var(--text-muted);">Your all-time stats:</p>
                </div>
                <img src="${myProfileData.img}" style="width: 80px; height: 80px; border-radius: 50%; border: 2px solid var(--primary);">
            </div>
            <div class="dash-stats-grid">
                <div class="stat-card"><div class="stat-num">0</div><div class="stat-label">Likes</div></div>
                <div class="stat-card"><div class="stat-num">0</div><div class="stat-label">Matches</div></div>
                <div class="stat-card"><div class="stat-num">12</div><div class="stat-label">Views</div></div>
            </div>
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid var(--border);">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h3 style="color: var(--text-main);">Your card in search</h3>
                    <p style="color: var(--text-muted); font-size: 0.9rem;">How others see you</p>
                </div>
                <div class="preview-card-wrapper">
                    ${getCardHTML(myProfileData)}
                </div>
                <div style="text-align: center; margin-top: 30px;">
                    <button class="cta-btn" onclick="switchTab('search')">Start Searching <i class="fa-solid fa-magnifying-glass"></i></button>
                    <button class="cta-btn outline" style="margin-left: 10px;" onclick="switchTab('profile')">Edit</button>
                </div>
            </div>
        `;
        const card = container.querySelector('.profile-card');
        if(card) { card.style.position = 'relative'; card.style.transform = 'none'; }
    }
}

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
                        <div style="color: var(--gold); font-weight: bold; font-size: 0.9rem;">Prize: ${t.prize}</div>
                    </div>
                </div>
                <div style="text-align: right;">
                    <span class="slots-badge">${t.slots}</span>
                    <button class="btn-full" style="margin-left: 10px;">Full</button>
                </div>
            </div>
        `;
    });
}

// --- CARDS & SEARCH (NEW LOGIC) ---
function setFilter(type, value, el) {
    if(type === 'game') {
        document.querySelectorAll('#filter-game .filter-opt').forEach(e => e.classList.remove('selected'));
    } else if(type === 'gender') {
        document.querySelectorAll('#filter-gender .filter-opt').forEach(e => e.classList.remove('selected'));
    }
    el.classList.add('selected');

    const activeGame = document.querySelector('#filter-game .selected')?.dataset.val || 'all';
    const activeGender = document.querySelector('#filter-gender .selected')?.dataset.val || 'all';

    filteredProfiles = dbProfiles.filter(p => {
        const gameMatch = activeGame === 'all' || p.game === activeGame;
        const genderMatch = activeGender === 'all' || p.gender === activeGender;
        return gameMatch && genderMatch;
    });

    profileQueue = [...filteredProfiles].sort(() => Math.random() - 0.5);
    renderCards();
}

function renderCards() {
    const container = document.getElementById('card-container');
    container.innerHTML = '';

    if (profileQueue.length === 0) {
        container.innerHTML = `<div style="text-align:center; color:#555; padding-top:100px;">
            <h3>No more profiles!</h3>
            <p>Change filters to see more.</p>
        </div>`;
        return;
    }

    const currentProfile = profileQueue[0];
    const nextProfile = profileQueue.length > 1 ? profileQueue[1] : null;

    if (nextProfile) container.appendChild(createCardElement(nextProfile, 'next'));
    container.appendChild(createCardElement(currentProfile, 'active'));
    
    const controls = document.createElement('div');
    controls.className = 'actions-floating';
    controls.innerHTML = `
        <button class="act-btn btn-pass" onclick="handleSwipe('left')"><i class="fa-solid fa-xmark"></i></button>
        <button class="act-btn btn-super" onclick="openSuperLikeModal()"><i class="fa-solid fa-star"></i></button>
        <button class="act-btn btn-like" onclick="handleSwipe('right')"><i class="fa-solid fa-heart"></i></button>
    `;
    container.appendChild(controls);
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

    let genderIcon = '';
    if (data.gender === 'Male') genderIcon = '<i class="fa-solid fa-mars" style="color: #3498db; margin-left: 8px;" title="Male"></i>';
    else if (data.gender === 'Female') genderIcon = '<i class="fa-solid fa-venus" style="color: #e84393; margin-left: 8px;" title="Female"></i>';

    return `
        <img src="${data.img}" class="card-photo">
        <div class="card-content">
            <div class="user-name-large">${data.name} ${genderIcon}</div>
            <div style="color:#ccc; margin-bottom:10px;">${icon} ${data.game}</div>
            <div style="display:flex; gap:5px; margin-bottom:10px;">
                ${tags.map(t => `<span style="background:rgba(255,255,255,0.1); padding:2px 8px; border-radius:4px; font-size:0.8rem;">${t}</span>`).join('')}
            </div>
            <p style="color:#aaa; font-size:0.9rem;">"${data.desc}"</p>
        </















