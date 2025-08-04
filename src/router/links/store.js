const express = require('express');
const router = express.Router();
const { isLoggedIn, isNotLoggedIn } = require('../../lib/auth');
require('dotenv').config();
const {TYPE_DATABASE}=process.env;
/*
*----------------------functions-----------------*/
//functions image
const {
    get_path_img,
    delate_image_upload,
    upload_image_to_space,
    delete_image_from_space,
    create_a_new_image,
    delate_image
} = require('../../services/connectionWithDatabaseImage');
//functions branch
const {
    get_data_branch,
    get_all_box_of_the_branch_with_his_id
} = require('../../services/branch');

const {
    get_data_employee
} = require('../../services/employees');

const {
    get_all_ad,
} = require('../../services/ad');

const {
    this_employee_works_here,
    get_all_dish_and_combo,
    get_all_data_combo_most_sold,
    get_data_recent_combos,
    get_all_products_in_sales,
    get_all_the_promotions,
    get_the_products_most_sales_additions,
    get_all_dish_and_combo_without_lots
} = require('../../services/store');

const {
    get_all_invoice_with_the_id_of_the_branch
} = require('../../services/invoice');

const {
    get_data_company_with_id
} = require('../../services/company');

//functions permission
const {
    this_user_have_this_permission
} = require('../../services/permission');

const {
    get_the_setting_of_the_ticket
} = require('../../services/ticket');

router.get('/:id_user/:id_company/:id_branch/:id_employee/:id_role/store-home', isLoggedIn, async (req, res) => {
    try {

        const { id_company, id_branch } = req.params;

        //we will see if the user not have the permission for this App.
        if(!this_user_have_this_permission(req.user,id_company, id_branch,'app_point_sales')){
            req.flash('message', 'Lo siento, no tienes permiso para esta acción 😅');
            return res.redirect(`/links/${id_company}/${id_branch}/permission_denied`);
        }

        const branchFree = await get_data_branch(id_branch);
        const dataEmployee = await get_data_employee(req);

        const dishAndCombo = null;//await get_all_dish_and_combo_without_lots(id_branch) //get_the_products_most_sales_additions(id_branch);
        
        /*
        const newCombos = await get_data_recent_combos(id_company);
        const mostSold = await get_all_data_combo_most_sold(id_branch);
        const offerAd = await get_all_ad(id_branch, 'offer');
        const newAd = await get_all_ad(id_branch, 'new');
        const combosAd = await get_all_ad(id_branch, 'combo');
        const specialsAd = await get_all_ad(id_branch, 'special');
        */

        const addition = '{"nombre": "Juan", "edad": 30, "ciudad": "Madrid"}'; // Ejemplo de datos adicionales
        const boxes=await get_all_box_of_the_branch_with_his_id(id_branch);
        const promotions=await get_all_the_promotions(id_branch);

        //const productsSales=await get_all_products_in_sales(id_branch);
        const dataCompany=await get_data_company_with_id(id_company);
        const templateData = {
            branchFree,
            dataEmployee,

            /*
            mostSold,
            newCombos,
            offerAd,
            newAd,
            combosAd,
            specialsAd,
            */

            boxes,
            dataCompany,
            promotions,
            addition: JSON.stringify(addition)
        };

        res.render('links/store/home/home', templateData);
    } catch (error) {
        console.error('Error en la ruta store-home:', error);
        res.render('error'); // Renderizar una página de error adecuada
    }
});

