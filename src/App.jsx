import React, { useEffect, useState } from 'react'
import HeroScene from './HeroScene.jsx'
import ThemeCity from './ThemeCity.jsx'
import ApplyForm from './ApplyForm.jsx'
import HousesModel from './HousesModel.jsx'
import FactHouseModel from './FactHouseModel.jsx'
import housesMark from '../assets/gaw-houses.png'
import partnerLogos from '../assets/partner-logos.png'
import academyLogo from '../assets/academy-gyumri-branch-hy.png'
import gawLogo from '../assets/gyumri-art-week-logo.png'
import wccLogo from '../assets/wcc-logo.svg'

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

const MARQUEE_BASE_TEXT = 'Դիմել ✳ Apply now ✳ Beyond Form ✳ 03.08 — 05.08 ✳ Gyumri ✳ '
const MARQUEE_BASE_DURATION = 22 // seconds, tuned for MARQUEE_BASE_TEXT's length

function Marquee({ dark, text }) {
  const content = text || MARQUEE_BASE_TEXT
  const items = Array.from({ length: 6 }, (_, i) => (
    <span key={i}>{content}</span>
  ))
  // keep scroll speed (px/s) constant regardless of text length
  const duration = MARQUEE_BASE_DURATION * (content.length / MARQUEE_BASE_TEXT.length)
  return (
    <a className={`marquee${dark ? ' dark' : ''}`} href="#apply" onClick={onFragmentClick} aria-label="Apply now">
      <div className="marquee-track" style={{ animationDuration: `${duration}s` }} aria-hidden="true">
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
  const [formDone, setFormDone] = useState(false)
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
            <img className="hero-mark" src={housesMark} alt="" aria-hidden="true" />
            Beyond Form
            <br />
            <span className="oc-glass">Բաց կանչ — Open call</span>
          </div>
          <div className="right">
            Gyumri Art Week
            <br />
            07.08 — 20.08
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
        <div className="city-canvas-wrap" aria-hidden="true">
          <ThemeCity sectionId="theme" />
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
          <FactHouseModel index={0} />
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
          <FactHouseModel index={1} />
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
          <FactHouseModel index={2} />
          <h3>Որտեղ / Where</h3>
          <p lang="hy">
            Հայաստանի Գեղարվեստի Ակադեմիայի Գյումրու մասնաճյուղ
          </p>
          <p lang="en">
            Academy of Fine Arts, Gyumri, Armenia
          </p>
        </article>
      </section>

      <div id="apply">
      <Marquee dark text="Deadline 25.07 ✳ " />

      <section className="apply">
        {!formDone && (
          <>
            <p lang="hy">
              Աշխատարանների արդյունքում ստեղծված աշխատանքները ցուցադրվելու են հանրային տարածքներում՝ Gyumri Art Week-ի շրջանակում։
              <br />
              <span lang="en">
                The works created as a result of the workshops will be exhibited in public spaces as part of Gyumri Art Week.
              </span>
            </p>
            <h2 className="apply-title">Դիմել — Apply</h2>
          </>
        )}
        <ApplyForm onDone={() => setFormDone(true)} />
        <p className="dates">Beyond Form · 03.08 — 05.08 · Gyumri</p>
      </section>
      </div>

      <footer>
        <div className="houses-3d">
          <HousesModel fallback={<img className="houses" src={housesMark} alt="Gyumri Art Week" />} />
        </div>
        <div className="partners">
          <img
            src={partnerLogos}
            alt="Institute for Contemporary Art Yerevan · ArtNexus / The Swedish Arts Grants Committee · Sverige"
          />
          <img
            src={academyLogo}
            alt="Հայաստանի պետական գեղարվեստի ակադեմիա — Գյումրու մասնաճյուղ"
          />
          <img src={gawLogo} alt="Gyumri Art Week International" />
          <img src={wccLogo} alt="WCC" />
        </div>
        <div className="fine">
          <span>Beyond Form — Open Call</span>
          <span>03.08 — 05.08</span>
        </div>
      </footer>
    </>
  )
}
