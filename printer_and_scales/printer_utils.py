# printer_utils.py
import win32print
import win32ui

def print_text(text, printer_name=None):
    try:
        if not printer_name:
            printer_name = win32print.GetDefaultPrinter()

        hPrinter = win32print.OpenPrinter(printer_name)
        hJob = win32print.StartDocPrinter(hPrinter, 1, ("Ticket", None, "RAW"))
        win32print.StartPagePrinter(hPrinter)
        win32print.WritePrinter(hPrinter, text.encode("utf-8"))
        win32print.EndPagePrinter(hPrinter)
        win32print.EndDocPrinter(hPrinter)
        win32print.ClosePrinter(hPrinter)
        return True
    except Exception as e:
        print(f"Error al imprimir: {e}")
        return False

def get_connected_printers():
    printers = []
    flags = win32print.PRINTER_ENUM_LOCAL | win32print.PRINTER_ENUM_CONNECTIONS
    printers_raw = win32print.EnumPrinters(flags)

    for p in printers_raw:
        printers.append({
            "name": p[2],
            "port": p[0],
            "type": p[1]
        })

    return printers



import serial
import time

def read_weight_from_scale(com_port='COM3', baud_rate=9600, timeout=2):
    try:
        with serial.Serial(com_port, baud_rate, timeout=timeout) as ser:
            time.sleep(0.1)  # Espera que el dispositivo se estabilice
            ser.flushInput()
            raw_data = ser.readline().decode('utf-8').strip()  # Lee una línea
            
            # Aquí puedes adaptar la limpieza del dato según cómo envíe la báscula el peso
            # Ejemplo: si envía "WT: 12.34 kg", extraemos sólo el número
            peso = ''.join(c for c in raw_data if c.isdigit() or c == '.')

            if peso:
                return float(peso)
            else:
                return None
    except Exception as e:
        print(f"Error leyendo báscula: {e}")
        return None