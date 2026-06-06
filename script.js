const hero = document.querySelector(".hero");
const heroButton = document.querySelector(".hero-reveal");
const heroVideo = document.querySelector(".hero-video");
const timelineSection = document.querySelector(".timeline-section");
const timelineTrack = document.querySelector(".timeline-track");
const timelineWindow = document.querySelector(".timeline-window");
const revealItems = document.querySelectorAll(".reveal-item");
const videos = document.querySelectorAll("video");

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function setHeroSpot(event) {
  if (!hero || hero.classList.contains("is-revealed") || reduceMotion) return;
  const rect = hero.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 100;
  const y = ((event.clientY - rect.top) / rect.height) * 100;
  hero.style.setProperty("--spot-x", `${x}%`);
  hero.style.setProperty("--spot-y", `${y}%`);
}

function revealHero() {
  if (!hero) return;
  hero.classList.add("is-revealed");
  document.body.classList.add("hero-open");
  heroButton?.setAttribute("aria-label", "首页全貌已展示");
  heroVideo?.play().catch(() => {});
}

hero?.addEventListener("pointermove", setHeroSpot);
heroButton?.addEventListener("click", revealHero);
heroButton?.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    revealHero();
  }
});

if (window.matchMedia("(pointer: coarse)").matches) {
  hero?.style.setProperty("--spot-x", "50%");
  hero?.style.setProperty("--spot-y", "42%");
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
);

revealItems.forEach((item) => revealObserver.observe(item));

const videoObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      const video = entry.target;
      if (entry.isIntersecting) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  },
  { threshold: 0.35 }
);

videos.forEach((video) => {
  video.muted = true;
  video.playsInline = true;
  videoObserver.observe(video);
});

function updateTimelineMetrics() {
  if (!timelineSection || !timelineTrack || !timelineWindow || window.innerWidth <= 920) {
    timelineSection?.style.removeProperty("--timeline-height");
    return;
  }
  const overflow = Math.max(0, timelineTrack.scrollWidth - timelineWindow.clientWidth);
  const holdAfterComplete = Math.min(420, Math.max(220, window.innerHeight * 0.32));
  timelineSection.style.setProperty("--timeline-height", `${window.innerHeight + overflow + holdAfterComplete}px`);
}

function updateTimeline() {
  if (!timelineSection || !timelineTrack || !timelineWindow || window.innerWidth <= 920) return;
  const rect = timelineSection.getBoundingClientRect();
  const total = timelineSection.offsetHeight - window.innerHeight;
  const progress = Math.min(1, Math.max(0, -rect.top / total));
  const overflow = Math.max(0, timelineTrack.scrollWidth - timelineWindow.clientWidth);
  const scrollProgress = Math.min(1, progress * (total / Math.max(1, overflow)));
  timelineTrack.style.setProperty("--timeline-x", `${-overflow * scrollProgress}px`);
}

let ticking = false;

function requestTimelineUpdate() {
  if (ticking) return;
  ticking = true;
  window.requestAnimationFrame(() => {
    updateTimeline();
    ticking = false;
  });
}

window.addEventListener("scroll", requestTimelineUpdate, { passive: true });
window.addEventListener("resize", () => {
  updateTimelineMetrics();
  requestTimelineUpdate();
});
window.addEventListener("load", () => {
  updateTimelineMetrics();
  requestTimelineUpdate();
  heroVideo?.play().catch(() => {});
});

updateTimelineMetrics();
