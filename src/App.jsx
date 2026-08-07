import { useState, useEffect } from 'react'
import './index.css'
import defaultPortfolioData from './config/portfolioData.json'

function Dialog({ customData, onClose, data }) {
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

  const whatsappUrl = `https://wa.me/${data.personal.whatsappNumber}?text=${encodeURIComponent(data.personal.whatsappMessage)}`

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="modal glass"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <p className="eyebrow">{customData?.eyebrow || 'Connect & Collaborate'}</p>
        <h2 id="dialog-title">{customData?.title || 'Get in touch.'}</h2>
        <p>{customData?.text || `Feel free to reach out to ${data.personal.name} for software development opportunities, AI projects, or research collaborations.`}</p>

        {/* Quick WhatsApp Action Button */}
        <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <a
            className="pill whatsapp"
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ width: '100%', justifyContent: 'center', textAlign: 'center', fontSize: '15px' }}
          >
            💬 Chat instantly on WhatsApp ↗
          </a>
        </div>

        {/* Interactive Direct Message Form */}
        <form className="contact-form" onSubmit={handleFormSubmit}>
          <input
            type="text"
            className="form-input"
            placeholder="Your Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <input
            type="email"
            className="form-input"
            placeholder="Your Email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <textarea
            className="form-textarea"
            rows="3"
            placeholder="Your Message..."
            required
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          ></textarea>

          <button type="submit" className="pill primary" style={{ width: '100%', justifyContent: 'center' }}>
            {formSent ? '✓ Opening Email Client...' : 'Send Message ✉️'}
          </button>
        </form>

        <div style={{ marginTop: '16px', background: 'rgba(2, 132, 199, 0.06)', padding: '14px', borderRadius: '16px', border: '1px solid rgba(2, 132, 199, 0.15)' }}>
          <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: '700', color: '#0284c7', fontFamily: 'DM Mono, monospace' }}>DIRECT EMAIL</p>
          <p style={{ margin: 0, fontWeight: '700', color: '#0a2540', fontSize: '14.5px' }}>{data.personal.email}</p>
        </div>

        <div className="modal-row" style={{ marginTop: '16px' }}>
          <button className="pill primary" onClick={handleCopyEmail}>
            {copied ? '✓ Copied!' : 'Copy Email 📋'}
          </button>
          <a
            className="pill linkedin"
            href={data.personal.linkedin}
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn ↗
          </a>
          <button className="pill glass" onClick={onClose}>
            Close
          </button>
        </div>
      </section>
    </div>
  )
}

