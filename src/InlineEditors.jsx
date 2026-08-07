import React, { useState, useEffect, useRef } from 'react';

function TopLeftResizer({ targetRef }) {
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
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      contentEditable={false}
      onMouseDown={handleMouseDown}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '10px',
        height: '10px',
        background: '#3b82f6',
        cursor: 'nwse-resize',
        zIndex: 10,
        transform: 'translate(-50%, -50%)',
        borderRadius: '50%'
      }}
    />
  );
}

export function EditableText({ tag: Tag = 'span', value, onChange, isEditMode, className, style, placeholder, ...props }) {
  const elemRef = useRef(null);
  
  useEffect(() => {
    if (elemRef.current && document.activeElement !== elemRef.current) {
      elemRef.current.textContent = value;
    }
  }, [value]);

  const handleBlur = (e) => {
    const newVal = e.currentTarget.textContent;
    if (newVal !== value) {
      onChange(newVal);
    }
  };

  const handleKeyDown = (e) => {
    // Prevent line breaks for inline elements like span, h1-h6
    if (e.key === 'Enter' && Tag !== 'p' && Tag !== 'div') {
      e.preventDefault();
      e.target.blur();
    }
  };

  return (
    <Tag
      ref={elemRef}
      className={`${className || ''} ${isEditMode ? 'editable-text' : ''}`}
      style={style}
      contentEditable={isEditMode}
      suppressContentEditableWarning={true}
      onBlur={isEditMode ? handleBlur : undefined}
      onKeyDown={isEditMode ? handleKeyDown : undefined}
      data-placeholder={placeholder}
      {...props}
    >
      {isEditMode && <TopLeftResizer targetRef={elemRef} />}
      {value}
    </Tag>
  );
}

export function EditableImage({ src, alt, className, style, onChange, isEditMode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputVal, setInputVal] = useState(src);
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
    <div ref={wrapperRef} className={`editable-img-wrapper ${isEditMode ? 'editable-hover' : ''}`} style={{ position: 'relative', display: 'inline-block', ...style }}>
      {isEditMode && <TopLeftResizer targetRef={wrapperRef} />}
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

  useEffect(() => {
    setInputText(text || '');
    setInputHref(href || '');
  }, [text, href]);

  const handleClick = (e) => {
    if (isEditMode) {
      e.preventDefault();
      e.stopPropagation();
      setIsOpen(!isOpen);
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
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <Component 
        href={!isEditMode ? href : undefined} 
        className={`${className || ''} ${isEditMode ? 'editable-hover' : ''}`} 
        style={style} 
        {...props}
        onClick={handleClick}
      >
        {text || children}
      </Component>
      
      {isOpen && isEditMode && (
        <div className="editable-popover glass" style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: '8px', zIndex: 100, minWidth: '220px', padding: '12px' }}>
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
      )}
    </div>
  );
}
