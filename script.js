// Основные переменные игры
let clickCount = 0;
let clicksPerSecond = 0;
let achievements = [];
let upgrades = {
    autoClicker: { owned: false, cost: 50, cps: 1 },
    megaClick: { owned: false, cost: 100, multiplier: 2 },
    clickFactory: { owned: false, cost: 500, cps: 5 }
};
let cps = 0;
let lastSaveTime = Date.now();

// Ачивки с условиями и описаниями
const achievementList = [
    { id: 1, name: "Знакомство с Данилом", description: "Сделать первый клик", icon: "👋", condition: 1, unlocked: false },
    { id: 2, name: "Новичок", description: "10 кликов", icon: "🐣", condition: 10, unlocked: false },
    { id: 3, name: "Любитель Данила", description: "50 кликов", icon: "👍", condition: 50, unlocked: false },
    { id: 4, name: "Фанат", description: "100 кликов", icon: "🔥", condition: 100, unlocked: false },
    { id: 5, name: "Даниломан", description: "250 кликов", icon: "😍", condition: 250, unlocked: false },
    { id: 6, name: "Зависимый", description: "500 кликов", icon: "🤪", condition: 500, unlocked: false },
    { id: 7, name: "Маньяк", description: "1000 кликов", icon: "😈", condition: 1000, unlocked: false },
    { id: 8, name: "Легенда", description: "2500 кликов", icon: "👑", condition: 2500, unlocked: false },
    { id: 9, name: "Бог кликера", description: "5000 кликов", icon: "💫", condition: 5000, unlocked: false },
    { id: 10, name: "Автокликер", description: "Купить автокликер", icon: "⚙️", condition: null, type: "upgrade", upgrade: "autoClicker", unlocked: false },
    { id: 11, name: "Мега-сила", description: "Купить мега-клик", icon: "💪", condition: null, type: "upgrade", upgrade: "megaClick", unlocked: false },
    { id: 12, name: "Фабрика кликов", description: "Купить фабрику кликов", icon: "🏭", condition: null, type: "upgrade", upgrade: "clickFactory", unlocked: false },
    { id: 13, name: "Скорость 10 CPS", description: "Достичь 10 кликов в секунду", icon: "🚀", condition: 10, type: "cps", unlocked: false },
    { id: 14, name: "Скорость 25 CPS", description: "Достичь 25 кликов в секунду", icon: "⚡", condition: 25, type: "cps", unlocked: false },
    { id: 15, name: "Мастер всех улучшений", description: "Купить все улучшения", icon: "🏆", condition: null, type: "allUpgrades", unlocked: false }
];

// Инициализация игры
function initGame() {
    loadGame();
    setupEventListeners();
    renderAchievements();
    updateUI();
    startGameLoop();
    setupImageUpload();
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Клик по Данилу
    const danilImage = document.getElementById('danilImage');
    danilImage.addEventListener('click', handleClick);
    
    // Клик по пробелу
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            handleClick();
            danilImage.classList.add('active');
            setTimeout(() => danilImage.classList.remove('active'), 100);
        }
    });
    
    // Кнопки улучшений
    document.querySelectorAll('.upgrade-btn').forEach(button => {
        button.addEventListener('click', function() {
            const upgradeId = this.closest('.upgrade').id;
            buyUpgrade(upgradeId);
        });
    });
    
    // Кнопки управления
    document.getElementById('saveBtn').addEventListener('click', saveGame);
    document.getElementById('resetBtn').addEventListener('click', resetGame);
    document.getElementById('importImageBtn').addEventListener('click', () => {
        document.getElementById('imageUpload').click();
    });
}

// Обработка клика
function handleClick() {
    const clickPower = upgrades.megaClick.owned ? 2 : 1;
    clickCount += clickPower;
    
    // Создаем эффект "+1" или "+2"
    const clickEffect = document.getElementById('clickEffect');
    clickEffect.textContent = `+${clickPower}`;
    clickEffect.style.left = `${Math.random() * 70 + 15}%`;
    clickEffect.style.top = `${Math.random() * 70 + 15}%`;
    
    // Анимация
    clickEffect.style.animation = 'none';
    setTimeout(() => {
        clickEffect.style.animation = 'floatUp 1s ease-out forwards';
    }, 10);
    
    // Звук клика (если есть файл)
    try {
        document.getElementById('clickSound').currentTime = 0;
        document.getElementById('clickSound').play();
    } catch(e) {}
    
    updateUI();
    checkAchievements();
}

