import { useState, useEffect, useRef } from 'react'
import './index.css'
import './inline-editing.css'
import defaultPortfolioData from './config/portfolioData.json'
import { EditableText, EditableImage, EditableButton, EditorLayoutProvider } from './InlineEditors'

function mergePortfolioDraft(defaultValue, savedValue) {
  if (savedValue == null) return defaultValue
  if (Array.isArray(defaultValue)) {
    if (!Array.isArray(savedValue)) return defaultValue
    return savedValue.map((item, index) => mergePortfolioDraft(defaultValue[index], item))
  }
  if (defaultValue && typeof defaultValue === 'object') {
    const savedObject = savedValue && typeof savedValue === 'object' && !Array.isArray(savedValue) ? savedValue : {}
    const merged = { ...defaultValue }
    Object.keys(savedObject).forEach((key) => {
      merged[key] = mergePortfolioDraft(defaultValue[key], savedObject[key])
    })
    return merged
  }
  return savedValue
}

function sanitizePortfolioData(data) {
  const sanitized = JSON.parse(JSON.stringify(data))
  if (sanitized.personal) delete sanitized.personal.adminPassword
  return sanitized
}

function Dialog({ customData, onClose, data, editMode, updateData, updateDataBatch }) {
  const [copied, setCopied] = useState(false)
  const [formSent, setFormSent] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })

  const handleCopyEmail = () => {
    if (editMode) return
    navigator.clipboard.writeText(data.personal.email)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleFormSubmit = (e) => {
    e.preventDefault()
    if (editMode) return
    const mailtoUrl = `mailto:${data.personal.email}?subject=Contact from Portfolio by ${encodeURIComponent(formData.name)}&body=${encodeURIComponent(formData.message + '\n\nSender Email: ' + formData.email)}`
    window.open(mailtoUrl, '_blank')
    setFormSent(true)
    setTimeout(() => {
      setFormSent(false)
      onClose()
    }, 2500)
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="modal glass"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <EditableText editorKey={customData ? undefined : 'contact_eyebrow'} tag="p" className="eyebrow" value={customData?.eyebrow || data.personal.contactEyebrow} onChange={(val) => !customData && updateData('personal.contactEyebrow', val)} isEditMode={!customData && editMode} />
        <EditableText editorKey={customData ? undefined : 'contact_title'} tag="h2" id="dialog-title" value={customData?.title || data.personal.contactTitle} onChange={(val) => !customData && updateData('personal.contactTitle', val)} isEditMode={!customData && editMode} />
        <EditableText editorKey={customData ? undefined : 'contact_text'} tag="p" value={customData?.text || data.personal.contactText} onChange={(val) => !customData && updateData('personal.contactText', val)} isEditMode={!customData && editMode} />

        <form className="contact-form" onSubmit={handleFormSubmit}>
          <input type="text" className="form-input" placeholder="Your Name" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          <input type="email" className="form-input" placeholder="Your Email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
          <textarea className="form-textarea" rows="3" placeholder="Your Message..." required value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })}></textarea>
          <EditableButton editorKey="contact_send" as="button" type="submit" className="pill primary" style={{ width: '100%', justifyContent: 'center' }} text={formSent ? '✓ Opening Email Client...' : (data.personal.contactSendText || 'Send Message ✉️')} onChange={(val) => updateData('personal.contactSendText', val.text)} isEditMode={editMode} />
        </form>

        <div style={{ marginTop: '16px', background: 'rgba(2, 132, 199, 0.06)', padding: '14px', borderRadius: '16px', border: '1px solid rgba(2, 132, 199, 0.15)' }}>
          <EditableText editorKey="contact_direct_email_label" tag="p" style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: '700', color: '#0284c7', fontFamily: 'DM Mono, monospace' }} value={data.personal.contactDirectEmailLabel || 'DIRECT EMAIL'} onChange={(val) => updateData('personal.contactDirectEmailLabel', val)} isEditMode={editMode} />
          <EditableText editorKey="contact_email" tag="p" style={{ margin: 0, fontWeight: '700', color: '#0a2540', fontSize: '14.5px' }} value={data.personal.email} onChange={(val) => updateData('personal.email', val)} isEditMode={editMode} />
        </div>

        <div className="modal-row" style={{ marginTop: '16px' }}>
          <EditableButton editorKey="contact_copy_email" as="button" className="pill primary" text={copied ? '✓ Copied!' : (data.personal.contactCopyText || 'Copy Email 📋')} onChange={(val) => updateData('personal.contactCopyText', val.text)} onClick={handleCopyEmail} isEditMode={editMode} />
          <EditableButton editorKey="contact_linkedin" as="a" className="pill linkedin" href={data.personal.linkedin} target="_blank" rel="noopener noreferrer" text={data.personal.contactLinkedInText || 'LinkedIn ↗'} onChange={(val) => updateDataBatch([['personal.contactLinkedInText', val.text], ['personal.linkedin', val.href]])} isEditMode={editMode} />
          <EditableButton editorKey="contact_close" as="button" className="pill glass" text={data.personal.contactCloseText || 'Close'} onChange={(val) => updateData('personal.contactCloseText', val.text)} onClick={onClose} isEditMode={editMode} />
        </div>
      </section>
    </div>
  )
}

