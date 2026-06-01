export interface Cadet {
  id: number;
  name: string;
  platoon: string;
  total_points: number;
}

export interface PlatoonTotals {
  platoon: string;
  total_points: number;
  cadet_count: number;
}

export interface Reward {
  id: number;
  name: string;
  points_required: number;
  active: boolean;
  sort_order: number;
}
