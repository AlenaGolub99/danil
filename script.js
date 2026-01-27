// ===== КОНСТАНТЫ И ПЕРЕМЕННЫЕ =====
const GAME_VERSION = '2.0';
let clickCount = 0;
let clicksPerSecond = 0;
let clickPower = 1;
let autoClickers = 0;
let comboCount = 0;
let comboMultiplier = 1;
let comboTimeout = null;
let comboEndTime = 0;
let soundEnabled = true;

// Улучшения
let upgrades = {
    autoClicker: { purchased: false, cost: 50, cps: 1 },
    megaClick: { purchased: false, cost: 100, multiplier: 2 },
    clickFactory: { purchased: false, cost: 500, cps: 5 }
};

// Ачивки
const ACHIEVEMENTS = [
    { id: 1, name: "Первый клик", description: "Сделать первый клик", icon: "👋", condition: 1, type: "clicks", unlocked: false },
    { id: 2, name: "Новичок", description: "10 кликов", icon: "🐣", condition: 10, type: "clicks", unlocked: false },
    { id: 3, name: "Любитель", description: "50 кликов", icon: "👍", condition: 50, type: "clicks", unlocked: false },
    { id: 4, name: "Фанат", description: "100 кликов", icon: "🤝", condition: 100, type: "clicks", unlocked: false },
    { id: 5, name: "Поклонник", description: "250 кликов", icon: "🔥", condition: 250, type: "clicks", unlocked: false },
    { id: 6, name: "Суперфанат", description: "500 кликов", icon: "😍", condition: 500, type: "clicks", unlocked: false },
    { id: 7, name: "Одержимый", description: "1000 кликов", icon: "🤪", condition: 1000, type: "clicks", unlocked: false },
    { id: 8, name: "Легенда", description: "2500 кликов", icon: "👑", condition: 2500, type: "clicks", unlocked: false },
    { id: 9, name: "Бог кликера", description: "5000 кликов", icon: "💫", condition: 5000, type: "clicks", unlocked: false },
    { id: 10, name: "Автоматизатор", description: "Купить автокликер", icon: "⚙️", condition: "autoClicker", type: "upgrade", unlocked: false },
    { id: 11, name: "Силач", description: "Купить мега-клик", icon: "💪", condition: "megaClick", type: "upgrade", unlocked: false },
    { id: 12, name: "Индустриалист", description: "Купить фабрику кликов", icon: "🏭", condition: "clickFactory", type: "upgrade", unlocked: false },
    { id: 13, name: "Скорость звука", description: "Достичь 10 CPS", icon: "🚀", condition: 10, type: "cps", unlocked: false },
    { id: 14, name: "Сверхзвуковой", description: "Достичь 25 CPS", icon: "⚡", condition: 25, type: "cps", unlocked: false },
    { id: 15, name: "Мастер улучшений", description: "Купить все улучшения", icon: "🎓", condition: "all", type: "allUpgrades", unlocked: false }
];

// ===== ИНИЦИАЛИЗАЦИЯ ИГРЫ =====
function initGame() {
    console.log('ДанилКликер запущен!');
    
    loadGame();
    setupEventListeners();
    loadImage();
    renderAchievements();
    updateUI();
    startGameLoop();
    
    // Проверяем ачивки при запуске
    checkAchievements();
}

// ===== ЗАГРУЗКА ИЗОБРАЖЕНИЯ =====
function loadImage() {
    const danilImage = document.getElementById('danilImage');
    const savedImage = localStorage.getItem('danilclicker_custom_image');
    
    // Сначала пробуем загрузить пользовательское фото
    if (savedImage) {
        danilImage.innerHTML = `
            <img src="${savedImage}" alt="Данил" id="danilPhoto">
            <div class="click-effect" id="clickEffect">+1</div>
        `;
        console.log('Загружено пользовательское фото');
        return;
    }
    
    // Пробуем загрузить danil.png
    const img = new Image();
    
    img.onload = function() {
        console.log('Фото Данила загружено успешно');
        danilImage.innerHTML = `
            <img src="danil.png" alt="Данил" id="danilPhoto">
            <div class="click-effect" id="clickEffect">+1</div>
        `;
    };
    
    img.onerror = function() {
        console.log('Фото danil.png не найдено, показываю заглушку');
        // Оставляем заглушку, которая уже есть в HTML
    };
    
    img.src = 'danil.png';
}

