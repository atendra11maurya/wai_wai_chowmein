import { useState, useEffect } from 'react'
import './index.css'

const resumeData = {
  name: 'Abhijeet Vardhan',
  title: 'Analyst @ HCLTech | Summer Intern @ IIT Jammu | AI & Data Science Scholar @ IIIT Delhi',
  location: 'New Delhi, Delhi, India',
  email: 'abhijeetvardhan6881@gmail.com',
  linkedin: 'https://www.linkedin.com/in/abhijeetvardhan-98276222b',
  summary: `Enthusiastic and highly motivated individual with a diverse background in internships across various domains, including AI, blockchain, open source contribution, energy saving, and leadership. Passionate about tackling real-world challenges and finding innovative solutions through technology.`,

  topSkills: [
    'AI & Machine Learning',
    'Python & Data Science',
    'Web Development',
    'Project Management',
    'Blockchain Fundamentals',
    'Energy Hybrid Systems',
    'Healthcare Tech Projects',
    'Open Source & Leadership'
  ],

  // Top Flagship Achievements shown on Landing Page ONLY
  topAchievements: [
    {
      id: 'hcl',
      title: 'HCLTech — Analyst (Graduate Trainee)',
      badge: 'CAREER MILESTONE · NOIDA',
      icon: '💼',
      description: 'Gaining hands-on software development and IT services experience, building real-world applications, debugging, and collaborating with cross-functional technical teams.',
      actionText: 'View Details ↗'
    },
    {
      id: 'iit',
      title: 'IIT Jammu & IIT Ropar Research Internships',
      badge: 'TOP TIER RESEARCH',
      icon: '🏛️',
      description: 'Engaged in technical innovation at IIT Jammu (Career Development Services) and Energy Hybrid Systems research at iHub - AWaDH @ IIT Ropar.',
      actionText: 'View Research ↗'
    },
    {
      id: 'iiit',
      title: 'IIIT Delhi AI & Data Science Scholar',
      badge: 'POST-GRADUATE DIPLOMA',
      icon: '🧠',
      description: 'Post-Graduate research in Data Science in Health and Climate Change for Social Impact at Indraprastha Institute of Information Technology, Delhi.',
      actionText: 'View Education ↗'
    },
    {
      id: 'ai-health',
      title: 'Breast Cancer Prediction using SVM (Healthcare AI)',
      badge: 'FLAGSHIP PROJECT',
      icon: '🩺',
      description: 'Supervised Machine Learning classification model built with Python and Scikit-learn using Support Vector Machines (SVM) for diagnostic healthcare analysis.',
      actionText: 'View Project ↗'
    }
  ],

  certifications: [
    { title: 'Product Matters 3.0', issuer: 'Industry Product Certification', icon: '📦', badge: 'PRODUCT STRATEGY & ROADMAPPING', desc: 'Product Strategy, roadmap planning, user research, and Agile product development frameworks.' },
    { title: 'Generative AI for Everyone', issuer: 'DeepLearning.AI', icon: '🤖', badge: 'DEEPLEARNING.AI · GEN AI', desc: 'Foundations of Large Language Models (LLMs), prompt engineering techniques, AI ethics, and real-world GenAI deployment.' },
    { title: 'Breast Cancer Prediction using SVM', issuer: 'Machine Learning Research', icon: '🩺', badge: 'SUPERVISED ML · HEALTHCARE AI', desc: 'Supervised Learning classification model using Support Vector Machines for clinical medical diagnostics.' },
    { title: 'Strategy and Sustainability', issuer: 'Executive Certification', icon: '🌿', badge: 'SUSTAINABLE TECH & ESG', desc: 'Sustainable business practices, ESG strategies, and eco-friendly technology implementation.' },
    { title: 'Global Environmental Management', issuer: 'International Certification', icon: '🌍', badge: 'ENVIRONMENTAL POLICY', desc: 'Environmental policy, clean energy transition, and global sustainability systems monitoring.' }
  ],

  experiences: [
    {
      id: 1,
      role: 'Analyst (Graduate Trainee)',
      company: 'HCLTech',
      location: 'Noida, India',
      period: 'July 2025 – Present',
      category: 'work',
      icon: '💼',
      details: [
        'Joined HCLTech as a Graduate Trainee gaining hands-on experience in software development and IT services.',
        'Worked on real-world projects involving application development, debugging, and software maintenance.',
        'Collaborated with cross-functional teams to enhance technical and problem-solving skills.'
      ],
      tags: ['Software Dev', 'IT Services', 'App Development', 'Debugging']
    },
    {
      id: 2,
      role: 'Artificial Intelligence Intern',
      company: 'Sabudh Foundation',
      location: 'Delhi, India',
      period: 'January 2025 – June 2025',
      category: 'ai',
      icon: '🧠',
      details: [
        'Executed Machine Learning models and data science algorithms for social impact applications.',
        'Analyzed data pipelines, model optimization, and feature engineering for AI solutions.'
      ],
      tags: ['AI', 'Machine Learning', 'Data Science', 'Python']
    },
    {
      id: 3,
      role: 'Python & Machine Learning Intern',
      company: 'Training and Placement Cell, Department of Management, IGDTUW',
      location: 'Delhi, India',
      period: 'June 2024 – July 2024',
      category: 'ai',
      icon: '🎓',
      details: [
        'Successfully completed intensive 8-week Summer Internship program on Python and Machine Learning.',
        'Demonstrated exemplary dedication, hands-on algorithm implementation, and predictive modeling.'
      ],
      tags: ['Python', 'ML Algorithms', 'Predictive Modeling']
    },
    {
      id: 4,
      role: 'Summer Intern',
      company: 'Career Development Services, IIT Jammu',
      location: 'Jammu & Kashmir, India',
      period: 'May 2024 – July 2024',
      category: 'research',
      icon: '🏛️',
      details: [
        'Engaged in technical research projects, campus development initiatives, and skill mentorship at IIT Jammu.'
      ],
      tags: ['IIT Jammu', 'Research', 'Tech Innovation']
    },
    {
      id: 5,
      role: 'Intern',
      company: 'your-space',
      location: 'Delhi, India',
      period: 'April 2024 – June 2024',
      category: 'work',
      icon: '🏢',
      details: [
        'Contributed to operational workflows, digital asset management, and student housing platform services.'
      ],
      tags: ['Operations', 'Platform Management', 'Growth']
    },
    {
      id: 6,
      role: 'Campus Ambassador',
      company: 'GUVI Geek Networks, IITM Research Park',
      location: 'Chennai, Tamil Nadu, India',
      period: 'September 2023 – December 2023',
      category: 'leadership',
      icon: '🚀',
      details: [
        'Promoted GUVI tech courses and upskilling programs to fellow students to foster tech skill growth.',
        'Organized webinars, student outreach, and career development initiatives in collaboration with IITM Research Park.'
      ],
      tags: ['IITM Research Park', 'Tech Ambassador', 'Student Outreach']
    },
    {
      id: 7,
      role: 'Campus Ambassador',
      company: "IIM Bangalore's Vista",
      location: 'India',
      period: 'June 2023 – August 2023',
      category: 'leadership',
      icon: '🌟',
      details: [
        "Led campus marketing and student engagement for IIM Bangalore's flagship annual business fest Vista."
      ],
      tags: ['IIM Bangalore', 'Marketing', 'Leadership']
    },
    {
      id: 8,
      role: 'Blockchain Intern',
      company: 'IEEE IGDTUW',
      location: 'Delhi, India',
      period: 'June 2023 – July 2023',
      category: 'research',
      icon: '⛓️',
      details: [
        'Researched decentralized ledgers, smart contracts, and cryptographic security protocols under IEEE student chapter.'
      ],
      tags: ['Blockchain', 'IEEE', 'Smart Contracts']
    },
    {
      id: 9,
      role: 'Energy Hybrid System Research Intern',
      company: 'iHub - AWaDH @ IIT Ropar',
      location: 'Delhi / Ropar, India',
      period: 'May 2023 – July 2023',
      category: 'research',
      icon: '⚡',
      details: [
        'Completed research internship on Energy Hybrid Systems at IIT Ropar iHub AWaDH.',
        'Gained hands-on skills in clean energy monitoring, hardware-software integration, and sustainable tech.'
      ],
      tags: ['IIT Ropar', 'Energy Hybrid Systems', 'Clean Tech']
    },
    {
      id: 10,
      role: 'Web Developer',
      company: 'Code Alpha',
      location: 'India',
      period: 'March 2023 – April 2023',
      category: 'work',
      icon: '💻',
      details: [
        'Designed, recommended, and pitched website feature improvements for existing and new platforms.',
        'Troubleshot bugs in web-based applications and provided technical support for web systems.'
      ],
      tags: ['Web Development', 'Frontend UI', 'Debugging', 'Tech Support']
    },
    {
      id: 11,
      role: 'Project Intern',
      company: 'E-Cell NITK',
      location: 'India',
      period: 'December 2022 – January 2023',
      category: 'leadership',
      icon: '💡',
      details: [
        'Supported startup pitch decks, incubation events, and entrepreneurship initiatives at NITK Surathkal E-Cell.'
      ],
      tags: ['E-Cell NITK', 'Entrepreneurship', 'Project Planning']
    },
    {
      id: 12,
      role: 'Fresher Ambassador',
      company: 'Mood Indigo IIT Bombay',
      location: 'India',
      period: 'September 2022 – November 2022',
      category: 'leadership',
      icon: '🎨',
      details: [
        'Represented Asia\'s largest college cultural festival Mood Indigo IIT Bombay across Delhi university circuits.'
      ],
      tags: ['IIT Bombay', 'Mood Indigo', 'Public Relations']
    }
  ],

  education: [
    {
      badge: 'POSTGRADUATE DIPLOMA · IIIT DELHI',
      degree: 'Post-Graduate Diploma in Data Science in Health & Climate Change for Social Impact',
      field: 'AI & DATA SCIENCE RESEARCH',
      institution: 'Indraprastha Institute of Information Technology (IIIT), Delhi',
      period: 'August 2025 – August 2026',
      desc: 'Specialized postgraduate research program integrating Machine Learning models, health data analytics, predictive epidemiology, and climate impact forecasting.'
    },
    {
      badge: 'BACHELOR DEGREE · UNIVERSITY OF DELHI',
      degree: "Bachelor's Degree in Computer Science",
      field: 'B.Sc. COMPUTER SCIENCE',
      institution: 'University of Delhi',
      period: 'June 2022 – June 2026',
      desc: 'Foundational degree coursework covering Data Structures & Algorithms, Object-Oriented Programming, Database Management Systems, Web Development, and Software Engineering.'
    }
  ],

  projects: [
    {
      title: 'Breast Cancer Prediction using Support Vector Machines',
      category: 'AI & Healthcare ML Project',
      desc: 'Supervised Machine Learning classification pipeline built with Python and Scikit-learn using Support Vector Classifier (SVC) to detect malignant tumors with high statistical accuracy.',
      icon: '🩺',
      badge: 'HEALTHCARE AI'
    },
    {
      title: 'Energy Hybrid System Research @ IIT Ropar AWaDH',
      category: 'Clean Energy & IoT Systems',
      desc: 'Research project analyzing hybrid renewable energy grids, battery management systems, and IoT data telemetry for clean energy conversion.',
      icon: '⚡',
      badge: 'IIT ROPAR RESEARCH'
    },
    {
      title: 'Full-Stack Web & Debugging Architecture @ Code Alpha & HCLTech',
      category: 'Web Development & Application Engineering',
      desc: 'Responsive web applications engineered with modern JavaScript frameworks, API integrations, and robust debugging tools for client services.',
      icon: '🌐',
      badge: 'FULL-STACK WEB'
    },
    {
      title: 'Pan-India Student Upskilling & Ambassador Programs',
      category: 'Tech Outreach & Community Leadership',
      desc: 'Organized tech skill initiatives reaching over 1k+ students across GUVI IITM Research Park, IIM Bangalore Vista, and IEEE IGDTUW.',
      icon: '👥',
      badge: 'COMMUNITY & LEADERSHIP'
    }
  ]
}

