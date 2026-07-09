import React, { useState } from 'react'

// Mirrors the organizers' Google Form (open call) — entry IDs extracted from
// FB_PUBLIC_LOAD_DATA_. Submissions land in their spreadsheet; labels must
// stay verbatim Armenian, EN lines are hints only.
const FORM_ID = '1FAIpQLScV1g-mu1jVS96-NgacscmwMExVktXWw6QfEtw2YeoBp2IoUA'
export const FORM_URL = `https://docs.google.com/forms/d/e/${FORM_ID}/viewform`
const SUBMIT_URL = `https://docs.google.com/forms/d/e/${FORM_ID}/formResponse`

const EXPERIENCE = [
  '3D մոդելավորում',
  '3D տպագրություն',
  'Վիզուալ պրոյեկցիաներ',
  'Թվային արվեստ',
]

// Dual-write: di.iiii serverXR keeps its own copy for the /admin review board.
// Inside the space viewer document.baseURI is the parent shell's URL, so the
// same host (staging or production) serves the API; elsewhere default to prod.
const CALL_ID = 'beyond_form'
const serverXRUrl = () => {
  try {
    const u = new URL(document.baseURI)
    if (u.hostname.endsWith('di-studio.xyz')) {
      return `${u.origin}/serverXR/api/open-calls/${CALL_ID}/applications`
    }
  } catch { /* about:srcdoc without inherited base — fall through */ }
  return `https://di-studio.xyz/serverXR/api/open-calls/${CALL_ID}/applications`
}

const Field = ({ label, hint, children, optional }) => (
  <label className="af-field">
    <span className="af-label" lang="hy">
      {label}
      {optional && <em> · ըստ ցանկության</em>}
    </span>
    <span className="af-hint" lang="en">{hint}</span>
    {children}
  </label>
)

