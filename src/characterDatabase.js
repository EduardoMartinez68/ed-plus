async function create_update_of_the_database(adminPool) {

    //this query is for create the table of services for sale rechange or buy service as in the oxxo
    var query = `
        -- Crear tabla solo si no existe
        CREATE TABLE IF NOT EXISTS "Box".reachange_services (
            id bigserial NOT NULL,
            id_companies bigint,
            id_branches bigint,
            id_employees bigint,
            id_customers bigint,
            service_name varchar(500) NOT NULL,
            key_services text,
            service_money double precision NOT NULL,
            money_received double precision NOT NULL,
            change double precision NOT NULL,
            CONSTRAINT id_key_reachange_services PRIMARY KEY (id)
        );

        -- Comentarios descriptivos
        COMMENT ON COLUMN "Box".reachange_services.key_services IS 'this is the key that the customer show to the employee for buy his service';
        COMMENT ON COLUMN "Box".reachange_services.service_money IS 'this is the money that the customer would like buy';

        -- Agregar claves foráneas (si no existen ya)
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_constraint WHERE conname = 'employees_fk'
            ) THEN
                ALTER TABLE "Box".reachange_services ADD CONSTRAINT employees_fk FOREIGN KEY (id_employees)
                REFERENCES "Company".employees (id) MATCH FULL
                ON DELETE SET NULL ON UPDATE CASCADE;
            END IF;

            IF NOT EXISTS (
                SELECT 1 FROM pg_constraint WHERE conname = 'customers_fk'
            ) THEN
                ALTER TABLE "Box".reachange_services ADD CONSTRAINT customers_fk FOREIGN KEY (id_customers)
                REFERENCES "Company".customers (id) MATCH FULL
                ON DELETE SET NULL ON UPDATE CASCADE;
            END IF;

            IF NOT EXISTS (
                SELECT 1 FROM pg_constraint WHERE conname = 'companies_fk'
            ) THEN
                ALTER TABLE "Box".reachange_services ADD CONSTRAINT companies_fk FOREIGN KEY (id_companies)
                REFERENCES "User".companies (id) MATCH FULL
                ON DELETE SET NULL ON UPDATE CASCADE;
            END IF;

            IF NOT EXISTS (
                SELECT 1 FROM pg_constraint WHERE conname = 'branches_fk'
            ) THEN
                ALTER TABLE "Box".reachange_services ADD CONSTRAINT branches_fk FOREIGN KEY (id_branches)
                REFERENCES "Company".branches (id) MATCH FULL
                ON DELETE SET NULL ON UPDATE CASCADE;
            END IF;
        END
        $$;


        -- Crear tabla de labels si no existe
        CREATE TABLE IF NOT EXISTS "Branch".labels (
            id bigserial PRIMARY KEY,
            id_companies bigint,
            id_branches bigint,
            name varchar(300) NOT NULL,
            width smallint NOT NULL,
            length smallint NOT NULL,
            label json NOT NULL
        );

        -- Agregar FK a "Company".branches si no existe
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1
                FROM information_schema.table_constraints
                WHERE constraint_name = 'branches_fk'
                AND table_schema = 'Branch'
                AND table_name = 'labels'
            ) THEN
                ALTER TABLE "Branch".labels
                ADD CONSTRAINT branches_fk FOREIGN KEY (id_branches)
                REFERENCES "Company".branches (id)
                ON DELETE SET NULL
                ON UPDATE CASCADE;
            END IF;
        END$$;

        -- Agregar FK a "User".companies si no existe
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1
                FROM information_schema.table_constraints
                WHERE constraint_name = 'companies_fk'
                AND table_schema = 'Branch'
                AND table_name = 'labels'
            ) THEN
                ALTER TABLE "Branch".labels
                ADD CONSTRAINT companies_fk FOREIGN KEY (id_companies)
                REFERENCES "User".companies (id)
                ON DELETE SET NULL
                ON UPDATE CASCADE;
            END IF;
        END$$;

        DO $$
        BEGIN
            ALTER TABLE "Company".branches
            ADD COLUMN IF NOT EXISTS user_prontipagos VARCHAR(60),
            ADD COLUMN IF NOT EXISTS password_prontipagos TEXT,
            ADD COLUMN IF NOT EXISTS iv_for_password TEXT;
        END$$;

        --role of labels
        DO $$
        BEGIN
            ALTER TABLE "Employee".roles_employees
            ADD COLUMN IF NOT EXISTS view_label BOOLEAN DEFAULT FALSE NOT NULL,
            ADD COLUMN IF NOT EXISTS add_label BOOLEAN DEFAULT FALSE NOT NULL,
            ADD COLUMN IF NOT EXISTS edit_label BOOLEAN DEFAULT FALSE NOT NULL,
            ADD COLUMN IF NOT EXISTS delete_label BOOLEAN DEFAULT FALSE NOT NULL,
            ADD COLUMN IF NOT EXISTS add_product_flash BOOLEAN DEFAULT TRUE NOT NULL;
        END$$;

        DO $$
        BEGIN
            ALTER TABLE "Box".reachange_services
            ALTER COLUMN id_customers DROP NOT NULL;
        END$$;
        
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1
                FROM information_schema.columns
                WHERE table_schema = 'Box'
                AND table_name = 'reachange_services'
                AND column_name = 'time_sales'
            ) THEN
                ALTER TABLE "Box".reachange_services
                ADD COLUMN time_sales timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP;
            END IF;
        END
        $$;


        --notification od the branch
        DO $$
        BEGIN
            ALTER TABLE "Company".branches
            ADD COLUMN IF NOT EXISTS notification_for_email BOOLEAN DEFAULT FALSE NOT NULL,
            ADD COLUMN IF NOT EXISTS email_notification TEXT,
            ADD COLUMN IF NOT EXISTS token_email_notification TEXT,
            ADD COLUMN IF NOT EXISTS to_notification TEXT,
        
            ADD COLUMN IF NOT EXISTS notification_cut_box BOOLEAN DEFAULT FALSE NOT NULL,
            ADD COLUMN IF NOT EXISTS products_with_low_stock BOOLEAN DEFAULT FALSE NOT NULL,
            ADD COLUMN IF NOT EXISTS there_are_products_out_of_stock BOOLEAN DEFAULT FALSE NOT NULL,
            ADD COLUMN IF NOT EXISTS there_are_expired_products BOOLEAN DEFAULT FALSE NOT NULL,
            ADD COLUMN IF NOT EXISTS an_employee_logged_in_outside_of_his_shift BOOLEAN DEFAULT FALSE NOT NULL;
        END$$;

        -------------------------ROLE-----------------------
        DO $$
        BEGIN
            ALTER TABLE "Employee".roles_employees
            ------------reports 
            ADD COLUMN IF NOT EXISTS report_to_cofepris BOOLEAN DEFAULT FALSE NOT NULL,
            ------------cut box
            ADD COLUMN IF NOT EXISTS cut_box BOOLEAN DEFAULT FALSE NOT NULL,

            ------------lot
            ADD COLUMN IF NOT EXISTS add_lot BOOLEAN DEFAULT FALSE NOT NULL,
            ADD COLUMN IF NOT EXISTS edit_lot BOOLEAN DEFAULT FALSE NOT NULL,
            ADD COLUMN IF NOT EXISTS delete_lot BOOLEAN DEFAULT FALSE NOT NULL,

            ------------promotions
            ADD COLUMN IF NOT EXISTS add_promotions BOOLEAN DEFAULT FALSE NOT NULL,
            ADD COLUMN IF NOT EXISTS edit_promotions BOOLEAN DEFAULT FALSE NOT NULL,
            ADD COLUMN IF NOT EXISTS delete_promotions BOOLEAN DEFAULT FALSE NOT NULL,

            ------------sales
            ADD COLUMN IF NOT EXISTS remove_product_for_sale BOOLEAN DEFAULT FALSE NOT NULL,
            ADD COLUMN IF NOT EXISTS delete_the_shopping_cart BOOLEAN DEFAULT FALSE NOT NULL,
            ADD COLUMN IF NOT EXISTS add_discount_to_product_on_sale BOOLEAN DEFAULT FALSE NOT NULL,
            ADD COLUMN IF NOT EXISTS add_product_on_backorder BOOLEAN DEFAULT FALSE NOT NULL,
            ADD COLUMN IF NOT EXISTS view_products_on_backorder BOOLEAN DEFAULT FALSE NOT NULL,
            ADD COLUMN IF NOT EXISTS select_product_on_backorder BOOLEAN DEFAULT FALSE NOT NULL,
            ADD COLUMN IF NOT EXISTS delete_product_on_backorder BOOLEAN DEFAULT FALSE NOT NULL,

            ------------labels
            ADD COLUMN IF NOT EXISTS view_label BOOLEAN DEFAULT FALSE NOT NULL,
            ADD COLUMN IF NOT EXISTS add_label BOOLEAN DEFAULT FALSE NOT NULL,
            ADD COLUMN IF NOT EXISTS edit_label BOOLEAN DEFAULT FALSE NOT NULL,
            ADD COLUMN IF NOT EXISTS delete_label BOOLEAN DEFAULT FALSE NOT NULL;

            -----------tickets
            ADD COLUMN IF NOT EXISTS view_ticket BOOLEAN DEFAULT TRUE NOT NULL;
            ADD COLUMN IF NOT EXISTS return_ticket BOOLEAN DEFAULT TRUE NOT NULL;
            ADD COLUMN IF NOT EXISTS edit_ticket BOOLEAN DEFAULT TRUE NOT NULL;

            ----------store online 
            ADD COLUMN IF NOT EXISTS edit_shop_online BOOLEAN DEFAULT TRUE NOT NULL;
        END$$;

        ------------------------------------TICKETS-----------------------------------
        DO $$
        BEGIN
            -- Tabla "Box".ticket
            CREATE TABLE IF NOT EXISTS "Box".ticket (
                id bigserial PRIMARY KEY,
                key text NOT NULL,
                original_ticket json NOT NULL,
                current_ticket json NOT NULL,
                date_sale timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                cash numeric(10,2),
                debit numeric(10,2),
                credit numeric(10,2),
                total numeric(10,2) DEFAULT 0,
                note text,
                cfdi_create boolean NOT NULL DEFAULT false,
                id_cfdi text,
                id_customers bigint,
                id_employees bigint,
                id_branches bigint,
                id_companies bigint,
                CONSTRAINT key_ticket UNIQUE (id)
            );

            -- Asegurar columnas una por una
            ALTER TABLE "Box".ticket ADD COLUMN IF NOT EXISTS cash numeric(10,2);
            ALTER TABLE "Box".ticket ADD COLUMN IF NOT EXISTS debit numeric(10,2);
            ALTER TABLE "Box".ticket ADD COLUMN IF NOT EXISTS credit numeric(10,2);
            ALTER TABLE "Box".ticket ADD COLUMN IF NOT EXISTS total numeric(10,2) DEFAULT 0;
            ALTER TABLE "Box".ticket ADD COLUMN IF NOT EXISTS date_sale timestamp DEFAULT CURRENT_TIMESTAMP;
            ALTER TABLE "Box".ticket ADD COLUMN IF NOT EXISTS note text;
            ALTER TABLE "Box".ticket ADD COLUMN IF NOT EXISTS id_customers bigint;
            ALTER TABLE "Box".ticket ADD COLUMN IF NOT EXISTS id_employees bigint;
            ALTER TABLE "Box".ticket ADD COLUMN IF NOT EXISTS id_branches bigint;
            ALTER TABLE "Box".ticket ADD COLUMN IF NOT EXISTS id_companies bigint;


            ALTER TABLE "Box".ticket ADD COLUMN IF NOT EXISTS synchronized BOOLEAN DEFAULT FALSE NOT NULL;

            -- Tabla "Box".history_returns
            CREATE TABLE IF NOT EXISTS "Box".history_returns (
                id bigserial PRIMARY KEY,
                id_employees bigint,
                id_ticket bigint,
                old_ticket json NOT NULL DEFAULT '{}'::json,
                products_returns json NOT NULL DEFAULT '[]'::json,
                total_return numeric(10,2) NOT NULL DEFAULT 0,
                date_return timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                note text NOT NULL DEFAULT ''
            );

            -- Asegurar columnas (evita error si ya existen)
            ALTER TABLE "Box".history_returns ADD COLUMN IF NOT EXISTS id_employees bigint;
            ALTER TABLE "Box".history_returns ADD COLUMN IF NOT EXISTS id_ticket bigint;
            ALTER TABLE "Box".history_returns ADD COLUMN IF NOT EXISTS old_ticket json NOT NULL DEFAULT '{}'::json;
            ALTER TABLE "Box".history_returns ADD COLUMN IF NOT EXISTS products_returns json NOT NULL DEFAULT '[]'::json;
            ALTER TABLE "Box".history_returns ADD COLUMN IF NOT EXISTS total_return numeric(10,2) NOT NULL DEFAULT 0;
            ALTER TABLE "Box".history_returns ADD COLUMN IF NOT EXISTS date_return timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP;
            ALTER TABLE "Box".history_returns ADD COLUMN IF NOT EXISTS note text NOT NULL DEFAULT '';
        END
        $$;

        ----------------------------------------SETTING TICKETS-----------------------------------
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'Box' AND table_name = 'setting_ticket'
            ) THEN
                EXECUTE '
                    CREATE TABLE "Box".setting_ticket (
                        id bigserial PRIMARY KEY,
                        id_companies bigint,
                        id_branches bigint,
                        show_name_employee boolean DEFAULT true,
                        show_name_customer boolean DEFAULT true,
                        show_name_company boolean DEFAULT true,
                        show_address boolean DEFAULT true,
                        show_name_branch boolean DEFAULT true,
                        show_phone boolean DEFAULT true,
                        show_cellphone boolean DEFAULT true,
                        show_email_company boolean DEFAULT true,
                        show_email_branch boolean DEFAULT true,
                        show_logo boolean DEFAULT true,
                        show_date boolean DEFAULT true,
                        show_qr boolean DEFAULT true,
                        qr text DEFAULT ''https://pluspuntodeventa.com'',
                        message varchar(300) DEFAULT ''¡Gracias por su compra!'',
                        size_ticket numeric(10,2)
                    );
                ';
            END IF;
        END$$;

        -- Constraint: companies_fk
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1
                FROM information_schema.table_constraints
                WHERE constraint_name = 'companies_fk'
                AND table_schema = 'Box'
                AND table_name = 'setting_ticket'
            ) THEN
                ALTER TABLE "Box".setting_ticket
                ADD CONSTRAINT companies_fk FOREIGN KEY (id_companies)
                REFERENCES "User".companies (id)
                ON DELETE SET NULL
                ON UPDATE CASCADE;
            END IF;
        END$$;

        -- Constraint: branches_fk
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1
                FROM information_schema.table_constraints
                WHERE constraint_name = 'branches_fk'
                AND table_schema = 'Box'
                AND table_name = 'setting_ticket'
            ) THEN
                ALTER TABLE "Box".setting_ticket
                ADD CONSTRAINT branches_fk FOREIGN KEY (id_branches)
                REFERENCES "Company".branches (id)
                ON DELETE SET NULL
                ON UPDATE CASCADE;
            END IF;
        END$$;

        -- Unique Constraint: setting_ticket_uq
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1
                FROM information_schema.table_constraints
                WHERE constraint_name = 'setting_ticket_uq'
                AND table_schema = 'Box'
                AND table_name = 'setting_ticket'
            ) THEN
                ALTER TABLE "Box".setting_ticket
                ADD CONSTRAINT setting_ticket_uq UNIQUE (id_branches);
            END IF;
        END$$;

        ----------------------------------------CFDI----------------------------
        DO $$
        BEGIN
            -- Asegurar columnas (evita error si ya existen)
            ALTER TABLE "Company".branches ADD COLUMN IF NOT EXISTS rfc varchar(13);
            ALTER TABLE "Company".branches ADD COLUMN IF NOT EXISTS fiscalRegime varchar(6);
            ALTER TABLE "Company".branches ADD COLUMN IF NOT EXISTS linkCFDI text;
        END
        $$;
        DO $$
        BEGIN
            IF NOT EXISTS CREATE TABLE "Branch".taxes_product (
                    id bigserial PRIMARY KEY,
                    id_branches bigint,
                    name varchar(15) NOT NULL,
                    "taxId" varchar(10) NOT NULL DEFAULT '002',
                    base numeric(10,2) NOT NULL DEFAULT 100.00,
                    rate numeric(6,4) NOT NULL DEFAULT 0.1600,
                    is_retention boolean NOT NULL DEFAULT false,
                    activate boolean NOT NULL DEFAULT true,
                    this_taxes_is_in_all boolean NOT NULL DEFAULT false,
                    CONSTRAINT fk_taxes_branch FOREIGN KEY (id_branches)
                        REFERENCES "Company".branches(id)
                        ON DELETE SET NULL ON UPDATE CASCADE
                );
            END IF;
        END
        $$;

        DO $$
        BEGIN
            IF NOT EXISTS CREATE TABLE "Branch".taxes_relation (
                    id bigserial PRIMARY KEY,
                    id_dish_and_combo_features bigint,
                    id_taxes bigint,
                    CONSTRAINT id_key_taxes_relation PRIMARY KEY (id),
                    FOREIGN KEY (id_dish_and_combo_features) REFERENCES "Dish".dish_and_combo_features(id) ON DELETE CASCADE,
                    FOREIGN KEY (id_taxes) REFERENCES "Branch".taxes_product(id) ON DELETE CASCADE
                );
            END IF;
        END
        $$;

        DO $$
        BEGIN
            IF NOT EXISTS CREATE TABLE "Company".facture_cfdi (
                    id bigserial PRIMARY KEY,
                    rfc varchar(16),
                    company_name text NOT NULL,
                    use_cfdi varchar(6) NOT NULL,
                    "fiscalRegime" varchar(6) NOT NULL,
                    postal_code varchar(15) NOT NULL,
                    street text,
                    num_i varchar(6),
                    num_e varchar(6),
                    cologne text,
                    municipy text,
                    state text,
                    country text DEFAULT 'México',
                    id_customers bigint,
                    id_companies bigint
                );
            END IF;
        END
        $$;


        DO $$
        BEGIN
            ALTER TABLE "Company".branches ADD points_to_money numeric(10,2) DEFAULT 0;
            ALTER TABLE "Company".branches ADD money_to_points numeric(10,2) DEFAULT 0;
            ALTER TABLE "Box".ticket ADD points numeric(10,2) DEFAULT 0;
            ALTER TABLE "Box".ticket ADD moneyPoints numeric(10,2) DEFAULT 0;
            ALTER TABLE "Box".box_history ADD buy_for_points numeric(10,2) DEFAULT 0;
            ALTER TABLE "Box".box_history ADD points numeric(10,2) DEFAULT 0;
        END
        $$;

        DO $$
        BEGIN
            ALTER TABLE "Employee".roles_employees ADD view_facture_cfdi boolean NOT NULL DEFAULT true;
            ALTER TABLE "Employee".roles_employees ADD create_a_facture_cfdi boolean NOT NULL DEFAULT true;
            ALTER TABLE "Employee".roles_employees ADD cancel_a_facture_cfdi boolean NOT NULL DEFAULT true;
            ALTER TABLE "Employee".roles_employees ADD buy_token_for_create_facture_cfdi boolean NOT NULL DEFAULT true;

            ALTER TABLE "Employee".roles_employees ADD update_information_of_points_to_money boolean NOT NULL DEFAULT true;
            ALTER TABLE "Employee".roles_employees ADD sale_by_points_to_money boolean NOT NULL DEFAULT true;
            ALTER TABLE "Employee".roles_employees ADD update_points_of_the_user NOT NULL DEFAULT true;
        END
        $$;
    `
    
    await adminPool.query(query);
    console.log('📂 La base de datos EDPLUS fue actualizada.');
}