// Покупка улучшения
function buyUpgrade(upgradeId) {
    const upgrade = upgrades[upgradeId];
    
    if (clickCount >= upgrade.cost && !upgrade.owned) {
        clickCount -= upgrade.cost;
        upgrade.owned = true;
        
        // Обновляем CPS
        if (upgrade.cps) {
            cps += upgrade.cps;
        }
        
        // Обновляем кнопку
        const button = document.querySelector(`#${upgradeId} .upgrade-btn`);
        button.disabled = true;
        button.textContent = 'Куплено!';
        button.style.background = 'linear-gradient(135deg, #ffd700, #ff8c00)';
        
        updateUI();
        checkAchievements();
        saveGame();
        
        // Уведомление
        showNotification(`Улучшение "${getUpgradeName(upgradeId)}" куплено!`);
    }
}

// Получить название улучшения
function getUpgradeName(id) {
    const names = {
        autoClicker: "Автокликер",
        megaClick: "Мега-клик",
        clickFactory: "Фабрика кликов"
    };
    return names[id] || id;
}

// Проверка ачивок
function checkAchievements() {
    let newAchievements = 0;
    
    achievementList.forEach(ach => {
        if (ach.unlocked) return;
        
        let conditionMet = false;
        
        if (ach.type === 'upgrade') {
            conditionMet = upgrades[ach.upgrade].owned;
        } else if (ach.type === 'cps') {
            conditionMet = cps >= ach.condition;
        } else if (ach.type === 'allUpgrades') {
            conditionMet = Object.values(upgrades).every(u => u.owned);
        } else {
            conditionMet = clickCount >= ach.condition;
        }
        
        if (conditionMet) {
            ach.unlocked = true;
            newAchievements++;
            unlockAchievement(ach);
        }
    });
    
    if (newAchievements > 0) {
        updateAchievementCount();
    }
}

// Разблокировка ачивки
function unlockAchievement(achievement) {
    // Показываем попап
    const popup = document.getElementById('achievementPopup');
    const popupText = document.getElementById('popupText');
    
    popupText.textContent = `${achievement.name}: ${achievement.description}`;
    popup.classList.add('show');
    
    // Звук ачивки (если есть файл)
    try {
        document.getElementById('achievementSound').currentTime = 0;
        document.getElementById('achievementSound').play();
    } catch(e) {}
    
    // Скрываем попап через 3 секунды
    setTimeout(() => {
        popup.classList.remove('show');
    }, 3000);
    
    // Обновляем отображение ачивки
    renderAchievements();
}

// Обновление интерфейса
function updateUI() {
    // Обновляем счетчики
    document.getElementById('clickCount').textContent = formatNumber(clickCount);
    document.getElementById('cps').textContent = cps.toFixed(1);
    
    // Обновляем кнопки улучшений
    for (const [id, upgrade] of Object.entries(upgrades)) {
        const button = document.querySelector(`#${id} .upgrade-btn`);
        if (button && !upgrade.owned) {
            button.disabled = clickCount < upgrade.cost;
            button.innerHTML = `Купить за ${formatNumber(upgrade.cost)} кликов`;
        }
    }
}

// Форматирование больших чисел
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
}

// Отрисовка ачивок
function renderAchievements() {
    const grid = document.getElementById('achievementsGrid');
    grid.innerHTML = '';
    
    achievementList.forEach(ach => {
        const achievement = document.createElement('div');
        achievement.className = `achievement ${ach.unlocked ? 'unlocked' : ''}`;
        
        let progress = 0;
        if (ach.type === 'upgrade') {
            progress = upgrades[ach.upgrade].owned ? 100 : 0;
        } else if (ach.type === 'cps') {
            progress = Math.min((cps / ach.condition) * 100, 100);
        } else if (ach.type === 'allUpgrades') {
            const owned = Object.values(upgrades).filter(u => u.owned).length;
            progress = (owned / Object.keys(upgrades).length) * 100;
        } else {
            progress = Math.min((clickCount / ach.condition) * 100, 100);
        }
        
        achievement.innerHTML = `
            <div class="achievement-icon">${ach.icon}</div>
            <div class="achievement-info">
                <h4>${ach.name}</h4>
                <p>${ach.description}</p>
                <div class="achievement-progress">
                    <div class="progress-bar" style="width: ${progress}%"></div>
                </div>
            </div>
        `;
        
        grid.appendChild(achievement);
    });
    
    updateAchievementCount();
}

// Обновление счетчика ачивок
function updateAchievementCount() {
    const unlocked = achievementList.filter(a => a.unlocked).length;
    document.getElementById('achievementCount').textContent = `${unlocked}/${achievementList.length}`;
}

