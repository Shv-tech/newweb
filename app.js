/* ========= UTILITIES ========= */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const toast = (msg) => {
  const t = document.createElement("div");
  t.textContent = msg;
  t.style.position = "fixed";
  t.style.left = "50%";
  t.style.bottom = "24px";
  t.style.transform = "translateX(-50%)";
  t.style.background = "rgba(0,0,0,.9)";
  t.style.color = "#fff";
  t.style.padding = "10px 14px";
  t.style.borderRadius = "10px";
  t.style.border = "1px solid rgba(255,255,255,.2)";
  t.style.zIndex = 1000;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2200);
};
const navInit = (current) => {
  const menuBtn = $("#menuBtn");
  const primaryNav = $("#primaryNav");
  const mobileNav = $("#mobileNav");
  if (menuBtn) {
    menuBtn.addEventListener("click", () => {
      const isOpen = primaryNav.classList.toggle("open");
      mobileNav.style.display = isOpen ? "block" : "none";
      if (isOpen) mobileNav.innerHTML = primaryNav.innerHTML;
      menuBtn.setAttribute("aria-expanded", String(isOpen));
    });
  }
  $$("#primaryNav a").forEach((a) => {
    const href = a.getAttribute("href");
    a.setAttribute(
      "aria-current",
      href && current && href.endsWith(current) ? "page" : "false",
    );
  });
};

/* ========= SIMPLE PERSISTENCE (localStorage) ========= */
const KEY_USERS = "us_users";
const KEY_SESSION = "us_session"; // stores user id (string)
const KEY_SUBSCRIBERS = "us_subscribers"; // array of emails

const load = (k, fallback) => {
  try {
    const v = localStorage.getItem(k);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
};
const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));

const usersAll = () => load(KEY_USERS, []);
const usersSaveAll = (arr) => save(KEY_USERS, arr);
const getSessionUser = () => {
  const id = load(KEY_SESSION, null);
  if (!id) return null;
  return usersAll().find((u) => u.id === id) || null;
};
const setSession = (user) => save(KEY_SESSION, user?.id || null);
const subscribers = () => load(KEY_SUBSCRIBERS, []);
const subscribersAdd = (email) => {
  const s = subscribers();
  if (!s.includes(email)) {
    s.push(email);
    save(KEY_SUBSCRIBERS, s);
  }
};

/* ========= PASSWORD HASH (SHA-256) ========= */
async function sha256hex(str) {
  if (window.crypto?.subtle) {
    const enc = new TextEncoder().encode(str);
    const buf = await crypto.subtle.digest("SHA-256", enc);
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  } else {
    // Lightweight fallback
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = (h << 5) - h + str.charCodeAt(i);
      h |= 0;
    }
    return "x" + Math.abs(h);
  }
}

