/* Utopian Space — app.js v8 (single, safe file) */
'use strict';

/* ========== Tiny utils ========== */
const $  = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
function toast(msg){
  const t = document.createElement('div');
  t.textContent = msg;
  Object.assign(t.style,{
    position:'fixed',left:'50%',bottom:'24px',transform:'translateX(-50%)',
    background:'rgba(0,0,0,.9)',color:'#fff',padding:'10px 14px',
    borderRadius:'10px',border:'1px solid rgba(255,255,255,.2)',zIndex:1000
  });
  document.body.appendChild(t); setTimeout(()=>t.remove(),2200);
}

/* ========== Header / Nav (null-safe) ========== */
(function initHeader(){
  const run = () => {
    const menuBtn   = $('#menuBtn');
    const primary   = $('#primaryNav');
    const mobile    = $('#mobileNav');

    if (menuBtn && primary) {
      menuBtn.addEventListener('click', () => {
        const isOpen = primary.classList.toggle('open');
        menuBtn.setAttribute('aria-expanded', String(isOpen));
        if (mobile){
          mobile.style.display = isOpen ? 'block' : 'none';
          if (isOpen) mobile.innerHTML = primary.innerHTML;
        }
      });
    }

    // Highlight current (safe on pages without these links)
    const file = location.pathname.split('/').pop() || 'index.html';
    $$('#primaryNav a').forEach(a=>{
      const href = a.getAttribute('href') || '';
      a.setAttribute('aria-current', href.endsWith(file) ? 'page' : 'false');
    });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
})();

/* ========== Modal (safe no-op if elements missing) ========== */
let modalRef=null, modalBodyRef=null;
function attachModal(){
  modalRef = $('#modal'); modalBodyRef = $('#modalBody');
  window.closeModal = () => { if (modalRef) { modalRef.close(); if (modalBodyRef) modalBodyRef.innerHTML=''; } };
}
function openModal(html){
  if (modalRef && modalBodyRef){ modalBodyRef.innerHTML = html; modalRef.showModal(); }
  else { toast('Modal unavailable on this page.'); }
}
window.openModal = openModal;

/* ========== Demo content (home) ========== */
function daysFromNow(n){ const d=new Date(); d.setDate(d.getDate()+n); return d; }

const COURSES = [
  { title:'Poetry that Breathes', slug:'poetry-that-breathes', summary:'Write poems with pulse and purpose.',
    priceINR:100, priceUSD:2, level:'Beginner', language:'en', isLive:true, cover:'#7C3AED',
    trailer:'https://player.vimeo.com/video/123456' },
  { title:'Foundations of Coding for Creators', slug:'coding-for-creators', summary:'Build tools for your art.',
    priceINR:499, priceUSD:8, level:'Beginner', language:'en', isLive:false, cover:'#A855F7' },
  { title:'Filmmaking: Shots to Stories', slug:'filmmaking-shots-to-stories', summary:'From frames to films.',
    priceINR:999, priceUSD:14, level:'Intermediate', language:'en', isLive:true, cover:'#FF4ECD' },
  { title:'Esports: Competitive Mindset', slug:'esports-competitive-mindset', summary:'Train like a pro.',
    priceINR:299, priceUSD:5, level:'All', language:'en', isLive:true, cover:'#6b21a8' },
];

const EVENTS = [
  { title:'Utopian Space — Global Launch', slug:'global-launch', startsAt:daysFromNow(7),
    summary:'Announcing divisions, programs, and our first anthology.', priceINR:0, virtual:true },
  { title:'Live Class: Poetry that Breathes (Kickoff)', slug:'poetry-kickoff', startsAt:daysFromNow(10),
    summary:'First live session and Q&A.', priceINR:100, virtual:true },
  { title:'Esports Community Scrim Night', slug:'esports-scrim-night', startsAt:daysFromNow(14),
    summary:'Teams scrim, open signup.', priceINR:0, virtual:true },
];

const POSTS = [
  { title:'Welcome to Utopian Space Blog', excerpt:'Craft notes, class drops, and BTS.', date:'2025-08-01' },
  { title:'How to Build a Daily Practice', excerpt:'Small reps, big returns.', date:'2025-08-05' },
  { title:'From Draft to Release', excerpt:'Ship your work with care.', date:'2025-08-08' },
  { title:'The Competitive Mindset', excerpt:'Habits for high-stakes play.', date:'2025-08-10' },
  { title:'Animation: Texture & Timing', excerpt:'Make frames breathe.', date:'2025-08-11' },
];

function renderCourses(){
  const grid = $('#courseGrid'); if (!grid) return;
  const q = ($('#q')?.value || '').toLowerCase();
  const lvl = $('#level')?.value || '';
  const lang = $('#lang')?.value || '';
  const cur = $('#currency')?.value || 'INR';

  grid.innerHTML = '';
  COURSES.filter(c =>
    (!lvl || c.level===lvl) &&
    (!lang || c.language===lang) &&
    (!q || c.title.toLowerCase().includes(q) || c.summary.toLowerCase().includes(q))
  ).forEach(c=>{
    const price = cur==='USD' ? '$'+(c.priceUSD ?? Math.round(c.priceINR/82)) : '₹'+c.priceINR;
    const trailerBtn = c.trailer ? `<button class="btn btn-outline" data-trailer="${c.trailer}">Watch Trailer</button>` : '';
    const el = document.createElement('article');
    el.className='glass card'; el.setAttribute('role','listitem');
    el.innerHTML = `
      <div style="aspect-ratio:16/9;border-radius:12px;background:${c.cover};margin-bottom:8px"></div>
      <h3 style="margin:.3em 0">${c.title}</h3>
      <p class="muted">${c.summary}</p>
      <div style="display:flex;gap:8px;align-items:center;margin:.6em 0">
        <span class="tag">${c.level}</span><span class="tag">${c.language}</span>
        ${c.isLive ? '<span class="tag">Live</span>' : ''}<span class="tag">${price}</span>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        ${trailerBtn}
        <button class="btn btn-primary enroll-btn" data-slug="${c.slug}" data-title="${c.title}" data-starts-at="">Enroll</button>
      </div>`;
    grid.appendChild(el);
  });

  grid.querySelectorAll('[data-trailer]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      openModal(
        `<div style="position:relative;padding-bottom:56.25%;height:0;">
           <iframe title="Trailer" src="${btn.dataset.trailer}" style="position:absolute;inset:0;width:100%;height:100%;border:0" allow="autoplay; fullscreen; picture-in-picture"></iframe>
         </div>`
      );
    });
  });
}

