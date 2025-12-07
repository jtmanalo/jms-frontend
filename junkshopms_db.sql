CREATE TABLE user (
    UserID INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    Username VARCHAR(100) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL,
    UserType ENUM('owner', 'employee') NOT NULL,
    Email VARCHAR(100) UNIQUE,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE employee (
    EmployeeID INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    UserID INT UNSIGNED UNIQUE,
    PositionTitle VARCHAR(100) NOT NULL,
    FirstName VARCHAR(100) NOT NULL,
    MiddleName VARCHAR(100),
    LastName VARCHAR(100) NOT NULL,
    Nickname VARCHAR(100),
    DisplayPictureURL VARCHAR(255),
    ContactNumber VARCHAR(15) UNIQUE,
    Address TEXT,
    HireDate DATE NOT NULL,
    Status ENUM('active', 'inactive', 'terminated') DEFAULT 'active',
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES user(UserID)
);
CREATE TABLE seller (
    SellerID INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    ContactNumber VARCHAR(15) UNIQUE,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE branch (
    BranchID INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL UNIQUE,
    Location VARCHAR(255) NOT NULL UNIQUE,
    Status ENUM('active', 'inactive', 'closed') DEFAULT 'active',
    OpeningDate DATE NOT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE buyer (
    BuyerID INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    CompanyName VARCHAR(100) NOT NULL UNIQUE,
    ContactPerson VARCHAR(100) NOT NULL,
    Notes TEXT,
    Status ENUM('active', 'inactive', 'closed') DEFAULT 'active',
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE owner (
    OwnerID INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    OwnerType ENUM('user', 'buyer') NOT NULL,
    ReferenceID INT UNSIGNED NOT NULL,
    UNIQUE (OwnerType, ReferenceID)
);
CREATE TABLE buyer_contact (
    ContactID INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    BuyerID INT UNSIGNED NOT NULL,
    ContactMethod VARCHAR(50) NOT NULL,
    ContactDetail VARCHAR(255) NOT NULL UNIQUE,
    IsPrimary BOOLEAN NOT NULL DEFAULT FALSE,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (BuyerID) REFERENCES buyer(BuyerID),
    CONSTRAINT CHK_OnePrimaryContact CHECK (
        IsPrimary = TRUE
        OR IsPrimary = FALSE
    ),
    UNIQUE (BuyerID, ContactDetail),
    INDEX idx_buyer_contact_method_buyer_id (BuyerID)
);
CREATE TABLE item (
    ItemID INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL UNIQUE,
    UnitOfMeasurement ENUM ('per piece', 'per kg', 'others') NOT NULL,
    Classification VARCHAR(50),
    Description TEXT,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE transaction (
    TransactionID INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    BranchID INT UNSIGNED NOT NULL,
    BuyerID INT UNSIGNED,
    SellerID INT UNSIGNED,
    EmployeeID INT UNSIGNED,
    UserID INT UNSIGNED NOT NULL,
    PartyType ENUM('extra', 'regular'),
    TransactionType ENUM(
        'sale',
        'purchase',
        'expense',
        'loan',
        'repayment'
    ) NOT NULL,
    TransactionDate DATETIME NOT NULL,
    TotalAmount DECIMAL(10, 2) NOT NULL,
    PaymentMethod ENUM('cash', 'check', 'online_transfer') NOT NULL,
    Status ENUM('completed', 'pending', 'cancelled') NOT NULL,
    Notes TEXT,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (BranchID) REFERENCES branch(BranchID),
    FOREIGN KEY (BuyerID) REFERENCES buyer(BuyerID),
    FOREIGN KEY (SellerID) REFERENCES seller(SellerID),
    FOREIGN KEY (EmployeeID) REFERENCES employee(EmployeeID),
    FOREIGN KEY (UserID) REFERENCES user(UserID)
);
--
CREATE TABLE pricelist (
PriceListID INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
BuyerID INT UNSIGNED,
BranchID INT UNSIGNED,
DateEffective DATE NOT NULL,
CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (BranchID) REFERENCES branch(BranchID),
FOREIGN KEY (BuyerID) REFERENCES buyer(BuyerID),
CONSTRAINT CHK_BranchOrBuyer CHECK (
    (
        BranchID IS NOT NULL
        AND BuyerID IS NULL
    )
    OR (
        BranchID IS NULL
        AND BuyerID IS NOT NULL
    )
)
);
CREATE TABLE pricelist_item (
    PriceListItemID INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    PriceListID INT UNSIGNED NOT NULL,
    ItemID INT UNSIGNED NOT NULL,
    Price DECIMAL(10, 2) NOT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (PriceListID) REFERENCES pricelist(PriceListID),
    FOREIGN KEY (ItemID) REFERENCES item(ItemID),
    UNIQUE (PriceListID, ItemID)
);
CREATE TABLE transaction_item (
    TransactionItemID INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    TransactionID INT UNSIGNED NOT NULL,
    ItemID INT UNSIGNED NOT NULL,
    Quantity DECIMAL(10, 2) NOT NULL,
    Price DECIMAL(10, 2) NOT NULL,
    Subtotal DECIMAL(10, 2) NOT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (TransactionID) REFERENCES transaction(TransactionID),
    FOREIGN KEY (ItemID) REFERENCES item(ItemID)
);
CREATE TABLE weighing_log (
    LogID INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    BranchID INT UNSIGNED NOT NULL,
    UserID INT UNSIGNED NOT NULL,
    ItemID INT UNSIGNED NOT NULL,
    TransactionID INT UNSIGNED,
    Weight DECIMAL(10, 2) NOT NULL,
    WeighedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ItemID) REFERENCES item(ItemID),
    FOREIGN KEY (TransactionID) REFERENCES transaction(TransactionID),
    FOREIGN KEY (UserID) REFERENCES user(UserID),
    FOREIGN KEY (BranchID) REFERENCES branch(BranchID)
);
CREATE TABLE counting_log (
    LogID INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    BranchID INT UNSIGNED NOT NULL,
    UserID INT UNSIGNED NOT NULL,
    ItemID INT UNSIGNED NOT NULL,
    TransactionID INT UNSIGNED,
    CountedQuantity DECIMAL(10, 2) NOT NULL,
    CountedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ItemID) REFERENCES item(ItemID),
    FOREIGN KEY (TransactionID) REFERENCES transaction(TransactionID),
    FOREIGN KEY (UserID) REFERENCES user(UserID),
    FOREIGN KEY (BranchID) REFERENCES branch(BranchID)
);
CREATE TABLE inventory (
    InventoryID INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    BranchID INT UNSIGNED NOT NULL,
    Date DATE NOT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (BranchID) REFERENCES branch(BranchID),
    UNIQUE (BranchID, Date)
);
CREATE TABLE inventory_item (
    InventoryItemID INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    InventoryID INT UNSIGNED NOT NULL,
    ItemID INT UNSIGNED NOT NULL,
    TotalQuantity DECIMAL(10, 2) NOT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (InventoryID) REFERENCES inventory(InventoryID),
    FOREIGN KEY (ItemID) REFERENCES item(ItemID),
    UNIQUE (InventoryID, ItemID)
);
CREATE TABLE shift (
    ShiftID INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    BranchID INT UNSIGNED NOT NULL,
    UserID INT UNSIGNED NOT NULL,
    StartDatetime DATETIME NOT NULL,
    EndDatetime DATETIME NOT NULL,
    InitialCash DECIMAL(10, 2) NOT NULL,
    FinalCash DECIMAL(10, 2),
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (BranchID) REFERENCES branch(BranchID),
    FOREIGN KEY (UserID) REFERENCES user(UserID)
);
CREATE TABLE shift_employee (
    ShiftEmployeeID INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    ShiftID INT UNSIGNED NOT NULL,
    EmployeeID INT UNSIGNED NOT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ShiftID) REFERENCES shift(ShiftID),
    FOREIGN KEY (EmployeeID) REFERENCES employee(EmployeeID),
    UNIQUE (ShiftID, EmployeeID)
);
CREATE TABLE pricelist_activity (
    ActivityID INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    PriceListItemID INT UNSIGNED NOT NULL,
    OldPrice DECIMAL(10, 2) NOT NULL,
    NewPrice DECIMAL(10, 2) NOT NULL,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UserID INT UNSIGNED NOT NULL,
    FOREIGN KEY (PriceListItemID) REFERENCES pricelist_item(PriceListItemID),
    FOREIGN KEY (UserID) REFERENCES user(UserID)
);
CREATE TABLE activity_log (
    ActivityID INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    UserID INT UNSIGNED NOT NULL,
    BranchID INT UNSIGNED NOT NULL,
    EntityType ENUM(
        'user',
        'employee',
        'branch',
        'seller',
        'buyer',
        'item',
        'transaction',
        'inventory',
        'shift'
    ) NOT NULL,
    EntityID INT NOT NULL,
    ActivityType ENUM(
        'create',
        'view',
        'update',
        'delete',
        'access',
        'login',
        'logout',
        'upload'
    ) NOT NULL,
    Description TEXT,
    LoggedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES user(UserID),
    FOREIGN KEY (BranchID) REFERENCES branch(BranchID)
);