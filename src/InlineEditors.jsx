import React, { createContext, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const EditorLayoutContext = createContext(null)
const SNAP_GRID = 8
const SNAP_DISTANCE = 10
const EMPTY_LAYOUT = Object.freeze({})

export function EditorLayoutProvider({ layouts = {}, onLayoutChange, children }) {
  return (
    <EditorLayoutContext.Provider value={{ layouts, onLayoutChange }}>
      {children}
    </EditorLayoutContext.Provider>
  )
}

function usePersistentLayout(editorKey) {
  const editor = useContext(EditorLayoutContext)
  const layout = editorKey ? editor?.layouts?.[editorKey] || EMPTY_LAYOUT : EMPTY_LAYOUT

  const commit = (patch) => {
    if (!editorKey || !editor?.onLayoutChange) return
    const nextLayout = { ...layout, ...patch }
    if (!nextLayout.x) delete nextLayout.x
    if (!nextLayout.y) delete nextLayout.y
    if (nextLayout.width == null) delete nextLayout.width
    if (nextLayout.height == null) delete nextLayout.height
    if (!nextLayout.hidden) delete nextLayout.hidden
    if (!nextLayout.textAlign) delete nextLayout.textAlign
    editor.onLayoutChange(editorKey, nextLayout)
  }

  return { layout, commit, enabled: Boolean(editorKey && editor) }
}

function useControlPosition(targetRef, active, layoutVersion = '') {
  const [rect, setRect] = useState(null)

  useEffect(() => {
    if (!active) {
      setRect(null)
      return undefined
    }

    const target = targetRef.current
    if (!target) return undefined
    const update = () => setRect(target.getBoundingClientRect())
    update()
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    const observer = new ResizeObserver(update)
    observer.observe(target)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
      observer.disconnect()
    }
  }, [active, targetRef, layoutVersion])

  return rect
}

function useOutsideDismiss(targetRef, active, onDismiss) {
  const onDismissRef = useRef(onDismiss)
  useEffect(() => { onDismissRef.current = onDismiss }, [onDismiss])

  useEffect(() => {
    if (!active) return undefined
    const dismiss = (event) => {
      if (
        !targetRef.current?.contains(event.target) &&
        !event.target.closest?.('[data-editor-control="true"]')
      ) {
        targetRef.current?.blur?.()
        onDismissRef.current()
      }
    }
    document.addEventListener('pointerdown', dismiss, true)
    return () => document.removeEventListener('pointerdown', dismiss, true)
  }, [active, targetRef])
}

function applyLayoutStyle(baseStyle, layout, includeAlignment = false) {
  return {
    ...baseStyle,
    ...(layout.width != null ? { width: `${layout.width}px` } : {}),
    ...(layout.height != null ? { height: `${layout.height}px` } : {}),
    ...(layout.x || layout.y ? { transform: `translate3d(${layout.x || 0}px, ${layout.y || 0}px, 0)` } : {}),
    ...(includeAlignment && layout.textAlign ? { textAlign: layout.textAlign } : {})
  }
}

function getPopoverPosition(target, estimatedHeight = 250) {
  const rect = target?.getBoundingClientRect()
  if (!rect) return null
  const width = Math.min(280, window.innerWidth - 16)
  const halfWidth = width / 2
  const left = Math.min(window.innerWidth - halfWidth - 8, Math.max(halfWidth + 8, rect.left + rect.width / 2))
  const availableBottom = window.innerHeight - rect.bottom - 104
  const above = availableBottom < estimatedHeight && rect.top > estimatedHeight + 16
  return { top: above ? rect.top - 8 : rect.bottom + 8, left, above }
}

function layoutVersion(layout) {
  return `${layout.x || 0}:${layout.y || 0}:${layout.width || 0}:${layout.height || 0}:${layout.textAlign || ''}`
}

function guideLinesForRect(rect) {
  return {
    x: [rect.left, rect.left + rect.width / 2, rect.right],
    y: [rect.top, rect.top + rect.height / 2, rect.bottom]
  }
}

