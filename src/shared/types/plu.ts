export type ParcelleData = {
  found: boolean;
  parcelle: string;
  address_label?: string;
  lon?: number;
  lat?: number;
  zone_urba?: string;
  libelong?: string;
  typezone?: string;
  typedoc?: string;
  etat_doc?: string;
  datappro?: string;
  prescriptions?: string[];
  servitudes?: string[];
};