router.get('/:id_company/:id_branch/point-sales', isLoggedIn, async (req, res) => {
    try {

        const { id_company, id_branch } = req.params;

        //we will see if the user not have the permission for this App.
        if(!this_user_have_this_permission(req.user,id_company, id_branch,'app_point_sales')){
            req.flash('message', 'Lo siento, no tienes permiso para esta acción 😅');
            return res.redirect(`/links/${id_company}/${id_branch}/permission_denied`);
        }

        const branchFree = await get_data_branch(id_branch);
        const dataEmployee = await get_data_employee(req);

        const dishAndCombo = await get_all_dish_and_combo_without_lots(id_branch) //get_the_products_most_sales_additions(id_branch);
        /*
        const newCombos = await get_data_recent_combos(id_company);
        const mostSold = await get_all_data_combo_most_sold(id_branch);
        const offerAd = await get_all_ad(id_branch, 'offer');
        const newAd = await get_all_ad(id_branch, 'new');
        const combosAd = await get_all_ad(id_branch, 'combo');
        const specialsAd = await get_all_ad(id_branch, 'special');
        */

        const addition = '{"nombre": "Juan", "edad": 30, "ciudad": "Madrid"}'; // Ejemplo de datos adicionales
        const boxes=[] //await get_all_box_of_the_branch_with_his_id(id_branch);
        const promotions=await get_all_the_promotions(id_branch);

        //const productsSales=await get_all_products_in_sales(id_branch);
        const dataCompany=await get_data_company_with_id(id_company);
        const dataTicket=await get_the_setting_of_the_ticket(id_company, id_branch);

        const templateData = {
            branchFree,
            dishAndCombo,
            dataEmployee,
            boxes,
            dataCompany,
            promotions,
            dataTicket,
            addition: JSON.stringify(addition)
        };

        res.render('links/store/home/home', templateData);
    } catch (error) {
        console.error('Error en la ruta store-home:', error);
        res.render('error'); // Renderizar una página de error adecuada
    }
});


router.get('/store-home', isLoggedIn, async (req, res) => {
    res.render('links/store/home/home');
})


router.get('/:id_company/:id_branch/:id_employee/create-invoice', isLoggedIn, async (req, res) => {
    res.render('links/store/invoice/createInvoice');
})

router.get('/:id_company/:id_branch/invoice', isLoggedIn, async (req, res) => {
    const {id_branch}=req.params;
    const branchFree = await get_data_branch(id_branch);
    const invoice=await get_all_invoice_with_the_id_of_the_branch(id_branch);
    res.render('links/store/invoice/invoice',{branchFree,invoice});
})




const database = require('../../database');

router.post('/search-products', isLoggedIn, async (req, res) => {
  const {id_branch,barcode}=req.body;

  try {
    //her we will see if the user would like search a barcode
    let products;
    console.log('-----------------------------------------------------------')
    console.log(barcode)
    if(barcode){
      products = await get_the_products_with_barcode(id_branch, barcode);
    }else{
      products = await get_first_products_by_branch(id_branch);
      console.log(products)
    }
    res.json({ success: true, products });
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
})


async function get_taxes_by_feature_id(idFeature) {
    if (TYPE_DATABASE === 'mysqlite') {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT 
                    t.id AS tax_id,
                    t.name,
                    t."taxId",
                    t.base,
                    t.rate,
                    t.is_retention,
                    t.activate,
                    t.this_taxes_is_in_all,
                    t.id_branches
                FROM 
                    taxes_relation tr
                INNER JOIN 
                    taxes_product t ON tr.id_taxes = t.id
                WHERE 
                    tr.id_dish_and_combo_features = ?
            `;
            database.all(query, [idFeature], (err, rows) => {
                if (err) {
                    console.error("❌ Error en get_taxes_by_feature_id (SQLite):", err);
                    return resolve([]);
                }
                resolve(rows || []);
            });
        });

    } else {
        try {
            const query = `
                SELECT 
                    t.id AS tax_id,
                    t.name,
                    t."taxId",
                    t.base,
                    t.rate,
                    t.is_retention,
                    t.activate,
                    t.this_taxes_is_in_all,
                    t.id_branches
                FROM 
                    "Branch".taxes_relation tr
                INNER JOIN 
                    "Branch".taxes_product t ON tr.id_taxes = t.id
                WHERE 
                    tr.id_dish_and_combo_features = $1
            `;
            const result = await database.query(query, [idFeature]);
            return result.rows || [];
        } catch (error) {
            console.error("❌ Error en get_taxes_by_feature_id (PostgreSQL):", error);
            return [];
        }
    }
}

async function get_the_products_with_barcode(id_branch, barcode) {
  const likeValue = `%${barcode}%`;
  console.log(barcode)
  if (TYPE_DATABASE === 'mysqlite') {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
            i.*,
            d.barcode,
            d.name,
            d.description,
            d.img,
            d.id_product_department,
            d.id_product_category,
            d.this_product_is_sold_in_bulk,
            d.this_product_need_recipe,
            COALESCE(json_group_array(
              json_object(
                'id', l.id,
                'number_lote', l.number_lote,
                'initial_existence', l.initial_existence,
                'current_existence', l.current_existence,
                'date_of_manufacture', l.date_of_manufacture,
                'expiration_date', l.expiration_date
              )
            ), '[]') AS lots
        FROM dish_and_combo_features i
        INNER JOIN dishes_and_combos d ON i.id_dishes_and_combos = d.id
        LEFT JOIN lots l ON l.id_dish_and_combo_features = i.id
        WHERE i.id_branches = ? AND (d.barcode LIKE ? OR d.name LIKE ? OR d.description LIKE ?)
        GROUP BY i.id, d.id
        LIMIT 20;
      `;

      database.all(query, [id_branch, likeValue, likeValue, likeValue], async (err, rows) => {
        if (err) {
          console.error('Error filtering products by barcode (SQLite):', err);
          return resolve([]);
        }

        // Obtener los impuestos para cada producto
        const productsWithTaxes = await Promise.all(
          rows.map(async (product) => {
            const taxes = await get_taxes_by_feature_id(product.id);
            return { ...product, taxes };
          })
        );

        resolve(productsWithTaxes);
      });
    });
  } else {
    const queryText = `
      SELECT 
          i.*,
          d.barcode,
          d.name,
          d.description,
          d.img,
          d.id_product_department,
          d.id_product_category,
          d.this_product_is_sold_in_bulk,
          d.this_product_need_recipe,
          COALESCE(
              json_agg(
                  jsonb_build_object(
                      'id', l.id,
                      'number_lote', l.number_lote,
                      'initial_existence', l.initial_existence,
                      'current_existence', l.current_existence,
                      'date_of_manufacture', l.date_of_manufacture,
                      'expiration_date', l.expiration_date
                  )
                  ORDER BY l.expiration_date ASC
              ) FILTER (WHERE l.id IS NOT NULL), '[]'
          ) AS lots
      FROM "Inventory".dish_and_combo_features i
      INNER JOIN "Kitchen".dishes_and_combos d ON i.id_dishes_and_combos = d.id
      LEFT JOIN "Inventory".lots l ON l.id_dish_and_combo_features = i.id
      WHERE i.id_branches = $1 AND (d.barcode ILIKE $2 OR d.name ILIKE $2)
      GROUP BY i.id, d.id
      LIMIT 20;
    `;

    try {
      const result = await database.query(queryText, [id_branch, likeValue]);

      const productsWithTaxes = await Promise.all(
        result.rows.map(async (product) => {
          const taxes = await get_taxes_by_feature_id(product.id);
          return { ...product, taxes };
        })
      );

      return productsWithTaxes;
    } catch (error) {
      console.error('Error filtering products by barcode (PostgreSQL):', error);
      return [];
    }
  }
}

