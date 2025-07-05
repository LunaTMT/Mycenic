import { useState } from 'react';
import { Link } from '@inertiajs/react';
import Dropdown from '@/Components/Dropdown/Dropdown';
import ArrowIcon from '@/Components/Buttons/ArrowIcon';

interface SectionGroup {
  Masterheading: string;
  titles: string[];
}

const sections: SectionGroup[] = [
  {
    Masterheading: 'Legal',
    titles: ['Law Policy', 'Cookie Policy', 'Privacy Policy'],
  },
  {
    Masterheading: 'Help',
    titles: ['Guides', 'FAQ'],
  },
];

const AboutSidebar = () => {
  const [showDropdown, setShowDropdown] = useState(false);

  const handleDropdownStateChange = (isOpen: boolean) => {
    setShowDropdown(isOpen);
  };

  return (
    <nav className="h-full w-fit">
      <ul className="flex h-full justify-center items-center gap-4  bg-amber-600">
        {sections.map((sectionGroup) => (
          <li key={sectionGroup.Masterheading} className="relative w-full max-w-xs">
            <Dropdown onOpenChange={handleDropdownStateChange}>
              <Dropdown.Trigger>
                <div className="flex items-center gap-2">
                  <p className="font-Poppins text-black dark:text-white hover:text-black dark:hover:text-white/70">
                    {sectionGroup.Masterheading}
                  </p>
                  <ArrowIcon w="30" h="30" isOpen={showDropdown} />
                </div>
              </Dropdown.Trigger>

              <Dropdown.Content>
                <ul className="relative text-left w-full bg-white dark:bg-[#424549] shadow-lg z-50 rounded-md">
                  {sectionGroup.titles.map((title, index) => (
                    <li
                      key={index}
                      className="cursor-pointer px-4 py-2 font-Poppins hover:bg-gray-400/50 dark:hover:bg-[#7289da]/70 text-gray-700 dark:text-gray-300"
                    >
                      <Link
                        href={`#`} // Replace this with actual link if necessary
                        className="block w-full"
                      >
                        {title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </Dropdown.Content>
            </Dropdown>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default AboutSidebar;
