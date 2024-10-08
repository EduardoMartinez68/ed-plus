const express = require('express');
const router = express.Router();
const { isLoggedIn, isNotLoggedIn } = require('../../lib/auth');

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

//functions supplies
const {
    get_supplies_or_features,
    get_supplies_with_id,
    update_supplies_company,
    get_new_data_supplies_company,
    delate_supplies_company,
    this_is_a_supplies_or_a_products,
    search_company_supplies_or_products_with_company,
    search_company_supplies_or_products_with_id_company,
    search_company_supplies_or_products,
    update_product_category
} = require('../../services/supplies');

//functions branch
const {
    get_data_branch,
    get_branch
} = require('../../services/branch');

//functions branch
const {
    get_combo_features,
    search_supplies_combo,
    search_combo,
    delate_combo_company
} = require('../../services/combos');

//functions branch
const {
    get_data_tabla_with_id_company,
    get_pack_database,
    check_company_other,
    get_data_company_with_id
} = require('../../services/company');

//functions supplies
const {
    get_country,
    get_type_employees,
    get_data_employee
} = require('../../services/employees');

const {
    get_category,
    delate_product_category,
} = require('../../services/foodCategory');

const {
    get_department,
    update_product_department,
    delate_product_department
} = require('../../services/foodDepartment');


//functions providers
//functions providers
const {
    search_providers,
    search_all_providers,
    search_providers_for_name,
    search_all_providers_for_name,
    search_provider,
    delete_provider
} = require('../../services/providers');


/*
*----------------------router-----------------*/
router.get('/:id_user/:id_company/:id_branch/my-store', isLoggedIn, async (req, res) => {
    const { id_company, id_branch } = req.params;
    const branchFree = await get_data_branch(req);
    const employee = await get_data_employee(req);
    if (branchFree != null) {
        res.render('links/restaurant/home', { branchFree , employee});
    } else {
        res.render('links/store/branchLost');
    }
});


//------------------------------------employees
router.get('/:id_company/:id_branch/employees-free', isLoggedIn, async (req, res) => {
    const { id_company, id_branch } = req.params;
    const branchFree = await get_data_branch(req);
    if (branchFree != null) {
        res.render('links/free/employee/employee', { branchFree });
    } else {
        res.render('links/store/branchLost');
    }
});


//------------------------------------supplies
router.get('/:id/:id_branch/supplies-free', isLoggedIn, async (req, res) => {
    const {id_branch } = req.params;
    const branchFree = await get_data_branch(id_branch);
    if (branchFree != null) {
        //const supplies_products = await search_company_supplies_or_products(req, true);
        const supplies = await get_supplies_or_features(id_branch, true)
        res.render('links/free/supplies/supplies', { branchFree, supplies});
    } else {
        res.render('links/store/branchLost');
    }
});

router.get('/:id/:id_branch/products-free', isLoggedIn, async (req, res) => {
    const {id_branch } = req.params;
    const branchFree = await get_data_branch(id_branch);
    if (branchFree != null) {
        //const supplies_products = await search_company_supplies_or_products(req, true);
        const supplies = await get_supplies_or_features(id_branch, false)
        res.render('links/free/supplies/supplies', { branchFree, supplies});
    } else {
        res.render('links/store/branchLost');
    }
});

//------------------------------------combo
router.get('/:id/:id_branch/combos-free', isLoggedIn, async (req, res) => {
    const {id_branch } = req.params;
    const branchFree = await get_data_branch(id_branch);
    if (branchFree != null) {
        //const supplies_products = await search_company_supplies_or_products(req, true);
        const combos = await get_combo_features(id_branch);
        res.render('links/free/combo/combo', { branchFree, combos});
    } else {
        res.render('links/store/branchLost');
    }
});

router.get('/:id_company/:id_branch/:id_dishes_and_combos/edit-data-combo-free', isLoggedIn, async (req, res) => {
    const { id_dishes_and_combos, id_branch,id_company } = req.params;

    const branchFree = await get_data_branch(id_branch);
    const dataForm = [{
        id_company: branchFree[0].id_companies,
        id_branch: branchFree[0].id,
        id_combo: id_dishes_and_combos
    }]
    console.log(dataForm)
    const departments = await get_data_tabla_with_id_company(id_company, "Kitchen", "product_department");
    const category = await get_data_tabla_with_id_company(id_company, "Kitchen", "product_category");

    const supplies = await search_company_supplies_or_products_with_company(id_company, true);
    const products = await search_company_supplies_or_products_with_company(id_company, false);
    const suppliesCombo = await search_supplies_combo(id_dishes_and_combos);
    const combo = await search_combo(id_company, id_dishes_and_combos);


    res.render('links/manager/combo/editCombo', { branchFree, dataForm, departments, category, supplies, products, combo, suppliesCombo });
})

