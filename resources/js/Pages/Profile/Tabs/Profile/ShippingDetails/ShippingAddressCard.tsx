import React, { useState } from 'react';
import { ShippingDetail } from '@/types/Shipping';
import { useShipping } from '@/Contexts/Profile/ShippingContext';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import Modal from '@/Components/Modal/Modal';
import PrimaryButton from '@/Components/Buttons/PrimaryButton';
import SecondaryButton from '@/Components/Buttons/SecondaryButton';


interface Props {
  detail: ShippingDetail;
  isSelected: boolean;
  onSelect: () => void;
}

export default function ShippingAddressCard({ detail, isSelected, onSelect }: Props) {
  const { deleteShippingDetail, toggleShowForm, setSelectedShippingDetail } = useShipping();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedShippingDetail(detail);
    toggleShowForm(); // Opens form pre-filled
  };

  const confirmDelete = async () => {
    await deleteShippingDetail(detail.id);
    setShowDeleteModal(false);
  };

  return (
    <>
      <div
        onClick={onSelect}
        className={`
          relative cursor-pointer border rounded-lg p-4 h-48
          ${detail.is_default ? 'bg-green-200 dark:bg-green-900/30' : 'bg-white dark:bg-gray-800'}
          ${isSelected ? 'ring-2 ring-green-400 dark:ring-green-300' : 'ring-0'}
          dark:border-white/20 border-black/20 shadow-sm
          hover:bg-green-200 dark:hover:bg-green-900/50
          flex flex-col
        `}
      >
        {!!detail.is_default && (
          <div className="absolute top-2 right-2 bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}

        <h3 className="font-semibold text-lg mb-2 dark:text-white">{detail.full_name}</h3>
        <p className="text-sm dark:text-gray-300">{detail.address_line1}</p>
        {detail.address_line2 && <p className="text-sm dark:text-gray-300">{detail.address_line2}</p>}
        <p className="text-sm dark:text-gray-300">
          {detail.city}, {detail.state ? `${detail.state}, ` : ''}
          {detail.zip}
        </p>
        <p className="text-sm dark:text-gray-300">{detail.country}</p>
        <p className="text-sm mt-2 italic text-gray-500 dark:text-gray-400">{detail.phone}</p>

        {/* Buttons absolutely positioned */}
        <div className="absolute bottom-2 right-2 flex gap-2">
          <button
            onClick={handleEdit}
            aria-label="Edit Address"
            className={`
              p-2 rounded-xl font-Poppins text-white
              bg-yellow-500
              dark:bg-[#7289da]
              hover:scale-[103%] transition-all duration-300 
              flex justify-center items-center
            `}
          >
            <FiEdit size={18} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowDeleteModal(true);
            }}
            aria-label="Delete Address"
            className={`
              p-2 rounded-xl font-Poppins text-white
              bg-yellow-500
              dark:bg-[#7289da]
              hover:scale-[103%] transition-all duration-300 
              flex justify-center items-center
            `}
          >
            <FiTrash2 size={18} />
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <Modal
          show={showDeleteModal}     // <-- add this
          onClose={() => setShowDeleteModal(false)}
        >
          <div className="p-6 flex justify-center items-center flex-col">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Confirm Delete
            </h3>
            <p className="mb-6 text-gray-700 dark:text-gray-300">
              Are you sure you want to delete this shipping address?
            </p>
            <div className="flex justify-end space-x-4">
              <SecondaryButton className='px-5' onClick={() => setShowDeleteModal(false)}>Cancel</SecondaryButton>
              <PrimaryButton className='px-5' onClick={confirmDelete}>Confirm</PrimaryButton>
            </div>
          </div>
        </Modal>
      )}

    </>
  );
}