// ===== НАСТРОЙКА СОБЫТИЙ =====
function setupEventListeners() {
    // Клик по Данилу
    const danilImage = document.getElementById('danilImage');
    danilImage.addEventListener('click', handleClick);
    
    // Клик по пробелу
    document.addEventListener('keydown', function(e) {
        if (e.code === 'Space') {
            e.preventDefault();
            handleClick();
            simulateClickEffect();
        }
    });
    
    // Кнопки улучшений
    document.querySelectorAll('.upgrade-btn').forEach(button => {
        button.addEventListener('click', function() {
            const upgradeId = this.closest('.upgrade-card').id;
            buyUpgrade(upgradeId);
        });
    });
    
    // Кнопки управления
    document.getElementById('saveBtn').addEventListener('click', saveGame);
    document.getElementById('resetBtn').addEventListener('click', resetGame);
    document.getElementById('soundToggle').addEventListener('click', toggleSound);
    document.getElementById('helpBtn').addEventListener('click', showHelp);
    document.getElementById('closeHelp').addEventListener('click', hideHelp);
    
    // Загрузка изображения
    document.getElementById('importImageBtn').addEventListener('click', function() {
        document.getElementById('imageUpload').click();
    });
    
    document.getElementById('imageUpload').addEventListener('change', handleImageUpload);
    
    // Клик по фону для закрытия попапа помощи
    document.getElementById('helpPopup').addEventListener('click', function(e) {
        if (e.target.id === 'helpPopup') hideHelp();
    });
}

function simulateClickEffect() {
    const danilImage = document.getElementById('danilImage');
    danilImage.classList.add('active');
    setTimeout(() => danilImage.classList.remove('active'), 100);
}

// ===== ОБРАБОТКА КЛИКА =====
function handleClick() {
    console.log('Клик зарегистрирован!');
    
    // Рассчитываем количество кликов с учетом комбо
    const clicksToAdd = clickPower * comboMultiplier;
    clickCount += clicksToAdd;
    
    // Показываем эффект клика
    showClickEffect(clicksToAdd);
    
    // Обновляем комбо
    updateCombo();
    
    // Воспроизводим звук
    if (soundEnabled) {
        playSound('click');
    }
    
    // Обновляем интерфейс
    updateUI();
    
    // Проверяем ачивки
    checkAchievements();
    
    // Сохраняем игру
    saveGame();
}

function showClickEffect(amount) {
    const clickEffect = document.getElementById('clickEffect');
    if (!clickEffect) return;
    
    // Позиционируем эффект в случайном месте
    const x = Math.random() * 70 + 15;
    const y = Math.random() * 70 + 15;
    
    clickEffect.textContent = `+${amount}`;
    clickEffect.style.left = `${x}%`;
    clickEffect.style.top = `${y}%`;
    
    // Запускаем анимацию
    clickEffect.style.animation = 'none';
    setTimeout(() => {
        clickEffect.style.animation = 'floatUp 1s ease-out forwards';
    }, 10);
}

// ===== СИСТЕМА КОМБО =====
function updateCombo() {
    const now = Date.now();
    
    if (comboTimeout) {
        clearTimeout(comboTimeout);
        comboCount++;
    } else {
        comboCount = 1;
    }
    
    // Обновляем множитель
    if (comboCount >= 10) comboMultiplier = 3;
    else if (comboCount >= 5) comboMultiplier = 2;
    else comboMultiplier = 1;
    
    // Обновляем таймер комбо
    comboEndTime = now + 2000;
    updateComboTimer();
    
    // Запускаем таймер сброса комбо
    comboTimeout = setTimeout(() => {
        comboCount = 0;
        comboMultiplier = 1;
        updateComboDisplay();
    }, 2000);
    
    updateComboDisplay();
}

