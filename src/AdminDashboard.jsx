import { useState } from 'react'

// Edit Modal - opens when clicking ✏️ on any card
function EditModal({ title, fields, data, onSave, onClose }) {
  const [formData, setFormData] = useState({ ...data })

  const handleChange = (key, val) => {
    setFormData(prev => ({ ...prev, [key]: val }))
  }

  const handleListChange = (key, idx, val) => {
    const updated = [...(formData[key] || [])]
    updated[idx] = val
    setFormData(prev => ({ ...prev, [key]: updated }))
  }

  const handleListAdd = (key) => {
    setFormData(prev => ({ ...prev, [key]: [...(prev[key] || []), ''] }))
  }

  const handleListRemove = (key, idx) => {
    setFormData(prev => ({ ...prev, [key]: prev[key].filter((_, i) => i !== idx) }))
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="modal glass"
        role="dialog"
        aria-modal="true"
        onMouseDown={(e) => e.stopPropagation()}
        style={{ maxWidth: '580px', maxHeight: '85vh', overflow: 'auto' }}
      >
        <p className="eyebrow">✏️ EDIT MODE</p>
        <h2 style={{ fontSize: '22px', margin: '4px 0 20px' }}>{title}</h2>

        {fields.map((field) => {
          if (field.type === 'list') {
            const items = formData[field.key] || []
            return (
              <div key={field.key} style={{ marginBottom: '16px' }}>
                <label className="admin-label" style={{ marginBottom: '8px', display: 'block' }}>{field.label}</label>
                {items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                    <input
                      type="text"
                      className="form-input"
                      value={item}
                      onChange={(e) => handleListChange(field.key, idx, e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <button className="admin-inline-btn delete" onClick={() => handleListRemove(field.key, idx)}>✕</button>
                  </div>
                ))}
                <button className="admin-inline-btn add" onClick={() => handleListAdd(field.key)}>+ Add</button>
              </div>
            )
          }

          return (
            <div key={field.key} style={{ marginBottom: '14px' }}>
              <label className="admin-label" style={{ marginBottom: '6px', display: 'block' }}>{field.label}</label>
              {field.type === 'textarea' ? (
                <textarea
                  className="form-textarea"
                  rows={3}
                  value={formData[field.key] || ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                />
              ) : (
                <input
                  type={field.type || 'text'}
                  className="form-input"
                  value={formData[field.key] || ''}
                  onChange={(e) => handleChange(field.key, field.type === 'number' ? Number(e.target.value) : e.target.value)}
                />
              )}
            </div>
          )
        })}

        <div className="modal-row" style={{ marginTop: '20px' }}>
          <button className="pill primary" onClick={() => { onSave(formData); onClose(); }}>
            ✓ Save Changes
          </button>
          <button className="pill glass" onClick={onClose}>Cancel</button>
        </div>
      </section>
    </div>
  )
}

// Overlay wrapper that adds edit/delete buttons on hover
function EditableOverlay({ onEdit, onDelete, children }) {
  return (
    <div className="admin-editable-wrapper">
      {children}
      <div className="admin-overlay-buttons">
        <button className="admin-overlay-btn edit" onClick={(e) => { e.stopPropagation(); onEdit(); }} title="Edit">✏️</button>
        {onDelete && <button className="admin-overlay-btn delete" onClick={(e) => { e.stopPropagation(); onDelete(); }} title="Delete">🗑️</button>}
      </div>
    </div>
  )
}

export default function AdminDashboard({ portfolioData, onSave, onLogout }) {
  const [data, setData] = useState(JSON.parse(JSON.stringify(portfolioData)))
  const [activeAdminTab, setActiveAdminTab] = useState('home')
  const [editModal, setEditModal] = useState(null) // { title, fields, data, onSave }
  const [filter, setFilter] = useState('all')
  const [saveSuccess, setSaveSuccess] = useState(false)

  // ── Data mutation helpers ──
  const updateItem = (listKey, idx, newData) => {
    setData(d => {
      const list = [...d[listKey]]
      list[idx] = { ...list[idx], ...newData }
      return { ...d, [listKey]: list }
    })
  }

  const deleteItem = (listKey, idx) => {
    if (!confirm('Delete this item?')) return
    setData(d => ({ ...d, [listKey]: d[listKey].filter((_, i) => i !== idx) }))
  }

  const addItem = (listKey, template) => {
    setData(d => ({ ...d, [listKey]: [...d[listKey], template] }))
  }

  const handleGlobalSave = () => {
    onSave(data)
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'portfolioData.json'; a.click()
    URL.revokeObjectURL(url)
  }

  // Field definitions for each type
  const personalFields = [
    { key: 'name', label: 'Full Name' }, { key: 'shortName', label: 'Short Name (Navbar)' },
    { key: 'avatarInitials', label: 'Avatar Initials' }, { key: 'avatarImage', label: 'Avatar Image Path' },
    { key: 'title', label: 'Title & Tagline' }, { key: 'location', label: 'Location' },
    { key: 'email', label: 'Email' }, { key: 'whatsappNumber', label: 'WhatsApp Number' },
    { key: 'whatsappMessage', label: 'WhatsApp Default Message' },
    { key: 'linkedin', label: 'LinkedIn URL' }, { key: 'github', label: 'GitHub URL' },
    { key: 'resumeUrl', label: 'Resume PDF URL' }, { key: 'adminPassword', label: 'Admin Password' },
    { key: 'summary', label: 'Summary / Bio', type: 'textarea' }
  ]
  const experienceFields = [
    { key: 'role', label: 'Role Title' }, { key: 'company', label: 'Company' },
    { key: 'location', label: 'Location' }, { key: 'period', label: 'Time Period' },
    { key: 'category', label: 'Category (work/ai/research/leadership)' },
    { key: 'icon', label: 'Icon Emoji' },
    { key: 'details', label: 'Responsibilities', type: 'list' },
    { key: 'tags', label: 'Tags', type: 'list' }
  ]
  const projectFields = [
    { key: 'title', label: 'Project Title' }, { key: 'category', label: 'Category' },
    { key: 'desc', label: 'Description', type: 'textarea' }, { key: 'icon', label: 'Icon Emoji' },
    { key: 'badge', label: 'Badge Tag' },
    { key: 'liveUrl', label: 'Live Demo URL' }, { key: 'githubUrl', label: 'GitHub Source URL' }
  ]
  const educationFields = [
    { key: 'degree', label: 'Degree' }, { key: 'institution', label: 'Institution' },
    { key: 'field', label: 'Field of Study' }, { key: 'badge', label: 'Badge Tag' },
    { key: 'period', label: 'Period' }, { key: 'desc', label: 'Description', type: 'textarea' }
  ]
  const certFields = [
    { key: 'title', label: 'Title' }, { key: 'issuer', label: 'Issuer' },
    { key: 'icon', label: 'Icon Emoji' }, { key: 'badge', label: 'Badge Tag' },
    { key: 'desc', label: 'Description', type: 'textarea' }
  ]
  const testimonialFields = [
    { key: 'quote', label: 'Quote', type: 'textarea' }, { key: 'author', label: 'Author Name' },
    { key: 'title', label: 'Designation' }, { key: 'avatar', label: 'Avatar Emoji' }
  ]
  const achievementFields = [
    { key: 'id', label: 'ID' }, { key: 'title', label: 'Title' },
    { key: 'badge', label: 'Badge' }, { key: 'icon', label: 'Icon Emoji' },
    { key: 'description', label: 'Description', type: 'textarea' }, { key: 'actionText', label: 'Button Text' }
  ]
  const metricFields = [
    { key: 'value', label: 'Value (e.g. 12+)' }, { key: 'label', label: 'Label' }, { key: 'subtext', label: 'Subtext' }
  ]

  const filteredExperiences = filter === 'all'
    ? data.experiences
    : data.experiences.filter(exp => exp.category === filter)

  const navigateAdmin = (tab) => {
    setActiveAdminTab(tab)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      {/* Sticky Admin Toolbar */}
      <div className="admin-toolbar">
        <span className="admin-toolbar-badge">🔐 ADMIN MODE</span>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button className="pill primary" onClick={handleGlobalSave} style={{ padding: '10px 18px', fontSize: '14px' }}>
            {saveSuccess ? '✓ Saved!' : '💾 Save All'}
          </button>
          <button className="pill glass" onClick={handleExport} style={{ padding: '10px 18px', fontSize: '14px' }}>📥 Export</button>
          <button className="pill glass" onClick={onLogout} style={{ padding: '10px 18px', fontSize: '14px', color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }}>Logout</button>
        </div>
      </div>

      {/* Same Tab Navigation as Main Website */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '16px', marginBottom: '8px' }}>
        {[
          { key: 'home', label: 'Home' },
          { key: 'experience', label: `Experience (${data.experiences.length})` },
          { key: 'projects', label: `Projects (${data.projects.length})` },
          { key: 'education', label: `Education (${data.education.length})` },
          { key: 'skills', label: 'Skills & Certs' }
        ].map(tab => (
          <button
            key={tab.key}
            className={`pill ${activeAdminTab === tab.key ? 'primary' : 'glass'}`}
            onClick={() => navigateAdmin(tab.key)}
            style={{ fontSize: '14px', padding: '10px 18px' }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ═══════════ HOME TAB ═══════════ */}
      {activeAdminTab === 'home' && (
        <>
          {/* Hero Section - Editable */}
          <EditableOverlay onEdit={() => setEditModal({
            title: 'Edit Personal Info & Hero',
            fields: personalFields,
            data: data.personal,
            onSave: (newData) => setData(d => ({ ...d, personal: { ...d.personal, ...newData } }))
          })}>
            <section className="hero glass">
              <div className="hero-content-layout">
                <div className="hero-text-block">
                  <h1 className="hero-name">{data.personal.name}</h1>
                  <div className="hero-role-title"><span>{data.personal.title}</span></div>
                  <div className="hero-bio">
                    <p style={{ margin: '14px 0 0', color: '#475569', fontSize: '15px', lineHeight: '1.65' }}>{data.personal.summary}</p>
                  </div>
                </div>
                <div className="hero-avatar-wrapper">
                  <img src={data.personal.avatarImage} alt={`${data.personal.name} Avatar`} className="hero-avatar-3d" />
                </div>
              </div>
            </section>
          </EditableOverlay>


          {/* Top Achievements - Editable */}
          <section className="fest-container-card glass">
            <div className="fest-header">
              <div className="fest-header-top">
                <span className="fest-eyebrow-badge">FLAGSHIP ACHIEVEMENTS</span>
                <button className="admin-inline-btn add" onClick={() => addItem('topAchievements', { id: 'new', title: 'New Achievement', badge: 'NEW', icon: '🌟', description: 'Description', actionText: 'View ↗' })}>+ Add</button>
              </div>
              <h2>Major Career & Research Achievements</h2>
            </div>
            <div className="fest-sub-rows">
              {data.topAchievements.map((item, idx) => (
                <EditableOverlay
                  key={item.id}
                  onEdit={() => setEditModal({
                    title: 'Edit Achievement',
                    fields: achievementFields,
                    data: item,
                    onSave: (newData) => updateItem('topAchievements', idx, newData)
                  })}
                  onDelete={() => deleteItem('topAchievements', idx)}
                >
                  <div className="fest-row-card glass">
                    <div className="row-card-content">
                      <span className="row-card-icon">{item.icon}</span>
                      <div className="row-card-info">
                        <span className="eyebrow" style={{ fontSize: '10px', marginBottom: '2px', display: 'inline-block' }}>{item.badge}</span>
                        <h3>{item.title}</h3>
                        <p>{item.description}</p>
                      </div>
                    </div>
                  </div>
                </EditableOverlay>
              ))}
            </div>
          </section>

          {/* Testimonials - Editable */}
          <section className="fest-container-card glass" style={{ marginTop: '32px' }}>
            <div className="fest-header">
              <div className="fest-header-top">
                <span className="fest-eyebrow-badge">RECOMMENDATIONS & FEEDBACK</span>
                <button className="admin-inline-btn add" onClick={() => addItem('testimonials', { quote: 'New testimonial...', author: 'Author', title: 'Designation', avatar: '⭐' })}>+ Add</button>
              </div>
              <h2>What Mentors & Leaders Say</h2>
            </div>
            <div className="testimonials-grid">
              {data.testimonials.map((item, idx) => (
                <EditableOverlay
                  key={idx}
                  onEdit={() => setEditModal({
                    title: 'Edit Testimonial',
                    fields: testimonialFields,
                    data: item,
                    onSave: (newData) => updateItem('testimonials', idx, newData)
                  })}
                  onDelete={() => deleteItem('testimonials', idx)}
                >
                  <div className="testimonial-card glass">
                    <div className="testimonial-quote">"{item.quote}"</div>
                    <div className="testimonial-author">
                      <div className="testimonial-avatar">{item.avatar}</div>
                      <div className="testimonial-info">
                        <h4>{item.author}</h4>
                        <p>{item.title}</p>
                      </div>
                    </div>
                  </div>
                </EditableOverlay>
              ))}
            </div>
          </section>
        </>
      )}

      {/* ═══════════ EXPERIENCE TAB ═══════════ */}
      {activeAdminTab === 'experience' && (
        <section className="events-page">
          <header className="hero glass" style={{ minHeight: 'auto', padding: '36px' }}>
            <p className="eyebrow">Professional Track Record · {data.experiences.length} Roles</p>
            <h1 style={{ fontSize: 'clamp(32px, 5.5vw, 56px)' }}>Work & Research Internships.</h1>
            <div className="filter-bar" style={{ marginTop: '16px' }}>
              {['all', 'work', 'ai', 'research', 'leadership'].map(f => (
                <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                  {f === 'all' ? `All (${data.experiences.length})` : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            <button className="admin-inline-btn add" style={{ marginTop: '16px' }} onClick={() => addItem('experiences', { id: Date.now(), role: 'New Role', company: 'Company', location: 'Location', period: 'Month Year – Month Year', category: 'work', icon: '💼', details: ['Description'], tags: ['Tag'] })}>
              + Add New Experience
            </button>
          </header>

          <div className="trajectory-wrapper">
            {filteredExperiences.map((exp, idx) => {
              const realIdx = data.experiences.indexOf(exp)
              return (
                <div key={exp.id} className="trajectory-step-container">
                  <div className="trajectory-node-column">
                    <div className="trajectory-dot"></div>
                    {idx < filteredExperiences.length - 1 && <div className="trajectory-line"></div>}
                  </div>
                  <EditableOverlay
                    onEdit={() => setEditModal({
                      title: `Edit: ${exp.role} @ ${exp.company}`,
                      fields: experienceFields,
                      data: exp,
                      onSave: (newData) => updateItem('experiences', realIdx, newData)
                    })}
                    onDelete={() => deleteItem('experiences', realIdx)}
                  >
                    <div className="trajectory-card glass">
                      <div className="trajectory-card-header">
                        <span className="fest-eyebrow-badge">{exp.company}</span>
                        <span className="date-text" style={{ margin: 0 }}>🗓️ {exp.period}</span>
                      </div>
                      <h2 className="trajectory-degree" style={{ fontSize: 'clamp(20px, 3.2vw, 26px)' }}>{exp.icon} {exp.role}</h2>
                      <div className="trajectory-institution">📍 {exp.location}</div>
                      <ul style={{ margin: '0 0 16px', paddingLeft: '20px', color: '#475569', fontSize: '14px', lineHeight: '1.65' }}>
                        {exp.details.map((point, pIdx) => <li key={pIdx} style={{ marginBottom: '4px' }}>{point}</li>)}
                      </ul>
                      <div className="trajectory-footer" style={{ flexWrap: 'wrap' }}>
                        {exp.tags.map((t, tIdx) => <span key={tIdx} className="tag-pill">{t}</span>)}
                      </div>
                    </div>
                  </EditableOverlay>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ═══════════ PROJECTS TAB ═══════════ */}
      {activeAdminTab === 'projects' && (
        <section className="events-page">
          <header className="hero glass" style={{ minHeight: 'auto', padding: '36px' }}>
            <p className="eyebrow">Innovations & Engineering</p>
            <h1 style={{ fontSize: 'clamp(32px, 5.5vw, 56px)' }}>Featured Projects & Research.</h1>
            <button className="admin-inline-btn add" style={{ marginTop: '16px' }} onClick={() => addItem('projects', { title: 'New Project', category: 'Category', desc: 'Description', icon: '📁', badge: 'TAG', liveUrl: '', githubUrl: '' })}>
              + Add New Project
            </button>
          </header>
          <div className="fest-container-card glass" style={{ marginTop: '24px' }}>
            <div className="fest-sub-rows">
              {data.projects.map((proj, idx) => (
                <EditableOverlay
                  key={idx}
                  onEdit={() => setEditModal({
                    title: `Edit: ${proj.title}`,
                    fields: projectFields,
                    data: proj,
                    onSave: (newData) => updateItem('projects', idx, newData)
                  })}
                  onDelete={() => deleteItem('projects', idx)}
                >
                  <div className="fest-row-card glass">
                    <div className="row-card-content">
                      <span className="row-card-icon">{proj.icon}</span>
                      <div className="row-card-info">
                        <span className="eyebrow" style={{ fontSize: '10px', marginBottom: '2px', display: 'inline-block' }}>{proj.badge}</span>
                        <h3>{proj.title}</h3>
                        <p>{proj.desc}</p>
                        <div className="project-action-buttons">
                          {proj.liveUrl && <a className="project-btn primary" href={proj.liveUrl} target="_blank" rel="noopener noreferrer">Live Demo ↗</a>}
                          {proj.githubUrl && <a className="project-btn secondary" href={proj.githubUrl} target="_blank" rel="noopener noreferrer">Source Code ↗</a>}
                        </div>
                      </div>
                    </div>
                  </div>
                </EditableOverlay>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════ EDUCATION TAB ═══════════ */}
      {activeAdminTab === 'education' && (
        <section className="events-page">
          <header className="hero glass" style={{ minHeight: 'auto', padding: '36px' }}>
            <p className="eyebrow">Academic Progression</p>
            <h1 style={{ fontSize: 'clamp(32px, 5.5vw, 56px)' }}>Educational Trajectory.</h1>
            <button className="admin-inline-btn add" style={{ marginTop: '16px' }} onClick={() => addItem('education', { badge: 'DEGREE · INSTITUTION', degree: 'New Degree', field: 'FIELD', institution: 'Institution', period: 'Year – Year', desc: 'Description' })}>
              + Add Education
            </button>
          </header>
          <div className="trajectory-wrapper">
            {data.education.map((edu, idx) => (
              <div key={idx} className="trajectory-step-container">
                <div className="trajectory-node-column">
                  <div className="trajectory-dot"></div>
                  {idx < data.education.length - 1 && <div className="trajectory-line"></div>}
                </div>
                <EditableOverlay
                  onEdit={() => setEditModal({
                    title: `Edit: ${edu.degree}`,
                    fields: educationFields,
                    data: edu,
                    onSave: (newData) => updateItem('education', idx, newData)
                  })}
                  onDelete={() => deleteItem('education', idx)}
                >
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
                </EditableOverlay>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ═══════════ SKILLS & CERTS TAB ═══════════ */}
      {activeAdminTab === 'skills' && (
        <section className="events-page">
          <header className="hero glass" style={{ minHeight: 'auto', padding: '36px' }}>
            <p className="eyebrow">Technical Competencies</p>
            <h1 style={{ fontSize: 'clamp(32px, 5.5vw, 56px)' }}>Top Skills & Certifications.</h1>
            <button className="admin-inline-btn add" style={{ marginTop: '16px' }} onClick={() => addItem('certifications', { title: 'New Certification', issuer: 'Issuer', icon: '📜', badge: 'TAG', desc: 'Description' })}>
              + Add Certification
            </button>
          </header>
          <div className="trajectory-wrapper" style={{ marginTop: '24px' }}>
            {data.certifications.map((cert, idx) => (
              <div key={idx} className="trajectory-step-container">
                <div className="trajectory-node-column">
                  <div className="trajectory-dot"></div>
                  {idx < data.certifications.length - 1 && <div className="trajectory-line"></div>}
                </div>
                <EditableOverlay
                  onEdit={() => setEditModal({
                    title: `Edit: ${cert.title}`,
                    fields: certFields,
                    data: cert,
                    onSave: (newData) => updateItem('certifications', idx, newData)
                  })}
                  onDelete={() => deleteItem('certifications', idx)}
                >
                  <div className="trajectory-card glass" style={{ cursor: 'default' }}>
                    <div className="trajectory-card-header">
                      <span className="fest-eyebrow-badge">{cert.badge}</span>
                      <span className="badge-tag accent">VERIFIED CERTIFICATE</span>
                    </div>
                    <h2 className="trajectory-degree" style={{ fontSize: 'clamp(20px, 3.2vw, 26px)' }}>{cert.icon} {cert.title}</h2>
                    <div className="trajectory-institution">📜 {cert.issuer}</div>
                    <p className="trajectory-desc">{cert.desc}</p>
                  </div>
                </EditableOverlay>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Edit Modal */}
      {editModal && (
        <EditModal
          title={editModal.title}
          fields={editModal.fields}
          data={editModal.data}
          onSave={editModal.onSave}
          onClose={() => setEditModal(null)}
        />
      )}

      {/* Sticky Save Bar */}
      <div className="admin-sticky-save">
        <button className="pill primary" onClick={handleGlobalSave} style={{ fontSize: '16px' }}>
          {saveSuccess ? '✓ All Changes Saved!' : '💾 Save All Changes'}
        </button>
        <button className="pill glass" onClick={handleExport}>📥 Export JSON</button>
      </div>
    </>
  )
}
