'use client'

import { 
  SiReact, 
  SiPython, 
  SiTypescript, 
  SiNextdotjs, 
  SiOpenai,
  SiObsidian,
  SiGithub,
  SiNotion,
  SiJavascript
} from 'react-icons/si';
import { TbBrain } from 'react-icons/tb';
import { MCP } from '@lobehub/icons';

const iconMap = {
  react: SiReact,
  python: SiPython,
  typescript: SiTypescript,
  nextjs: SiNextdotjs,
  llm: TbBrain,
  openai: SiOpenai,
  obsidian: SiObsidian,
  github: SiGithub,
  notion: SiNotion,
  javascript: SiJavascript,
  mcp: ({ className }) => <MCP className={className} />
};

interface TechIconsProps {
  technologies: string[];
}

export default function TechIcons({ technologies }: TechIconsProps) {
  return (
    <div className="flex gap-2 items-center">
      {technologies.map((tech) => {
        const Icon = iconMap[tech.toLowerCase()];
        if (!Icon) return null;
        
        return (
          <div 
            key={tech}
            className="p-1 bg-white dark:bg-gray-800 rounded-md shadow-sm hover:shadow-md transition-shadow"
            title={tech.toUpperCase()}
          >
            <Icon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </div>
        );
      })}
    </div>
  );
} 