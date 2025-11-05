// script.js

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      document.querySelector(this.getAttribute('href')).scrollIntoView({
        behavior: 'smooth'
      });
    });
  });
  
  // Simple fade-in animation when scrolling
  const elements = document.querySelectorAll('.card, .content h2, .content p');

  const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('fade-in');
    }
  });
});

// start observing targets
elements.forEach(el => observer.observe(el));

/* --- Home page micro-animations: stagger features & confetti on CTA --- */
(function(){
  const isIndex = /(^|\/)index\.html$/.test(location.pathname) || location.pathname === '/' || location.pathname.endsWith('\\') ;
  if (!isIndex) return;

  // Stagger reveal of feature cards
  const cards = document.querySelectorAll('.features .card');
  cards.forEach((c, i) => {
    setTimeout(() => c.classList.add('revealed'), 220 * i);
  });

  // Add small confetti burst when CTA clicked
  const cta = document.querySelector('.hero .btn');
  if (!cta) return;

  function spawnConfetti(x,y) {
    const colors = ['#FFD166','#6DD5ED','#A18CD1','#FF9A9E','#FFD59A','#7BF6C1'];
    for (let i=0;i<12;i++){
      const p = document.createElement('span');
      p.className = 'confetti';
      p.style.background = colors[Math.floor(Math.random()*colors.length)];
      // random horizontal velocity variable used by keyframes via CSS var
      const tx = (Math.random()*2 - 1) * 60 + 'px';
      p.style.setProperty('--tx', tx);
      // position relative to button
      const rect = cta.getBoundingClientRect();
      p.style.left = (x || rect.left + rect.width/2) + 'px';
      p.style.top = (y || rect.top + rect.height/2) + 'px';
      p.style.position = 'fixed';
      document.body.appendChild(p);
      // cleanup after animation
      p.addEventListener('animationend', () => p.remove());
    }
  }

  cta.addEventListener('click', (e) => {
    // find center of button for burst
    const r = cta.getBoundingClientRect();
    const cx = Math.round(r.left + r.width/2);
    const cy = Math.round(r.top + r.height/2);
    spawnConfetti(cx, cy);
  });

})();

// Static multiple-choice mini-quiz (no flipping)
(function(){
  const quizData = [
    {
      q: "She ____ to the market yesterday.",
      options: ["goed","went","goes"],
      answer: "went",
      explain: "'Go' becomes 'went' in past tense."
    },
    {
      q: "Which word is an adjective?",
      options: ["Run","Beautiful","Quickly"],
      answer: "Beautiful",
      explain: "Adjectives describe nouns (e.g., 'beautiful')."
    },
    {
      q: "Pick the correct article: 'I saw ____ owl.'",
      options: ["a","the","an"],
      answer: "an",
      explain: "'Owl' begins with a vowel sound → use 'an'."
    }
  ];

  const grid = document.getElementById('quiz-grid');
  const scoreEl = document.getElementById('quiz-score');
  const totalEl = document.getElementById('quiz-total');
  if (!grid || !scoreEl || !totalEl) return;

  // prepare grid container class for new layout
  grid.classList.remove('quiz-grid');
  grid.classList.add('mc-quiz-grid');

  totalEl.textContent = String(quizData.length);
  let score = 0;

  function updateScore() {
    scoreEl.textContent = String(score);
  }

  function createCard(item, idx) {
    const card = document.createElement('div');
    card.className = 'mc-card';
    card.setAttribute('role','group');
    card.setAttribute('aria-labelledby', `q-${idx}`);

    const qEl = document.createElement('div');
    qEl.className = 'mc-question';
    qEl.id = `q-${idx}`;
    qEl.innerHTML = `<strong>Q${idx+1}.</strong> ${item.q}`;

    const optionsWrap = document.createElement('div');
    optionsWrap.className = 'mc-options';
    optionsWrap.setAttribute('role','radiogroup');
    optionsWrap.setAttribute('aria-label', `Options for question ${idx+1}`);

    item.options.forEach(opt => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'option-btn';
      btn.textContent = opt;
      btn.setAttribute('role','radio');
      btn.setAttribute('aria-checked','false');

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        // ignore if already answered
        if (btn.disabled) return;
        // disable all options for this question
        Array.from(optionsWrap.children).forEach(b => {
          b.disabled = true;
          b.setAttribute('aria-checked','false');
        });
        // grade
        if (opt === item.answer) {
          btn.classList.add('correct');
          btn.setAttribute('aria-checked','true');
          score++;
          updateScore();
        } else {
          btn.classList.add('incorrect');
          // mark correct option
          Array.from(optionsWrap.children).forEach(b => {
            if (b.textContent === item.answer) {
              b.classList.add('correct');
              b.setAttribute('aria-checked','true');
            }
          });
        }
        // show explanation
        const fb = document.createElement('div');
        fb.className = 'mc-feedback';
        fb.textContent = item.explain;
        card.appendChild(fb);
      });

      optionsWrap.appendChild(btn);
    });

    card.appendChild(qEl);
    card.appendChild(optionsWrap);

    return card;
  }

  // clear existing content then render
  grid.innerHTML = '';
  quizData.forEach((it, i) => grid.appendChild(createCard(it, i)));
  updateScore();
})();

