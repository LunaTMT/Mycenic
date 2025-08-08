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
  setSelectedShippingDetail: (detail: ShippingDetail | null) => void;
  setHoveredId: (id: number | null) => void;
  setShowForm: (show: boolean) => void;
  toggleShowForm: () => void;

  fetchShippingDetails: () => void;
  addShippingDetail: (detail: ShippingDetail) => Promise<void>;
  editShippingDetail: (id: number, updatedDetail: Partial<ShippingDetail>) => Promise<void>;
  deleteShippingDetail: (id: number) => Promise<void>;

  setDefaultShippingDetail: (detail: ShippingDetail) => Promise<void>;
}

const ShippingContext = createContext<ShippingContextType | undefined>(undefined);

export const ShippingProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useUser();

  const [shippingDetails, setShippingDetails] = useState<ShippingDetail[]>([]);
  const [selectedShippingDetail, setSelectedShippingDetail] = useState<ShippingDetail | null>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  const toggleShowForm = () => setShowForm(prev => !prev);
  const closeForm = () => setShowForm(false);

  const fetchShippingDetails = async () => {
    console.log(user.id);
    try {
      const url = `/profile/shipping-details?user_id=${user.id}`;
      const res = await axios.get(url);
      setShippingDetails(res.data);

      if (res.data.length === 0) {
        setSelectedShippingDetail(null);
        localStorage.removeItem('selectedShippingDetailId');
        return;
      }

      const savedId = localStorage.getItem('selectedShippingDetailId');
      if (savedId) {
        const savedDetail = res.data.find(
          (detail: ShippingDetail) => detail.id === parseInt(savedId, 10)
        );
        if (savedDetail) {
          setSelectedShippingDetail(savedDetail);
          return;
        }
      }

      setSelectedShippingDetail(res.data[0]);
    } catch (error) {
      toast.error('Failed to load shipping details');
    }
  };

  const addShippingDetail = async (detailData: ShippingDetail) => {
    if (!user) {
      toast.error('User not logged in');
      return;
    }
    try {
      const url = `/profile/shipping-details?user_id=${user.id}`;
      await axios.post(url, detailData);
      await fetchShippingDetails();
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

  const editShippingDetail = async (id: number, updatedDetail: Partial<ShippingDetail>) => {
    if (!user) {
      toast.error('User not logged in');
      return;
    }
    try {
      await axios.put(`/profile/shipping-details/${id}`, updatedDetail);
      await fetchShippingDetails();
      closeForm();
      toast.success('Shipping detail updated successfully');
    } catch {
      toast.error('Failed to update shipping detail');
    }
  };

  const deleteShippingDetail = async (id: number) => {
    try {
      await axios.delete(`/profile/shipping-details/${id}`);
      setShippingDetails((prev) => prev.filter(detail => detail.id !== id));

      if (selectedShippingDetail?.id === id) {
        setSelectedShippingDetail(shippingDetails.length > 1 ? shippingDetails[0] : null);
      }

      toast.success('Shipping detail deleted successfully');
    } catch {
      toast.error('Failed to delete shipping detail');
    }
  };

  const setDefaultShippingDetail = async (detail: ShippingDetail) => {
    try {
      await axios.put(`/profile/shipping-details/${detail.id}`, {
        ...detail,
        is_default: true,
      });

      setShippingDetails((prev) =>
        prev.map((d) => ({
          ...d,
          is_default: d.id === detail.id,
        }))
      );

      setSelectedShippingDetail(detail);
      toast.success('Default shipping address updated');
    } catch {
      toast.error('Failed to update default shipping address');
    }
  };

  useEffect(() => {
    setShippingDetails([]);
    setSelectedShippingDetail(null);

    fetchShippingDetails();
  }, [user]);

  useEffect(() => {
    if (selectedShippingDetail) {
      localStorage.setItem('selectedShippingDetailId', selectedShippingDetail.id.toString());
    } else {
      localStorage.removeItem('selectedShippingDetailId');
    }
  }, [selectedShippingDetail]);

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
        addShippingDetail,
        editShippingDetail,
        deleteShippingDetail,
        setDefaultShippingDetail,
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
