export type Record = {
  id: string;
  created_at: string;
  amount: number;
  category: string;
  note?: string;
  user_id: string;
  account_id: string;
  type: 'expense' | 'earning';
};

export type Category = {
  id: string;
  name: string;
  target: number;
  type: 'expense' | 'earning';
  user_id: string;
  created_at: string;
};

export interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export interface User {
  id: string;
  email?: string;
  // Add other user properties as needed
}

export interface AuthState {
  isLogin: boolean;
  email: string;
  password: string;
  error: string;
  loading: boolean;
  message: string;
}

export interface Account {
  id: string;
  name: string;
  balance: string;
  type: string;
  user_id: string;
}

export interface Analytics {
  totals: {
    income: number;
    expense: number;
  };
  spending: { [key: string]: number };
}

export interface DateRange {
  start: string;
  end: string;
}
