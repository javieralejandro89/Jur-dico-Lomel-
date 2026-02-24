/**
 * main.js – Jurídico Lomelí & Asociados
 *
 * Módulos:
 *  1. Navbar scroll effect
 *  2. Menú hamburger / móvil
 *  3. Scroll-reveal (IntersectionObserver)
 *  4. Validación y envío del formulario de contacto
 *  5. Smooth scroll con offset para navbar fijo
 *  6. GTM dataLayer helpers
 */

'use strict';

/* ═══════════════════════════════════════════════
   1. NAVBAR – fondo sólido al hacer scroll
═══════════════════════════════════════════════ */
(function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const onScroll = () => {
    navbar.style.background = window.scrollY > 60
      ? 'rgba(13, 27, 42, 1)'
      : 'rgba(13, 27, 42, 0.97)';
  };

  window.addEventListener('scroll', onScroll, { passive: true });
})();


/* ═══════════════════════════════════════════════
   2. MENÚ HAMBURGER / MÓVIL
═══════════════════════════════════════════════ */
(function initMobileMenu() {
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  if (!hamburger || !mobileMenu) return;

  const openMenu = () => {
    hamburger.classList.add('active');
    mobileMenu.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };

  const closeMenu = () => {
    hamburger.classList.remove('active');
    mobileMenu.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  hamburger.addEventListener('click', () => {
    mobileMenu.classList.contains('open') ? closeMenu() : openMenu();
  });

  // Cerrar al hacer clic en un link del menú móvil
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Cerrar al hacer clic fuera
  document.addEventListener('click', (e) => {
    if (mobileMenu.classList.contains('open') &&
        !mobileMenu.contains(e.target) &&
        !hamburger.contains(e.target)) {
      closeMenu();
    }
  });

  // Cerrar con Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
      closeMenu();
      hamburger.focus();
    }
  });
})();


/* ═══════════════════════════════════════════════
   3. SCROLL REVEAL
═══════════════════════════════════════════════ */
(function initScrollReveal() {
  const elements = document.querySelectorAll('[data-animate]');
  if (!elements.length) return;

  if (!('IntersectionObserver' in window)) {
    elements.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  elements.forEach((el, i) => {
    el.style.transitionDelay = `${(i % 4) * 0.1}s`;
    observer.observe(el);
  });
})();


/* ═══════════════════════════════════════════════
   4. FORMULARIO DE CONTACTO
═══════════════════════════════════════════════ */
(function initContactForm() {
  const form       = document.getElementById('contactForm');
  const successBox = document.getElementById('formSuccess');
  if (!form) return;

  const getField = (id) => document.getElementById(id);
  const getError = (id) => document.getElementById(`${id}-error`);

  const setError = (fieldId, msg) => {
    const field = getField(fieldId);
    const error = getError(fieldId);
    if (field) field.setAttribute('aria-invalid', 'true');
    if (error) error.textContent = msg;
  };

  const clearError = (fieldId) => {
    const field = getField(fieldId);
    const error = getError(fieldId);
    if (field) field.removeAttribute('aria-invalid');
    if (error) error.textContent = '';
  };

  const isEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  // Validación en tiempo real
  const nombreField = getField('nombre');
  const emailField  = getField('email');
  if (nombreField) nombreField.addEventListener('input', () => { if (nombreField.value.trim().length >= 2) clearError('nombre'); });
  if (emailField)  emailField.addEventListener('input',  () => { if (isEmail(emailField.value.trim())) clearError('email'); });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = getField('nombre')?.value.trim() || '';
    const email  = getField('email')?.value.trim()  || '';
    let isValid  = true;

    if (nombre.length < 2) { setError('nombre', 'Por favor, ingresa tu nombre completo.'); isValid = false; }
    else clearError('nombre');

    if (!isEmail(email)) { setError('email', 'Por favor, ingresa un correo electrónico válido.'); isValid = false; }
    else clearError('email');

    if (!isValid) return;

    const submitBtn  = form.querySelector('.btn-submit');
    const origHTML   = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

    try {
      /*
        CONEXIÓN CON BACKEND / SERVICIO DE FORMULARIOS
        ─────────────────────────────────────────────────
        Opción A – Formspree:
          const res = await fetch('https://formspree.io/f/XXXXXXXX', {
            method: 'POST', body: new FormData(form),
            headers: { 'Accept': 'application/json' }
          });
          if (!res.ok) throw new Error('Error de red');

        Opción B – EmailJS:
          await emailjs.sendForm('SERVICE_ID', 'TEMPLATE_ID', form);

        Opción C – Endpoint propio:
          await fetch('/api/contacto', { method: 'POST', body: new FormData(form) });
      */

      // Simulación para demo (eliminar en producción)
      await new Promise(resolve => setTimeout(resolve, 1200));

      form.reset();
      successBox.hidden = false;
      successBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

      pushGTMEvent('form_submit', {
        form_id: 'contacto',
        form_name: 'Consulta Legal',
        area: getField('area')?.value || 'No especificada',
      });

      setTimeout(() => { successBox.hidden = true; }, 6000);

    } catch (err) {
      console.error('Error al enviar:', err);
      setError('email', 'Hubo un error al enviar. Por favor intenta de nuevo.');
    } finally {
      submitBtn.disabled  = false;
      submitBtn.innerHTML = origHTML;
    }
  });
})();


/* ═══════════════════════════════════════════════
   5. SMOOTH SCROLL con offset para navbar fijo
═══════════════════════════════════════════════ */
(function initSmoothScroll() {
  const NAV_HEIGHT = 72;

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - NAV_HEIGHT;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();


/* ═══════════════════════════════════════════════
   6. GTM dataLayer HELPERS
═══════════════════════════════════════════════ */
function pushGTMEvent(eventName, params) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(Object.assign({ event: eventName }, params));
}

(function initCTATracking() {
  // WhatsApp flotante
  const waFloat = document.querySelector('.wa-float');
  if (waFloat) waFloat.addEventListener('click', () => pushGTMEvent('cta_click', { cta_type: 'whatsapp_float' }));

  // Botones dorados CTA
  document.querySelectorAll('.btn-gold').forEach(btn => {
    btn.addEventListener('click', () => pushGTMEvent('cta_click', {
      cta_type: 'consulta_gratuita',
      cta_text: btn.textContent.trim(),
      location: btn.closest('section')?.id || 'unknown',
    }));
  });

  // Teléfono
  document.querySelectorAll('a[href^="tel:"]').forEach(link => {
    link.addEventListener('click', () => pushGTMEvent('phone_click', { phone: link.getAttribute('href') }));
  });

  // Email
  document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
    link.addEventListener('click', () => pushGTMEvent('email_click', { email: link.getAttribute('href') }));
  });
})();