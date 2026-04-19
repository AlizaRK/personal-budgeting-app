export type AccountType = 'cash' | 'receivable' | 'credit' | 'payable';
export type AssetAccountType = 'cash' | 'receivable';
export type LiabilityAccountType = 'credit' | 'payable';

export const AccountTypes = {
  CASH: 'cash',
  RECEIVABLE: 'receivable',
  CREDIT: 'credit',
  PAYABLE: 'payable',
} as const;

export const isLiability = (type: LiabilityAccountType): boolean =>
  [AccountTypes.CREDIT, AccountTypes.PAYABLE].includes(type);

export const isAsset = (type: AssetAccountType): boolean =>
  [AccountTypes.CASH, AccountTypes.RECEIVABLE].includes(type);

export interface Account {
  id: string;
  name: string;
  balance: number;
  type: AccountType;
  user_id: string;
  created_at: string;
}

export interface AccountData {
  name: string;
  balance: number;
  type: AccountType;
}