async function create_update_of_the_database_mysqlite(db) {

    //this query is for create the table of services for sale rechange or buy service as in the oxxo
    const query = `
    -- Activar claves foráneas en SQLite
    PRAGMA foreign_keys = ON;

    -- Asegurar que las tablas referenciadas existan
    CREATE TABLE IF NOT EXISTS customers (id INTEGER PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS employees (id INTEGER PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS branches (id INTEGER PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS companies (id INTEGER PRIMARY KEY);

    -- Eliminar tabla ticket si existe (para volver a crearla con relaciones)
    CREATE TABLE IF NOT EXISTS ticket (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT NOT NULL UNIQUE,
        original_ticket JSON NOT NULL,
        current_ticket JSON NOT NULL,
        date_sale TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        cash NUMERIC(10,2),
        debit NUMERIC(10,2),
        credit NUMERIC(10,2),
        total NUMERIC(10,2) DEFAULT 0,
        note TEXT,
        id_customers INTEGER,
        id_employees INTEGER,
        id_branches INTEGER,
        id_companies INTEGER,
        FOREIGN KEY (id_customers) REFERENCES customers(id) ON DELETE SET NULL ON UPDATE CASCADE,
        FOREIGN KEY (id_employees) REFERENCES employees(id) ON DELETE SET NULL ON UPDATE CASCADE,
        FOREIGN KEY (id_branches) REFERENCES branches(id) ON DELETE SET NULL ON UPDATE CASCADE,
        FOREIGN KEY (id_companies) REFERENCES companies(id) ON DELETE SET NULL ON UPDATE CASCADE
    );

    -- Eliminar y crear tabla history_returns
    CREATE TABLE IF NOT EXISTS history_returns (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        id_employees INTEGER,
        id_ticket INTEGER,
        old_ticket JSON NOT NULL,
        products_returns JSON NOT NULL,
        total_return NUMERIC(10,2) NOT NULL DEFAULT 0,
        date_return TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        note TEXT NOT NULL,
        FOREIGN KEY (id_ticket) REFERENCES ticket(id) ON DELETE SET NULL ON UPDATE CASCADE,
        FOREIGN KEY (id_employees) REFERENCES employees(id) ON DELETE SET NULL ON UPDATE CASCADE
    );

    CREATE TABLE IF NOT EXISTS setting_ticket (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        id_companies INTEGER,
        id_branches INTEGER UNIQUE,  -- Constraint UNIQUE directamente
        show_name_employee BOOLEAN DEFAULT 1,
        show_name_customer BOOLEAN DEFAULT 1,
        show_name_company BOOLEAN DEFAULT 1,
        show_address BOOLEAN DEFAULT 1,
        show_name_branch BOOLEAN DEFAULT 1,
        show_phone BOOLEAN DEFAULT 1,
        show_cellphone BOOLEAN DEFAULT 1,
        show_email_company BOOLEAN DEFAULT 1,
        show_email_branch BOOLEAN DEFAULT 1,
        show_logo BOOLEAN DEFAULT 1,
        show_date BOOLEAN DEFAULT 1,
        show_qr BOOLEAN DEFAULT 1,
        qr TEXT DEFAULT 'https://pluspuntodeventa.com',
        message TEXT DEFAULT '¡Gracias por su compra!',
        size_ticket NUMERIC(10,2),

        FOREIGN KEY (id_companies) REFERENCES companies(id) ON DELETE SET NULL ON UPDATE CASCADE,
        FOREIGN KEY (id_branches) REFERENCES branches(id) ON DELETE SET NULL ON UPDATE CASCADE
    );
    `;
    await create_table_mysqlite(db,query)

    let queryPermition=`
        -- Asegurar columnas en roles_employees (no hay IF NOT EXISTS, usar try-catch si usas sqlite3 en JS)
        ALTER TABLE roles_employees ADD COLUMN view_ticket BOOLEAN DEFAULT 1 NOT NULL;
    `

    queryPermition=`
    ALTER TABLE roles_employees ADD COLUMN return_ticket BOOLEAN DEFAULT 1 NOT NULL;
    `
    await create_table_mysqlite(db,queryPermition)



    queryPermition=`
        -- Asegurar columnas en roles_employees (no hay IF NOT EXISTS, usar try-catch si usas sqlite3 en JS)
        ALTER TABLE roles_employees ADD COLUMN edit_ticket BOOLEAN DEFAULT 1 NOT NULL;
    `
    await create_table_mysqlite(db,queryPermition)

    queryPermition=`
        -- Asegurar columnas en roles_employees (no hay IF NOT EXISTS, usar try-catch si usas sqlite3 en JS)
        ALTER TABLE roles_employees ADD COLUMN edit_shop_online BOOLEAN DEFAULT 1 NOT NULL;
    `
    await create_table_mysqlite(db,queryPermition)
    
    queryPermition=`
    ALTER TABLE ticket ADD COLUMN synchronized BOOLEAN NOT NULL DEFAULT FALSE;
    `
    await create_table_mysqlite(db,queryPermition)


    queryPermition=`
    ALTER TABLE branches ADD COLUMN rfc varchar(13);
    `
    await create_table_mysqlite(db,queryPermition)

    //her we will create the table of taxes
    queryPermition=`
        CREATE TABLE IF NOT EXISTS taxes_product (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            id_branches INTEGER,
            name TEXT NOT NULL,
            taxId TEXT NOT NULL DEFAULT '002',
            base NUMERIC(10,2) NOT NULL DEFAULT 100.00,
            rate NUMERIC(6,4) NOT NULL DEFAULT 0.1600,
            is_retention BOOLEAN NOT NULL DEFAULT 0,
            activate BOOLEAN NOT NULL DEFAULT 1,
            this_taxes_is_in_all BOOLEAN NOT NULL DEFAULT 0,

            FOREIGN KEY (id_branches) REFERENCES branches(id) ON DELETE SET NULL ON UPDATE CASCADE
        );
    `
    await create_table_mysqlite(db,queryPermition)

    queryPermition=`
    CREATE TABLE IF NOT EXISTS taxes_relation (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        id_dish_and_combo_features INTEGER,
        id_taxes INTEGER,

        FOREIGN KEY (id_dish_and_combo_features) REFERENCES dish_and_combo_features(id) ON DELETE CASCADE,
        FOREIGN KEY (id_taxes) REFERENCES taxes_product(id) ON DELETE CASCADE
    );
    `
    await create_table_mysqlite(db,queryPermition)
    queryPermition=`
        ALTER TABLE branches ADD COLUMN fiscalRegime varchar(6);
        ALTER TABLE branches ADD COLUMN linkCFDI text;
    `
    await create_table_mysqlite(db,queryPermition)



    queryPermition=`
        CREATE TABLE IF NOT EXISTS facture_cfdi (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            rfc TEXT,
            company_name TEXT NOT NULL,
            use_cfdi TEXT NOT NULL,
            fiscalRegime TEXT NOT NULL,
            postal_code TEXT NOT NULL,
            street TEXT,
            num_i TEXT,
            num_e TEXT,
            cologne TEXT,
            municipy TEXT,
            state TEXT,
            country TEXT DEFAULT 'México',
            id_customers INTEGER
        );
    `
    await create_table_mysqlite(db,queryPermition)
    queryPermition=`
        ALTER TABLE facture_cfdi ADD COLUMN id_companies bigint;
    `
    await create_table_mysqlite(db,queryPermition)


    queryPermition=`
        ALTER TABLE ticket ADD cfdi_create boolean NOT NULL DEFAULT false;
    `
    await create_table_mysqlite(db,queryPermition)

    queryPermition=`
        ALTER TABLE ticket ADD id_cfdi text;
    `
    await create_table_mysqlite(db,queryPermition)

    //her create the data for the point of user
    queryPermition=`
        ALTER TABLE branches ADD points_to_money numeric(10,2) DEFAULT 0;
    `
    await create_table_mysqlite(db,queryPermition)

    queryPermition=`
        ALTER TABLE roles_employees ADD view_facture_cfdi boolean NOT NULL DEFAULT true;
        ALTER TABLE roles_employees ADD create_a_facture_cfdi boolean NOT NULL DEFAULT true;
        ALTER TABLE roles_employees ADD create_a_facture_cfdi_global boolean NOT NULL DEFAULT true;
        ALTER TABLE roles_employees ADD cancel_a_facture_cfdi boolean NOT NULL DEFAULT true;
        ALTER TABLE roles_employees ADD buy_token_for_create_facture_cfdi boolean NOT NULL DEFAULT true;

        ALTER TABLE roles_employees ADD update_information_of_points_to_money boolean NOT NULL DEFAULT true;
        ALTER TABLE roles_employees ADD sale_by_points_to_money boolean NOT NULL DEFAULT true;
        ALTER TABLE roles_employees ADD update_points_of_the_user NOT NULL DEFAULT true;
    `
    await create_table_mysqlite(db,queryPermition)

    queryPermition=`
        ALTER TABLE branches ADD money_to_points numeric(10,2) DEFAULT 0;
    `
    await create_table_mysqlite(db,queryPermition)

    queryPermition=`
        ALTER TABLE ticket ADD points numeric(10,2) DEFAULT 0;
        ALTER TABLE ticket ADD moneyPoints numeric(10,2) DEFAULT 0;

        ALTER TABLE box_history ADD buy_for_points numeric(10,2) DEFAULT 0;
        ALTER TABLE box_history ADD points numeric(10,2) DEFAULT 0;
    `
    await create_table_mysqlite(db,queryPermition)

    
    db.close();
}

async function create_table_mysqlite(db,query){
    db.exec(query, (err) => {
        if (err) {
            //console.error('Error al ejecutar script de actualización para SQLite:', err.message);
        } else {
            console.log('Base de datos SQLite actualizada correctamente.');
        }
        //db.close(); // Importante cerrar conexión
    }); 
}




module.exports = {
    create_update_of_the_database,
    create_update_of_the_database_mysqlite
};