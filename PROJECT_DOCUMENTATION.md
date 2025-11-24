# Community Service Hub - Complete Project Documentation

## 📋 Project Overview

**Community Service Hub** is a full-stack web application that connects community members who need help with volunteers who want to offer their services. The platform facilitates request management, volunteer coordination, and user administration through a secure and intuitive interface.

**Developer**: Ahmad Raza  
**Email**: ahmad@example.com  
**Submission Date**: ${CURRENT_DATE}

---

## 🏗️ System Architecture

### Backend Technology Stack
- **Framework**: Spring Boot 3.x
- **Security**: Spring Security with JWT
- **Database**: MySQL with JPA/Hibernate
- **API Documentation**: OpenAPI 3 (Swagger)
- **Build Tool**: Maven

### Frontend Technology Stack
- **Framework**: React 19
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Notifications**: React Hot Toast
- **Build Tool**: Vite

---

## 📁 Project Structure

### Backend Structure  
src/main/java/com/communityhub/
├── config/ # Configuration classes
│ ├── AppConfig.java
│ ├── JwtRequestFilter.java
│ ├── JwtAuthenticationEntryPoint.java
│ ├── SwaggerConfig.java
│ └── WebSecurityConfig.java
├── controller/ # REST API controllers
│ ├── AdminStatsController.java
│ ├── AuthController.java
│ ├── RequestController.java
│ ├── UserController.java
│ └── VolunteerController.java
├── dto/ # Data Transfer Objects
│ ├── AuthRequest.java
│ ├── CreateRequestDto.java
│ └── LoginRequest.java
├── model/ # Entity classes
│ ├── HelpRequest.java
│ ├── Role.java
│ ├── User.java
│ └── VolunteerResponse.java
├── repository/ # Data access layer
│ ├── HelpRequestRepository.java
│ ├── UserRepository.java
│ └── VolunteerResponseRepository.java
├── service/ # Business logic layer
│ ├── AdminStatsService.java
│ ├── RequestService.java
│ ├── UserService.java
│ └── VolunteerService.java
└── util/ # Utility classes
├── ApiResponse.java
└── JwtTokenUtil.java


### Frontend Structure
src/
├── api/ # API configuration
│ └── axiosInstance.js
├── components/ # Reusable components
│ ├── Footer.jsx
│ ├── Loader.jsx
│ ├── Navbar.jsx
│ └── RequestCard.jsx
├── context/ # React context
│ └── AuthContext.jsx
├── pages/ # Page components
│ ├── Dashboard.jsx
│ ├── Home.jsx
│ ├── Login.jsx
│ ├── NotFound.jsx
│ ├── Register.jsx
│ ├── Requests.jsx
│ ├── Users.jsx
│ └── Volunteers.jsx
├── routes/ # Routing configuration
│ └── AppRoutes.jsx
└── utils/ # Utility functions
└── helpers.js



---

## 🔐 Authentication & Authorization

### JWT Implementation
- **Token Type**: Bearer Token
- **Algorithm**: HS256
- **Expiration**: 24 hours
- **Storage**: LocalStorage

### User Roles
1. **USER**: Can create and manage their own help requests
2. **ADMIN**: Full system access including user management and statistics
3. **VOLUNTEER**: Can volunteer for requests (future enhancement)

### Security Features
- Password encryption using BCrypt
- CORS configuration for frontend integration
- Role-based access control
- Stateless authentication with JWT

---

## 🗄️ Database Schema

