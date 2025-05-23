async function create_update_of_the_database(adminPool){

    //this query is for create the table of services for sale rechange or buy service as in the oxxo
    var query=`
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

    `
    await adminPool.query(query);
    console.log('📂 La base de datos EDPLUS fue actualizada.');
}
module.exports = {
    create_update_of_the_database
};