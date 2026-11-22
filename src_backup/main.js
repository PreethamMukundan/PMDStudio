import './style.css'
import content from './content.json'

const { site, navigation, projects, architectureProjects } = content
const placeholderFloorPlans = [
  { image: '/placeholder-floor-plan.svg', title: 'Ground floor plan' },
  { image: '/placeholder-upper-floor-plan.svg', title: 'Upper floor plan' },
  { image: '/placeholder-building-section.svg', title: 'Building section' }
]

document.querySelector('#app').innerHTML = `
  <header class="site-header">
    <a class="wordmark" href="#top" aria-label="${site.name} home"><span>${site.headerName}</span><small>${site.headerSubline}</small></a>
    <nav aria-label="Main navigation">
      ${navigation.map((item) => `<button class="nav-tab" type="button" data-tab="${item.target}" aria-expanded="false">${item.label}</button>`).join('')}
    </nav>
    <a class="header-email" href="mailto:${site.email}">Inquire <span>↗</span></a>
  </header>
  <aside class="tab-panel" aria-live="polite" aria-hidden="true">
    <div class="tab-panel-inner">
      <p class="eyebrow">${site.name}</p>
      <div class="tab-panel-content" data-panel-content></div>
      <button class="panel-close" type="button" aria-label="Close menu">Close <span>×</span></button>
    </div>
  </aside>
  <main id="top">
    <section class="hero" aria-labelledby="hero-title">
      <p class="eyebrow">${site.location}</p>
      <h1 id="hero-title">${site.tagline}</h1>
      <div class="hero-meta"><p>${site.intro}</p><a class="circle-link" href="#work" aria-label="Explore selected work">↓</a></div>
    </section>
    <section class="work-section" id="work" aria-labelledby="work-title">
      <div class="section-heading"><p class="eyebrow">Selected work</p><h2 id="work-title">Rooms that remember<br><em>who you are.</em></h2></div>
      <div class="project-grid">
        ${projects.map((project, index) => `<article class="project-card project-card-${index + 1}"><a href="#contact" class="project-image"><img src="${project.image}" alt="${project.alt}" loading="${index > 1 ? 'lazy' : 'eager'}"><span class="project-index">0${index + 1}</span></a><div class="project-info"><h3>${project.title}</h3><p>${project.type}</p><p>${project.year}</p></div></article>`).join('')}
      </div>
    </section>
    <section class="architecture-page" id="architecture" aria-labelledby="architecture-title">
      <div class="architecture-header">
        <p class="eyebrow">Architecture</p>
        <h2 id="architecture-title">All projects</h2>
      </div>
      <div class="architecture-projects">
        ${architectureProjects.map((project, index) => `
          <a href="#project/${project.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}" class="architecture-row" aria-label="View ${project.title} project">
            <div class="architecture-image">
              <img src="${project.image}" alt="${project.alt}" loading="${index > 2 ? 'lazy' : 'eager'}">
            </div>
            <div class="architecture-copy">
              <h3>${project.title}</h3>
              <p class="architecture-details">${project.typology} <span>·</span> ${project.location} <span>·</span> ${project.year}</p>
            </div>
          </a>
        `).join('')}
      </div>
    </section>
    ${architectureProjects.map((project) => {
      const slug = project.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      return `
        <article class="project-detail" data-project-detail="${slug}" hidden>
          <a class="detail-back" href="#architecture">← All architecture projects</a>
          <header class="detail-header">
            <p class="eyebrow">${project.typology} · ${project.location} · ${project.year}</p>
            <h2>${project.title}</h2>
            <p class="detail-brief">${project.brief}</p>
          </header>
          <figure class="detail-hero-image">
            <img src="${project.image}" alt="${project.alt}">
          </figure>
          <section class="detail-gallery" aria-label="${project.title} project images">
            ${project.gallery.map((image) => `<figure><img src="${image.image}" alt="${image.alt}" loading="lazy"></figure>`).join('')}
          </section>
          ${project.moodBoard ? `
            <section class="detail-moodboard" aria-labelledby="moodboard-${slug}">
              <div class="detail-section-heading">
                <p class="eyebrow">Materials & atmosphere</p>
                <h3 id="moodboard-${slug}">A sense of place</h3>
              </div>
              <img src="${project.moodBoard}" alt="Mood board inspiration for ${project.title}" loading="lazy">
            </section>
          ` : ''}
          <section class="detail-floorplan" aria-labelledby="floorplan-${slug}">
            <div class="detail-section-heading">
              <p class="eyebrow">The plan</p>
              <h3 id="floorplan-${slug}">Space, considered.</h3>
            </div>
            <div class="floorplan-gallery">
              ${placeholderFloorPlans.map((plan) => `
                <figure>
                  <img src="${plan.image}" alt="${plan.title} placeholder drawing for ${project.title}" loading="lazy">
                  <figcaption>${plan.title} · Placeholder drawing</figcaption>
                </figure>
              `).join('')}
            </div>
          </section>
        </article>
      `
    }).join('')}
    <section class="studio-section" id="studio" aria-labelledby="studio-title"><p class="eyebrow">The studio</p><div><h2 id="studio-title">We make space<br>for <em>living well.</em></h2><p class="studio-copy">Every project begins with listening. We work slowly and closely, shaping architecture, interiors, and objects into places with a distinct sense of ease.</p><a class="text-link" href="mailto:${site.email}">Start a conversation <span>↗</span></a></div></section>
    <section class="contact-section" id="contact" aria-labelledby="contact-title"><p class="eyebrow">Have a project in mind?</p><h2 id="contact-title">Let's make<br><em>something lasting.</em></h2><a class="contact-email" href="mailto:${site.email}">${site.email}</a></section>
  </main>
  <footer class="site-footer"><span>${site.footerNote}</span><span>${site.name} © 2024</span><a href="https://instagram.com/${site.instagram.replace('@', '')}" target="_blank" rel="noreferrer">${site.instagram} ↗</a></footer>
`