### User Entity
```sql
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('USER', 'VOLUNTEER', 'ADMIN') DEFAULT 'USER',
    city VARCHAR(255),
    skills TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

(1) HelpRequest Entity:
CREATE TABLE help_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    creator_id BIGINT,
    FOREIGN KEY (creator_id) REFERENCES users(id)
);   

(2)VolunteerResponse Entity:
CREATE TABLE volunteer_responses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    volunteer_id BIGINT,
    request_id BIGINT,
    status ENUM('interested', 'approved', 'rejected', 'completed'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (volunteer_id) REFERENCES users(id),
    FOREIGN KEY (request_id) REFERENCES help_requests(id)
);  

🔌 API Endpoints

Authentication Endpoints

(1) Method	Endpoint	Description	Access
POST	/api/auth/register	User registration	Public
POST	/api/auth/login	User login	Public

(2) User Management Endpoints

Method	Endpoint	Description	Access
GET	/api/users	Get all users	ADMIN
GET	/api/users/{id}	Get user by ID	Self/ADMIN
PUT	/api/users/{id}	Update user	Self/ADMIN
DELETE	/api/users/{id}	Delete user	Self/ADMIN

(3) Request Management Endpoints

Method	Endpoint	Description	Access
GET	/api/requests	Get all requests	Authenticated
POST	/api/requests	Create new request	Authenticated
GET	/api/requests/{id}	Get request by ID	Authenticated
PUT	/api/requests/{id}	Update request	Owner/ADMIN
DELETE	/api/requests/{id}	Delete request	Owner/ADMIN

(4) Volunteer Management Endpoints
Method	Endpoint	Description	Access
POST	/api/volunteer/{requestId}	Volunteer for request	Authenticated
PUT	/api/volunteer/{volunteerId}/status	Update volunteer status	Request Owner/ADMIN
DELETE	/api/volunteer/{volunteerId}	Remove volunteer	Self/Request Owner/ADMIN
GET	/api/volunteer	Get all volunteers	ADMIN

(5) Admin Endpoints
Method	Endpoint	Description	Access
GET	/api/admin/dashboard-stats	Get dashboard statistics	ADMIN

🎯 Key Features
1. User Management

(1.1) User registration and authentication

(1.2) Role-based access control

(1.3) Profile management

(1.4) Secure password handling

2. Help Request System
(2.1) Create and manage help requests

(2.2) Categorization of requests

(2.3) Request status tracking

(2.4) Ownership-based permissions

3. Volunteer Coordination
(3.1) Volunteer interest expression

(3.2) Status management (interested → approved → completed)

(3.3) Multi-level permission system

(3.4) Volunteer removal capabilities

4. Admin Dashboard
(4.1) Real-time statistics

(4.2) User management

(4.3) System monitoring

(4.4) Volunteer oversight

5. Security Features
(5.1) JWT-based authentication

(5.2) CORS configuration

(5.3) Input validation

(5.4) Exception handling

🚀 Installation & Setup
Prerequisites
(1) Java 17 or higher

(2) MySQL 8.0 or higher

(3) Node.js 18 or higher

(4) Maven 3.6 or higher

Backend Setup
(1) Database Configuration

(2) sql
(2) CREATE DATABASE community_hub;

(3) Configure application.properties

(4) properties
(4.1) spring.datasource.url=jdbc:mysql://localhost:3306/community_hub
(4.2) spring.datasource.username=root
(4.3) spring.datasource.password=your_password
(4.4) Run Backend

bash
(1) cd backend
(2) mvn spring-boot:run
(3) Frontend Setup
(4) Install Dependencies

bash
(1) cd frontend
(2) npm install
(3) Run Development Server

bash
(1) npm run dev
(2) Access Application

==(1)==>Frontend: http://localhost:5173

===(2)===>Backend API: http://localhost:8080

===(3)===>Swagger UI: http://localhost:8080/swagger-ui/index.html

🧪 Testing the Application
1. User Registration & Login
(1) Open http://localhost:5173/register

(2) Create a new user account

(3) Login with credentials

2. Create Help Request
(1) Navigate to Requests page

(2) Click "Create New Request"

(3) Fill in request details

(4) Submit the request

3. Admin Features
(1) Login with admin account

(2) Access Dashboard for statistics

(3) Manage users and volunteers

(4) Monitor system activities

📊 Features Demonstration
=>(1) For Regular Users:
✅ Register and login

✅ Create help requests

✅ View personal requests

✅ Volunteer for other requests

✅ Update profile information

=>(2) For Admin Users:
✅ View all system statistics

✅ Manage all users

✅ Monitor all volunteer activities

✅ Access admin-only pages


🔧 Configuration Details
(1) Backend Configuration (application.properties)
properties

# Server
server.port=8080

# Database
spring.datasource.url=jdbc:mysql://localhost:3306/community_hub
spring.datasource.username=root
spring.datasource.password=Ahmad@123

# JPA
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

# JWT
jwt.secret=U29tZVN1cGVyU2VjdXJlU2VjcmV0S2V5MTIzQCMhYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXo5ODc2NTQzMjE=
jwt.expiration=86400000


(2) Frontend Configuration (axiosInstance.js)
javascript
const axiosInstance = axios.create({
  baseURL: "http://localhost:8080/api",
  timeout: 30000,
});


===(1)==>🎨 UI/UX Features
(1) Responsive Design: Works on desktop, tablet, and mobile

(2) Dark Mode Support: Automatic theme switching

(3) Smooth Animations: Enhanced user experience with Framer Motion

(4) Loading States: Better user feedback during operations

(5) Toast Notifications: Immediate user feedback

(6) Protected Routes: Secure navigation based on user roles

===(2)===>🛡️ Security Implementation
 Backend Security:
✅ JWT Token Authentication

✅ BCrypt Password Encryption

✅ Role-Based Authorization

✅ CORS Configuration

✅ Input Validation

✅ SQL Injection Prevention

===(3)==>Frontend Security:
 
✅ Token Storage in LocalStorage

✅ Route Protection

✅ Automatic Token Injection

✅ API Error Handling

==(4)===>📈 Performance Features
Backend:
(1) Database connection pooling

(2) Efficient JPA queries

(3) Proper transaction management

(4) Optimized Spring Security configuration

Frontend:
(1) Component-based architecture

(2) Efficient state management

(3) Optimized re-renders

(3) Lazy loading capabilities

                    <<<<<==================================================================>>>>

===(5)==>🔮 Future Enhancements:
=====>(5.1) Planned Features:
(1) Real-time notifications with WebSocket

(2) Email confirmation system

(3) File upload for request attachments

(4) Advanced search and filtering

(5) Mobile application development

(5) Payment integration for premium features

====>(5.2) Technical Improvements:

(1) Microservices architecture

(2) Docker containerization

(3) CI/CD pipeline implementation

(4) Advanced monitoring and logging

=====(6)===> Common Issues:

(1) Database Connection Failed

(2) Verify MySQL service is running

(3)Check database credentials

(4) Ensure database exists

(4) Frontend Cannot Connect to Backend

(5) Verify backend is running on port 8080

(6) Check CORS configuration

(7) Verify API base URL

(8) JWT Token Issues

(9) Clear browser localStorage

(10) Check token expiration

(11) Verify secret key configuration


=====(6)===>Build Errors

(1) Clear node_modules and reinstall

(2) Check Java and Node.js versions

(3) Verify Maven dependencie

📞 Support Information
==(1)==> Developer: Ahmad Raza
==(2)==> Email: ahmad@example.com
==(3)==> Project: Community Service Hub
==(4)==> Version: 1.0
==(5)==>Status: Ready for Submission

🙏 Acknowledgments
(1) Spring Boot Framework

(2)React.js Community

(3) Tailwind CSS Team

(4) All supporting libraries and tools

