export const SKILL_GROUPS = [
  {
    category: 'Frontend',
    items: ['React', 'React Native', 'Tailwind CSS', 'Framer Motion', 'JavaScript (ES6+)', 'HTML5 / CSS3'],
  },
  {
    category: 'Backend',
    items: ['Python', 'FastAPI', 'Django', 'Node.js', 'REST APIs'],
  },
  {
    category: 'AI / ML',
    items: ['Machine Learning', 'LLM Integration', 'Prompt Engineering', 'LangChain'],
  },
  {
    category: 'Data & Infra',
    items: ['MongoDB', 'PostgreSQL', 'Firebase', 'Git / GitHub', 'Docker'],
  },
]

export const SKILLS_FLAT = SKILL_GROUPS.flatMap((g) => g.items)
