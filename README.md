# Bug Tracker – Project Management System
# 1. Introduction

Bug Tracker is a full-stack web application developed to help teams manage projects and track bugs or issues in an organised way.

It allows users to create projects, add team members, create and assign tickets, update ticket statuses, and communicate through comments.

The main aim of this project is to make project management and bug tracking easier, faster, and more organised.

**Live Website:** https://bug-tracker-qxsk13ga3-sarnali.vercel.app/

**GitHub Repository:** https://github.com/sarnalipaul98/bug-tracker

# 2. Research
During the research phase, I studied how software development teams manage projects and track bugs.

I identified some common problems:

- Managing multiple projects can be difficult.
- Tracking bugs manually can cause confusion.
- Team members need a clear way to share responsibilities.
- It can be difficult to know the current status of each task.
- Communication about issues should be organised in one place.

To solve these problems, I decided to develop a web-based Bug Tracker application.

The project focuses on improving teamwork, task organisation, issue tracking, and productivity.

## 3. Technology Stack and Libraries

The project uses the MERN-based full-stack development approach.

### Frontend Technologies

| Technology / Library | Purpose and Reason |
|---|---|
| React.js | Used to build interactive and reusable user interface components. |
| Vite | Provides a fast development server and frontend build process. |
| Tailwind CSS | Used to create responsive and attractive designs quickly. |
| React Hot Toast | Displays success and error notifications to users. |

### Backend Technologies

| Technology / Library | Purpose and Reason |
|---|---|
| Node.js | Provides the JavaScript runtime for the backend. |
| Express.js | Used to create APIs and handle client requests. |
| MongoDB Atlas | Stores user accounts, projects, tickets, and comments in the cloud. |
| Mongoose | Helps create database models and interact with MongoDB. |
| bcryptjs | Hashes passwords to improve account security. |
| jsonwebtoken (JWT) | Used for user authentication and protected API access. |

### Other Tools

- **Postman:** Used to test backend APIs.
- **Git and GitHub:** Used for version control and project code management.
- **Render:** Used to deploy the backend.
- **Vercel:** Used to deploy the frontend.

## 4. Functionality of the Project

The Bug Tracker application provides the following functionalities:

### 1. User Authentication
- Users can register and log in.
- Passwords are securely hashed.
- JWT authentication protects private routes.
- Users can log out of their accounts.

### 2. Project Management
- Users can create new projects.
- Users can view and update project details.
- Users can delete projects.
- Projects can have multiple team members.

### 3. Team Member Management
- Users can add team members using their email addresses.
- Users can remove team members from projects.
- Team members can collaborate on project tasks.

### 4. Bug and Ticket Management
- Users can create bug tickets.
- Tickets can be assigned to team members.
- Users can set ticket priorities such as Low, Medium, and High.
- Users can edit and delete tickets.

### 5. Kanban Board
Tickets are organised into different statuses:

- Open
- In Progress
- Resolved
- Closed

Users can move tickets between statuses using drag and drop.

### 6. Search and Filtering
- Search tickets by keywords.
- Filter tickets by status.
- Filter tickets by priority.
- Filter tickets by assignee.

### 7. Comments
- Users can add comments to tickets.
- Comments help team members communicate about issues.

### 8. Notifications and Responsive Design
- Success and error toast notifications provide feedback.
- Loading indicators appear during loading operations.
- The application supports desktop and mobile screens.

## 5. Conclusion

The Bug Tracker project helped me understand how to develop and deploy a full-stack web application.

Through this project, I gained practical knowledge of React, Node.js, Express.js, MongoDB, API development, authentication, database management, and deployment.

This application provides an organised platform for managing projects, tracking bugs, assigning tasks, and improving team collaboration.

Overall, the project improved my technical skills and gave me practical experience in full-stack web development.