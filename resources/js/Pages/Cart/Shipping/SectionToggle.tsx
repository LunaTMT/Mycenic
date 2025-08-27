import React from 'react';
import ArrowIcon from '@/Components/Icon/ArrowIcon';

interface SectionToggleProps {
  isOpen: boolean;
  onToggle: () => void;
}

const SectionToggle: React.FC<SectionToggleProps> = ({ isOpen, onToggle }) => (
  <button
    onClick={onToggle}
    className="w-full text-sm mb-2 text-left font-semibold text-gray-800 dark:text-gray-200 flex justify-between"
  >
    Shipping Address
    <ArrowIcon w="24" h="24" isOpen={isOpen} />
  </button>
);

export default SectionToggle;
