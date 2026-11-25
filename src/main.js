import './style.css'
import content from './content.json'
import { initGalleries } from './gallery.js'
import { pickSlides, slideshowMarkup, initSlideshow } from './slideshow.js'

// Local files (paths starting with "/") are served under the site base path, e.g. /PMDStudio/ on GitHub Pages.
const withBase = (path) => (path.startsWith('/') ? import.meta.env.BASE_URL + path.slice(1) : path)

const { site, navigation, projects } = content
site.heroImage = withBase(site.heroImage)
site.heroImageMobile = withBase(site.heroImageMobile)
const placeholderFloorPlans = [
  { image: withBase('/placeholder-floor-plan.svg'), title: 'Ground floor plan' },
  { image: withBase('/placeholder-upper-floor-plan.svg'), title: 'Upper floor plan' },
  { image: withBase('/placeholder-building-section.svg'), title: 'Building section' }
]
const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const instagramUrl = `https://instagram.com/${site.instagram.replace('@', '')}`
const meta = (project) => [project.typology, project.year].filter(Boolean).join(' | ').replace(/-/g, '‑')
// Project page version: on PC the year drops to its own line under the type (see style.css).
const detailMeta = (project) => [project.typology, project.year].filter(Boolean).map((part) => `<span>${String(part).replace(/-/g, '‑')}</span>`).join('<span class="meta-sep"> | </span>')

projects.forEach((project) => {
  project.slug = slugify(project.title)
  project.image = withBase(project.image)
  project.gallery.forEach((item) => { item.image = withBase(item.image) })
  if (project.moodBoard) project.moodBoard = withBase(project.moodBoard)
})

const projectRow = (project, index) => {
  const slides = [{ image: project.image, alt: project.alt }, ...project.gallery]
  const multiple = slides.length > 1
  return `
  <article class="project-row" data-category="${project.category}" aria-label="${project.title}">
    <div class="project-media${multiple ? ' is-multi' : ''}" data-slides="${slides.length}">
      <div class="slide-track"${multiple ? ' style="transform: translate3d(-100%, 0, 0)"' : ''}>
        ${multiple ? `<img src="${slides[slides.length - 1].image}" alt="" aria-hidden="true" loading="lazy" draggable="false">` : ''}
        ${slides.map((slide, slideIndex) => `<img src="${slide.image}" alt="${slide.alt}" loading="${index < 2 && slideIndex === 0 ? 'eager' : 'lazy'}" draggable="false">`).join('')}
        ${multiple ? `<img src="${slides[0].image}" alt="" aria-hidden="true" loading="lazy" draggable="false">` : ''}
      </div>
      <a class="slide-link" href="#project/${project.slug}" draggable="false" aria-label="View ${project.title}${multiple ? ' (drag or use arrow keys for more images)' : ''}"></a>
    </div>
    <div class="project-caption">
      <div class="project-name">
        <h3>${project.title}</h3>
        <p>${project.location}</p>
      </div>
      <div class="project-meta">
        <p>${meta(project)}</p>
      </div>
    </div>
  </article>`
}

const projectImages = (project) => [
  { image: project.image, alt: project.alt },
  ...project.gallery,
  ...(project.moodBoard ? [{ image: project.moodBoard, alt: `Mood board inspiration for ${project.title}` }] : []),
  ...(project.floorPlans ? placeholderFloorPlans.map((plan) => ({ image: plan.image, alt: `${plan.title} placeholder drawing for ${project.title}`, drawing: true })) : [])
]

const projectDetail = (project) => `
  <article class="page project-detail" data-page="project/${project.slug}" hidden>
    <a class="detail-back stagger" style="--i: 0" href="#projects">← All projects</a>
    <header class="detail-header">
      <h2 class="stagger" style="--i: 1">${project.title}</h2>
      <p class="detail-location stagger" style="--i: 2">${project.location}</p>
      <p class="detail-meta stagger" style="--i: 3">${detailMeta(project)}</p>
    </header>
    <div class="detail-brief stagger" style="--i: 4">${project.brief.map((paragraph) => `<p>${paragraph}</p>`).join('')}</div>
    <div class="detail-gallery stagger" style="--i: 5" data-gallery>
      ${projectImages(project).map((item) => `<figure class="g-item${item.drawing ? ' is-drawing' : ''}"><img src="${item.image}" alt="${item.alt}" loading="lazy" decoding="async"></figure>`).join('')}
    </div>
  </article>`

