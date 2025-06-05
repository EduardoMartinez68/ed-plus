import os
import sqlite_utils
import psycopg2

# Obtener la ruta del directorio donde se está ejecutando el script
current_dir = os.path.dirname(os.path.abspath(__file__))
sqlite_path = os.path.join(current_dir, "edpluslite.sqlite")

# Conexión a PostgreSQL
conn_pg = psycopg2.connect("dbname=EDPLUS user=postgres password=bobesponja48 host=localhost")
cursor = conn_pg.cursor()

# Conexión a SQLite en la misma carpeta que el script
db = sqlite_utils.Database(sqlite_path)

# Obtener todas las tablas de la base de datos PostgreSQL
cursor.execute("""
SELECT table_schema, table_name
FROM information_schema.tables
WHERE table_type = 'BASE TABLE'
ORDER BY table_schema, table_name;
""")
tables = cursor.fetchall()

for schemaname, table_name in tables:
    full_table = f'"{schemaname}"."{table_name}"'
    print(f"Migrando tabla: {full_table}")
    cursor.execute(f'SELECT * FROM {full_table}')
    rows = cursor.fetchall()
    column_names = [desc[0] for desc in cursor.description]

    if rows:
        db[table_name].insert_all(
            [dict(zip(column_names, row)) for row in rows],
            alter=True
        )
    else:
        db[table_name].create({col: str for col in column_names})

print(f"✅ Migración completada con éxito. Archivo guardado en:\n{sqlite_path}")
