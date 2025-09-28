import { useShipping } from '@/Contexts/User/ShippingContext';
import Dropdown from '@/Components/Dropdown/Dropdown';

const AddressSelector: React.FC = () => {
  const {
    addresses,
    selectedAddress,
    setSelectedAddress,
    toggleShowForm,
  } = useShipping();

  const items = addresses.map(detail => ({
    id: detail.id,
    label: `${detail.full_name}, ${detail.address_line1}, ${detail.city}`,
  }));

  const handleAddNew = () => {
    setSelectedAddress(null); // clear any selected address
    toggleShowForm(); // now opens the form in "add" mode
  };
  
  const canAddNew = addresses.length < 6;

  return (
    <Dropdown
      items={items}
      selectedItemId={selectedAddress?.id || null}
      onSelect={(id: number | string) => setSelectedAddress(Number(id))} // Cast to number to match type
      // Only show the "+ Add New Address" option if fewer than 6 addresses exist
      onCustomAction={canAddNew ? handleAddNew : undefined}
      customActionLabel={canAddNew ? '+ Add New Address' : undefined}
      placeholder="Select Shipping Address"
    />
  );
};

export default AddressSelector;