router.get('/:id/:id_branch/add-combos-free', isLoggedIn, async (req, res) => {
    const {id_branch } = req.params;
    const branchFree = await get_data_branch(id_branch);
    if (branchFree != null) {
        const { id } = req.params;
        const packCombo=await get_pack_database(id);
        const combos = await get_combo_features(id_branch);
        if(the_user_can_add_most_combo(combos.length,packCombo)){
            const departments = await get_department(id);
            const category = await get_category(id);
            const supplies = await search_company_supplies_or_products(req, true);
            const products = await search_company_supplies_or_products(req, false);
            const suppliesCombo = []
            res.render('links/free/combo/addCombo', { branchFree,departments,category,supplies,products,suppliesCombo});
        }
        else{
            req.flash('message','Ya alcanzaste el limite maximo para tu base de datos actual. Debes actualizar tu sucursal a la siguiente version 😅')
            res.redirect('/fud/'+id+'/'+id_branch+'/combos-free');
        }
    } else {
        res.render('links/store/branchLost');
    }
});

function the_user_can_add_most_combo(combos,packCombo){
    return combos<=packCombo
}

router.get('/:id_company/:id_branch/:id/delete-combo-free', isLoggedIn, async (req, res) => {
    const { id, id_company, id_branch} = req.params;
    const pathImg = await get_path_img('Kitchen', 'dishes_and_combos', id) //get the image in our database 

    //we will see if can delete the combo of the database 
    if (await delate_combo_company(id, pathImg)) {
        req.flash('success', 'El combo fue eliminado con éxito 😄')
    }
    else {
        req.flash('message', 'El combo NO fue eliminado con éxito 😳')
    }

    res.redirect(`/fud/${id_company}/${id_branch}/combos-free`);
})


//------------------------------------branch
router.get('/:idBranch/:idCompany/edit-branch-free', isLoggedIn, async (req, res) => {
    const country = await get_country();
    const branchFree = await get_branch(req);
    res.render("links/manager/branches/editBranchesFree", { branchFree, country });
})

router.get('/:id/Dashboard', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const sales_history = await databaseM.mongodb('history_sale', id, parseInt(req.user.id));
    res.render('links/manager/reports/dashboard', sales_history);
});


//------------------------------------report
router.get('/report', isLoggedIn, (req, res) => {
    res.render("links/manager/reports/report");
})

router.get('/report-sales', isLoggedIn, (req, res) => {
    res.render("links/manager/reports/sales");
})
//------------------------------------food departament and category 
router.get('/:id_company/:idBranch/food-department-free', isLoggedIn, async (req, res) => {
    const { id_company } = req.params;
    const departments = await get_department(id_company);
    const branchFree = await get_branch(req);
    res.render('links/manager/areas/department', { branchFree, departments })
});

router.get('/:id_company/:id_branch/:id/delete-food-department', isLoggedIn, async (req, res) => {
    const company = await check_company_other(req);
    const { id, id_company, id_branch} = req.params;

    //we will watch if the user have this company
    if (company.length > 0) {
        //we going to see if we can delate the department 
        if (await delate_product_department(id)) {
            req.flash('success', 'El departamento fue eliminado con éxito 😄')
        }
        else {
            req.flash('message', 'El departamento NO fue eliminado con éxito 😳')
        }

        res.redirect(`/fud/${id_company}/${id_branch}/food-department-free`);
    }
    else {
        req.flash('message', 'No tienes los permisos para esto 😳')
        res.redirect('/fud/home');
    }
});

