import React, { useEffect, useState } from 'react'
import HeroScene from './HeroScene.jsx'
import ThemeCity from './ThemeCity.jsx'
import HousesModel from './HousesModel.jsx'
import WorkModel from './WorkModel.jsx'
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

const scrollToWorks = () =>
  document.getElementById('works')?.scrollIntoView({ behavior: 'smooth', block: 'start' })

const WORKS = [
  {
    artist: 'Arthur Steiner',
    artistHy: 'Արթուր Շտայներ',
    model: 'work-arthur.glb',
    hy: [
      'Այս ստեղծագործությունն ուսումնասիրում է ներկայի և անհասանելի ապագայի միջև առկա լուռ լարվածությունը՝ սյուրռեալիստական տիեզերական բախման միջոցով։ Հսկայական, մեկ թև ունեցող շինությունը, որն ի վիճակի չէ թռչելու, կանգնած է մեկուսացած, մինչ ընկնող աստղը բախվում է անմիջապես կառույցին։',
      'Այս ապոկալիպտիկ պահը իր հետևում թողնում է դատարկության տագնապալի զգացում՝ արտահայտելով երկու ժամանակային գծերի հարկադրված բախման անհնարինությունը։',
    ],
    en: [
      'This artwork explores the quiet tension between the present and an unattainable future through a surreal cosmic collision. A massive, single-winged building—incapable of taking flight—stands isolated as a falling star crashes directly into its frame.',
      'This apocalyptic moment leaves behind a haunting sense of emptiness, capturing the quiet impossibility of two timelines forcefully colliding.',
    ],
  },
  {
    // not on the part-1 roster in the bydf doc — held back until a later part
    artist: 'Ani Petrosyan',
    artistHy: 'Անի Պետրոսյան',
    held: true,
    titleHy: '«Ժամանակի ճեղք»',
    titleEn: '"The Rift of Time"',
    hy: [
      'Քանդակը կազմված է երկու սև տուֆե հատվածներից, որոնք խորհրդանշում են Գյումրու պատմությունն ու ամուր հիմքը։ Դրանց միջև առաջացած ճեղքը հիշեցնում է երկրաշարժի թողած հետքը։',
      'Ճեղքի ներսում տեղադրված երկրաչափական մետաղական կառուցվածքը խորհրդանշում է վերածնունդը, նոր գաղափարներն ու քաղաքի զարգացումը՝ ցույց տալով, որ դժվարություններից հետո հնարավոր է կառուցել նոր ապագա։',
      'Քարի և մետաղի հակադրությունը ներկայացնում է անցյալի և ապագայի կապը՝ արտահայտելով Գյումրու դիմացկունությունն ու վերածննդի ուժը։',
    ],
    en: [
      "The sculpture consists of two black tuff stone blocks, symbolizing Gyumri's history and strong foundation. The rift between them represents the mark left by the earthquake.",
      "Inside the rift, a geometric metal structure symbolizes rebirth, new ideas, and the city's ongoing development, showing that a new future can be built after hardship.",
      "The contrast between the solidity of the stone and the lightness of the metal represents the connection between the past and the future, expressing Gyumri's resilience and the power of rebirth.",
    ],
  },
  {
    artist: 'Daria Daka Vasiuta',
    artistHy: 'Դարիա Դակա Վասիուտա',
    model: 'work-daria.glb',
    titleHy: '«AVGYR: Gyumri» — իմ անձնական առասպելը՝ տեղափոխված այստեղ',
    titleEn: '"AVGYR: Gyumri" — my personal mythology, brought here',
    hy: [
      'AVGYR-ը թռչուն է, որը տարիներ շարունակ ներկա է իմ ստեղծագործություններում՝ որպես երկակիության խորհրդանիշ՝ առանց դատողության։ Այն գիտի, որ չկա օր առանց գիշերվա, լույս՝ առանց խավարի։ Այն իր մեջ կրում է երկուսն էլ՝ չընտրելով դրանցից ոչ մեկը։',
      'Այստեղ այն իր վրա կրում է հենց Գյումրու երկակիությունը՝ Սուրբ Ամենափրկիչ եկեղեցին՝ այն տեսքով, ինչպես մնացել էր 1988 թվականի երկրաշարժից հետո, և նույն եկեղեցին այսօր՝ վերականգնված ու կրկին ամբողջական։ Անցյալն ու ներկան միավորված են մեկ թռչնի վրա՝ ճիշտ այնպես, ինչպես համագոյակցում են հենց քաղաքում։',
      'Թռչունը հետ չի նայում։ Այն թռչում է առաջ՝ իր հետ տանելով այն, ինչ եղել է, և շարժվելով դեպի այն, ինչ դեռ գալու է։ Սա քաղաքի բացառիկ տոկունության վկայությունն է՝ նրա լույսն իր թևերի վրա առաջ տանող։',
    ],
    en: [
      "AVGYR is a bird I've used in my work for years – a symbol of duality without judgment. It knows there is no day without night, no light without dark, and carries both, choosing neither.",
      "Here, it carries the duality of Gyumri itself: the Holy Savior Church (Surb Amenaprkich) as it remained after the 1988 earthquake, and the same church today – restored, whole again. Past and present, held together on one bird, the way they coexist in the city itself.",
      "The bird isn't looking back. It flies forward – carrying what came before, moving toward what comes next. It is an act of witnessing the city's profound resilience, carrying its light on its wings.",
    ],
  },
  {
    artist: 'Kristine Sargsyan',
    artistHy: 'Քրիստինե Սարգսյան',
    model: 'work-kristine.glb',
    hy: [
      'Ստեղծագործությունն անդրադառնում է անցողիկ պահերը պահպանելու մարդկային ձգտմանը՝ միաժամանակ գիտակցելով, որ ոչ մի արձանագրություն չի կարող ամբողջությամբ ամփոփել ապրած փորձառությունը։',
      'Տեղադրված լինելով քաղաքի առօրյա միջավայրում՝ այն դառնում է դիտելու գործողության մի մասը՝ հրավիրելով անցորդներին խորհելու, թե ինչպես է հիշողությունը շարունակաբար ձևավորվում ժամանակի, վայրի և այն սովորական պահերի միջոցով, որոնք մենք ընտրում ենք նկատել։',
    ],
    en: [
      'The work reflects the human desire to preserve passing moments while acknowledging that no recording can fully contain lived experience.',
      "Installed within the city's everyday landscape, it becomes part of the act of observing — inviting passersby to reflect on how memory is continually shaped through time, place, and the ordinary moments we choose to notice.",
    ],
  },
  {
    artist: 'Milena Mkrtichyan',
    artistHy: 'Միլենա Մկրտիչյան',
    model: 'work-milena.glb',
    titleHy: '«Դոմիկ»',
    titleEn: '"Domik"',
    hy: [
      'Դոմիկները, որոնք կառուցվել էին երկրաշարժից հետո, ժամանակի ընթացքում դարձան Գյումրիի քաղաքային միջավայրի անբաժան մասը։ Դրանք առաջին հայացքից գրավում են իրենց գունային բազմազանությամբ, ինքնաբուխ կառուցվածքով և յուրահատուկ մանրամասներով, սակայն այդ տեսքի հետևում թաքնված են ողբերգությունն ու մարդկային ճակատագրերը։',
      'Այս աշխատանքը ուսումնասիրում է, թե ինչպես է ժամանակը փոխում քաղաքի և տարածքի ընկալումը․ այն, ինչ ստեղծվել էր որպես ժամանակավոր լուծում, դարձավ քաղաքի հիշողության և ինքնության մի մասը։',
    ],
    en: [
      "The temporary houses built after the earthquake have, over time, become an inseparable part of Gyumri's urban landscape. At first glance, they attract attention with their vivid colors, improvised structures, and distinctive details. Yet behind this visual appearance lies the memory of tragedy and the lives shaped by its aftermath.",
      "This work explores how time transforms the perception of the city, turning what was once meant to be temporary into a lasting element of Gyumri's collective memory and identity.",
    ],
  },
  // ani.glb + mila-2..4.glb wait in references/works-staged/ with the
  // conceptless models (alla, ine, levon, shushan, telik-ppp, vova)
]

