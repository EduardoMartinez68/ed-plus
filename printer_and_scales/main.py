from flask import Flask, jsonify, request
from flask_cors import CORS
from printer_utils import print_text, get_connected_printers
import serial
import time

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

if __name__ == "__main__":
    print("Servidor POS iniciado en http://localhost:5000")
    app.run(host="0.0.0.0", port=5000)
