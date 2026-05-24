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
        setTimeout(() => {
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
        }, 860);
    });

    /* ── URL PARAMS ────── */
    const p = new URLSearchParams(window.location.search);
    const n = p.get('n'), ps = p.get('p');
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
    const boda = new Date('October 14, 2026 16:30:00').getTime();
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

    function abrirModal()  { if (modal) { modal.classList.add('abierto'); document.body.style.overflow = 'hidden'; } }
    function cerrarModal() { if (modal) { modal.classList.remove('abierto'); document.body.style.overflow = 'auto'; } }

    if (b1) b1.addEventListener('click', abrirModal);
    if (b2) b2.addEventListener('click', abrirModal);
    if (cerrar) cerrar.addEventListener('click', cerrarModal);
    if (back) back.addEventListener('click', cerrarModal);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') cerrarModal(); });

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
            mostrarErrorCantidad('Ingresa al menos 1 pase.');
            return false;
        }
        if (cantidad > max) {
            mostrarErrorCantidad(`Solo tienes ${max} pase${max === 1 ? '' : 's'} reservado${max === 1 ? '' : 's'}. No puedes confirmar más.`);
            return false;
        }
        ocultarErrorCantidad();
        return true;
    }

    function escapeHTML(str) {
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    cant.addEventListener('input', validarCantidad);

    function resetRsvp() {
        form.classList.remove('hidden');
        exito.classList.add('hidden');
        sendBtn.innerText = 'Enviar Confirmación';
        sendBtn.disabled = false;
        val.value = '';
        btnSi.classList.remove('activo-si');
        btnNo.classList.remove('activo-no');
        sec.classList.add('hidden');
        exitoSub.style.display = '';
        ocultarErrorCantidad();
    }

    btnSi.onclick = () => { val.value='SI'; btnSi.classList.add('activo-si'); btnNo.classList.remove('activo-no'); sec.classList.remove('hidden'); };
    btnNo.onclick = () => { val.value='NO'; btnNo.classList.add('activo-no'); btnSi.classList.remove('activo-si'); sec.classList.add('hidden'); };

    function abrirModal()  { resetRsvp(); modal.classList.add('abierto'); document.body.style.overflow = 'hidden'; }

    document.getElementById('rsvpForm').onsubmit = async (e) => {
        e.preventDefault();
        if (!val.value) return alert('Selecciona tu asistencia');
        if (val.value === 'SI' && !validarCantidad()) {
            return;
        }
        sendBtn.innerText = 'ENVIANDO...'; sendBtn.disabled = true;
        const formDataObj = Object.fromEntries(new FormData(e.target).entries());
        // Si por compatibilidad existía 'dieta', mapearlo a 'nombres'
        if (formDataObj.dieta && !formDataObj.nombres) {
            formDataObj.nombres = formDataObj.dieta;
            delete formDataObj.dieta;
        }
        const payload = { ...formDataObj };
        try {
            const res = await fetch('https://sheetdb.io/api/v1/mtnhnv7jyyebe', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: [payload] })
            });
            if (!res.ok) throw new Error();

            // Mostrar mensaje de éxito dentro del modal y mantener la X para cerrar
            form.classList.add('hidden');
            exito.classList.remove('hidden');
            if (val.value === 'SI') {
                exitoTitle.innerText = '¡Pura Vida!';
                exitoSub.innerHTML = 'Confirmación guardada.<br>¡Nos vemos en octubre!'
                    + (payload.nombres ? `<br><small>Nombres: ${escapeHTML(payload.nombres)}</small>` : '');
            } else {
                exitoTitle.innerText = 'Respuesta recibida';
                exitoSub.innerHTML = 'Tu respuesta ha sido registrada.<br>¡Gracias por dejarnos saber!';
            }
        } catch {
            alert('Error al enviar, intenta de nuevo.');
            sendBtn.innerText = 'Enviar Confirmación';
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
        document.getElementById('carouselPrev').onclick = () => { goTo(cur-1); resetAuto(); };
        document.getElementById('carouselNext').onclick = () => { goTo(cur+1); resetAuto(); };
        let tx = 0;
        track.addEventListener('touchstart', e => tx = e.touches[0].clientX, {passive:true});
        track.addEventListener('touchend',   e => { const dx = tx - e.changedTouches[0].clientX; if (Math.abs(dx) > 40) { goTo(dx > 0 ? cur+1 : cur-1); resetAuto(); } }, {passive:true});
        function startAuto() { auto = setInterval(() => goTo(cur+1), 4500); }
        function resetAuto() { clearInterval(auto); startAuto(); }
        startAuto();
    }

    /* ── AUDIO/ MÚSICA DEL CARRUSEL ── */
    const audio = document.getElementById('carouselAudio');
    const musicBtn = document.getElementById('musicToggle');
    const carouselSection = document.querySelector('.carousel-section');
    let userPausedManually = false;

    function updateMusicUI(isPlaying) {
        if (!musicBtn) return;
        musicBtn.classList.toggle('playing', !!isPlaying);
        musicBtn.setAttribute('aria-pressed', isPlaying ? 'true' : 'false');
        musicBtn.setAttribute('aria-label', isPlaying ? 'Pausar música' : 'Reproducir música');
    }

    if (musicBtn && audio) {
        // Click en el botón: pausar o reanudar
        musicBtn.addEventListener('click', async () => {
            try {
                if (audio.paused) {
                    await audio.play();
                    userPausedManually = false;
                    updateMusicUI(true);
                } else {
                    audio.pause();
                    userPausedManually = true;
                    updateMusicUI(false);
                }
            } catch (err) {
                console.warn('Reproducción bloqueada por el navegador:', err);
            }
        });

        // Desbloqueo de audio al primer click
        function unlockAudio() {
            document.removeEventListener('click', unlockAudio);
            audio.play().then(() => audio.pause()).catch(() => {});
        }
        document.addEventListener('click', unlockAudio, { once: true, passive: true });

        // Observar visibilidad del carrusel: autoplay al entrar, pausar al salir
        if (carouselSection && 'IntersectionObserver' in window) {
            const visObs = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        // Entramos al carrusel: iniciar la música si el usuario no la pausó manualmente
                        if (audio.paused && !userPausedManually) {
                            audio.play().then(() => { updateMusicUI(true); }).catch(() => {});
                        }
                    } else {
                        // Salimos del carrusel: pausar la música
                        if (!audio.paused) {
                            audio.pause();
                            updateMusicUI(false);
                            userPausedManually = false; // reiniciar la bandera para que autoplay funcione al volver
                        }
                    }
                });
            }, { threshold: 0.25 });
            visObs.observe(carouselSection);
        }
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