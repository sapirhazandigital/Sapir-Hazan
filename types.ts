
export enum ItemStatus {
  ACTIVE = 'ACTIVE',
  BOUGHT = 'BOUGHT',
  CANCELED = 'CANCELED'
}

export interface ShoppingItem {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  status: ItemStatus;
  createdAt: string;
  updatedAt: string;
}

export interface MonthlyReport {
  month: string; // YYYY-MM
  totalSpent: number;
  totalCanceled: number;
  itemsCount: number;
  categoriesBreakdown: Record<string, number>;
}

export interface UserPreferences {
  name: string;
  partnerName: string;
  budgetGoal: number;
}