function Dialog({ name, customData, onClose }) {
  const [copied, setCopied] = useState(false)

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(resumeData.email)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
        <p className="eyebrow">{customData?.eyebrow || 'Connect & Collaborate'}</p>
        <h2 id="dialog-title">{customData?.title || 'Get in touch.'}</h2>
        <p>{customData?.text || `Feel free to reach out to Abhijeet Vardhan for software development opportunities, AI projects, or research collaborations.`}</p>

        <div style={{ marginTop: '16px', background: 'rgba(2, 132, 199, 0.06)', padding: '14px', borderRadius: '16px', border: '1px solid rgba(2, 132, 199, 0.15)' }}>
          <p style={{ margin: '0 0 6px', fontSize: '12px', fontWeight: '700', color: '#0284c7', fontFamily: 'DM Mono, monospace' }}>DIRECT EMAIL</p>
          <p style={{ margin: 0, fontWeight: '700', color: '#0a2540', fontSize: '15px' }}>{resumeData.email}</p>
        </div>

        <div className="modal-row">
          <button className="pill primary" onClick={handleCopyEmail}>
            {copied ? '✓ Email Copied!' : 'Copy Email 📋'}
          </button>
          <a
            className="pill linkedin"
            href={resumeData.linkedin}
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

export default function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [activeDialog, setActiveDialog] = useState(null)
  const [customDialogData, setCustomDialogData] = useState(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [filter, setFilter] = useState('all')

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
    ? resumeData.experiences
    : resumeData.experiences.filter(exp => exp.category === filter)

  return (
    <div className="shell min-h-screen">
      {/* Translucent Glass Navigation Bar */}
      <nav className="glass navbar">
        <a className="brand" href="#home" onClick={(e) => { e.preventDefault(); navigateToTab('home'); }}>
          <div className="brand-avatar">AV</div>
          <span>abhijeet<span className="brand-accent">.</span>v</span>
        </a>

        <div className="nav-links">
          <button className={`pill ${activeTab === 'home' ? 'primary' : 'glass'}`} onClick={() => navigateToTab('home')}>Home</button>
          <button className={`pill ${activeTab === 'experience' ? 'primary' : 'glass'}`} onClick={() => navigateToTab('experience')}>Experience ({resumeData.experiences.length})</button>
          <button className={`pill ${activeTab === 'projects' ? 'primary' : 'glass'}`} onClick={() => navigateToTab('projects')}>Projects ({resumeData.projects.length})</button>
          <button className={`pill ${activeTab === 'education' ? 'primary' : 'glass'}`} onClick={() => navigateToTab('education')}>Education ({resumeData.education.length})</button>
          <button className={`pill ${activeTab === 'skills' ? 'primary' : 'glass'}`} onClick={() => navigateToTab('skills')}>Skills & Certs</button>
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
          <button className={`pill ${activeTab === 'experience' ? 'primary' : 'glass'}`} onClick={() => navigateToTab('experience')}>Experience ({resumeData.experiences.length})</button>
          <button className={`pill ${activeTab === 'projects' ? 'primary' : 'glass'}`} onClick={() => navigateToTab('projects')}>Projects ({resumeData.projects.length})</button>
          <button className={`pill ${activeTab === 'education' ? 'primary' : 'glass'}`} onClick={() => navigateToTab('education')}>Education ({resumeData.education.length})</button>
          <button className={`pill ${activeTab === 'skills' ? 'primary' : 'glass'}`} onClick={() => navigateToTab('skills')}>Skills & Certs</button>
          <button className="pill primary cta" onClick={() => openDialog()}>Contact ↗</button>
        </div>
      </nav>

      {/* Main View Router */}
      <main id="top">
        {activeTab === 'home' && (
          <>
            {/* Landing Hero Section */}
            <section className="hero glass">
              <div className="hero-content-layout">
                <div className="hero-text-block">
                  <h1 className="hero-name">Abhijeet Vardhan</h1>
                  <div className="hero-role-title">
                    <span>Analyst @ HCLTech</span>
                  </div>
                  <div className="hero-bio">
                    {/* Space reserved for custom bio text */}
                  </div>
                </div>
                <div className="hero-avatar-wrapper">
                  <img src="/abhijeet_avatar.png" alt="Abhijeet Vardhan 3D Avatar" className="hero-avatar-3d" />
                </div>
              </div>
            </section>

            {/* Standalone Equal Full-Width Hero Action Buttons */}
            <div className="hero-actions-standalone">
              <button className="pill hero-primary-btn" onClick={() => navigateToTab('experience')}>Explore 12+ Experiences →</button>
              <a className="pill linkedin" href={resumeData.linkedin} target="_blank" rel="noopener noreferrer">
                Connect on LinkedIn ↗
              </a>
              <button className="pill glass" onClick={() => openDialog()}>
                Get in Touch ✉️
              </button>
            </div>


            {/* LANDING PAGE EXCLUSIVE: Biggest Achievements Spotlight (.fest-container-card glass) */}
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
                {resumeData.topAchievements.map((item) => (
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

            {/* Call to Action Banner on Home */}
            <section className="wide glass">
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
              <p className="eyebrow">Professional Track Record · 12 Roles</p>
              <h1 style={{ fontSize: 'clamp(32px, 5.5vw, 56px)' }}>Work & Research Internships.</h1>
              <p className="intro" style={{ marginTop: '12px' }}>
                Complete breakdown of my 12 internships, software engineering positions, IIT research projects, and campus ambassador roles.
              </p>

              <div className="filter-bar">
                <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
                  All Experience ({resumeData.experiences.length})
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

                    <ul style={{ margin: '0 0 16px', paddingLeft: '20px', color: '#cbd5e1', fontSize: '14px', lineHeight: '1.65' }}>
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
                {resumeData.projects.map((proj, idx) => (
                  <div key={idx} className="fest-row-card glass" onClick={() => openDialog({ eyebrow: proj.badge, title: proj.title, text: proj.desc })}>
                    <div className="row-card-content">
                      <span className="row-card-icon">{proj.icon}</span>
                      <div className="row-card-info">
                        <span className="eyebrow" style={{ fontSize: '10px', marginBottom: '2px', display: 'inline-block' }}>{proj.badge}</span>
                        <h3>{proj.title}</h3>
                        <p>{proj.desc}</p>
                      </div>
                    </div>
                    <div className="row-card-action">
                      <button className="pill primary row-action-btn" onClick={(e) => { e.stopPropagation(); openDialog({ eyebrow: proj.badge, title: proj.title, text: proj.desc }); }}>
                        Project Details ↗
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
              {resumeData.education.map((edu, idx) => (
                <div key={idx} className="trajectory-step-container">
                  <div className="trajectory-node-column">
                    <div className="trajectory-dot"></div>
                    {idx < resumeData.education.length - 1 && <div className="trajectory-line"></div>}
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
                {resumeData.certifications.map((cert, idx) => (
                  <div key={idx} className="trajectory-step-container">
                    <div className="trajectory-node-column">
                      <div className="trajectory-dot"></div>
                      {idx < resumeData.certifications.length - 1 && <div className="trajectory-line"></div>}
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
        <span>© 2026 ABHIJEET VARDHAN · NEW DELHI, INDIA</span>
        <span>AI · RESEARCH · SOFTWARE DEVELOPMENT</span>
      </footer>

      {/* Contact Dialog */}
      {activeDialog && (
        <Dialog
          name={activeDialog}
          customData={customDialogData}
          onClose={() => setActiveDialog(null)}
        />
      )}
    </div>
  )
}
