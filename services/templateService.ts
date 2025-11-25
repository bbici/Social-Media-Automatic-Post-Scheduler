import { PostTemplate } from '../types';

const STORAGE_KEY = 'omnipost_templates';

const DEFAULT_TEMPLATES: PostTemplate[] = [
  { 
    id: 'default-1', 
    name: 'Product Launch 🚀', 
    content: "🚀 Big News! We just launched [Product Name].\n\nIt helps you [Benefit 1] and [Benefit 2].\n\nCheck it out here: [Link]" 
  },
  { 
    id: 'default-2', 
    name: 'Hiring Announcement 📢', 
    content: "We're hiring! 📢\n\nLooking for a [Role] to join our team at [Company].\n\nIf you love [Topic], apply here: [Link]\n\n#Hiring #TechJobs" 
  },
  {
    id: 'default-3',
    name: 'Weekly Insight 💡',
    content: "Here's a lesson I learned this week about [Topic]:\n\n1. [Point 1]\n2. [Point 2]\n3. [Point 3]\n\nWhat's your take? 👇"
  }
];

export const getTemplates = (): PostTemplate[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_TEMPLATES));
    return DEFAULT_TEMPLATES;
  }
  return JSON.parse(stored);
};

export const saveTemplate = (name: string, content: string): PostTemplate => {
  const templates = getTemplates();
  const newTemplate: PostTemplate = {
    id: Date.now().toString(),
    name,
    content
  };
  templates.push(newTemplate);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  return newTemplate;
};

export const deleteTemplate = (id: string): void => {
  const templates = getTemplates().filter(t => t.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
};
