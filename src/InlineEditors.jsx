import React, { useState, useEffect, useRef } from 'react';

import { createPortal } from 'react-dom';

function TopLeftResizer({ targetRef, onResize }) {
  const [rect, setRect] = useState(null);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const updateRect = () => {
      setRect(target.getBoundingClientRect());
    };

    updateRect();
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, true);
    
    const ro = new ResizeObserver(updateRect);
    ro.observe(target);

    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect, true);
      ro.disconnect();
    };
  }, [targetRef]);

  const handleMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const target = targetRef.current;
    if (!target) return;
    
    const startWidth = target.offsetWidth;
    const startHeight = target.offsetHeight;

    const handleMouseMove = (moveEvent) => {
      const dx = startX - moveEvent.clientX;
      const dy = startY - moveEvent.clientY;
      target.style.width = `${startWidth + dx}px`;
      target.style.height = `${startHeight + dy}px`;
      if (onResize) {
        onResize({
          width: Math.round(target.getBoundingClientRect().width),
          height: Math.round(target.getBoundingClientRect().height)
        });
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  if (!rect) return null;

  return createPortal(
    <div
      contentEditable={false}
      onMouseDown={handleMouseDown}
      style={{
        position: 'fixed',
        top: rect.top,
        left: rect.left,
        width: '10px',
        height: '10px',
        background: '#3b82f6',
        cursor: 'nwse-resize',
        zIndex: 99999,
        transform: 'translate(-50%, -50%)',
        borderRadius: '50%'
      }}
    />,
    document.body
  );
}

export function EditableText({ tag: Tag = 'span', value, onChange, isEditMode, className, style, placeholder, ...props }) {
  const elemRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [textAlign, setTextAlign] = useState(style?.textAlign || 'left');
  const [toolbarPosition, setToolbarPosition] = useState(null);

  const updateToolbarPosition = () => {
    const rect = elemRef.current?.getBoundingClientRect();
    if (rect) setToolbarPosition({ top: Math.max(8, rect.top - 8), left: rect.left + rect.width / 2 });
  };

  useEffect(() => {
    if (elemRef.current && document.activeElement !== elemRef.current) elemRef.current.textContent = value || '';
  }, [value]);

  useEffect(() => {
    if (!isFocused) return;
    updateToolbarPosition();
    window.addEventListener('resize', updateToolbarPosition);
    window.addEventListener('scroll', updateToolbarPosition, true);
    return () => {
      window.removeEventListener('resize', updateToolbarPosition);
      window.removeEventListener('scroll', updateToolbarPosition, true);
    };
  }, [isFocused]);

  useEffect(() => {
    if (!isEditMode) return;
    const clearSelectionOnEmptyClick = (event) => {
      if (!elemRef.current?.contains(event.target) && !event.target.closest?.('[data-editor-control="true"]')) {
        elemRef.current?.blur();
        setIsFocused(false);
      }
    };
    document.addEventListener('pointerdown', clearSelectionOnEmptyClick, true);
    return () => document.removeEventListener('pointerdown', clearSelectionOnEmptyClick, true);
  }, [isEditMode]);

  const handleBlur = (e) => {
    setIsFocused(false);
    const newVal = e.currentTarget.innerText;
    if (newVal !== value) onChange(newVal);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      document.execCommand('insertLineBreak');
    }
  };

  const handleAlignment = (alignment) => {
    setTextAlign(alignment);
    if (elemRef.current) elemRef.current.style.textAlign = alignment;
  };

  return (
    <>
      {isEditMode && isHovered && <TopLeftResizer targetRef={elemRef} />}
      {isEditMode && isFocused && toolbarPosition && createPortal(
        <div className="text-alignment-toolbar" data-editor-control="true" style={{ position: 'fixed', top: toolbarPosition.top, left: toolbarPosition.left, transform: 'translate(-50%, -100%)', zIndex: 100000 }} role="toolbar" aria-label="Text alignment">
          {[
            ['left', '≡', 'Align left'],
            ['center', '≡', 'Align center'],
            ['right', '≡', 'Align right']
          ].map(([alignment, icon, label]) => (
            <button key={alignment} type="button" className={textAlign === alignment ? 'active' : ''} aria-label={label} aria-pressed={textAlign === alignment} title={label} onMouseDown={(event) => event.preventDefault()} onClick={() => handleAlignment(alignment)} style={{ textAlign: alignment }}>
              {icon}
            </button>
          ))}
        </div>,
        document.body
      )}
      <Tag
        ref={elemRef}
        className={(className || '') + (isEditMode ? ' editable-text' : '')}
        style={{ ...style, textAlign, whiteSpace: 'pre-wrap' }}
        contentEditable={isEditMode}
        suppressContentEditableWarning={true}
        onBlur={isEditMode ? handleBlur : undefined}
        onFocus={isEditMode ? () => { setIsFocused(true); updateToolbarPosition(); } : undefined}
        onKeyDown={isEditMode ? handleKeyDown : undefined}
        onMouseEnter={() => isEditMode && setIsHovered(true)}
        onMouseLeave={() => isEditMode && setIsHovered(false)}
        data-placeholder={placeholder}
        {...props}
      />
    </>
  );
}

