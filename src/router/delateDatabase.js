//require
require('dotenv').config();
const {TYPE_DATABASE}=process.env;
const express=require('express');
//const router=express.Router();
const database=require('../database');

async function delate_product_department(id) {
  if (TYPE_DATABASE === 'mysqlite') {
    const queryText = 'DELETE FROM product_department WHERE id = ?';
    return new Promise((resolve) => {
      database.run(queryText, [id], function(err) {
        if (err) {
          console.error('Error al eliminar el registro en SQLite:', err);
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  } else {
    // PostgreSQL
    const queryText = 'DELETE FROM product_department WHERE id = $1';
    try {
      await database.query(queryText, [id]);
      return true;
    } catch (error) {
      console.error('Error al eliminar el registro en PostgreSQL:', error);
      return false;
    }
  }
}



module.exports={
    delate_product_department
};