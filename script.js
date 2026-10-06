const navToggle = document.querySelector('.nav-toggle');
const mainNav = document.querySelector('.main-nav');
const form = document.getElementById('contactForm');
const statusText = document.querySelector('.form-status');
const year = document.getElementById('year');

if (year) {
  year.textContent = new Date().getFullYear();
}

const backToTop = document.querySelector('.back-to-top');

if (backToTop) {
  const updateBackToTop = () => {
    const isVisible = window.scrollY > 400;
    backToTop.classList.toggle('is-visible', isVisible);
    backToTop.setAttribute('aria-hidden', String(!isVisible));
    backToTop.tabIndex = isVisible ? 0 : -1;
  };

  window.addEventListener('scroll', updateBackToTop, { passive: true });
  updateBackToTop();

  backToTop.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth',
    });
  });
}

if (navToggle && mainNav) {
  const closeNav = () => {
    mainNav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open menu');
  };

  navToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  });

  mainNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeNav);
  });

  document.addEventListener('click', (event) => {
    if (
      mainNav.classList.contains('open') &&
      !mainNav.contains(event.target) &&
      !navToggle.contains(event.target)
    ) {
      closeNav();
    }
  });
}

const revealElements = document.querySelectorAll(
  '.hero-content > *, .section-header, .about-copy, .about-visual, .service-card, .partner-logo, .project-card, .step-card, .contact-copy, .contact-form'
);

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  revealElements.forEach((element) => {
    element.classList.add('reveal-ready');
    revealObserver.observe(element);
  });
} else {
  revealElements.forEach((element) => element.classList.add('is-visible'));
}

const counters = document.querySelectorAll('[data-count]');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const hero = document.querySelector('.hero');
const heroTrack = document.querySelector('.hero-track');
const heroSlides = heroTrack ? [...heroTrack.querySelectorAll('.hero-slide')] : [];
const heroDots = [...document.querySelectorAll('[data-hero-slide]')];
const heroPrev = document.querySelector('[data-hero-prev]');
const heroNext = document.querySelector('[data-hero-next]');
const heroPause = document.querySelector('[data-hero-pause]');

if (
  hero &&
  heroTrack &&
  heroSlides.length > 1 &&
  heroDots.length === heroSlides.length &&
  heroPrev &&
  heroNext &&
  heroPause
) {
  let activeSlide = 0;
  let rotationTimer = null;
  let manuallyPaused = reduceMotion;
  let pointerInside = false;
  let focusInside = false;

  const stopRotation = () => {
    window.clearInterval(rotationTimer);
    rotationTimer = null;
  };

  const startRotation = () => {
    if (
      reduceMotion ||
      manuallyPaused ||
      pointerInside ||
      focusInside ||
      document.hidden ||
      rotationTimer
    ) {
      return;
    }

    rotationTimer = window.setInterval(() => {
      showSlide(activeSlide + 1);
    }, 6000);
  };

  const updatePauseButton = () => {
    heroPause.disabled = reduceMotion;
    heroPause.setAttribute(
      'aria-label',
      reduceMotion
        ? 'Automatic image rotation disabled by reduced-motion setting'
        : manuallyPaused
          ? 'Resume slideshow'
          : 'Pause slideshow'
    );
    heroPause.setAttribute('aria-pressed', String(manuallyPaused));
    heroPause.querySelector('use').setAttribute(
      'href',
      manuallyPaused ? '#icon-play' : '#icon-pause'
    );
  };

  function showSlide(index) {
    activeSlide = (index + heroSlides.length) % heroSlides.length;
    heroTrack.style.transform = `translateX(-${activeSlide * 100}%)`;

    heroDots.forEach((dot, dotIndex) => {
      const isActive = dotIndex === activeSlide;
      dot.classList.toggle('active', isActive);
      dot.setAttribute('aria-pressed', String(isActive));
    });
  }

  const goToSlide = (index) => {
    showSlide(index);
    stopRotation();
    startRotation();
  };

  heroPrev.addEventListener('click', () => goToSlide(activeSlide - 1));
  heroNext.addEventListener('click', () => goToSlide(activeSlide + 1));
  heroDots.forEach((dot) => {
    dot.addEventListener('click', () => {
      goToSlide(Number(dot.dataset.heroSlide));
    });
  });

  heroPause.addEventListener('click', () => {
    manuallyPaused = !manuallyPaused;
    updatePauseButton();
    stopRotation();
    startRotation();
  });

  hero.addEventListener('mouseenter', () => {
    pointerInside = true;
    stopRotation();
  });
  hero.addEventListener('mouseleave', () => {
    pointerInside = false;
    startRotation();
  });
  hero.addEventListener('focusin', () => {
    focusInside = true;
    stopRotation();
  });
  hero.addEventListener('focusout', (event) => {
    if (!hero.contains(event.relatedTarget)) {
      focusInside = false;
      startRotation();
    }
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopRotation();
    } else {
      startRotation();
    }
  });

  showSlide(0);
  updatePauseButton();
  startRotation();
}

