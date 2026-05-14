# Report Content: Farm Decision Support System (DSS)

## Introduction

The Farm Decision Support System (DSS) is a comprehensive platform designed to assist farmers, operators, and owners in optimizing agricultural operations through data-driven decision-making. The system integrates tractor and implement specifications, operating conditions, IoT telemetry, simulation capabilities, and financial tracking to provide actionable insights for field operations. It consists of a backend API built with FastAPI and SQLAlchemy, a React Native frontend using Expo, and IoT ingestion services for real-time data collection. The platform supports user authentication, CRUD operations for agricultural assets, performance simulations based on legacy algorithms, IoT monitoring, field session management, and reporting functionalities.

The system aims to bridge the gap between traditional farming practices and modern technology by providing tools for performance calculation, resource optimization, and operational efficiency. It handles data from tractors, implements, tires, soil conditions, and IoT devices to simulate and monitor real-world farming scenarios.

## Problem Definition

Modern agriculture faces several challenges that hinder efficiency and profitability:

1. **Lack of Data-Driven Decision Making**: Farmers often rely on experience and intuition for selecting tractors, implements, and operating parameters, leading to suboptimal performance, increased fuel consumption, and higher operational costs.

2. **Inadequate Performance Monitoring**: Without real-time insights into tractor performance, soil conditions, and equipment utilization, operators cannot adjust strategies dynamically, resulting in inefficiencies such as excessive slip, poor traction, or unnecessary fuel usage.

3. **Fragmented Data Sources**: Agricultural data from IoT sensors, equipment specifications, and operational logs are often siloed, making it difficult to correlate and analyze for comprehensive insights.

4. **Resource Management Complexity**: Tracking wages, fuel consumption, and operational costs across multiple sessions and equipment is manual and error-prone, leading to inaccurate financial reporting.

5. **Scalability and Accessibility**: Traditional DSS tools are often desktop-based or require specialized hardware, limiting accessibility for mobile users in the field.

6. **IoT Integration Challenges**: Real-time data from sensors (e.g., soil moisture, GPS) needs to be ingested, processed, and presented in a user-friendly manner without overwhelming the system or users.

These problems result in reduced productivity, higher costs, and missed opportunities for optimization in agricultural operations.

## Objective

The primary objectives of the Farm DSS are:

1. **Provide Accurate Performance Simulations**: Enable users to simulate tractor-implement combinations under various operating conditions to predict performance metrics such as drawbar power, slip, traction efficiency, and fuel consumption.

2. **Facilitate Real-Time Monitoring**: Integrate IoT data for live tracking of field conditions, equipment status, and operational parameters to support on-the-go decision-making.

3. **Streamline Asset Management**: Offer comprehensive CRUD operations for tractors, implements, tires, and operating conditions, distinguishing between library (predefined) and custom (user-defined) assets.

4. **Enhance Operational Tracking**: Implement session-based tracking for field operations, including start/stop functionality, GPS integration, and linkage to financial records like wages and fuel logs.

5. **Deliver Actionable Insights**: Generate reports and comparisons from simulation history and operational data to inform equipment purchases, maintenance schedules, and operational strategies.

6. **Ensure Scalability and Usability**: Build a mobile-first application with robust backend APIs that can handle concurrent users, large datasets, and real-time data ingestion.

7. **Promote Data Security and Role-Based Access**: Implement authentication and authorization to protect sensitive data while allowing appropriate access for owners, operators, and farmers.

## Proposed Solution

The proposed solution is a full-stack application comprising:

### Backend Architecture
- **Framework**: FastAPI for high-performance REST APIs with automatic OpenAPI documentation.
- **Database**: SQLAlchemy ORM with support for both SQLite (development) and PostgreSQL (production), using Alembic for migrations.
- **Authentication**: JWT-based authentication with role-based access control (owner, operator, farmer).
- **Core Modules**:
  - Tractor, Implement, and Tire CRUD with library/custom separation.
  - Operating condition presets for reusable field parameters.
  - Performance calculator integrating legacy algorithms for simulation runs.
  - IoT ingestion via HTTP polling and MQTT subscription for real-time data.
  - Session management for tracking active field operations.
  - Wage and fuel logging for financial tracking.
  - Reporting APIs for aggregated insights.

### Frontend Architecture
- **Framework**: React Native with Expo for cross-platform mobile and web deployment.
- **State Management**: React Query for server state management and caching.
- **Navigation**: Tab-based and stack navigation for intuitive user flows.
- **Key Screens**: Tractor/implement selection, simulation setup and results, IoT dashboard, session management, and reports.

### IoT Integration
- **Data Ingestion**: Background services for polling external APIs (e.g., Adafruit IO) and subscribing to MQTT topics.
- **Data Processing**: Normalization of raw sensor data into canonical feeds with status labeling (normal/warning/critical).
- **APIs**: Latest values and historical time-series queries for dashboard and charting.

### Data Flow
1. Users authenticate and manage assets via CRUD APIs.
2. Simulations are run by selecting tractor/implement combinations and operating conditions, processed through the performance calculator, and stored for history.
3. IoT data is continuously ingested and made available via APIs.
4. Field sessions are started/stopped with optional IoT linkage.
5. Financial data (wages, fuel) is logged against sessions.
6. Reports aggregate data for insights.

The solution ensures modularity, scalability, and maintainability through clean architecture principles, Pydantic schemas for validation, and comprehensive error handling.

## Methodology

The development methodology follows an iterative, feature-driven approach:

1. **Requirements Gathering**: Identified key stakeholders (farmers, operators, owners) and their needs through domain analysis of agricultural operations and existing DSS limitations.

2. **System Design**: 
   - Adopted RESTful API design with versioning (/api/v1).
   - Used domain-driven design for organizing code into models, CRUD operations, services, and routes.
   - Implemented separation of concerns with distinct layers for API, business logic, and data access.

3. **Technology Selection**:
   - FastAPI for backend due to its async capabilities and automatic validation.
   - React Native/Expo for frontend to ensure mobile-first development.
   - SQLAlchemy for ORM to handle complex queries and relationships.
   - Alembic for database migrations to maintain schema evolution.

4. **Implementation Phases**:
   - **Phase 1**: Core infrastructure (authentication, database setup, basic CRUD).
   - **Phase 2**: Simulation engine integration with legacy algorithms.
   - **Phase 3**: IoT ingestion and API development.
   - **Phase 4**: Session management and financial tracking.
   - **Phase 5**: Frontend development and integration.
   - **Phase 6**: Testing, optimization, and deployment preparation.

5. **Testing Strategy**:
   - Unit tests for core algorithms and services.
   - Integration tests for API endpoints.
   - End-to-end tests for critical user flows (e.g., simulation runs).
   - Manual testing for UI/UX and mobile compatibility.

6. **Deployment and Maintenance**:
   - Containerization with Docker for consistent environments.
   - CI/CD pipelines for automated testing and deployment.
   - Monitoring and logging for production reliability.
   - Iterative updates based on user feedback and new requirements.

This methodology ensures the system is robust, user-centric, and adaptable to evolving agricultural needs.