async function get_first_products_by_branch(id_branch) {
  if (TYPE_DATABASE === 'mysqlite') {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
            i.*,
            d.barcode,
            d.name,
            d.description,
            d.img,
            d.id_product_department,
            d.id_product_category,
            d.this_product_is_sold_in_bulk,
            d.this_product_need_recipe,
            COALESCE(json_group_array(
              json_object(
                'id', l.id,
                'number_lote', l.number_lote,
                'initial_existence', l.initial_existence,
                'current_existence', l.current_existence,
                'date_of_manufacture', l.date_of_manufacture,
                'expiration_date', l.expiration_date
              )
            ), '[]') AS lots
        FROM dish_and_combo_features i
        INNER JOIN dishes_and_combos d ON i.id_dishes_and_combos = d.id
        LEFT JOIN lots l ON l.id_dish_and_combo_features = i.id
        WHERE i.id_branches = ?
        GROUP BY i.id, d.id
        ORDER BY i.id ASC
        LIMIT 20;
      `;

      database.all(query, [id_branch], async (err, rows) => {
        if (err) {
          console.error('Error getting products (SQLite):', err);
          return resolve([]);
        }

        const productsWithTaxes = await Promise.all(
          rows.map(async (product) => {
            const taxes = await get_taxes_by_feature_id(product.id);
            return { ...product, taxes };
          })
        );

        resolve(productsWithTaxes);
      });
    });
  } else {
    const queryText = `
      SELECT 
          i.*,
          d.barcode,
          d.name,
          d.description,
          d.img,
          d.id_product_department,
          d.id_product_category,
          d.this_product_is_sold_in_bulk,
          d.this_product_need_recipe,
          COALESCE(
              json_agg(
                  jsonb_build_object(
                      'id', l.id,
                      'number_lote', l.number_lote,
                      'initial_existence', l.initial_existence,
                      'current_existence', l.current_existence,
                      'date_of_manufacture', l.date_of_manufacture,
                      'expiration_date', l.expiration_date
                  )
                  ORDER BY l.expiration_date ASC
              ) FILTER (WHERE l.id IS NOT NULL), '[]'
          ) AS lots
      FROM "Inventory".dish_and_combo_features i
      INNER JOIN "Kitchen".dishes_and_combos d ON i.id_dishes_and_combos = d.id
      LEFT JOIN "Inventory".lots l ON l.id_dish_and_combo_features = i.id
      WHERE i.id_branches = $1
      GROUP BY i.id, d.id
      ORDER BY i.id ASC
      LIMIT 20;
    `;

    try {
      const result = await database.query(queryText, [id_branch]);

      const productsWithTaxes = await Promise.all(
        result.rows.map(async (product) => {
          const taxes = await get_taxes_by_feature_id(product.id);
          return { ...product, taxes };
        })
      );

      return productsWithTaxes;
    } catch (error) {
      console.error('Error getting products (PostgreSQL):', error);
      return [];
    }
  }
}



async function get_the_products_with_barcode2(id_branch, barcode) {
  const likeValue = `%${barcode}%`;

  if (TYPE_DATABASE === 'mysqlite') {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
            i.*,
            d.barcode,
            d.name,
            d.description,
            d.img,
            d.id_product_department,
            d.id_product_category,
            d.this_product_is_sold_in_bulk,
            d.this_product_need_recipe,
            COALESCE(json_group_array(
              json_object(
                'id', l.id,
                'number_lote', l.number_lote,
                'initial_existence', l.initial_existence,
                'current_existence', l.current_existence,
                'date_of_manufacture', l.date_of_manufacture,
                'expiration_date', l.expiration_date
              )
            ), '[]') AS lots
        FROM dish_and_combo_features i
        INNER JOIN dishes_and_combos d ON i.id_dishes_and_combos = d.id
        LEFT JOIN lots l ON l.id_dish_and_combo_features = i.id
        WHERE i.id_branches = ? AND (d.barcode LIKE ? OR d.name LIKE ?)
        GROUP BY i.id, d.id
        LIMIT 20;
      `;

      database.all(query, [id_branch, likeValue], (err, rows) => {
        if (err) {
          console.error('Error filtering products by barcode (SQLite):', err);
          return resolve([]);
        }
        return resolve(rows);
      });
    });
  } else {
    const queryText = `
      SELECT 
          i.*,
          d.barcode,
          d.name,
          d.description,
          d.img,
          d.id_product_department,
          d.id_product_category,
          d.this_product_is_sold_in_bulk,
          d.this_product_need_recipe,
          COALESCE(
              json_agg(
                  jsonb_build_object(
                      'id', l.id,
                      'number_lote', l.number_lote,
                      'initial_existence', l.initial_existence,
                      'current_existence', l.current_existence,
                      'date_of_manufacture', l.date_of_manufacture,
                      'expiration_date', l.expiration_date
                  )
                  ORDER BY l.expiration_date ASC
              ) FILTER (WHERE l.id IS NOT NULL), '[]'
          ) AS lots
      FROM "Inventory".dish_and_combo_features i
      INNER JOIN "Kitchen".dishes_and_combos d ON i.id_dishes_and_combos = d.id
      LEFT JOIN "Inventory".lots l ON l.id_dish_and_combo_features = i.id
      WHERE i.id_branches = $1 AND (d.barcode ILIKE $2 OR d.name ILIKE $2)
      GROUP BY i.id, d.id
      LIMIT 20;
    `;

    try {
      const result = await database.query(queryText, [id_branch, likeValue]);
      return result.rows;
    } catch (error) {
      console.error('Error filtering products by barcode (PostgreSQL):', error);
      return [];
    }
  }
}