function renderEvents(){
  const grid = $('#eventGrid'); if (!grid) return;
  grid.innerHTML='';
  EVENTS.forEach(e=>{
    const el = document.createElement('article');
    el.className='glass card';
    el.innerHTML = `
      <h3 style="margin:.3em 0">${e.title}</h3>
      <p class="muted">${e.summary}</p>
      <p class="muted"><strong>Starts:</strong> ${e.startsAt.toLocaleString()} &nbsp; <strong>Price:</strong> ₹${e.priceINR}</p>
      <a class="btn btn-outline" href="about.html">Details</a>`;
    grid.appendChild(el);
  });
}

function renderPosts(){
  const grid = $('#blogGrid'); if (!grid) return;
  grid.innerHTML='';
  POSTS.forEach(p=>{
    const el=document.createElement('article');
    el.className='glass card';
    el.innerHTML = `<h3 style="margin:.3em 0">${p.title}</h3><p class="muted">${p.excerpt}</p><span class="tag">${p.date}</span>`;
    grid.appendChild(el);
  });
}

/* ========== Forms (safe) ========== */
function mountEmailCapture(){
  const form = $('#emailForm'); const msg = $('#emailMsg'); if (!form) return;
  form.addEventListener('submit', ()=>{
    const email = $('#email')?.value?.trim(); const ref = $('#ref')?.value?.trim();
    if (!email) return;
    try { localStorage.setItem('us_subscribers', JSON.stringify([...(JSON.parse(localStorage.getItem('us_subscribers')||'[]')), email])); } catch {}
    if (msg) msg.textContent = `Thanks! We’ll notify you at ${email}${ref?` (ref ${ref})`:''}.`;
  });
}
function mountRecruit(){
  const form = $('#recruitForm'); const msg = $('#recruitMsg'); if (!form) return;
  form.addEventListener('submit', ()=>{ if (msg) msg.textContent='Thanks! We’ll get back to you within 48 hours.'; });
}