function AdminDashboard({ portfolioData, onSave, onLogout }) {
  const [formData, setFormData] = useState(portfolioData)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const handlePersonalChange = (field, val) => {
    setFormData({
      ...formData,
      personal: {
        ...formData.personal,
        [field]: val
      }
    })
  }

  const handleSave = () => {
    onSave(formData)
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  const handleDownloadJSON = () => {
    const jsonStr = JSON.stringify(formData, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'portfolioData.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <section className="events-page">
      <header className="hero glass" style={{ minHeight: 'auto', padding: '36px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <p className="eyebrow">🔐 Admin Content Manager (Vercel Native)</p>
            <h1 style={{ fontSize: 'clamp(28px, 4.5vw, 48px)', margin: '6px 0' }}>Website Admin Panel</h1>
            <p className="intro" style={{ margin: 0 }}>
              Edit personal details, WhatsApp number, email, links, and content below.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="pill primary" onClick={handleSave}>
              {saveSuccess ? '✓ Saved Live!' : '💾 Save & Apply'}
            </button>
            <button className="pill glass" onClick={handleDownloadJSON}>
              📥 Export JSON
            </button>
            <button className="pill glass" onClick={onLogout} style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }}>
              🔒 Logout
            </button>
          </div>
        </div>
      </header>

      {/* Admin Form Grid */}
      <div className="fest-container-card glass" style={{ marginTop: '24px', padding: '28px' }}>
        <h3 style={{ fontSize: '20px', margin: '0 0 20px', color: '#0f172a' }}>👤 Personal & Brand Settings</h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px', color: '#334155' }}>Full Name</label>
            <input
              type="text"
              className="form-input"
              value={formData.personal.name}
              onChange={(e) => handlePersonalChange('name', e.target.value)}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px', color: '#334155' }}>Short Name (Navbar)</label>
            <input
              type="text"
              className="form-input"
              value={formData.personal.shortName}
              onChange={(e) => handlePersonalChange('shortName', e.target.value)}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px', color: '#334155' }}>Email Address</label>
            <input
              type="email"
              className="form-input"
              value={formData.personal.email}
              onChange={(e) => handlePersonalChange('email', e.target.value)}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px', color: '#334155' }}>WhatsApp Number (e.g. 919876543210)</label>
            <input
              type="text"
              className="form-input"
              value={formData.personal.whatsappNumber}
              onChange={(e) => handlePersonalChange('whatsappNumber', e.target.value)}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px', color: '#334155' }}>LinkedIn URL</label>
            <input
              type="text"
              className="form-input"
              value={formData.personal.linkedin}
              onChange={(e) => handlePersonalChange('linkedin', e.target.value)}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px', color: '#334155' }}>GitHub URL</label>
            <input
              type="text"
              className="form-input"
              value={formData.personal.github}
              onChange={(e) => handlePersonalChange('github', e.target.value)}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px', color: '#334155' }}>Resume File URL</label>
            <input
              type="text"
              className="form-input"
              value={formData.personal.resumeUrl}
              onChange={(e) => handlePersonalChange('resumeUrl', e.target.value)}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px', color: '#334155' }}>Admin Password</label>
            <input
              type="text"
              className="form-input"
              value={formData.personal.adminPassword || 'admin123'}
              onChange={(e) => handlePersonalChange('adminPassword', e.target.value)}
            />
          </div>
        </div>

        <div style={{ marginTop: '16px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px', color: '#334155' }}>Title & Tagline</label>
          <input
            type="text"
            className="form-input"
            value={formData.personal.title}
            onChange={(e) => handlePersonalChange('title', e.target.value)}
          />
        </div>

        <div style={{ marginTop: '16px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px', color: '#334155' }}>Summary / Bio</label>
          <textarea
            className="form-textarea"
            rows="4"
            value={formData.personal.summary}
            onChange={(e) => handlePersonalChange('summary', e.target.value)}
          ></textarea>
        </div>

        <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
          <button className="pill primary" onClick={handleSave}>
            {saveSuccess ? '✓ Saved Live!' : '💾 Save Changes'}
          </button>
          <button className="pill glass" onClick={handleDownloadJSON}>
            📥 Export Updated JSON File
          </button>
        </div>
      </div>
    </section>
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

  // Admin Login Authentication State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false)
  const [adminInputPassword, setAdminInputPassword] = useState('')
  const [passwordError, setPasswordError] = useState(false)

  // Handle URL hash or tab
  useEffect(() => {
    if (window.location.pathname.includes('/admin') || window.location.hash === '#admin') {
      setActiveTab('admin')
    }
  }, [])

  const handleAdminLogin = (e) => {
    e.preventDefault()
    const correctPassword = portfolioData.personal.adminPassword || 'admin123'
    if (adminInputPassword === correctPassword) {
      setIsAdminLoggedIn(true)
      setPasswordError(false)
    } else {
      setPasswordError(true)
    }
  }

  const handleSaveData = (newData) => {
    setPortfolioData(newData)
    localStorage.setItem('userPortfolioData', JSON.stringify(newData))
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

  const whatsappUrl = `https://wa.me/${portfolioData.personal.whatsappNumber}?text=${encodeURIComponent(portfolioData.personal.whatsappMessage)}`

  return (
    <div className="shell min-h-screen">
      {/* Translucent Glass Navigation Bar */}
      <nav className="glass navbar">
        <a className="brand" href="#home" onClick={(e) => { e.preventDefault(); navigateToTab('home'); }}>
          <div className="brand-avatar">{portfolioData.personal.avatarInitials}</div>
          <span>{portfolioData.personal.shortName.split('.')[0]}<span className="brand-accent">.</span>{portfolioData.personal.shortName.split('.')[1] || 'v'}</span>
        </a>

        <div className="nav-links">
          <button className={`pill ${activeTab === 'home' ? 'primary' : 'glass'}`} onClick={() => navigateToTab('home')}>Home</button>
          <button className={`pill ${activeTab === 'experience' ? 'primary' : 'glass'}`} onClick={() => navigateToTab('experience')}>Experience ({portfolioData.experiences.length})</button>
          <button className={`pill ${activeTab === 'projects' ? 'primary' : 'glass'}`} onClick={() => navigateToTab('projects')}>Projects ({portfolioData.projects.length})</button>
          <button className={`pill ${activeTab === 'education' ? 'primary' : 'glass'}`} onClick={() => navigateToTab('education')}>Education ({portfolioData.education.length})</button>
          <button className={`pill ${activeTab === 'skills' ? 'primary' : 'glass'}`} onClick={() => navigateToTab('skills')}>Skills & Certs</button>
          <button className={`pill ${activeTab === 'admin' ? 'primary' : 'glass'}`} onClick={() => navigateToTab('admin')}>Admin 🔐</button>
          <a className="pill glass" href={portfolioData.personal.resumeUrl} target="_blank" rel="noopener noreferrer" download>CV 📥</a>
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
          <button className={`pill ${activeTab === 'admin' ? 'primary' : 'glass'}`} onClick={() => navigateToTab('admin')}>Admin 🔐</button>
          <a className="pill glass" href={portfolioData.personal.resumeUrl} target="_blank" rel="noopener noreferrer" download>Download CV 📥</a>
          <button className="pill primary cta" onClick={() => openDialog()}>Contact ↗</button>
        </div>
      </nav>

      {/* Main View Router */}
      <main id="top">
        {activeTab === 'admin' && (
          !isAdminLoggedIn ? (
            <div style={{ display: 'grid', placeItems: 'center', minHeight: '60vh' }}>
              <form className="modal glass" style={{ maxWidth: '420px', width: '100%', padding: '32px' }} onSubmit={handleAdminLogin}>
                <p className="eyebrow">🔐 SECURE ADMIN LOGIN</p>
                <h2 style={{ fontSize: '24px', margin: '8px 0 16px' }}>Enter Admin Password</h2>
                <p style={{ fontSize: '13.5px', color: '#64748b', margin: '0 0 16px' }}>
                  Default password is <code style={{ background: 'rgba(0,0,0,0.06)', padding: '2px 6px', borderRadius: '4px' }}>admin123</code>
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
                  Unlock Dashboard 🔓
                </button>
              </form>
            </div>
          ) : (
            <AdminDashboard
              portfolioData={portfolioData}
              onSave={handleSaveData}
              onLogout={() => setIsAdminLoggedIn(false)}
            />
          )
        )}

        {activeTab === 'home' && (
          <>
            {/* Landing Hero Section */}
            <section className="hero glass">
              <div className="hero-content-layout">
                <div className="hero-text-block">
                  <h1 className="hero-name">{portfolioData.personal.name}</h1>
                  <div className="hero-role-title">
                    <span>{portfolioData.personal.title}</span>
                  </div>
                  <div className="hero-bio">
                    <p style={{ margin: '14px 0 0', color: '#475569', fontSize: '15px', lineHeight: '1.65' }}>
                      {portfolioData.personal.summary}
                    </p>
                  </div>
                </div>
                <div className="hero-avatar-wrapper">
                  <img src={portfolioData.personal.avatarImage} alt={`${portfolioData.personal.name} Avatar`} className="hero-avatar-3d" />
                </div>
              </div>
            </section>

            {/* Standalone Equal Full-Width Hero Action Buttons */}
            <div className="hero-actions-standalone">
              <button className="pill hero-primary-btn" onClick={() => navigateToTab('experience')}>Explore 12+ Experiences →</button>
              <a className="pill whatsapp" href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                WhatsApp Chat 💬
              </a>
              <a className="pill glass" href={portfolioData.personal.resumeUrl} target="_blank" rel="noopener noreferrer" download>
                Download Resume PDF 📥
              </a>
              <a className="pill linkedin" href={portfolioData.personal.linkedin} target="_blank" rel="noopener noreferrer">
                LinkedIn ↗
              </a>
              <button className="pill glass" onClick={() => openDialog()}>
                Get in Touch ✉️
              </button>
            </div>

            {/* Impact Metrics Grid Counter */}
            <section className="metrics-section">
              <div className="metrics-grid">
                {portfolioData.impactMetrics.map((metric, idx) => (
                  <div key={idx} className="metric-card glass">
                    <div className="metric-value">{metric.value}</div>
                    <div className="metric-label">{metric.label}</div>
                    <div className="metric-subtext">{metric.subtext}</div>
                  </div>
                ))}
              </div>
            </section>

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
                {portfolioData.topAchievements.map((item) => (
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
                      <span className="row-card-icon">{item.icon}</span>
                      <div className="row-card-info">
                        <span className="eyebrow" style={{ fontSize: '10px', marginBottom: '2px', display: 'inline-block' }}>{item.badge}</span>
                        <h3>{item.title}</h3>
                        <p>{item.description}</p>
                      </div>
                    </div>
                    <div className="row-card-action">
                      <button
                        className="pill primary row-action-btn"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (item.id === 'hcl') navigateToTab('experience')
                          else if (item.id === 'iit') navigateToTab('experience')
                          else if (item.id === 'iiit') navigateToTab('education')
                          else navigateToTab('projects')
                        }}
                      >
                        {item.actionText}
                      </button>
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
                    <div className="testimonial-quote">"{item.quote}"</div>
                    <div className="testimonial-author">
                      <div className="testimonial-avatar">{item.avatar}</div>
                      <div className="testimonial-info">
                        <h4>{item.author}</h4>
                        <p>{item.title}</p>
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
              {filteredExperiences.map((exp, idx) => (
                <div key={exp.id} className="trajectory-step-container">
                  <div className="trajectory-node-column">
                    <div className="trajectory-dot"></div>
                    {idx < filteredExperiences.length - 1 && <div className="trajectory-line"></div>}
                  </div>

                  <div
                    className="trajectory-card glass"
                    onClick={() => openDialog({ eyebrow: exp.company, title: exp.role, text: exp.details.join(' ') })}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="trajectory-card-header">
                      <span className="fest-eyebrow-badge">{exp.company}</span>
                      <span className="date-text" style={{ margin: 0 }}>🗓️ {exp.period}</span>
                    </div>

                    <h2 className="trajectory-degree" style={{ fontSize: 'clamp(20px, 3.2vw, 26px)' }}>
                      {exp.icon} {exp.role}
                    </h2>
                    <div className="trajectory-institution">📍 {exp.location}</div>

                    <ul style={{ margin: '0 0 16px', paddingLeft: '20px', color: '#475569', fontSize: '14px', lineHeight: '1.65' }}>
                      {exp.details.map((point, pIdx) => (
                        <li key={pIdx} style={{ marginBottom: '4px' }}>{point}</li>
                      ))}
                    </ul>

                    <div className="trajectory-footer" style={{ flexWrap: 'wrap' }}>
                      {exp.tags.map((t, tIdx) => (
                        <span key={tIdx} className="tag-pill">{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
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
                      <span className="row-card-icon">{proj.icon}</span>
                      <div className="row-card-info">
                        <span className="eyebrow" style={{ fontSize: '10px', marginBottom: '2px', display: 'inline-block' }}>{proj.badge}</span>
                        <h3>{proj.title}</h3>
                        <p>{proj.desc}</p>

                        <div className="project-action-buttons">
                          {proj.liveUrl && (
                            <a className="project-btn primary" href={proj.liveUrl} target="_blank" rel="noopener noreferrer">
                              Live Demo ↗
                            </a>
                          )}
                          {proj.githubUrl && (
                            <a className="project-btn secondary" href={proj.githubUrl} target="_blank" rel="noopener noreferrer">
                              Source Code ↗
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="row-card-action">
                      <button className="pill primary row-action-btn" onClick={() => openDialog({ eyebrow: proj.badge, title: proj.title, text: proj.desc })}>
                        Details ↗
                      </button>
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
                      <span className="fest-eyebrow-badge">{edu.badge}</span>
                      <span className="date-text" style={{ margin: 0 }}>🗓️ {edu.period}</span>
                    </div>

                    <h2 className="trajectory-degree">{edu.degree}</h2>
                    <div className="trajectory-institution">🏛️ {edu.institution}</div>
                    <p className="trajectory-desc">{edu.desc}</p>

                    <div className="trajectory-footer">
                      <span className="badge-tag accent">{edu.field}</span>
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
                      onClick={() => openDialog({ eyebrow: cert.issuer, title: cert.title, text: cert.desc })}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="trajectory-card-header">
                        <span className="fest-eyebrow-badge">{cert.badge}</span>
                        <span className="badge-tag accent">VERIFIED CERTIFICATE</span>
                      </div>

                      <h2 className="trajectory-degree" style={{ fontSize: 'clamp(20px, 3.2vw, 26px)' }}>
                        {cert.icon} {cert.title}
                      </h2>
                      <div className="trajectory-institution">📜 {cert.issuer}</div>
                      <p className="trajectory-desc">{cert.desc}</p>

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
        <span>© 2026 {portfolioData.personal.name.toUpperCase()} · {portfolioData.personal.location.toUpperCase()}</span>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span>AI · RESEARCH · SOFTWARE DEVELOPMENT</span>
          <button
            onClick={() => navigateToTab('admin')}
            style={{ background: 'none', border: 'none', color: '#0284c7', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}
          >
            Admin 🔐
          </button>
        </div>
      </footer>

      {/* Contact Dialog */}
      {activeDialog && (
        <Dialog
          customData={customDialogData}
          onClose={() => setActiveDialog(null)}
          data={portfolioData}
        />
      )}
    </div>
  )
}