//-----------------------------this is cfor create facture CDFI
const fs = require('fs');






router.post('/create-facture-cfdi', isLoggedIn,async (req, res) => {
    try {
      const {
        rfcEmisor,
        nombreEmisor,
        rfcReceptor,
        nombreReceptor,
        passwordCSD,
        descripcion,
        cantidad,
        valorUnitario,
        regimenFiscal,
        usoCFDI,
        importe,
        domicilioReceptor,
        codigoPostalReceptor,
        razonSocial,
        Neighborhood,
        municipioReceptor,
        estadoReceptor,
        InteriorNumber,
        ExteriorNumber,
      } = req.body;
  
      // Generar el XML
      const cfdiData = {
        emisor: {
          rfc: rfcEmisor,
          nombre: nombreEmisor,
          regimenFiscal: regimenFiscal
        },
        receptor: {
          rfc: rfcReceptor,
          nombre: nombreReceptor,
          usoCFDI: usoCFDI
        },
        conceptos: [
          {
            claveProdServ: '01010101',
            cantidad: Number(cantidad),
            claveUnidad: 'ACT',
            descripcion,
            valorUnitario: parseFloat(valorUnitario),
            importe
          }
        ]
      };



      const date=new Date();
      const idSales=1;
      const rfcUser="URE180429TM6";
      const nameUser="UNIVERSIDAD ROBOTICA ESPAÑOLA";

      const dt={	    
        
          "CfdiType": "I",
          "PaymentForm": "01",
          "PaymentMethod": "PUE",
          "ExpeditionPlace" : "78240",
          "Date" : date,
          "Folio": idSales,

            //El Issuer es el emisor, y el emisor es quien vende el producto o servicio y quien timbra la factura con su RFC ante el SAT.
            //osea mi cliente, el usuario propietario de la licencia plus
            "Issuer": {
                "FiscalRegime": "601",
                "Rfc": rfcUser,
                "Name": nameUser
            },


          //El receptor es el cliente final de esa tienda (quien compró algo y pidió factura).
          "Receiver": {
            "Rfc": rfcEmisor,
            "CfdiUse": usoCFDI,
          "Name": nombreReceptor,
          "FiscalRegime": regimenFiscal,

          //informacion del receptor (el cliente).
          "TaxZipCode" : codigoPostalReceptor,
            "Address": {
              "Street" : domicilioReceptor,
              "ExteriorNumber" : ExteriorNumber,
              "InteriorNumber" : InteriorNumber,
              "Neighborhood": Neighborhood,
              "ZipCode" : codigoPostalReceptor,
              "Municipality" : municipioReceptor,
              "State" : estadoReceptor,
              "Country" : "México"
            }
          },

          //los elementos que compro el receptor (el cliente).
          "Items": [{        
            "ProductCode": "25173108",
            "Description": "GPS estandar pruebas",
            "UnitCode": "E48",
            "Quantity": 1.0,
            "UnitPrice": 100.0,
            "Subtotal": 100.00,
          "TaxObject" : "02",
            "Taxes": [{
              "Total": 16,
                    "Name": "IVA",
                    "Base": 100,
                    "Rate": 0.16,
                    "IsRetention": false
            }],


            "Total": 116
          }]	
        }
    } catch (error) {
      console.error('Error al generar/timbrar CFDI:', error);
      res.status(500).json({ success: false, message: 'Error al timbrar el CFDI', error: error.message });
    }
});




