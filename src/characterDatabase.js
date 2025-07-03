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
            ADD COLUMN IF NOT EXISTS an_employee_logged_in_outside_of_his_shift BOOLEAN DEFAULT FALSE NOT NULL,
            ADD COLUMN IF NOT EXISTS notification_cut_box BOOLEAN DEFAULT FALSE NOT NULL,
            ADD COLUMN IF NOT EXISTS notification_cut_box BOOLEAN DEFAULT FALSE NOT NULL,
            ADD COLUMN IF NOT EXISTS notification_cut_box BOOLEAN DEFAULT FALSE NOT NULL;
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
                id_customers bigint,
                id_employees bigint,
                CONSTRAINT key_ticket UNIQUE (id)
            );

            -- Asegurar columnas (por si actualizas tabla después)
            ALTER TABLE "Box".ticket
                ADD COLUMN IF NOT EXISTS cash numeric(10,2),
                ADD COLUMN IF NOT EXISTS debit numeric(10,2),
                ADD COLUMN IF NOT EXISTS credit numeric(10,2),
                ADD COLUMN IF NOT EXISTS total numeric(10,2) DEFAULT 0,
                ADD COLUMN IF NOT EXISTS date_sale timestamp DEFAULT CURRENT_TIMESTAMP,
                ADD COLUMN IF NOT EXISTS note text,
                ADD COLUMN IF NOT EXISTS id_customers bigint,
                ADD COLUMN IF NOT EXISTS id_employees bigint;

            -- Relaciones
            ALTER TABLE "Box".ticket
                ADD CONSTRAINT IF NOT EXISTS customers_fk
                FOREIGN KEY (id_customers)
                REFERENCES "Company".customers (id)
                ON DELETE SET NULL
                ON UPDATE CASCADE;

            ALTER TABLE "Box".ticket
                ADD CONSTRAINT IF NOT EXISTS employees_fk
                FOREIGN KEY (id_employees)
                REFERENCES "Company".employees (id)
                ON DELETE SET NULL
                ON UPDATE CASCADE;

            -- Tabla "Box".history_returns
            CREATE TABLE IF NOT EXISTS "Box".history_returns (
                id bigserial PRIMARY KEY,
                id_employees bigint,
                id_ticket bigint,
                old_ticket json NOT NULL,
                products_returns json NOT NULL,
                total_return numeric(10,2) NOT NULL DEFAULT 0,
                date_return timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                note text NOT NULL
            );

            -- Asegurar columnas (si modificas luego)
            ALTER TABLE "Box".history_returns
                ADD COLUMN IF NOT EXISTS total_return numeric(10,2) NOT NULL DEFAULT 0,
                ADD COLUMN IF NOT EXISTS date_return timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                ADD COLUMN IF NOT EXISTS note text NOT NULL,
                ADD COLUMN IF NOT EXISTS id_ticket bigint,
                ADD COLUMN IF NOT EXISTS id_employees bigint;

            -- Relaciones
            ALTER TABLE "Box".history_returns
                ADD CONSTRAINT IF NOT EXISTS ticket_fk
                FOREIGN KEY (id_ticket)
                REFERENCES "Box".ticket (id)
                ON DELETE SET NULL
                ON UPDATE CASCADE;

            ALTER TABLE "Box".history_returns
                ADD CONSTRAINT IF NOT EXISTS employees_fk
                FOREIGN KEY (id_employees)
                REFERENCES "Company".employees (id)
                ON DELETE SET NULL
                ON UPDATE CASCADE;

        END
        $$;
    `

    await adminPool.query(query);
    console.log('📂 La base de datos EDPLUS fue actualizada.');
}


async function create_update_of_the_database_mysqlite(db) {

    //this query is for create the table of services for sale rechange or buy service as in the oxxo
    var query = `
        -- Crear tabla ticket si no existe
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
            id_employees INTEGER
        );

        -- Crear tabla history_returns si no existe
        CREATE TABLE IF NOT EXISTS history_returns (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            id_employees INTEGER,
            id_ticket INTEGER,
            old_ticket JSON NOT NULL,
            products_returns JSON NOT NULL,
            total_return NUMERIC(10,2) DEFAULT 0 NOT NULL,
            date_return TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
            note TEXT NOT NULL
        );

        -- Agregar claves foráneas
        PRAGMA foreign_keys = ON;

        -- Asegurar relaciones (nota: SQLite requiere que existan las tablas referenciadas)
        -- Si las tablas customers y employees existen:
        CREATE TABLE IF NOT EXISTS customers (
            id INTEGER PRIMARY KEY
        );

        CREATE TABLE IF NOT EXISTS employees (
            id INTEGER PRIMARY KEY
        );

        -- Relaciones (se deben definir al crear la tabla, así que necesitarías recrearlas si ya existen)
        -- Alternativa: crear temporalmente tablas con relaciones ya embebidas

        -- Para recrear con relaciones, deberías usar algo así (si necesitas relaciones reales en SQLite):

        DROP TABLE IF EXISTS ticket;
        CREATE TABLE ticket (
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
            FOREIGN KEY (id_customers) REFERENCES customers(id) ON DELETE SET NULL ON UPDATE CASCADE,
            FOREIGN KEY (id_employees) REFERENCES employees(id) ON DELETE SET NULL ON UPDATE CASCADE
        );

        DROP TABLE IF EXISTS history_returns;
        CREATE TABLE history_returns (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            id_employees INTEGER,
            id_ticket INTEGER,
            old_ticket JSON NOT NULL,
            products_returns JSON NOT NULL,
            total_return NUMERIC(10,2) DEFAULT 0 NOT NULL,
            date_return TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
            note TEXT NOT NULL,
            FOREIGN KEY (id_ticket) REFERENCES ticket(id) ON DELETE SET NULL ON UPDATE CASCADE,
            FOREIGN KEY (id_employees) REFERENCES employees(id) ON DELETE SET NULL ON UPDATE CASCADE
        );

    `
    db.exec(query, (err) => {
        if (err) {
        console.error('Error al ejecutar script de actualización para SQLite:', err.message);
        } else {
        console.log('Base de datos SQLite actualizada correctamente.');
        }
        db.close(); // Importante cerrar conexión
    });
}




module.exports = {
    create_update_of_the_database,
    create_update_of_the_database_mysqlite
};