export default function ApplyForm() {
  const [status, setStatus] = useState('idle') // idle | sending | done | error
  const [experience, setExperience] = useState([])

  const toggleExp = (opt) =>
    setExperience((xs) => (xs.includes(opt) ? xs.filter((x) => x !== opt) : [...xs, opt]))

  const onSubmit = async (e) => {
    e.preventDefault()
    if (status === 'sending') return
    const f = e.target
    const data = {
      name: f.name_.value,
      dob: f.dob.value, // yyyy-mm-dd
      city: f.city.value,
      phone: f.phone.value,
      email: f.email.value,
      about: f.about.value,
      why: f.why.value,
      idea: f.idea.value,
      experience,
      portfolio: f.portfolio.value,
      days: f.days.value,
      laptop: f.laptop.value,
    }

    const body = new URLSearchParams()
    body.append('entry.1680962767', data.name)
    if (data.dob) {
      const [y, m, d] = data.dob.split('-')
      body.append('entry.925005911_year', y)
      body.append('entry.925005911_month', String(Number(m)))
      body.append('entry.925005911_day', String(Number(d)))
    }
    body.append('entry.1974150308', data.city)
    body.append('entry.1174240905', data.phone)
    body.append('entry.1982878787', data.email)
    body.append('entry.733525691', data.about)
    body.append('entry.1363456789', data.why)
    body.append('entry.882121766', data.idea)
    data.experience.forEach((x) => body.append('entry.501326964', x))
    body.append('entry.926728418', data.portfolio)
    body.append('entry.1290946919', data.days)
    body.append('entry.219598360', data.laptop)

    setStatus('sending')
    // no-cors: Google Forms accepts the POST but the response is opaque
    const googleWrite = fetch(SUBMIT_URL, { method: 'POST', mode: 'no-cors', body })
    // best-effort copy into di.iiii — review board reads this; Google stays canonical
    const serverWrite = fetch(serverXRUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((r) => { if (!r.ok) throw new Error(`serverXR ${r.status}`) })

    const [google, server] = await Promise.allSettled([googleWrite, serverWrite])
    if (server.status === 'rejected') console.warn('serverXR copy failed:', server.reason)
    setStatus(google.status === 'fulfilled' || server.status === 'fulfilled' ? 'done' : 'error')
  }

  if (status === 'done') {
    return (
      <div className="af-done">
        <p className="af-done-big" lang="hy">Շնորհակալություն</p>
        <p lang="en">
          Your application has been submitted. / Ձեր հայտն ուղարկված է։
        </p>
      </div>
    )
  }

  return (
    <form className="af" onSubmit={onSubmit}>
      <div className="af-grid">
        <Field label="Անուն, ազգանուն" hint="Name, surname">
          <input name="name_" type="text" required autoComplete="name" />
        </Field>
        <Field label="Տարիք" hint="Date of birth">
          <input name="dob" type="date" required />
        </Field>
        <Field label="Քաղաք" hint="City">
          <input name="city" type="text" required />
        </Field>
        <Field label="Հեռախոսահամար" hint="Phone number">
          <input name="phone" type="tel" required autoComplete="tel" />
        </Field>
        <Field label="Էլեկտրոնային հասցե" hint="Email">
          <input name="email" type="email" required autoComplete="email" />
        </Field>
      </div>

      <Field label="Կարճ ներկայացրեք ձեզ (մինչև 200 բառ)։" hint="Introduce yourself briefly (up to 200 words)">
        <textarea name="about" rows="4" required />
      </Field>
      <Field label="Ինչո՞ւ եք ցանկանում մասնակցել Beyond Form աշխատարանին։" hint="Why do you want to take part in Beyond Form?">
        <textarea name="why" rows="4" required />
      </Field>
      <Field label="Եթե արդեն ունեք գաղափար, համառոտ ներկայացրեք այն։" hint="If you already have an idea, describe it briefly" optional>
        <textarea name="idea" rows="3" />
      </Field>

      <fieldset className="af-choices">
        <legend>
          <span className="af-label" lang="hy">Ունե՞ք փորձ հետևյալ ուղղություններից որևէ մեկում։</span>
          <span className="af-hint" lang="en">Any experience in these areas?</span>
        </legend>
        <div className="af-pills">
          {EXPERIENCE.map((opt) => (
            <button
              type="button"
              key={opt}
              className={experience.includes(opt) ? 'on' : ''}
              onClick={() => toggleExp(opt)}
            >
              {opt}
            </button>
          ))}
        </div>
        <input
          type="text"
          required
          value={experience.length ? 'ok' : ''}
          onChange={() => {}}
          aria-hidden="true"
          tabIndex={-1}
          className="af-choices-required"
        />
      </fieldset>

      <Field label="Կցեք ձեր պորտֆոլիոն կամ 3–5 աշխատանքների հղում։" hint="Portfolio or link to 3–5 works">
        <input name="portfolio" type="text" inputMode="url" required />
      </Field>
      <div className="af-grid">
        <fieldset className="af-choices">
          <legend>
            <span className="af-label" lang="hy">Հաստատո՞ւմ եք, որ կարող եք մասնակցել բոլոր երեք օրերին։</span>
            <span className="af-hint" lang="en">Can you attend all three days?</span>
          </legend>
          <div className="af-radios">
            <label><input type="radio" name="days" value="Այո" required /><span>Այո</span></label>
            <label><input type="radio" name="days" value="Ոչ" /><span>Ոչ</span></label>
          </div>
        </fieldset>
        <fieldset className="af-choices">
          <legend>
            <span className="af-label" lang="hy">Ունե՞ք անձնական նոթբուք աշխատարանի համար։</span>
            <span className="af-hint" lang="en">Do you have a laptop you can bring?</span>
          </legend>
          <div className="af-radios">
            <label><input type="radio" name="laptop" value="Այո" required /><span>Այո</span></label>
            <label>
              <input type="radio" name="laptop" value="Ոչ, անհրաժեշտ է, որ տրամադրվի աշխատարանի ընթացքում։" />
              <span>Ոչ, անհրաժեշտ է տրամադրել</span>
            </label>
          </div>
        </fieldset>
      </div>

      {status === 'error' && (
        <p className="af-error">
          Չհաջողվեց ուղարկել։ Փորձեք կրկին կամ դիմեք{' '}
          <a href={FORM_URL} target="_blank" rel="noopener noreferrer">Google Form-ով</a>։
        </p>
      )}

      <button className="af-submit" type="submit" disabled={status === 'sending'}>
        {status === 'sending' ? 'Ուղարկվում է…' : 'Ուղարկել — Submit'}
      </button>
      <p className="af-fallback">
        <a href={FORM_URL} target="_blank" rel="noopener noreferrer">
          Կամ բացել Google Form-ը / Or open the Google Form
        </a>
      </p>
    </form>
  )
}