/* ========== Local-first Auth & Profile (USAuth) ========== */
(function(){
  const LS_USERS='us_users', LS_SESSION='us_session';
  const enc = new TextEncoder();

  const uid = ()=>'u_'+Math.random().toString(36).slice(2)+Date.now().toString(36);
  const toB64 = buf => btoa(String.fromCharCode(...new Uint8Array(buf)));
  const fromB64 = b64 => Uint8Array.from(atob(b64), c => c.charCodeAt(0));

  function getUsers(){ try { return JSON.parse(localStorage.getItem(LS_USERS)||'[]'); } catch { return []; } }
  function saveUsers(arr){ localStorage.setItem(LS_USERS, JSON.stringify(arr)); }
  function setSession(userId){ localStorage.setItem(LS_SESSION, JSON.stringify({userId, at:Date.now()})); }
  function clearSession(){ localStorage.removeItem(LS_SESSION); }
  function getSession(){ try { return JSON.parse(localStorage.getItem(LS_SESSION)||'null'); } catch { return null; } }

  async function hashPassword(password, saltB64, iterations=150000){
    const salt = saltB64 ? fromB64(saltB64) : crypto.getRandomValues(new Uint8Array(16));
    const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits({name:'PBKDF2', hash:'SHA-256', salt, iterations}, keyMaterial, 256);
    return {hash:toB64(bits), salt:toB64(salt), iterations};
  }

  async function register({username,email,password,name=''}) {
    username=(username||'').trim(); email=(email||'').trim().toLowerCase();
    if (!username || !email || !password) throw new Error('All fields are required.');
    const users=getUsers();
    if (users.some(u=>u.username.toLowerCase()===username.toLowerCase())) throw new Error('Username already taken.');
    if (users.some(u=>u.email===email)) throw new Error('Email already registered.');
    const pass = await hashPassword(password);
    const user = { id:uid(), username, email, pass, name, bio:'', links:{website:'',instagram:'',twitter:''}, library:[], schedules:[], createdAt:new Date().toISOString(), updatedAt:new Date().toISOString() };
    users.push(user); saveUsers(users); setSession(user.id); return user;
  }

  async function login({identifier,password}){
    const id=(identifier||'').trim().toLowerCase();
    const u=getUsers().find(u=>u.username.toLowerCase()===id||u.email===id);
    if (!u) throw new Error('Account not found.');
    const {hash} = await hashPassword(password, u.pass.salt, u.pass.iterations);
    if (hash !== u.pass.hash) throw new Error('Invalid credentials.');
    setSession(u.id); return u;
  }

  function logout(){ clearSession(); }
  function currentUser(){ const s=getSession(); if(!s) return null; return getUsers().find(u=>u.id===s.userId)||null; }
  function updateUser(partial){ const u=currentUser(); if(!u) throw new Error('Not signed in.');
    const users=getUsers(); const i=users.findIndex(x=>x.id===u.id); users[i]={...u,...partial,updatedAt:new Date().toISOString()}; saveUsers(users); return users[i]; }
  async function changePassword({currentPassword,newPassword}){ const u=currentUser(); if(!u) throw new Error('Not signed in.');
    const {hash}=await hashPassword(currentPassword,u.pass.salt,u.pass.iterations); if(hash!==u.pass.hash) throw new Error('Security check failed: current password is incorrect.');
    if(!newPassword||newPassword.length<8) throw new Error('New password must be at least 8 characters.'); const next=await hashPassword(newPassword); return updateUser({pass:next}); }

  function addToLibrary(item){ const u=currentUser(); if(!u) throw new Error('Sign in first.');
    if(!u.library.find(x=>x.type===item.type&&x.id===item.id)){ u.library.push({...item,addedAt:new Date().toISOString()}); updateUser({library:u.library}); } return u.library; }
  function addToSchedule(evt){ const u=currentUser(); if(!u) throw new Error('Sign in first.');
    if(!u.schedules.find(x=>x.id===evt.id)){ u.schedules.push({...evt,addedAt:new Date().toISOString()}); updateUser({schedules:u.schedules}); } return u.schedules; }

  // Delegate demo actions
  document.addEventListener('click', e=>{
    const t=e.target; if(!(t instanceof HTMLElement)) return;
    if (t.matches('button') && t.textContent?.trim().toLowerCase()==='buy'){
      try{ addToLibrary({type:'book', id:'ink-ashes', title:'Ink & Ashes'}); toast('Added to your library'); }catch(err){ toast(err.message); }
    }
    if (t.classList.contains('enroll-btn')){
      try{ addToSchedule({id:t.dataset.slug, title:t.dataset.title, startsAt:t.dataset.startsAt||''}); toast('Enrollment saved locally'); }catch(err){ toast(err.message); }
    }
  });

  // Header CTA
  function renderAuthCta(){
    const el = document.getElementById('authArea'); if(!el) return;
    const u=currentUser();
    if(u){
      el.innerHTML = `<a class="btn btn-outline" href="auth.html">My Profile</a><button class="btn btn-primary" id="logoutBtn">Logout</button>`;
      document.getElementById('logoutBtn')?.addEventListener('click', ()=>{ logout(); location.href='index.html'; });
    }else{
      el.innerHTML = `<a class="btn btn-outline" href="auth.html#login">Login</a><a class="btn btn-primary" href="auth.html#register">Get Started</a>`;
    }
  }

  function viewGuest(){ return `
    <div class="glass card" style="grid-column:1/-1">
      <p class="muted">You are using the website as a <strong>Guest</strong>. Create an account or log in to see your profile, library, and schedules.</p>
    </div>
    <div class="glass card"><h3>Login</h3>
      <form id="loginForm" class="grid">
        <div class="field"><label>Username or Email</label><input class="input" name="identifier" required autocomplete="username"></div>
        <div class="field"><label>Password</label><input class="input" name="password" type="password" required autocomplete="current-password"></div>
        <button class="btn btn-primary">Login</button><p id="loginMsg" class="muted" role="status"></p>
      </form>
    </div>
    <div class="glass card"><h3>Register</h3>
      <form id="regForm" class="grid">
        <div class="field"><label>Username</label><input class="input" name="username" required></div>
        <div class="field"><label>Email</label><input class="input" type="email" name="email" required autocomplete="email"></div>
        <div class="field"><label>Name (optional)</label><input class="input" name="name"></div>
        <div class="field"><label>Password</label><input class="input" type="password" name="password" required autocomplete="new-password" minlength="8"></div>
        <button class="btn btn-primary">Create Account</button>
        <p class="hint">Passwords are stored locally with salted PBKDF2 (never sent anywhere).</p>
        <p id="regMsg" class="muted" role="status"></p>
      </form>
    </div>`; }

  function viewSignedIn(u){
    const lib = u.library.map(x=>`<li><strong>${x.title}</strong> <span class="muted">(${x.type})</span></li>`).join('') || '<li class="muted">Nothing yet.</li>';
    const sch = u.schedules.map(x=>`<li><strong>${x.title}</strong> <span class="muted">${x.startsAt||''}</span></li>`).join('') || '<li class="muted">No upcoming items.</li>';
    return `
    <div class="glass card"><h3>Profile</h3>
      <form id="profileForm" class="grid">
        <div class="field"><label>Username</label><input class="input" name="username" value="${u.username}" disabled></div>
        <div class="field"><label>Email</label><input class="input" name="email" value="${u.email}" disabled></div>
        <div class="field"><label>Name</label><input class="input" name="name" value="${u.name||''}"></div>
        <div class="field"><label>Bio</label><textarea class="textarea" name="bio" rows="3">${u.bio||''}</textarea></div>
        <div class="field"><label>Website</label><input class="input" name="website" value="${u.links?.website||''}"></div>
        <div class="field"><label>Instagram</label><input class="input" name="instagram" value="${u.links?.instagram||''}"></div>
        <div class="field"><label>Twitter/X</label><input class="input" name="twitter" value="${u.links?.twitter||''}"></div>
        <button class="btn btn-primary">Save</button><p id="profileMsg" class="muted" role="status"></p>
      </form>
    </div>
    <div class="glass card"><h3>Security</h3>
      <form id="pwForm" class="grid">
        <div class="field"><label>Current password</label><input class="input" name="currentPassword" type="password" required autocomplete="current-password"></div>
        <div class="field"><label>New password</label><input class="input" name="newPassword" type="password" required autocomplete="new-password" minlength="8"></div>
        <button class="btn btn-primary">Change Password</button><p id="pwMsg" class="muted" role="status"></p>
      </form>
      <button id="logoutBtn2" class="btn btn-outline" style="margin-top:8px">Logout</button>
    </div>
    <div class="glass card"><h3>My Library</h3><ul style="margin:0;padding-left:18px">${lib}</ul></div>
    <div class="glass card"><h3>Upcoming</h3><ul style="margin:0;padding-left:18px">${sch}</ul></div>`; }

  function renderAccountPage(){
    const root = document.getElementById('accountApp'); if (!root) return;
    const u = currentUser(); root.innerHTML = u ? viewSignedIn(u) : viewGuest();

    const lf = document.getElementById('loginForm');
    lf?.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const fd = new FormData(lf);
      document.getElementById('loginMsg').textContent = 'Signing in…';
      try { await login({identifier: fd.get('identifier'), password: fd.get('password')}); location.reload(); }
      catch(err){ document.getElementById('loginMsg').textContent = err.message; }
    });

    const rf = document.getElementById('regForm');
    rf?.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const fd = new FormData(rf);
      document.getElementById('regMsg').textContent = 'Creating account…';
      try { await register({username: fd.get('username'), email: fd.get('email'), password: fd.get('password'), name: fd.get('name')}); location.reload(); }
      catch(err){ document.getElementById('regMsg').textContent = err.message; }
    });

    const pf = document.getElementById('profileForm');
    pf?.addEventListener('submit', (e)=>{
      e.preventDefault();
      const fd = new FormData(pf);
      const u = currentUser(); if (!u) return;
      updateUser({ name: fd.get('name'), bio: fd.get('bio'),
        links:{ website: fd.get('website'), instagram: fd.get('instagram'), twitter: fd.get('twitter') }});
      document.getElementById('profileMsg').textContent='Saved.';
    });

    const pw = document.getElementById('pwForm');
    pw?.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const fd = new FormData(pw);
      document.getElementById('pwMsg').textContent='Checking…';
      try { await changePassword({currentPassword: fd.get('currentPassword'), newPassword: fd.get('newPassword')});
        document.getElementById('pwMsg').textContent='Password updated.'; pw.reset(); }
      catch(err){ document.getElementById('pwMsg').textContent = err.message; }
    });

    document.getElementById('logoutBtn2')?.addEventListener('click', ()=>{ logout(); location.href='index.html'; });
  }

  // Expose
  window.USAuth = { renderAuthCta, renderAccountPage, addToLibrary, addToSchedule, currentUser };

  // Render CTA on load
  window.addEventListener('DOMContentLoaded', renderAuthCta);
})();

/* ========== Page boot ========== */
window.addEventListener('DOMContentLoaded', ()=>{
  const file = location.pathname.split('/').pop() || 'index.html';
  attachModal();

  // prevent dead '#' navigations from scrolling
  $$('#primaryNav a, #mobileNav a').forEach(a=>{
    if (a.getAttribute('href')?.startsWith('#')) a.addEventListener('click', e=>e.preventDefault());
  });

  if (file === 'index.html'){
    renderCourses(); renderEvents(); renderPosts(); mountEmailCapture(); mountRecruit();
    ['#q','#level','#lang','#currency'].forEach(id => $(id)?.addEventListener('input', renderCourses));
  }

  if (file === 'auth.html'){
    // robust boot — render now, and once again shortly in case JS loaded slowly
    window.USAuth?.renderAccountPage();
    setTimeout(()=> window.USAuth?.renderAccountPage(), 120);
  }
});

console.log('Utopian Space app.js v3');
