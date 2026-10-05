/* ==========================================================================
   THẮNG'S BIRTHDAY INVITATION SCRIPT
   Interactive Web Application Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Background Particle Canvas Animation ---
    initBgCanvas();

    // --- 2. Target Date: October 6, 2026 at 20:00:00 (Local Time - 8h00 Tối) ---
    const targetDate = new Date(2026, 9, 6, 20, 0, 0);
    initCountdown(targetDate);

    // --- 3. Opening Envelope Handler ---
    const envelopeOverlay = document.getElementById('envelopeOverlay');
    const openBtn = document.getElementById('openBtn');
    const mainApp = document.getElementById('mainApp');

    openBtn.addEventListener('click', () => {
        envelopeOverlay.classList.add('opened');
        mainApp.classList.remove('hidden');

        // Launch celebratory confetti burst!
        triggerConfetti();

        // Start background music synth
        toggleMusic(true);

        setTimeout(() => {
            envelopeOverlay.style.display = 'none';
        }, 800);
    });

    // --- 4. Web Audio API Background Synth Music Player ---
    let audioCtx = null;
    let isPlaying = false;
    let synthTimer = null;
    const musicBtn = document.getElementById('musicBtn');

    if (musicBtn) {
        musicBtn.addEventListener('click', () => {
            toggleMusic(!isPlaying);
        });
    }

    function toggleMusic(playState) {
        isPlaying = playState;

        if (musicBtn) {
            if (isPlaying) {
                musicBtn.classList.add('playing');
            } else {
                musicBtn.classList.remove('playing');
            }
        }

        if (isPlaying) {
            startSynthMusic();
        } else {
            stopSynthMusic();
        }
    }

    function startSynthMusic() {
        try {
            if (!audioCtx) {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                if (AudioContext) {
                    audioCtx = new AudioContext();
                }
            }

            if (audioCtx && audioCtx.state === 'suspended') {
                audioCtx.resume();
            }

            if (synthTimer) clearInterval(synthTimer);

            // Gentle birthday chord melody notes (Hz)
            const notes = [261.63, 329.63, 392.00, 523.25, 440.00, 349.23, 392.00, 523.25, 659.25];
            let step = 0;

            synthTimer = setInterval(() => {
                if (!isPlaying || !audioCtx) return;
                try {
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();

                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(notes[step % notes.length], audioCtx.currentTime);

                    gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2);

                    osc.connect(gain);
                    gain.connect(audioCtx.destination);

                    osc.start();
                    osc.stop(audioCtx.currentTime + 1.2);

                    step++;
                } catch (err) {
                    console.log("Audio playback note:", err);
                }
            }, 800);
        } catch (err) {
            console.log("AudioContext blocked or not supported:", err);
        }
    }

    function stopSynthMusic() {
        if (synthTimer) {
            clearInterval(synthTimer);
            synthTimer = null;
        }
    }

    // --- 5. Copy Address Button ---
    const copyAddressBtn = document.getElementById('copyAddressBtn');
    copyAddressBtn.addEventListener('click', () => {
        const addressText = "52 Đường Phạm Ngũ Lão, Phường Hiệp Thành, TP. Thủ Dầu Một, Bình Dương";
        navigator.clipboard.writeText(addressText).then(() => {
            showToast("Đã sao chép địa chỉ Trạm Nướng Bất Ổn!");
        }).catch(() => {
            showToast("Không thể sao chép tự động. Địa chỉ: 52 Phạm Ngũ Lão, TP. Thủ Dầu Một");
        });
    });

    // --- 6. RSVP Form Handler & Live Feed ---
    const rsvpForm = document.getElementById('rsvpForm');
    const rsvpFeed = document.getElementById('rsvpFeed');
    
    // RSVPs stored in localStorage
    let rsvpList = JSON.parse(localStorage.getItem('thang_bday_rsvp_v3')) || [];

    renderRsvpFeed();

    const thankYouOverlay = document.getElementById('thankYouOverlay');
    const closeThankYouBtn = document.getElementById('closeThankYouBtn');

    if (closeThankYouBtn && thankYouOverlay) {
        closeThankYouBtn.addEventListener('click', () => {
            thankYouOverlay.classList.add('hidden');
        });
        thankYouOverlay.addEventListener('click', (e) => {
            if (e.target === thankYouOverlay) thankYouOverlay.classList.add('hidden');
        });
    }

    rsvpForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const nameInput = document.getElementById('guestName');
        const countInput = document.getElementById('guestCount');
        const statusInput = document.querySelector('input[name="rsvpStatus"]:checked');

        const name = nameInput ? nameInput.value.trim() : '';
        const count = countInput ? countInput.value : '';
        const status = statusInput ? statusInput.value : '';

        if (!name) return;

        const newRsvp = {
            name,
            count,
            status,
            date: new Date().toLocaleDateString('vi-VN')
        };

        rsvpList.unshift(newRsvp);
        localStorage.setItem('thang_bday_rsvp_v3', JSON.stringify(rsvpList));

        renderRsvpFeed();
        triggerConfetti();

        // Show thank you screen overlay
        if (thankYouOverlay) {
            thankYouOverlay.classList.remove('hidden');
        }

        showToast("Cảm ơn bạn! Xác nhận tham dự đã được gửi thành công. 🎉");

        rsvpForm.reset();
    });

    function renderRsvpFeed() {
        if (!rsvpFeed) return;
        rsvpFeed.innerHTML = '';

        if (rsvpList.length === 0) {
            rsvpFeed.innerHTML = '<p class="text-muted" style="text-align: center; font-size: 0.88rem; padding: 12px 0;">Chưa có phản hồi nào. Hãy là người đầu tiên xác nhận tham dự nhé!</p>';
            return;
        }

        rsvpList.forEach((item) => {
            const div = document.createElement('div');
            div.className = 'rsvp-item-card';
            div.innerHTML = `
                <div>
                    <strong style="color: var(--gold-primary); font-size: 0.95rem;">${escapeHtml(item.name)}</strong>
                    <div style="font-size: 0.82rem; color: var(--text-muted); margin-top: 2px;">${escapeHtml(item.count)} • <span style="color: var(--text-main); font-weight: 600;">${escapeHtml(item.status)}</span></div>
                </div>
                <span style="font-size: 0.75rem; color: var(--text-muted);">${item.date}</span>
            `;
            rsvpFeed.appendChild(div);
        });
    }

    // --- 8. Wish Wall Guest Book ---
    const wishForm = document.getElementById('wishForm');
    const wishesFeed = document.getElementById('wishesFeed');

    // Wishes stored in localStorage (empty by default)
    let wishes = JSON.parse(localStorage.getItem('thang_bday_wishes_v2')) || [];

    renderWishes();

    wishForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const nameInput = document.getElementById('wishName');
        const textInput = document.getElementById('wishText');

        const name = nameInput.value.trim();
        const text = textInput.value.trim();

        if (!name || !text) return;

        const newWish = {
            id: Date.now(),
            name,
            text,
            time: "Vừa xong",
            likes: 1
        };

        wishes.unshift(newWish);
        localStorage.setItem('thang_bday_wishes_v2', JSON.stringify(wishes));

        renderWishes();
        triggerConfetti();
        showToast("Cảm ơn lời chúc tuyệt vời của bạn dành cho Thắng! ❤️");

        textInput.value = '';
    });

    function renderWishes() {
        wishesFeed.innerHTML = '';

        if (wishes.length === 0) {
            wishesFeed.innerHTML = `
                <div style="text-align: center; padding: 35px 15px; color: var(--text-muted);">
                    <i class="fa-solid fa-heart-circle-plus" style="font-size: 2.2rem; color: var(--gold-primary); margin-bottom: 12px; display: block;"></i>
                    <p style="font-size: 0.95rem; line-height: 1.5;">Chưa có lời chúc nào. Hãy là người đầu tiên gửi lời chúc mừng sinh nhật cho Thắng nhé! ✨</p>
                </div>
            `;
            return;
        }

        wishes.forEach(w => {
            const card = document.createElement('div');
            card.className = 'wish-card';
            card.innerHTML = `
                <div class="wish-header">
                    <span class="wish-author">${escapeHtml(w.name)}</span>
                    <span class="wish-time">${w.time}</span>
                </div>
                <p class="wish-body">${escapeHtml(w.text)}</p>
                <button class="wish-like-btn" onclick="likeWish(${w.id})">
                    <i class="fa-solid fa-heart"></i> <span id="like-count-${w.id}">${w.likes}</span>
                </button>
            `;
            wishesFeed.appendChild(card);
        });
    }

    window.likeWish = function(id) {
        const item = wishes.find(w => w.id === id);
        if (item) {
            item.likes += 1;
            localStorage.setItem('thang_bday_wishes_v2', JSON.stringify(wishes));
            const el = document.getElementById(`like-count-${id}`);
            if (el) el.textContent = item.likes;
        }
    };

    // --- Helper Utilities ---
    function triggerConfetti() {
        if (typeof confetti === 'function') {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#e5b95f', '#ffffff', '#ff4d6d', '#ffd166']
            });
        }
    }

    function showToast(msg) {
        const toast = document.getElementById('toast');
        const toastMsg = document.getElementById('toastMsg');
        toastMsg.textContent = msg;

        toast.classList.remove('hidden');

        setTimeout(() => {
            toast.classList.add('hidden');
        }, 3500);
    }

    function escapeHtml(str) {
        return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    }

    // --- 9. Countdown Timer Function ---
    function initCountdown(target) {
        const cdDays = document.getElementById('cdDays');
        const cdHours = document.getElementById('cdHours');
        const cdMinutes = document.getElementById('cdMinutes');
        const cdSeconds = document.getElementById('cdSeconds');

        function updateClock() {
            const now = new Date().getTime();
            const distance = target.getTime() - now;

            if (distance < 0) {
                cdDays.textContent = '00';
                cdHours.textContent = '00';
                cdMinutes.textContent = '00';
                cdSeconds.textContent = '00';
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            cdDays.textContent = String(days).padStart(2, '0');
            cdHours.textContent = String(hours).padStart(2, '0');
            cdMinutes.textContent = String(minutes).padStart(2, '0');
            cdSeconds.textContent = String(seconds).padStart(2, '0');
        }

        updateClock();
        setInterval(updateClock, 1000);
    }

    // --- 10. Background Canvas Stars & Sparkles ---
    function initBgCanvas() {
        const canvas = document.getElementById('bgCanvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        });

        const particles = [];
        const particleCount = 45;

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 2 + 0.5,
                alpha: Math.random(),
                speed: Math.random() * 0.4 + 0.1
            });
        }

        function animate() {
            ctx.clearRect(0, 0, width, height);

            particles.forEach(p => {
                p.y -= p.speed;
                if (p.y < 0) p.y = height;

                p.alpha += (Math.random() - 0.5) * 0.02;
                if (p.alpha < 0.1) p.alpha = 0.1;
                if (p.alpha > 0.9) p.alpha = 0.9;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(229, 185, 95, ${p.alpha})`;
                ctx.shadowBlur = 8;
                ctx.shadowColor = '#e5b95f';
                ctx.fill();
            });

            requestAnimationFrame(animate);
        }

        animate();
    }
});
