/* --------------------------------------------------------------------------
   NAVBAR — dropdowns desktop + menu mobile
   -------------------------------------------------------------------------- */
(function () {
    var root = document.getElementById('pf-navbar-root');
    if (!root) return;   // guarda ANTES de qualquer busca

    // Cada entrada só entra em jogo se os 3 elementos existirem.
    // Assim, um menu ausente nunca derruba os outros.
    var MENUS = ['produto', 'conteudos', 'ferramentas'];
    var items = [];

    MENUS.forEach(function (name) {
        var trigger = document.getElementById('pf-trigger-' + name);
        var btn = document.getElementById('pf-btn-' + name);
        var menu = document.getElementById('pf-menu-' + name);

        if (!trigger || !btn || !menu) {
            console.warn('[navbar] menu "' + name + '" incompleto — ignorado.', {
                trigger: !!trigger, btn: !!btn, menu: !!menu
            });
            if (btn && !menu) {           // botão sem painel: some com a setinha
                var a = btn.querySelector('.pf-nav-arrow');
                if (a) a.style.display = 'none';
            }
            return;
        }
        items.push({ name: name, trigger: trigger, btn: btn, menu: menu });
    });

    if (!items.length) return;

    var openMenu = null;

    function applyButtonState(btn, active) {
        btn.style.color = active ? '#FA7838' : '#1B2A3A';
        btn.setAttribute('aria-expanded', active ? 'true' : 'false');
        var arrow = btn.querySelector('.pf-nav-arrow');
        if (arrow) arrow.style.transform = 'rotate(' + (active ? '180deg' : '0deg') + ')';
    }

    function render() {
        items.forEach(function (it) {
            var active = openMenu === it.name;
            it.menu.style.display = active ? 'block' : 'none';
            applyButtonState(it.btn, active);
        });
    }

    function openMenuName(name) { openMenu = name; render(); }
    function toggleMenuName(name) { openMenu = (openMenu === name) ? null : name; render(); }
    function closeMenu() { if (openMenu) { openMenu = null; render(); } }

    items.forEach(function (it) {
        it.btn.setAttribute('aria-expanded', 'false');
        it.btn.setAttribute('aria-controls', it.menu.id);
        it.trigger.addEventListener('mouseenter', function () { openMenuName(it.name); });
        it.btn.addEventListener('click', function () { toggleMenuName(it.name); });
    });

    root.addEventListener('mouseleave', closeMenu);

    root.querySelectorAll('.pf-nav-link, .pf-nav-login').forEach(function (el) {
        el.addEventListener('mouseenter', closeMenu);
    });

    // Esc fecha o dropdown aberto
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeMenu();
    });

    // clique fora fecha (útil no touch, onde não há mouseleave)
    document.addEventListener('click', function (e) {
        if (openMenu && !root.contains(e.target)) closeMenu();
    });

    /* ---------- mobile ---------- */
    var btnMobile = document.getElementById('pf-btn-mobile');
    var mobileMenu = document.getElementById('pf-mobile-menu');

    if (btnMobile && mobileMenu) {
        var mobileOpen = false;

        function setMobile(open) {
            mobileOpen = open;
            mobileMenu.style.display = open ? 'block' : 'none';
            btnMobile.setAttribute('aria-expanded', open ? 'true' : 'false');
            btnMobile.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
            document.body.style.overflow = open ? 'hidden' : '';
        }

        btnMobile.addEventListener('click', function () { setMobile(!mobileOpen); });

        // fecha ao navegar
        mobileMenu.querySelectorAll('a').forEach(function (a) {
            a.addEventListener('click', function () { setMobile(false); });
        });

        // fecha se a janela voltar para desktop com o menu aberto
        window.addEventListener('resize', function () {
            if (mobileOpen && window.innerWidth > 991) setMobile(false);
        });
    }
})();


/* --------------------------------------------------------------------------
   TICKER — volume processado
   -------------------------------------------------------------------------- */
(function () {
    var el = document.getElementById('procPct-ticker');
    if (!el) return;
    var val = 1982450000;
    var max = 1999900000;
    setInterval(function () {
        if (val >= max) return;
        val = Math.min(val + (40000 + Math.floor(Math.random() * 170000)), max);
        el.textContent = 'R$ ' + val.toLocaleString('pt-BR');
    }, 1600);
})();


/* --------------------------------------------------------------------------
   CONTADOR — .stat-num[data-count], dispara ao entrar na viewport
   -------------------------------------------------------------------------- */
(function () {
    function animate(el) {
        var raw = el.getAttribute('data-count') || '';
        var m = raw.match(/\d[\d.,]*/);
        if (!m) return; // "minutos" não tem número -- fica como está, igual no original
        var numStr = m[0];
        var target = parseFloat(numStr.replace(/\./g, '').replace(',', '.')) || 0;
        var pfx = raw.slice(0, m.index);
        var sfx = raw.slice(m.index + numStr.length);
        var t0 = null, dur = 1300;
        function step(ts) {
            if (!t0) t0 = ts;
            var p = Math.min(1, (ts - t0) / dur);
            var eased = 1 - Math.pow(1 - p, 3);
            el.textContent = pfx + Math.round(target * eased) + sfx;
            if (p < 1) requestAnimationFrame(step);
            else el.textContent = pfx + target + sfx;
        }
        requestAnimationFrame(step);
    }
    var els = document.querySelectorAll('.stat-num[data-count]');
    if (!els.length || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                animate(entry.target);
                io.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });
    els.forEach(function (el) { io.observe(el); });
})();


