let timeLeft = 25 * 60;
let timerId = null;
const timerDisplay = document.getElementById('timer');
const startBtn = document.getElementById('startBtn');
const focusTitleInput = document.getElementById('focusTitle'); 

function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

async function saveSession() {
    const titleInput = focusTitleInput.value;
    
    try {
        await fetch('/save-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: titleInput,
                type: 'Focus',
                date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            })
        });
        
        Swal.fire({
            title: 'Mantap!',
            text: `Sesi "${titleInput}" selesai.`,
            icon: 'success',
            confirmButtonColor: '#6366f1',
            borderRadius: '1.5rem'
        }).then(() => location.reload());

    } catch (err) {
        console.error(err);
    }
}

startBtn.addEventListener('click', () => {
    if (timerId) {
        clearInterval(timerId);
        timerId = null;
        startBtn.textContent = 'Resume';
        startBtn.classList.remove('btn-danger');
        startBtn.classList.add('btn-primary-custom');
        focusTitleInput.disabled = false; 
        return;
    }

    const currentTitle = focusTitleInput.value.trim();
    if (currentTitle === "") {
        focusTitleInput.classList.add('is-invalid'); 
        
        Swal.fire({
            title: 'Eits, bentar!',
            text: 'Tulis dulu apa yang mau kamu kerjakan biar fokus.',
            icon: 'info',
            confirmButtonColor: '#6366f1',
            borderRadius: '1.5rem',
            toast: true,
            position: 'top',
            timer: 3000,
            showConfirmButton: false
        });
        return;
    }

    focusTitleInput.classList.remove('is-invalid');
    focusTitleInput.disabled = true; 
    startBtn.textContent = 'Pause';
    startBtn.classList.add('btn-danger');

    timerId = setInterval(() => {
        timeLeft--;
        updateDisplay();
        if (timeLeft <= 0) {
            clearInterval(timerId);
            saveSession();
        }
    }, 1000);
});

document.getElementById('resetBtn').addEventListener('click', () => {
    Swal.fire({
        title: 'Reset timer?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#f43f5e',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Ya, reset!',
        borderRadius: '1.5rem'
    }).then((result) => {
        if (result.isConfirmed) {
            clearInterval(timerId);
            timerId = null;
            timeLeft = 25 * 60;
            updateDisplay();
            startBtn.textContent = 'Start';
            startBtn.classList.remove('btn-danger');
            focusTitleInput.disabled = false;
            focusTitleInput.value = ""; 
        }
    });
});

async function clearHistory() {
    const result = await Swal.fire({
        title: 'Hapus History?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#f43f5e',
        confirmButtonText: 'Hapus!',
        borderRadius: '1.5rem'
    });

    if (result.isConfirmed) {
        await fetch('/clear-history', { method: 'DELETE' });
        location.reload();
    }
}