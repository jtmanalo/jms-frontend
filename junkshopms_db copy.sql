-- DROP DATABASE IF EXISTS junkshopms_db;
-- CREATE DATABASE junkshopms_db;
-- GRANT ALL ON junkshopms_db.* TO 'owner'@'localhost';

-- USE junkshopms_db;

CREATE TABLE employee (
    EmployeeID INT AUTO_INCREMENT PRIMARY KEY,
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
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CREATE TABLE employee_position (
--     PositionID INT AUTO_INCREMENT PRIMARY KEY,
--     Title VARCHAR(100) NOT NULL UNIQUE,
--     CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

CREATE TABLE user (
    UserID INT AUTO_INCREMENT PRIMARY KEY,
    EmployeeID INT NOT NULL UNIQUE,
    Username VARCHAR(100) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL,
    UserType ENUM('owner', 'employee') NOT NULL,
    Email VARCHAR(100) UNIQUE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (EmployeeID) REFERENCES employee(EmployeeID)
);

CREATE TABLE branch (
    BranchID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL UNIQUE,
    Location VARCHAR(255) NOT NULL UNIQUE,
    Status ENUM('active', 'inactive', 'closed') DEFAULT 'active',
    OpeningDate DATE NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE buyer (
    BuyerID INT AUTO_INCREMENT PRIMARY KEY,
    CompanyName VARCHAR(100) NOT NULL UNIQUE,
    ContactPerson VARCHAR(100) NOT NULL,
    Notes TEXT,
    Status ENUM('active', 'inactive', 'closed') DEFAULT 'active',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE buyer_contact_method (
    ContactID INT AUTO_INCREMENT PRIMARY KEY,
    BuyerID INT NOT NULL,
    ContactMethod VARCHAR(50) NOT NULL,
    ContactDetail VARCHAR(255) NOT NULL UNIQUE,
    IsPrimary BOOLEAN NOT NULL DEFAULT FALSE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (BuyerID) REFERENCES buyer(BuyerID),
    CONSTRAINT CHK_OnePrimaryContact CHECK (IsPrimary = TRUE OR IsPrimary = FALSE)
);

--
CREATE TABLE transaction (
    TransactionID INT AUTO_INCREMENT PRIMARY KEY,
    BranchID INT NOT NULL,
    BuyerID INT,
    SellerID INT,
    EmployeeID INT,
    UserID INT NOT NULL,
    PartyType ENUM('extra', 'regular'),
    TransactionType ENUM('sale', 'purchase', 'expense', 'loan', 'repayment') NOT NULL,
    TransactionDate TIMESTAMP NOT NULL,
    TotalAmount DECIMAL(10, 2) NOT NULL,
    PaymentMethod ENUM('cash', 'check', 'online_transfer') NOT NULL,
    Status ENUM('completed', 'pending', 'cancelled') NOT NULL,
    Notes TEXT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (BranchID) REFERENCES branch(BranchID),
    FOREIGN KEY (BuyerID) REFERENCES buyer(BuyerID),
    FOREIGN KEY (SellerID) REFERENCES seller(SellerID),
    FOREIGN KEY (EmployeeID) REFERENCES employee(EmployeeID),
    FOREIGN KEY (UserID) REFERENCES user(UserID)
);

CREATE TABLE item (
    ItemID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL UNIQUE,
    UnitOfMeasurement ENUM ('per piece', 'per kg', 'others') NOT NULL,
    Classification VARCHAR(50),
    Description TEXT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- add classification eg class A, class B

CREATE TABLE pricelist (
    PriceListID INT AUTO_INCREMENT PRIMARY KEY,
    BuyerID INT,
    BranchID INT,
    DateEffective DATE NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (BranchID) REFERENCES branch(BranchID),
    FOREIGN KEY (BuyerID) REFERENCES buyer(BuyerID),
    CONSTRAINT CHK_BranchOrBuyer CHECK (
        (BranchID IS NOT NULL AND BuyerID IS NULL) OR
        (BranchID IS NULL AND BuyerID IS NOT NULL)
    )
);

CREATE TABLE pricelist_item (
    PriceListItemID INT AUTO_INCREMENT PRIMARY KEY,
    PriceListID INT NOT NULL,
    ItemID INT NOT NULL,
    Price DECIMAL(10, 2) NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (PriceListID) REFERENCES pricelist(PriceListID),
    FOREIGN KEY (ItemID) REFERENCES item(ItemID),
    UNIQUE (PriceListID, ItemID)
);

CREATE TABLE transaction_item (
    TransactionItemID INT AUTO_INCREMENT PRIMARY KEY,
    TransactionID INT NOT NULL,
    ItemID INT NOT NULL,
    Quantity DECIMAL(10, 2) NOT NULL,
    Price DECIMAL(10, 2) NOT NULL,
    Subtotal DECIMAL(10, 2) NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (TransactionID) REFERENCES transaction(TransactionID),
    FOREIGN KEY (ItemID) REFERENCES item(ItemID)
);

CREATE TABLE weighing_log (
    LogID INT AUTO_INCREMENT PRIMARY KEY,
    BranchID INT NOT NULL,
    UserID INT NOT NULL,
    ItemID INT NOT NULL,
    TransactionID INT,
    Weight DECIMAL(10, 2) NOT NULL,
    WeighedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ItemID) REFERENCES item(ItemID),
    FOREIGN KEY (TransactionID) REFERENCES transaction(TransactionID),
    FOREIGN KEY (UserID) REFERENCES user(UserID),
    FOREIGN KEY (BranchID) REFERENCES branch(BranchID)
);

CREATE TABLE counting_log (
    LogID INT AUTO_INCREMENT PRIMARY KEY,
    BranchID INT NOT NULL,
    UserID INT NOT NULL,
    ItemID INT NOT NULL,
    TransactionID INT,
    CountedQuantity DECIMAL(10, 2) NOT NULL,
    CountedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ItemID) REFERENCES item(ItemID),
    FOREIGN KEY (TransactionID) REFERENCES transaction(TransactionID),
    FOREIGN KEY (UserID) REFERENCES user(UserID),
    FOREIGN KEY (BranchID) REFERENCES branch(BranchID)
);

--

CREATE TABLE inventory (
    InventoryID INT AUTO_INCREMENT PRIMARY KEY,
    BranchID INT NOT NULL,
    Date DATE NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (BranchID) REFERENCES branch(BranchID),
    UNIQUE (BranchID, Date)
);

CREATE TABLE inventory_item (
    InventoryItemID INT AUTO_INCREMENT PRIMARY KEY,
    InventoryID INT NOT NULL,
    ItemID INT NOT NULL,
    TotalQuantity DECIMAL(10, 2) NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (InventoryID) REFERENCES inventory(InventoryID),
    FOREIGN KEY (ItemID) REFERENCES item(ItemID),
    UNIQUE (InventoryID, ItemID)
);

CREATE TABLE seller (
    SellerID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    ContactNumber VARCHAR(15) UNIQUE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- create a separate table for extras
-- added seller type in transaction table instead

CREATE TABLE shift (
    ShiftID INT AUTO_INCREMENT PRIMARY KEY,
    BranchID INT NOT NULL,
    UserID INT NOT NULL,
    StartDatetime TIMESTAMP NOT NULL,
    EndDatetime TIMESTAMP NOT NULL,
    InitialCash DECIMAL(10, 2) NOT NULL,
    FinalCash DECIMAL(10, 2),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (BranchID) REFERENCES branch(BranchID),
    FOREIGN KEY (UserID) REFERENCES user(UserID)
);

CREATE TABLE shift_employee (
    ShiftEmployeeID INT AUTO_INCREMENT PRIMARY KEY,
    ShiftID INT NOT NULL,
    EmployeeID INT NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ShiftID) REFERENCES shift(ShiftID),
    FOREIGN KEY (EmployeeID) REFERENCES employee(EmployeeID),
    UNIQUE (ShiftID, EmployeeID)
);

CREATE TABLE pricelist_activity (
    ActivityID INT AUTO_INCREMENT PRIMARY KEY,
    PriceListItemID INT NOT NULL,
    OldPrice DECIMAL(10, 2) NOT NULL,
    NewPrice DECIMAL(10, 2) NOT NULL,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UserID INT NOT NULL,
    FOREIGN KEY (PriceListItemID) REFERENCES pricelist_item(PriceListItemID),
    FOREIGN KEY (UserID) REFERENCES user(UserID)
);

CREATE TABLE activity_log (
    ActivityID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NOT NULL,
    BranchID INT NOT NULL,
    EntityType ENUM('user', 'employee', 'branch', 'seller', 'buyer', 'item', 'transaction', 'inventory', 'shift') NOT NULL,
    EntityID INT NOT NULL,
    ActivityType ENUM('create', 'view', 'update', 'delete', 'access', 'login', 'logout', 'upload') NOT NULL,
    Description TEXT,
    LoggedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES user(UserID),
    FOREIGN KEY (BranchID) REFERENCES branch(BranchID)
);