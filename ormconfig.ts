import { DataSource } from "typeorm";

export const MyDataSource = new DataSource({
   "type": "postgres",
   "host": "localhost",
   "port": 5432,
   "username": "postgres",
   "password": "password",
   "database": "blockchain",
   "synchronize": true,
   "logging": true,
   "entities": [
      "api/src/entity/**/*.ts"
   ],
   "migrations": [
      "api/src/migration/**/*.ts"
   ],
   "subscribers": [
      "api/src/subscriber/**/*.ts"
   ]
})

// datasource for testing purpose
export const TestDataSource = new DataSource({
   "type": "postgres",
   "host": "localhost",
   "port": 5432,
   "username": "postgres",
   "password": "password",
   "database": "blockchain-test",
   "synchronize": true,
   "logging": false,
   "dropSchema": true,
   "entities": [
      "api/src/entity/**/*.ts"
   ],
   "migrations": [
      "api/src/migration/**/*.ts"
   ],
   "subscribers": [
      "api/src/subscriber/**/*.ts"
   ]
})
