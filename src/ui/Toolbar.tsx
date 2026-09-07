import {
  Camera,
  Download,
  Layers3,
  MapPin,
  Sun,
  Moon,
  RotateCcw,
  Info,
  Maximize,
  Ellipsis,
  X,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { Copy } from '../content'
import type { ViewerState, ViewerAction } from '../state/viewer'
interface Props {
  copy: Copy
  state: ViewerState
  dispatch: (a: ViewerAction) => void
  onCapture: () => void
  onExport: () => void
  onAbout: () => void
  onFullscreen: () => void
  busy: boolean
  ready: boolean
  isFullscreen: boolean
}
export function Toolbar({
  copy: t,
  state,
  dispatch,
  onCapture,
  onExport,
  onAbout,
  onFullscreen,
  busy,
  ready,
  isFullscreen,
}: Props) {
  const [expanded, setExpanded] = useState(false),
    wrap = useRef<HTMLElement>(null),
    trigger = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (!expanded) return
    const listener = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setExpanded(false)
        trigger.current?.focus()
      }
    }
    const outside = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setExpanded(false)
    }
    window.addEventListener('keydown', listener)
    window.addEventListener('pointerdown', outside)
    return () => {
      window.removeEventListener('keydown', listener)
      window.removeEventListener('pointerdown', outside)
    }
  }, [expanded])
  const action = (fn: () => void) => () => {
    if (expanded) {
      trigger.current?.focus()
      setExpanded(false)
    }
    fn()
  }
  return (
    <nav
      ref={wrap}
      className="toolbar"
      aria-label={
        state.language === 'bg' ? 'Контроли на изгледа' : 'View controls'
      }
    >
      <div className="toolbar-primary">
        <button
          className="tool"
          onClick={() => dispatch({ type: 'cutaway' })}
          aria-label={t.cutaway}
          aria-pressed={state.cutaway}
          disabled={!ready}
          title={t.cutaway}
        >
          <Layers3 />
          <span>{t.cutaway}</span>
        </button>
        <button
          className="tool"
          onClick={() => dispatch({ type: 'labels' })}
          aria-label={t.labels}
          aria-pressed={state.labels}
          disabled={!ready}
          title={t.labels}
        >
          <MapPin />
          <span>{t.labels}</span>
        </button>
        <i className="tool-divider" />
        <button
          className="tool"
          onClick={() => dispatch({ type: 'night' })}
          aria-label={state.night ? t.night : t.day}
          aria-pressed={state.night}
          disabled={!ready}
          title={state.night ? t.night : t.day}
        >
          {state.night ? <Moon /> : <Sun />}
          <span>{state.night ? t.night : t.day}</span>
        </button>
        <button
          className="tool capture-tool"
          onClick={onCapture}
          aria-label={t.capture}
          disabled={!ready}
          title={t.capture}
        >
          <Camera />
          <span>{t.capture}</span>
        </button>
        <button
          ref={trigger}
          className="tool more-tool"
          aria-label={t.more}
          aria-expanded={expanded}
          aria-controls="extra-tools"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? <X /> : <Ellipsis />}
        </button>
      </div>
      <div
        className={`toolbar-extra ${expanded ? 'expanded' : ''}`}
        id="extra-tools"
      >
        <i className="tool-divider" />
        <button
          className="tool"
          onClick={action(onExport)}
          aria-label={t.export}
          disabled={busy || !ready}
          title={t.export}
        >
          <Download className={busy ? 'busy-icon' : ''} />
          <span className="mobile-tool-label">{t.export}</span>
        </button>
        <button
          className="tool"
          onClick={action(() => dispatch({ type: 'reset' }))}
          aria-label={t.reset}
          disabled={!ready}
          title={t.reset}
        >
          <RotateCcw />
          <span className="mobile-tool-label">{t.reset}</span>
        </button>
        <button
          className="tool"
          onClick={action(onAbout)}
          aria-label={t.about}
          title={t.about}
        >
          <Info />
          <span className="mobile-tool-label">{t.about}</span>
        </button>
        <button
          className="tool"
          onClick={action(onFullscreen)}
          aria-label={isFullscreen ? t.exitFullscreen : t.fullscreen}
          aria-pressed={isFullscreen}
          title={isFullscreen ? t.exitFullscreen : t.fullscreen}
        >
          <Maximize />
          <span className="mobile-tool-label">
            {isFullscreen ? t.exitFullscreen : t.fullscreen}
          </span>
        </button>
      </div>
    </nav>
  )
}