export default function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [activeDialog, setActiveDialog] = useState(null)
  const [customDialogData, setCustomDialogData] = useState(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [filter, setFilter] = useState('all')

  // LocalStorage state persistence for live editing
  const [portfolioData, setPortfolioData] = useState(() => {
    const isEditorRoute = window.location.pathname.includes('/deesign') || window.location.hash === '#deesign'
    if (!isEditorRoute) return defaultPortfolioData
    const saved = localStorage.getItem('userPortfolioData')
    if (saved) {
      try {
        return sanitizePortfolioData(mergePortfolioDraft(defaultPortfolioData, JSON.parse(saved)))
      } catch {
        return defaultPortfolioData
      }
    }
    return defaultPortfolioData
  })
  // Keep the latest edit available synchronously. A click on Save causes the
  // edited field to blur first; React has not necessarily rendered that blur
  // update by the time the button handler runs.
  const portfolioDataRef = useRef(portfolioData)

  useEffect(() => {
    portfolioDataRef.current = portfolioData
  }, [portfolioData])

  const savedDataRef = useRef(JSON.parse(JSON.stringify(portfolioData)))
  const editHistoryRef = useRef([JSON.parse(JSON.stringify(portfolioData))])
  const historyIndexRef = useRef(0)
  const [historyIndex, setHistoryIndex] = useState(0)
  const [historyLength, setHistoryLength] = useState(1)

  const clonePortfolioData = (data) => JSON.parse(JSON.stringify(data))
  const dataHasUnsavedChanges = (data) => JSON.stringify(data) !== JSON.stringify(savedDataRef.current)

  const resetEditHistory = (data) => {
    const snapshot = clonePortfolioData(data)
    editHistoryRef.current = [snapshot]
    historyIndexRef.current = 0
    setHistoryIndex(0)
    setHistoryLength(1)
  }

  // Admin Login Authentication State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false)
  const [adminInputPassword, setAdminInputPassword] = useState('')
  const [passwordError, setPasswordError] = useState(false)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const adminSessionPasswordRef = useRef('')
  
  // Inline Editing State
  const [editMode, setEditMode] = useState(false)
  const [unsavedChanges, setUnsavedChanges] = useState(false)
  const [saveStatus, setSaveStatus] = useState('')

  // Handle secret admin URL
  useEffect(() => {
    if (window.location.pathname.includes('/deesign') || window.location.hash === '#deesign') {
      setActiveTab('admin')
    }
  }, [])

  const handleAdminLogin = async (e) => {
    e.preventDefault()
    setIsLoggingIn(true)
    setPasswordError(false)
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminInputPassword })
      })
      if (!response.ok) {
        setPasswordError(true)
        return
      }
      adminSessionPasswordRef.current = adminInputPassword
      setAdminInputPassword('')
      setIsAdminLoggedIn(true)
      setEditMode(true)
      resetEditHistory(portfolioDataRef.current)
      setUnsavedChanges(dataHasUnsavedChanges(portfolioDataRef.current))
      setSaveStatus('')
      setActiveTab('home') // Switch immediately to home to start editing
    } catch (error) {
      console.error('Editor login failed:', error)
      setPasswordError(true)
    } finally {
      setIsLoggingIn(false)
    }
  }

  const commitDataChanges = (changes) => {
    const newData = clonePortfolioData(portfolioDataRef.current)
    changes.forEach(({ path, value }) => {
      const keys = path.replace(/\[(\d+)\]/g, '.$1').split('.')
      let current = newData
      for (let i = 0; i < keys.length - 1; i++) {
        if (current[keys[i]] == null) current[keys[i]] = {}
        current = current[keys[i]]
      }
      current[keys[keys.length - 1]] = value
    })

    if (JSON.stringify(newData) === JSON.stringify(portfolioDataRef.current)) return

    const nextHistory = editHistoryRef.current.slice(0, historyIndexRef.current + 1).concat([clonePortfolioData(newData)])
    if (nextHistory.length > 60) nextHistory.shift()
    editHistoryRef.current = nextHistory
    historyIndexRef.current = nextHistory.length - 1
    setHistoryIndex(nextHistory.length - 1)
    setHistoryLength(nextHistory.length)

    portfolioDataRef.current = newData
    setPortfolioData(newData)
    const isDirty = dataHasUnsavedChanges(newData)
    setUnsavedChanges(isDirty)
    setSaveStatus(isDirty ? 'Unsaved changes' : 'All changes saved')
  }

  const updateData = (path, value) => commitDataChanges([{ path, value }])
  const updateDataBatch = (changes) => commitDataChanges(changes.map(([path, value]) => ({ path, value })))

  const handleHistoryChange = (direction) => {
    const nextIndex = historyIndexRef.current + direction
    if (nextIndex < 0 || nextIndex >= editHistoryRef.current.length) return

    const nextData = clonePortfolioData(editHistoryRef.current[nextIndex])
    historyIndexRef.current = nextIndex
    portfolioDataRef.current = nextData
    setHistoryIndex(nextIndex)
    setPortfolioData(nextData)

    const isDirty = dataHasUnsavedChanges(nextData)
    setUnsavedChanges(isDirty)
    setSaveStatus(isDirty ? (direction < 0 ? 'Undid last change' : 'Redid change') : 'All changes saved')
  }

  const handleUndo = () => handleHistoryChange(-1)
  const handleRedo = () => handleHistoryChange(1)

  const updateEditorLayout = (editorKey, layout) => {
    if (Object.keys(layout).length === 0) {
      const nextLayouts = { ...(portfolioDataRef.current.editorLayout || {}) }
      if (!(editorKey in nextLayouts)) return
      delete nextLayouts[editorKey]
      updateData('editorLayout', nextLayouts)
      return
    }
    updateData(`editorLayout.${editorKey}`, layout)
  }

  const [isSaving, setIsSaving] = useState(false)

  const handleSaveData = async () => {
    setIsSaving(true)
    setSaveStatus('Saving…')
    const dataToSave = portfolioDataRef.current
    
    // Fallback save to local storage immediately
    localStorage.setItem('userPortfolioData', JSON.stringify(dataToSave))

    try {
      const response = await fetch('/api/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Editor-Password': adminSessionPasswordRef.current
        },
        body: JSON.stringify(dataToSave)
      });
      
      const result = await response.json();
      if (!response.ok) {
        console.error('Save failed:', result.error);
        setSaveStatus('Could not publish changes. They are saved in this browser.')
        alert(`Failed to push to GitHub: ${result.error}`);
        return false
      } else {
        console.log('Save successful:', result.message);
        savedDataRef.current = clonePortfolioData(dataToSave)
        setUnsavedChanges(false)
        setSaveStatus('Saved. The live site will update after deployment finishes.')
        return true
      }
    } catch (error) {
      console.error('Network error saving data:', error);
      setSaveStatus('Could not publish changes. They are saved in this browser.')
      alert('Network error while pushing to GitHub. Data saved locally.');
      return false
    } finally {
      setIsSaving(false)
    }
  }

  const handleExitEditMode = () => {
    const saved = localStorage.getItem('userPortfolioData')
    let savedData = defaultPortfolioData
    if (saved) {
      try { savedData = sanitizePortfolioData(mergePortfolioDraft(defaultPortfolioData, JSON.parse(saved))) } catch { savedData = defaultPortfolioData }
    }
    portfolioDataRef.current = savedData
    savedDataRef.current = clonePortfolioData(savedData)
    setPortfolioData(savedData)
    resetEditHistory(savedData)
    setEditMode(false)
    setIsAdminLoggedIn(false)
    adminSessionPasswordRef.current = ''
    setUnsavedChanges(false)
    setSaveStatus('')
  }

  const openDialog = (customData = null) => {
    setCustomDialogData(customData)
    setActiveDialog('contact')
    setIsMenuOpen(false)
  }

  const navigateToTab = (tabName) => {
    setActiveTab(tabName)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setIsMenuOpen(false)
  }

  const filteredExperiences = filter === 'all'
    ? portfolioData.experiences
    : portfolioData.experiences.filter(exp => exp.category === filter)
  const experienceCounts = portfolioData.experiences.reduce((counts, experience) => {
    counts[experience.category] = (counts[experience.category] || 0) + 1
    return counts
  }, {})

  const handleEditorPageChange = (event) => {
    const page = event.target.value
    if (page === 'contact') {
      openDialog()
      return
    }
    setActiveDialog(null)
    setCustomDialogData(null)
    navigateToTab(page)
  }

  return (
    <EditorLayoutProvider layouts={portfolioData.editorLayout || {}} onLayoutChange={updateEditorLayout}>
    <div className="shell min-h-screen">
      {/* Translucent Glass Navigation Bar */}
      <nav className="glass navbar">
        <a className="brand" href="#home" onClick={(e) => { e.preventDefault(); navigateToTab('home'); }}>
          <EditableText editorKey="nav_brand_initials" tag="div" className="brand-avatar" value={portfolioData.personal.avatarInitials} onChange={(val) => updateData('personal.avatarInitials', val)} isEditMode={editMode} />
          <EditableText editorKey="nav_brand_name" tag="span" value={portfolioData.personal.shortName} onChange={(val) => updateData('personal.shortName', val)} isEditMode={editMode} />
        </a>

        <div className="nav-links">
          <EditableButton editorKey="nav_desktop_home" as="button" className={`pill ${activeTab === 'home' ? 'primary' : 'glass'}`} text={portfolioData.personal.navHomeText || 'Home'} onChange={(val) => updateData('personal.navHomeText', val.text)} onClick={() => navigateToTab('home')} isEditMode={editMode} />
          <EditableButton editorKey="nav_desktop_experience" as="button" className={`pill ${activeTab === 'experience' ? 'primary' : 'glass'}`} text={portfolioData.personal.navExperienceText || `Experience (${portfolioData.experiences.length})`} onChange={(val) => updateData('personal.navExperienceText', val.text)} onClick={() => navigateToTab('experience')} isEditMode={editMode} />
          <EditableButton editorKey="nav_desktop_projects" as="button" className={`pill ${activeTab === 'projects' ? 'primary' : 'glass'}`} text={portfolioData.personal.navProjectsText || `Projects (${portfolioData.projects.length})`} onChange={(val) => updateData('personal.navProjectsText', val.text)} onClick={() => navigateToTab('projects')} isEditMode={editMode} />
          <EditableButton editorKey="nav_desktop_education" as="button" className={`pill ${activeTab === 'education' ? 'primary' : 'glass'}`} text={portfolioData.personal.navEducationText || `Education (${portfolioData.education.length})`} onChange={(val) => updateData('personal.navEducationText', val.text)} onClick={() => navigateToTab('education')} isEditMode={editMode} />
          <EditableButton editorKey="nav_desktop_skills" as="button" className={`pill ${activeTab === 'skills' ? 'primary' : 'glass'}`} text={portfolioData.personal.navSkillsText || 'Skills & Certs'} onChange={(val) => updateData('personal.navSkillsText', val.text)} onClick={() => navigateToTab('skills')} isEditMode={editMode} />
          <EditableButton editorKey="nav_desktop_cv" as="a" className="pill glass" href={portfolioData.personal.resumeUrl} target="_blank" rel="noopener noreferrer" download text={portfolioData.personal.navCvText || 'CV 📥'} onChange={(val) => updateDataBatch([['personal.navCvText', val.text], ['personal.resumeUrl', val.href]])} isEditMode={editMode} />
          <EditableButton editorKey="nav_desktop_contact" as="button" className="pill primary cta" text={portfolioData.personal.navContactText || 'Contact ↗'} onChange={(val) => updateData('personal.navContactText', val.text)} onClick={() => openDialog()} isEditMode={editMode} />
        </div>

        <button
          className="hamburger-btn"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-expanded={isMenuOpen}
          aria-label="Toggle navigation menu"
        >
          <span className={`hamburger-bar ${isMenuOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-bar ${isMenuOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-bar ${isMenuOpen ? 'open' : ''}`}></span>
        </button>

        <div className={`nav-menu-drawer glass ${isMenuOpen ? 'open' : ''}`}>
          <EditableButton editorKey="nav_mobile_home" as="button" className={`pill ${activeTab === 'home' ? 'primary' : 'glass'}`} text={portfolioData.personal.navHomeText || 'Home'} onChange={(val) => updateData('personal.navHomeText', val.text)} onClick={() => navigateToTab('home')} isEditMode={editMode} />
          <EditableButton editorKey="nav_mobile_experience" as="button" className={`pill ${activeTab === 'experience' ? 'primary' : 'glass'}`} text={portfolioData.personal.navExperienceText || `Experience (${portfolioData.experiences.length})`} onChange={(val) => updateData('personal.navExperienceText', val.text)} onClick={() => navigateToTab('experience')} isEditMode={editMode} />
          <EditableButton editorKey="nav_mobile_projects" as="button" className={`pill ${activeTab === 'projects' ? 'primary' : 'glass'}`} text={portfolioData.personal.navProjectsText || `Projects (${portfolioData.projects.length})`} onChange={(val) => updateData('personal.navProjectsText', val.text)} onClick={() => navigateToTab('projects')} isEditMode={editMode} />
          <EditableButton editorKey="nav_mobile_education" as="button" className={`pill ${activeTab === 'education' ? 'primary' : 'glass'}`} text={portfolioData.personal.navEducationText || `Education (${portfolioData.education.length})`} onChange={(val) => updateData('personal.navEducationText', val.text)} onClick={() => navigateToTab('education')} isEditMode={editMode} />
          <EditableButton editorKey="nav_mobile_skills" as="button" className={`pill ${activeTab === 'skills' ? 'primary' : 'glass'}`} text={portfolioData.personal.navSkillsText || 'Skills & Certs'} onChange={(val) => updateData('personal.navSkillsText', val.text)} onClick={() => navigateToTab('skills')} isEditMode={editMode} />
          <EditableButton editorKey="nav_mobile_cv" as="a" className="pill glass" href={portfolioData.personal.resumeUrl} target="_blank" rel="noopener noreferrer" download text={portfolioData.personal.navMobileCvText || 'Download CV 📥'} onChange={(val) => updateDataBatch([['personal.navMobileCvText', val.text], ['personal.resumeUrl', val.href]])} isEditMode={editMode} />
          <EditableButton editorKey="nav_mobile_contact" as="button" className="pill primary cta" text={portfolioData.personal.navContactText || 'Contact ↗'} onChange={(val) => updateData('personal.navContactText', val.text)} onClick={() => openDialog()} isEditMode={editMode} />
        </div>
      </nav>

      {/* Main View Router */}
      <main id="top">
        {activeTab === 'admin' && (
          !isAdminLoggedIn && (
            <div style={{ display: 'grid', placeItems: 'center', minHeight: '60vh' }}>
              <form className="modal glass" style={{ maxWidth: '420px', width: '100%', padding: '32px' }} onSubmit={handleAdminLogin}>
                <p className="eyebrow">🔐 SECURE ADMIN LOGIN</p>
                <h2 style={{ fontSize: '24px', margin: '8px 0 16px' }}>Enter Admin Password</h2>
                <p style={{ fontSize: '13.5px', color: '#64748b', margin: '0 0 16px' }}>
                  Please enter your password to enable inline edit mode.
                </p>

                <input
                  type="password"
                  className="form-input"
                  placeholder="Password"
                  autoFocus
                  required
                  disabled={isLoggingIn}
                  value={adminInputPassword}
                  onChange={(e) => setAdminInputPassword(e.target.value)}
                />

                {passwordError && (
                  <p style={{ color: '#ef4444', fontSize: '13px', margin: '8px 0 0', fontWeight: '700' }}>
                    ❌ Incorrect password. Please try again.
                  </p>
                )}

                <button type="submit" className="pill primary" style={{ width: '100%', marginTop: '16px', justifyContent: 'center' }} disabled={isLoggingIn}>
                  {isLoggingIn ? 'Checking…' : 'Enable Edit Mode 🔓'}
                </button>
              </form>
            </div>
          )
        )}

        {activeTab === 'home' && (
          <>
            {/* Landing Hero Section */}
            <section className="hero glass">
              <div className="hero-content-layout">
                <div className="hero-text-block">
                  <EditableText 
                    editorKey="home_hero_name"
                    tag="h1" 
                    className="hero-name" 
                    value={portfolioData.personal.name} 
                    onChange={(val) => updateData('personal.name', val)}
                    isEditMode={editMode} 
                  />
                  <div className="hero-role-title">
                    <EditableText 
                      editorKey="home_hero_title"
                      tag="span" 
                      value={portfolioData.personal.title} 
                      onChange={(val) => updateData('personal.title', val)}
                      isEditMode={editMode} 
                    />
                  </div>
                  <div className="hero-bio">
                    <EditableText 
                      editorKey="home_hero_summary"
                      tag="p" 
                      style={{ margin: '14px 0 0', color: '#475569', fontSize: '15px', lineHeight: '1.65' }}
                      value={portfolioData.personal.summary} 
                      onChange={(val) => updateData('personal.summary', val)}
                      isEditMode={editMode} 
                    />
                  </div>
                </div>
                <div className="hero-avatar-wrapper">
                  <EditableImage 
                    editorKey="home_hero_avatar"
                    src={portfolioData.personal.avatarImage} 
                    alt={`${portfolioData.personal.name} Avatar`} 
                    className="hero-avatar-3d" 
                    style={portfolioData.personal.avatarSize ? {
                      width: `${portfolioData.personal.avatarSize.width}px`,
                      height: `${portfolioData.personal.avatarSize.height}px`
                    } : undefined}
                    onChange={(val) => updateData('personal.avatarImage', val)}
                    onResize={(size) => updateData('personal.avatarSize', size)}
                    isEditMode={editMode} 
                  />
                </div>
              </div>
            </section>

            {/* Standalone Equal Full-Width Hero Action Buttons */}
            <div className="hero-actions-standalone">
              <EditableButton
                editorKey="home_action_explore"
                as="button"
                className="pill hero-primary-btn"
                text={portfolioData.personal.heroExploreText || 'Explore 12+ Experiences →'}
                onChange={(val) => updateData('personal.heroExploreText', val.text)}
                onClick={() => navigateToTab('experience')}
                isEditMode={editMode}
              />
              <EditableButton 
                editorKey="home_action_resume"
                as="a" 
                className="pill glass" 
                href={portfolioData.personal.resumeUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                download
                text={portfolioData.personal.heroResumeText || 'Download Resume PDF 📥'}
                onChange={(val) => updateDataBatch([['personal.heroResumeText', val.text], ['personal.resumeUrl', val.href]])}
                isEditMode={editMode} 
              />
              <EditableButton 
                editorKey="home_action_linkedin"
                as="a" 
                className="pill linkedin" 
                href={portfolioData.personal.linkedin} 
                target="_blank" 
                rel="noopener noreferrer" 
                text={portfolioData.personal.heroLinkedInText || 'LinkedIn ↗'}
                onChange={(val) => updateDataBatch([['personal.heroLinkedInText', val.text], ['personal.linkedin', val.href]])}
                isEditMode={editMode} 
              />
              <EditableButton
                editorKey="home_action_contact"
                as="button"
                className="pill glass"
                text={portfolioData.personal.heroContactText || 'Get in Touch ✉️'}
                onChange={(val) => updateData('personal.heroContactText', val.text)}
                onClick={() => openDialog()}
                isEditMode={editMode}
              />
            </div>


            {/* LANDING PAGE EXCLUSIVE: Biggest Achievements Spotlight */}
            <section className="fest-container-card glass">
              <div className="fest-header">
                <div className="fest-header-top">
                  <EditableText editorKey="home_achievements_eyebrow" tag="span" className="fest-eyebrow-badge" value={portfolioData.personal.achievementsEyebrow || 'FLAGSHIP ACHIEVEMENTS'} onChange={(val) => updateData('personal.achievementsEyebrow', val)} isEditMode={editMode} />
                  <EditableText editorKey="home_achievements_tag" tag="span" className="badge-tag accent" value={portfolioData.personal.achievementsTag || 'TOP HIGHLIGHTS ONLY'} onChange={(val) => updateData('personal.achievementsTag', val)} isEditMode={editMode} />
                </div>
                <EditableText editorKey="home_achievements_title" tag="h2" value={portfolioData.personal.achievementsTitle || 'Major Career & Research Achievements'} onChange={(val) => updateData('personal.achievementsTitle', val)} isEditMode={editMode} />
                <EditableText editorKey="home_achievements_intro" tag="p" className="fest-subtitle" value={portfolioData.personal.achievementsIntro || 'Here are the top flagship milestones of my career. For full details on all 12 internships, education, and certifications, explore the respective tabs above.'} onChange={(val) => updateData('personal.achievementsIntro', val)} isEditMode={editMode} />
              </div>

              <div className="fest-sub-rows">
                {portfolioData.topAchievements.map((item, idx) => (
                  <div
                    key={item.id}
                    className="fest-row-card glass"
                    onClick={() => {
                      if (editMode) return
                      if (item.id === 'hcl') navigateToTab('experience')
                      else if (item.id === 'iit') navigateToTab('experience')
                      else if (item.id === 'iiit') navigateToTab('education')
                      else navigateToTab('projects')
                    }}
                  >
                    <div className="row-card-content">
                      <EditableText editorKey={`achievement_${item.id}_icon`} tag="span" className="row-card-icon" value={item.icon} onChange={(val) => updateData(`topAchievements[${idx}].icon`, val)} isEditMode={editMode} />
                      <div className="row-card-info">
                        <EditableText editorKey={`achievement_${item.id}_badge`} tag="span" className="eyebrow" style={{ fontSize: '10px', marginBottom: '2px', display: 'inline-block' }} value={item.badge} onChange={(val) => updateData(`topAchievements[${idx}].badge`, val)} isEditMode={editMode} />
                        <EditableText editorKey={`achievement_${item.id}_title`} tag="h3" value={item.title} onChange={(val) => updateData(`topAchievements[${idx}].title`, val)} isEditMode={editMode} />
                        <EditableText editorKey={`achievement_${item.id}_description`} tag="p" value={item.description} onChange={(val) => updateData(`topAchievements[${idx}].description`, val)} isEditMode={editMode} />
                      </div>
                    </div>
                    <div className="row-card-action">
                      <EditableButton
                        editorKey={`achievement_${item.id}_action`}
                        as="button"
                        className="pill primary row-action-btn"
                        text={item.actionText}
                        onChange={(val) => updateData(`topAchievements[${idx}].actionText`, val.text)}
                        isEditMode={editMode}
                        onClick={(e) => {
                          e.stopPropagation()
                          if (item.id === 'hcl') navigateToTab('experience')
                          else if (item.id === 'iit') navigateToTab('experience')
                          else if (item.id === 'iiit') navigateToTab('education')
                          else navigateToTab('projects')
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Social Proof & Testimonials Section */}
            <section className="fest-container-card glass" style={{ marginTop: '32px' }}>
              <div className="fest-header">
                <div className="fest-header-top">
                  <EditableText editorKey="home_testimonials_eyebrow" tag="span" className="fest-eyebrow-badge" value={portfolioData.personal.testimonialsEyebrow || 'RECOMMENDATIONS & FEEDBACK'} onChange={(val) => updateData('personal.testimonialsEyebrow', val)} isEditMode={editMode} />
                  <EditableText editorKey="home_testimonials_tag" tag="span" className="badge-tag accent" value={portfolioData.personal.testimonialsTag || 'VERIFIED SOCIAL PROOF'} onChange={(val) => updateData('personal.testimonialsTag', val)} isEditMode={editMode} />
                </div>
                <EditableText editorKey="home_testimonials_title" tag="h2" value={portfolioData.personal.testimonialsTitle || 'What Mentors & Leaders Say'} onChange={(val) => updateData('personal.testimonialsTitle', val)} isEditMode={editMode} />
              </div>

              <div className="testimonials-grid">
                {portfolioData.testimonials.map((item, idx) => (
                  <div key={item.id || idx} className="testimonial-card glass">
                    <div className="testimonial-quote">
                      "<EditableText editorKey={`testimonial_${item.id}_quote`} tag="span" value={item.quote} onChange={(val) => updateData(`testimonials[${idx}].quote`, val)} isEditMode={editMode} />"
                    </div>
                    <div className="testimonial-author">
                      <div className="testimonial-avatar">
                        <EditableText editorKey={`testimonial_${item.id}_avatar`} tag="span" value={item.avatar} onChange={(val) => updateData(`testimonials[${idx}].avatar`, val)} isEditMode={editMode} />
                      </div>
                      <div className="testimonial-info">
                        <EditableText editorKey={`testimonial_${item.id}_author`} tag="h4" value={item.author} onChange={(val) => updateData(`testimonials[${idx}].author`, val)} isEditMode={editMode} />
                        <EditableText editorKey={`testimonial_${item.id}_title`} tag="p" value={item.title} onChange={(val) => updateData(`testimonials[${idx}].title`, val)} isEditMode={editMode} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Call to Action Banner on Home */}
            <section className="wide glass" style={{ marginTop: '32px' }}>
              <div>
                <EditableText editorKey="home_track_eyebrow" tag="p" className="eyebrow" value={portfolioData.personal.trackRecordEyebrow || 'Explore Complete Track Record'} onChange={(val) => updateData('personal.trackRecordEyebrow', val)} isEditMode={editMode} />
                <EditableText editorKey="home_track_title" tag="h2" value={portfolioData.personal.trackRecordTitle || 'Check out all 12+ roles, projects, and certifications.'} onChange={(val) => updateData('personal.trackRecordTitle', val)} isEditMode={editMode} />
              </div>
              <div className="wide-actions">
                <EditableButton editorKey="home_cta_experiences" as="button" className="pill primary" text={portfolioData.personal.homeAllExperiencesText || 'View All Experiences →'} onChange={(val) => updateData('personal.homeAllExperiencesText', val.text)} onClick={() => navigateToTab('experience')} isEditMode={editMode} />
                <EditableButton editorKey="home_cta_contact" as="button" className="pill glass" text={portfolioData.personal.homeContactText || 'Contact Me ↗'} onChange={(val) => updateData('personal.homeContactText', val.text)} onClick={() => openDialog()} isEditMode={editMode} />
              </div>
            </section>
          </>
        )}

        {/* DEDICATED TAB: EXPERIENCE */}
        {activeTab === 'experience' && (
          <section className="events-page">
            <header className="hero glass" style={{ minHeight: 'auto', padding: '36px' }}>
              <EditableButton editorKey="experience_back_home" as="button" className="pill glass" style={{ width: 'fit-content', marginBottom: '16px' }} text={portfolioData.personal.backHomeText || '← Back to Home'} onChange={(val) => updateData('personal.backHomeText', val.text)} onClick={() => navigateToTab('home')} isEditMode={editMode} />
              <EditableText editorKey="experience_eyebrow" tag="p" className="eyebrow" value={portfolioData.personal.experienceEyebrow || `Professional Track Record · ${portfolioData.experiences.length} Roles`} onChange={(val) => updateData('personal.experienceEyebrow', val)} isEditMode={editMode} />
              <EditableText editorKey="experience_title" tag="h1" style={{ fontSize: 'clamp(32px, 5.5vw, 56px)' }} value={portfolioData.personal.experienceTitle || 'Work & Research Internships.'} onChange={(val) => updateData('personal.experienceTitle', val)} isEditMode={editMode} />
              <EditableText editorKey="experience_intro" tag="p" className="intro" style={{ marginTop: '12px' }} value={portfolioData.personal.experienceIntro || 'Complete breakdown of my internships, software engineering positions, IIT research projects, and campus ambassador roles.'} onChange={(val) => updateData('personal.experienceIntro', val)} isEditMode={editMode} />

              <div className="filter-bar">
                <EditableButton editorKey="experience_filter_all" as="button" className={`filter-btn ${filter === 'all' ? 'active' : ''}`} text={portfolioData.personal.filterAllText || `All Experience (${portfolioData.experiences.length})`} onChange={(val) => updateData('personal.filterAllText', val.text)} onClick={() => setFilter('all')} isEditMode={editMode} />
                <EditableButton editorKey="experience_filter_work" as="button" className={`filter-btn ${filter === 'work' ? 'active' : ''}`} text={portfolioData.personal.filterWorkText || `Industry & Dev Roles (${experienceCounts.work || 0})`} onChange={(val) => updateData('personal.filterWorkText', val.text)} onClick={() => setFilter('work')} isEditMode={editMode} />
                <EditableButton editorKey="experience_filter_ai" as="button" className={`filter-btn ${filter === 'ai' ? 'active' : ''}`} text={portfolioData.personal.filterAiText || `AI & Machine Learning (${experienceCounts.ai || 0})`} onChange={(val) => updateData('personal.filterAiText', val.text)} onClick={() => setFilter('ai')} isEditMode={editMode} />
                <EditableButton editorKey="experience_filter_research" as="button" className={`filter-btn ${filter === 'research' ? 'active' : ''}`} text={portfolioData.personal.filterResearchText || `IIT & IEEE Research (${experienceCounts.research || 0})`} onChange={(val) => updateData('personal.filterResearchText', val.text)} onClick={() => setFilter('research')} isEditMode={editMode} />
                <EditableButton editorKey="experience_filter_leadership" as="button" className={`filter-btn ${filter === 'leadership' ? 'active' : ''}`} text={portfolioData.personal.filterLeadershipText || `Leadership & Ambassador (${experienceCounts.leadership || 0})`} onChange={(val) => updateData('personal.filterLeadershipText', val.text)} onClick={() => setFilter('leadership')} isEditMode={editMode} />
              </div>
            </header>

            <div className="trajectory-wrapper">
              {filteredExperiences.map((exp, idx) => {
                const globalIdx = portfolioData.experiences.findIndex(e => e.id === exp.id);
                return (
                <div key={exp.id} className="trajectory-step-container">
                  <div className="trajectory-node-column">
                    <div className="trajectory-dot"></div>
                    {idx < filteredExperiences.length - 1 && <div className="trajectory-line"></div>}
                  </div>

                  <div
                    className="trajectory-card glass"
                    onClick={() => !editMode && openDialog({ eyebrow: exp.company, title: exp.role, text: exp.details.join(' ') })}
                    style={{ cursor: editMode ? 'default' : 'pointer' }}
                  >
                    <div className="trajectory-card-header">
                      <EditableText editorKey={`experience_${exp.id}_company`} tag="span" className="fest-eyebrow-badge" value={exp.company} onChange={(val) => updateData(`experiences[${globalIdx}].company`, val)} isEditMode={editMode} />
                      <EditableText editorKey={`experience_${exp.id}_period`} tag="span" className="date-text" style={{ margin: 0 }} value={`🗓️ ${exp.period}`} onChange={(val) => updateData(`experiences[${globalIdx}].period`, val.replace('🗓️ ', ''))} isEditMode={editMode} />
                    </div>

                    <h2 className="trajectory-degree" style={{ fontSize: 'clamp(20px, 3.2vw, 26px)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <EditableText editorKey={`experience_${exp.id}_icon`} tag="span" value={exp.icon} onChange={(val) => updateData(`experiences[${globalIdx}].icon`, val)} isEditMode={editMode} />
                      <EditableText editorKey={`experience_${exp.id}_role`} tag="span" value={exp.role} onChange={(val) => updateData(`experiences[${globalIdx}].role`, val)} isEditMode={editMode} />
                    </h2>
                    <div className="trajectory-institution">
                      <EditableText editorKey={`experience_${exp.id}_location`} tag="span" value={`📍 ${exp.location}`} onChange={(val) => updateData(`experiences[${globalIdx}].location`, val.replace('📍 ', ''))} isEditMode={editMode} />
                    </div>

                    <ul style={{ margin: '0 0 16px', paddingLeft: '20px', color: '#475569', fontSize: '14px', lineHeight: '1.65' }}>
                      {exp.details.map((point, pIdx) => (
                        <EditableText editorKey={`experience_${exp.id}_detail_${pIdx}`} key={pIdx} tag="li" style={{ marginBottom: '4px' }} value={point} onChange={(val) => updateData(`experiences[${globalIdx}].details[${pIdx}]`, val)} isEditMode={editMode} />
                      ))}
                    </ul>

                    <div className="trajectory-footer" style={{ flexWrap: 'wrap' }}>
                      {exp.tags.map((t, tIdx) => (
                        <EditableText editorKey={`experience_${exp.id}_tag_${tIdx}`} key={tIdx} tag="span" className="tag-pill" value={t} onChange={(val) => updateData(`experiences[${globalIdx}].tags[${tIdx}]`, val)} isEditMode={editMode} />
                      ))}
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          </section>
        )}

        {/* DEDICATED TAB: PROJECTS */}
        {activeTab === 'projects' && (
          <section className="events-page">
            <header className="hero glass" style={{ minHeight: 'auto', padding: '36px' }}>
              <EditableButton editorKey="projects_back_home" as="button" className="pill glass" style={{ width: 'fit-content', marginBottom: '16px' }} text={portfolioData.personal.backHomeText || '← Back to Home'} onChange={(val) => updateData('personal.backHomeText', val.text)} onClick={() => navigateToTab('home')} isEditMode={editMode} />
              <EditableText editorKey="projects_eyebrow" tag="p" className="eyebrow" value={portfolioData.personal.projectsEyebrow || 'Innovations & Engineering'} onChange={(val) => updateData('personal.projectsEyebrow', val)} isEditMode={editMode} />
              <EditableText editorKey="projects_title" tag="h1" style={{ fontSize: 'clamp(32px, 5.5vw, 56px)' }} value={portfolioData.personal.projectsTitle || 'Featured Projects & Research.'} onChange={(val) => updateData('personal.projectsTitle', val)} isEditMode={editMode} />
              <EditableText editorKey="projects_intro" tag="p" className="intro" style={{ marginTop: '12px' }} value={portfolioData.personal.projectsIntro || 'Healthcare AI diagnostic models, clean energy hybrid systems at IIT Ropar, and full-stack web applications.'} onChange={(val) => updateData('personal.projectsIntro', val)} isEditMode={editMode} />
            </header>

            <div className="fest-container-card glass" style={{ marginTop: '24px' }}>
              <div className="fest-sub-rows">
                {portfolioData.projects.map((proj, idx) => (
                  <div key={proj.id || idx} className="fest-row-card glass">
                    <div className="row-card-content">
                      <EditableText editorKey={`project_${proj.id}_icon`} tag="span" className="row-card-icon" value={proj.icon} onChange={(val) => updateData(`projects[${idx}].icon`, val)} isEditMode={editMode} />
                      <div className="row-card-info">
                        <EditableText editorKey={`project_${proj.id}_badge`} tag="span" className="eyebrow" style={{ fontSize: '10px', marginBottom: '2px', display: 'inline-block' }} value={proj.badge} onChange={(val) => updateData(`projects[${idx}].badge`, val)} isEditMode={editMode} />
                        <EditableText editorKey={`project_${proj.id}_title`} tag="h3" value={proj.title} onChange={(val) => updateData(`projects[${idx}].title`, val)} isEditMode={editMode} />
                        <EditableText editorKey={`project_${proj.id}_description`} tag="p" value={proj.desc} onChange={(val) => updateData(`projects[${idx}].desc`, val)} isEditMode={editMode} />

                        <div className="project-action-buttons">
                          {(proj.liveUrl || editMode) && (
                            <EditableButton editorKey={`project_${proj.id}_live`} as="a" className="project-btn primary" href={proj.liveUrl} target="_blank" rel="noopener noreferrer" text={proj.liveActionText || 'Live Demo ↗'} onChange={(val) => updateDataBatch([[`projects[${idx}].liveActionText`, val.text], [`projects[${idx}].liveUrl`, val.href]])} isEditMode={editMode} />
                          )}
                          {(proj.githubUrl || editMode) && (
                            <EditableButton editorKey={`project_${proj.id}_source`} as="a" className="project-btn secondary" href={proj.githubUrl} target="_blank" rel="noopener noreferrer" text={proj.sourceActionText || 'Source Code ↗'} onChange={(val) => updateDataBatch([[`projects[${idx}].sourceActionText`, val.text], [`projects[${idx}].githubUrl`, val.href]])} isEditMode={editMode} />
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="row-card-action">
                      <EditableButton editorKey={`project_${proj.id}_details`} as="button" className="pill primary row-action-btn" text={proj.detailsActionText || 'Details ↗'} onChange={(val) => updateData(`projects[${idx}].detailsActionText`, val.text)} onClick={() => !editMode && openDialog({ eyebrow: proj.badge, title: proj.title, text: proj.desc })} isEditMode={editMode} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* DEDICATED TAB: EDUCATION */}
        {activeTab === 'education' && (
          <section className="events-page">
            <header className="hero glass" style={{ minHeight: 'auto', padding: '36px' }}>
              <EditableButton editorKey="education_back_home" as="button" className="pill glass" style={{ width: 'fit-content', marginBottom: '16px' }} text={portfolioData.personal.backHomeText || '← Back to Home'} onChange={(val) => updateData('personal.backHomeText', val.text)} onClick={() => navigateToTab('home')} isEditMode={editMode} />
              <EditableText editorKey="education_eyebrow" tag="p" className="eyebrow" value={portfolioData.personal.educationEyebrow || 'Academic Progression'} onChange={(val) => updateData('personal.educationEyebrow', val)} isEditMode={editMode} />
              <EditableText editorKey="education_title" tag="h1" style={{ fontSize: 'clamp(32px, 5.5vw, 56px)' }} value={portfolioData.personal.educationTitle || 'Educational Trajectory.'} onChange={(val) => updateData('personal.educationTitle', val)} isEditMode={editMode} />
              <EditableText editorKey="education_intro" tag="p" className="intro" style={{ marginTop: '12px' }} value={portfolioData.personal.educationIntro || 'Chronological higher education pathway progressing from undergraduate Computer Science at University of Delhi to postgraduate AI & Data Science research at IIIT Delhi.'} onChange={(val) => updateData('personal.educationIntro', val)} isEditMode={editMode} />
            </header>

            <div className="trajectory-wrapper">
              {portfolioData.education.map((edu, idx) => (
                <div key={edu.id || idx} className="trajectory-step-container">
                  <div className="trajectory-node-column">
                    <div className="trajectory-dot"></div>
                    {idx < portfolioData.education.length - 1 && <div className="trajectory-line"></div>}
                  </div>

                  <div className="trajectory-card glass">
                    <div className="trajectory-card-header">
                      <EditableText editorKey={`education_${edu.id}_badge`} tag="span" className="fest-eyebrow-badge" value={edu.badge} onChange={(val) => updateData(`education[${idx}].badge`, val)} isEditMode={editMode} />
                      <EditableText editorKey={`education_${edu.id}_period`} tag="span" className="date-text" style={{ margin: 0 }} value={`🗓️ ${edu.period}`} onChange={(val) => updateData(`education[${idx}].period`, val.replace('🗓️ ', ''))} isEditMode={editMode} />
                    </div>

                    <h2 className="trajectory-degree">
                      <EditableText editorKey={`education_${edu.id}_degree`} tag="span" value={edu.degree} onChange={(val) => updateData(`education[${idx}].degree`, val)} isEditMode={editMode} />
                    </h2>
                    <div className="trajectory-institution">
                      <EditableText editorKey={`education_${edu.id}_institution`} tag="span" value={`🏛️ ${edu.institution}`} onChange={(val) => updateData(`education[${idx}].institution`, val.replace('🏛️ ', ''))} isEditMode={editMode} />
                    </div>
                    <EditableText editorKey={`education_${edu.id}_description`} tag="p" className="trajectory-desc" value={edu.desc} onChange={(val) => updateData(`education[${idx}].desc`, val)} isEditMode={editMode} />

                    <div className="trajectory-footer">
                      <EditableText editorKey={`education_${edu.id}_field`} tag="span" className="badge-tag accent" value={edu.field} onChange={(val) => updateData(`education[${idx}].field`, val)} isEditMode={editMode} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* DEDICATED TAB: SKILLS & CERTS */}
        {activeTab === 'skills' && (
          <section className="events-page">
            <header className="hero glass" style={{ minHeight: 'auto', padding: '36px' }}>
              <EditableButton editorKey="skills_back_home" as="button" className="pill glass" style={{ width: 'fit-content', marginBottom: '16px' }} text={portfolioData.personal.backHomeText || '← Back to Home'} onChange={(val) => updateData('personal.backHomeText', val.text)} onClick={() => navigateToTab('home')} isEditMode={editMode} />
              <EditableText editorKey="skills_eyebrow" tag="p" className="eyebrow" value={portfolioData.personal.skillsEyebrow || 'Technical Competencies'} onChange={(val) => updateData('personal.skillsEyebrow', val)} isEditMode={editMode} />
              <EditableText editorKey="skills_title" tag="h1" style={{ fontSize: 'clamp(32px, 5.5vw, 56px)' }} value={portfolioData.personal.skillsTitle || 'Top Skills & Certifications.'} onChange={(val) => updateData('personal.skillsTitle', val)} isEditMode={editMode} />
              <EditableText editorKey="skills_intro" tag="p" className="intro" style={{ marginTop: '12px' }} value={portfolioData.personal.skillsIntro || 'Verified certifications in Product Strategy, Generative AI (DeepLearning.AI), Healthcare Machine Learning, and Sustainability.'} onChange={(val) => updateData('personal.skillsIntro', val)} isEditMode={editMode} />
            </header>

            <div style={{ marginTop: '24px' }}>
              <div className="trajectory-wrapper" style={{ marginTop: '28px' }}>
                {portfolioData.certifications.map((cert, idx) => (
                  <div key={cert.id || idx} className="trajectory-step-container">
                    <div className="trajectory-node-column">
                      <div className="trajectory-dot"></div>
                      {idx < portfolioData.certifications.length - 1 && <div className="trajectory-line"></div>}
                    </div>

                    <div
                      className="trajectory-card glass"
                      onClick={() => !editMode && openDialog({ eyebrow: cert.issuer, title: cert.title, text: cert.desc })}
                      style={{ cursor: editMode ? 'default' : 'pointer' }}
                    >
                      <div className="trajectory-card-header">
                        <EditableText editorKey={`certification_${cert.id}_badge`} tag="span" className="fest-eyebrow-badge" value={cert.badge} onChange={(val) => updateData(`certifications[${idx}].badge`, val)} isEditMode={editMode} />
                        <EditableText editorKey={`certification_${cert.id}_verified`} tag="span" className="badge-tag accent" value={cert.verifiedLabel || portfolioData.personal.certVerifiedLabel || 'VERIFIED CERTIFICATE'} onChange={(val) => updateData(`certifications[${idx}].verifiedLabel`, val)} isEditMode={editMode} />
                      </div>

                      <h2 className="trajectory-degree" style={{ fontSize: 'clamp(20px, 3.2vw, 26px)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <EditableText editorKey={`certification_${cert.id}_icon`} tag="span" value={cert.icon} onChange={(val) => updateData(`certifications[${idx}].icon`, val)} isEditMode={editMode} />
                        <EditableText editorKey={`certification_${cert.id}_title`} tag="span" value={cert.title} onChange={(val) => updateData(`certifications[${idx}].title`, val)} isEditMode={editMode} />
                      </h2>
                      <div className="trajectory-institution">
                        <EditableText editorKey={`certification_${cert.id}_issuer`} tag="span" value={`📜 ${cert.issuer}`} onChange={(val) => updateData(`certifications[${idx}].issuer`, val.replace('📜 ', ''))} isEditMode={editMode} />
                      </div>
                      <EditableText editorKey={`certification_${cert.id}_description`} tag="p" className="trajectory-desc" value={cert.desc} onChange={(val) => updateData(`certifications[${idx}].desc`, val)} isEditMode={editMode} />

                      <div className="trajectory-footer">
                        <EditableText editorKey={`certification_${cert.id}_details`} tag="span" style={{ fontSize: '12.5px', color: '#0284c7', fontWeight: '700' }} value={cert.detailsText || 'Click to view credential details ↗'} onChange={(val) => updateData(`certifications[${idx}].detailsText`, val)} isEditMode={editMode} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer>
        <span>© 2026 <EditableText editorKey="footer_name" tag="span" value={portfolioData.personal.footerName || portfolioData.personal.name.toUpperCase()} onChange={(val) => updateData('personal.footerName', val)} isEditMode={editMode} /> · <EditableText editorKey="footer_location" tag="span" value={portfolioData.personal.footerLocation || portfolioData.personal.location.toUpperCase()} onChange={(val) => updateData('personal.footerLocation', val)} isEditMode={editMode} /></span>
        <EditableText editorKey="footer_tagline" tag="span" value={portfolioData.personal.footerTagline || 'AI · RESEARCH · SOFTWARE DEVELOPMENT'} onChange={(val) => updateData('personal.footerTagline', val)} isEditMode={editMode} />
      </footer>

      {/* Contact Dialog */}
      {activeDialog && (
        <Dialog
          customData={customDialogData}
          onClose={() => setActiveDialog(null)}
          data={portfolioData}
          editMode={editMode}
          updateData={updateData}
          updateDataBatch={updateDataBatch}
        />
      )}

      {/* Live editor command bar */}
      {editMode && (
        <aside className="floating-save-bar editor-command-bar" aria-label="Live edit controls">
          <div className="editor-command-status">
            <span className="editor-command-title"><span className="editor-status-dot" aria-hidden="true"></span>Live editor</span>
            <span className="editor-command-message" aria-live="polite">{saveStatus || 'Changes are not published until you save'}</span>
          </div>
          <label className="editor-page-picker">
            <span>Page</span>
            <select aria-label="Choose page to edit" value={activeDialog === 'contact' && !customDialogData ? 'contact' : activeTab} onChange={handleEditorPageChange}>
              <option value="home">Home</option>
              <option value="experience">Experience</option>
              <option value="projects">Projects</option>
              <option value="education">Education</option>
              <option value="skills">Skills & Certs</option>
              <option value="contact">Contact dialog</option>
            </select>
          </label>
          <div className="editor-history-controls" aria-label="Change history">
            <button className="editor-history-btn" type="button" onClick={handleUndo} disabled={historyIndex === 0} title="Undo last edit" aria-label="Undo last edit"><span aria-hidden="true">↶</span><span>Undo</span></button>
            <button className="editor-history-btn" type="button" onClick={handleRedo} disabled={historyIndex >= historyLength - 1} title="Redo last edit" aria-label="Redo last edit"><span aria-hidden="true">↷</span><span>Redo</span></button>
          </div>
          <div className="editor-save-controls">
            <button className="editor-save-btn" type="button" onClick={handleSaveData} disabled={isSaving}>{isSaving ? 'Pushing…' : 'Save'}</button>
            <button className="editor-save-exit-btn" type="button" onClick={async () => { if (dataHasUnsavedChanges(portfolioDataRef.current) && !(await handleSaveData())) return; handleExitEditMode() }} disabled={isSaving}>{isSaving ? 'Pushing…' : 'Save & Exit'}</button>
            <button className="editor-exit-btn" type="button" onClick={handleExitEditMode}>Exit</button>
          </div>
        </aside>
      )}
    </div>
    </EditorLayoutProvider>
  )
}
