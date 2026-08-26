// Garip Umut Kaya — site behavior
const UI_STRINGS = {
  en: {
    "nav.about": "About", "nav.concerts": "Concerts", "nav.media": "Media", "nav.contact": "Contact",
    "hero.eyebrow": "Opera & Concert", "hero.scroll": "Scroll",
    "about.title": "Biography",
    "concerts.title": "Upcoming Concerts", "concerts.empty": "No concerts announced at the moment.",
    "media.title": "Recordings",
    "contact.title": "Booking & Contact",
    "contact.intro": "For concert engagements, recitals, opera productions and general inquiries, please reach out directly or use the form.",
    "contact.form.name": "Name", "contact.form.email": "Email", "contact.form.message": "Message",
    "contact.form.submit": "Send", "contact.form.note": "Sent directly — no account or newsletter sign-up."
  },
  de: {
    "nav.about": "Über mich", "nav.concerts": "Konzerte", "nav.media": "Aufnahmen", "nav.contact": "Kontakt",
    "hero.eyebrow": "Oper & Konzert", "hero.scroll": "Scrollen",
    "about.title": "Biografie",
    "concerts.title": "Kommende Konzerte", "concerts.empty": "Derzeit keine Konzerte angekündigt.",
    "media.title": "Aufnahmen",
    "contact.title": "Buchung & Kontakt",
    "contact.intro": "Für Konzertengagements, Liederabende, Opernproduktionen und allgemeine Anfragen kontaktieren Sie mich bitte direkt oder nutzen Sie das Formular.",
    "contact.form.name": "Name", "contact.form.email": "E-Mail", "contact.form.message": "Nachricht",
    "contact.form.submit": "Senden", "contact.form.note": "Wird direkt gesendet — kein Konto, kein Newsletter."
  },
  it: {
    "nav.about": "Biografia", "nav.concerts": "Concerti", "nav.media": "Registrazioni", "nav.contact": "Contatti",
    "hero.eyebrow": "Opera & Concerto", "hero.scroll": "Scorri",
    "about.title": "Biografia",
    "concerts.title": "Prossimi Concerti", "concerts.empty": "Nessun concerto annunciato al momento.",
    "media.title": "Registrazioni",
    "contact.title": "Prenotazioni & Contatti",
    "contact.intro": "Per ingaggi concertistici, recital, produzioni operistiche e richieste generali, contattatemi direttamente o utilizzate il modulo.",
    "contact.form.name": "Nome", "contact.form.email": "Email", "contact.form.message": "Messaggio",
    "contact.form.submit": "Invia", "contact.form.note": "Inviato direttamente — nessun account o iscrizione."
  }
};

let currentLang = "en";
let CONTENT = { settings: null, bio: null, concerts: [], media: [] };

async function loadContent(){
  const [settings, bio, concertsFile, mediaFile] = await Promise.all([
    fetch('content/settings.json').then(r => r.json()).catch(() => null),
    fetch('content/bio.json').then(r => r.json()).catch(() => null),
    fetch('content/concerts.json').then(r => r.json()).catch(() => ({ items: [] })),
    fetch('content/media.json').then(r => r.json()).catch(() => ({ items: [] }))
  ]);
  CONTENT = { settings, bio, concerts: (concertsFile && concertsFile.items) || [], media: (mediaFile && mediaFile.items) || [] };
  renderAll();
}

function applyUIStrings(){
  document.documentElement.lang = currentLang;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const str = UI_STRINGS[currentLang][key];
    if (str) el.innerHTML = str;
  });
  document.querySelectorAll('#langSwitch button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === currentLang);
  });
}

function resolveImagePath(path){
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  return path.startsWith('/') ? path : '/' + path;
}

