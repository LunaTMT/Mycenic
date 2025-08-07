import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ShippingDetail } from '@/types/Shipping';

interface ShippingContextType {
  shippingDetails: ShippingDetail[];
  selectedShippingDetail: ShippingDetail | null;
  hoveredId: number | null;
  showForm: boolean;

  setShippingDetails: (shippingDetails: ShippingDetail[]) => void;
  setSelectedShippingDetail: (detail: ShippingDetail) => void;
  setHoveredId: (id: number | null) => void;
  setShowForm: (show: boolean) => void;
  toggleShowForm: () => void;

  fetchShippingDetails: (userId?: number) => void;

  addShippingDetail: (detail: ShippingDetail) => Promise<void>;

  setDefaultShippingDetail: (detail: ShippingDetail) => Promise<void>;
}

const ShippingContext = createContext<ShippingContextType | undefined>(undefined);

export const ShippingProvider = ({
  user,
  children,
}: {
  user: any; // replace with your User type if available
  children: ReactNode;
}) => {
  const [shippingDetails, setShippingDetails] = useState<ShippingDetail[]>([]);
  const [selectedShippingDetail, setSelectedShippingDetail] = useState<ShippingDetail | null>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  const initializedSelectedShippingDetail = useRef(false);

  const toggleShowForm = () => {
    setShowForm(prev => !prev);
  };

  useEffect(() => {
    if (!initializedSelectedShippingDetail.current) return;

    if (selectedShippingDetail) {
      localStorage.setItem('selectedShippingDetailId', selectedShippingDetail.id.toString());
    } else {
      localStorage.removeItem('selectedShippingDetailId');
    }
  }, [selectedShippingDetail]);

  const fetchShippingDetails = async (userId?: number) => {
    if (!userId && shippingDetails.length > 0) {
      console.log('Shipping details already loaded, skipping fetch');
      return;
    }

    try {
      const url = userId ? `/profile/shipping-details?user_id=${userId}` : '/profile/shipping-details';
      const res = await axios.get(url);
      setShippingDetails(res.data);

      if (res.data.length === 0) {
        setSelectedShippingDetail(null);
        localStorage.removeItem('selectedShippingDetailId');
        initializedSelectedShippingDetail.current = true;
        return;
      }

      const savedId = localStorage.getItem('selectedShippingDetailId');
      if (savedId) {
        const savedDetail = res.data.find(
          (detail: ShippingDetail) => detail.id === parseInt(savedId)
        );
        if (savedDetail) {
          setSelectedShippingDetail(savedDetail);
          initializedSelectedShippingDetail.current = true;
          return;
        }
      }

      setSelectedShippingDetail(res.data[0]);
      initializedSelectedShippingDetail.current = true;
    } catch (error) {
      toast.error('Failed to load shipping details');
      initializedSelectedShippingDetail.current = true;
    }
  };

  const addShippingDetail = async (detailData: ShippingDetail) => { 
    try {
      console.log(detailData);
      const res = await axios.post('/profile/shipping-details', detailData);
      // Optionally you can keep the newly added detail from response
      // const newDetail: ShippingDetail = res.data;

      // Refetch the full list to keep consistent state
      await fetchShippingDetails(user.id);

      setShowForm(false);
      toast.success('Shipping detail added successfully');
    } catch (error: any) {
      if (error.response?.data?.errors) {
        const messages = Object.values(error.response.data.errors).flat();
        messages.forEach(msg => toast.error(msg));
      } else {
        toast.error('Failed to add shipping detail');
      }
    }
  };

  const setDefaultShippingDetail = async (detail: ShippingDetail) => {
    console.log(detail);
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
    } catch (error) {
      toast.error('Failed to update default shipping address');
    }
  };

  useEffect(() => {
    initializedSelectedShippingDetail.current = false;
    setShippingDetails([]);
    setSelectedShippingDetail(null);
    fetchShippingDetails(user.id);
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
        addShippingDetail,
        setDefaultShippingDetail,
      }}
    >
      {children}
    </ShippingContext.Provider>
  );
};

export const useShipping = () => {
  const context = useContext(ShippingContext);
  if (!context)
    throw new Error('useShipping must be used within a ShippingProvider');
  return context;
};
