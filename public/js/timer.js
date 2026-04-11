let timeLeft = localStorage.getItem('timeLeft') ? parseInt(localStorage.getItem('timeLeft')) : 25 * 60;
let timerId = null;
const timerDisplay = document.getElementById('timer');
const startBtn = document.getElementById('startBtn');
const focusTitleInput = document.getElementById('focusTitle');
const alarmSound = document.getElementById('alarmSound');

if (localStorage.getItem('focusTitle')) {
    focusTitleInput.value = localStorage.getItem('focusTitle');
}

updateDisplay();

if (localStorage.getItem('isRunning') === 'true') {
    startTimer();
}

function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    localStorage.setItem('timeLeft', timeLeft);
}

function startTimer() {
    focusTitleInput.disabled = true;
    startBtn.textContent = 'Pause';
    startBtn.classList.add('btn-danger');
    localStorage.setItem('isRunning', 'true');
    localStorage.setItem('focusTitle', focusTitleInput.value);

    timerId = setInterval(() => {
        timeLeft--;
        updateDisplay();
        
        if (timeLeft <= 0) {
            clearInterval(timerId);
            finishSession(); 
        }
    }, 1000);
}

function stopTimer() {
    clearInterval(timerId);
    timerId = null;
    startBtn.textContent = 'Resume';
    startBtn.classList.remove('btn-danger');
    startBtn.classList.add('btn-primary-custom');
    focusTitleInput.disabled = false;
    localStorage.setItem('isRunning', 'false');
}

async function finishSession() {
    alarmSound.play().catch(e => console.log("Audio play failed:", e));

    const titleInput = focusTitleInput.value;

    try {
        await fetch('/save-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: titleInput,
                type: 'Focus',
                date: new Date().toLocaleString('id-ID').slice(0, 16)
            })
        });
        
        // 3. Notifikasi Selesai
        Swal.fire({
            title: 'Sesi Selesai!',
            text: `Tetap Semangat...`,
            icon: 'success',
            confirmButtonColor: '#6366f1',
            confirmButtonText: 'Oke'
        }).then(() => {
            alarmSound.pause();
            alarmSound.currentTime = 0;
            resetToInitial(); 
        });

    } catch (err) {
        console.error(err);
        resetToInitial();
    }
}

function resetToInitial() {
    clearInterval(timerId);
    timerId = null;
    timeLeft = 25 * 60; 

    localStorage.removeItem('timeLeft');
    localStorage.removeItem('isRunning');
    localStorage.removeItem('focusTitle');
    
    updateDisplay();
    focusTitleInput.value = "";
    focusTitleInput.disabled = false;
    startBtn.textContent = 'Start';
    startBtn.classList.remove('btn-danger');
    
    location.reload();
}

startBtn.addEventListener('click', () => {
    if (timerId) {
        stopTimer();
        return;
    }

    if (focusTitleInput.value.trim() === "") {
        focusTitleInput.classList.add('is-invalid');
        Swal.fire({
            title: 'Eits!',
            text: 'Tulis dulu apa yang mau dikerjakan.',
            icon: 'info',
            toast: true,
            position: 'top',
            timer: 3000,
            showConfirmButton: false
        });
        return;
    }

    focusTitleInput.classList.remove('is-invalid');
    startTimer();
});

document.getElementById('resetBtn').addEventListener('click', () => {
    Swal.fire({
        title: 'Reset timer?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#f43f5e',
        confirmButtonText: 'Ya, reset!'
    }).then((result) => {
        if (result.isConfirmed) {
            resetToInitial();
        }
    });
});

async function clearHistory() {
    const result = await Swal.fire({
        title: 'Hapus History?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#f43f5e',
        confirmButtonText: 'Hapus!'
    });

    if (result.isConfirmed) {
        await fetch('/clear-history', { method: 'DELETE' });
        location.reload();
    }
}