/* ========= AUTH ========= */
async function registerUser({ email, username, password, subscribe }) {
  const users = usersAll();
  if (users.find((u) => u.username.toLowerCase() === username.toLowerCase()))
    throw new Error("Username already taken.");
  if (users.find((u) => u.email.toLowerCase() === email.toLowerCase()))
    throw new Error("Email already registered.");
  const passHash = await sha256hex(password);
  const id =
    (window.crypto && window.crypto.randomUUID
      ? "u_" + window.crypto.randomUUID()
      : "u_" + Date.now());
  const user = {
    id,
    email,
    username,
    passHash,
    subscribed: !!subscribe,
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  usersSaveAll(users);
  if (subscribe) subscribersAdd(email);
  setSession(user);
  return user;
}
async function loginUser({ identifier, password }) {
  const users = usersAll();
  const user = users.find(
    (u) =>
      u.username.toLowerCase() === identifier.toLowerCase() ||
      u.email.toLowerCase() === identifier.toLowerCase(),
  );
  if (!user) throw new Error("User not found.");
  const passHash = await sha256hex(password);
  if (passHash !== user.passHash) throw new Error("Incorrect password.");
  setSession(user);
  return user;
}
function logoutUser() {
  setSession(null);
}

/* Update header auth state on any page */
function updateAuthHeader() {
  const me = getSessionUser();
  const container = $("#authArea");
  if (!container) return;
  if (me) {
    container.innerHTML = `
      <span class="tag">Hi, ${me.username}</span>
      <a class="btn btn-outline" href="account.html">Account</a>
      <button id="logoutBtn" class="btn btn-outline">Logout</button>
    `;
    $("#logoutBtn")?.addEventListener("click", () => {
      logoutUser();
      location.href = "index.html";
    });
  } else {
    container.innerHTML = `
      <a class="btn btn-outline" href="auth.html">Login</a>
      <a class="btn btn-primary" href="auth.html#register">Get Started</a>
    `;
  }
}

/* ========= PAGE HELPERS ========= */
function mountEmailCapture() {
  const form = $("#emailForm");
  const msg = $("#emailMsg");
  if (!form) return;
  form.addEventListener("submit", () => {
    const email = $("#email").value.trim();
    const ref = $("#ref")?.value?.trim();
    if (!email) return;
    subscribersAdd(email);
    msg.textContent = `Thanks! We’ll notify you at ${email}${
      ref ? " (ref " + ref + ")" : ""
    }.`;
  });
}
function mountRecruit() {
  const form = $("#recruitForm");
  const msg = $("#recruitMsg");
  if (!form) return;
  form.addEventListener("submit", () => {
    msg.textContent = "Thanks! We’ll get back to you within 48 hours.";
  });
}

/* ========= HOME PAGE DYNAMIC CONTENT ========= */
function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}
const COURSES = [
  {
    title: "Poetry that Breathes",
    slug: "poetry-that-breathes",
    summary: "Write poems with pulse and purpose.",
    priceINR: 100,
    priceUSD: 2,
    level: "Beginner",
    language: "en",
    isLive: true,
    cover: "#7C3AED",
    trailer: "https://player.vimeo.com/video/123456",
  },
  {
    title: "Foundations of Coding for Creators",
    slug: "coding-for-creators",
    summary: "Build tools for your art.",
    priceINR: 499,
    priceUSD: 8,
    level: "Beginner",
    language: "en",
    isLive: false,
    cover: "#A855F7",
  },
  {
    title: "Filmmaking: Shots to Stories",
    slug: "filmmaking-shots-to-stories",
    summary: "From frames to films.",
    priceINR: 999,
    priceUSD: 14,
    level: "Intermediate",
    language: "en",
    isLive: true,
    cover: "#FF4ECD",
  },
  {
    title: "Esports: Competitive Mindset",
    slug: "esports-competitive-mindset",
    summary: "Train like a pro.",
    priceINR: 299,
    priceUSD: 5,
    level: "All",
    language: "en",
    isLive: true,
    cover: "#6b21a8",
  },
];
const EVENTS = [
  {
    title: "Utopian Space — Global Launch",
    slug: "global-launch",
    startsAt: daysFromNow(7),
    summary:
      "Announcing divisions, programs, and our first anthology.",
    priceINR: 0,
    virtual: true,
  },
  {
    title: "Live Class: Poetry that Breathes (Kickoff)",
    slug: "poetry-kickoff",
    startsAt: daysFromNow(10),
    summary: "First live session and Q&A.",
    priceINR: 100,
    virtual: true,
  },
  {
    title: "Esports Community Scrim Night",
    slug: "esports-scrim-night",
    startsAt: daysFromNow(14),
    summary: "Teams scrim, open signup.",
    priceINR: 0,
    virtual: true,
  },
];
const POSTS = [
  {
    title: "Welcome to Utopian Space Blog",
    excerpt: "Craft notes, class drops, and BTS.",
    date: "2025-08-01",
  },
  {
    title: "How to Build a Daily Practice",
    excerpt: "Small reps, big returns.",
    date: "2025-08-05",
  },
  {
    title: "From Draft to Release",
    excerpt: "Ship your work with care.",
    date: "2025-08-08",
  },
  {
    title: "The Competitive Mindset",
    excerpt: "Habits for high-stakes play.",
    date: "2025-08-10",
  },
  {
    title: "Animation: Texture & Timing",
    excerpt: "Make frames breathe.",
    date: "2025-08-11",
  },
];

function renderCourses() {
  const courseGrid = $("#courseGrid");
  if (!courseGrid) return;
  const q = ($("#q")?.value || "").toLowerCase();
  const lvl = $("#level")?.value || "";
  const l = $("#lang")?.value || "";
  const cur = $("#currency")?.value || "INR";

  courseGrid.innerHTML = "";
  COURSES.filter((c) => {
    return (
      (!lvl || c.level === lvl) &&
      (!l || c.language === l) &&
      (!q ||
        c.title.toLowerCase().includes(q) ||
        c.summary.toLowerCase().includes(q))
    );
  }).forEach((c) => {
    const price = cur === "USD"
      ? "$" + (c.priceUSD ?? Math.round(c.priceINR / 82))
      : "₹" + c.priceINR;

    // Avoid nested backticks by building the trailer button separately
    const trailerBtnHTML = c.trailer
      ? '<button class="btn btn-outline" data-trailer="' +
        c.trailer +
        '">Watch Trailer</button>'
      : "";

    const el = document.createElement("article");
    el.className = "glass card";
    el.setAttribute("role", "listitem");
    el.innerHTML = `
      <div style="aspect-ratio:16/9;border-radius:12px;background:${c.cover};margin-bottom:8px"></div>
      <h3 style="margin:.3em 0">${c.title}</h3>
      <p class="muted">${c.summary}</p>
      <div style="display:flex;gap:8px;align-items:center;margin:.6em 0">
        <span class="tag">${c.level}</span>
        <span class="tag">${c.language}</span>
        ${c.isLive ? '<span class="tag">Live</span>' : ''}
        <span class="tag">${price}</span>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        ${trailerBtnHTML}
        <button class="btn btn-primary" data-action="toast" data-msg="Enrollment handled in full app">Enroll</button>
      </div>
    `;
    courseGrid.appendChild(el);
  });

  // bind trailer buttons
  courseGrid.querySelectorAll("[data-trailer]").forEach((btn) => {
    btn.addEventListener("click", () =>
      openModal(
        `<div style="position:relative;padding-bottom:56.25%;height:0;">
           <iframe title="Trailer" src="${btn.dataset.trailer}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0" allow="autoplay; fullscreen; picture-in-picture"></iframe>
         </div>`,
      ),
    );
  });
}