export function EditableImage({ src, alt, className, style, onChange, onResize, isEditMode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputVal, setInputVal] = useState(src);
  const [isHovered, setIsHovered] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    setInputVal(src);
  }, [src]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File is too large! Please select an image under 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setInputVal(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div 
      ref={wrapperRef} 
      data-editor-control="true"
      className={`editable-img-wrapper ${isEditMode ? 'editable-hover' : ''}`} 
      style={{ position: 'relative', display: 'inline-block', ...style }}
      onMouseEnter={() => isEditMode && setIsHovered(true)}
      onMouseLeave={() => isEditMode && setIsHovered(false)}
    >
      {isEditMode && isHovered && <TopLeftResizer targetRef={wrapperRef} onResize={onResize} />}
      <img 
        src={src} 
        alt={alt} 
        className={className} 
        onClick={() => isEditMode && setIsOpen(!isOpen)} 
        style={{ cursor: isEditMode ? 'pointer' : 'default', width: '100%', height: '100%', display: 'block' }} 
      />
      
      {isOpen && isEditMode && (
        <div className="editable-popover glass" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 100, minWidth: '240px', padding: '12px' }}>
          <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 'bold' }}>Edit Image URL or Upload</p>
          <input type="text" value={inputVal} onChange={(e) => setInputVal(e.target.value)} placeholder="Image URL" className="form-input" style={{ marginBottom: '8px', fontSize: '12px', padding: '8px' }} />
          <input type="file" accept="image/*" onChange={handleFileUpload} style={{ marginBottom: '8px', fontSize: '11px', width: '100%' }} />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="pill primary" style={{ flex: 1, padding: '6px', minHeight: 'auto', fontSize: '13px' }} onClick={() => { onChange(inputVal); setIsOpen(false) }}>Save</button>
            <button className="pill glass" style={{ flex: 1, padding: '6px', minHeight: 'auto', fontSize: '13px' }} onClick={() => setIsOpen(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export function EditableButton({ as: Component = 'button', text, href, onChange, isEditMode, className, style, children, ...props }) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState(text || '');
  const [inputHref, setInputHref] = useState(href || '');
  const [isHovered, setIsHovered] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    setInputText(text || '');
    setInputHref(href || '');
  }, [text, href]);

  const updatePopoverPosition = () => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      setPopoverPosition({ top: rect.bottom + 8, left: rect.left + rect.width / 2 });
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    updatePopoverPosition();
    window.addEventListener('resize', updatePopoverPosition);
    window.addEventListener('scroll', updatePopoverPosition, true);
    return () => {
      window.removeEventListener('resize', updatePopoverPosition);
      window.removeEventListener('scroll', updatePopoverPosition, true);
    };
  }, [isOpen]);

  const handleClick = (e) => {
    if (isEditMode) {
      e.preventDefault();
      e.stopPropagation();
      setIsOpen((open) => {
        if (!open) updatePopoverPosition();
        return !open;
      });
    } else if (props.onClick) {
      props.onClick(e);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File is too large! Please select a file under 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setInputHref(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const isLink = Component === 'a' || typeof href === 'string';

  return (
    <div 
      ref={buttonRef}
      data-editor-control="true"
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => isEditMode && setIsHovered(true)}
      onMouseLeave={() => isEditMode && setIsHovered(false)}
    >
      {isEditMode && isHovered && <TopLeftResizer targetRef={buttonRef} />}
      <Component 
        href={!isEditMode ? href : undefined} 
        className={`${className || ''} ${isEditMode ? 'editable-hover' : ''}`} 
        style={style} 
        {...props}
        onClick={handleClick}
      >
        {text || children}
      </Component>
      
      {isOpen && isEditMode && popoverPosition && createPortal(
        <div data-editor-control="true" className="editable-popover glass" style={{ position: 'fixed', top: popoverPosition.top, left: popoverPosition.left, transform: 'translateX(-50%)', zIndex: 100000, minWidth: '220px', padding: '12px' }}>
          <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 'bold' }}>Edit Action</p>
          <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Label Text" className="form-input" style={{ marginBottom: '6px', fontSize: '12px', padding: '8px' }} />
          {isLink && (
            <>
              <input type="text" value={inputHref} onChange={(e) => setInputHref(e.target.value)} placeholder="Link URL" className="form-input" style={{ marginBottom: '8px', fontSize: '12px', padding: '8px' }} />
              <div style={{ marginBottom: '8px', fontSize: '11px', color: '#64748b' }}>
                Or upload a file (e.g. PDF resume):
                <input type="file" onChange={handleFileUpload} style={{ width: '100%', marginTop: '4px', fontSize: '11px' }} />
              </div>
            </>
          )}
          <div style={{ display: 'flex', gap: '8px', marginTop: isLink ? '0' : '8px' }}>
            <button className="pill primary" style={{ flex: 1, padding: '6px', minHeight: 'auto', fontSize: '13px' }} onClick={() => { onChange({ text: inputText, href: inputHref }); setIsOpen(false) }}>Save</button>
            <button className="pill glass" style={{ flex: 1, padding: '6px', minHeight: 'auto', fontSize: '13px' }} onClick={() => setIsOpen(false)}>Cancel</button>
          </div>
        </div>
      , document.body)}
    </div>
  );
}
