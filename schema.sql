-- USERS TABLE
CREATE TABLE Users (
    UserID SERIAL PRIMARY KEY,
    Username VARCHAR(50) UNIQUE NOT NULL,
    PasswordHash TEXT NOT NULL,
    Role VARCHAR(20) NOT NULL CHECK (Role IN ('Patient', 'HospitalStaff', 'InsurerStaff', 'Admin'))
);

-- PATIENTS TABLE
CREATE TABLE Patients (
    PatientID SERIAL PRIMARY KEY,
    UserID INT REFERENCES Users(UserID) ON DELETE CASCADE,
    FullName VARCHAR(100),
    DateOfBirth DATE,
    InsuranceNumber VARCHAR(50)
);

-- CLAIMS TABLE
CREATE TABLE Claims (
    ClaimID SERIAL PRIMARY KEY,
    PatientID INT REFERENCES Patients(PatientID),
    SubmittedBy INT REFERENCES Users(UserID),
    TreatmentDetails TEXT,
    Status VARCHAR(20) NOT NULL CHECK (Status IN ('Pending', 'Approved', 'Rejected')),
    SubmissionDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ApprovalDate TIMESTAMP,
    RejectionReason TEXT
);

-- INVOICES TABLE
CREATE TABLE Invoices (
    InvoiceID SERIAL PRIMARY KEY,
    ClaimID INT REFERENCES Claims(ClaimID) ON DELETE CASCADE,
    GeneratedBy INT REFERENCES Users(UserID),
    Amount DECIMAL(10,2),
    GeneratedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- FEEDBACK TABLE
CREATE TABLE Feedback (
    FeedbackID SERIAL PRIMARY KEY,
    ClaimID INT REFERENCES Claims(ClaimID) ON DELETE CASCADE,
    SenderID INT REFERENCES Users(UserID),
    Message TEXT,
    Timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- LOGIN LOGS
CREATE TABLE LoginLogs (
    LogID SERIAL PRIMARY KEY,
    UserID INT REFERENCES Users(UserID),
    LoginTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Success BOOLEAN
);

-- EDIT LOGS
CREATE TABLE EditLogs (
    EditID SERIAL PRIMARY KEY,
    ClaimID INT REFERENCES Claims(ClaimID),
    EditedBy INT REFERENCES Users(UserID),
    EditTimestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    EditDetails TEXT
);
