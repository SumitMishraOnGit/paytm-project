# thePaymentsApp

thePaymentsApp is a modern and secure payment application that allows users to make instant money transfers. This project is built using React, Tailwind CSS, and Node.js (Express).

## Features

* **User Authentication**: Secure sign-up and sign-in process.
* **Balance Inquiry**: Users can view their current account balance.
* **Money Transfer**: Easily send money to other users on the platform.
* **User Search**: Functionality to search for other registered users on the dashboard.
* **Responsive Design**: Provides a great user experience on both mobile and desktop devices.

---

## Tech Stack

### Frontend

* **React**: For building the user interface.
* **React Router DOM**: For client-side navigation.
* **Axios**: For making API calls to the backend.
* **Tailwind CSS**: For fast, utility-first styling.

### Backend

* **Node.js & Express**: For server-side logic and creating REST API endpoints.
* **Zod**: For robust request body validation.
* **JWT (JSON Web Tokens)**: For authentication and authorization.
* **Mongoose**: To interact with the MongoDB database.
* **MongoDB**: The primary database for the application.

---

## Getting Started

This project is divided into two separate directories: `frontend` and `backend`. Both need to be run independently.

### Prerequisites

* Node.js (v18 or higher)
* npm (v8 or higher)
* A running MongoDB instance (local or cloud-based)

### Installation

1.  Clone the repository:

    ```bash
    git clone [https://github.com/SumitMishraOnGit/paytm-project](https://github.com/SumitMishraOnGit/paytm-project)
    cd paytm
    ```

2.  Set up the backend:

    ```bash
    cd backend
    npm install
    ```

    Create a `.env` file and add the following variables:

    ```
    MONGO_URI = <Your_MongoDB_Connection_String>
    JWT_SECRET = <A_long_random_string_for_JWT_secret>
    ```

    Then start the server:

    ```bash
    node server.js
    ```

3.  Set up the frontend:

    ```bash
    cd ../frontend
    npm install
    ```

    Create a `.env` file and add the backend URL:

    ```
    VITE_BACKEND_URL = http://localhost:5000
    ```

    Then start the development server:

    ```bash
    npm run dev
    ```

Your application should now be running at `http://localhost:5173`.

---

## Deployment

This app is successfully deployed on Vercel and Render.

* **Frontend**: To deploy on Vercel, it's essential to configure the `Root Directory` to `frontend/` in the Vercel dashboard settings. This ensures the single-page application's routing works correctly.
* **Backend**: Deployed on Render. Make sure environment variables (like `MONGO_URI` and `JWT_SECRET`) are correctly configured in the Render dashboard.