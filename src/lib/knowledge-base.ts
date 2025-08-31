// HANU-YOUTH Knowledge Base
// Comprehensive knowledge repository for the AI assistant

export interface KnowledgeItem {
  id: string
  category: string
  title: string
  content: string
  keywords: string[]
  relevance: number
  lastUpdated: string
}

export const knowledgeBase: KnowledgeItem[] = [
  // HANU-YOUTH Platform Information
  {
    id: 'hanu-platform',
    category: 'platform',
    title: 'HANU-YOUTH Platform Overview',
    content: `HANU-YOUTH (Human-AI for Nexus Unification) is a comprehensive platform designed to empower global youth through AI-powered tools and community collaboration. The platform integrates multiple features including research assistance, gamified learning, virtual economy, team collaboration, and AI-driven insights. Built with Next.js 15 and TypeScript, it provides a modern, responsive interface accessible to youth worldwide.`,
    keywords: ['hanu-youth', 'platform', 'overview', 'ai', 'youth', 'empowerment'],
    relevance: 1.0,
    lastUpdated: '2024-01-01'
  },
  
  // Research and Knowledge
  {
    id: 'research-capabilities',
    category: 'research',
    title: 'AI Research Capabilities',
    content: `The platform's AI research assistant can help users find and analyze academic papers, UN reports, and global research data. It supports multilingual queries, provides structured insights, and offers citation tracking. The research system uses advanced natural language processing to understand complex queries and deliver relevant, accurate information from trusted sources.`,
    keywords: ['research', 'ai', 'academic', 'papers', 'un', 'reports', 'analysis'],
    relevance: 0.9,
    lastUpdated: '2024-01-01'
  },
  
  {
    id: 'un-sdgs',
    category: 'global-agenda',
    title: 'UN Sustainable Development Goals',
    content: `The United Nations Sustainable Development Goals (SDGs) are 17 interconnected global goals designed to be a "blueprint to achieve a better and more sustainable future for all". The SDGs address global challenges including poverty, inequality, climate change, environmental degradation, peace, and justice. HANU-YOUTH helps youth understand and contribute to these goals through education and action-oriented projects.`,
    keywords: ['un', 'sdgs', 'sustainable', 'development', 'goals', 'global', 'youth'],
    relevance: 0.95,
    lastUpdated: '2024-01-01'
  },
  
  // Gamification and Learning
  {
    id: 'gamification-system',
    category: 'learning',
    title: 'Gamified Learning System',
    content: `The platform uses advanced gamification techniques to make learning engaging and effective. Users earn XP points, level up, collect coins and gems, maintain streaks, and unlock achievements. The system includes daily challenges, leaderboards, power-ups, and virtual rewards that motivate continuous learning and participation. Progress is tracked across multiple skill areas and knowledge domains.`,
    keywords: ['gamification', 'learning', 'xp', 'levels', 'achievements', 'streaks', 'rewards'],
    relevance: 0.85,
    lastUpdated: '2024-01-01'
  },
  
  {
    id: 'quiz-system',
    category: 'learning',
    title: 'Adaptive Quiz System',
    content: `The AI-powered quiz system adapts to each user's knowledge level and learning pace. It generates personalized questions, provides immediate feedback, and tracks progress over time. Quizzes cover various topics including global issues, technology, sustainability, and personal development. The system uses machine learning to identify knowledge gaps and recommend targeted learning materials.`,
    keywords: ['quiz', 'adaptive', 'learning', 'assessment', 'ai', 'personalized'],
    relevance: 0.8,
    lastUpdated: '2024-01-01'
  },
  
  // Virtual Economy
  {
    id: 'virtual-economy',
    category: 'economy',
    title: 'Virtual Economy System',
    content: `HANU-YOUTH features a comprehensive virtual economy where users can earn, spend, and trade virtual currencies. Coins are earned through learning activities, while gems are premium rewards. The economy includes a marketplace for digital goods, services, and educational resources. Users can start virtual businesses, invest in projects, and learn financial literacy through practical experience.`,
    keywords: ['economy', 'virtual', 'coins', 'gems', 'marketplace', 'business', 'financial'],
    relevance: 0.75,
    lastUpdated: '2024-01-01'
  },
  
  // Team Collaboration
  {
    id: 'team-collaboration',
    category: 'collaboration',
    title: 'Team Collaboration Features',
    content: `The platform enables youth to form teams for collaborative projects and competitions. Teams can work on research projects, participate in hackathons, organize events, and contribute to global initiatives. Features include shared workspaces, real-time communication, task management, and progress tracking. Teams can compete globally and showcase their achievements.`,
    keywords: ['teams', 'collaboration', 'projects', 'competitions', 'communication', 'workspace'],
    relevance: 0.8,
    lastUpdated: '2024-01-01'
  },
  
  // Innovation and Creativity
  {
    id: 'innovation-lab',
    category: 'innovation',
    title: 'Innovation Lab',
    content: `The Innovation Lab is a creative space where users can develop ideas, prototype solutions, and work on real-world problems. It provides tools for brainstorming, project planning, and prototype development. Users can access AI-powered idea generation, collaborate with mentors, and participate in innovation challenges. The lab focuses on sustainable technology and social innovation.`,
    keywords: ['innovation', 'lab', 'creativity', 'prototyping', 'ideas', 'sustainability'],
    relevance: 0.85,
    lastUpdated: '2024-01-01'
  },
  
  {
    id: 'waste-to-value',
    category: 'innovation',
    title: 'Waste to Value Projects',
    content: `A key focus area is transforming waste materials into valuable products through innovative thinking and technology. Users learn about circular economy principles, sustainable design, and resource optimization. Projects include upcycling electronics, creating art from waste, developing biodegradable materials, and designing waste management systems for communities.`,
    keywords: ['waste', 'value', 'circular', 'economy', 'sustainability', 'upcycling', 'design'],
    relevance: 0.9,
    lastUpdated: '2024-01-01'
  },
  
  // Global Events and Opportunities
  {
    id: 'global-events',
    category: 'events',
    title: 'Global Events and Opportunities',
    content: `The platform aggregates information about global youth events, conferences, competitions, and opportunities. This includes Model United Nations (MUN) conferences, youth summits, hackathons, scholarship opportunities, and volunteer programs. Users can filter events by location, topic, and eligibility, and receive personalized recommendations based on their interests.`,
    keywords: ['events', 'conferences', 'mun', 'summits', 'opportunities', 'scholarships', 'volunteer'],
    relevance: 0.8,
    lastUpdated: '2024-01-01'
  },
  
  // Technology and AI
  {
    id: 'ai-capabilities',
    category: 'technology',
    title: 'AI and Machine Learning Features',
    content: `The platform leverages cutting-edge AI technologies including natural language processing, machine learning, computer vision, and predictive analytics. AI features include intelligent content recommendation, automated translation, voice recognition, sentiment analysis, and personalized learning paths. The system continuously learns from user interactions to improve its capabilities.`,
    keywords: ['ai', 'machine learning', 'nlp', 'analytics', 'automation', 'personalization'],
    relevance: 0.9,
    lastUpdated: '2024-01-01'
  },
  
  // Community and Social Impact
  {
    id: 'community-impact',
    category: 'community',
    title: 'Community and Social Impact',
    content: `HANU-YOUTH fosters a global community of youth committed to positive social change. Users can connect with peers worldwide, share ideas, collaborate on projects, and amplify their impact. The platform tracks collective achievements and showcases success stories. Community features include forums, mentorship programs, and impact measurement tools.`,
    keywords: ['community', 'social', 'impact', 'global', 'mentorship', 'forums', 'change'],
    relevance: 0.85,
    lastUpdated: '2024-01-01'
  },
  
  // Future Development
  {
    id: 'future-roadmap',
    category: 'development',
    title: 'Future Development Roadmap',
    content: `The platform is continuously evolving with planned features including augmented reality experiences, blockchain-based credentialing, advanced AI tutors, virtual reality collaboration spaces, and integration with global educational institutions. The development roadmap is guided by user feedback and emerging technologies to ensure the platform remains at the forefront of educational innovation.`,
    keywords: ['future', 'roadmap', 'development', 'ar', 'vr', 'blockchain', 'evolution'],
    relevance: 0.7,
    lastUpdated: '2024-01-01'
  }
]

