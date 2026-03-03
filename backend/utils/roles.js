export const ROLES = {
  EMPLOYEE: "employee",
  MANAGER: "manager",
  ADMIN: "admin",
};

// Role permissions mapping
export const rolePermissions = {
  admin: {
    // Dashboard & Reports
    viewDashboard: true,
    viewReports: true,
    viewLogs: true,
    
    // POS & Sales
    viewPOS: true,
    makeSale: true,
    viewAllSales: true,
    viewOwnSales: true,
    
    // Products Management
    viewProducts: true,
    editProducts: true,
    deleteProducts: true,
    addProducts: true,
    
    // Inventory Management
    viewInventory: true,
    editStock: true,
    
    // Returns & Exchanges
    processRefund: true,
    processExchange: true,
    
    // Discounts
    giveDiscount: true,
    
    // User & Permission Management
    manageEmployees: true,
    deleteEmployee: true,
    manageRoles: true,
    accessSettings: true,
    
    // Cashier Operations
    closeCashier: true,
  },

  manager: {
    // Dashboard & Reports
    viewDashboard: true,
    viewReports: true,
    viewLogs: false,
    
    // POS & Sales
    viewPOS: true,
    makeSale: true,
    viewAllSales: true,
    viewOwnSales: true,
    
    // Products Management
    viewProducts: true,
    editProducts: true,
    deleteProducts: false,
    addProducts: true,
    
    // Inventory Management
    viewInventory: true,
    editStock: true,
    
    // Returns & Exchanges
    processRefund: true,
    processExchange: true,
    
    // Discounts
    giveDiscount: true,
    
    // User & Permission Management
    manageEmployees: false,
    deleteEmployee: false,
    manageRoles: false,
    accessSettings: false,
    
    // Cashier Operations
    closeCashier: true,
  },

  employee: {
    // Dashboard & Reports
    viewDashboard: true,
    viewReports: true,
    viewLogs: false,
    
    // POS & Sales
    viewPOS: true,
    makeSale: true,
    viewAllSales: true,
    viewOwnSales: true,
    
    // Products Management
    viewProducts: true,
    editProducts: true,
    deleteProducts: true,
    addProducts: true,
    
    // Inventory Management
    viewInventory: true,
    editStock: true,
    
    // Returns & Exchanges
    processRefund: true,
    processExchange: true,
    
    // Discounts
    giveDiscount: true,
    
    // User & Permission Management
    manageEmployees: false,
    deleteEmployee: false,
    manageRoles: false,
    accessSettings: false,
    
    // Cashier Operations
    closeCashier: true,
  },
};

// Helper function to check permission
export function hasPermission(role, permission) {
  const permissions = rolePermissions[role];
  return permissions ? permissions[permission] === true : false;
}