const path = require('path');

router.post('/subir-sat', isLoggedIn, async (req, res) => {
  try {
    const archivoTemporal = req.file.path;
    const extension = path.extname(req.file.originalname).toLowerCase(); // .key o .cer

    if (!req.file) {
      res.status(400).json({ success: false, message: 'No se recibió ningún archivo' });
    }

    if (!['.key', '.cer'].includes(extension)) {
       return res.status(400).json({ success: false, message: 'Solo se permiten archivos .key o .cer' });
    }

    const destinoCarpeta = path.join(__dirname, '../../public/sat-uploads');
    
    // Crear la carpeta si no existe
    if (!fs.existsSync(destinoCarpeta)) {
      fs.mkdirSync(destinoCarpeta, { recursive: true });
    }

    const rutaFinal = path.join(destinoCarpeta, `sat${extension}`);

    // Si ya existe un archivo con ese nombre, lo elimina
    if (fs.existsSync(rutaFinal)) {
      fs.unlinkSync(rutaFinal);
    }

    // Mueve y renombra el archivo
    fs.rename(archivoTemporal, rutaFinal, (err) => {
      if (err) {
        console.error('Error al mover archivo:', err);
        return res.status(500).send('Error al mover archivo');
      }

      res.json({ success: true, message: `Archivo ${extension} subido y reemplazado correctamente` });
    });

  } catch (err) {
    console.error('Error general:', err);
    res.status(500).json({ success: false, message: 'Error interno al mover el archivo' });
  }
});


module.exports = router;