// Игровой цикл (автокликеры)
function startGameLoop() {
    setInterval(() => {
        if (cps > 0) {
            const clickPower = upgrades.megaClick.owned ? 2 : 1;
            clickCount += cps * clickPower;
            updateUI();
            checkAchievements();
        }
    }, 1000);
    
    // Автосохранение каждые 30 секунд
    setInterval(saveGame, 30000);
}

// Сохранение игры
function saveGame() {
    const saveData = {
        clickCount,
        achievements: achievementList.map(a => ({ id: a.id, unlocked: a.unlocked })),
        upgrades,
        cps,
        saveTime: Date.now()
    };
    
    localStorage.setItem('danilclicker_save', JSON.stringify(saveData));
    
    // Визуальная обратная связь
    const saveBtn = document.getElementById('saveBtn');
    const originalText = saveBtn.innerHTML;
    saveBtn.innerHTML = '<i class="fas fa-check"></i> Сохранено!';
    saveBtn.style.background = 'linear-gradient(135deg, #00ff88, #00cc66)';
    
    setTimeout(() => {
        saveBtn.innerHTML = originalText;
        saveBtn.style.background = 'linear-gradient(135deg, #2575fc, #6a11cb)';
    }, 2000);
}

// Загрузка игры
function loadGame() {
    const saved = localStorage.getItem('danilclicker_save');
    if (saved) {
        try {
            const saveData = JSON.parse(saved);
            
            clickCount = saveData.clickCount || 0;
            cps = saveData.cps || 0;
            
            // Загружаем улучшения
            if (saveData.upgrades) {
                Object.keys(upgrades).forEach(key => {
                    if (saveData.upgrades[key]) {
                        upgrades[key] = { ...upgrades[key], ...saveData.upgrades[key] };
                    }
                });
            }
            
            // Загружаем ачивки
            if (saveData.achievements) {
                saveData.achievements.forEach(savedAch => {
                    const ach = achievementList.find(a => a.id === savedAch.id);
                    if (ach) {
                        ach.unlocked = savedAch.unlocked;
                    }
                });
            }
            
            // Восстанавливаем время
            if (saveData.saveTime) {
                const timePassed = Date.now() - saveData.saveTime;
                const secondsPassed = Math.floor(timePassed / 1000);
                clickCount += cps * secondsPassed;
            }
            
            showNotification('Игра загружена!');
        } catch(e) {
            console.error('Ошибка загрузки:', e);
        }
    }
}

// Сброс игры
function resetGame() {
    if (confirm('Вы уверены? Весь прогресс будет потерян!')) {
        localStorage.removeItem('danilclicker_save');
        
        clickCount = 0;
        cps = 0;
        
        // Сбрасываем улучшения
        Object.keys(upgrades).forEach(key => {
            upgrades[key].owned = false;
        });
        
        // Сбрасываем ачивки
        achievementList.forEach(ach => {
            ach.unlocked = false;
        });
        
        updateUI();
        renderAchievements();
        
        // Сбрасываем кнопки улучшений
        document.querySelectorAll('.upgrade-btn').forEach(button => {
            button.disabled = false;
            button.textContent = `Купить за ${button.dataset.cost} кликов`;
            button.style.background = 'linear-gradient(135deg, #00ff88, #00cc66)';
        });
        
        showNotification('Игра сброшена!');
    }
}

// Загрузка изображения
function setupImageUpload() {
    const uploadInput = document.getElementById('imageUpload');
    const danilImage = document.getElementById('danilImage');
    
    uploadInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            
            reader.onload = function(event) {
                // Сохраняем в localStorage
                localStorage.setItem('danilclicker_image', event.target.result);
                
                // Устанавливаем как фон
                updateDanilImage();
                
                showNotification('Фото Данила загружено!');
            };
            
            reader.readAsDataURL(file);
        }
    });
    
    // Проверяем, есть ли сохраненное изображение
    updateDanilImage();
}

// Обновление изображения Данила
function updateDanilImage() {
    const danilImage = document.getElementById('danilImage');
    const savedImage = localStorage.getItem('danilclicker_image');
    
    if (savedImage) {
        danilImage.innerHTML = `<img src="${savedImage}" alt="Данил">`;
    }
}

// Показать уведомление
function showNotification(message) {
    // Создаем временное уведомление
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #ffd700, #ff8c00);
        color: black;
        padding: 15px 25px;
        border-radius: 10px;
        font-weight: bold;
        z-index: 1001;
        animation: slideIn 0.3s ease-out;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out forwards';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Стили для анимаций уведомлений
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Запуск игры при загрузке страницы
document.addEventListener('DOMContentLoaded', initGame);