const panel = document.querySelector('.tab-panel')
const panelContent = document.querySelector('[data-panel-content]')
const tabs = document.querySelectorAll('.nav-tab')

const panelCopy = {
  work: `<h2>Selected<br><em>work.</em></h2><div class="panel-actions panel-categories"><a class="panel-link" href="#architecture">Architecture <span>↗</span></a><a class="panel-link" href="#work">Interior <span>↗</span></a><a class="panel-link" href="#work">Product <span>↗</span></a></div>`,
  studio: `<h2>Studio<br><em>coming soon.</em></h2>`,
  contact: `<h2>Let's make<br><em>something lasting.</em></h2><div class="panel-actions"><a class="panel-link" href="mailto:${site.email}">${site.email} <span>↗</span></a><a class="panel-link" href="https://instagram.com/${site.instagram.replace('@', '')}" target="_blank" rel="noreferrer">Instagram ${site.instagram} <span>↗</span></a></div>`
}

function closePanel() {
  panel.classList.remove('is-open')
  panel.setAttribute('aria-hidden', 'true')
  tabs.forEach((tab) => tab.setAttribute('aria-expanded', 'false'))
}

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    const isActive = panel.classList.contains('is-open') && panel.dataset.active === tab.dataset.tab
    if (isActive) {
      closePanel()
      return
    }
    panel.dataset.active = tab.dataset.tab
    panelContent.innerHTML = panelCopy[tab.dataset.tab]
    panel.classList.add('is-open')
    panel.setAttribute('aria-hidden', 'false')
    tabs.forEach((item) => item.setAttribute('aria-expanded', item === tab ? 'true' : 'false'))
  })
})

document.querySelector('.panel-close').addEventListener('click', closePanel)

function updateProjectRoute() {
  const projectSlug = window.location.hash.match(/^#project\/([a-z0-9-]+)$/)?.[1]
  const activeProject = projectSlug
    ? document.querySelector(`[data-project-detail="${projectSlug}"]`)
    : null

  document.querySelectorAll('[data-project-detail]').forEach((detail) => {
    const isActive = detail === activeProject
    detail.hidden = !isActive
    detail.classList.toggle('is-active', isActive)
  })
  document.querySelector('main').classList.toggle('is-project-view', Boolean(activeProject))

  if (activeProject) {
    closePanel()
    window.scrollTo(0, 0)
  } else {
    const target = document.getElementById(window.location.hash.slice(1))
    if (target) target.scrollIntoView()
  }
}

window.addEventListener('hashchange', updateProjectRoute)
updateProjectRoute()