document.querySelector('#app').innerHTML = `
  <header class="site-header">
    <a class="wordmark" href="#" aria-label="${site.name} home"><span>${site.headerName}</span> <small>${site.headerSubline}</small></a>
    <nav class="main-nav" aria-label="Main navigation">
      ${navigation.map((item) => `<a href="#${item.target}" data-nav="${item.target}">${item.label}</a>`).join('')}
    </nav>
    <button class="menu-toggle" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="menu"><span></span><span></span><span></span></button>
  </header>
  <aside class="menu" id="menu" aria-hidden="true" inert>
    <div class="menu-inner">
      <nav class="menu-links" aria-label="Menu">
        ${navigation.map((item) => `<a href="#${item.target}">${item.label}</a>`).join('')}
      </nav>
      <div class="menu-group">
        <a href="mailto:${site.email}">${site.email}</a>
        <a href="${instagramUrl}" target="_blank" rel="noreferrer">Instagram ${site.instagram}</a>
      </div>
    </div>
  </aside>
  <main>
    <section class="page home" data-page="home" aria-label="${site.name}">
      ${slideshowMarkup(pickSlides(site, projects))}
    </section>
    <section class="page projects" data-page="projects" aria-labelledby="projects-title" hidden>
      <div class="page-heading">
        <h2 id="projects-title">Projects</h2>
      </div>
      <div class="project-stage">
        <div class="project-list">${projects.map(projectRow).join('')}</div>
        <div class="caption-overlay"><div class="project-caption fixed-caption" aria-live="polite"></div></div>
      </div>
    </section>
    <section class="page text-page" data-page="studio" aria-labelledby="studio-title" hidden>
      <h2 id="studio-title">Studio</h2>
      <p class="text-sub">${site.location}</p>
      <div class="text-body">${site.studio.map((paragraph) => `<p>${paragraph}</p>`).join('')}</div>
    </section>
    <section class="page text-page" data-page="info" aria-labelledby="info-title" hidden>
      <h2 id="info-title">Info</h2>
      <p class="text-sub">Have a project in mind?</p>
      <dl class="info-list">
        <div><dt>Email</dt><dd><a href="mailto:${site.email}">${site.email}</a></dd></div>
        <div><dt>Instagram</dt><dd><a href="${instagramUrl}" target="_blank" rel="noreferrer">${site.instagram}</a></dd></div>
        <div><dt>Studio</dt><dd>${site.location}</dd></div>
      </dl>
    </section>
    ${projects.map(projectDetail).join('')}
  </main>
  <footer class="site-footer">
    <span>${site.name} © ${new Date().getFullYear()}</span>
    <span>${site.footerNote}</span>
    <a href="${instagramUrl}" target="_blank" rel="noreferrer">${site.instagram}</a>
  </footer>
`

const menu = document.querySelector('.menu')
const menuToggle = document.querySelector('.menu-toggle')

function setMenu(open) {
  document.body.classList.toggle('menu-open', open)
  menu.setAttribute('aria-hidden', String(!open))
  menu.toggleAttribute('inert', !open)
  menuToggle.setAttribute('aria-expanded', String(open))
  menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu')
}

menuToggle.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')))
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') setMenu(false) })
menu.addEventListener('click', (event) => { if (event.target.closest('a')) setMenu(false) })
window.matchMedia('(min-width: 701px)').addEventListener('change', (event) => { if (event.matches) setMenu(false) })

/* Projects: one project per screen. Scrolling glides to the next project;
   inside a project, images slide sideways. */
const stage = document.querySelector('.project-stage')
const track = document.querySelector('.project-list')
const fixedCaption = document.querySelector('.fixed-caption')
const DURATION = 1000
let current = 0
let lockedUntil = 0

