My Network - Backend Express

## Description

This repository contains the backend implementation for the My-Network application. The backend utilizes JSON Web Token (JWT) for authentication, MongoDB as the database, and Express for handling HTTP requests.

## Deployment
The project is deployed to Render. Can be accessed via:

https://my-network-backend.onrender.com

The Client of this My Network is deployed to Render, and can be accessed on this link:

https://my-network-frontend.onrender.com


## Features

- All the routes are protected , and only requests with a valid token from a signed in user is passed to the corresponding route
- `PUT` to `users/:userId/add` will send a friend request to another user
- `PUT` to `users/:userId/accept` will accept a friend request
- `users/signup` and `users/signin` with `POST` method is to sign in and sign up a new user
- `GET` to `users/sign-token` and `POST` to `users/verify-token` are to sign and verify a recieved token
- `GET` to `profiles/:userId` will give the Profile of a User
- `/posts`: Supports all CRUD operations for posts
- `/posts/:id`: Supports all CRUD operations for a specific 
- `PUT` to `/posts/:id/like`: will like the post
- `POST` to `/posts/:id/comments`: will create a new Comment for a specific Post


## Technologies:
- Node.js
- Express.js
- MongoDB
- JSON Web Token (JWT)
- Mongoose
- bcrypt
- dotenv
- Render
- cors


## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/manijehshirzadeh/my-network-backend.git
   cd project-3-local-market-express
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

    Set up environment variables:

   - Create a `.env` file in the root directory.
   - Add the following environment variables to the `.env` file:
     ```env
     MONGODB_URI=<connection-string-to-mongo-db>
     JWT_SECRET=your_jwt_secret
     ```

3. Start the application:
   ```bash
   npx nodemon
   ```

4. Visit `localhost:3000`

## Next Steps:
- Adding remove a friend functionality to remove a friend from the Freinds List .
- Adding ignore functionality for ignoring a Freind Request.