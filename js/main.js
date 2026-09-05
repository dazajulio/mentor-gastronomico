document.addEventListener('DOMContentLoaded', () => {

    // --- Configuración Global de Mentor Gastronómico ---
    const N8N_WEBHOOK_URL = 'https://bot.dazajulio.com/webhook/webhook/chat'; // URL actualizada
    const SECURITY_TOKEN = 'secure-token-placeholder'; // Asegúrate de que coincida con tu nodo Security Check

    // --- Preloader ---
    const preloader = document.getElementById('preloader');
    if (preloader) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                preloader.style.opacity = '0';
                setTimeout(() => {
                    preloader.style.display = 'none';
                    triggerHeroAnimations();
                }, 500);
            }, 1000);
        });
    }

    // --- Hero Parallax Effect ---
    const heroSection = document.querySelector('.hero-section');
    const heroBg = document.querySelector('.hero-bg-img');
    if (heroSection && heroBg) {
        heroSection.addEventListener('mousemove', (e) => {
            const x = (e.clientX / window.innerWidth) * 20;
            const y = (e.clientY / window.innerHeight) * 20;
            heroBg.style.transform = `scale(1.1) translate(${x}px, ${y}px)`;
        });
    }

    // --- Sticky Navbar ---
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // --- Smooth Scroll ---
    document.addEventListener('click', function (e) {
        const anchor = e.target.closest('a[href*="#"]');
        if (!anchor) return;
        const href = anchor.getAttribute('href');
        if (href.startsWith('#') && href.length > 1) {
            e.preventDefault();
            const targetElement = document.querySelector(href);
            if (targetElement) {
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
            }
        }
    });

    // --- Servicios Premium (Flip toggle for mobile/click) ---
    const flipCards = document.querySelectorAll('.flip-card');
    flipCards.forEach(card => {
        card.addEventListener('click', () => {
            const inner = card.querySelector('.flip-card-inner');
            if (inner) {
                inner.classList.toggle('is-flipped');
            }
        });
    });

    // --- Chat Widget Logic (NUEVO VERIFICADO) ---
    const chatTrigger = document.getElementById('chat-trigger-btn');
    const chatWindow = document.getElementById('chat-window');
    const closeChat = document.getElementById('close-chat');
    const sendBtn = document.getElementById('send-btn');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');

    // Abrir/Cerrar
    chatTrigger?.addEventListener('click', () => {
        chatWindow.classList.toggle('active');
        if (chatWindow.classList.contains('active')) chatInput?.focus();
    });
    closeChat?.addEventListener('click', () => chatWindow.classList.remove('active'));

    function appendMessage(type, text) {
        // Asegúrate de usar las clases CSS correctas: user-message / bot-message
        // El snippet sugerido usa 'message user-message'
        const div = document.createElement('div');
        div.className = `message ${type}`;
        div.textContent = text;
        div.id = 'msg-' + Date.now();
        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return div.id;
    }

    function removeMessage(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    }

    async function sendMessage() {
        const message = chatInput.value.trim();
        if (!message) return;

        // 1. Mostrar mensaje usuario
        appendMessage('user-message', message);
        chatInput.value = '';
        chatInput.disabled = true;
        sendBtn.disabled = true;

        // 2. Mostrar indicador de carga
        const typingId = appendMessage('bot-message', 'Escribiendo...');

        try {
            console.log("Enviando a N8N:", N8N_WEBHOOK_URL);
            const response = await fetch(N8N_WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-mentor-token': SECURITY_TOKEN
                },
                body: JSON.stringify({
                    chatInput: message,
                    userId: 'local-tester' // O sessionId si prefieres mantener persistencia
                })
            });

            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

            const data = await response.json();

            // 3. Reemplazar carga con respuesta de n8n
            removeMessage(typingId);
            // Ajustar según lo que devuelve tu n8n: data.output o data.message
            appendMessage('bot-message', data.output || data.message || 'Respuesta recibida.');

        } catch (error) {
            console.error('Error chat:', error);
            removeMessage(typingId);
            appendMessage('bot-message', '❌ Error de conexión. Verifica la consola.');
        } finally {
            chatInput.disabled = false;
            sendBtn.disabled = false;
            chatInput.focus();
        }
    }

    sendBtn?.addEventListener('click', sendMessage);
    chatInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    // Auto Trigger (30 segundos)
    setTimeout(() => {
        if (!chatWindow.classList.contains('active')) {
            // Corrección: appendMessage requiere 'type' en el primer argumento
            appendMessage('bot-message', "¿Te gustaría saber cuánto podrías aumentar tus ventas automatizando con IA?");
            chatWindow.classList.add('active');
        }
    }, 30000);

    function triggerHeroAnimations() {
        const heroInits = document.querySelectorAll('#hero .fade-in-up');
        heroInits.forEach((el, index) => {
            setTimeout(() => el.classList.add('visible'), index * 200);
        });
    }

    // --- Observer para Animaciones al Hacer Scroll ---
    function initScrollAnimations() {
        const observerOptions = {
            threshold: 0.1, // Se activa cuando el 10% del elemento es visible
            rootMargin: "0px 0px -50px 0px"
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target); // Dejar de observar una vez animado
                }
            });
        }, observerOptions);

        // Seleccionamos todos los elementos con la clase .fade-in-up que NO estén en el hero
        // (Los del hero ya se controlan con triggerHeroAnimations, pero por seguridad observamos todos los que no tengan ya la clase visible)
        document.querySelectorAll('.fade-in-up').forEach(el => {
            observer.observe(el);
        });
    }

    // Inicializar el observer
    initScrollAnimations();

    // --- Formulario de Contacto (Webhook Integration) ---
    const contactForm = document.getElementById('contact-form');
    const notificationToast = document.getElementById('form-notification');
    const notificationMessage = document.getElementById('notification-message');

    if (contactForm) {
        contactForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerText;
            submitBtn.innerText = 'Enviando...';
            submitBtn.disabled = true;

            // Recopilar datos
            const formData = new FormData(contactForm);
            const data = {
                nombre: formData.get('nombre'),
                email: formData.get('email'),
                telefono: formData.get('telefono'),
                interes: formData.get('interes'),
                mensaje: formData.get('mensaje'),
                source: 'web_contact_form'
            };

            const WEBHOOK_URL_CONTACT = 'https://bot.dazajulio.com/webhook/0cc63ac4-1cfa-4209-a920-38285e76e035';

            console.log("Enviando formulario a:", WEBHOOK_URL_CONTACT);
            console.log("Datos:", data);

            try {
                const response = await fetch(WEBHOOK_URL_CONTACT, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                console.log("Respuesta formulario status:", response.status);

                if (response.ok) {
                    // Mostrar notificación de éxito
                    showNotification("Gracias por contactarnos ! He recibido tu mensaje y me pondré en contacto contigo lo mas pronto posible. Es hora de hacer realidad tu proyecto!");
                    contactForm.reset();
                } else {
                    console.error("Error respuesta servidor:", response.statusText);
                    showNotification("Hubo un error al enviar tu mensaje. Por favor intenta nuevamente.", true);
                }

            } catch (error) {
                console.error('Error al enviar formulario:', error);
                showNotification("Error de conexión. Verifica tu internet e intenta de nuevo.", true);
            } finally {
                submitBtn.innerText = originalBtnText;
                submitBtn.disabled = false;
            }
        });
    }

    function showNotification(message, isError = false) {
        if (!notificationToast || !notificationMessage) return;

        notificationMessage.innerText = message;

        // Ajustar estilo si es error (opcional, por ahora usamos el estilo base)
        const icon = notificationToast.querySelector('.notification-icon');
        if (isError) {
            icon.style.backgroundColor = '#ff5f56'; // Rojo para error
            icon.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
        } else {
            icon.style.backgroundColor = 'var(--color-accent)';
            icon.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';
        }

        notificationToast.classList.add('show');

        // Ocultar después de 5 segundos
        setTimeout(() => {
            notificationToast.classList.remove('show');
        }, 8000); // Un poco más de tiempo para mensajes largos
    }
    // --- Cookie Banner ---
    const cookieBanner = document.getElementById('cookie-banner');
    const acceptCookiesBtn = document.getElementById('accept-cookies');

    if (cookieBanner && acceptCookiesBtn) {
        if (!localStorage.getItem('cookiesAccepted')) {
            setTimeout(() => cookieBanner.classList.add('show'), 2000);
        }

        acceptCookiesBtn.addEventListener('click', () => {
            localStorage.setItem('cookiesAccepted', 'true');
            cookieBanner.classList.remove('show');
        });
    }

    console.log("Mentor Gastronómico: Ready");
});