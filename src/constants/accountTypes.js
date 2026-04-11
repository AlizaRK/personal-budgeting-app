export const AccountTypes = {
  CASH: 'cash',
  RECEIVABLE: 'receivable',
  CREDIT: 'credit',
  PAYABLE: 'payable',
};

export const isLiability = (type) => 
  [AccountTypes.CREDIT, AccountTypes.PAYABLE].includes(type);

export const isAsset = (type) => 
  [AccountTypes.CASH, AccountTypes.RECEIVABLE].includes(type);