import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Search, 
  LayoutGrid,
  Sparkles,
  Hammer,
  Wrench,
  Scissors
} from 'lucide-react';
import { SKILLS, SKILL_SECTIONS, SKILL_IMAGES } from '../constants';

import { PageContainer, PageHeader } from '../components/standard/AppShell';
import { LoadingState, EmptyState } from '../components/standard/StateComponents';

const CATEGORY_ICONS: Record<string, any> = {
  all: LayoutGrid,
  household: Sparkles,
  construction: Hammer,
  technical: Wrench,
  lifestyle: Scissors
};

export default function SkillExplorer() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredSkills = SKILLS.filter(s => {
    const matchesSearch = s.toLowerCase().includes(search.toLowerCase());
    if (activeCategory === 'all') return matchesSearch;
    const section = SKILL_SECTIONS.find(sec => sec.id === activeCategory);
    return matchesSearch && section?.skills.includes(s);
  });

  return (
    <PageContainer>
      <PageHeader 
        title="Find an Expert." 
        subtitle="Browse categories or search for specific skills."
      />

      <div className="space-y-8 pb-32">
        {/* Search Bar */}
        <div className="bg-white shadow-sm border border-stone-100 rounded-[32px] p-2 flex items-center px-6 gap-4 mx-2">
          <Search className="w-6 h-6 text-stone-300" />
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search expertise..." 
            className="flex-1 bg-transparent border-none outline-none py-4 text-xl font-black serif italic placeholder:text-stone-200"
          />
        </div>

        {/* Category Filter Pills */}
        {!search && (
          <div className="flex gap-4 overflow-x-auto pb-4 px-4 scrollbar-hide -mx-6">
            {[{ id: 'all', title: 'All' }, ...SKILL_SECTIONS].map(c => {
               const Icon = CATEGORY_ICONS[c.id];
               const isActive = activeCategory === c.id;
               return (
                 <button 
                   key={c.id}
                   onClick={() => setActiveCategory(c.id)}
                   className={`flex-shrink-0 flex flex-col items-center gap-3 px-6 py-4 rounded-[28px] transition-all min-w-[100px] border shadow-sm ${isActive ? 'bg-brand-indigo text-white border-transparent scale-105 shadow-xl' : 'bg-white text-stone-500 border-stone-100 hover:border-brand-red/20'}`}
                 >
                   <Icon className={`w-6 h-6 ${isActive ? 'text-brand-gold' : 'text-stone-300'}`} />
                   <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">{c.title.split(' &')[0]}</span>
                 </button>
               );
            })}
          </div>
        )}

        {filteredSkills.length === 0 ? (
          <EmptyState 
            message="No matches found in the mesh. Try another keyword." 
            icon={Search}
          />
        ) : (
          <div className="space-y-12">
            {/* If a category is selected or searching, show a grid */}
            {(activeCategory !== 'all' || search) ? (
              <div className="grid grid-cols-2 gap-6 px-2">
                {filteredSkills.map((skill, i) => (
                  <SkillCard key={skill} skill={skill} index={i} />
                ))}
              </div>
            ) : (
              /* If "All" is selected and not searching, show sections with carousels */
              SKILL_SECTIONS.map((section) => (
                <section key={section.id} className="space-y-6">
                  <div className="flex justify-between items-end px-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-red leading-none">Category</p>
                      <h3 className="text-2xl font-black tracking-tight serif leading-none">{section.title}</h3>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 overflow-x-auto pb-8 px-4 scrollbar-hide snap-x snap-mandatory -mx-6">
                    {section.skills.map((skill, i) => (
                      <div key={skill} className="snap-center">
                        <SkillCard skill={skill} index={i} isCarouselItem />
                      </div>
                    ))}
                  </div>
                </section>
              ))
            )}
          </div>
        )}
      </div>
    </PageContainer>
  );
}

function SkillCard({ skill, index, isCarouselItem = false }: { skill: string, index: number, isCarouselItem?: boolean, key?: string | number }) {
  const navigate = useNavigate();
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => navigate(`/smartphone/category/${encodeURIComponent(skill)}`)}
      className={`${isCarouselItem ? 'w-48 h-48 sm:w-64 sm:h-64' : 'aspect-square'} bg-stone-50 rounded-[40px] shadow-sm overflow-hidden group active:scale-95 transition-all border border-white relative`}
    >
      <img 
        src={SKILL_IMAGES[skill] || null} 
        alt={skill} 
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-70 group-hover:opacity-100"
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 via-stone-900/10 to-transparent flex flex-col items-center justify-end p-6 pointer-events-none">
        <div className="text-center">
          <p className="text-xl sm:text-2xl font-black tracking-tight serif leading-tight text-white drop-shadow-md">{skill.split('(')[0].trim()}</p>
          {skill.includes('(') && (
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-gold mt-1.5 opacity-90 drop-shadow-sm">
              {skill.split('(')[1].replace(')', '')}
            </p>
          )}
        </div>
      </div>
    </motion.button>
  );
}
