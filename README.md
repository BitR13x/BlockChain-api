# Web3 Backend API for User Authentication and Profile Management

Welcome to the Web3 Backend API project! This API provides user authentication, registration, and profile management functionalities using both Metamask and traditional credentials. It also supports changing user addresses and usernames.

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Main Technologies Used](#main-technologies-used)
- [Getting Started](#getting-started)
  - [Installation](#installation)
  - [Configuration](#configuration)
- [API Endpoints](#api-endpoints)
- [Hosting](#hosting)
- [License](#license)

## Introduction

Project created for fun and to learn myself a web3 development and testing. I wanted to share with world some of my code that can help others on their way.

Open project if someone wants to contribute or fork, go for it.

## Features

- User registration and login using Metamask.
- User registration and login using traditional credentials (username and password).
- A small User profile management, including changing addresses and usernames.

## Main technologies Used

- Web3.js
- Express
- Postgres
- typeorm
- typescript
- Argon
- Mocha
- Joi
- [Metamask](https://metamask.io/)

## Getting Started

Provide instructions for setting up and running your project.

### Installation

1. Clone this repository: `git clone https://github.com/BitR13x/BlockChain-api.git`
2. Navigate to the project directory: `cd BlockChain-api`
3. `git clone https://github.com/OpenZeppelin/openzeppelin-contracts.git && mkdir -p openzeppelin && mv openzeppelin-contracts/contracts openzeppelin && rm -rf openzeppelin-contracts`
4. Install dependencies: `npm install`

3rd step is for clonning the openzeppelin library.

### Configuration

1. Open `ormconfig.ts` and configure database connection.
2. Open `config.ts` and change according your needs.

### Starting

```json
// commands in package.json
{
  "start": "nodemon --exec ts-node app.ts",
  "start-node": "hardhat node",
  "deploy": "hardhat run --network localhost scripts/deploy.ts",
  "clean": "hardhat clean",
  "test": "npm run test:server && npm run test:contracts",
  "test:server": "mocha --require ts-node/register test/*.test.ts",
  "test:contracts": "mocha --require ts-node/register/transpile-only contracts/test/*.test.ts"
}
```

You can use `npm` or `yarn` to start tests or server.

Example: `npm run start` or `npm run test:server`.

## API Endpoints

List and briefly explain the API endpoints your backend provides.

- `/api` - account router
  - `POST /api/login`
  - `POST /api/register`
  - `POST /api/delete/account`
  - `POST /api/logout`
- `/api/profile` - profile router
  - `POST /api/profile/change-password`
  - `POST /api/profile/change-username`
  - `POST /api/profile/change-address`
  - `POST /api/profile/change-email`
- `/api/blockchain` - blockchain router
  - `POST /api/blockchain/request-nonce`
  - `POST /api/blockchain/authenticate` - login or register using metamask
  - `POST /contract-info/:address` - get own Data contract name and symbol.
- `/~testAPI` - just test for status of server.

## Bonus

### Fetch smart contract ABI

https://abidata.net/
