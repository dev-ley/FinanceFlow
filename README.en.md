# FinanceFlow

[🇧🇷 Português (Brasil)](README.md) | [🇺🇸 English](README.en.md)

**A Full Stack application for personal finance management.**

FinanceFlow is a web application designed to help users manage their personal finances by tracking income and expenses through a simple, intuitive, and responsive interface.

**Repository:** https://github.com/dev-ley/FinanceFlow

## Features

- **Authentication:** User registration, login, session management, and logout.
- **Secure sessions:** JWT authentication using HTTP-only cookies.
- **Transaction management:** Create, view, edit, and delete income and expense transactions.
- **Financial dashboard:** Overview of account balance, total income, and total expenses.
- **Data protection:** Transactions are associated with their respective users.
- **Responsive interface:** Layout adapted for desktops, tablets, and mobile devices.

## Tech Stack

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS

### Backend
- NestJS
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT
- bcrypt

### Infrastructure and Tools
- Docker
- Git
- GitHub
- REST API

## Architecture

FinanceFlow uses a separated frontend and backend architecture.

- **Frontend:** Provides the user interface and communicates with the backend API.
- **Backend:** Handles authentication, business logic, and transaction management.
- **Database:** PostgreSQL stores user and financial transaction data.
- **ORM:** Prisma manages database access and data operations.

## Getting Started

### Prerequisites

- Node.js
- npm
- Docker
- PostgreSQL

### Installation

Clone the repository:

```bash
git clone https://github.com/dev-ley/FinanceFlow.git
cd FinanceFlow
```

Configure and start the frontend and backend by following the instructions in their respective directories.

### Environment Variables

Configure the required environment variables locally before starting the backend.

**Important:** Never commit passwords, JWT secrets, credentials, or `.env` files to the repository.

## Project Structure

```text
FinanceFlow/
├── backend/
│   ├── prisma/
│   └── src/
└── frontend/
    └── app/
```

## Project Goals

FinanceFlow was developed as a portfolio project to demonstrate practical Full Stack development skills, including:

- REST API development.
- Authentication and session management.
- Database modeling and persistence.
- CRUD operations.
- Frontend and backend integration.
- Responsive interface development.
- Code organization and security best practices.

## Project Status

The core features have been implemented: authentication, financial dashboard, and complete transaction management.

Potential future improvements include automated tests, financial reports, and additional data visualizations.

## Author

**Wesley Rodrigues**
Full Stack Web Developer

- GitHub: [@dev-ley](https://github.com/dev-ley)
- LinkedIn: [wr-dev](https://www.linkedin.com/in/wr-dev/)
- Portfolio: [westack.netlify.app](https://westack.netlify.app)