router.get('/:id_company/:id_branch/:id/:name/:description/edit-food-department', isLoggedIn, async (req, res) => {
    const company = await check_company_other(req);
    const { id_company, id_branch, id, name, description } = req.params;

    //we will watch if the user have this company
    if (company.length > 0) {
        //we going to see if we can delate the department 
        if (await update_product_department(id, name, description)) {
            req.flash('success', 'El departamento fue actualizado con éxito 😄')
        }
        else {
            req.flash('message', 'El departamento NO fue actualizado con éxito 😳')
        }

        res.redirect(`/fud/${id_company}/${id_branch}/food-department-free`);
    }
    else {
        req.flash('message', 'No tienes los permisos para esto 😳')
        res.redirect('/fud/home');
    }
});

router.get('/:id_company/:idBranch/food-area-free', isLoggedIn, async (req, res) => {
    const { id_company , idBranch} = req.params;
    const categories = await get_category(id_company);
    const branchFree = await get_branch(req);
    res.render('links/manager/areas/category', { branchFree, categories })
});

router.get('/:id_company/:id_branch/:id/:name/:description/edit-food-category-free', isLoggedIn, async (req, res) => {
    const company = await check_company_other(req);
    const { id_company, id_branch, id, name, description } = req.params;

    //we will watch if the user have this company
    if (company.length > 0) {
        //we going to see if we can delate the department 
        if (await update_product_category(id, name, description)) {
            req.flash('success', 'La categoria fue actualizada con éxito 😄')
        }
        else {
            req.flash('message', 'La categoria NO fue actualizada con éxito 😳')
        }

        res.redirect(`/fud/${id_company}/${id_branch}/food-area-free`);
    }
    else {
        req.flash('message', 'No tienes los permisos para esto 😳')
        res.redirect('/fud/home');
    }
});

router.get('/:id_company/:id_branch/:id/delete-food-category', isLoggedIn, async (req, res) => {
    const company = await check_company_other(req);
    const { id, id_company, id_branch} = req.params;

    //we will watch if the user have this company
    if (company.length > 0) {
        //we going to see if we can delate the department 
        if (await delate_product_category(id)) {
            req.flash('success', 'La categoria fue eliminada con éxito 😄')
        }
        else {
            req.flash('message', 'La categoria NO fue eliminada con éxito 😳')
        }

        res.redirect(`/fud/${id_company}/${id_branch}/food-area-free`);
    }
    else {
        req.flash('message', 'No tienes los permisos para esto 😳')
        res.redirect('/fud/home');
    }

});


//------------------------------------type user 
router.get('/:id_company/:id_branch/type-user', isLoggedIn, async (req, res) => {
    const { id_company } = req.params;
    const branchFree = await check_company_other(req);
    const typeEmployees = await get_type_employees(id_company)
    res.render('links/manager/role_type_employees/typeEmployees', { branchFree, typeEmployees });
})


//------------------------------------providers 
router.get('/:id_company/:id_branch/providers-free', isLoggedIn, async (req, res) => {
    const { id_company, id_branch } = req.params;
    const providers = await search_providers(id_branch);
    const branchFree = await get_data_branch(id_branch);
    res.render('links/branch/providers/providers', { providers, branchFree });
})







//------------------------------------task management
router.get('/:id_company/:id_branch/task-management', isLoggedIn, async (req, res) => {
    const { id_company, id_branch } = req.params;
    const branchFree = await get_data_branch(id_branch);
    const apps=await get_all_apps_of_this_company(id_company,id_branch)
    res.render("links/taskManagement/taskManagement",{branchFree, apps});
});

//------------------------------------projects
router.get('/:id_company/:id_branch/projects', isLoggedIn, async (req, res) => {
    const { id_company, id_branch } = req.params;
    const branchFree = await get_data_branch(id_branch);
    const apps=await get_all_apps_of_this_company(id_company,id_branch)
    res.render("links/projects/projects",{branchFree, apps});
});