function getMagneticGuides(target, parentRect) {
  const scope = target.closest('[data-editor-scope]') || target.parentElement
  const guides = guideLinesForRect(parentRect)
  if (!scope) return guides

  scope.querySelectorAll('[data-editor-key]').forEach((candidate) => {
    if (candidate === target || candidate.contains(target) || target.contains(candidate)) return
    const rect = candidate.getBoundingClientRect()
    if (!rect.width || !rect.height) return
    const candidateGuides = guideLinesForRect(rect)
    guides.x.push(...candidateGuides.x)
    guides.y.push(...candidateGuides.y)
  })
  return guides
}

function nearestSnap(candidateLines, guideLines) {
  let best = null
  candidateLines.forEach((candidate) => {
    guideLines.forEach((guide) => {
      const delta = guide - candidate
      if (Math.abs(delta) <= SNAP_DISTANCE && (!best || Math.abs(delta) < Math.abs(best.delta))) {
        best = { delta, guide }
      }
    })
  })
  return best
}

function snapPosition(candidateX, candidateY, dragGeometry) {
  let x = Math.round(candidateX / SNAP_GRID) * SNAP_GRID
  let y = Math.round(candidateY / SNAP_GRID) * SNAP_GRID
  const guides = { vertical: null, horizontal: null }
  const { startRect, parentRect, startX, startY, magneticGuides } = dragGeometry
  let nextLeft = startRect.left + x - startX
  let nextTop = startRect.top + y - startY
  const xSnap = nearestSnap(
    [nextLeft, nextLeft + startRect.width / 2, nextLeft + startRect.width],
    magneticGuides.x
  )
  const ySnap = nearestSnap(
    [nextTop, nextTop + startRect.height / 2, nextTop + startRect.height],
    magneticGuides.y
  )

  if (xSnap) {
    x += xSnap.delta
    nextLeft += xSnap.delta
    guides.vertical = xSnap.guide
  }
  if (ySnap) {
    y += ySnap.delta
    nextTop += ySnap.delta
    guides.horizontal = ySnap.guide
  }

  if (startRect.width <= parentRect.width) {
    const clampedLeft = Math.min(Math.max(nextLeft, parentRect.left), parentRect.right - startRect.width)
    x += clampedLeft - nextLeft
  }
  if (startRect.height <= parentRect.height) {
    const clampedTop = Math.min(Math.max(nextTop, parentRect.top), parentRect.bottom - startRect.height)
    y += clampedTop - nextTop
  }

  return { x: Math.round(x), y: Math.round(y), guides }
}

function MagneticGuides({ guides }) {
  if (guides?.vertical == null && guides?.horizontal == null) return null
  return createPortal(
    <>
      {guides.vertical != null && <div className="magnetic-guide vertical" style={{ left: guides.vertical }} />}
      {guides.horizontal != null && <div className="magnetic-guide horizontal" style={{ top: guides.horizontal }} />}
    </>,
    document.body
  )
}

