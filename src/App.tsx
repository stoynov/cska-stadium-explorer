import { assets } from './config/assets'
import { project } from './config/project'
import {
  Component,
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  ArrowDownRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  Download,
  CodeXml,
  MapPin,
  Mouse,
  MoveUpRight,
  Pause,
  Play,
  RotateCcw,
} from 'lucide-react'
import { content } from './content'
import { initialState, viewerReducer } from './state/viewer'
import { Toolbar } from './ui/Toolbar'
import { Dialog } from './ui/Dialog'
import { StadiumGuide } from './ui/StadiumGuide'
import { downloadBlob } from './services/export'
import type { SceneHandle } from './scene/StadiumScene'
const StadiumScene = lazy(() => import('./scene/StadiumScene'))
const renderImage = assets.render

class SceneBoundary extends Component<
  { children: ReactNode; onError: () => void },
  { failed: boolean }
> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch() {
    this.props.onError()
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}
function useReducedMotion() {
  const [value, setValue] = useState(
    () => matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)'),
      change = () => setValue(media.matches)
    media.addEventListener('change', change)
    return () => media.removeEventListener('change', change)
  }, [])
  return value
}

export default function App() {
  const [state, dispatch] = useReducer(viewerReducer, initialState),
    t = content[state.language]
  const scene = useRef<SceneHandle>(null),
    main = useRef<HTMLElement>(null)
  const [ready, setReady] = useState(false),
    [failed, setFailed] = useState(false),
    [retry, setRetry] = useState(0),
    [settled, setSettled] = useState(false),
    [hidden, setHidden] = useState(document.hidden),
    [isFullscreen, setIsFullscreen] = useState(false),
    [focusTower, setFocusTower] = useState(0)
  const [panel, setPanel] = useState<'about' | 'capture' | 'guide' | null>(
      null,
    ),
    [captureUrl, setCaptureUrl] = useState<string | null>(null),
    [captureBlob, setCaptureBlob] = useState<Blob | null>(null),
    [busy, setBusy] = useState(false),
    [notice, setNotice] = useState(''),
    [hasToured, setHasToured] = useState(false)
  const reduced = useReducedMotion()
  useEffect(() => {
    const update = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', update)
    return () => document.removeEventListener('fullscreenchange', update)
  }, [])
  const fail = useCallback(() => {
    setFailed(true)
    setReady(false)
    dispatch({ type: 'manual' })
  }, [])
  const onReady = useCallback(() => setReady(true), []),
    onSettled = useCallback(() => setSettled(true), []),
    onManual = useCallback(() => {
      dispatch({ type: 'manual' })
      setSettled(true)
    }, [])
  useEffect(() => {
    document.documentElement.lang = state.language
    document.title = `${t.name} — ${t.brand}`
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute('content', t.aboutText)
  }, [state.language, t])
  useEffect(() => {
    const change = () => {
      setHidden(document.hidden)
      if (document.hidden) dispatch({ type: 'manual' })
    }
    document.addEventListener('visibilitychange', change)
    return () => document.removeEventListener('visibilitychange', change)
  }, [])
  useEffect(() => {
    if (reduced) dispatch({ type: 'manual' })
  }, [reduced])
  useEffect(() => {
    setSettled(false)
    setFocusTower(0)
  }, [state.request])
  useEffect(() => {
    if (!state.tour || !settled || hidden || panel || reduced) return
    const timer = setTimeout(() => dispatch({ type: 'advance' }), 8500)
    return () => clearTimeout(timer)
  }, [state.tour, state.request, settled, hidden, panel, reduced])
  useEffect(() => {
    if (!notice) return
    const timer = setTimeout(() => setNotice(''), 5000)
    return () => clearTimeout(timer)
  }, [notice])
  useEffect(
    () => () => {
      if (captureUrl) URL.revokeObjectURL(captureUrl)
    },
    [captureUrl],
  )
  useEffect(() => {
    const c = document.createElement('canvas')
    const context = c.getContext('webgl2')
    if (!context) fail()
    else context.getExtension('WEBGL_lose_context')?.loseContext()
  }, [retry, fail])
  const about = () => {
    dispatch({ type: 'manual' })
    setPanel('about')
  }
  const capture = async () => {
    try {
      const blob = await scene.current!.capture()
      setCaptureBlob(blob)
      setCaptureUrl(URL.createObjectURL(blob))
      dispatch({ type: 'manual' })
      setPanel('capture')
    } catch {
      setNotice(t.captureError)
    }
  }
  const exportModel = async () => {
    if (busy) return
    setBusy(true)
    setNotice(t.exportBusy)
    try {
      const data = await scene.current!.exportModel()
      downloadBlob(
        new Blob([data], { type: 'model/gltf-binary' }),
        'cska-bulgarian-army-stadium.glb',
      )
      setNotice(t.exportDone)
    } catch (error) {
      console.error('Model export:', error)
      setNotice(t.exportError)
    } finally {
      setBusy(false)
    }
  }
  const fullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen()
      else if (main.current?.requestFullscreen)
        await main.current.requestFullscreen()
      else setNotice(t.fullscreenError)
    } catch {
      setNotice(t.fullscreenError)
    }
  }
  const restart = () => {
    setFailed(false)
    setReady(false)
    setRetry((v) => v + 1)
  }
  const tour = () => {
    if (reduced) {
      setNotice(t.tourUnavailable)
      return
    }
    setHasToured(true)
    dispatch({ type: 'tour' })
  }
  return (
    <main
      ref={main}
      className={`experience ${state.night ? 'is-night' : ''} ${ready ? 'is-ready' : ''} ${failed ? 'is-failed' : ''}`}
    >
      <div
        className="fallback-image"
        style={{ backgroundImage: `url("${renderImage}")` }}
      />
      {!failed && (
        <SceneBoundary key={retry} onError={fail}>
          <Suspense fallback={null}>
            <StadiumScene
              ref={scene}
              state={state}
              copy={t}
              reduced={reduced}
              onManual={onManual}
              onSettled={onSettled}
              onReady={onReady}
              onFailure={fail}
              paused={hidden}
              focusTower={focusTower}
            />
          </Suspense>
        </SceneBoundary>
      )}
      <div className="scene-shade" />
      <header className="header">
        <button
          className="identity"
          onClick={() => dispatch({ type: 'reset' })}
          aria-label={t.reset}
        >
          <img
            src={assets.crest}
            alt={state.language === 'bg' ? 'Емблема на ЦСКА' : 'CSKA crest'}
            width="45"
            height="59"
          />
          <span>
            <h1>
              {t.name}
              <span className="title-dot">.</span>
            </h1>
            <span className="identity-subtitle">{t.brand}</span>
          </span>
        </button>
        <div className="header-right">
          <div className="edition">
            <span className="edition-line" />
            {t.architectural}
          </div>
          <div
            className="language-switch"
            role="group"
            aria-label="Език / Language"
          >
            <button
              onClick={() => dispatch({ type: 'language', language: 'bg' })}
              aria-pressed={state.language === 'bg'}
              lang="bg"
            >
              BG
            </button>
            <span>/</span>
            <button
              onClick={() => dispatch({ type: 'language', language: 'en' })}
              aria-pressed={state.language === 'en'}
              lang="en"
            >
              EN
            </button>
          </div>
        </div>
      </header>
      <div className="location">
        <MapPin size={13} />
        <span>{t.location}</span>
        <i />
        <small>{t.country}</small>
      </div>
      <Toolbar
        state={state}
        copy={t}
        dispatch={dispatch}
        onCapture={capture}
        onExport={exportModel}
        onAbout={about}
        onFullscreen={fullscreen}
        isFullscreen={isFullscreen}
        busy={busy}
        ready={ready}
      />
      {!ready && !failed && (
        <div className="loading" role="status">
          <span className="loader-orbit">
            <span />
          </span>
          <p>{t.loading}</p>
          <small>{t.loadingSub}</small>
        </div>
      )}
      {failed ? (
        <section className="fallback-story">
          <span className="eyebrow">{t.brand}</span>
          <h2>{t.failure}</h2>
          <p>{t.failureText}</p>
          <button className="primary-button" onClick={restart}>
            <RotateCcw size={16} />
            {t.retry}
          </button>
          <a href="https://stadium.cska.bg/" target="_blank" rel="noreferrer">
            {t.official}
            <ArrowUpRight size={16} />
          </a>
        </section>
      ) : (
        <>
          <section
            className="story"
            key={`${state.chapter}-${state.language}-${Boolean(focusTower)}`}
            aria-live="polite"
            aria-atomic="true"
          >
            <div className="eyebrow">
              {!focusTower && (
                <span className="chapter-number">0{state.chapter + 1}</span>
              )}
              <span className="eyebrow-line" />
              {focusTower ? t.tower.eyebrow : t.eyebrows[state.chapter]}
            </div>
            <h2>{focusTower ? t.tower.title : t.titles[state.chapter]}</h2>
            <p>
              {focusTower ? t.tower.description : t.descriptions[state.chapter]}
            </p>
            <button
              className="guide-trigger"
              onClick={() => {
                dispatch({ type: 'manual' })
                setPanel('guide')
              }}
            >
              {state.language === 'bg'
                ? 'Факти и посещение'
                : 'Facts & visiting'}{' '}
              <ArrowUpRight size={14} />
            </button>
          </section>
          <div className="view-marker" aria-hidden="true">
            <div className="orbit-diagram">
              <span />
              <MoveUpRight size={27} />
            </div>
            <span>{t.free}</span>
          </div>
          <div className="side-note" aria-hidden="true">
            SOFIA · BORISOVA GRADINA
          </div>
        </>
      )}
      <footer className="footer">
        <div className="journey-top">
          <button
            className={`tour-button ${state.tour ? 'playing' : ''}`}
            onClick={tour}
            disabled={!ready || reduced}
            title={reduced ? t.tourUnavailable : undefined}
            aria-pressed={state.tour}
          >
            {state.tour ? <Pause size={15} /> : <Play size={15} />}
            <span>{state.tour ? t.pause : hasToured ? t.resume : t.tour}</span>
          </button>
          <div className="journey-caption">
            <span>{t.collection}</span>
            <ArrowDownRight size={14} />
          </div>
          <span className="chapter-index">
            0{state.chapter + 1}
            <i>/ 05</i>
          </span>
        </div>
        <p className="touch-hint">{t.mobileHint}</p>
        <nav
          className="chapters"
          aria-label={
            state.language === 'bg'
              ? 'Разходка из стадиона'
              : 'Stadium chapters'
          }
        >
          {t.chapters.map((name, i) => (
            <button
              key={i}
              className={state.chapter === i ? 'active' : ''}
              onClick={() => dispatch({ type: 'chapter', chapter: i })}
              aria-current={state.chapter === i ? 'step' : undefined}
              disabled={!ready}
            >
              <span className="chapter-rule" />
              <span className="chapter-nav-number">0{i + 1}</span>
              <span>{name}</span>
              <ChevronRight size={13} />
            </button>
          ))}
        </nav>
        <div className="bottom-bar">
          <button className="project-link" onClick={about}>
            {t.portfolioProject} <span>·</span> {t.about}
            <ArrowUpRight size={11} />
          </button>
          <div className="gesture-hint">
            <Mouse size={12} />
            <span>
              {t.hint}
              <i>·</i>
              {t.zoomHint}
            </span>
          </div>
          <span className="model-note">
            {t.model}
            <br />
            <a
              href="https://www.openstreetmap.org/copyright"
              target="_blank"
              rel="noreferrer"
            >
              © OpenStreetMap
            </a>{' '}
            ·{' '}
            <a
              href="https://registry.opendata.aws/terrain-tiles/"
              target="_blank"
              rel="noreferrer"
            >
              Mapzen
            </a>
          </span>
        </div>
      </footer>
      {notice && (
        <div className="toast" role="status">
          {busy ? <span className="tiny-spinner" /> : <Check size={15} />}
          <span>{notice}</span>
        </div>
      )}
      {panel === 'guide' && (
        <StadiumGuide
          language={state.language}
          chapter={state.chapter}
          onTower={() => {
            setPanel(null)
            setFocusTower((value) => value + 1)
          }}
          onClose={() => setPanel(null)}
        />
      )}
      {panel === 'about' && (
        <Dialog
          title={t.aboutTitle}
          closeLabel={t.close}
          onClose={() => setPanel(null)}
        >
          <p className="dialog-intro">{t.aboutText}</p>
          <section className="project-details" aria-label={t.behindProject}>
            <h3>{t.behindProject}</h3>
            <p>{t.projectSummary}</p>
            <dl>
              <div>
                <dt>{t.developer}</dt>
                <dd>{project.author}</dd>
              </div>
              <div>
                <dt>{t.builtWith}</dt>
                <dd>React · TypeScript · Three.js</dd>
              </div>
            </dl>
            <div className="project-actions">
              <a href={project.caseStudy} target="_blank" rel="noreferrer">
                {t.viewCaseStudy}
                <ArrowUpRight size={16} />
              </a>
              <a href={project.portfolio} target="_blank" rel="noreferrer">
                {t.visitPortfolio}
                <ArrowUpRight size={16} />
              </a>
              <a href={project.repository} target="_blank" rel="noreferrer">
                <CodeXml size={16} />
                {t.viewCode}
              </a>
            </div>
          </section>
          <figure>
            <img
              src={renderImage}
              alt={t.render}
              width="1600"
              height="900"
              loading="lazy"
            />
            <figcaption>{t.render}</figcaption>
          </figure>
          <p className="accuracy-note">{t.accuracy}</p>
          <a
            className="source-link"
            href="https://stadium.cska.bg/"
            target="_blank"
            rel="noreferrer"
          >
            {t.viewSource}
            <ArrowUpRight size={17} />
          </a>
          <p className="credit-note">{t.credits}</p>
          <p className="credit-note">
            Terrain: Mapzen. Europe terrain data produced using Copernicus data
            and information funded by the European Union — EU-DEM layers. SRTM
            and GMTED2010 data courtesy of the U.S. Geological Survey. Building
            footprints, roads and woodland outlines: © OpenStreetMap
            contributors, ODbL.
          </p>
        </Dialog>
      )}
      {panel === 'capture' && captureUrl && (
        <Dialog
          title={t.moment}
          closeLabel={t.close}
          onClose={() => setPanel(null)}
          className="capture-dialog"
        >
          <p className="dialog-intro">{t.captureCaption}</p>
          <img className="capture-image" src={captureUrl} alt={t.moment} />
          <button
            className="primary-button"
            onClick={() =>
              captureBlob &&
              downloadBlob(captureBlob, 'cska-stadium-moment.png')
            }
          >
            <Download size={16} />
            {t.save}
          </button>
        </Dialog>
      )}
    </main>
  )
}