const visibleRows = () => [...track.querySelectorAll('.project-row:not([hidden])')]
const stageActive = () => document.body.dataset.view === 'projects' && !document.body.classList.contains('menu-open')

function goToProject(index, animate = true) {
  const rows = visibleRows()
  if (!rows.length) return
  current = Math.max(0, Math.min(rows.length - 1, index))
  track.classList.toggle('no-anim', !animate)
  track.style.transform = `translate3d(0, ${-rows[current].offsetTop}px, 0)`
  rows.forEach((row, i) => row.toggleAttribute('inert', i !== current))
  syncCaption(animate)
  lockedUntil = Date.now() + (animate ? DURATION + 150 : 0)
}

// Shows the current project's details in the fixed box. On phones, when the project changes with a
// scroll, the box fades out, swaps text halfway through the scroll, then fades back in.
const CAPTION_FADE = 350
const fadeCaptions = window.matchMedia('(max-width: 700px)')
let captionRow = null
let captionTimer = 0
function syncCaption(fade = false) {
  const row = visibleRows()[current]
  const swap = () => {
    captionTimer = 0
    const shown = visibleRows()[current]
    captionRow = shown
    fixedCaption.innerHTML = shown ? shown.querySelector('.project-caption').innerHTML : ''
    fixedCaption.classList.remove('is-fading')
  }
  if (fade && fadeCaptions.matches && row !== captionRow) {
    fixedCaption.classList.add('is-fading')
    clearTimeout(captionTimer)
    captionTimer = setTimeout(swap, CAPTION_FADE)
  } else if (!captionTimer) {
    swap() // same project (e.g. image counter changed) or no animation: update in place
  }
}

function step(direction) {
  if (Date.now() < lockedUntil) return
  const next = current + direction
  if (next < 0 || next >= visibleRows().length) return
  goToProject(next)
}

/* Images loop like a circle. Each multi-image row is laid out as
   [copy of last] [image 1] … [image N] [copy of first], so position = index + 1.
   Moving past either end slides onto the copy, then silently jumps to the real image. */
const SLIDE_DURATION = 1000

function placeSlide(media, position, animate) {
  const slideTrack = media.querySelector('.slide-track')
  slideTrack.style.transition = animate ? '' : 'none'
  slideTrack.style.transform = `translate3d(${-position * 100}%, 0, 0)`
  if (!animate) {
    void slideTrack.offsetWidth // apply the jump before transitions come back on
    slideTrack.style.transition = ''
  }
}

// Finish any pending jump from a copy back to the real image.
function settleSlide(media) {
  if (!media.settleTimer) return
  clearTimeout(media.settleTimer)
  media.settleTimer = null
  placeSlide(media, Number(media.dataset.index) + 1, false)
}

function goToSlide(row, direction) {
  const media = row.querySelector('.project-media')
  const total = Number(media.dataset.slides)
  if (total < 2) return
  settleSlide(media)
  const index = Number(media.dataset.index || 0)
  const position = index + 1 + direction
  const next = (index + direction + total) % total
  media.dataset.index = next
  placeSlide(media, position, true)
  if (position === 0 || position === total + 1) {
    media.settleTimer = setTimeout(() => settleSlide(media), SLIDE_DURATION)
  }
}

function resetStage() {
  track.querySelectorAll('.project-media').forEach((media) => {
    clearTimeout(media.settleTimer)
    media.settleTimer = null
    media.dataset.index = 0
    if (Number(media.dataset.slides) > 1) placeSlide(media, 1, false)
  })
  goToProject(0, false)
}

stage.addEventListener('wheel', (event) => {
  if (!stageActive()) return
  event.preventDefault()
  const horizontal = Math.abs(event.deltaX) > Math.abs(event.deltaY)
  const delta = horizontal ? event.deltaX : event.deltaY
  if (Math.abs(delta) < 8 || Date.now() < lockedUntil) return
  if (horizontal) {
    goToSlide(visibleRows()[current], Math.sign(delta))
    lockedUntil = Date.now() + DURATION
  } else {
    step(Math.sign(delta))
  }
}, { passive: false })

