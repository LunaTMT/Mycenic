import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import axios from "axios";
import { ShippingDetail, ShippingRate } from "@/types/Shipping";  // Assuming ShippingDetail type exists
import { useCart } from "./CartContext"; // Importing useCart to get totalWeight

// Define the shape of the ShippingContext
interface ShippingContextType {
  addresses: ShippingDetail[];
  selectedAddress: ShippingDetail | null;
  setSelectedAddress: React.Dispatch<React.SetStateAction<ShippingDetail | null>>;
  rates: ShippingRate[];
  selectedRate: ShippingRate | null;
  setSelectedRate: React.Dispatch<React.SetStateAction<ShippingRate | null>>;
  loadingRates: boolean;
  errorRates: string | null;
  shippingCost: number; // <-- Added shipping cost
  fetchRates: () => Promise<void>; // Expose this to fetch rates
}

// Create a context with a default value of undefined
const ShippingContext = createContext<ShippingContextType | undefined>(undefined);

interface ShippingProviderProps {
  children: ReactNode;
  initialAddresses?: ShippingDetail[];  // Use ShippingDetail type for initial addresses
}

export const ShippingProvider: React.FC<ShippingProviderProps> = ({
  children,
  initialAddresses = [],
}) => {
  const { totalWeight } = useCart(); // Fetch total weight from CartContext

  const [addresses] = useState<ShippingDetail[]>(initialAddresses);
  const [selectedAddress, setSelectedAddress] = useState<ShippingDetail | null>(
    initialAddresses.find((addr) => addr.is_default) || null
  );

  const [rates, setRates] = useState<ShippingRate[]>([]);
  const [selectedRate, setSelectedRate] = useState<ShippingRate | null>(null);
  const [loadingRates, setLoadingRates] = useState<boolean>(false);
  const [errorRates, setErrorRates] = useState<string | null>(null);
  const [shippingCost, setShippingCost] = useState<number>(0); // <-- State for shipping cost

  // Function to fetch shipping rates based on the selected address
  const fetchRates = async () => {
    if (!selectedAddress) {
      setRates([]);
      setSelectedRate(null);
      setShippingCost(0); // Reset shipping cost if no address
      return;
    }

    setLoadingRates(true);
    setErrorRates(null);

    try {
      const response = await axios.post("/shipping/rates", {
        address: selectedAddress.address_line1,
        city: selectedAddress.city,
        zip: selectedAddress.zip,
        weight: totalWeight || 1, // Assuming weight is fetched from CartContext
      });

      setRates(response.data.rates || []);
      setSelectedRate(null);
      setShippingCost(0); // Reset shipping cost on new fetch
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch shipping rates";
      setErrorRates(message);
      setRates([]);
      setSelectedRate(null);
      setShippingCost(0); // Reset on error
    } finally {
      setLoadingRates(false);
    }
  };

  // Watch for changes to selected rate and update shipping cost
  useEffect(() => {
    if (selectedRate) {
      setShippingCost(parseFloat(selectedRate.amount)); // Convert amount to number
    }
  }, [selectedRate]);

  // Re-fetch rates whenever the address or weight changes
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
        shippingCost, // Provide the shipping cost
        fetchRates, // Expose the fetchRates method
      }}
    >
      {children}
    </ShippingContext.Provider>
  );
};

// Custom hook to use the ShippingContext
export const useShipping = () => {
  const context = useContext(ShippingContext);
  if (!context) {
    throw new Error("useShipping must be used within a ShippingProvider");
  }
  return context;
};
