import React, { useEffect, useState } from 'react'
import HeroScene from './HeroScene.jsx'
import StrokeField from './StrokeField.jsx'
import ApplyForm from './ApplyForm.jsx'
import housesMark from '../assets/gaw-houses.png'
import partnerLogos from '../assets/partner-logos.png'

// Inside the di.iiii space viewer the page runs in a sandboxed srcdoc iframe
// whose base URL is the parent shell's — a plain href="#id" click there
// navigates the iframe to the shell URL (which cannot run sandboxed) instead
// of scrolling. Intercept fragment links and scroll manually.
const onFragmentClick = (e) => {
  const anchor = e.target.closest?.('a[href^="#"]')
  if (!anchor) return
  e.preventDefault()
  const id = anchor.getAttribute('href').slice(1)
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const REDUCE_MOTION =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

// sections marked data-reveal slide in as they enter the viewport
const useScrollReveal = () => {
  useEffect(() => {
    if (REDUCE_MOTION || typeof IntersectionObserver === 'undefined') return
    document.documentElement.classList.add('reveal-ready')
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed')
          observer.unobserve(entry.target)
        }
      }),
      { threshold: 0.12 }
    )
    document.querySelectorAll('[data-reveal]').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])
}

const useScrollProgress = () => {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement
      const max = doc.scrollHeight - window.innerHeight
      setProgress(max > 0 ? window.scrollY / max : 0)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return progress
}

const scrollToApply = () =>
  document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth', block: 'start' })

function Marquee({ dark }) {
  const items = Array.from({ length: 6 }, (_, i) => (
    <span key={i}>Դիմել ✳ Apply now ✳ Beyond Form ✳ 03.08 — 05.08 ✳ Gyumri ✳ </span>
  ))
  return (
    <a className={`marquee${dark ? ' dark' : ''}`} href="#apply" onClick={onFragmentClick} aria-label="Apply now">
      <div className="marquee-track" aria-hidden="true">
        <div className="marquee-chunk">{items}</div>
        <div className="marquee-chunk">{items}</div>
      </div>
    </a>
  )
}

function FloatingApply() {
  const [shown, setShown] = useState(false)
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    const hero = document.querySelector('.hero')
    const apply = document.getElementById('apply')
    let heroVisible = true
    let applyVisible = false
    const update = () => setShown(!heroVisible && !applyVisible)
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.target === hero) heroVisible = entry.isIntersecting
        if (entry.target === apply) applyVisible = entry.isIntersecting
      })
      update()
    }, { threshold: 0.05 })
    if (hero) observer.observe(hero)
    if (apply) observer.observe(apply)
    return () => observer.disconnect()
  }, [])
  return (
    <button
      type="button"
      className={`floating-apply${shown ? ' shown' : ''}`}
      onClick={scrollToApply}
      tabIndex={shown ? 0 : -1}
      aria-hidden={!shown}
    >
      Դիմել — Apply
    </button>
  )
}

