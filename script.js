const navToggle = document.querySelector('.nav-toggle');
const mainNav = document.querySelector('.main-nav');
const form = document.getElementById('contactForm');
const statusText = document.querySelector('.form-status');
const year = document.getElementById('year');

if (year) {
  year.textContent = new Date().getFullYear();
}

if (navToggle && mainNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  mainNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

if (form && statusText) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    statusText.textContent = 'Thank you! Your message has been received. We will get back to you soon.';
    form.reset();
  });
}
