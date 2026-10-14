# FinanceFlow

[🇧🇷 Português (Brasil)](README.md) | [🇺🇸 English](README.en.md)

**Full Stack Application for Personal Finance Management.**

FinanceFlow is a web application designed to help users organize their personal finances. It allows users to record and manage income and expenses, track their balance, and view a financial summary through a modern, intuitive, and responsive interface.

**Repository:** [github.com/dev-ley/FinanceFlow](https://github.com/dev-ley/FinanceFlow)

## Application Preview

 ![FinanceFlow Dashboard](frontend/public/dashboard.jpeg)
 
## Features

- **User authentication:** registration, login, authenticated session retrieval, and logout.
- **Secure sessions:** JWT-based authentication stored in an `HttpOnly` cookie.
- **Transaction management:** create, view, update, and delete income and expense records.
- **Financial dashboard:** view the balance, total income, and total expenses.
- **Data isolation:** transactions are associated with the authenticated user, with access control enforced by the backend.
- **Data validation:** validation of incoming API requests.
- **Responsive interface:** layout adapted for desktops, tablets, and mobile devices.

## Technologies Used

### Frontend

- [Next.js](https://nextjs.org/) — React framework for web applications.
- [React](https://react.dev/) — user interface development.
- [TypeScript](https://www.typescriptlang.org/) — static typing.
- [Tailwind CSS](https://tailwindcss.com/) — interface styling.

### Backend

- [NestJS](https://nestjs.com/) — framework for API development.
- [TypeScript](https://www.typescriptlang.org/) — typed application development.
- [Prisma ORM](https://www.prisma.io/) — database access and data manipulation.
- [PostgreSQL](https://www.postgresql.org/) — relational database.
- [Passport JWT](https://www.passportjs.org/) / [JWT](https://jwt.io/) — token-based authentication.
- [bcrypt](https://github.com/kelektiv/node.bcrypt.js) — password hashing.

### Infrastructure and Tools

- Docker — containerized database development environment.
- Git and GitHub — version control and code hosting.
- Jest — automated testing.
- ESLint and Oxlint — static analysis and code quality checks.
- REST API — communication between the frontend and backend.

## Architecture

FinanceFlow follows a Full Stack architecture with separate layers for the user interface, API, and data persistence.

```text
FinanceFlow/
├── frontend/                 # Web application
│   ├── app/                  # Pages and layouts
│   │   ├── login/            # Login page
│   │   ├── register/         # Registration page
│   │   ├── globals.css       # Global styles
│   │   ├── layout.tsx        # Main layout
│   │   └── page.tsx          # Home page
│   ├── components/           # Reusable components
│   │   ├── auth/             # Authentication components
│   │   ├── dashboard/        # Dashboard components
│   │   └── transactions/     # Transaction components
│   ├── hooks/                # Authentication and data hooks
│   ├── lib/                  # Utilities and shared functions
│   └── styles/               # Style tokens
│
└── backend/                  # REST API
    ├── prisma/               # Prisma schema and configuration
    ├── src/
    │   ├── auth/             # Authentication and sessions
    │   ├── prisma/           # Database access service
    │   ├── transactions/     # Transaction business logic
    │   ├── users/            # User management
    │   ├── app.module.ts     # Main application module
    │   └── main.ts           # Application entry point
    └── test/                 # Tests and test configuration
```

*Note: The structure above summarizes the main directories. Specific names and files may vary depending on the current version of the repository.*

### Layer Responsibilities

**Frontend**

Responsible for the user interface, navigation, forms, financial data presentation, and API communication. Hooks organize authentication, dashboard, and transaction logic, while components keep the interface modular.

**Backend**

Responsible for the REST API, authentication, request validation, business rules, and data access authorization. The modular structure makes the application easier to maintain and extend.

**Database**

PostgreSQL stores users and their transactions. Prisma ORM provides the data access layer and supports the application's relational data model.

**Communication**

The frontend sends HTTP requests to the backend. Protected routes use the authenticated session to identify the user and control access to their transactions.

## Security

The application implements important security mechanisms for a system that handles personal financial information:

- **JWT in an `HttpOnly` cookie:** prevents JavaScript running in the browser from directly accessing the token.
- **Password hashing with bcrypt:** passwords are not stored in plain text.
- **Protected routes:** private endpoints require authentication.
- **Ownership checks:** transaction operations take the authenticated user into account.
- **Input validation:** the backend validates incoming data to reject invalid requests and unauthorized fields.
- **CORS with credentials:** enables authenticated communication between the frontend and backend for configured origins.
- **Environment-based configuration:** secrets and sensitive configuration values should be kept out of the source code.

> Using `HttpOnly` cookies reduces token exposure to JavaScript but does not eliminate every security risk. In production, HTTPS, CORS, and cookie options must be configured appropriately. CSRF protections should also be evaluated according to the chosen authentication strategy.

## Data Model

The main data model consists of two entities:

- **User:** represents a registered user.
- **Transaction:** represents an income or expense record belonging to a user.

Each transaction contains information such as type, description, amount, date, and an association with its owner. The relationship between users and transactions allows records to be retrieved and managed while respecting data ownership.

## Running the Project

### Prerequisites

- Node.js compatible with the versions used by the project.
- npm.
- Docker and Docker Compose, if using the containerized database environment.
- PostgreSQL, if using a local installation instead.

### 1. Clone the Repository

```bash
git clone https://github.com/dev-ley/FinanceFlow.git
cd FinanceFlow
```

### 2. Configure the Backend

```bash
cd backend
npm install
```

Configure the required environment variables, including the PostgreSQL connection string and JWT secret, according to the names used by the project.

Then run the Prisma migrations according to the repository configuration:

```bash
npx prisma migrate deploy
```

Start the API in development mode:

```bash
npm run start:dev
```

The API uses port `3000` by default, unless overridden by an environment variable.

### 3. Configure the Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend uses port `3001` in the development environment configured for this project.

**Important:** Check the API URL and CORS origin in the configuration files before starting the services. If necessary, adjust them to match the ports being used locally.

### Environment Variables

The exact environment variables depend on the current backend and frontend configuration. Expected settings include:

- PostgreSQL connection URL.
- Secret used to sign JWTs.
- API port.
- Allowed frontend origin or URL.
- API base URL used by the frontend.

Check the project's configuration files to confirm the exact variable names.

**Never publish credentials, JWT secrets, passwords, or `.env` files containing sensitive values to the repository.** If needed, provide a `.env.example` file containing only variable names and placeholder values.

## Testing and Code Quality

The backend uses Jest for automated tests and Oxlint for static analysis.

Run the tests:

```bash
npm test -- --runInBand
```

Run the tests with a coverage report:

```bash
npm run test:cov -- --runInBand
```

Run lint checks:

```bash
npm run lint
```

Build the backend:

```bash
npm run build
```

The existing tests verify basic controller behavior and the instantiation of the transaction service. Test coverage is currently limited and can be expanded in the future to include authentication flows, CRUD operations, and authorization rules.

## Project Goals and Demonstrated Skills

FinanceFlow was developed to consolidate and demonstrate practical Full Stack development skills, including:

- REST API development with NestJS.
- User interface development with Next.js and React.
- TypeScript across frontend and backend.
- JWT-based authentication and `HttpOnly` cookies.
- Password hashing and data validation.
- Relational data modeling and persistence with PostgreSQL.
- Integration with Prisma ORM.
- CRUD operations.
- User-based data access control.
- Modular code organization.
- Automated testing and code quality tools.
- Docker-based development environment configuration.

## Project Status

**Status:** Core features implemented.

FinanceFlow includes user authentication, a financial dashboard, and income and expense management. The project can continue to evolve with improved automated testing, financial reports, additional data visualizations, and production configuration.

Future features are potential improvements and are not necessarily part of the current version.

## Author

**Wesley Rodrigues**  
Full Stack Web Developer

- GitHub: [@dev-ley](https://github.com/dev-ley)
- LinkedIn: [wr-dev](https://www.linkedin.com/in/wr-dev/)
- Portfolio: [westack.netlify.app](https://westack.netlify.app/)
