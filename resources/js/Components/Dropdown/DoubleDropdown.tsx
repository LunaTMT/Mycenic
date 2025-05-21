import { useState } from 'react';

const categories = {
  Fruits: {
    Tropical: ['Mango', 'Pineapple', 'Papaya'],
    Citrus: ['Orange', 'Lemon', 'Lime'],
    Berries: ['Strawberry', 'Blueberry', 'Raspberry'],
  },
  Vegetables: {
    Root: ['Carrot', 'Potato', 'Beet'],
    Leafy: ['Spinach', 'Lettuce', 'Kale'],
    Cruciferous: ['Broccoli', 'Cauliflower', 'Cabbage'],
  },
  Grains: {
    Rice: ['Basmati', 'Jasmine', 'Arborio'],
    Wheat: ['Whole Wheat', 'Semolina', 'White'],
    Oats: ['Rolled Oats', 'Steel-Cut Oats', 'Instant Oats'],
  },
};

export default function TreeDropdown() {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [selectedItem, setSelectedItem] = useState('');

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setSelectedCategory(category);
    setSelectedSubcategory('');
    setSelectedItem('');
  };

  const handleSubcategoryChange = (e) => {
    const subcategory = e.target.value;
    setSelectedSubcategory(subcategory);
    setSelectedItem('');
  };

  const categoriesList = Object.keys(categories);
  const subcategories = selectedCategory ? categories[selectedCategory] : {};
  const items = selectedSubcategory ? subcategories[selectedSubcategory] : [];

  return (
    <div className="flex flex-col gap-4 max-w-sm mx-auto p-4">
      {/* Category Dropdown */}
      <select
        value={selectedCategory}
        onChange={handleCategoryChange}
        className="p-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="" disabled>Select Category</option>
        {categoriesList.map((category) => (
          <option key={category} value={category}>{category}</option>
        ))}
      </select>

      {/* Subcategory Dropdown */}
      <select
        value={selectedSubcategory}
        onChange={handleSubcategoryChange}
        className="p-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={!selectedCategory}
      >
        <option value="" disabled>Select Subcategory</option>
        {Object.keys(subcategories).map((subcategory) => (
          <option key={subcategory} value={subcategory}>{subcategory}</option>
        ))}
      </select>

      {/* Item Dropdown */}
      <select
        value={selectedItem}
        onChange={(e) => setSelectedItem(e.target.value)}
        className="p-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={!selectedSubcategory}
      >
        <option value="" disabled>Select Item</option>
        {items.map((item) => (
          <option key={item} value={item}>{item}</option>
        ))}
      </select>
    </div>
  );
}
