import { useShipping } from '@/Contexts/Profile/ShippingContext';
import Dropdown from '@/Components/Dropdown/Dropdown';

const AddressSelector: React.FC = () => {
  const {
    shippingDetails,
    selectedShippingDetail,
    setSelectedShippingDetail,
    toggleShowForm,
  } = useShipping();

  const items = shippingDetails.map(detail => ({
    id: detail.id,
    label: `${detail.full_name}, ${detail.address_line1}, ${detail.city}`,
  }));

  const handleAddNew = () => {
    setSelectedShippingDetail(null); // clear any selected address
    toggleShowForm(); // now opens the form in "add" mode
  };

  const canAddNew = shippingDetails.length < 6;

  return (
    <Dropdown
      items={items}
      selectedItemId={selectedShippingDetail?.id || null}
      onSelect={(id: number) => setSelectedShippingDetail(id)}
      // Only show the "+ Add New Address" option if fewer than 6 addresses exist
      onCustomAction={canAddNew ? handleAddNew : undefined}
      customActionLabel={canAddNew ? '+ Add New Address' : undefined}
      placeholder="Select Shipping Address"
    />
  );
};

export default AddressSelector;