let touchStart = null
stage.addEventListener('touchstart', (event) => { touchStart = { x: event.touches[0].clientX, y: event.touches[0].clientY } }, { passive: true })
stage.addEventListener('touchmove', (event) => { if (stageActive()) event.preventDefault() }, { passive: false })
stage.addEventListener('touchend', (event) => {
  if (!touchStart || !stageActive()) return
  const dx = event.changedTouches[0].clientX - touchStart.x
  const dy = event.changedTouches[0].clientY - touchStart.y
  touchStart = null
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 40) return
  if (Math.abs(dx) > Math.abs(dy)) goToSlide(visibleRows()[current], dx < 0 ? 1 : -1)
  else step(dy < 0 ? 1 : -1)
})

document.addEventListener('keydown', (event) => {
  if (!stageActive() || event.altKey || event.ctrlKey || event.metaKey) return
  const keys = { ArrowDown: 1, PageDown: 1, ' ': 1, ArrowUp: -1, PageUp: -1 }
  if (event.key in keys) { event.preventDefault(); step(keys[event.key]) }
  if (event.key === 'Home') { event.preventDefault(); goToProject(0) }
  if (event.key === 'End') { event.preventDefault(); goToProject(visibleRows().length - 1) }
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
    event.preventDefault()
    goToSlide(visibleRows()[current], event.key === 'ArrowRight' ? 1 : -1)
  }
})

/* Mouse: click an image to open the project, drag it sideways to change image. */
let drag = null
let suppressClick = false

track.addEventListener('pointerdown', (event) => {
  if (event.pointerType !== 'mouse' || event.button !== 0) return
  const media = event.target.closest('.project-media.is-multi')
  if (!media) return
  settleSlide(media)
  drag = { media, startX: event.clientX, dx: 0, moved: false, index: Number(media.dataset.index || 0), width: media.clientWidth }
})

window.addEventListener('pointermove', (event) => {
  if (!drag) return
  drag.dx = event.clientX - drag.startX
  if (!drag.moved && Math.abs(drag.dx) > 6) {
    drag.moved = true
    drag.media.classList.add('is-dragging')
    document.body.classList.add('is-dragging')
    drag.media.querySelector('.slide-track').style.transition = 'none'
  }
  if (!drag.moved) return
  // Each time the drag covers a full image width, move on to the next image (looping round)
  // and keep following the mouse, so a long drag never stops at an end.
  const total = Number(drag.media.dataset.slides)
  const startIndex = drag.index
  while (drag.dx <= -drag.width) { drag.index = (drag.index + 1) % total; drag.startX -= drag.width; drag.dx += drag.width }
  while (drag.dx >= drag.width) { drag.index = (drag.index - 1 + total) % total; drag.startX += drag.width; drag.dx -= drag.width }
  if (drag.index !== startIndex) {
    drag.media.dataset.index = drag.index
  }
  drag.media.querySelector('.slide-track').style.transform = `translate3d(${-(drag.index + 1) * drag.width + drag.dx}px, 0, 0)`
})

window.addEventListener('pointerup', () => {
  if (!drag) return
  const { media, moved, dx, index, width } = drag
  drag = null
  if (!moved) return
  suppressClick = true
  setTimeout(() => { suppressClick = false }, 0)
  media.classList.remove('is-dragging')
  document.body.classList.remove('is-dragging')
  const slideTrack = media.querySelector('.slide-track')
  void slideTrack.offsetWidth // lock in the dragged position so the glide starts from where it was let go
  slideTrack.style.transition = ''
  const shift = Math.abs(dx) > width * 0.15 ? -Math.sign(dx) : 0
  if (shift) goToSlide(media.closest('.project-row'), shift)
  else placeSlide(media, index + 1, true) // not far enough: glide back
})

track.addEventListener('click', (event) => {
  if (suppressClick && event.target.closest('.slide-link')) event.preventDefault()
}, true)

stage.addEventListener('scroll', () => { stage.scrollTop = 0; stage.scrollLeft = 0 })
window.addEventListener('resize', () => { if (document.body.dataset.view === 'projects') goToProject(current, false) })

