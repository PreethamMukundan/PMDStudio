/*
  Home page slideshow: slow crossfades between full-screen images, with a gentle zoom.

  Images are picked automatically: the home render first, then the cover image of each project.
  To hand-pick, add "featured": true to projects in content.json; then only those are used.
*/

const MAX_SLIDES = 6
const INTERVAL = 6000 // ms each image stays up
const FADE = 1800 // ms crossfade (keep in sync with .hero-slide transition in style.css)

// Ask image CDNs that support it (Unsplash) for a sharper, full-screen size.
const fullSize = (url) => (url.includes('images.unsplash.com') ? url.replace(/([?&])w=\d+/, '$1w=2400') : url)

export function pickSlides(site, projects) {
  const featured = projects.filter((project) => project.featured)
  const pool = featured.length ? featured : projects
  const slides = [{ image: site.heroImage, mobile: site.heroImageMobile, alt: site.heroAlt }]
  const seen = new Set([site.heroImage])
  for (const project of pool) {
    if (slides.length >= MAX_SLIDES) break
    if (seen.has(project.image)) continue
    seen.add(project.image)
    slides.push({ image: fullSize(project.image), alt: project.alt })
  }
  return slides
}

export const slideshowMarkup = (slides) => slides.map((slide, index) => `
  <div class="hero-slide${index === 0 ? ' is-active is-zooming' : ''}"${index ? ' aria-hidden="true"' : ''}>
    <picture>
      ${slide.mobile ? `<source media="(max-width: 700px)" srcset="${slide.mobile}">` : ''}
      <img ${index === 0 ? `src="${slide.image}"` : `data-src="${slide.image}"`} alt="${slide.alt}" decoding="async">
    </picture>
  </div>`).join('')

// Load an image that so far only has data-src; resolves once it can be shown.
function load(img) {
  if (img.dataset.src) { img.src = img.dataset.src; delete img.dataset.src }
  return img.complete && img.naturalWidth ? Promise.resolve() : img.decode().catch(() => {})
}

export function initSlideshow(container, isOnHome) {
  const slides = [...container.querySelectorAll('.hero-slide')]
  if (slides.length < 2) return
  // Visitors who ask for less motion get a single still image.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  let index = 0
  let timer = 0

  const show = async (next) => {
    const incoming = slides[next]
    await load(incoming.querySelector('img'))
    const outgoing = slides[index]
    incoming.classList.add('is-active', 'is-zooming')
    incoming.removeAttribute('aria-hidden')
    outgoing.classList.remove('is-active')
    outgoing.setAttribute('aria-hidden', 'true')
    // Keep the outgoing image zooming while it fades, then reset it for next time.
    setTimeout(() => { if (!outgoing.classList.contains('is-active')) outgoing.classList.remove('is-zooming') }, FADE)
    index = next
    load(slides[(index + 1) % slides.length].querySelector('img')) // get the next one ready
  }

  const tick = async () => {
    timer = 0
    if (!running()) return
    await show((index + 1) % slides.length)
    schedule()
  }
  const running = () => isOnHome() && !document.hidden
  const schedule = () => { if (!timer && running()) timer = setTimeout(tick, INTERVAL) }
  const update = () => {
    if (running()) schedule()
    else { clearTimeout(timer); timer = 0 }
  }

  document.addEventListener('visibilitychange', update)
  window.addEventListener('hashchange', () => setTimeout(update))
  load(slides[1].querySelector('img'))
  setTimeout(update) // start once the page has worked out which view is showing
}
