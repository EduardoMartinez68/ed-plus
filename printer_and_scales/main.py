from flask import Flask, jsonify, request
from flask_cors import CORS
from printer_utils import print_text, get_connected_printers
import serial
import time
import base64
from PIL import Image, ImageWin
from io import BytesIO
from escpos.printer import Usb

app = Flask(__name__)
CORS(app)

@app.route("/impresoras", methods=["GET"])
def impresoras():
    return jsonify(get_connected_printers())

@app.route("/imprimir", methods=["POST"])
def imprimir():
    data = request.get_json()
    texto = data.get("texto", "")
    impresora = data.get("impresora", None)

    if not texto:
        return jsonify({"error": "Texto vacío"}), 400

    success = print_text(texto, impresora)
    return jsonify({"ok": success})

def read_weight_from_scale(com_port='COM3', baud_rate=9600, timeout=2):
    try:
        with serial.Serial(com_port, baud_rate, timeout=timeout) as ser:
            time.sleep(0.1)
            ser.flushInput()
            raw_data = ser.readline().decode('utf-8').strip()
            peso = ''.join(c for c in raw_data if c.isdigit() or c == '.')
            if peso:
                return float(peso)
            else:
                return None
    except Exception as e:
        print(f"Error leyendo báscula: {e}")
        return None

@app.route("/read-scale/<com_port>")
def read_scale(com_port):
    baud_rate = request.args.get('baudRate', default=9600, type=int)
    peso = read_weight_from_scale(com_port, baud_rate)
    if peso is not None:
        return jsonify({"status": "OK", "weight": f"{peso}"})
    else:
        return jsonify({"status": "ERROR", "error": "No se pudo leer peso"}), 500

#------------------------------------------------------------------------
import win32print
import win32ui
from escpos.printer import File
import tempfile

def preparar_imagen_para_impresion(image, ancho_mm=80, dpi=203):
    ancho_pulgadas = ancho_mm / 25.4
    max_width = int(dpi * ancho_pulgadas)
    # Convertir a escala de grises y luego a blanco y negro
    image = image.convert('L')  
    image = image.point(lambda x: 0 if x < 128 else 255, '1')  

    # Redimensionar
    wpercent = (max_width / float(image.size[0]))
    hsize = int((float(image.size[1]) * float(wpercent)))
    image = image.resize((max_width, hsize), Image.ANTIALIAS)
    return image

def imprimir_imagen_win32(nombre_impresora, image):
    hPrinter = win32print.OpenPrinter(nombre_impresora)
    try:
        hDC = win32ui.CreateDC()
        hDC.CreatePrinterDC(nombre_impresora)

        hDC.StartDoc("Impresion desde Python")
        hDC.StartPage()

        dib = ImageWin.Dib(image)
        # Obtener el tamaño del área imprimible
        printer_width = hDC.GetDeviceCaps(110)  # HORZRES
        printer_height = hDC.GetDeviceCaps(111)  # VERTRES

        # Calcular el offset horizontal para centrar
        x_offset = (printer_width - image.width) // 2
        y_offset = 0  # puedes ajustar si quieres centrar también verticalmente

        dib.draw(hDC.GetHandleOutput(), (x_offset, y_offset, x_offset + image.width, y_offset + image.height))
        hDC.EndPage()
        hDC.EndDoc()
        hDC.DeleteDC()
    finally:
        win32print.ClosePrinter(hPrinter)


@app.route('/imprimir-imagen', methods=["POST"])
def imprimir_imagen():
    data = request.get_json()
    image_data = data.get("image", "")
    impresora_nombre = data.get("impresora", None)
    ticket_width_mm = data.get("ticketWidth", 80)  # lee el tamaño

    if not image_data.startswith("data:image/png;base64,"):
        return jsonify({"error": "Formato inválido"}), 400

    if not impresora_nombre:
        return jsonify({"error": "Impresora no especificada"}), 400

    image_data = image_data.replace("data:image/png;base64,", "")
    image_bytes = base64.b64decode(image_data)
    image = Image.open(BytesIO(image_bytes))

    # Preparar imagen con el ancho correcto
    image = preparar_imagen_para_impresion(image, ancho_mm=int(ticket_width_mm))

    try:
        imprimir_imagen_win32(impresora_nombre, image)
        return jsonify({"ok": True})
    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500
    
if __name__ == "__main__":
    print("Servidor POS iniciado en http://localhost:5000")
    app.run(host="0.0.0.0", port=5000)