export default function App() {
  useScrollReveal()
  const progress = useScrollProgress()
  return (
    <>
      <div className="scroll-progress" style={{ transform: `scaleX(${progress})` }} aria-hidden="true" />
      <FloatingApply />
      <header className="hero">
        <div className="hero-canvas-wrap" aria-hidden="true">
          <HeroScene />
        </div>

        <div className="hero-meta">
          <div>
            Beyond Form
            <br />
            Բաց կանչ — Open call
          </div>
          <div className="right">
            Gyumri Art Week
            <br />
            03.08 — 05.08
          </div>
        </div>

        <div className="hero-title">
          <h1>Beyond Form</h1>
          <div className="hero-title-side">
            <div className="dates">03.08 — 05.08</div>
            <a className="hero-apply" href="#apply" onClick={onFragmentClick}>
              Դիմել — Apply ↓
            </a>
          </div>
        </div>

        <nav className="hero-nav" onClick={onFragmentClick}>
          <a href="#about">Աշխատարան / Workshop</a>
          <a href="#theme">Թեմա / Theme</a>
          <a href="#facts">Մանրամասներ / Details</a>
          <a href="#apply">Դիմել / Apply</a>
        </nav>
      </header>

      <section className="about" id="about">
        <div className="am" lang="hy" data-reveal>
          <p className="tag">Բաց կանչ</p>
          <p className="lead">
            Beyond Form-ը եռօրյա ստեղծագործական աշխատարան է, որն իրականացվում է
            Gyumri Art Week-ի շրջանակում՝ Ժամանակակից արվեստի ինստիտուտի,
            Գյումրու Գեղարվեստի ակադեմիայի և G.Urban Platform-ի
            համագործակցությամբ։
          </p>
          <p>
            Աշխատարանը նախատեսված է երիտասարդ արվեստագետների, ուսանողների և
            բոլոր նրանց համար, ովքեր հետաքրքրված են ժամանակակից արվեստով, նոր
            մեդիաներով, 3D մոդելավորմամբ, 3D տպագրությամբ և վիզուալ
            պրոյեկցիաներով։
          </p>
          <p>
            Եռօրյա աշխատարանի ընթացքում մասնակիցները կծանոթանան թվային
            արտադրության և վիզուալ տեխնոլոգիաների հնարավորություններին,
            կզարգացնեն իրենց գաղափարները մենթորների աջակցությամբ և կստեղծեն
            արվեստի գործեր՝ հիմնված փառատոնի այս տարվա թեմայի վրա։
          </p>
        </div>
        <div className="en" lang="en" data-reveal>
          <p className="tag">Open call</p>
          <p className="lead">
            Beyond Form is a three-day creative workshop, implemented within
            the framework of Gyumri Art Week, in cooperation with the Institute
            of Contemporary Art, Gyumri Academy of Fine Arts and G.Urban
            Platform.
          </p>
          <p>
            The workshop is intended for young artists, students and all those
            who are interested in contemporary art, new media, 3D modeling, 3D
            printing and visual projections.
          </p>
          <p>
            During the three-day workshop, participants will get acquainted
            with the possibilities of digital production and visual
            technologies, develop their ideas with the support of mentors and
            create works of art based on this year's theme of the festival.
          </p>
        </div>
      </section>

      <Marquee />

      <section className="theme" id="theme">
        <div className="stroke-canvas-wrap" aria-hidden="true">
          <StrokeField />
        </div>
        <h2 data-reveal>
          City and Time{' '}
          <span className="hy" lang="hy">
            Քաղաքը և ժամանակը
          </span>
        </h2>
        <div className="theme-text">
          <div lang="hy" data-reveal>
            <p>
              Քաղաքը, որպես ժամանակների հատման, համակեցության և փոխակերպման
              տարածք։
            </p>
            <p>
              Թեման առաջարկում է անդրադառնալ այն հարցերին, թե ինչպես են
              քաղաքները կրում հիշողությունը, ինչպես են փոխվում ժամանակի
              ընթացքում և ինչպիսի ապագաներ կարող ենք պատկերացնել դրանց համար։
            </p>
            <p>
              Գյումրին ոչ միայն փառատոնի անցկացման վայրն է, այլև կենդանի
              հետազոտական միջավայր, որի միջոցով հնարավոր է ուսումնասիրել
              ժամանակի և քաղաքի փոխհարաբերության բազմազան դրսևորումները։
            </p>
          </div>
          <div lang="en" data-reveal>
            <p>
              The city as a space of intersection, coexistence and
              transformation of times.
            </p>
            <p>
              The theme suggests addressing the questions of how cities carry
              memory, how they change over time, and what futures we can
              imagine for them.
            </p>
            <p>
              Gyumri is not only the venue for the festival, but also a living
              research environment through which it is possible to explore the
              diverse manifestations of the relationship between time and the
              city.
            </p>
          </div>
        </div>
      </section>

      <section className="facts" id="facts">
        <article data-reveal>
          <div className="num">01</div>
          <h3>Ով / Who</h3>
          <p lang="hy">
            Երիտասարդ արվեստագետներ, ուսանողներ և բոլոր նրանք, ովքեր
            հետաքրքրված են ժամանակակից արվեստով և նոր մեդիաներով։
          </p>
          <p lang="en">
            Young artists, students, and anyone interested in contemporary art
            and new media.
          </p>
        </article>
        <article data-reveal>
          <div className="num">02</div>
          <h3>Ինչ / What</h3>
          <p lang="hy">
            3D մոդելավորում, 3D տպագրություն, վիզուալ պրոյեկցիաներ՝ մենթորների
            աջակցությամբ։
          </p>
          <p lang="en">
            3D modeling, 3D printing, and visual projections — developed with
            the support of mentors.
          </p>
        </article>
        <article data-reveal>
          <div className="num">03</div>
          <h3>Որտեղ / Where</h3>
          <p lang="hy">
            Գյումրի — կենդանի հետազոտական միջավայր, Gyumri Art Week-ի
            շրջանակում։
          </p>
          <p lang="en">
            Gyumri — a living research environment, within the framework of
            Gyumri Art Week.
          </p>
        </article>
      </section>

      <Marquee dark />

      <section className="apply" id="apply">
        <p lang="hy">
          Ստեղծվող աշխատանքները կարող են լինել թեմայի անձնական, հետազոտական կամ
          փորձարարական մեկնաբանություններ։
          <br />
          <span lang="en">
            The works created can be personal, research, or experimental
            interpretations of the theme.
          </span>
        </p>
        <h2 className="apply-title">Դիմել — Apply</h2>
        <ApplyForm />
        <p className="dates">Beyond Form · 03.08 — 05.08 · Gyumri</p>
      </section>

      <footer>
        <img className="houses" src={housesMark} alt="Gyumri Art Week" />
        <div className="orgs">
          <span>Gyumri Art Week</span>
          <span lang="hy">Ժամանակակից արվեստի ինստիտուտ</span>
          <span lang="hy">Գյումրու Գեղարվեստի ակադեմիա</span>
          <span>G.Urban Platform</span>
        </div>
        <div className="partners">
          <img
            src={partnerLogos}
            alt="Institute for Contemporary Art Yerevan · ArtNexus / The Swedish Arts Grants Committee · Sverige"
          />
        </div>
        <div className="fine">
          <span>Beyond Form — Open Call</span>
          <span>03.08 — 05.08</span>
        </div>
      </footer>
    </>
  )
}
