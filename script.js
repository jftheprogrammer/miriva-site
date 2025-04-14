document.addEventListener('DOMContentLoaded', function() {

    const contentPath = '/miriva-site/content.json'; 
    
    document.querySelectorAll('.icon-img').forEach(img => {
        const icon = img.closest('.icon');
        const iconName = icon.dataset.icon || img.alt;

        
        img.style.opacity = '0';

        // Create a new Image object to preload
        const preloadImg = new Image();
        preloadImg.src = img.src;

        preloadImg.onload = () => {
            console.log(`Icon loaded successfully: ${iconName}`);
            img.src = preloadImg.src;
            img.style.opacity = '1';
            img.dataset.loaded = 'true';
        };

        preloadImg.onerror = () => {
            console.error(`Failed to load icon: ${iconName}, falling back to local image`);

            img.src = 'images2/fallback-icon.png';
            img.style.opacity = '1';
            img.dataset.loaded = 'true';
        };
    });

    // Load content
    fetch(contentPath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load content.json: ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            document.getElementById('riva-content').innerHTML = data.riva;
            document.getElementById('moao-content').innerHTML = data.moao;
            document.getElementById('iloveyou-content').innerHTML = data.iloveyou;
            document.getElementById('poem-content').innerHTML = data.poem;
            document.getElementById('gallery-content').innerHTML = data.gallery;
            document.getElementById('us-content').innerHTML = data.us;
            document.getElementById('recycle-bin-content').innerHTML = data.recycleBin;
            document.getElementById('my-computer-content').innerHTML = data.myComputer;

            // Initialize gallery lightbox
            document.querySelectorAll('.gallery-images img').forEach(img => {
                img.style.cursor = 'pointer';
                img.onclick = () => {
                    openWindow('us');
                    document.getElementById('us-content').innerHTML = `<img src="${img.dataset.full}" alt="${img.alt}" style="max-width: 100%; max-height: 80%; display: block; margin: 0 auto;">`;
                };
            });

            // Open welcome message
            setTimeout(() => openWindow('iloveyou'), 1000);
        })
        .catch(error => {
            console.error('Error loading content:', error.message);
            document.querySelectorAll('.window-content').forEach(content => {
                content.innerHTML = `<p style="color: red;">Error loading content: ${error.message}. Please check the console for details.</p>`;
            });
        });

    // Live clock
    function updateClock() {
        const now = new Date();
        const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        document.getElementById('clock').textContent = time;
    }
    updateClock();
    setInterval(updateClock, 1000);

    // Background music
    const bgMusic = document.getElementById('bg-music');
    bgMusic.volume = 0.2;
    let isMusicPlaying = false;
    window.toggleMusic = function() {
        if (isMusicPlaying) {
            bgMusic.pause();
            document.getElementById('music-toggle').textContent = '🎵';
        } else {
            bgMusic.play().catch(() => alert('Please interact with the page to enable music.'));
            document.getElementById('music-toggle').textContent = '🔇';
        }
        isMusicPlaying = !isMusicPlaying;
    };

    // Window management
    let maxZIndex = 100;
    const taskbarWindows = document.getElementById('taskbar-windows');

    window.openWindow = function(id) {
        const window = document.getElementById(id);
        window.style.display = 'block';
        window.style.left = `${150 + (maxZIndex % 10) * 20}px`;
        window.style.top = `${100 + (maxZIndex % 10) * 20}px`;
        window.style.width = '550px';
        window.style.height = '300px';
        window.classList.add('window-open');
        bringToFront(window);
        makeDraggable(window);
        debouncedUpdateTaskbar();

        if (id === 'moao' && typeof window.initMp3Player === 'function') {
            setTimeout(() => {
                try {
                    initMp3Player('moao-player', 'music/moao.mp3');
                } catch (e) {
                    console.error('MP3 player initialization failed:', e);
                    document.getElementById('moao-content').innerHTML = '<audio controls><source src="music/moao.mp3" type="audio/mpeg">Your browser does not support audio. Download <a href="music/moao.mp3">moao.mp3</a>.</audio>';
                }
            }, 100);
        }
    };

    window.closeWindow = function(id) {
        const window = document.getElementById(id);
        window.classList.remove('window-open');
        window.classList.add('window-close');
        setTimeout(() => {
            window.style.display = 'none';
            window.classList.remove('window-close');
            debouncedUpdateTaskbar();
        }, 300);
    };

    window.minimizeWindow = function(id) {
        const window = document.getElementById(id);
        window.classList.remove('window-open');
        window.classList.add('window-close');
        setTimeout(() => {
            window.style.display = 'none';
            window.classList.remove('window-close');
            debouncedUpdateTaskbar();
        }, 300);
    };

    window.maximizeWindow = function(id) {
        const window = document.getElementById(id);
        if (window.dataset.maximized === 'true') {
            window.style.width = '550px';
            window.style.height = '300px';
            window.style.left = '150px';
            window.style.top = '100px';
            window.dataset.maximized = 'false';
        } else {
            window.style.width = '90vw';
            window.style.height = '80vh';
            window.style.left = '5vw';
            window.style.top = '5vh';
            window.dataset.maximized = 'true';
        }
        debouncedUpdateTaskbar();
    };

    window.toggleStartMenu = function() {
        const startMenu = document.getElementById('startMenu');
        startMenu.style.display = startMenu.style.display === 'block' ? 'none' : 'block';
    };

    window.closeAllWindows = function() {
        document.querySelectorAll('.window').forEach(win => closeWindow(win.id));
    };

    function bringToFront(element) {
        maxZIndex++;
        element.style.zIndex = maxZIndex;
    }

    function makeDraggable(element) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        const header = element.querySelector('.window-header');
        header.onmousedown = dragMouseDown;

        function dragMouseDown(e) {
            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
            bringToFront(element);
        }

        function elementDrag(e) {
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            element.style.top = (element.offsetTop - pos2) + "px";
            element.style.left = (element.offsetLeft - pos1) + "px";
        }

        function closeDragElement() {
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }

    // Debounce taskbar updates to prevent flicker
    let taskbarTimeout;
    function debouncedUpdateTaskbar() {
        clearTimeout(taskbarTimeout);
        taskbarTimeout = setTimeout(updateTaskbar, 100);
    }

    function updateTaskbar() {
        taskbarWindows.innerHTML = '';
        document.querySelectorAll('.window').forEach(win => {
            if (win.style.display === 'block') {
                const title = win.querySelector('.window-header span').textContent;
                const button = document.createElement('button');
                button.className = 'taskbar-window';
                button.textContent = title.length > 15 ? title.substring(0, 12) + '...' : title;
                button.onclick = () => {
                    if (win.style.display === 'block') {
                        minimizeWindow(win.id);
                    } else {
                        openWindow(win.id);
                    }
                };
                taskbarWindows.appendChild(button);
            }
        });
    }

    // Close start menu when clicking outside
    document.addEventListener('click', function(e) {
        const startMenu = document.getElementById('startMenu');
        const startButton = document.querySelector('.start-button');
        if (!startMenu.contains(e.target) && !startButton.contains(e.target)) {
            startMenu.style.display = 'none';
        }
    });
});
