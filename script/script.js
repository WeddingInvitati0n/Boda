document.addEventListener('DOMContentLoaded', () => {

    /* ── SOBRE APERTURA ─── */
    const sello  = document.getElementById('sello-clic');
    const pIzq   = document.getElementById('puerta-izq');
    const pDer   = document.getElementById('puerta-der');
    const pSobre = document.getElementById('pantalla-sobre');
    const inv    = document.getElementById('invitacion-main');
    document.body.style.overflow = 'hidden';

    sello.addEventListener('click', () => {
        sello.classList.add('desaparecer');
        pIzq.classList.add('abrir-izq');
        pDer.classList.add('abrir-der');
        pSobre.classList.add('desvanecer');
        inv.classList.add('aparecer');
        // Animar esquinas del hero en secuencia
        setTimeout(() => {
            document.querySelectorAll('.branch').forEach((el, i) => {
                setTimeout(() => el.classList.add('visible'), i * 280);
            });
        }, 200);
        setTimeout(() => {
            pSobre.style.display = 'none';
            document.body.style.overflow = 'auto';
            initScrollReveal();
        }, 1200);
        // Reproducir música automáticamente al abrir la invitación
        setTimeout(() => {
            const audio = document.getElementById('carouselAudio');
            if (audio && audio.paused) {
                audio.play().then(() => {
                    updateMusicUI(true);
                }).catch(err => {
                    console.warn('Reproducción automática bloqueada:', err);
                });
            }
        }, 800);
    });

    /* ── URL PARAMS ────── */
    const p = new URLSearchParams(window.location.search);
    const n = p.get('n'), ps = p.get('p');

    const copy = {
        es: {
            submit: 'Enviar Confirmación',
            sending: 'ENVIANDO...',
            selectAttendance: 'Selecciona tu asistencia',
            minPasses: 'Ingresa al menos 1 pase.',
            maxPasses: (max) => `Solo tienes ${max} pase${max === 1 ? '' : 's'} reservado${max === 1 ? '' : 's'}. No puedes confirmar más.`,
            successTitleYes: '¡Pura Vida!',
            successTitleNo: 'Respuesta recibida',
            successSubYes: 'Confirmación guardada.<br>¡Nos vemos en octubre!',
            successSubNo: 'Tu respuesta ha sido registrada.<br>¡Gracias por dejarnos saber!',
            alreadyTitle: 'Confirmación ya registrada',
            alreadySub: 'Esta invitación solo se puede confirmar una vez.<br>Si necesitas corregirla, contáctanos.',
            musicPause: 'Pausar música',
            musicPlay: 'Reproducir música',
            errorSend: 'Error al enviar, intenta de nuevo.'
        },
        de: {
            submit: 'Bestätigung senden',
            sending: 'WIRD GESENDET...',
            selectAttendance: 'Bitte wähle deine Teilnahme aus.',
            minPasses: 'Bitte mindestens 1 Platz eingeben.',
            maxPasses: (max) => `Du hast nur ${max} Platz${max === 1 ? '' : 'e'} reserviert. Mehr kannst du nicht bestätigen.`,
            successTitleYes: 'Wir freuen uns!',
            successTitleNo: 'Antwort erhalten',
            successSubYes: 'Bestätigung gespeichert.<br>Wir sehen uns im  Oktober!',
            successSubNo: 'Deine Antwort wurde registriert.<br>Danke, dass du uns Bescheid gegeben hast!',
            alreadyTitle: 'Bestätigung bereits erfasst',
            alreadySub: 'Diese Einladung kann nur einmal bestätigt werden.<br>Wenn du etwas ändern musst, melde dich bei uns.',
            musicPause: 'Musik pausieren',
            musicPlay: 'Musik abspielen',
            errorSend: 'Fehler beim Senden. Bitte erneut versuchen.'
        }
    };

    let currentLang = localStorage.getItem('invitationLanguage') || 'es';

    function applyLanguage(lang) {
        currentLang = lang;
        localStorage.setItem('invitationLanguage', lang);
        document.documentElement.lang = lang;
        document.querySelectorAll('[data-i18n-es]').forEach(el => {
            const text = lang === 'de' ? (el.dataset.i18nDe || el.dataset.i18nEs) : el.dataset.i18nEs;
            if (el.classList.contains('btn-label')) {
                el.textContent = text;
            } else if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.value = text;
            } else if (/<[a-z][\s\S]*>/i.test(text)) {
                el.innerHTML = text;
            } else {
                el.textContent = text;
            }
        });
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === lang);
            btn.setAttribute('aria-pressed', btn.dataset.lang === lang ? 'true' : 'false');
        });
        if (document.getElementById('musicToggle')) {
            const isPlaying = document.getElementById('musicToggle').classList.contains('playing');
            document.getElementById('musicToggle').setAttribute('aria-label', isPlaying ? copy[lang].musicPause : copy[lang].musicPlay);
        }
    }

    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => applyLanguage(btn.dataset.lang));
    });

    applyLanguage(currentLang);
    if (n) {
        const nl = n.replace(/-/g,' ');
        document.getElementById('inputNombre').value = nl;
        document.getElementById('mensajeBienvenida').innerText = `¡Hola ${nl}! Qué alegría que estés aquí.`;
    }
    if (ps) {
        const inp = document.getElementById('inputCantidad');
        inp.max = ps; inp.value = ps;
        document.getElementById('labelMax').innerText = `de ${ps} pases reservados`;
    }

    /* ── CUENTA REGRESIVA ─ */
    const boda = new Date('October 14, 2026 15:30:00').getTime();
    const ids  = ['days','hours','minutes','seconds'];
    function tick() {
        const d = boda - Date.now();
        if (d <= 0) return;
        [Math.floor(d/86400000), Math.floor((d%86400000)/3600000),
         Math.floor((d%3600000)/60000), Math.floor((d%60000)/1000)]
        .forEach((v,i) => {
            const el = document.getElementById(ids[i]);
            const s  = String(v).padStart(2,'0');
            if (el.innerText !== s) { el.classList.add('tick'); el.innerText = s; setTimeout(() => el.classList.remove('tick'), 200); }
        });
    }
    tick(); setInterval(tick, 1000);

    /* ── MODAL RSVP ─────── */
    const modal   = document.getElementById('modal-rsvp');
    const cerrar  = document.getElementById('modalCerrar');
    const back    = document.getElementById('modalBackdrop');
    const b1      = document.getElementById('btnAbrirModal');
    const b2      = document.getElementById('btnAbrirModal2');

    /* ── RSVP LÓGICA ────── */
    const btnSi = document.getElementById('btnAsistir');
    const btnNo = document.getElementById('btnNoAsistir');
    const val   = document.getElementById('valorAsistencia');
    const sec   = document.getElementById('seccionInvitados');
    const form  = document.getElementById('rsvpForm');
    const exito = document.getElementById('mensajeExito');
    const exitoTitle = exito.querySelector('.exito-text');
    const exitoSub = exito.querySelector('.exito-sub');
    const sendBtn = document.getElementById('btnEnviar');
    const cant = document.getElementById('inputCantidad');
    const errCant = document.getElementById('errorCantidad');
    const rsvpLockPrefix = 'rsvp-confirmado';

    function normalizarNombre(nombre) {
        return String(nombre || '').trim().toLowerCase().replace(/\s+/g, ' ');
    }

    function rsvpLockKey(nombre) {
        const partes = [rsvpLockPrefix, normalizarNombre(nombre)].filter(Boolean);
        return partes.join('|');
    }

    function rsvpYaRegistrado(nombre) {
        return Boolean(localStorage.getItem(rsvpLockKey(nombre)));
    }

    function guardarRsvpRegistrado(nombre, asistencia) {
        localStorage.setItem(rsvpLockKey(nombre), JSON.stringify({ asistencia, enviadoEn: new Date().toISOString() }));
    }

    function mostrarRsvpBloqueado() {
        form.classList.add('hidden');
        exito.classList.remove('hidden');
        exitoTitle.innerText = copy[currentLang].alreadyTitle;
        exitoSub.innerHTML = copy[currentLang].alreadySub;
        sendBtn.disabled = true;
    }

    function mostrarErrorCantidad(mensaje) {
        errCant.innerText = mensaje;
        errCant.classList.remove('hidden');
        cant.classList.add('input-error');
    }

    function ocultarErrorCantidad() {
        errCant.innerText = '';
        errCant.classList.add('hidden');
        cant.classList.remove('input-error');
    }

    function validarCantidad() {
        const max = Number(cant.max) || 1;
        const cantidad = Number(cant.value);
        if (!Number.isFinite(cantidad) || cantidad < 1) {
            mostrarErrorCantidad(copy[currentLang].minPasses);
            return false;
        }
        if (cantidad > max) {
            mostrarErrorCantidad(copy[currentLang].maxPasses(max));
            return false;
        }
        ocultarErrorCantidad();
        return true;
    }

    function escapeHTML(str) {
        var amp = '&';
        return String(str).replace(/&/g, amp + 'amp;').replace(/</g, '<').replace(/>/g, '>').replace(/"/g, '"').replace(/'/g, '&#39;');
    }

    cant.addEventListener('input', validarCantidad);

    function resetRsvp() {
        form.classList.remove('hidden');
        exito.classList.add('hidden');
        sendBtn.innerText = copy[currentLang].submit;
        sendBtn.disabled = false;
        val.value = '';
        btnSi.classList.remove('activo-si');
        btnNo.classList.remove('activo-no');
        sec.classList.add('hidden');
        exitoSub.style.display = '';
        ocultarErrorCantidad();

        const nombreActual = document.getElementById('inputNombre').value;
        if (nombreActual && rsvpYaRegistrado(nombreActual)) {
            mostrarRsvpBloqueado();
        }
    }

    btnSi.onclick = () => { val.value='SI'; btnSi.classList.add('activo-si'); btnNo.classList.remove('activo-no'); sec.classList.remove('hidden'); };
    btnNo.onclick = () => { val.value='NO'; btnNo.classList.add('activo-no'); btnSi.classList.remove('activo-si'); sec.classList.add('hidden'); };

    // FUNCIÓN UNIFICADA para abrir modal (con reset)
    function abrirModal() {
        resetRsvp();
        if (modal) modal.classList.add('abierto');
        document.body.style.overflow = 'hidden';
    }
    function cerrarModal() {
        if (modal) modal.classList.remove('abierto');
        document.body.style.overflow = 'auto';
    }

    // Usar SOLO addEventListener para evitar duplicación
    if (b1) b1.addEventListener('click', abrirModal);
    if (b2) b2.addEventListener('click', abrirModal);
    if (cerrar) cerrar.addEventListener('click', cerrarModal);
    if (back) back.addEventListener('click', cerrarModal);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') cerrarModal(); });

    /* LÓGICA DE ENVÍO */
    document.getElementById('rsvpForm').onsubmit = async (e) => {
        e.preventDefault();
        if (!val.value) return alert(copy[currentLang].selectAttendance);
        if (val.value === 'SI' && !validarCantidad()) {
            return;
        }

        const nombre = String(document.getElementById('inputNombre').value || '').trim();
        if (nombre && rsvpYaRegistrado(nombre)) {
            mostrarRsvpBloqueado();
            return;
        }

        sendBtn.innerText = copy[currentLang].sending; 
        sendBtn.disabled = true;

        const formDataObj = Object.fromEntries(new FormData(e.target).entries());
        const payload = { ...formDataObj };
        const nombreNormalizado = normalizarNombre(payload.nombre);

        try {
            // 1. BUSCAR EN SHEETDB SI YA EXISTE EL NOMBRE
            if (nombreNormalizado) {
                const searchRes = await fetch(`https://sheetdb.io/api/v1/mtnhnv7jyyebe/search?nombre=${encodeURIComponent(payload.nombre)}`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                });

                if (searchRes.ok) {
                    const filas = await searchRes.json();
                    // CORREGIDO: Solo bloquea si el invitado ya respondió de verdad con un SI o un NO
                    const filaExistente = Array.isArray(filas) ? filas.find(f => normalizarNombre(f.nombre) === nombreNormalizado && (f.asistencia === 'SI' || f.asistencia === 'NO')) : null;
                    
                    if (filaExistente) {
                        guardarRsvpRegistrado(payload.nombre, payload.asistencia);
                        mostrarRsvpBloqueado();
                        return;
                    }
                }
            }

            // 2. SI NO EXISTE, ENVIAMOS LA PETICIÓN POST A SHEETDB
            const res = await fetch('https://sheetdb.io/api/v1/mtnhnv7jyyebe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: [payload] })
            });

            if (!res.ok) throw new Error('Error de conexión con SheetDB');

            // 3. SE GUARDA EL CANDADO LOCALMENTE
            guardarRsvpRegistrado(payload.nombre, payload.asistencia);

            // 4. DESPLEGAR INTERFAZ DE ÉXITO
            form.classList.add('hidden');
            exito.classList.remove('hidden');
            if (val.value === 'SI') {
                exitoTitle.innerText = copy[currentLang].successTitleYes;
                const namesLabel = currentLang === 'de' ? 'Namen:' : 'Nombres:';
                exitoSub.innerHTML = copy[currentLang].successSubYes
                    + (payload.nombres ? `<br><small>${namesLabel} ${escapeHTML(payload.nombres)}</small>` : '');
            } else {
                exitoTitle.innerText = copy[currentLang].successTitleNo;
                exitoSub.innerHTML = copy[currentLang].successSubNo;
            }

        } catch (err) {
            console.error(err);
            alert(copy[currentLang].errorSend);
            sendBtn.innerText = copy[currentLang].submit;
            sendBtn.disabled = false;
        }
    };


    /* ── CARRUSEL ───────── */
    const track  = document.getElementById('carouselTrack');
    const dotsW  = document.getElementById('carouselDots');
    const slides = track ? [...track.querySelectorAll('.slide')] : [];
    let cur = 0, auto = null;

    if (slides.length > 0) {
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === 0);
            const d = document.createElement('div');
            d.className = 'dot' + (i === 0 ? ' activo' : '');
            d.addEventListener('click', () => { goTo(i); resetAuto(); });
            dotsW.appendChild(d);
        });

        function goTo(i) {
            cur = ((i % slides.length) + slides.length) % slides.length;
            slides.forEach((slide, j) => slide.classList.toggle('active', j === cur));
            dotsW.querySelectorAll('.dot').forEach((d,j) => d.classList.toggle('activo', j === cur));
        }

        document.getElementById('carouselPrev').addEventListener('click', () => { goTo(cur-1); resetAuto(); });
        document.getElementById('carouselNext').addEventListener('click', () => { goTo(cur+1); resetAuto(); });

        let tx = 0;
        track.addEventListener('touchstart', e => tx = e.touches[0].clientX, {passive:true});
        track.addEventListener('touchend',   e => { const dx = tx - e.changedTouches[0].clientX; if (Math.abs(dx) > 40) { goTo(dx > 0 ? cur+1 : cur-1); resetAuto(); } }, {passive:true});

        function startAuto() { auto = setInterval(() => goTo(cur+1), 4500); }
        function resetAuto() { clearInterval(auto); startAuto(); }
        startAuto();
    }


    /* ── AUDIO / MÚSICA ── */
    const audio = document.getElementById('carouselAudio');
    const musicBtn = document.getElementById('musicToggle');
    const musicPlayer = document.querySelector('.music-player');
    const musicProgress = document.getElementById('musicProgress');

    function updateMusicUI(isPlaying) {
        if (!musicBtn) return;
        musicBtn.classList.toggle('playing', !!isPlaying);
        if (musicPlayer) musicPlayer.classList.toggle('playing', !!isPlaying);
        musicBtn.setAttribute('aria-pressed', isPlaying ? 'true' : 'false');
        musicBtn.setAttribute('aria-label', isPlaying ? copy[currentLang].musicPause : copy[currentLang].musicPlay);
        const btnText = musicBtn.querySelector('.music-btn-text');
        const btnIcon = musicBtn.querySelector('.music-btn-icon');
        if (btnText) btnText.textContent = isPlaying ? 'Pause' : 'Play';
        if (btnIcon) btnIcon.textContent = isPlaying ? '❚❚' : '▶';
    }

    function updateMusicProgress() {
        if (!musicProgress) return;
        const duration = Number(audio.duration);
        const current = Number(audio.currentTime);
        if (!Number.isFinite(duration) || duration <= 0) {
            musicProgress.style.width = '0%';
            return;
        }
        const percent = Math.max(0, Math.min(100, (current / duration) * 100));
        musicProgress.style.width = `${percent}%`;
    }

    function stopMusic() {
        if (!audio || audio.paused) return;
        audio.pause();
        updateMusicUI(false);
        updateMusicProgress();
    }

    if (musicBtn && audio) {
        musicBtn.addEventListener('click', async () => {
            try {
                if (audio.paused) {
                    await audio.play();
                    updateMusicUI(true);
                } else {
                    audio.pause();
                    updateMusicUI(false);
                }
            } catch (err) {
                console.warn('Reproducción bloqueada por el navegador:', err);
            }
        });

        audio.addEventListener('loadedmetadata', updateMusicProgress);
        audio.addEventListener('timeupdate', updateMusicProgress);
        audio.addEventListener('play', () => {
            updateMusicUI(true);
            updateMusicProgress();
        });
        audio.addEventListener('pause', () => {
            updateMusicUI(false);
            updateMusicProgress();
        });
        audio.addEventListener('ended', updateMusicProgress);

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) stopMusic();
        });
        window.addEventListener('pagehide', stopMusic);
        window.addEventListener('blur', () => {
            if (document.hidden) stopMusic();
        });

        updateMusicUI(false);
        updateMusicProgress();
    }

    /* ── SCROLL REVEAL ──── */
    function initScrollReveal() {
        const obs = new IntersectionObserver(entries => {
            entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('visible'); obs.unobserve(en.target); } });
        }, { threshold: 0.12 });
        document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
    }

    /* ── BOTÓN VOLVER INICIO ── */
    document.getElementById('btnVolverInicio').addEventListener('click', () => {
        document.getElementById('confirmacion-final').classList.add('hidden');
        document.body.style.overflow = 'auto';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    /* ── CONFIGURAR PÉTALOS ──── */
    document.querySelectorAll('.petals-container').forEach(container => {
        const petals = container.querySelectorAll('.petal');
        petals.forEach((petal, i) => {
            const x = Math.random() * 100;
            const dur = 10 + Math.random() * 6;
            const delay = Math.random() * 2;
            const rot = Math.random() * 360;
            petal.style.setProperty('--x', `${x}%`);
            petal.style.setProperty('--dur', `${dur}s`);
            petal.style.setProperty('--delay', `${delay}s`);
            petal.style.setProperty('--rot', `${rot}deg`);
        });
    });
});