function updateComboTimer() {
    const timerFill = document.getElementById('comboTimer');
    if (!timerFill) return;
    
    const now = Date.now();
    const timeLeft = comboEndTime - now;
    const percentage = Math.max(0, (timeLeft / 2000) * 100);
    
    timerFill.style.width = `${percentage}%`;
    
    if (timeLeft > 0) {
        requestAnimationFrame(updateComboTimer);
    }
}

function updateComboDisplay() {
    const comboCountElement = document.getElementById('comboCount');
    if (comboCountElement) {
        comboCountElement.textContent = comboCount;
    }
    
    const comboDisplay = document.querySelector('.combo-display');
    if (comboDisplay) {
        if (comboCount > 1) {
            comboDisplay.style.borderColor = getComboColor();
            comboDisplay.style.boxShadow = `0 0 20px ${getComboColor()}80`;
        } else {
            comboDisplay.style.borderColor = '';
            comboDisplay.style.boxShadow = '';
        }
    }
}

function getComboColor() {
    if (comboCount >= 10) return '#ff00ff';
    if (comboCount >= 5) return '#00ff00';
    return '#06d6a0';
}

// ===== УЛУЧШЕНИЯ =====
function buyUpgrade(upgradeId) {
    const upgrade = upgrades[upgradeId];
    
    if (clickCount >= upgrade.cost && !upgrade.purchased) {
        clickCount -= upgrade.cost;
        upgrade.purchased = true;
        
        // Применяем эффект улучшения
        if (upgradeId === 'megaClick') {
            clickPower *= upgrade.multiplier;
        } else if (upgrade.cps) {
            clicksPerSecond += upgrade.cps;
            autoClickers += upgrade.cps;
        }
        
        // Обновляем кнопку
        const button = document.querySelector(`#${upgradeId} .upgrade-btn`);
        if (button) {
            button.disabled = true;
            button.innerHTML = `
                <span class="cost">✓</span>
                <span class="btn-text">КУПЛЕНО</span>
            `;
            button.style.background = 'linear-gradient(135deg, #666, #888)';
        }
        
        // Воспроизводим звук
        if (soundEnabled) {
            playSound('achievement');
        }
        
        // Показываем уведомление
        showNotification(`Улучшение "${getUpgradeName(upgradeId)}" куплено!`);
        
        // Обновляем интерфейс и сохраняем
        updateUI();
        checkAchievements();
        saveGame();
    }
}

function getUpgradeName(id) {
    const names = {
        autoClicker: "Автокликер",
        megaClick: "Мега-клик",
        clickFactory: "Фабрика кликов"
    };
    return names[id] || id;
}

// ===== АЧИВКИ =====
function checkAchievements() {
    let newAchievements = false;
    
    ACHIEVEMENTS.forEach(ach => {
        if (ach.unlocked) return;
        
        let conditionMet = false;
        
        switch (ach.type) {
            case 'clicks':
                conditionMet = clickCount >= ach.condition;
                break;
            case 'upgrade':
                conditionMet = upgrades[ach.condition].purchased;
                break;
            case 'cps':
                conditionMet = clicksPerSecond >= ach.condition;
                break;
            case 'allUpgrades':
                conditionMet = Object.values(upgrades).every(u => u.purchased);
                break;
        }
        
        if (conditionMet) {
            ach.unlocked = true;
            newAchievements = true;
            unlockAchievement(ach);
        }
    });
    
    if (newAchievements) {
        updateAchievementDisplay();
    }
}