function renderSettings(){
  const s = CONTENT.settings;
  if (!s) return;
  document.querySelector('.nav__name').textContent = s.artist_name || 'Garip Umut Kaya';
  document.querySelector('.hero__name').textContent = s.artist_name || 'Garip Umut Kaya';
  document.title = (s.artist_name || 'Garip Umut Kaya') + ' — ' + (s.tagline?.en || 'Tenor');

  const tagline = s.tagline?.[currentLang] || s.tagline?.en || '';
  document.getElementById('heroTagline').textContent = tagline;

  if (s.email){
    const emailEl = document.getElementById('contactEmail');
    emailEl.textContent = s.email;
    emailEl.href = 'mailto:' + s.email;
  }
  if (s.location){
    document.getElementById('contactLocation').textContent = s.location;
  }

  const heroPortrait = document.getElementById('heroPortrait');
  const heroPortraitImg = document.getElementById('heroPortraitImg');
  if (s.hero_image){
    heroPortraitImg.src = resolveImagePath(s.hero_image);
    heroPortraitImg.alt = s.artist_name || '';
    heroPortrait.hidden = false;
  } else {
    heroPortrait.hidden = true;
  }

  const aboutImage = document.getElementById('aboutImage');
  const aboutImageImg = document.getElementById('aboutImageImg');
  const aboutLayout = document.getElementById('aboutLayout');
  if (s.bio_image){
    aboutImageImg.src = resolveImagePath(s.bio_image);
    aboutImageImg.alt = s.artist_name || '';
    aboutImage.hidden = false;
    aboutLayout.classList.remove('no-image');
  } else {
    aboutImage.hidden = true;
    aboutLayout.classList.add('no-image');
  }

  const social = document.getElementById('footerSocial');
  social.innerHTML = '';
  [['Instagram', s.instagram_url], ['YouTube', s.youtube_url], ['Facebook', s.facebook_url]]
    .filter(([, url]) => url)
    .forEach(([label, url]) => {
      const a = document.createElement('a');
      a.href = url; a.textContent = label; a.target = '_blank'; a.rel = 'noopener';
      social.appendChild(a);
    });
}

function renderBio(){
  const bio = CONTENT.bio;
  const el = document.getElementById('bioText');
  if (!bio || !bio[currentLang]){ el.innerHTML = ''; return; }
  el.innerHTML = bio[currentLang].split('\n\n').map(p => `<p>${p}</p>`).join('');
}

function formatDate(iso){
  try{
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString(currentLang === 'en' ? 'en-GB' : currentLang, { day: '2-digit', month: 'short', year: 'numeric' });
  }catch(e){ return iso; }
}

function renderConcerts(){
  const list = document.getElementById('concertList');
  const items = CONTENT.concerts || [];
  if (!items.length){
    list.innerHTML = `<li class="concert--empty">${UI_STRINGS[currentLang]["concerts.empty"]}</li>`;
    return;
  }
  list.innerHTML = items.map(c => `
    <li class="concert">
      <div class="concert__date">${formatDate(c.date)}</div>
      <div class="concert__info">
        <h3>${(c.program && (c.program[currentLang] || c.program.en)) || ''}</h3>
        <div class="concert__venue">${c.venue || ''}${c.city ? ' · ' + c.city : ''}</div>
      </div>
      ${c.ticket_url ? `<a class="concert__link" href="${c.ticket_url}" target="_blank" rel="noopener">Tickets</a>` : ''}
    </li>
  `).join('');
}

function renderMedia(){
  const grid = document.getElementById('mediaGrid');
  const items = CONTENT.media || [];
  grid.innerHTML = items.map(m => {
    const title = (m.title && (m.title[currentLang] || m.title.en)) || '';
    let frame = `<div class="media-card__frame">—</div>`;
    if (m.type === 'video' && m.youtube_id){
      frame = `<div class="media-card__frame"><iframe src="https://www.youtube.com/embed/${m.youtube_id}" title="${title}" allowfullscreen loading="lazy"></iframe></div>`;
    } else if (m.type === 'audio' && m.embed_url){
      frame = `<div class="media-card__frame"><audio controls src="${m.embed_url}"></audio></div>`;
    }
    return `<div class="media-card">${frame}<div class="media-card__title">${title}</div></div>`;
  }).join('');
}

function renderAll(){
  applyUIStrings();
  renderSettings();
  renderBio();
  renderConcerts();
  renderMedia();
}

function setLang(lang){
  currentLang = lang;
  renderAll();
}

document.getElementById('navToggle').addEventListener('click', () => {
  const links = document.getElementById('navLinks');
  const open = links.classList.toggle('open');
  document.getElementById('navToggle').setAttribute('aria-expanded', String(open));
});

document.getElementById('langSwitch').addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-lang]');
  if (btn) setLang(btn.dataset.lang);
});

document.getElementById('year').textContent = new Date().getFullYear();

window.addEventListener('load', () => {
  requestAnimationFrame(() => {
    document.getElementById('curtain').classList.add('curtain--open');
  });
  setTimeout(() => {
    document.getElementById('curtain').style.display = 'none';
  }, 1300);
});

loadContent();
