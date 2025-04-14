function initMp3Player(containerId, audioSrc) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container with ID ${containerId} not found.`);
        return;
    }

    const audioPlayer = container.querySelector('#audio-player');
    const playButton = container.querySelector('#play-button');
    const pauseButton = container.querySelector('#pause-button');
    const stopButton = container.querySelector('#stop-button');
    const prevButton = container.querySelector('#prev-button');
    const nextButton = container.querySelector('#next-button');
    const progressBar = container.querySelector('#progress-bar');
    const progressFill = container.querySelector('#progress-fill');
    const progressHandle = container.querySelector('#progress-handle');
    const timeDisplay = container.querySelector('#time-display');
    const visualizer = container.querySelector('#visualizer');

    if (!audioPlayer) {
        console.error('Audio player element not found in container.');
        return;
    }

    audioPlayer.src = audioSrc;

    const barCount = 20;
    visualizer.innerHTML = '';
    for (let i = 0; i < barCount; i++) {
        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.style.left = `${i * 6 + 3}px`;
        bar.style.width = '4px';
        bar.style.height = '0px';
        visualizer.appendChild(bar);
    }

    const bars = visualizer.querySelectorAll('.bar');
    let isPlaying = false;
    let duration = 180;
    let currentTime = 0;

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = (seconds % 60).toFixed(1);
        return `-${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(4, '0')}`;
    }

    function updateProgress() {
        const percent = (currentTime / duration) * 100;
        progressFill.style.width = `${percent}%`;
        progressHandle.style.left = `${percent}%`;
        timeDisplay.textContent = formatTime(duration - currentTime);
    }

    function updateVisualizer() {
        if (isPlaying) {
            for (let i = 0; i < bars.length; i++) {
                const height = Math.random() * 40;
                bars[i].style.height = `${height}px`;
            }
        } else {
            bars.forEach(bar => bar.style.height = '0px');
        }
    }

    playButton.addEventListener('click', () => {
        console.log('Play button clicked');
        if (!isPlaying) {
            isPlaying = true;
            audioPlayer.play().catch(e => console.error('Audio play failed:', e));
            setInterval(() => {
                if (isPlaying && currentTime < duration) {
                    currentTime += 0.1;
                    updateProgress();
                }
            }, 100);
            setInterval(updateVisualizer, 100);
        }
    });

    pauseButton.addEventListener('click', () => {
        isPlaying = false;
        audioPlayer.pause();
    });

    stopButton.addEventListener('click', () => {
        isPlaying = false;
        currentTime = 0;
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
        updateProgress();
        bars.forEach(bar => bar.style.height = '0px');
    });

    progressBar.addEventListener('click', (e) => {
        const rect = progressBar.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = x / rect.width;
        currentTime = percentage * duration;
        audioPlayer.currentTime = currentTime;
        updateProgress();
    });

    timeDisplay.textContent = formatTime(duration);

    audioPlayer.addEventListener('loadedmetadata', () => {
        duration = audioPlayer.duration;
        updateProgress();
    });

    audioPlayer.addEventListener('timeupdate', () => {
        if (!isNaN(audioPlayer.duration)) {
            currentTime = audioPlayer.currentTime;
            updateProgress();
        }
    });

    audioPlayer.addEventListener('ended', () => {
        isPlaying = false;
        currentTime = 0;
        updateProgress();
    });
}

window.initMp3Player = initMp3Player;
