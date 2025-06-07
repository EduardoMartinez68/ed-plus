import os
import sqlite_utils
import psycopg2

# Ruta al archivo SQLite
current_dir = os.path.dirname(os.path.abspath(__file__))
sqlite_path = os.path.join(current_dir, "edpluslite.sqlite")

# Conexión a PostgreSQL
conn_pg = psycopg2.connect("dbname=EDPLUS user=postgres password=bobesponja48 host=localhost")
cursor_pg = conn_pg.cursor()

# Conexión a SQLite
db = sqlite_utils.Database(sqlite_path)

# Función para mapear tipos PostgreSQL a SQLite
def map_pg_type_to_sqlite(pg_type):
    pg_type = pg_type.lower()
    if pg_type in ('integer', 'int4', 'serial'):
        return int
    elif pg_type in ('bigint', 'int8', 'bigserial'):
        # Para id autoincrement en SQLite, tiene que ser INTEGER PRIMARY KEY
        return int
    elif pg_type in ('real', 'float4', 'double precision', 'numeric', 'decimal'):
        return float
    elif 'timestamp' in pg_type or 'date' in pg_type:
        return str  # guardamos fechas como texto ISO8601
    elif pg_type == 'boolean':
        return bool
    else:
        return str  # texto por defecto

# Obtener todas las tablas de PostgreSQL (esquemas públicos para simplificar)
cursor_pg.execute("""
SELECT table_schema, table_name
FROM information_schema.tables
WHERE table_type = 'BASE TABLE' AND table_schema NOT IN ('pg_catalog', 'information_schema')
ORDER BY table_schema, table_name;
""")
tables = cursor_pg.fetchall()

for schemaname, table_name in tables:
    full_table = f'"{schemaname}"."{table_name}"'
    print(f"Migrando tabla: {full_table}")

    # Obtener columnas y tipos
    cursor_pg.execute("""
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema = %s AND table_name = %s
    ORDER BY ordinal_position
    """, (schemaname, table_name))
    columns = cursor_pg.fetchall()

    # Obtener la clave primaria
    cursor_pg.execute("""
    SELECT kcu.column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
     AND tc.table_schema = kcu.table_schema
    WHERE tc.constraint_type = 'PRIMARY KEY'
      AND tc.table_schema = %s
      AND tc.table_name = %s
    """, (schemaname, table_name))
    pk_columns = [row[0] for row in cursor_pg.fetchall()]

    # Crear dict para sqlite-utils con mapeo de tipos
    columns_dict = {}
    for col_name, data_type, is_nullable in columns:
        sqlite_type = map_pg_type_to_sqlite(data_type)
        columns_dict[col_name] = sqlite_type

    # Verificar si hay clave primaria simple
    pk = None
    if len(pk_columns) == 1:
        pk = pk_columns[0]
        # Para la columna PK si es INTEGER, la tratamos como autoincrement
        if columns_dict.get(pk) == int:
            print(f" -> Clave primaria simple detectada: {pk} (será autoincrementable)")

    # Borrar la tabla si existe para evitar conflictos
    if table_name in db.table_names():
        print(f" -> Eliminando tabla existente: {table_name}")
        db[table_name].drop()

    # Crear la tabla en SQLite
    print(f" -> Creando tabla {table_name} en SQLite con columnas: {list(columns_dict.keys())}")
    db[table_name].create(columns_dict, pk=pk, replace=True)

    # Traer datos de la tabla en PostgreSQL
    cursor_pg.execute(f'SELECT * FROM {full_table}')
    rows = cursor_pg.fetchall()
    column_names = [desc[0] for desc in cursor_pg.description]

    # Insertar todos los datos
    if rows:
        print(f" -> Insertando {len(rows)} filas en {table_name}")
        db[table_name].insert_all(
            [dict(zip(column_names, row)) for row in rows],
            alter=True  # permite alterar columnas si hiciera falta
        )
    else:
        print(" -> Tabla sin filas, solo estructura creada")

print(f"✅ Migración completada con éxito. Archivo guardado en:\n{sqlite_path}")

'''

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
'''
