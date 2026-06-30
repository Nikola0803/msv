// Fallback worker handles used when WP P2P API is unavailable
export interface Worker {
  id: string;
  name: string;
  handles: {
    cashapp: string;
    venmo: string;
    zelle: string;
  };
  active: boolean;
}

export const MSV_WORKERS: Worker[] = [
  {
    id: 'vvg-ops',
    name: 'VVG Ops',
    handles: {
      cashapp: '$VVGOps',
      venmo: '@VVGOps',
      zelle: 'help@mysecretvitality.com',
    },
    active: true,
  },
];