function ElementControls({ targetRef, layout, commit, selected, onRemove, alignment }) {
  const rect = useControlPosition(targetRef, selected, layoutVersion(layout))
  const [guides, setGuides] = useState(null)
  const interactionCleanupRef = useRef(null)
  useEffect(() => () => interactionCleanupRef.current?.(), [])

  const startMove = (event) => {
    if (event.button !== 0 || event.isPrimary === false) return
    event.preventDefault()
    event.stopPropagation()
    interactionCleanupRef.current?.()
    const target = targetRef.current
    if (!target) return
    const pointerX = event.clientX
    const pointerY = event.clientY
    const startX = layout.x || 0
    const startY = layout.y || 0
    const startInlineTransform = target.style.transform
    const startRect = target.getBoundingClientRect()
    const parentRect = target.parentElement?.getBoundingClientRect() || startRect
    const dragGeometry = {
      startX,
      startY,
      startRect,
      parentRect,
      magneticGuides: getMagneticGuides(target, parentRect)
    }
    let finalX = startX
    let finalY = startY
    document.body.classList.add('editor-dragging')

    const move = (moveEvent) => {
      const candidateX = startX + moveEvent.clientX - pointerX
      const candidateY = startY + moveEvent.clientY - pointerY
      const snapped = snapPosition(candidateX, candidateY, dragGeometry)
      finalX = snapped.x
      finalY = snapped.y
      setGuides(snapped.guides)
      target.style.transform = `translate3d(${finalX}px, ${finalY}px, 0)`
    }
    const cleanup = (updateState = true) => {
      document.removeEventListener('pointermove', move)
      document.removeEventListener('pointerup', finish)
      document.removeEventListener('pointercancel', cancel)
      document.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('blur', cancel)
      document.body.classList.remove('editor-dragging')
      if (updateState) setGuides(null)
      interactionCleanupRef.current = null
    }
    const finish = () => {
      cleanup()
      if (finalX !== startX || finalY !== startY) commit({ x: finalX, y: finalY })
      else target.style.transform = startInlineTransform
    }
    const cancel = () => {
      cleanup()
      target.style.transform = startInlineTransform
    }
    const handleKeyDown = (keyEvent) => {
      if (keyEvent.key === 'Escape') cancel()
    }
    interactionCleanupRef.current = () => {
      cleanup(false)
      target.style.transform = startInlineTransform
    }
    event.currentTarget.setPointerCapture?.(event.pointerId)
    document.addEventListener('pointermove', move)
    document.addEventListener('pointerup', finish)
    document.addEventListener('pointercancel', cancel)
    document.addEventListener('keydown', handleKeyDown)
    window.addEventListener('blur', cancel)
  }

  if (!rect) return null
  const placeBelow = rect.top < 58
  const toolbarHalfWidth = alignment ? 114 : 58
  const toolbarLeft = Math.min(
    window.innerWidth - toolbarHalfWidth - 8,
    Math.max(toolbarHalfWidth + 8, rect.left + rect.width / 2)
  )
  return createPortal(
    <>
      <div
        className={`element-editor-toolbar ${placeBelow ? 'below' : ''}`}
        data-editor-control="true"
        role="toolbar"
        aria-label="Element controls"
        style={{ top: placeBelow ? rect.bottom + 8 : rect.top - 8, left: toolbarLeft }}
      >
        <button type="button" className="move-handle" onPointerDown={startMove} title="Move with magnetic snapping" aria-label="Move element">✥</button>
        {alignment && ['left', 'center', 'right'].map((value) => (
          <button
            type="button"
            key={value}
            className={(layout.textAlign || alignment) === value ? 'active' : ''}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => { if ((layout.textAlign || alignment) !== value) commit({ textAlign: value }) }}
            aria-label={`Align ${value}`}
            title={`Align ${value}`}
          >
            <span className={`align-icon ${value}`}>☰</span>
          </button>
        ))}
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => commit({ x: 0, y: 0, width: null, height: null })} title="Reset position and size" aria-label="Reset element layout">↺</button>
        <button type="button" className="remove-element" onMouseDown={(e) => e.preventDefault()} onClick={onRemove} title="Remove element" aria-label="Remove element">×</button>
      </div>
      <MagneticGuides guides={guides} />
    </>,
    document.body
  )
}