//------------------------------------ED STUDIOS 
const {
    get_all_apps_of_this_company,
    create_my_list_app,
    get_the_data_of_the_table_of_my_app,
    get_data_of_my_app,
    get_character_of_my_app,
    get_primary_keys_of_schema,
    get_code_table_of_my_app
} = require('../../services/apps');
const mainHandelbars=`
<!--
    ED CLOUD 
-->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" href="/img/logo.png" type="image/png">
    <title>ED PLUS</title>

    <!--font-->
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Open+Sans">

    <!-- BOX ICONS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-9ndCyUaIbzAi2FUVXJi0CjmCapSmO7SnpJef0486qhLnuZ2cdeRhO02iuK6FUUVM" crossorigin="anonymous">
    <link href='https://unpkg.com/boxicons@2.0.9/css/boxicons.min.css' rel='stylesheet'> 
    <link rel='stylesheet' href='https://cdn-uicons.flaticon.com/2.4.2/uicons-solid-straight/css/uicons-solid-straight.css'>

    <!-- my CSS -->
    <link rel="stylesheet" href="/css/menu.css">
    <link rel="stylesheet" href="/css/Styles.css">
    <link rel="stylesheet" href="/css/load.css">
    <style>
        .alert-transparent {
            background-color: var(--color-company);
        }
    </style> 

    <!--select-->
    <link href="https://cdn.jsdelivr.net/npm/chosen-js@1.8.7/dist/css/chosen.min.css" rel="stylesheet" />

    <!--tutorial -->
    <link src="https://unpkg.com/intro.js/introjs.css"></link>
    <link rel="stylesheet" href="https://unpkg.com/intro.js/minified/introjs.min.css">
    <link rel="stylesheet" href="/css/tutorial.css">
</head>
<body>

</body>
</html>
`
const hbs = require('handlebars'); // Para compilar dinámicamente

router.get('/:id_company/:id_branch/ed-studios', isLoggedIn, async (req, res) => {
    const { id_company, id_branch } = req.params;
    const branchFree = await get_data_branch(id_branch);
    await create_my_list_app(id_company,id_branch)
    const apps=await get_all_apps_of_this_company(id_company,id_branch)
    res.render("links/apps/myApps",{branchFree, apps});
});

router.get('/:id_company/:id_branch/:id_app/add', isLoggedIn, async (req, res) => {
    const { id_app, id_company, id_branch } = req.params;
    const branchFree = await get_data_branch(id_branch);
    const apps=await get_all_apps_of_this_company(id_company,id_branch)

    const dataTable=await get_the_data_of_the_table_of_my_app(id_company, id_branch, id_app)
    const characterApp=await get_character_of_my_app(id_company, id_branch, id_app)

    
    res.render("links/apps/editApp",{branchFree, apps, dataTable, characterApp});
});

router.get('/:id_company/:id_branch/:id_app/table', isLoggedIn, async (req, res) => {
    const { id_app, id_company, id_branch } = req.params;
    const branchFree = await get_data_branch(id_branch);
    const apps=await get_all_apps_of_this_company(id_company,id_branch)

    const characterApp=await get_character_of_my_app(id_company, id_branch, id_app)
    const dataTableMyApp=await get_the_data_of_the_table_of_my_app(id_company, id_branch, id_app)
    const items=await get_data_of_my_app(id_company, id_branch, id_app)

    res.render("links/apps/tableApp",{branchFree,apps, characterApp, items, dataTableMyApp});
});

router.get('/:id_company/:id_branch/:id_app/edit-form-app', isLoggedIn, async (req, res) => {
    const { id_app, id_company, id_branch } = req.params;
    const branchFree = await get_data_branch(id_branch);
    const dataTable=await get_the_data_of_the_table_of_my_app(id_company, id_branch, id_app)
    res.render("links/apps/editForm",{branchFree,dataTable});
});