/* --------------------------------------------------------------------------
   VALORES EM R$ — .pay-amt[data-amt], recontagem a cada 5,5s
   -------------------------------------------------------------------------- */
(function () {
    function animate(el) {
        var raw = el.getAttribute('data-amt') || '';
        var m = raw.match(/\d[\d.,]*/);
        if (!m) return;
        if (!el.dataset.w) {
            if (!el.classList.contains('no-lock')) {
                el.style.display = 'inline-block';
                el.style.textAlign = 'right';
                el.style.minWidth = el.offsetWidth + 'px';
            }
            el.dataset.w = '1';
        }
        var numStr = m[0];
        var target = parseFloat(numStr.replace(/\./g, '').replace(',', '.')) || 0;
        var pfx = raw.slice(0, m.index);
        var sfx = raw.slice(m.index + numStr.length);
        var dec = (numStr.split(',')[1] || '').length;
        var t0 = null, dur = 1100;
        function fmt(v) { return v.toLocaleString('pt-BR', { minimumFractionDigits: dec, maximumFractionDigits: dec }); }
        function step(ts) {
            if (!t0) t0 = ts;
            var p = Math.min(1, (ts - t0) / dur);
            var e = 1 - Math.pow(1 - p, 3);
            el.textContent = pfx + fmt(target * e) + sfx;
            if (p < 1) requestAnimationFrame(step);
            else el.textContent = raw;
        }
        requestAnimationFrame(step);
    }
    function run() {
        document.querySelectorAll('.pay-amt').forEach(animate);
    }
    setInterval(run, 5500);
    setTimeout(run, 400);
})();


/* --------------------------------------------------------------------------
   MODAL DE VÍDEO — "Como funciona"
   -------------------------------------------------------------------------- */
(function () {
    function bindVideoModal() {
        var openBtn = document.getElementById('como-funciona-video-btn');
        var modal = document.getElementById('veja-ia-video-modal');
        var closeBtn = document.getElementById('veja-ia-video-close');
        var iframe = modal ? modal.querySelector('.v2-youtube-iframe') : null;
        if (!openBtn || !modal) return;
        function openModal(e) {
            e.preventDefault();
            modal.style.display = 'flex';
            if (iframe) {
                var vid = iframe.getAttribute('data-video-id') || 'GH5CFWkt1bM';
                iframe.src = 'https://www.youtube.com/embed/' + vid + '?autoplay=1&rel=0';
            }
        }
        function closeModal(e) {
            if (e) e.preventDefault();
            modal.style.display = 'none';
            if (iframe) iframe.src = '';
        }
        openBtn.addEventListener('click', openModal);
        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
    }
    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', bindVideoModal); } else { bindVideoModal(); }
})();


/* --------------------------------------------------------------------------
   BARRA DE CONTATO — dropdown
   -------------------------------------------------------------------------- */
(function () {
    var btn = document.getElementById('cb-contato-btn');
    var dropdown = document.getElementById('cb-contato-dropdown');
    var arrow = document.getElementById('cb-contato-arrow');
    if (!btn || !dropdown) return;
    function isOpen() { return dropdown.style.display === 'block'; }
    function open() {
        dropdown.style.display = 'block';
        arrow.style.transform = 'rotate(180deg)';
    }
    function close() {
        dropdown.style.display = 'none';
        arrow.style.transform = 'rotate(0deg)';
    }
    btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        isOpen() ? close() : open();
    });
    // fecha se clicar fora
    document.addEventListener('click', function (e) {
        if (isOpen() && !e.target.closest('#cb-contato-wrap')) close();
    });
})();


/* --------------------------------------------------------------------------
   MODAL DE VENDAS — WhatsApp
   -------------------------------------------------------------------------- */
(function () {
    var openBtn = document.getElementById('btn-vendas');
    var overlay = document.getElementById('vendas-modal-overlay');
    var closeBtn = document.getElementById('vendas-modal-close');
    var form = document.querySelector('form[data-name="New Form - Whatsapp"]');
    var successMsg = document.getElementById('vendas-form-success');
    if (!openBtn || !overlay || !form) return;

    function open(e) {
        if (e) e.preventDefault();
        overlay.style.display = 'flex';
    }
    function close() {
        overlay.style.display = 'none';
    }
    openBtn.addEventListener('click', open);
    if (closeBtn) closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        // se chegou ate aqui, o script global (fase de captura) ja validou o e-mail
        form.style.display = 'none';
        if (successMsg) successMsg.style.display = 'block';
        setTimeout(function () {
            window.open(form.getAttribute('data-redirect'), '_blank');
            close();
        }, 900);
    });
})();


/* --------------------------------------------------------------------------
   MARQUEE DE DEPOIMENTOS — duplica os cards para o loop fechar
   -------------------------------------------------------------------------- */
(function () {
    function setupMarquee() {
        var track = document.querySelector('.tm-track-testimonials');
        if (!track || track.dataset.marqueeInit) return;
        track.dataset.marqueeInit = '1';
        var items = Array.prototype.slice.call(track.children);
        items.forEach(function (item) {
            var clone = item.cloneNode(true);
            clone.setAttribute('aria-hidden', 'true'); // duplicata e so visual, nao deve ser lido por leitor de tela
            track.appendChild(clone);
        });
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupMarquee);
    } else {
        setupMarquee();
    }
})();


/* --------------------------------------------------------------------------
   FORM DE DEMO — redireciona para /obrigado
   -------------------------------------------------------------------------- */
(function () {
    var form = document.getElementById('demo-form-view');
    if (!form) return;
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        setTimeout(function () {
            window.location.href = 'https://payfy.io/obrigado';
        }, 150);
    });
})();