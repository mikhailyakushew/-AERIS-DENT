const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const nav = document.querySelector("[data-nav]");
const revealItems = document.querySelectorAll("[data-reveal]");
const counters = document.querySelectorAll("[data-counter]");
const hero = document.querySelector(".hero-media");
const parallaxItems = hero ? hero.querySelectorAll("[data-depth]") : [];
const prefersReduced = window.matchMedia("(prefers-reduced-motion: no-preference)");

const closeMenu = () => {
  if (!header || !menuToggle) return;
  header.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
};

const updateHeader = () => {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 20);
};

if (menuToggle) {
  menuToggle.addEventListener("click", () => {
    const expanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!expanded));
    header?.classList.toggle("is-open", !expanded);
  });
}

if (nav) {
  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });
}

window.addEventListener("resize", () => {
  if (window.innerWidth > 960) closeMenu();
});

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

if (revealItems.length) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -8% 0px",
    }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
}

const formatNumber = (value) => new Intl.NumberFormat("ru-RU").format(value);

const animateCounter = (element) => {
  const target = Number(element.dataset.counter || 0);
  const suffix = element.dataset.suffix || "";
  const duration = 1500;
  const start = performance.now();

  const frame = (timestamp) => {
    const progress = Math.min((timestamp - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(target * eased);
    element.textContent = `${formatNumber(current)}${suffix}`;

    if (progress < 1) requestAnimationFrame(frame);
  };

  requestAnimationFrame(frame);
};

if (counters.length) {
  const counterObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.65 }
  );

  counters.forEach((counter) => counterObserver.observe(counter));
}

function initParallax() {
  if (!hero || !prefersReduced.matches) return;
  let pointerX = 0, pointerY = 0;
  let currentX = 0, currentY = 0;
  let orbX = 0, orbY = 0;
  const orb = hero.querySelector(".hero-orb");
  const baseOrbX = -8, baseOrbY = -12;

  hero.addEventListener("pointermove", (event) => {
    const bounds = hero.getBoundingClientRect();
    pointerX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
    pointerY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
  });

  hero.addEventListener("pointerleave", () => {
    pointerX = 0;
    pointerY = 0;
  });

  const tick = () => {
    currentX += (pointerX - currentX) * 0.06;
    currentY += (pointerY - currentY) * 0.06;
    orbX += (pointerX * 12 - orbX) * 0.04;
    orbY += (pointerY * 12 - orbY) * 0.04;

    parallaxItems.forEach((item) => {
      const depth = Number(item.dataset.depth || 0);
      item.style.setProperty("--parallax-x", `${currentX * depth}px`);
      item.style.setProperty("--parallax-y", `${currentY * depth}px`);
    });

    if (orb) {
      orb.style.setProperty("--parallax-x", `${baseOrbX + orbX}px`);
      orb.style.setProperty("--parallax-y", `${baseOrbY + orbY}px`);
      orb.style.transform = `translate3d(${baseOrbX + orbX}px, ${baseOrbY + orbY}px, 0)`;
    }

    requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
}

initParallax();

let cursorX = 0, cursorY = 0;
let glowX = 0, glowY = 0;

function initCursorGlow() {
  if (!prefersReduced.matches) return;
  const glow = document.createElement("div");
  glow.className = "cursor-glow";
  document.body.appendChild(glow);

  document.addEventListener("pointermove", (e) => {
    cursorX = e.clientX;
    cursorY = e.clientY;
  });

  const tick = () => {
    glowX += (cursorX - glowX) * 0.06;
    glowY += (cursorY - glowY) * 0.06;
    glow.style.left = `${glowX}px`;
    glow.style.top = `${glowY}px`;
    requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
}

initCursorGlow();

function initCardTilt() {
  if (!prefersReduced.matches) return;
  const cards = document.querySelectorAll(".service-card, .link-card, .info-card, .process-step");

  cards.forEach((card) => {
    card.classList.add("js-tilt");

    card.addEventListener("pointermove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
    });

    card.addEventListener("pointerleave", () => {
      card.style.transform = "rotateY(0deg) rotateX(0deg)";
    });
  });
}

initCardTilt();

document.querySelectorAll("[data-appointment-form]").forEach((form) => {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const btn = form.querySelector("[data-form-btn]");
    btn.textContent = "Отправлено";
    btn.classList.add("is-sent");
  });
});