router.get('/:id_company/:id_branch/:id_app/edit-app', isLoggedIn, async (req, res) => {
    const { id_app, id_company, id_branch } = req.params;
    const branchFree = await get_data_branch(id_branch);

    const dataTable=await get_the_data_of_the_table_of_my_app(id_company, id_branch, id_app)
    const code=await get_code_table_of_my_app(id_company, id_branch, id_app)
    const code1=mainHandelbars+`
        <h5>{{user.user_name}}</h5>
        {{#each branchFree}}
            {{name_branch}}
        {{/each}}
    `
    const template = hbs.compile(code1);
    const data = {branchFree, dataTable};
    const html = template(data);

    //res.send(html);
    //-------------
    // Renderiza la vista
    const renderedView = res.render('links/apps/main', {branchFree, dataTable}, (err, html) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Error rendering view");
        }

        // Aquí puedes combinar el HTML renderizado con tu código Handlebars dinámico
        const code1 = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Formulario de Ejemplo</title>
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-9ndCyUaIbzAi2FUVXJi0CjmCapSmO7SnpJef0486qhLnuZ2cdeRhO02iuK6FUUVM" crossorigin="anonymous">
    <style>
        .form-container {
            max-width: 800px;
            margin: 20px auto;
        }
    </style>
</head>
<body>
    <div class="container form-container">
        <h1 class="text-center mb-4">Formulario de Ejemplo</h1>
        <form>
            <div class="row mb-3">
                <div class="col-md-6">
                    <label for="firstName" class="form-label">Nombre</label>
                    <input type="text" class="form-control" id="firstName" placeholder="Nombre" required>
                </div>
                <div class="col-md-6">
                    <label for="lastName" class="form-label">Apellido</label>
                    <input type="text" class="form-control" id="lastName" placeholder="Apellido" required>
                </div>
            </div>

            <div class="row mb-3">
                <div class="col-md-6">
                    <label for="email" class="form-label">Correo Electrónico</label>
                    <input type="email" class="form-control" id="email" placeholder="Correo Electrónico" required>
                </div>
                <div class="col-md-6">
                    <label for="phone" class="form-label">Teléfono</label>
                    <input type="tel" class="form-control" id="phone" placeholder="Teléfono" required>
                </div>
            </div>

            <div class="row mb-3">
                <div class="col-md-6">
                    <label for="dob" class="form-label">Fecha de Nacimiento</label>
                    <input type="date" class="form-control" id="dob" required>
                </div>
                <div class="col-md-6">
                    <label for="gender" class="form-label">Género</label>
                    <select id="gender" class="form-select" required>
                        <option value="" disabled selected>Selecciona una opción</option>
                        <option value="male">Masculino</option>
                        <option value="female">Femenino</option>
                        <option value="other">Otro</option>
                    </select>
                </div>
            </div>

            <div class="mb-3">
                <label for="address" class="form-label">Dirección</label>
                <textarea class="form-control" id="address" rows="3" placeholder="Dirección" required></textarea>
            </div>

            <div class="mb-3">
                <label for="comments" class="form-label">Comentarios</label>
                <textarea class="form-control" id="comments" rows="4" placeholder="Comentarios"></textarea>
            </div>

            <div class="mb-3">
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="terms" required>
                    <label class="form-check-label" for="terms">
                        Acepto los términos y condiciones
                    </label>
                </div>
            </div>

            <div class="text-center">
                <button type="submit" class="btn btn-primary">Enviar</button>
                <button type="reset" class="btn btn-secondary">Restablecer</button>
            </div>
        </form>
    </div>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js" integrity="sha384-9ndCyUaIbzAi2FUVXJi0CjmCapSmO7SnpJef0486qhLnuZ2cdeRhO02iuK6FUUVM" crossorigin="anonymous"></script>
</body>
</html>

        `;

        // Compila el código Handlebars dinámico
        const template = hbs.compile(code1);
        const data = {branchFree1:branchFree};

        // Genera el HTML con el código Handlebars dinámico
        const dynamicHtml = template(data);

        // Combina el HTML renderizado con el HTML dinámico
        const combinedHtml = html + dynamicHtml;

        // Envía el HTML combinado al cliente
        res.send(combinedHtml);
    });


    //res.render("links/apps/editApp",{branchFree,apps, dataTable});
});

router.get('/:id_company/:id_branch/ed-studios/create-database', isLoggedIn, async (req, res) => {
    const { id_company, id_branch } = req.params;
    const branchFree = await get_data_branch(id_branch);
    const apps=await get_all_apps_of_this_company(id_company,id_branch)
    const myApps=await get_primary_keys_of_schema(id_company,id_branch)
    res.render('links/apps/studios', { branchFree, apps, myApps});
})



//------------------------------------options 
router.get('/:id_company/:id_branch/options', isLoggedIn, async (req, res) => {
    const { id_company, id_branch } = req.params;
    const branchFree = await get_data_branch(id_branch);
    const dataCompany = await get_data_company_with_id(id_company);
    const country=await get_country();
    res.render('links/options/options', { branchFree, dataCompany, country });
})

router.get('/:id_company/:id_branch/prices', isLoggedIn, async (req, res) => {
    const { id_company, id_branch } = req.params;
    const branchFree = await get_data_branch(id_branch);
    res.render('links/web/prices',{branchFree});
})

module.exports = router;
