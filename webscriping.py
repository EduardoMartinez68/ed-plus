import requests
from bs4 import BeautifulSoup

def buscar_producto_por_codigo(codigo_barras):
    url = f"https://www.barcodelookup.com/{codigo_barras}"

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
        "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
        "Referer": "https://www.google.com/"
    }

    session = requests.Session()
    session.headers.update(headers)
    response = session.get(url)

    
    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        print(f"Error al obtener la página. Código: {response.status_code}")
        return

    soup = BeautifulSoup(response.text, "html.parser")

    # Ejemplo: obtener el nombre del producto
    nombre = soup.find("h1", class_="product-name")
    if nombre:
        nombre = nombre.text.strip()
    else:
        nombre = "No encontrado"

    # Obtener descripción si existe
    descripcion = soup.find("div", class_="product-description")
    if descripcion:
        descripcion = descripcion.text.strip()
    else:
        descripcion = "No disponible"

    # Obtener marca si está
    marca = soup.find("div", class_="brand-name")
    if marca:
        marca = marca.text.strip()
    else:
        marca = "No disponible"

    print(f"Código de barras: {codigo_barras}")
    print(f"Nombre: {nombre}")
    print(f"Marca: {marca}")
    print(f"Descripción: {descripcion}")

if __name__ == "__main__":
    codigo = input("Introduce el código de barras a buscar: ")
    buscar_producto_por_codigo(codigo)
