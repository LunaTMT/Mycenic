import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import axios from "axios";
import { ShippingAddress, ShippingRate } from "@/types/Shipping";
import { useCart } from "./CartContext";

interface ShippingContextType {
  addresses: ShippingAddress[];
  selectedAddress: ShippingAddress | null;
  setSelectedAddress: React.Dispatch<React.SetStateAction<ShippingAddress | null>>;
  rates: ShippingRate[];
  selectedRate: ShippingRate | null;
  setSelectedRate: React.Dispatch<React.SetStateAction<ShippingRate | null>>;
  loadingRates: boolean;
  errorRates: string | null;
  fetchRates: () => Promise<void>; // Expose this
}

const ShippingContext = createContext<ShippingContextType | undefined>(undefined);

interface ShippingProviderProps {
  children: ReactNode;
  initialAddresses?: ShippingAddress[];
}

export const ShippingProvider: React.FC<ShippingProviderProps> = ({
  children,
  initialAddresses = [],
}) => {
  const { totalWeight } = useCart();

  const [addresses] = useState<ShippingAddress[]>(initialAddresses);
  const [selectedAddress, setSelectedAddress] = useState<ShippingAddress | null>(
    initialAddresses.find((addr) => addr.is_default) || null
  );

  const [rates, setRates] = useState<ShippingRate[]>([]);
  const [selectedRate, setSelectedRate] = useState<ShippingRate | null>(null);
  const [loadingRates, setLoadingRates] = useState<boolean>(false);
  const [errorRates, setErrorRates] = useState<string | null>(null);

  const fetchRates = async () => {
    if (!selectedAddress) {
      setRates([]);
      setSelectedRate(null);
      return;
    }

    setLoadingRates(true);
    setErrorRates(null);

    try {
      const response = await axios.post("/shipping/rates", {
        address: selectedAddress.address,
        city: selectedAddress.city,
        zip: selectedAddress.zip,
        weight: totalWeight || 1,
      });

      setRates(response.data.rates || []);
      setSelectedRate(null);
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch shipping rates";
      setErrorRates(message);
      setRates([]);
      setSelectedRate(null);
    } finally {
      setLoadingRates(false);
    }
  };

  // 🔁 Refetch rates when address or weight changes
  useEffect(() => {
    fetchRates();
  }, [selectedAddress, totalWeight]);

  return (
    <ShippingContext.Provider
      value={{
        addresses,
        selectedAddress,
        setSelectedAddress,
        rates,
        selectedRate,
        setSelectedRate,
        loadingRates,
        errorRates,
        fetchRates, // exposed
      }}
    >
      {children}
    </ShippingContext.Provider>
  );
};

export const useShipping = () => {
  const context = useContext(ShippingContext);
  if (!context) {
    throw new Error("useShipping must be used within a ShippingProvider");
  }
  return context;
};
