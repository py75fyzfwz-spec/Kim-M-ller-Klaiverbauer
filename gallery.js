// Instrument galleries: every element with [data-gallery] becomes a small slider.
// Add images by placing <img> tags inside .gallery-track — arrows, dots and the
// lightbox appear automatically as soon as there is more than one slide.
(function () {
  const galleries = document.querySelectorAll('[data-gallery]');
  if (!galleries.length) return;

  // ---------- Lightbox (shared by all galleries) ----------
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-modal', 'true');
  lightbox.setAttribute('aria-label', 'Bildansicht');
  lightbox.hidden = true;
  lightbox.innerHTML =
    '<button class="lightbox-close" aria-label="Schließen">×</button>' +
    '<button class="gallery-btn gallery-prev" aria-label="Vorheriges Bild">‹</button>' +
    '<img class="lightbox-img" alt="">' +
    '<button class="gallery-btn gallery-next" aria-label="Nächstes Bild">›</button>' +
    '<p class="lightbox-count"></p>';
  document.body.appendChild(lightbox);

  const lbImg = lightbox.querySelector('.lightbox-img');
  const lbCount = lightbox.querySelector('.lightbox-count');
  let lbImages = [];
  let lbIndex = 0;
  let lbReturnFocus = null;

  const showLightbox = (i) => {
    lbIndex = (i + lbImages.length) % lbImages.length;
    const img = lbImages[lbIndex];
    lbImg.src = img.currentSrc || img.src;
    lbImg.alt = img.alt;
    lbCount.textContent = lbImages.length > 1 ? `${lbIndex + 1} / ${lbImages.length}` : '';
    lightbox.classList.toggle('single', lbImages.length < 2);
  };
  const openLightbox = (images, i, trigger) => {
    lbImages = images;
    lbReturnFocus = trigger;
    showLightbox(i);
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    lightbox.querySelector('.lightbox-close').focus();
  };
  const closeLightbox = () => {
    lightbox.hidden = true;
    document.body.style.overflow = '';
    if (lbReturnFocus) lbReturnFocus.focus();
  };

  lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
  lightbox.querySelector('.gallery-prev').addEventListener('click', () => showLightbox(lbIndex - 1));
  lightbox.querySelector('.gallery-next').addEventListener('click', () => showLightbox(lbIndex + 1));
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => {
    if (lightbox.hidden) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showLightbox(lbIndex - 1);
    if (e.key === 'ArrowRight') showLightbox(lbIndex + 1);
  });

  // ---------- Per-instrument slider ----------
  galleries.forEach((gallery) => {
    const track = gallery.querySelector('.gallery-track');
    const slides = Array.from(track.children);
    const images = slides.filter((el) => el.tagName === 'IMG');

    images.forEach((img, i) => {
      img.tabIndex = 0;
      img.addEventListener('click', () => openLightbox(images, i, img));
      img.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') openLightbox(images, i, img);
      });
    });

    if (slides.length < 2) return;
    gallery.classList.add('has-controls');

    const prev = document.createElement('button');
    prev.className = 'gallery-btn gallery-prev';
    prev.setAttribute('aria-label', 'Vorheriges Bild');
    prev.textContent = '‹';
    const next = document.createElement('button');
    next.className = 'gallery-btn gallery-next';
    next.setAttribute('aria-label', 'Nächstes Bild');
    next.textContent = '›';

    const dots = document.createElement('div');
    dots.className = 'gallery-dots';
    const dotButtons = slides.map((_, i) => {
      const dot = document.createElement('button');
      dot.setAttribute('aria-label', `Bild ${i + 1} von ${slides.length}`);
      dot.addEventListener('click', () => goTo(i));
      dots.appendChild(dot);
      return dot;
    });

    gallery.append(prev, next, dots);

    let current = 0;
    const goTo = (i) => {
      current = (i + slides.length) % slides.length;
      track.scrollTo({ left: slides[current].offsetLeft, behavior: 'smooth' });
    };
    const markActive = () => {
      dotButtons.forEach((d, i) => d.classList.toggle('active', i === current));
    };

    prev.addEventListener('click', () => goTo(current - 1));
    next.addEventListener('click', () => goTo(current + 1));

    // keep the active dot in sync when the user swipes
    let scrollTimer;
    track.addEventListener('scroll', () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        current = Math.round(track.scrollLeft / track.clientWidth);
        markActive();
      }, 60);
    }, { passive: true });

    markActive();
  });
})();
