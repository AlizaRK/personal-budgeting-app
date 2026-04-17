import { LucideIcon } from "lucide-react";

export interface Option {
  id: string;
  name: string;
}

export interface CustomFloatingSelectProps {
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  icon: LucideIcon;
  placeholder: string;
  disabled?: boolean;
}
