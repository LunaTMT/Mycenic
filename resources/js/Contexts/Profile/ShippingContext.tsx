import axios from 'axios';
import { toast } from 'react-toastify';
import { ShippingDetail } from '@/types/Shipping';
import { useUser } from '../UserContext';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ShippingContextType {
  shippingDetails: ShippingDetail[];
  selectedShippingDetail: ShippingDetail | null;
  hoveredId: number | null;
  showForm: boolean;

  setShippingDetails: (shippingDetails: ShippingDetail[]) => void;
  setSelectedShippingDetail: (id: number | null, makeDefault?: boolean) => void;
  setHoveredId: (id: number | null) => void;
  setShowForm: (show: boolean) => void;
  toggleShowForm: () => void;

  fetchShippingDetails: () => void;
  storeShippingDetail: (detail: ShippingDetail) => Promise<void>;
  updateShippingDetail: (id: number, updatedDetail: Partial<ShippingDetail>) => Promise<void>;
  deleteShippingDetail: (id: number) => Promise<void>;
}

const ShippingContext = createContext<ShippingContextType | undefined>(undefined);

export const ShippingProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useUser();
  console.log(user);

  const [shippingDetails, setShippingDetails] = useState<ShippingDetail[]>([]);
  const [selectedShippingId, setSelectedShippingId] = useState<number | null>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  const toggleShowForm = () => setShowForm(prev => !prev);
  const closeForm = () => setShowForm(false);

  const selectedShippingDetail = shippingDetails.find(d => d.id === selectedShippingId) || null;

  const setSelectedShippingDetail = async (id: number | null, makeDefault = true) => {
    setSelectedShippingId(id);

    // Persist selection in localStorage
    if (id !== null) {
      localStorage.setItem('selectedShippingDetailId', id.toString());
    } else {
      localStorage.removeItem('selectedShippingDetailId');
    }

    const detail = shippingDetails.find(d => d.id === id);
    if (detail && makeDefault && !detail.is_default) {
      try {
        console.log("making default");
        await axios.put(`/profile/shipping-details/${id}`, { ...detail, is_default: true });
        setShippingDetails(prev => prev.map(d => ({ ...d, is_default: d.id === id })));
        toast.success('Default shipping address updated');
      } catch {
        toast.error('Failed to update default shipping address');
      }
    }
  };


  const fetchShippingDetails = async () => {
    try {
      if (user.isGuest) return;
      const res = await axios.get(`/profile/shipping-details?user_id=${user.id}`);
      setShippingDetails(res.data);

      if (res.data.length === 0) {
        setSelectedShippingDetail(null, false);
        return;
      }

      // Check localStorage for previously selected address
      const savedId = localStorage.getItem('selectedShippingDetailId');
      if (savedId && res.data.some(d => d.id === parseInt(savedId, 10))) {
        setSelectedShippingDetail(parseInt(savedId, 10), false);
      } else {
        // fallback: select the first one
        setSelectedShippingDetail(res.data[0].id, false);
      }
    } catch {
      toast.error('Failed to load shipping details');
    }
  };


  const storeShippingDetail = async (detailData: ShippingDetail) => {
    try {
      await axios.post(`/profile/shipping-details?user_id=${user.id}`, detailData);
      const res = await axios.get(`/profile/shipping-details?user_id=${user.id}`);
      setShippingDetails(res.data);

      // Automatically select the newly added address and set as default
      if (res.data.length > 0) {
        const newItem = res.data[res.data.length - 1];
        
        await setSelectedShippingDetail(newItem.id); // selects and sets default
      }

      closeForm();
      toast.success('Shipping detail added successfully');
    } catch (error: any) {
      if (error.response?.data?.errors) {
        Object.values(error.response.data.errors).flat().forEach(msg => toast.error(msg));
      } else {
        toast.error('Failed to add shipping detail');
      }
    }
  };

  const updateShippingDetail = async (id: number, updatedDetail: Partial<ShippingDetail>) => {
    try {
      await axios.put(`/profile/shipping-details/${id}`, updatedDetail);
      const res = await axios.get(`/profile/shipping-details?user_id=${user.id}`);
      setShippingDetails(res.data);

      // Keep the updated address selected
      setSelectedShippingDetail(id, false);

      toast.success('Shipping detail updated successfully');
      closeForm();
    } catch {
      toast.error('Failed to update shipping detail');
    }
  };

  const deleteShippingDetail = async (id: number) => {
    try {
      await axios.delete(`/profile/shipping-details/${id}`);
      const updatedList = shippingDetails.filter(d => d.id !== id);
      setShippingDetails(updatedList);

      // Reset selection if deleted
      if (selectedShippingId === id) {
        setSelectedShippingDetail(updatedList.length ? updatedList[0].id : null, false);
      }

      toast.success('Shipping detail deleted successfully');
    } catch {
      toast.error('Failed to delete shipping detail');
    }
  };

  useEffect(() => {
    fetchShippingDetails();
  }, [user]);

  return (
    <ShippingContext.Provider
      value={{
        shippingDetails,
        selectedShippingDetail,
        hoveredId,
        showForm,
        setShippingDetails,
        setSelectedShippingDetail,
        setHoveredId,
        setShowForm,
        toggleShowForm,
        fetchShippingDetails,
        storeShippingDetail,
        updateShippingDetail,
        deleteShippingDetail,
      }}
    >
      {children}
    </ShippingContext.Provider>
  );
};

export const useShipping = () => {
  const context = useContext(ShippingContext);
  if (!context) throw new Error('useShipping must be used within a ShippingProvider');
  return context;
};
