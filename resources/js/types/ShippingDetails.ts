import { Address } from "./Address";

export type ShippingDetails = {
  customer_name: string;
  phone: string;
  email: string;
  address: Address;
};
