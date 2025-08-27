import React from 'react';
import Modal from '@/Components/Modal/Modal';
import ShippingAddressForm from '@/Pages/Profile/Tabs/Profile/Partials/ShippingAddressForm';

interface AddressModalProps {
  show: boolean;
  onClose: () => void;
  editing: boolean;
}

const AddressModal: React.FC<AddressModalProps> = ({ show, onClose, editing }) => (
  <Modal show={show} onClose={onClose} maxWidth="lg" closeable>
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4 dark:text-white">
        {editing ? 'Edit Shipping Address' : 'Add Shipping Address'}
      </h2>
      <ShippingAddressForm />
    </div>
  </Modal>
);

export default AddressModal;
