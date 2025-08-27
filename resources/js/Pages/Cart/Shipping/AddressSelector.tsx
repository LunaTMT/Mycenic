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

  return (
    <Dropdown
      items={items}
      selectedItemId={selectedShippingDetail?.id || null}
      onSelect={(id) => setSelectedShippingDetail(id)}
      onCustomAction={toggleShowForm}
      customActionLabel="+ Add New Address"
      placeholder="Select Shipping Address"
    />
  );
};

export default AddressSelector;