// Search function to find relevant knowledge items
export function searchKnowledgeBase(query: string): KnowledgeItem[] {
  const normalizedQuery = query.toLowerCase().trim()
  
  if (!normalizedQuery) return []
  
  return knowledgeBase
    .map(item => {
      let score = 0
      
      // Exact title match
      if (item.title.toLowerCase().includes(normalizedQuery)) {
        score += 10
      }
      
      // Keyword matches
      const keywordMatches = item.keywords.filter(keyword => 
        keyword.toLowerCase().includes(normalizedQuery) || 
        normalizedQuery.includes(keyword.toLowerCase())
      )
      score += keywordMatches.length * 5
      
      // Content matches
      const contentMatches = (item.content.toLowerCase().match(new RegExp(normalizedQuery, 'g')) || []).length
      score += contentMatches * 2
      
      // Category match
      if (item.category.toLowerCase().includes(normalizedQuery)) {
        score += 3
      }
      
      return {
        ...item,
        relevance: score
      }
    })
    .filter(item => item.relevance > 0)
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 5) // Return top 5 results
}

// Get knowledge item by ID
export function getKnowledgeItem(id: string): KnowledgeItem | undefined {
  return knowledgeBase.find(item => item.id === id)
}

// Get knowledge items by category
export function getKnowledgeByCategory(category: string): KnowledgeItem[] {
  return knowledgeBase.filter(item => item.category === category)
}

// Get all categories
export function getKnowledgeCategories(): string[] {
  return [...new Set(knowledgeBase.map(item => item.category))]
}

// Get random knowledge items for featured content
export function getRandomKnowledgeItems(count: number = 3): KnowledgeItem[] {
  const shuffled = [...knowledgeBase].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}