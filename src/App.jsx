import { useState, useEffect, useRef } from 'react'
import './index.css'
import './inline-editing.css'
import defaultPortfolioData from './config/portfolioData.json'
import { EditableText, EditableImage, EditableButton } from './InlineEditors'

function Dialog({ customData, onClose, data, editMode, updateData }) {
  const [copied, setCopied] = useState(false)
  const [formSent, setFormSent] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(data.personal.email)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleFormSubmit = (e) => {
    e.preventDefault()
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
        <EditableText tag="p" className="eyebrow" value={customData?.eyebrow || data.personal.contactEyebrow} onChange={(val) => !customData && updateData('personal.contactEyebrow', val)} isEditMode={!customData && editMode} />
        <EditableText tag="h2" id="dialog-title" value={customData?.title || data.personal.contactTitle} onChange={(val) => !customData && updateData('personal.contactTitle', val)} isEditMode={!customData && editMode} />
        <EditableText tag="p" value={customData?.text || data.personal.contactText} onChange={(val) => !customData && updateData('personal.contactText', val)} isEditMode={!customData && editMode} />

        <form className="contact-form" onSubmit={handleFormSubmit}>
          <input type="text" className="form-input" placeholder="Your Name" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          <input type="email" className="form-input" placeholder="Your Email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
          <textarea className="form-textarea" rows="3" placeholder="Your Message..." required value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })}></textarea>
          <button type="submit" className="pill primary" style={{ width: '100%', justifyContent: 'center' }}>
            {formSent ? '✓ Opening Email Client...' : 'Send Message ✉️'}
          </button>
        </form>

        <div style={{ marginTop: '16px', background: 'rgba(2, 132, 199, 0.06)', padding: '14px', borderRadius: '16px', border: '1px solid rgba(2, 132, 199, 0.15)' }}>
          <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: '700', color: '#0284c7', fontFamily: 'DM Mono, monospace' }}>DIRECT EMAIL</p>
          <p style={{ margin: 0, fontWeight: '700', color: '#0a2540', fontSize: '14.5px' }}>{data.personal.email}</p>
        </div>

        <div className="modal-row" style={{ marginTop: '16px' }}>
          <button className="pill primary" onClick={handleCopyEmail}>{copied ? '✓ Copied!' : 'Copy Email 📋'}</button>
          <a className="pill linkedin" href={data.personal.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>
          <button className="pill glass" onClick={onClose}>Close</button>
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
    const saved = localStorage.getItem('userPortfolioData')
    if (saved) {
      try {
        return JSON.parse(saved)
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

  // Admin Login Authentication State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false)
  const [adminInputPassword, setAdminInputPassword] = useState('')
  const [passwordError, setPasswordError] = useState(false)
  
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

  const handleAdminLogin = (e) => {
    e.preventDefault()
    const correctPassword = portfolioData.personal.adminPassword || '4545amber5454'
    if (adminInputPassword === correctPassword) {
      setIsAdminLoggedIn(true)
      setPasswordError(false)
      setEditMode(true)
      setActiveTab('home') // Switch immediately to home to start editing
    } else {
      setPasswordError(true)
    }
  }

  const updateData = (path, value) => {
    const newData = JSON.parse(JSON.stringify(portfolioDataRef.current));
    const keys = path.replace(/\[(\d+)\]/g, '.$1').split('.');
    let current = newData;
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    portfolioDataRef.current = newData;
    setPortfolioData(newData);
    setUnsavedChanges(true);
    setSaveStatus('Unsaved changes')
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
        headers: { 'Content-Type': 'application/json' },
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
    if (saved) {
      try {
        const savedData = JSON.parse(saved)
        portfolioDataRef.current = savedData
        setPortfolioData(savedData)
      } catch {
        portfolioDataRef.current = defaultPortfolioData
        setPortfolioData(defaultPortfolioData)
      }
    } else {
      portfolioDataRef.current = defaultPortfolioData
      setPortfolioData(defaultPortfolioData)
    }
    setEditMode(false)
    setIsAdminLoggedIn(false)
    setUnsavedChanges(false)
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

  return (
    <div className="shell min-h-screen">
      {/* Translucent Glass Navigation Bar */}
      <nav className="glass navbar">
        <a className="brand" href="#home" onClick={(e) => { e.preventDefault(); navigateToTab('home'); }}>
          <EditableText tag="div" className="brand-avatar" value={portfolioData.personal.avatarInitials} onChange={(val) => updateData('personal.avatarInitials', val)} isEditMode={editMode} />
          <EditableText tag="span" value={portfolioData.personal.shortName} onChange={(val) => updateData('personal.shortName', val)} isEditMode={editMode} />
        </a>

        <div className="nav-links">
          <button className={`pill ${activeTab === 'home' ? 'primary' : 'glass'}`} onClick={() => navigateToTab('home')}>Home</button>
          <button className={`pill ${activeTab === 'experience' ? 'primary' : 'glass'}`} onClick={() => navigateToTab('experience')}>Experience ({portfolioData.experiences.length})</button>
          <button className={`pill ${activeTab === 'projects' ? 'primary' : 'glass'}`} onClick={() => navigateToTab('projects')}>Projects ({portfolioData.projects.length})</button>
          <button className={`pill ${activeTab === 'education' ? 'primary' : 'glass'}`} onClick={() => navigateToTab('education')}>Education ({portfolioData.education.length})</button>
          <button className={`pill ${activeTab === 'skills' ? 'primary' : 'glass'}`} onClick={() => navigateToTab('skills')}>Skills & Certs</button>
          <EditableButton as="a" className="pill glass" href={portfolioData.personal.resumeUrl} target="_blank" rel="noopener noreferrer" download text="CV 📥" onChange={(val) => updateData('personal.resumeUrl', val.href)} isEditMode={editMode} />
          <button className="pill primary cta" onClick={() => openDialog()}>Contact ↗</button>
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
          <button className={`pill ${activeTab === 'home' ? 'primary' : 'glass'}`} onClick={() => navigateToTab('home')}>Home</button>
          <button className={`pill ${activeTab === 'experience' ? 'primary' : 'glass'}`} onClick={() => navigateToTab('experience')}>Experience ({portfolioData.experiences.length})</button>
          <button className={`pill ${activeTab === 'projects' ? 'primary' : 'glass'}`} onClick={() => navigateToTab('projects')}>Projects ({portfolioData.projects.length})</button>
          <button className={`pill ${activeTab === 'education' ? 'primary' : 'glass'}`} onClick={() => navigateToTab('education')}>Education ({portfolioData.education.length})</button>
          <button className={`pill ${activeTab === 'skills' ? 'primary' : 'glass'}`} onClick={() => navigateToTab('skills')}>Skills & Certs</button>
          <EditableButton as="a" className="pill glass" href={portfolioData.personal.resumeUrl} target="_blank" rel="noopener noreferrer" download text="Download CV 📥" onChange={(val) => updateData('personal.resumeUrl', val.href)} isEditMode={editMode} />
          <button className="pill primary cta" onClick={() => openDialog()}>Contact ↗</button>
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
                  value={adminInputPassword}
                  onChange={(e) => setAdminInputPassword(e.target.value)}
                />

                {passwordError && (
                  <p style={{ color: '#ef4444', fontSize: '13px', margin: '8px 0 0', fontWeight: '700' }}>
                    ❌ Incorrect password. Please try again.
                  </p>
                )}

                <button type="submit" className="pill primary" style={{ width: '100%', marginTop: '16px', justifyContent: 'center' }}>
                  Enable Edit Mode 🔓
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
                    tag="h1" 
                    className="hero-name" 
                    value={portfolioData.personal.name} 
                    onChange={(val) => updateData('personal.name', val)}
                    isEditMode={editMode} 
                  />
                  <div className="hero-role-title">
                    <EditableText 
                      tag="span" 
                      value={portfolioData.personal.title} 
                      onChange={(val) => updateData('personal.title', val)}
                      isEditMode={editMode} 
                    />
                  </div>
                  <div className="hero-bio">
                    <EditableText 
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
                    src={portfolioData.personal.avatarImage} 
                    alt={`${portfolioData.personal.name} Avatar`} 
                    className="hero-avatar-3d" 
                    onChange={(val) => updateData('personal.avatarImage', val)}
                    isEditMode={editMode} 
                  />
                </div>
              </div>
            </section>

            {/* Standalone Equal Full-Width Hero Action Buttons */}
            <div className="hero-actions-standalone">
              <button className="pill hero-primary-btn" onClick={() => navigateToTab('experience')}>Explore 12+ Experiences →</button>
              <EditableButton 
                as="a" 
                className="pill glass" 
                href={portfolioData.personal.resumeUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                download
                text="Download Resume PDF 📥"
                onChange={(val) => updateData('personal.resumeUrl', val.href)}
                isEditMode={editMode} 
              />
              <EditableButton 
                as="a" 
                className="pill linkedin" 
                href={portfolioData.personal.linkedin} 
                target="_blank" 
                rel="noopener noreferrer" 
                text="LinkedIn ↗"
                onChange={(val) => updateData('personal.linkedin', val.href)}
                isEditMode={editMode} 
              />
              <button className="pill glass" onClick={() => openDialog()}>
                Get in Touch ✉️
              </button>
            </div>


            {/* LANDING PAGE EXCLUSIVE: Biggest Achievements Spotlight */}
            <section className="fest-container-card glass">
              <div className="fest-header">
                <div className="fest-header-top">
                  <span className="fest-eyebrow-badge">FLAGSHIP ACHIEVEMENTS</span>
                  <span className="badge-tag accent">TOP HIGHLIGHTS ONLY</span>
                </div>
                <h2>Major Career & Research Achievements</h2>
                <p className="fest-subtitle">
                  Here are the top flagship milestones of my career. For full details on all 12 internships, education, and certifications, explore the respective tabs above.
                </p>
              </div>

              <div className="fest-sub-rows">
                {portfolioData.topAchievements.map((item, idx) => (
                  <div
                    key={item.id}
                    className="fest-row-card glass"
                    onClick={() => {
                      if (item.id === 'hcl') navigateToTab('experience')
                      else if (item.id === 'iit') navigateToTab('experience')
                      else if (item.id === 'iiit') navigateToTab('education')
                      else navigateToTab('projects')
                    }}
                  >
                    <div className="row-card-content">
                      <EditableText tag="span" className="row-card-icon" value={item.icon} onChange={(val) => updateData(`topAchievements[${idx}].icon`, val)} isEditMode={editMode} />
                      <div className="row-card-info">
                        <EditableText tag="span" className="eyebrow" style={{ fontSize: '10px', marginBottom: '2px', display: 'inline-block' }} value={item.badge} onChange={(val) => updateData(`topAchievements[${idx}].badge`, val)} isEditMode={editMode} />
                        <EditableText tag="h3" value={item.title} onChange={(val) => updateData(`topAchievements[${idx}].title`, val)} isEditMode={editMode} />
                        <EditableText tag="p" value={item.description} onChange={(val) => updateData(`topAchievements[${idx}].description`, val)} isEditMode={editMode} />
                      </div>
                    </div>
                    <div className="row-card-action">
                      <EditableButton
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
                  <span className="fest-eyebrow-badge">RECOMMENDATIONS & FEEDBACK</span>
                  <span className="badge-tag accent">VERIFIED SOCIAL PROOF</span>
                </div>
                <h2>What Mentors & Leaders Say</h2>
              </div>

              <div className="testimonials-grid">
                {portfolioData.testimonials.map((item, idx) => (
                  <div key={idx} className="testimonial-card glass">
                    <div className="testimonial-quote">
                      "<EditableText tag="span" value={item.quote} onChange={(val) => updateData(`testimonials[${idx}].quote`, val)} isEditMode={editMode} />"
                    </div>
                    <div className="testimonial-author">
                      <div className="testimonial-avatar">
                        <EditableText tag="span" value={item.avatar} onChange={(val) => updateData(`testimonials[${idx}].avatar`, val)} isEditMode={editMode} />
                      </div>
                      <div className="testimonial-info">
                        <EditableText tag="h4" value={item.author} onChange={(val) => updateData(`testimonials[${idx}].author`, val)} isEditMode={editMode} />
                        <EditableText tag="p" value={item.title} onChange={(val) => updateData(`testimonials[${idx}].title`, val)} isEditMode={editMode} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Call to Action Banner on Home */}
            <section className="wide glass" style={{ marginTop: '32px' }}>
              <div>
                <p className="eyebrow">Explore Complete Track Record</p>
                <h2>Check out all 12+ roles, projects, and certifications.</h2>
              </div>
              <div className="wide-actions">
                <button className="pill primary" onClick={() => navigateToTab('experience')}>View All Experiences →</button>
                <button className="pill glass" onClick={() => openDialog()}>Contact Me ↗</button>
              </div>
            </section>
          </>
        )}

        {/* DEDICATED TAB: EXPERIENCE */}
        {activeTab === 'experience' && (
          <section className="events-page">
            <header className="hero glass" style={{ minHeight: 'auto', padding: '36px' }}>
              <button className="pill glass" style={{ width: 'fit-content', marginBottom: '16px' }} onClick={() => navigateToTab('home')}>
                ← Back to Home
              </button>
              <p className="eyebrow">Professional Track Record · {portfolioData.experiences.length} Roles</p>
              <h1 style={{ fontSize: 'clamp(32px, 5.5vw, 56px)' }}>Work & Research Internships.</h1>
              <p className="intro" style={{ marginTop: '12px' }}>
                Complete breakdown of my internships, software engineering positions, IIT research projects, and campus ambassador roles.
              </p>

              <div className="filter-bar">
                <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
                  All Experience ({portfolioData.experiences.length})
                </button>
                <button className={`filter-btn ${filter === 'work' ? 'active' : ''}`} onClick={() => setFilter('work')}>
                  Industry & Dev Roles (3)
                </button>
                <button className={`filter-btn ${filter === 'ai' ? 'active' : ''}`} onClick={() => setFilter('ai')}>
                  AI & Machine Learning (2)
                </button>
                <button className={`filter-btn ${filter === 'research' ? 'active' : ''}`} onClick={() => setFilter('research')}>
                  IIT & IEEE Research (3)
                </button>
                <button className={`filter-btn ${filter === 'leadership' ? 'active' : ''}`} onClick={() => setFilter('leadership')}>
                  Leadership & Ambassador (4)
                </button>
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
                      <EditableText tag="span" className="fest-eyebrow-badge" value={exp.company} onChange={(val) => updateData(`experiences[${globalIdx}].company`, val)} isEditMode={editMode} />
                      <EditableText tag="span" className="date-text" style={{ margin: 0 }} value={`🗓️ ${exp.period}`} onChange={(val) => updateData(`experiences[${globalIdx}].period`, val.replace('🗓️ ', ''))} isEditMode={editMode} />
                    </div>

                    <h2 className="trajectory-degree" style={{ fontSize: 'clamp(20px, 3.2vw, 26px)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <EditableText tag="span" value={exp.icon} onChange={(val) => updateData(`experiences[${globalIdx}].icon`, val)} isEditMode={editMode} />
                      <EditableText tag="span" value={exp.role} onChange={(val) => updateData(`experiences[${globalIdx}].role`, val)} isEditMode={editMode} />
                    </h2>
                    <div className="trajectory-institution">
                      <EditableText tag="span" value={`📍 ${exp.location}`} onChange={(val) => updateData(`experiences[${globalIdx}].location`, val.replace('📍 ', ''))} isEditMode={editMode} />
                    </div>

                    <ul style={{ margin: '0 0 16px', paddingLeft: '20px', color: '#475569', fontSize: '14px', lineHeight: '1.65' }}>
                      {exp.details.map((point, pIdx) => (
                        <EditableText key={pIdx} tag="li" style={{ marginBottom: '4px' }} value={point} onChange={(val) => updateData(`experiences[${globalIdx}].details[${pIdx}]`, val)} isEditMode={editMode} />
                      ))}
                    </ul>

                    <div className="trajectory-footer" style={{ flexWrap: 'wrap' }}>
                      {exp.tags.map((t, tIdx) => (
                        <EditableText key={tIdx} tag="span" className="tag-pill" value={t} onChange={(val) => updateData(`experiences[${globalIdx}].tags[${tIdx}]`, val)} isEditMode={editMode} />
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
              <button className="pill glass" style={{ width: 'fit-content', marginBottom: '16px' }} onClick={() => navigateToTab('home')}>
                ← Back to Home
              </button>
              <p className="eyebrow">Innovations & Engineering</p>
              <h1 style={{ fontSize: 'clamp(32px, 5.5vw, 56px)' }}>Featured Projects & Research.</h1>
              <p className="intro" style={{ marginTop: '12px' }}>
                Healthcare AI diagnostic models, clean energy hybrid systems at IIT Ropar, and full-stack web applications.
              </p>
            </header>

            <div className="fest-container-card glass" style={{ marginTop: '24px' }}>
              <div className="fest-sub-rows">
                {portfolioData.projects.map((proj, idx) => (
                  <div key={idx} className="fest-row-card glass">
                    <div className="row-card-content">
                      <EditableText tag="span" className="row-card-icon" value={proj.icon} onChange={(val) => updateData(`projects[${idx}].icon`, val)} isEditMode={editMode} />
                      <div className="row-card-info">
                        <EditableText tag="span" className="eyebrow" style={{ fontSize: '10px', marginBottom: '2px', display: 'inline-block' }} value={proj.badge} onChange={(val) => updateData(`projects[${idx}].badge`, val)} isEditMode={editMode} />
                        <EditableText tag="h3" value={proj.title} onChange={(val) => updateData(`projects[${idx}].title`, val)} isEditMode={editMode} />
                        <EditableText tag="p" value={proj.desc} onChange={(val) => updateData(`projects[${idx}].desc`, val)} isEditMode={editMode} />

                        <div className="project-action-buttons">
                          {proj.liveUrl && (
                            <EditableButton as="a" className="project-btn primary" href={proj.liveUrl} target="_blank" rel="noopener noreferrer" text="Live Demo ↗" onChange={(val) => updateData(`projects[${idx}].liveUrl`, val.href)} isEditMode={editMode} />
                          )}
                          {proj.githubUrl && (
                            <EditableButton as="a" className="project-btn secondary" href={proj.githubUrl} target="_blank" rel="noopener noreferrer" text="Source Code ↗" onChange={(val) => updateData(`projects[${idx}].githubUrl`, val.href)} isEditMode={editMode} />
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="row-card-action">
                      <EditableButton as="button" className="pill primary row-action-btn" text="Details ↗" onClick={() => !editMode && openDialog({ eyebrow: proj.badge, title: proj.title, text: proj.desc })} isEditMode={editMode} />
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
              <button className="pill glass" style={{ width: 'fit-content', marginBottom: '16px' }} onClick={() => navigateToTab('home')}>
                ← Back to Home
              </button>
              <p className="eyebrow">Academic Progression</p>
              <h1 style={{ fontSize: 'clamp(32px, 5.5vw, 56px)' }}>Educational Trajectory.</h1>
              <p className="intro" style={{ marginTop: '12px' }}>
                Chronological higher education pathway progressing from undergraduate Computer Science at University of Delhi to postgraduate AI & Data Science research at IIIT Delhi.
              </p>
            </header>

            <div className="trajectory-wrapper">
              {portfolioData.education.map((edu, idx) => (
                <div key={idx} className="trajectory-step-container">
                  <div className="trajectory-node-column">
                    <div className="trajectory-dot"></div>
                    {idx < portfolioData.education.length - 1 && <div className="trajectory-line"></div>}
                  </div>

                  <div className="trajectory-card glass">
                    <div className="trajectory-card-header">
                      <EditableText tag="span" className="fest-eyebrow-badge" value={edu.badge} onChange={(val) => updateData(`education[${idx}].badge`, val)} isEditMode={editMode} />
                      <EditableText tag="span" className="date-text" style={{ margin: 0 }} value={`🗓️ ${edu.period}`} onChange={(val) => updateData(`education[${idx}].period`, val.replace('🗓️ ', ''))} isEditMode={editMode} />
                    </div>

                    <h2 className="trajectory-degree">
                      <EditableText tag="span" value={edu.degree} onChange={(val) => updateData(`education[${idx}].degree`, val)} isEditMode={editMode} />
                    </h2>
                    <div className="trajectory-institution">
                      <EditableText tag="span" value={`🏛️ ${edu.institution}`} onChange={(val) => updateData(`education[${idx}].institution`, val.replace('🏛️ ', ''))} isEditMode={editMode} />
                    </div>
                    <EditableText tag="p" className="trajectory-desc" value={edu.desc} onChange={(val) => updateData(`education[${idx}].desc`, val)} isEditMode={editMode} />

                    <div className="trajectory-footer">
                      <EditableText tag="span" className="badge-tag accent" value={edu.field} onChange={(val) => updateData(`education[${idx}].field`, val)} isEditMode={editMode} />
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
              <button className="pill glass" style={{ width: 'fit-content', marginBottom: '16px' }} onClick={() => navigateToTab('home')}>
                ← Back to Home
              </button>
              <p className="eyebrow">Technical Competencies</p>
              <h1 style={{ fontSize: 'clamp(32px, 5.5vw, 56px)' }}>Top Skills & Certifications.</h1>
              <p className="intro" style={{ marginTop: '12px' }}>
                Verified certifications in Product Strategy, Generative AI (DeepLearning.AI), Healthcare Machine Learning, and Sustainability.
              </p>
            </header>

            <div style={{ marginTop: '24px' }}>
              <div className="trajectory-wrapper" style={{ marginTop: '28px' }}>
                {portfolioData.certifications.map((cert, idx) => (
                  <div key={idx} className="trajectory-step-container">
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
                        <EditableText tag="span" className="fest-eyebrow-badge" value={cert.badge} onChange={(val) => updateData(`certifications[${idx}].badge`, val)} isEditMode={editMode} />
                        <span className="badge-tag accent">VERIFIED CERTIFICATE</span>
                      </div>

                      <h2 className="trajectory-degree" style={{ fontSize: 'clamp(20px, 3.2vw, 26px)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <EditableText tag="span" value={cert.icon} onChange={(val) => updateData(`certifications[${idx}].icon`, val)} isEditMode={editMode} />
                        <EditableText tag="span" value={cert.title} onChange={(val) => updateData(`certifications[${idx}].title`, val)} isEditMode={editMode} />
                      </h2>
                      <div className="trajectory-institution">
                        <EditableText tag="span" value={`📜 ${cert.issuer}`} onChange={(val) => updateData(`certifications[${idx}].issuer`, val.replace('📜 ', ''))} isEditMode={editMode} />
                      </div>
                      <EditableText tag="p" className="trajectory-desc" value={cert.desc} onChange={(val) => updateData(`certifications[${idx}].desc`, val)} isEditMode={editMode} />

                      <div className="trajectory-footer">
                        <span style={{ fontSize: '12.5px', color: '#0284c7', fontWeight: '700' }}>Click to view credential details ↗</span>
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
        <span>© 2026 <EditableText tag="span" value={portfolioData.personal.name.toUpperCase()} onChange={(val) => updateData('personal.name', val.toLowerCase())} isEditMode={editMode} /> · <EditableText tag="span" value={portfolioData.personal.location.toUpperCase()} onChange={(val) => updateData('personal.location', val.toLowerCase())} isEditMode={editMode} /></span>
        <EditableText tag="span" value="AI · RESEARCH · SOFTWARE DEVELOPMENT" onChange={() => {}} isEditMode={editMode} />
      </footer>

      {/* Contact Dialog */}
      {activeDialog && (
        <Dialog
          customData={customDialogData}
          onClose={() => setActiveDialog(null)}
          data={portfolioData}
          editMode={editMode}
          updateData={updateData}
        />
      )}

      {/* Floating Save Bar for Edit Mode */}
      {editMode && (
        <div className="floating-save-bar glass" style={{ background: 'rgba(255, 255, 255, 0.95)', border: '2px solid rgba(239, 68, 68, 0.5)', boxShadow: '0 0 20px rgba(239, 68, 68, 0.3)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', marginRight: '16px' }}>
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#ef4444' }}>Live Edit Mode Active</span>
            <span style={{ fontSize: '11px', color: '#64748b' }}>{saveStatus || 'Changes are not published until you save'}</span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className="pill primary" 
              onClick={handleSaveData} 
              style={{ background: '#ef4444', opacity: (unsavedChanges && !isSaving) ? 1 : 0.5 }}
              disabled={!unsavedChanges || isSaving}
            >
              {isSaving ? 'Pushing...' : 'Save'}
            </button>
            <button 
              className="pill primary" 
              onClick={async () => { 
                if (unsavedChanges && !(await handleSaveData())) return
                handleExitEditMode()
              }}
              style={{ background: '#b91c1c', opacity: isSaving ? 0.5 : 1 }}
              disabled={isSaving}
            >
              {isSaving ? 'Pushing...' : 'Save & Exit'}
            </button>
            <button 
              className="pill glass" 
              onClick={handleExitEditMode}
            >
              Exit
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
