# Product Requirements Document (PRD)

# TransitOps – Smart Transport Operations Platform

Version: 1.0
Author: Team
Hackathon: Odoo Hackathon 2026
Duration: 8 Hours

---

# 1. Overview

TransitOps is a cloud-based ERP platform that digitizes transport operations for organizations by managing vehicles, drivers, trips, maintenance, fuel, expenses, and operational analytics in one centralized system.

The platform eliminates spreadsheet-based fleet management and automates business workflows with role-based access control, intelligent validations, KPI dashboards, and AI-powered recommendations.

---

# 2. Problem Statement

Many organizations still manage transport operations using spreadsheets and manual records.

This results in

- Double vehicle allocation
- Driver scheduling conflicts
- Missed maintenance
- Expired licenses
- Poor fuel tracking
- Lack of operational insights
- High operational cost

TransitOps solves these problems by creating a centralized ERP system for complete fleet lifecycle management.

---

# 3. Vision

To build an intelligent fleet management platform that enables organizations to manage transportation efficiently while reducing operational costs through automation, analytics, and AI.

---

# 4. Goals

## Business Goals

- Digitize transport operations
- Reduce manual work
- Improve vehicle utilization
- Prevent scheduling conflicts
- Improve maintenance planning
- Track operational expenses
- Provide real-time analytics

## User Goals

Fleet Managers should be able to

- Manage vehicles
- Monitor fleet health
- Schedule maintenance

Drivers should be able to

- View assigned trips
- Update trip status

Safety Officers should

- Monitor license validity
- Track driver safety

Financial Analysts should

- Monitor expenses
- Analyze profitability

---

# 5. Target Users

## Admin

Responsible for

- User Management
- Role Management
- System Configuration

---

## Fleet Manager

Responsible for

- Vehicle Registry
- Dispatch
- Maintenance
- Dashboard
- Reports

---

## Driver

Responsible for

- View Assigned Trips
- Complete Trips
- Raise Maintenance Requests

---

## Safety Officer

Responsible for

- License Monitoring
- Driver Compliance
- Safety Reports

---

## Financial Analyst

Responsible for

- Expense Tracking
- Fuel Reports
- ROI Reports

---

# 6. User Personas

### Fleet Manager

Pain Points

- Vehicle conflicts
- Unknown vehicle availability
- Missed maintenance

Needs

- Live dashboard
- Alerts
- Fleet utilization

---

### Driver

Pain Points

- No trip visibility

Needs

- Assigned trips
- Navigation
- Trip completion

---

### Finance Manager

Pain Points

- Manual fuel calculation

Needs

- Expense reports
- ROI
- Vehicle cost analysis

---

# 7. Functional Requirements

---

## Module 1

Authentication

Features

- Login
- Logout
- Forgot Password
- JWT Authentication
- RBAC

Roles

- Admin
- Fleet Manager
- Driver
- Safety Officer
- Finance

---

## Module 2

Dashboard

KPIs

- Active Vehicles
- Available Vehicles
- Vehicles in Maintenance
- Active Trips
- Drivers Available
- Fleet Utilization
- Fuel Consumption
- Operational Cost

Charts

- Trips per Month
- Fuel Trend
- Maintenance Cost
- Vehicle Status
- Fleet Utilization

---

## Module 3

Vehicle Management

Fields

- Registration Number
- Vehicle Name
- Type
- Capacity
- Odometer
- Acquisition Cost
- Status
- Documents
- Insurance
- RC
- Pollution Certificate

Status

- Available
- On Trip
- In Shop
- Retired

Actions

- Create
- Update
- Delete
- Search
- Filter

---

## Module 4

Driver Management

Fields

- Name
- Email
- Phone
- License Number
- License Category
- Expiry Date
- Safety Score
- Status

Status

- Available
- On Trip
- Suspended
- Off Duty

---

## Module 5

Trip Management

Fields

- Source
- Destination
- Driver
- Vehicle
- Cargo Weight
- Planned Distance
- Start Time
- End Time
- Status

Workflow

Draft

↓

Dispatched

↓

Completed

↓

Cancelled

Validation

- Driver available
- Vehicle available
- License valid
- Capacity sufficient

---

## Module 6

Maintenance

Fields

- Vehicle
- Issue
- Priority
- Status
- Cost
- Images

Workflow

Pending

↓

Approved

↓

Technician Assigned

↓

In Progress

↓

Completed

