export const portfolioData = {
  // Personal & Brand Information
  personal: {
    name: 'Abhijeet Vardhan',
    shortName: 'abhijeet.v',
    avatarInitials: 'AV',
    avatarImage: '/abhijeet_avatar.png',
    title: 'Analyst @ HCLTech | Summer Intern @ IIT Jammu | AI & Data Science Scholar @ IIIT Delhi',
    location: 'New Delhi, Delhi, India',
    email: 'abhijeetvardhan6881@gmail.com',
    whatsappNumber: '919876543210', // Replace with buyer's WhatsApp number (e.g., 919876543210)
    whatsappMessage: 'Hi Abhijeet, I saw your portfolio and would like to connect!',
    linkedin: 'https://www.linkedin.com/in/abhijeetvardhan-98276222b',
    github: 'https://github.com/abhijeetvardhan',
    resumeUrl: '/Abhijeet_Vardhan_Resume.pdf', // Path in public folder or Google Drive link
    summary: `Enthusiastic and highly motivated individual with a diverse background in internships across various domains, including AI, blockchain, open source contribution, energy saving, and leadership. Passionate about tackling real-world challenges and finding innovative solutions through technology.`
  },

  // Key Statistics & Impact Metrics (Displayed on Landing Page)
  impactMetrics: [
    { label: 'Experience Roles', value: '12+', subtext: 'Internships & Corporate' },
    { label: 'Premier Institutions', value: '3+', subtext: 'IIT Jammu, IIT Ropar & IIIT Delhi' },
    { label: 'Flagship Projects', value: '4+', subtext: 'Healthcare AI & Web Tech' },
    { label: 'Students Mentored', value: '1,000+', subtext: 'Across Ambassador Programs' }
  ],

  // Top Skills
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

  // Client / Boss / Mentor Testimonials
  testimonials: [
    {
      quote: "Abhijeet displayed exceptional technical curiosity and commitment during research projects. His ability to connect AI theory with practical implementations is commendable.",
      author: "Research Mentor",
      title: "IIT Research Faculty / Project Supervisor",
      avatar: "🏛️"
    },
    {
      quote: "Strong analytical mindset, quick adaptability in application engineering, and great team collaboration skills during his software development responsibilities.",
      author: "Senior Manager",
      title: "HCLTech Technical Team",
      avatar: "💼"
    },
    {
      quote: "Extremely proactive in driving campus outreach and student engagement initiatives across IITM Research Park and university networks.",
      author: "Program Coordinator",
      title: "GUVI Geek Networks & Outreach",
      avatar: "🚀"
    }
  ],

  // Certifications
  certifications: [
    { title: 'Product Matters 3.0', issuer: 'Industry Product Certification', icon: '📦', badge: 'PRODUCT STRATEGY & ROADMAPPING', desc: 'Product Strategy, roadmap planning, user research, and Agile product development frameworks.' },
    { title: 'Generative AI for Everyone', issuer: 'DeepLearning.AI', icon: '🤖', badge: 'DEEPLEARNING.AI · GEN AI', desc: 'Foundations of Large Language Models (LLMs), prompt engineering techniques, AI ethics, and real-world GenAI deployment.' },
    { title: 'Breast Cancer Prediction using SVM', issuer: 'Machine Learning Research', icon: '🩺', badge: 'SUPERVISED ML · HEALTHCARE AI', desc: 'Supervised Learning classification model using Support Vector Machines for clinical medical diagnostics.' },
    { title: 'Strategy and Sustainability', issuer: 'Executive Certification', icon: '🌿', badge: 'SUSTAINABLE TECH & ESG', desc: 'Sustainable business practices, ESG strategies, and eco-friendly technology implementation.' },
    { title: 'Global Environmental Management', issuer: 'International Certification', icon: '🌍', badge: 'ENVIRONMENTAL POLICY', desc: 'Environmental policy, clean energy transition, and global sustainability systems monitoring.' }
  ],

  // Work & Research Experiences
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

  // Educational Qualifications
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

  // Featured Projects
  projects: [
    {
      title: 'Breast Cancer Prediction using Support Vector Machines',
      category: 'AI & Healthcare ML Project',
      desc: 'Supervised Machine Learning classification pipeline built with Python and Scikit-learn using Support Vector Classifier (SVC) to detect malignant tumors with high statistical accuracy.',
      icon: '🩺',
      badge: 'HEALTHCARE AI',
      liveUrl: 'https://github.com/abhijeetvardhan', // Link to live demo or notebook
      githubUrl: 'https://github.com/abhijeetvardhan'
    },
    {
      title: 'Energy Hybrid System Research @ IIT Ropar AWaDH',
      category: 'Clean Energy & IoT Systems',
      desc: 'Research project analyzing hybrid renewable energy grids, battery management systems, and IoT data telemetry for clean energy conversion.',
      icon: '⚡',
      badge: 'IIT ROPAR RESEARCH',
      liveUrl: '',
      githubUrl: 'https://github.com/abhijeetvardhan'
    },
    {
      title: 'Full-Stack Web & Debugging Architecture @ Code Alpha & HCLTech',
      category: 'Web Development & Application Engineering',
      desc: 'Responsive web applications engineered with modern JavaScript frameworks, API integrations, and robust debugging tools for client services.',
      icon: '🌐',
      badge: 'FULL-STACK WEB',
      liveUrl: 'https://github.com/abhijeetvardhan',
      githubUrl: 'https://github.com/abhijeetvardhan'
    },
    {
      title: 'Pan-India Student Upskilling & Ambassador Programs',
      category: 'Tech Outreach & Community Leadership',
      desc: 'Organized tech skill initiatives reaching over 1k+ students across GUVI IITM Research Park, IIM Bangalore Vista, and IEEE IGDTUW.',
      icon: '👥',
      badge: 'COMMUNITY & LEADERSHIP',
      liveUrl: '',
      githubUrl: 'https://github.com/abhijeetvardhan'
    }
  ]
}
