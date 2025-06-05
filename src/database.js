//we will watch all the data of the database
require('dotenv').config();
const {APP_PG_USER,APP_PG_HOST,APP_PG_DATABASE,APP_PG_PASSWORD,APP_PG_PORT, TYPE_DATABASE}=process.env;
const { get_path_database } = require('./initialAppForDesktop');

let dbClient = null;

if (TYPE_DATABASE === 'mysqlite') {
  const sqlite3 = require('sqlite3').verbose();
  const path = require('path');
  const dbPath = get_path_database();

  dbClient = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('❌ Error al conectar con SQLite', err);
    } else {
      console.log('✅ Conexión exitosa a SQLite');
    }
  });

} else {
  const  { Client }=require('pg');
  const {promisify}=require('util');
  const {database}=require('./keys');

  const {
    APP_PG_USER,
    APP_PG_HOST,
    APP_PG_DATABASE,
    APP_PG_PASSWORD,
    APP_PG_PORT
  } = process.env;

  const client = new Client({
    user: APP_PG_USER,
    host: APP_PG_HOST,
    database: APP_PG_DATABASE,
    password: APP_PG_PASSWORD,
    port: APP_PG_PORT,
    /*
    ssl: {
      rejectUnauthorized: false,
    }*/
  });

  dbClient=client;

  client.connect()
    .then(() => {
      console.log('Conexión exitosa a PostgreSQL');
      // Realiza tus operaciones con la base de datos aquí
    })
    .catch((error) => {
      console.error('Error al conectar a PostgreSQL', error);
    });

  promisify(client.query);
}

module.exports = dbClient;