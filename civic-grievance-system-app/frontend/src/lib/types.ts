export type User = {
  id: number;
  name: string;
  email: string;
  role: "user" | "admin";
};

export type Grievance = {
  id: number;
  user_id: number;
  title: string;
  description: string;
  category: string;
  region_state: string;
  region_city: string;
  region_sector: string;
  latitude: number | null;
  longitude: number | null;
  image_path: string | null;
  predicted_priority: "Low" | "Medium" | "High" | "Critical";
  confidence_score: number;
  ai_explanation: string;
  department: string;
  status: "Pending" | "In Progress" | "Resolved";
  created_at: string;
  updated_at: string;
};

export type Regions = Record<string, Record<string, string[]>>;

export type Analytics = {
  complaints_by_region: { label: string; count: number }[];
  complaints_by_priority: { label: string; count: number }[];
  complaints_by_department: { label: string; count: number }[];
  monthly_trend: { month: string; count: number }[];
};