let shownKey = null // page currently on screen

function route() {
  const previousKey = shownKey
  const legacyRoutes = { top: '', work: 'projects', architecture: 'projects/architecture', contact: 'info' }
  let hash = window.location.hash.replace(/^#\/?/, '')
  if (hash in legacyRoutes) hash = legacyRoutes[hash]
  let pageKey = hash || 'home'
  let filter = ''
  const filterMatch = hash.match(/^projects\/([a-z0-9-]+)$/)
  if (filterMatch) { pageKey = 'projects'; filter = filterMatch[1] }

  let activePage = document.querySelector(`[data-page="${pageKey}"]`)
  if (!activePage) activePage = document.querySelector('[data-page="home"]')
  const activeKey = activePage.dataset.page
  shownKey = activeKey
  if (activeKey.startsWith('project/') && activeKey !== previousKey) staggerIn(activePage)

  document.querySelectorAll('[data-page]').forEach((page) => { page.hidden = page !== activePage })
  document.body.dataset.view = activeKey === 'home' ? 'home' : activeKey.startsWith('project/') ? 'project' : activeKey

  document.querySelectorAll('[data-nav]').forEach((link) => {
    const isCurrent = link.dataset.nav === activeKey || (link.dataset.nav === 'projects' && activeKey.startsWith('project'))
    if (isCurrent) link.setAttribute('aria-current', 'page')
    else link.removeAttribute('aria-current')
  })

  if (activeKey === 'projects') {
    document.querySelectorAll('.project-row').forEach((row) => { row.hidden = Boolean(filter) && slugify(row.dataset.category) !== filter })
    document.querySelectorAll('[data-filter]').forEach((link) => {
      if (link.dataset.filter === filter) link.setAttribute('aria-current', 'true')
      else link.removeAttribute('aria-current')
    })
    resetStage()
    // Coming back from a project page: return to that project instead of the first one.
    if (previousKey?.startsWith('project/')) {
      const index = visibleRows().findIndex((row) => row.querySelector('.slide-link')?.getAttribute('href') === '#' + previousKey)
      if (index > 0) goToProject(index, false)
    }
  }

  setMenu(false)
  window.scrollTo(0, 0)
}

/* Page transitions: every page change crossfades softly (View Transitions API, where supported).
   Browsers without support, and visitors who ask for less motion, get an instant switch. */
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

// Opening a project: the project page rises in. Leaving one: it drops away. Other pages crossfade.
function navigate() {
  if (!document.startViewTransition || reduceMotion.matches) { route(); return }
  const fromProject = shownKey?.startsWith('project/')
  const root = document.documentElement
  const transition = document.startViewTransition(() => {
    route()
    const toProject = shownKey.startsWith('project/')
    root.dataset.transition = toProject && !fromProject ? 'enter-project' : fromProject && !toProject ? 'leave-project' : ''
  })
  transition.finished.finally(() => { delete root.dataset.transition })
}

// Project page content arrives in sequence (title, details, description, first image).
function staggerIn(page) {
  if (reduceMotion.matches) return
  page.classList.remove('is-entering')
  void page.offsetWidth // restart the animation if the page is opened again
  page.classList.add('is-entering')
  clearTimeout(page.staggerTimer)
  page.staggerTimer = setTimeout(() => page.classList.remove('is-entering'), 1600)
}

/* Project pages: images and description fade up gently as they scroll into view (once each).
   The first image shows straight away, as the page opens. */
function initReveal() {
  if (!('IntersectionObserver' in window) || reduceMotion.matches) return
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return
      entry.target.classList.add('is-revealed')
      observer.unobserve(entry.target)
    })
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 })
  document.querySelectorAll('.project-detail').forEach((page) => {
    const items = [...page.querySelectorAll('.g-item')].slice(1)
    items.forEach((item) => { item.classList.add('reveal'); observer.observe(item) })
  })
}

initGalleries()
initReveal()
initSlideshow(document.querySelector('.home'), () => document.body.dataset.view === 'home')
window.addEventListener('hashchange', navigate)
route()