function unlockAchievement(achievement) {
    // Показываем попап
    const popup = document.getElementById('achievementPopup');
    const unlockedCount = ACHIEVEMENTS.filter(a => a.unlocked).length;
    
    document.getElementById('popupTitle').textContent = achievement.name;
    document.getElementById('popupDesc').textContent = achievement.description;
    document.getElementById('popupCount').textContent = unlockedCount;
    
    popup.classList.add('show');
    
    // Воспроизводим звук
    if (soundEnabled) {
        playSound('achievement');
    }
    
    // Скрываем попап через 4 секунды
    setTimeout(() => {
        popup.classList.remove('show');
    }, 4000);
    
    // Обновляем отображение ачивок
    renderAchievements();
}

function renderAchievements() {
    const grid = document.getElementById('achievementsGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    const unlockedCount = ACHIEVEMENTS.filter(a => a.unlocked).length;
    const totalCount = ACHIEVEMENTS.length;
    const progress = Math.round((unlockedCount / totalCount) * 100);
    
    // Обновляем прогресс-бар
    const achievementBar = document.getElementById('achievementBar');
    const achievementText = document.getElementById('achievementText');
    if (achievementBar) achievementBar.style.width = `${progress}%`;
    if (achievementText) achievementText.textContent = `${progress}%`;
    
    ACHIEVEMENTS.forEach(ach => {
        const card = document.createElement('div');
        card.className = `achievement-card ${ach.unlocked ? 'unlocked' : ''}`;
        
        // Рассчитываем прогресс для незаблокированных ачивок
        let progressPercent = 0;
        if (!ach.unlocked) {
            switch (ach.type) {
                case 'clicks':
                    progressPercent = Math.min((clickCount / ach.condition) * 100, 100);
                    break;
                case 'cps':
                    progressPercent = Math.min((clicksPerSecond / ach.condition) * 100, 100);
                    break;
                case 'upgrade':
                    progressPercent = upgrades[ach.condition].purchased ? 100 : 0;
                    break;
                case 'allUpgrades':
                    const purchasedCount = Object.values(upgrades).filter(u => u.purchased).length;
                    progressPercent = (purchasedCount / Object.keys(upgrades).length) * 100;
                    break;
            }
        }
        
        card.innerHTML = `
            <div class="achievement-icon">${ach.icon}</div>
            <div class="achievement-info">
                <h4>${ach.name}</h4>
                <p>${ach.description}</p>
                ${!ach.unlocked ? `
                    <div class="achievement-progress">
                        <div class="achievement-bar">
                            <div class="achievement-fill" style="width: ${progressPercent}%"></div>
                        </div>
                        <div class="achievement-percent">${Math.round(progressPercent)}%</div>
                    </div>
                ` : ''}
            </div>
        `;
        
        grid.appendChild(card);
    });
    
    updateAchievementDisplay();
}

function updateAchievementDisplay() {
    const unlockedCount = ACHIEVEMENTS.filter(a => a.unlocked).length;
    const totalCount = ACHIEVEMENTS.length;
    const progress = Math.round((unlockedCount / totalCount) * 100);
    
    const achievementCount = document.getElementById('achievementCount');
    const achievementProgress = document.getElementById('achievementProgress');
    
    if (achievementCount) achievementCount.textContent = `${unlockedCount}/${totalCount}`;
    if (achievementProgress) achievementProgress.textContent = `${progress}%`;
}

// ===== ЗВУКИ =====
function playSound(soundType) {
    if (!soundEnabled) return;
    
    const audio = document.getElementById(`${soundType}Sound`);
    if (audio) {
        audio.currentTime = 0;
        audio.play().catch(e => {
            console.log(`Не удалось воспроизвести звук: ${e}`);
        });
    }
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    const button = document.getElementById('soundToggle');
    const icon = button.querySelector('i');
    const text = button.querySelector('span');
    
    if (soundEnabled) {
        icon.className = 'fas fa-volume-up';
        text.textContent = 'ЗВУК ВКЛ';
        showNotification('Звук включен');
    } else {
        icon.className = 'fas fa-volume-mute';
        text.textContent = 'ЗВУК ВЫКЛ';
        showNotification('Звук выключен');
    }
    
    saveGame();
}

// ===== ЗАГРУЗКА ИЗОБРАЖЕНИЯ =====
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Проверяем тип файла
    if (!file.type.match('image.*')) {
        showNotification('Пожалуйста, выберите изображение!');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        // Сохраняем изображение
        localStorage.setItem('danilclicker_custom_image', e.target.result);
        
        // Обновляем отображение
        const danilImage = document.getElementById('danilImage');
        danilImage.innerHTML = `
            <img src="${e.target.result}" alt="Данил" id="danilPhoto">
            <div class="click-effect" id="clickEffect">+1</div>
        `;
        
        showNotification('Фото Данила обновлено!');
        saveGame();
    };
    
    reader.readAsDataURL(file);
    
    // Сбрасываем input
    event.target.value = '';
}

