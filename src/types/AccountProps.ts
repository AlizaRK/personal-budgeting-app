export type AccountType = 'cash' | 'receivable' | 'credit' | 'payable';

export const AccountTypes = {
    CASH: 'cash',
    RECEIVABLE: 'receivable',
    CREDIT: 'credit',
    PAYABLE: 'payable',
} as const;

export const isLiability = (type: AccountType): boolean =>
    [AccountTypes.CREDIT, AccountTypes.PAYABLE,
    AccountTypes.RECEIVABLE, AccountTypes.CASH].includes(type);

export const isAsset = (type: AccountType): boolean =>
    [AccountTypes.CASH, AccountTypes.RECEIVABLE,
    AccountTypes.CREDIT, AccountTypes.PAYABLE].includes(type);


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