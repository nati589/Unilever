import mysql from "mysql";
import dotenv from 'dotenv';

dotenv.config();

export  const db = mysql.createConnection({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,   
});