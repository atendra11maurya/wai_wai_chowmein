import { useState } from 'react'

// Reusable editable list item card with delete, expand/collapse
function EditableCard({ item, fields, onChange, onDelete, title }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="admin-card glass">
      <div className="admin-card-header" onClick={() => setExpanded(!expanded)}>
        <div className="admin-card-title">
          <span style={{ fontSize: '18px', marginRight: '8px' }}>{item.icon || '📄'}</span>
          <span>{title || item.title || item.role || item.degree || item.label || 'Untitled'}</span>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            className="admin-delete-btn"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            title="Delete this item"
          >
            🗑️
          </button>
          <span className="admin-chevron">{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {expanded && (
        <div className="admin-card-body">
          {fields.map((field) => {
            if (field.type === 'list') {
              return (
                <EditableListField
                  key={field.key}
                  label={field.label}
                  items={item[field.key] || []}
                  onChange={(newList) => onChange(field.key, newList)}
                />
              )
            }

            return (
              <div key={field.key} className="admin-field">
                <label className="admin-label">{field.label}</label>
                {field.type === 'textarea' ? (
                  <textarea
                    className="form-textarea"
                    rows={3}
                    value={item[field.key] || ''}
                    onChange={(e) => onChange(field.key, e.target.value)}
                  />
                ) : (
                  <input
                    type={field.type || 'text'}
                    className="form-input"
                    value={item[field.key] || ''}
                    onChange={(e) => onChange(field.key, field.type === 'number' ? Number(e.target.value) : e.target.value)}
                  />
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// Editable list of simple strings (tags, skills, detail bullets)
function EditableListField({ label, items, onChange }) {
  const handleItemChange = (idx, val) => {
    const updated = [...items]
    updated[idx] = val
    onChange(updated)
  }
  const handleAdd = () => onChange([...items, ''])
  const handleRemove = (idx) => onChange(items.filter((_, i) => i !== idx))

  return (
    <div className="admin-field">
      <label className="admin-label">{label}</label>
      {items.map((item, idx) => (
        <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
          <input
            type="text"
            className="form-input"
            value={item}
            onChange={(e) => handleItemChange(idx, e.target.value)}
            style={{ flex: 1 }}
          />
          <button
            className="admin-delete-btn"
            onClick={() => handleRemove(idx)}
            title="Remove"
            style={{ minWidth: '36px' }}
          >
            ✕
          </button>
        </div>
      ))}
      <button className="admin-add-btn" onClick={handleAdd} type="button">
        + Add {label.replace(/s$/, '')}
      </button>
    </div>
  )
}

// Section header with add button
function AdminSection({ title, subtitle, icon, count, onAdd, addLabel, children }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="admin-section glass" style={{ marginTop: '20px' }}>
      <div className="admin-section-header" onClick={() => setCollapsed(!collapsed)}>
        <div>
          <h3 className="admin-section-title">{icon} {title} <span className="admin-count">({count})</span></h3>
          {subtitle && <p className="admin-section-subtitle">{subtitle}</p>}
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {onAdd && (
            <button className="admin-add-btn" onClick={(e) => { e.stopPropagation(); onAdd(); }}>
              + {addLabel || 'Add New'}
            </button>
          )}
          <span className="admin-chevron">{collapsed ? '▼' : '▲'}</span>
        </div>
      </div>
      {!collapsed && <div className="admin-section-body">{children}</div>}
    </div>
  )
}

export default function AdminDashboard({ portfolioData, onSave, onLogout }) {
  const [formData, setFormData] = useState(JSON.parse(JSON.stringify(portfolioData)))
  const [saveSuccess, setSaveSuccess] = useState(false)

  // ── Helpers ───────────────────────────────────────────
  const updatePersonal = (field, val) => {
    setFormData(d => ({ ...d, personal: { ...d.personal, [field]: val } }))
  }

  const updateListItem = (listKey, idx, field, val) => {
    setFormData(d => {
      const list = [...d[listKey]]
      list[idx] = { ...list[idx], [field]: val }
      return { ...d, [listKey]: list }
    })
  }

  const deleteListItem = (listKey, idx) => {
    setFormData(d => ({ ...d, [listKey]: d[listKey].filter((_, i) => i !== idx) }))
  }

  const addListItem = (listKey, template) => {
    setFormData(d => ({ ...d, [listKey]: [...d[listKey], template] }))
  }

  const updateSkill = (idx, val) => {
    setFormData(d => {
      const skills = [...d.topSkills]
      skills[idx] = val
      return { ...d, topSkills: skills }
    })
  }

  const deleteSkill = (idx) => {
    setFormData(d => ({ ...d, topSkills: d.topSkills.filter((_, i) => i !== idx) }))
  }

  // ── Save / Export ─────────────────────────────────────
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

  // ── Field definitions ─────────────────────────────────
  const experienceFields = [
    { key: 'role', label: 'Role / Job Title' },
    { key: 'company', label: 'Company / Institution' },
    { key: 'location', label: 'Location' },
    { key: 'period', label: 'Time Period' },
    { key: 'category', label: 'Category (work / ai / research / leadership)' },
    { key: 'icon', label: 'Icon Emoji' },
    { key: 'details', label: 'Key Responsibilities', type: 'list' },
    { key: 'tags', label: 'Tags', type: 'list' }
  ]

  const projectFields = [
    { key: 'title', label: 'Project Title' },
    { key: 'category', label: 'Category' },
    { key: 'desc', label: 'Description', type: 'textarea' },
    { key: 'icon', label: 'Icon Emoji' },
    { key: 'badge', label: 'Badge Tag' },
    { key: 'liveUrl', label: 'Live Demo URL' },
    { key: 'githubUrl', label: 'GitHub Source URL' }
  ]

  const educationFields = [
    { key: 'degree', label: 'Degree Title' },
    { key: 'institution', label: 'Institution Name' },
    { key: 'field', label: 'Field of Study' },
    { key: 'badge', label: 'Badge Tag' },
    { key: 'period', label: 'Time Period' },
    { key: 'desc', label: 'Description', type: 'textarea' }
  ]

  const certificationFields = [
    { key: 'title', label: 'Certification Title' },
    { key: 'issuer', label: 'Issuer / Organization' },
    { key: 'icon', label: 'Icon Emoji' },
    { key: 'badge', label: 'Badge Tag' },
    { key: 'desc', label: 'Description', type: 'textarea' }
  ]

  const testimonialFields = [
    { key: 'quote', label: 'Quote / Feedback', type: 'textarea' },
    { key: 'author', label: 'Author Name' },
    { key: 'title', label: 'Author Title / Designation' },
    { key: 'avatar', label: 'Avatar Emoji' }
  ]

  const achievementFields = [
    { key: 'id', label: 'ID (hcl / iit / iiit / ai-health)' },
    { key: 'title', label: 'Title' },
    { key: 'badge', label: 'Badge Tag' },
    { key: 'icon', label: 'Icon Emoji' },
    { key: 'description', label: 'Description', type: 'textarea' },
    { key: 'actionText', label: 'Button Text' }
  ]

  const metricFields = [
    { key: 'value', label: 'Value (e.g. 12+)' },
    { key: 'label', label: 'Label' },
    { key: 'subtext', label: 'Subtext' }
  ]

  return (
    <section className="events-page">
      {/* Admin Header */}
      <header className="hero glass" style={{ minHeight: 'auto', padding: '28px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <p className="eyebrow">🔐 ADMIN CONTENT MANAGER</p>
            <h1 style={{ fontSize: 'clamp(24px, 4vw, 40px)', margin: '4px 0' }}>Website Admin Panel</h1>
            <p className="intro" style={{ margin: 0, fontSize: '14px' }}>
              Edit every element of the website — personal info, experiences, projects, education, certifications, testimonials, skills, and more.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button className="pill primary" onClick={handleSave}>
              {saveSuccess ? '✓ Changes Saved!' : '💾 Save & Apply'}
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

      {/* ─────── 1. PERSONAL INFO ─────── */}
      <AdminSection title="Personal & Brand Settings" icon="👤" count="1" subtitle="Name, email, WhatsApp, social links, bio, and admin password">
        <div className="admin-grid">
          {[
            { key: 'name', label: 'Full Name' },
            { key: 'shortName', label: 'Short Name (Navbar)' },
            { key: 'avatarInitials', label: 'Avatar Initials' },
            { key: 'email', label: 'Email Address' },
            { key: 'whatsappNumber', label: 'WhatsApp Number (e.g. 919876543210)' },
            { key: 'whatsappMessage', label: 'WhatsApp Default Message' },
            { key: 'linkedin', label: 'LinkedIn URL' },
            { key: 'github', label: 'GitHub URL' },
            { key: 'location', label: 'Location' },
            { key: 'avatarImage', label: 'Avatar Image Path' },
            { key: 'resumeUrl', label: 'Resume File URL' },
            { key: 'adminPassword', label: 'Admin Password' }
          ].map(f => (
            <div key={f.key} className="admin-field">
              <label className="admin-label">{f.label}</label>
              <input
                type="text"
                className="form-input"
                value={formData.personal[f.key] || ''}
                onChange={(e) => updatePersonal(f.key, e.target.value)}
              />
            </div>
          ))}
        </div>

        <div className="admin-field" style={{ marginTop: '12px' }}>
          <label className="admin-label">Title & Tagline</label>
          <input
            type="text"
            className="form-input"
            value={formData.personal.title}
            onChange={(e) => updatePersonal('title', e.target.value)}
          />
        </div>

        <div className="admin-field" style={{ marginTop: '12px' }}>
          <label className="admin-label">Summary / Bio</label>
          <textarea
            className="form-textarea"
            rows={4}
            value={formData.personal.summary}
            onChange={(e) => updatePersonal('summary', e.target.value)}
          />
        </div>
      </AdminSection>

      {/* ─────── 2. IMPACT METRICS ─────── */}
      <AdminSection
        title="Impact Metrics"
        icon="📊"
        count={formData.impactMetrics.length}
        subtitle="Homepage statistics counters"
        onAdd={() => addListItem('impactMetrics', { value: '0+', label: 'New Metric', subtext: 'Description' })}
        addLabel="Add Metric"
      >
        {formData.impactMetrics.map((metric, idx) => (
          <EditableCard
            key={idx}
            item={metric}
            title={`${metric.value} — ${metric.label}`}
            fields={metricFields}
            onChange={(field, val) => updateListItem('impactMetrics', idx, field, val)}
            onDelete={() => deleteListItem('impactMetrics', idx)}
          />
        ))}
      </AdminSection>

      {/* ─────── 3. TOP SKILLS ─────── */}
      <AdminSection
        title="Top Skills"
        icon="⚡"
        count={formData.topSkills.length}
        subtitle="Skills displayed across the portfolio"
        onAdd={() => setFormData(d => ({ ...d, topSkills: [...d.topSkills, 'New Skill'] }))}
        addLabel="Add Skill"
      >
        {formData.topSkills.map((skill, idx) => (
          <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <input
              type="text"
              className="form-input"
              value={skill}
              onChange={(e) => updateSkill(idx, e.target.value)}
              style={{ flex: 1 }}
            />
            <button className="admin-delete-btn" onClick={() => deleteSkill(idx)}>🗑️</button>
          </div>
        ))}
      </AdminSection>

      {/* ─────── 4. TOP ACHIEVEMENTS ─────── */}
      <AdminSection
        title="Top Achievements"
        icon="🏆"
        count={formData.topAchievements.length}
        subtitle="Flagship highlights shown on the landing page"
        onAdd={() => addListItem('topAchievements', { id: 'new', title: 'New Achievement', badge: 'NEW', icon: '🌟', description: 'Description here', actionText: 'View ↗' })}
        addLabel="Add Achievement"
      >
        {formData.topAchievements.map((item, idx) => (
          <EditableCard
            key={idx}
            item={item}
            fields={achievementFields}
            onChange={(field, val) => updateListItem('topAchievements', idx, field, val)}
            onDelete={() => deleteListItem('topAchievements', idx)}
          />
        ))}
      </AdminSection>

      {/* ─────── 5. EXPERIENCES ─────── */}
      <AdminSection
        title="Work & Research Experiences"
        icon="💼"
        count={formData.experiences.length}
        subtitle="All internships, jobs, and ambassador roles"
        onAdd={() => addListItem('experiences', { id: Date.now(), role: 'New Role', company: 'Company', location: 'Location', period: 'Month Year – Month Year', category: 'work', icon: '💼', details: ['Description'], tags: ['Tag'] })}
        addLabel="Add Experience"
      >
        {formData.experiences.map((exp, idx) => (
          <EditableCard
            key={exp.id || idx}
            item={exp}
            title={`${exp.role} @ ${exp.company}`}
            fields={experienceFields}
            onChange={(field, val) => updateListItem('experiences', idx, field, val)}
            onDelete={() => deleteListItem('experiences', idx)}
          />
        ))}
      </AdminSection>

      {/* ─────── 6. EDUCATION ─────── */}
      <AdminSection
        title="Education"
        icon="🎓"
        count={formData.education.length}
        subtitle="Academic degrees and diplomas"
        onAdd={() => addListItem('education', { badge: 'DEGREE · INSTITUTION', degree: 'New Degree', field: 'FIELD', institution: 'Institution Name', period: 'Year – Year', desc: 'Description' })}
        addLabel="Add Education"
      >
        {formData.education.map((edu, idx) => (
          <EditableCard
            key={idx}
            item={edu}
            title={edu.degree}
            fields={educationFields}
            onChange={(field, val) => updateListItem('education', idx, field, val)}
            onDelete={() => deleteListItem('education', idx)}
          />
        ))}
      </AdminSection>

      {/* ─────── 7. PROJECTS ─────── */}
      <AdminSection
        title="Featured Projects"
        icon="🚀"
        count={formData.projects.length}
        subtitle="Projects with live demo and source code links"
        onAdd={() => addListItem('projects', { title: 'New Project', category: 'Category', desc: 'Description', icon: '📁', badge: 'TAG', liveUrl: '', githubUrl: '' })}
        addLabel="Add Project"
      >
        {formData.projects.map((proj, idx) => (
          <EditableCard
            key={idx}
            item={proj}
            fields={projectFields}
            onChange={(field, val) => updateListItem('projects', idx, field, val)}
            onDelete={() => deleteListItem('projects', idx)}
          />
        ))}
      </AdminSection>

      {/* ─────── 8. CERTIFICATIONS ─────── */}
      <AdminSection
        title="Certifications"
        icon="📜"
        count={formData.certifications.length}
        subtitle="Verified certificates and credentials"
        onAdd={() => addListItem('certifications', { title: 'New Certification', issuer: 'Issuer', icon: '📜', badge: 'TAG', desc: 'Description' })}
        addLabel="Add Certification"
      >
        {formData.certifications.map((cert, idx) => (
          <EditableCard
            key={idx}
            item={cert}
            fields={certificationFields}
            onChange={(field, val) => updateListItem('certifications', idx, field, val)}
            onDelete={() => deleteListItem('certifications', idx)}
          />
        ))}
      </AdminSection>

      {/* ─────── 9. TESTIMONIALS ─────── */}
      <AdminSection
        title="Testimonials & Recommendations"
        icon="⭐"
        count={formData.testimonials.length}
        subtitle="Quotes from mentors, managers, and colleagues"
        onAdd={() => addListItem('testimonials', { quote: 'New testimonial quote here...', author: 'Author Name', title: 'Designation', avatar: '⭐' })}
        addLabel="Add Testimonial"
      >
        {formData.testimonials.map((test, idx) => (
          <EditableCard
            key={idx}
            item={test}
            title={`"${test.quote.substring(0, 50)}..." — ${test.author}`}
            fields={testimonialFields}
            onChange={(field, val) => updateListItem('testimonials', idx, field, val)}
            onDelete={() => deleteListItem('testimonials', idx)}
          />
        ))}
      </AdminSection>

      {/* Sticky bottom save bar */}
      <div className="admin-sticky-save">
        <button className="pill primary" onClick={handleSave} style={{ fontSize: '16px' }}>
          {saveSuccess ? '✓ All Changes Saved!' : '💾 Save All Changes'}
        </button>
        <button className="pill glass" onClick={handleDownloadJSON}>📥 Export JSON</button>
      </div>
    </section>
  )
}
