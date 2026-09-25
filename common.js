// ============ Тема (тёмная / светлая) ============
(function initTheme() {
    const toggle = document.getElementById('themeToggle');
    const saved = localStorage.getItem('dinolab-theme');

    if (saved === 'light') {
        document.body.classList.add('light');
        if (toggle) toggle.textContent = '☀️';
    }

    if (toggle) {
        toggle.addEventListener('click', () => {
            document.body.classList.toggle('light');
            const isLight = document.body.classList.contains('light');
            toggle.textContent = isLight ? '☀️' : '🌙';
            localStorage.setItem('dinolab-theme', isLight ? 'light' : 'dark');
        });
    }
})();

// ============ Год в подвале ============
(function initYear() {
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
})();

// ============ Активная ссылка в меню ============
(function highlightActive() {
    const path = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.main-nav a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === path) {
            link.classList.add('active');
        }
    });
})();