Automatic

Vehicle Status

↓

In Shop

↓

Available

---

## Module 7

Fuel Management

Fields

- Vehicle
- Fuel Quantity
- Fuel Cost
- Mileage
- Date

Auto Calculate

- Fuel Efficiency
- Cost per KM

---

## Module 8

Expense Management

Fields

- Fuel
- Toll
- Maintenance
- Miscellaneous

Reports

- Monthly Expense
- Vehicle Expense
- Department Expense

---

## Module 9

Reports

Generate

- Vehicle Utilization
- Maintenance Report
- Fuel Report
- Driver Report
- Fleet ROI
- Operational Cost

Export

- CSV
- PDF

---

## Module 10

Notifications

Notifications

- Maintenance Due
- License Expiry
- Trip Assigned
- Vehicle Returned
- Maintenance Approved
- Fuel Alert

---

# 8. AI Features (Hackathon WOW Features)

## AI Fleet Copilot

Chat Interface

Questions

Which vehicle should I assign?

Which driver is available?

Show overdue maintenance.

Show highest fuel-consuming vehicle.

Predict maintenance.

---

## Predictive Maintenance

Input

- Odometer
- Fuel Usage
- Last Maintenance

Output

Vehicle Health

Maintenance Risk

Predicted Service Date

---

## Smart Dispatch Recommendation

Suggests

Best Driver

Best Vehicle

Least Cost

Minimum Fuel

---

## AI Insights

Examples

Fuel consumption increased 18%

Vehicle TR-202 requires servicing

Driver Rahul has highest efficiency

Fleet utilization improved 9%

---

# 9. Business Rules

Vehicle Registration Number

Must be Unique

Vehicle

Cannot be assigned twice

Driver

Cannot drive two vehicles simultaneously

Expired License

Cannot dispatch

Maintenance Vehicle

Cannot dispatch

Cargo

Cannot exceed capacity

Trip Complete

Vehicle becomes Available

Trip Cancelled

Vehicle becomes Available

Maintenance Complete

Vehicle becomes Available

---

# 10. Non Functional Requirements

Performance

Dashboard

<2 seconds

Search

<1 second

Availability

99%

Responsive

Desktop

Tablet

Mobile

Security

JWT

Password Hashing

RBAC

HTTPS

Input Validation

---

# 11. Database Design

Tables

Users

Roles

Vehicles

Drivers

Trips

Trip Logs

Fuel Logs

Maintenance

Expenses

Notifications

Analytics

Documents

---

# 12. Tech Stack

Frontend

- React
- Tailwind CSS
- React Router

Backend

- Node.js
- Express.js

Database

- PostgreSQL

Authentication

- JWT

Charts

- Recharts

Maps

- Leaflet

Storage

- Cloudinary

Deployment

- Docker
- Render
- Vercel

---

# 13. API Overview

Auth

POST /login

POST /register

Vehicles

GET /vehicles

POST /vehicles

PUT /vehicles/:id

DELETE /vehicles/:id

Drivers

GET /drivers

POST /drivers

Trips

GET /trips

POST /trips

Maintenance

POST /maintenance

Fuel

POST /fuel

Dashboard

GET /dashboard

Reports

GET /reports

AI

POST /ai/chat

POST /ai/predict

---

# 14. Success Metrics

Fleet Utilization

>90%

Trip Conflict

0

Vehicle Downtime

Reduced by 25%

Maintenance Delay

Reduced by 30%

Fuel Tracking Accuracy

100%

Dashboard Load

<2 sec

---

# 15. Future Scope

- Mobile App
- GPS Tracking
- Live Vehicle Tracking
- IoT Integration
- AI Route Optimization
- OCR Fuel Receipt Scanner
- Voice Assistant
- Predictive Fuel Analytics
- Multi Organization Support
- Driver Mobile App
- Offline Mode

---

# 16. Demo Flow

1. Login

2. Dashboard

3. Register Vehicle

4. Register Driver

5. Create Trip

6. Dispatch

7. Vehicle Status Changes

8. Fuel Entry

9. Maintenance Request

10. Analytics Dashboard

11. AI Fleet Copilot

12. Reports Export

---

# 17. Deliverables

- Responsive Web Application
- REST API
- PostgreSQL Database
- Role-Based Access Control
- Dashboard
- Reports
- AI Fleet Copilot
- Predictive Maintenance
- Deployment
- Source Code
- Documentation