function Works() {
  return (
    <section className="works" id="works">
      <h2 data-reveal>
        Works{' '}
        <span className="hy" lang="hy">
          Աշխատանքներ
        </span>
      </h2>
      <p className="works-part" data-reveal>
        <span lang="hy">Մաս 1</span> — Part 1
      </p>
      <p className="works-venue" data-reveal>
        <span lang="hy">Աշխատարանի արդյունքում ստեղծված աշխատանքները ցուցադրվում են հանրային տարածքներում՝ Gyumri Art Week-ի շրջանակում։</span>
        <br />
        The works created during the workshop are exhibited in public spaces as part of Gyumri Art Week.
        <br />
        <span lang="hy">Հրապարակային ցուցադրություն</span> — Public exhibition ·{' '}
        <a href="https://maps.app.goo.gl/18NibwM33nCDT78y9" target="_blank" rel="noreferrer">
          188 Shahumyan St, Gyumri
        </a>
      </p>
      <div className="works-list">
        {/* entries missing a concept/info (tba) or not on the current doc
            roster (held) stay in WORKS but out of the public list */}
        {WORKS.filter((w) => !w.tba && !w.held).map((w, i) => (
          <article className="work" key={w.artist} data-reveal>
            <h3>
              <span className="work-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              {w.artist}
              {w.artistHy && (
                <>
                  {' '}
                  <span className="hy" lang="hy">
                    {w.artistHy}
                  </span>
                </>
              )}
            </h3>
            {w.model && <WorkModel url={w.model} />}
            {w.titleEn && (
              <p className="work-title">
                {w.titleEn}
                {w.titleHy && <span lang="hy"> · {w.titleHy}</span>}
              </p>
            )}
            <div className="work-text">
              <div lang="hy">
                {w.hy.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
              <div lang="en">
                {w.en.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

const MARQUEE_BASE_TEXT = 'Աշխատանքներ ✳ Works ✳ Beyond Form ✳ 07.08 — 20.08 ✳ Gyumri ✳ '
const MARQUEE_BASE_DURATION = 22 // seconds, tuned for MARQUEE_BASE_TEXT's length

function Marquee({ dark, text, href = '#works', label = 'Works' }) {
  const content = text || MARQUEE_BASE_TEXT
  const items = Array.from({ length: 6 }, (_, i) => (
    <span key={i}>{content}</span>
  ))
  // keep scroll speed (px/s) constant regardless of text length
  const duration = MARQUEE_BASE_DURATION * (content.length / MARQUEE_BASE_TEXT.length)
  return (
    <a className={`marquee${dark ? ' dark' : ''}`} href={href} onClick={onFragmentClick} aria-label={label}>
      <div className="marquee-track" style={{ animationDuration: `${duration}s` }} aria-hidden="true">
        <div className="marquee-chunk">{items}</div>
        <div className="marquee-chunk">{items}</div>
      </div>
    </a>
  )
}

function FloatingWorks() {
  const [shown, setShown] = useState(false)
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    const hero = document.querySelector('.hero')
    const works = document.getElementById('works')
    let heroVisible = true
    let worksVisible = false
    const update = () => setShown(!heroVisible && !worksVisible)
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.target === hero) heroVisible = entry.isIntersecting
        if (entry.target === works) worksVisible = entry.isIntersecting
      })
      update()
    }, { threshold: 0.05 })
    if (hero) observer.observe(hero)
    if (works) observer.observe(works)
    return () => observer.disconnect()
  }, [])
  return (
    <button
      type="button"
      className={`floating-apply${shown ? ' shown' : ''}`}
      onClick={scrollToWorks}
      tabIndex={shown ? 0 : -1}
      aria-hidden={!shown}
    >
      Աշխատանքներ — Works
    </button>
  )
}

