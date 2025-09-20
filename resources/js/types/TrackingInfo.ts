export type TrackingInfo = {
  carrier?: string | null;
  tracking_number?: string | null;
  tracking_url?: string | null;
  label_url?: string | null;
  shipment_id?: string | null;
  tracking_history?: any[]; // Better define if possible
};
