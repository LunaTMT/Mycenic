import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { Inertia } from '@inertiajs/inertia';
import { useRemember } from '@inertiajs/react';
import { useNav } from "@/Contexts/NavContext";
import sections from '@/Pages/About/Section';

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/&/g, 'and').replace(/\s+/g, '-');

export default function AboutSidebar() {
  const { scrollDirection } = useNav();
  const [openMasters, setOpenMasters] = useRemember<Set<string>>(new Set(), 'openMasters');
  const [openHeadings, setOpenHeadings] = useRemember<Set<string>>(new Set(), 'openHeadings');

  const { pathname, hash } = window.location;
  const [, , masterSlug, headingSlug] = pathname.split('/');
  const subSlug = hash ? hash.slice(1) : null;

  useEffect(() => {
    const matchedMaster = sections.find(m => slugify(m.Masterheading) === masterSlug);
    if (matchedMaster) {
      const newOpenMasters = new Set<string>();
      const newOpenHeadings = new Set<string>();

      newOpenMasters.add(matchedMaster.Masterheading);

      if (headingSlug) {
        const matchedHeading = matchedMaster.content.find(h => slugify(h.heading) === headingSlug);
        if (matchedHeading) {
          newOpenHeadings.add(matchedHeading.heading);
        }
      }

      setOpenMasters(newOpenMasters);
      setOpenHeadings(newOpenHeadings);
    }

    if (subSlug) {
      const el = document.getElementById(subSlug);
      if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
    }
  }, [masterSlug, headingSlug, subSlug, setOpenMasters, setOpenHeadings]);

  const handleClick = (master: string, heading?: string, sub?: string) => {
    const masterOpen = openMasters.has(master);
    const headingOpen = heading ? openHeadings.has(heading) : false;

    const masterSlug = slugify(master);
    const headingSlug = heading ? slugify(heading) : null;
    const subSlug = sub ? slugify(sub) : null;

    const segments = [masterSlug];
    if (headingSlug) segments.push(headingSlug);
    const url = `/about/${segments.join('/')}${subSlug ? `#${subSlug}` : ''}`;

    if (sub) {
      const el = document.getElementById(subSlug!);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        window.history.replaceState(null, '', url);
        return;
      }

      Inertia.visit(url, {
        preserveScroll: true,
        preserveState: true,
        onFinish: () => {
          setTimeout(() => {
            const el = document.getElementById(subSlug!);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 300);
        },
      });
      return;
    }

    if (!heading && masterOpen) {
      const updated = new Set(openMasters);
      updated.delete(master);
      setOpenMasters(updated);
      setOpenHeadings(new Set());
      return;
    }

    if (heading && headingOpen) {
      const updated = new Set(openHeadings);
      updated.delete(heading);
      setOpenHeadings(updated);
      return;
    }

    Inertia.visit(url, {
      preserveScroll: true,
      preserveState: true,
    });
  };

  if (!pathname.startsWith('/about')) return null;

  return (
    <motion.div
      className="fixed left-0 top-[11vh] h-screen w-[16vw] z-50 p-4 sm:px-6 lg:px-8 border-r border-black/20 dark:border-white/10 dark:bg-[#424549] text-black dark:text-white overflow-auto"
      animate={{ y: scrollDirection === "down" ? "-6vh" : "0" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {sections.map(M => {
        const isMasterOpen = openMasters.has(M.Masterheading);
        return (
          <div key={M.Masterheading}>
            <div
              className="flex items-center justify-between cursor-pointer py-2 px-3 hover:bg-gray-100 dark:hover:bg-[#40444b] rounded-md"
              onClick={() => handleClick(M.Masterheading)}
            >
              <span className="text-2xl font-semibold text-black dark:text-white">{M.Masterheading}</span>
              {isMasterOpen ? <FaChevronUp /> : <FaChevronDown />}
            </div>

            <AnimatePresence>
              {isMasterOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="pl-4"
                >
                  {M.content.map(H => {
                    const isHeadingOpen = openHeadings.has(H.heading);
                    return (
                      <div key={H.heading}>
                        <div
                          className="flex items-center justify-between cursor-pointer py-1 px-2 hover:bg-gray-100 dark:hover:bg-[#40444b] rounded-md"
                          onClick={() => handleClick(M.Masterheading, H.heading)}
                        >
                          <span className="text-xl text-black dark:text-white">{H.heading}</span>
                          {isHeadingOpen ? <FaChevronUp /> : <FaChevronDown />}
                        </div>

                        <AnimatePresence>
                          {isHeadingOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="pl-4"
                            >
                              {H.content.map(sub => {
                                const isActive = slugify(sub.title) === subSlug;
                                return (
                                  <div
                                    key={sub.title}
                                    className={`block py-1 text-sm cursor-pointer rounded-md px-2 ${
                                      isActive
                                        ? 'font-bold text-black dark:text-white bg-gray-200 dark:bg-[#555]'
                                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#40444b]'
                                    }`}
                                    onClick={() => handleClick(M.Masterheading, H.heading, sub.title)}
                                  >
                                    {sub.title}
                                  </div>
                                );
                              })}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </motion.div>
  );
}