function PersistentResizer({ targetRef, layout, commit, selected, onResize }) {
  const rect = useControlPosition(targetRef, selected, layoutVersion(layout))
  const interactionCleanupRef = useRef(null)
  useEffect(() => () => interactionCleanupRef.current?.(), [])

  const startResize = (event) => {
    if (event.button !== 0 || event.isPrimary === false) return
    event.preventDefault()
    event.stopPropagation()
    interactionCleanupRef.current?.()
    const target = targetRef.current
    if (!target) return
    const pointerX = event.clientX
    const pointerY = event.clientY
    const startWidth = target.getBoundingClientRect().width
    const startHeight = target.getBoundingClientRect().height
    const startInlineWidth = target.style.width
    const startInlineHeight = target.style.height
    const startInlineTransform = target.style.transform
    const startX = layout.x || 0
    const startY = layout.y || 0
    let final = { width: Math.round(startWidth), height: Math.round(startHeight), x: startX, y: startY }
    document.body.classList.add('editor-dragging')

    const move = (moveEvent) => {
      const width = Math.max(24, Math.round((startWidth + pointerX - moveEvent.clientX) / SNAP_GRID) * SNAP_GRID)
      const height = Math.max(20, Math.round((startHeight + pointerY - moveEvent.clientY) / SNAP_GRID) * SNAP_GRID)
      const x = Math.round(startX - (width - startWidth))
      const y = Math.round(startY - (height - startHeight))
      final = { width, height, x, y }
      target.style.width = `${width}px`
      target.style.height = `${height}px`
      target.style.transform = `translate3d(${x}px, ${y}px, 0)`
    }
    const cleanup = () => {
      document.removeEventListener('pointermove', move)
      document.removeEventListener('pointerup', finish)
      document.removeEventListener('pointercancel', cancel)
      document.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('blur', cancel)
      document.body.classList.remove('editor-dragging')
      interactionCleanupRef.current = null
    }
    const finish = () => {
      cleanup()
      const changed = final.width !== Math.round(startWidth) || final.height !== Math.round(startHeight) || final.x !== startX || final.y !== startY
      if (!changed) {
        target.style.width = startInlineWidth
        target.style.height = startInlineHeight
        target.style.transform = startInlineTransform
        return
      }
      commit(final)
      onResize?.({ width: final.width, height: final.height })
    }
    const cancel = () => {
      cleanup()
      target.style.width = startInlineWidth
      target.style.height = startInlineHeight
      target.style.transform = startInlineTransform
    }
    const handleKeyDown = (keyEvent) => {
      if (keyEvent.key === 'Escape') cancel()
    }
    interactionCleanupRef.current = () => {
      cleanup()
      target.style.width = startInlineWidth
      target.style.height = startInlineHeight
      target.style.transform = startInlineTransform
    }
    event.currentTarget.setPointerCapture?.(event.pointerId)
    document.addEventListener('pointermove', move)
    document.addEventListener('pointerup', finish)
    document.addEventListener('pointercancel', cancel)
    document.addEventListener('keydown', handleKeyDown)
    window.addEventListener('blur', cancel)
  }

  if (!rect) return null
  return createPortal(
    <button
      type="button"
      className="persistent-resize-handle"
      data-editor-control="true"
      aria-label="Resize element"
      title="Resize (snaps to 8px grid)"
      onPointerDown={startResize}
      style={{ top: rect.top, left: rect.left }}
    />,
    document.body
  )
}

function HiddenElement({ isEditMode, label, onRestore, tag: Tag = 'span' }) {
  if (!isEditMode) return null
  const restore = (event) => {
    event.preventDefault()
    event.stopPropagation()
    onRestore()
  }
  return (
    <Tag
      className="hidden-element-placeholder"
      data-editor-control="true"
      role="button"
      tabIndex="0"
      onClick={restore}
      onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') restore(event) }}
    >
      Hidden: {label} · Restore
    </Tag>
  )
}

export function EditableText({ tag: Tag = 'span', value, onChange, isEditMode, editorKey, className, style, placeholder, ...props }) {
  const elemRef = useRef(null)
  const baseDisplayRef = useRef(null)
  const [selected, setSelected] = useState(false)
  const [needsInlineLayout, setNeedsInlineLayout] = useState(false)
  const [baseTextAlign, setBaseTextAlign] = useState('left')
  const { layout, commit } = usePersistentLayout(editorKey)
  useOutsideDismiss(elemRef, isEditMode && selected, () => setSelected(false))

  useLayoutEffect(() => {
    if (!elemRef.current || baseDisplayRef.current != null) return
    const computedStyle = window.getComputedStyle(elemRef.current)
    baseDisplayRef.current = computedStyle.display
    setNeedsInlineLayout(baseDisplayRef.current === 'inline')
    setBaseTextAlign(computedStyle.textAlign || 'left')
  }, [layout.hidden])

  useEffect(() => {
    if (elemRef.current && document.activeElement !== elemRef.current) elemRef.current.textContent = value || ''
  }, [value, layout.hidden])

  const handleBlur = (event) => {
    const newValue = event.currentTarget.innerText
    if (newValue !== value) onChange(newValue)
  }
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      document.execCommand('insertLineBreak')
    }
  }
  const handleClick = (event) => {
    if (!isEditMode) return
    event.preventDefault()
    event.stopPropagation()
    setSelected(true)
  }
  const hasLayout = layout.x || layout.y || layout.width != null || layout.height != null || layout.textAlign
  const supportsAlignment = !/(^|[-_])(icon|avatar)([-_]|$)|tag-pill/.test(className || '')
  const handleRemove = () => {
    elemRef.current?.blur()
    commit({ hidden: true })
  }

  if (layout.hidden) return <HiddenElement isEditMode={isEditMode} label={value || editorKey} onRestore={() => commit({ hidden: false })} tag={Tag} />
  return (
    <>
      {isEditMode && selected && (
        <>
          <ElementControls targetRef={elemRef} layout={layout} commit={commit} selected={selected} alignment={supportsAlignment ? baseTextAlign : null} onRemove={handleRemove} />
          <PersistentResizer targetRef={elemRef} layout={layout} commit={commit} selected={selected} />
        </>
      )}
      <Tag
        ref={elemRef}
        className={`${className || ''} editable-layout-text${isEditMode ? ' editable-text' : ''}`}
        style={{ ...applyLayoutStyle(style, layout, true), ...(needsInlineLayout && (isEditMode || hasLayout) ? { display: 'inline-block' } : {}), whiteSpace: 'pre-wrap' }}
        contentEditable={isEditMode}
        suppressContentEditableWarning
        onBlur={isEditMode ? handleBlur : undefined}
        onFocus={isEditMode ? () => setSelected(true) : undefined}
        onClick={isEditMode ? handleClick : undefined}
        onKeyDown={isEditMode ? handleKeyDown : undefined}
        data-placeholder={placeholder}
        data-editor-key={editorKey}
        data-edit-mode={isEditMode ? 'true' : 'false'}
        {...props}
      />
    </>
  )
}

