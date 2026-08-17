document.addEventListener('DOMContentLoaded', function () {
  'use strict';
  const burger = document.querySelector('.burger');
  const navLinks = document.querySelector('.nav-links');
  if (!burger || !navLinks) return;

  burger.addEventListener('click', function () {
    const expanded = burger.getAttribute('aria-expanded') === 'true';
    burger.setAttribute('aria-expanded', String(!expanded));
    navLinks.classList.toggle('active', !expanded);
    const icon = burger.querySelector('i');
    icon?.classList.toggle('fa-bars', expanded);
    icon?.classList.toggle('fa-times', !expanded);
  });

  navLinks.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      burger.setAttribute('aria-expanded', 'false');
      navLinks.classList.remove('active');
      const icon = burger.querySelector('i');
      icon?.classList.add('fa-bars');
      icon?.classList.remove('fa-times');
    });
  });
});
