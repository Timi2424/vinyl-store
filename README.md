# Vinyl Store Application

Welcome to the Vinyl Store Application, a full-featured NestJS application that allows users to explore and purchase vinyl records, leave reviews, and manage their profiles. Admin users have additional capabilities to manage records, view system logs, and more. This project uses powerful tools like Google auth for authentication, Stripe for payment processing, and a PostgreSQL database to handle persistent data storage.

## Features

- **User Authentication**: Secure login via Google auth.
- **Profile Management**: Users can view, edit, and delete their profiles.
- **Vinyl Record Management**: Explore vinyl records, add reviews, and make purchases.
- **Admin Capabilities**: Admins can manage records, view logs, and moderate reviews.
- **Payment Processing**: Integrates with Stripe for secure payments.
- **Full API Documentation**: Explore all available routes and endpoints at `/api/docs`.

## Technologies Used

- **NestJS**: A progressive Node.js framework for building efficient, reliable, and scalable server-side applications.
- **Auth0**: Handles secure user authentication.
- **Stripe**: Powers the payment processing for vinyl purchases.
- **PostgreSQL**: Database management system for data persistence.
- **Swagger**: Full API documentation available at `/api/docs`.

## Setup Instructions

### Prerequisites

- **Node.js**: Ensure you have Node.js installed (v14.x or higher recommended).
- **PostgreSQL**: Set up a PostgreSQL database and configure it with the application.

### Installation

1. **Clone the repository**:
  git clone https/ssh
  cd exam
2. **Install dependencies**:
  npm install
3. **Environment Configuration**:
  Create a .env file in the root directory of your project.
  Copy the variables from env.example and fill in the necessary credentials for Auth0, PostgreSQL, email, and Stripe configurations.
4. **Running the Application**:
  npm run start:dev