export function EditableImage({ src, alt, className, style, onChange, onResize, isEditMode, editorKey }) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState(src)
  const [selected, setSelected] = useState(false)
  const [popoverPosition, setPopoverPosition] = useState(null)
  const wrapperRef = useRef(null)
  const { layout, commit, enabled } = usePersistentLayout(editorKey)
  useOutsideDismiss(wrapperRef, isEditMode && selected, () => { setSelected(false); setIsOpen(false) })

  useEffect(() => setInputValue(src), [src])
  const updatePopoverPosition = () => {
    const position = getPopoverPosition(wrapperRef.current, 230)
    if (position) setPopoverPosition(position)
  }
  useEffect(() => {
    if (!isOpen) return undefined
    updatePopoverPosition()
    window.addEventListener('resize', updatePopoverPosition)
    window.addEventListener('scroll', updatePopoverPosition, true)
    return () => {
      window.removeEventListener('resize', updatePopoverPosition)
      window.removeEventListener('scroll', updatePopoverPosition, true)
    }
  }, [isOpen])
  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) return alert('File is too large! Please select an image under 2MB.')
    const reader = new FileReader()
    reader.onloadend = () => setInputValue(reader.result)
    reader.readAsDataURL(file)
  }

  if (layout.hidden) return <HiddenElement isEditMode={isEditMode} label={alt || editorKey} onRestore={() => commit({ hidden: false })} />
  return (
    <div
      ref={wrapperRef}
      data-editor-key={editorKey}
      data-edit-mode={isEditMode ? 'true' : 'false'}
      className={`editable-img-wrapper ${isEditMode ? 'editable-hover' : ''}`}
      style={{ position: 'relative', display: 'inline-block', ...applyLayoutStyle(style, layout) }}
    >
      {isEditMode && selected && (
        <>
          <ElementControls targetRef={wrapperRef} layout={layout} commit={commit} selected={selected} onRemove={() => commit({ hidden: true })} />
          <PersistentResizer targetRef={wrapperRef} layout={layout} commit={commit} selected={selected} onResize={enabled ? undefined : onResize} />
        </>
      )}
      <img
        src={src}
        alt={alt}
        className={className}
        onClick={(event) => { if (isEditMode) { event.preventDefault(); event.stopPropagation(); setSelected(true); setIsOpen((open) => { if (!open) updatePopoverPosition(); return !open }) } }}
        style={{ cursor: isEditMode ? 'pointer' : 'default', width: '100%', height: '100%', display: 'block' }}
      />
      {isOpen && isEditMode && popoverPosition && createPortal(
        <div className={`editable-popover glass portal-popover ${popoverPosition.above ? 'above' : ''}`} data-editor-control="true" style={{ top: popoverPosition.top, left: popoverPosition.left }}>
          <p>Edit Image URL or Upload</p>
          <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Image URL" className="form-input" />
          <input type="file" accept="image/*" onChange={handleFileUpload} />
          <div className="editable-popover-actions">
            <button className="pill primary" onClick={() => { onChange(inputValue); setIsOpen(false) }}>Save</button>
            <button className="pill glass" onClick={() => setIsOpen(false)}>Cancel</button>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

export function EditableButton({ as: Component = 'button', text, href, onChange, isEditMode, editorKey, className, style, children, ...props }) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputText, setInputText] = useState(text || '')
  const [inputHref, setInputHref] = useState(href || '')
  const [selected, setSelected] = useState(false)
  const [popoverPosition, setPopoverPosition] = useState(null)
  const buttonRef = useRef(null)
  const { layout, commit } = usePersistentLayout(editorKey)
  useOutsideDismiss(buttonRef, isEditMode && selected, () => { setSelected(false); setIsOpen(false) })

  useEffect(() => { setInputText(text || ''); setInputHref(href || '') }, [text, href])
  const updatePopoverPosition = () => {
    const position = getPopoverPosition(buttonRef.current, isLink ? 275 : 175)
    if (position) setPopoverPosition(position)
  }
  useEffect(() => {
    if (!isOpen) return undefined
    updatePopoverPosition()
    window.addEventListener('resize', updatePopoverPosition)
    window.addEventListener('scroll', updatePopoverPosition, true)
    return () => {
      window.removeEventListener('resize', updatePopoverPosition)
      window.removeEventListener('scroll', updatePopoverPosition, true)
    }
  }, [isOpen])

  const handleClick = (event) => {
    if (isEditMode) {
      event.preventDefault()
      event.stopPropagation()
      setSelected(true)
      setIsOpen((open) => { if (!open) updatePopoverPosition(); return !open })
    } else props.onClick?.(event)
  }
  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) return alert('File is too large! Please select a file under 2MB.')
    const reader = new FileReader()
    reader.onloadend = () => setInputHref(reader.result)
    reader.readAsDataURL(file)
  }
  const isLink = Component === 'a' || typeof href === 'string'

  if (layout.hidden) return <HiddenElement isEditMode={isEditMode} label={text || editorKey} onRestore={() => commit({ hidden: false })} />
  return (
    <div ref={buttonRef} data-editor-key={editorKey} data-edit-mode={isEditMode ? 'true' : 'false'} className="editable-button-wrapper" style={applyLayoutStyle({ position: 'relative', display: 'inline-block' }, layout)}>
      {isEditMode && selected && (
        <>
          <ElementControls targetRef={buttonRef} layout={layout} commit={commit} selected={selected} onRemove={() => commit({ hidden: true })} />
          <PersistentResizer targetRef={buttonRef} layout={layout} commit={commit} selected={selected} />
        </>
      )}
      <Component href={!isEditMode ? href : undefined} className={`${className || ''} ${isEditMode ? 'editable-hover' : ''}`} style={{ ...style, ...(layout.width || layout.height ? { width: '100%', height: '100%' } : {}) }} {...props} onClick={handleClick}>
        {text || children}
      </Component>
      {isOpen && isEditMode && popoverPosition && createPortal(
        <div data-editor-control="true" className={`editable-popover glass portal-popover ${popoverPosition.above ? 'above' : ''}`} style={{ top: popoverPosition.top, left: popoverPosition.left }}>
          <p>Edit Action</p>
          <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Label Text" className="form-input" />
          {isLink && (
            <>
              <input type="text" value={inputHref} onChange={(e) => setInputHref(e.target.value)} placeholder="Link URL" className="form-input" />
              <label className="editable-file-label">Or upload a file (for example a PDF):<input type="file" onChange={handleFileUpload} /></label>
            </>
          )}
          <div className="editable-popover-actions">
            <button className="pill primary" onClick={() => { onChange?.({ text: inputText, href: inputHref }); setIsOpen(false) }}>Save</button>
            <button className="pill glass" onClick={() => setIsOpen(false)}>Cancel</button>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