export default function App() {
  useScrollReveal()
  const progress = useScrollProgress()
  return (
    <>
      <div className="scroll-progress" style={{ transform: `scaleX(${progress})` }} aria-hidden="true" />
      <FloatingWorks />
      <header className="hero">
        <div className="hero-canvas-wrap" aria-hidden="true">
          <HeroScene />
        </div>

        <div className="hero-meta">
          <div>
            <img className="hero-mark" src={housesMark} alt="" aria-hidden="true" />
            Beyond Form
            <br />
            <span className="oc-glass">Ցուցադրություն — Exhibition</span>
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
            <div className="dates">07.08 — 20.08</div>
            <a className="hero-apply" href="#works" onClick={onFragmentClick}>
              Աշխատանքներ — Works ↓
            </a>
          </div>
        </div>

        <nav className="hero-nav" onClick={onFragmentClick}>
          <a href="#works">Աշխատանքներ / Works</a>
          <a href="#about">Աշխատարան / Workshop</a>
          <a href="#theme">Թեմա / Theme</a>
          <a href="#facts">Մանրամասներ / Details</a>
        </nav>
      </header>

      <Works />

      <Marquee dark text="Աշխատարան ✳ Workshop ✳ Gyumri Art Week ✳ " href="#about" label="Workshop" />

      <section className="about" id="about">
        <div className="am" lang="hy" data-reveal>
          <p className="tag">Աշխատարան</p>
          <p className="lead">
            Beyond Form-ը եռօրյա ստեղծագործական աշխատարան է, որն իրականացվել է
            Gyumri Art Week-ի շրջանակում՝ Ժամանակակից արվեստի ինստիտուտի,
            Հայաստանի գեղարվեստի պետական ակադեմիայի Գյումրու մասնաճյուղի և
            G.Urban Platform-ի համագործակցությամբ։
          </p>
          <p>
            Աշխատարանը նախատեսված էր երիտասարդ արվեստագետների, ուսանողների և
            բոլոր նրանց համար, ովքեր հետաքրքրված են ժամանակակից արվեստով, նոր
            մեդիաներով, 3D մոդելավորմամբ, 3D տպագրությամբ և վիզուալ
            պրոյեկցիաներով։
          </p>
          <p>
            Եռօրյա աշխատարանի ընթացքում մասնակիցները ծանոթացան թվային
            արտադրության և վիզուալ տեխնոլոգիաների հնարավորություններին,
            զարգացրին իրենց գաղափարները մենթորների աջակցությամբ և ստեղծեցին
            արվեստի գործեր՝ հիմնված փառատոնի այս տարվա թեմայի վրա։
          </p>
        </div>
        <div className="en" lang="en" data-reveal>
          <p className="tag">Workshop</p>
          <p className="lead">
            Beyond Form was a three-day creative workshop, implemented within
            the framework of Gyumri Art Week, in cooperation with the Institute
            of Contemporary Art, the Gyumri Branch of the State Academy of
            Fine Arts of Armenia, and G.Urban Platform.
          </p>
          <p>
            The workshop was intended for young artists, students and all those
            who are interested in contemporary art, new media, 3D modeling, 3D
            printing and visual projections.
          </p>
          <p>
            During the three-day workshop, participants got acquainted
            with the possibilities of digital production and visual
            technologies, developed their ideas with the support of mentors and
            created works of art based on this year's theme of the festival.
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
            Հայաստանի գեղարվեստի պետական ակադեմիայի Գյումրու մասնաճյուղ
          </p>
          <p lang="en">
            Gyumri Branch of the State Academy of Fine Arts of Armenia
          </p>
        </article>
      </section>

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
          <span>Beyond Form — Exhibition</span>
          <span>07.08 — 20.08</span>
        </div>
      </footer>
    </>
  )
}