if ('IntersectionObserver' in window && counters.length) {
  const countObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const element = entry.target;
        const target = Number(element.dataset.count);
        if (reduceMotion) {
          element.textContent = target.toLocaleString();
          observer.unobserve(element);
          return;
        }
        const startedAt = performance.now();
        const duration = 1200;

        const updateCount = (now) => {
          const progress = Math.min((now - startedAt) / duration, 1);
          const easedProgress = 1 - (1 - progress) ** 3;
          element.textContent = Math.round(target * easedProgress).toLocaleString();

          if (progress < 1) {
            requestAnimationFrame(updateCount);
          }
        };

        requestAnimationFrame(updateCount);
        observer.unobserve(element);
      });
    },
    { threshold: 0.6 }
  );

  counters.forEach((counter) => countObserver.observe(counter));
}

const navLinks = [...document.querySelectorAll('.main-nav a[href^="#"]')];
const observedSections = navLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

if ('IntersectionObserver' in window && observedSections.length) {
  const activeSectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        navLinks.forEach((link) => {
          const isCurrent = link.getAttribute('href') === `#${entry.target.id}`;
          link.classList.toggle('active', isCurrent);
          if (isCurrent) {
            link.setAttribute('aria-current', 'location');
          } else {
            link.removeAttribute('aria-current');
          }
        });
      });
    },
    { rootMargin: '-35% 0px -55% 0px' }
  );

  observedSections.forEach((section) => activeSectionObserver.observe(section));
}

const filterButtons = document.querySelectorAll('[data-filter]');
const projectCards = document.querySelectorAll('.project-card[data-category]');
const emptyProjectsMessage = document.querySelector('.portfolio-empty');

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const selectedCategory = button.dataset.filter;
    let visibleProjects = 0;

    filterButtons.forEach((filterButton) => {
      const isActive = filterButton === button;
      filterButton.classList.toggle('active', isActive);
      filterButton.setAttribute('aria-pressed', String(isActive));
    });

    projectCards.forEach((card) => {
      const shouldShow =
        selectedCategory === 'all' || card.dataset.category === selectedCategory;
      card.hidden = !shouldShow;
      if (shouldShow) visibleProjects += 1;
    });

    if (emptyProjectsMessage) {
      emptyProjectsMessage.hidden = visibleProjects > 0;
    }
  });
});

const videoModal = document.getElementById('videoModal');
const videoFrame = videoModal?.querySelector('.video-frame');
const videoTitle = document.getElementById('videoTitle');
const videoClose = videoModal?.querySelector('.video-close');
let lastVideoTrigger = null;

const closeVideo = () => {
  if (!videoModal || !videoFrame) return;
  videoModal.classList.remove('open');
  videoModal.setAttribute('aria-hidden', 'true');
  videoFrame.replaceChildren();
  document.documentElement.style.overflow = '';
  lastVideoTrigger?.focus();
};

if (videoModal && videoFrame && videoTitle && videoClose) {
  document.querySelectorAll('[data-video-open]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const videoId = trigger.dataset.videoOpen;
      if (!videoId) return;

      lastVideoTrigger = trigger;
      videoTitle.textContent = trigger.dataset.videoTitle || 'Project video';

      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?autoplay=1&rel=0`;
      iframe.title = videoTitle.textContent;
      iframe.allow =
        'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.allowFullscreen = true;
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      videoFrame.replaceChildren(iframe);

      videoModal.classList.add('open');
      videoModal.setAttribute('aria-hidden', 'false');
      document.documentElement.style.overflow = 'hidden';
      videoClose.focus();
    });
  });

  videoClose.addEventListener('click', closeVideo);
  videoModal.addEventListener('click', (event) => {
    if (event.target === videoModal) closeVideo();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && videoModal.classList.contains('open')) {
      closeVideo();
    }
  });
}

if (form && statusText) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const firstName = String(formData.get('firstName') || '').trim();
    const lastName = String(formData.get('lastName') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const phone = String(formData.get('phone') || '').trim();
    const message = String(formData.get('message') || '').trim();
    const subject = encodeURIComponent(`Website enquiry from ${firstName} ${lastName}`);
    const body = encodeURIComponent(
      `Name: ${firstName} ${lastName}\nEmail: ${email}\nPhone: ${phone || 'Not provided'}\n\n${message}`
    );

    statusText.textContent =
      'Your email app should open with your message. If it does not, send your enquiry to info@zahabumedia.com.';
    window.location.href = `mailto:info@zahabumedia.com?subject=${subject}&body=${body}`;
  });
}