// ===== СОХРАНЕНИЕ/ЗАГРУЗКА =====
function saveGame() {
    const saveData = {
        version: GAME_VERSION,
        clickCount,
        clicksPerSecond,
        clickPower,
        autoClickers,
        upgrades,
        achievements: ACHIEVEMENTS.map(a => ({ id: a.id, unlocked: a.unlocked })),
        soundEnabled,
        saveTime: Date.now()
    };
    
    localStorage.setItem('danilclicker_save', JSON.stringify(saveData));
    
    // Показываем визуальную обратную связь
    const saveBtn = document.getElementById('saveBtn');
    const originalHTML = saveBtn.innerHTML;
    
    saveBtn.innerHTML = `
        <i class="fas fa-check"></i>
        <span>СОХРАНЕНО!</span>
        <span class="btn-hint">✓ Прогресс сохранен</span>
    `;
    
    setTimeout(() => {
        saveBtn.innerHTML = originalHTML;
    }, 2000);
}

function loadGame() {
    const saved = localStorage.getItem('danilclicker_save');
    if (!saved) return;
    
    try {
        const saveData = JSON.parse(saved);
        
        // Загружаем основные данные
        clickCount = saveData.clickCount || 0;
        clicksPerSecond = saveData.clicksPerSecond || 0;
        clickPower = saveData.clickPower || 1;
        autoClickers = saveData.autoClickers || 0;
        soundEnabled = saveData.soundEnabled !== undefined ? saveData.soundEnabled : true;
        
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
                const ach = ACHIEVEMENTS.find(a => a.id === savedAch.id);
                if (ach) {
                    ach.unlocked = savedAch.unlocked;
                }
            });
        }
        
        // Восстанавливаем время
        if (saveData.saveTime) {
            const timePassed = Date.now() - saveData.saveTime;
            const secondsPassed = Math.floor(timePassed / 1000);
            clickCount += clicksPerSecond * secondsPassed;
        }
        
        // Обновляем звук
        updateSoundButton();
        
        console.log('Игра загружена!');
    } catch (error) {
        console.error('Ошибка загрузки сохранения:', error);
        showNotification('Ошибка загрузки сохранения');
    }
}

function updateSoundButton() {
    const button = document.getElementById('soundToggle');
    if (!button) return;
    
    const icon = button.querySelector('i');
    const text = button.querySelector('span');
    
    if (soundEnabled) {
        icon.className = 'fas fa-volume-up';
        text.textContent = 'ЗВУК ВКЛ';
    } else {
        icon.className = 'fas fa-volume-mute';
        text.textContent = 'ЗВУК ВЫКЛ';
    }
}

function resetGame() {
    if (confirm('Вы уверены? Весь прогресс будет удален!')) {
        localStorage.removeItem('danilclicker_save');
        localStorage.removeItem('danilclicker_custom_image');
        
        // Сбрасываем все переменные
        clickCount = 0;
        clicksPerSecond = 0;
        clickPower = 1;
        autoClickers = 0;
        comboCount = 0;
        comboMultiplier = 1;
        
        upgrades = {
            autoClicker: { purchased: false, cost: 50, cps: 1 },
 