function renderEvents() {
  const grid = $("#eventGrid");
  if (!grid) return;
  grid.innerHTML = "";
  EVENTS.forEach((e) => {
    const el = document.createElement("article");
    el.className = "glass card";
    el.innerHTML = `<h3 style="margin:.3em 0">${e.title}</h3>
      <p class="muted">${e.summary}</p>
      <p class="muted"><strong>Starts:</strong> ${e.startsAt.toLocaleString()} &nbsp; <strong>Price:</strong> ₹${e.priceINR}</p>
      <a class="btn btn-outline" href="about.html">Details</a>`;
    grid.appendChild(el);
  });
}

function renderPosts() {
  const grid = $("#blogGrid");
  if (!grid) return;
  grid.innerHTML = "";
  POSTS.forEach((p) => {
    const el = document.createElement("article");
    el.className = "glass card";
    el.innerHTML = `<h3 style="margin:.3em 0">${p.title}</h3><p class="muted">${p.excerpt}</p><span class="tag">${p.date}</span>`;
    grid.appendChild(el);
  });
}

/* ========= MODAL ========= */
let modal, modalBody;
function attachModal() {
  modal = $("#modal");
  modalBody = $("#modalBody");
  window.closeModal = () => {
    modal.close();
    modalBody.innerHTML = "";
  };
}
function openModal(html) {
  modalBody.innerHTML = html;
  modal.showModal();
}

/* ========= PAGE BOOT ========= */
function bootCommon(currentNav) {
  navInit(currentNav);
  updateAuthHeader();
  attachModal();
  $$("#primaryNav a, #mobileNav a").forEach((a) => {
    if (a.getAttribute("href")?.startsWith("#"))
      a.addEventListener("click", (e) => e.preventDefault());
  });
}

window.addEventListener("DOMContentLoaded", () => {
  const path = location.pathname.split("/").pop() || "index.html";
  bootCommon(path);

  if (path === "index.html") {
    renderCourses();
    renderEvents();
    renderPosts();
    mountEmailCapture();
    mountRecruit();
    ["#q", "#level", "#lang", "#currency"].forEach((id) =>
      $(id)?.addEventListener("input", renderCourses),
    );
  }

  if (path === "auth.html") {
    const tab = location.hash === "#register" ? "register" : "login";
    $("#tab-login").setAttribute("aria-selected", tab === "login");
    $("#tab-register").setAttribute("aria-selected", tab === "register");
    $("#panel-login").hidden = tab !== "login";
    $("#panel-register").hidden = tab !== "register";
    $("#tab-login").onclick = () => {
      location.hash = "";
      location.reload();
    };
    $("#tab-register").onclick = () => {
      location.hash = "#register";
      location.reload();
    };

    $("#loginForm")?.addEventListener("submit", async () => {
      const id = $("#login-id").value.trim();
      const pw = $("#login-pw").value;
      try {
        await loginUser({ identifier: id, password: pw });
        location.href = "index.html";
      } catch (e) {
        toast(e.message);
      }
    });

    $("#registerForm")?.addEventListener("submit", async () => {
      const email = $("#reg-email").value.trim();
      const username = $("#reg-username").value.trim();
      const pw = $("#reg-pw").value;
      const pw2 = $("#reg-pw2").value;
      const sub = $("#reg-sub").checked;
      if (!email || !username || !pw) {
        toast("Please fill all fields.");
        return;
      }
      if (pw.length < 6) {
        toast("Password must be at least 6 characters.");
        return;
      }
      if (pw !== pw2) {
        toast("Passwords do not match.");
        return;
      }
      try {
        await registerUser({ email, username, password: pw, subscribe: sub });
        location.href = "index.html";
      } catch (e) {
        toast(e.message);
      }
    });
  }

  if (path === "account.html") {
    const me = getSessionUser();
    if (!me) {
      location.href = "auth.html";
      return;
    }
    $("#acc-username").textContent = me.username;
    $("#acc-email").textContent = me.email;
    $("#acc-created").textContent = new Date(me.createdAt).toLocaleString();
    $("#acc-sub").checked = !!me.subscribed;
    $("#saveAcc").onclick = () => {
      const users = usersAll();
      const idx = users.findIndex((u) => u.id === me.id);
      users[idx].subscribed = $("#acc-sub").checked;
      usersSaveAll(users);
      if (users[idx].subscribed) subscribersAdd(users[idx].email);
      toast("Preferences saved.");
    };
    $("#logoutBtn2").onclick = () => {
      logoutUser();
      location.href = "index.html";
    };
  }
});