// Card tilt effect (mouse) and ripple on card buttons
(function(){
  const cards = document.querySelectorAll('.features .card');
  if (cards.length === 0) return;

  // tilt on mousemove
  cards.forEach(card => {
    card.classList.add('tilt');
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      const rotateX = (y * 6).toFixed(2);
      const rotateY = (x * -6).toFixed(2);
      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  // ripple on card buttons
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.card-btn');
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const r = document.createElement('span');
    r.className = 'ripple';
    const size = Math.max(rect.width, rect.height);
    r.style.width = r.style.height = size + 'px';
    r.style.left = (e.clientX - rect.left - size/2) + 'px';
    r.style.top = (e.clientY - rect.top - size/2) + 'px';
    btn.appendChild(r);
    r.addEventListener('animationend', () => r.remove());
  });
})();

/* Member page: modal + reveal on scroll */
(function(){
  const grid = document.getElementById('member-grid');
  if (!grid) return;

  // Modal elements
  const modal = document.getElementById('member-modal');
  const modalName = document.getElementById('modal-name');
  const modalRole = document.getElementById('modal-role');
  const modalBio = document.getElementById('modal-bio');
  const modalAvatar = document.getElementById('modal-avatar');
  const modalLinks = document.getElementById('modal-links');
  const modalEmail = document.getElementById('modal-email');
  const closeBtn = modal.querySelector('.modal-close');

  function openModal(dataEl){
    modal.setAttribute('aria-hidden','false');
    const name = dataEl.dataset.name || '';
    const role = dataEl.dataset.role || '';
    const bio = dataEl.dataset.bio || '';
    const email = dataEl.dataset.email || '';
    const links = JSON.parse(dataEl.dataset.links || '{}');

    modalName.textContent = name;
    modalRole.textContent = role;
    modalBio.textContent = bio;
    modalAvatar.src = dataEl.querySelector('.member-avatar')?.src || '';
    modalAvatar.alt = name;
    modalEmail.href = `mailto:${email}`;
    modalEmail.textContent = 'Email';

    // build social links
    modalLinks.innerHTML = '';
    Object.keys(links).forEach(k => {
      const a = document.createElement('a');
      a.href = links[k];
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = k;
      modalLinks.appendChild(a);
    });

    // trap focus minimally
    closeBtn.focus();
  }

  function closeModal(){
    modal.setAttribute('aria-hidden','true');
  }

  // delegate view-profile buttons and keyboard enter on card
  grid.addEventListener('click', (e) => {
    const btn = e.target.closest('.view-profile');
    if (btn) {
      const card = btn.closest('.member-card');
      openModal(card);
    }
  });
  grid.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.closest('.member-card')) {
      e.preventDefault();
      openModal(e.target.closest('.member-card'));
    }
  });

  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') closeModal(); });

  // reveal on scroll
  const cards = document.querySelectorAll('.member-card');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add('reveal');
        obs.unobserve(en.target);
      }
    });
  }, { threshold: 0.18 });

  cards.forEach(c => obs.observe(c));
})();

// TOC active highlight for lesson-plans
(function(){
  const tocLinks = document.querySelectorAll('.lesson-overview nav a[href^="#"]');
  if (!tocLinks || tocLinks.length === 0) return;

  // ensure smooth scroll on click (fallback)
  tocLinks.forEach(a => a.addEventListener('click', (e) => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.replaceState(null, '', a.getAttribute('href'));
  }));

  // observe sections to toggle active class on TOC links
  const sections = Array.from(tocLinks).map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.target.id) return;
      const link = document.querySelector('.lesson-overview nav a[href="#' + entry.target.id + '"]');
      if (!link) return;
      if (entry.isIntersecting) {
        document.querySelectorAll('.lesson-overview nav a').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      }
    });
  }, { rootMargin: '-30% 0px -55% 0px', threshold: 0 });

  sections.forEach(s => io.observe(s));
})();

(function(){
  const toggle = document.querySelector('.nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  if (!toggle || !navMenu) return;

  function setOpen(open) {
    document.body.classList.toggle('nav-open', open);
    toggle.setAttribute('aria-expanded', String(Boolean(open)));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    setOpen(!document.body.classList.contains('nav-open'));
  });

  // close when a nav link is clicked (mobile)
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.addEventListener('click', () => setOpen(false));
  });

  // close on ESC or click outside menu
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('nav-open')) setOpen(false);
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.navbar') && document.body.classList.contains('nav-open')) setOpen(false);
  });

  // ensure menu is closed when resizing to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth > 900 && document.body.classList.contains('nav-open')) setOpen(false);
  });
})();
  
  // CSS fade-in class addition (add this in style.css):
  // .fade-in { opacity: 1; transform: translateY(0); transition: all 0.6s ease-in; }
  // .card, .content h2, .content p { opacity: 0; transform: translateY(20px); }
  