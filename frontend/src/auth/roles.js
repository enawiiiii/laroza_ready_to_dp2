export const roles = {
  admin: {
    // Dashboard & Reports
    canViewDashboard: true,
    canViewReports: true,
    canViewLogs: true,
    
    // POS & Sales
    canViewPOS: true,
    canMakeSale: true,
    canViewAllSales: true,
    canViewOwnSales: true,
    
    // Products Management
    canViewProducts: true,
    canEditProducts: true,
    canDeleteProducts: true,
    canAddProducts: true,
    
    // Inventory Management
    canViewInventory: true,
    canEditStock: true,
    
    // Returns & Exchanges
    canRefund: true,
    canExchange: true,
    
    // Discounts
    canGiveDiscount: true,
    
    // User & Permission Management
    canManageEmployees: true,
    canDeleteEmployee: true,
    canManageRoles: true,
    canAccessSettings: true,
    
    // Cashier Operations
    canCloseCashier: true,
  },

  manager: {
    // Dashboard & Reports
    canViewDashboard: true,
    canViewReports: true,
    canViewLogs: false,
    
    // POS & Sales
    canViewPOS: true,
    canMakeSale: true,
    canViewAllSales: true,
    canViewOwnSales: true,
    
    // Products Management
    canViewProducts: true,
    canEditProducts: true,
    canDeleteProducts: false,
    canAddProducts: true,
    
    // Inventory Management
    canViewInventory: true,
    canEditStock: true,
    
    // Returns & Exchanges
    canRefund: true,
    canExchange: true,
    
    // Discounts
    canGiveDiscount: true,
    
    // User & Permission Management
    canManageEmployees: false,
    canDeleteEmployee: false,
    canManageRoles: false,
    canAccessSettings: false,
    
    // Cashier Operations
    canCloseCashier: true,
  },

  employee: {
    // Dashboard & Reports
    canViewDashboard: true,
    canViewReports: true,
    canViewLogs: false,
    
    // POS & Sales
    canViewPOS: true,
    canMakeSale: true,
    canViewAllSales: true,
    canViewOwnSales: true,
    
    // Products Management
    canViewProducts: true,
    canEditProducts: true,
    canDeleteProducts: true,
    canAddProducts: true,
    
    // Inventory Management
    canViewInventory: true,
    canEditStock: true,
    
    // Returns & Exchanges
    canRefund: true,
    canExchange: true,
    
    // Discounts
    canGiveDiscount: true,
    
    // User & Permission Management
    canManageEmployees: false,
    canDeleteEmployee: false,
    canManageRoles: false,
    canAccessSettings: false,
    
    // Cashier Operations
    canCloseCashier: true,
  },

  // Alias for backward compatibility
  staff: {
    // Dashboard & Reports
    canViewDashboard: true,
    canViewReports: true,
    canViewLogs: false,
    
    // POS & Sales
    canViewPOS: true,
    canMakeSale: true,
    canViewAllSales: true,
    canViewOwnSales: true,
    
    // Products Management
    canViewProducts: true,
    canEditProducts: true,
    canDeleteProducts: true,
    canAddProducts: true,
    
    // Inventory Management
    canViewInventory: true,
    canEditStock: true,
    
    // Returns & Exchanges
    canRefund: true,
    canExchange: true,
    
    // Discounts
    canGiveDiscount: true,
    
    // User & Permission Management
    canManageEmployees: false,
    canDeleteEmployee: false,
    canManageRoles: false,
    canAccessSettings: false,
    
    // Cashier Operations
    canCloseCashier: true,
  },
};
