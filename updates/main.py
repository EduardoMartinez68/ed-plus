import requests
import os
import shutil
import subprocess
from tqdm import tqdm

# === setting ===
API_VERSION_URL = "https://pluspuntodeventa.com/SOFTWARES/setting.php"  # this API return {"version": "1.8.0", "url": "https://tusitio.com/downloads/pos_1.8.0.exe"}


BASE_DIR = os.path.dirname(os.path.abspath(__file__))

EXE_PATH = os.path.join(BASE_DIR, "PLUS", "PLUS.exe") #this is the exe that run the POS
TEMP_EXE_PATH = os.path.join(BASE_DIR, "PLUS", "PLUS_temp.exe") #this is for save the change

DRIVER_PATH = os.path.join(BASE_DIR, "DRIVER","dist", "DRIVER.exe") #this is the exe that run the POS
TEMP_DRIVER_PATH = os.path.join(BASE_DIR, "DRIVER", "DRIVER_temp.exe") #this is for save the change

SETTINGS_FILE = os.path.join(BASE_DIR, "settings.txt")

def read_local_version():
    info_version=["0.0.0","0.0.0"]

    #if not exist, the file, we will create the file with the version 0 version_driver
    if not os.path.exists(SETTINGS_FILE):
        return ["0.0.0","0.0.0"]
    with open(SETTINGS_FILE, "r") as file:
        for line in file:
            #her get the local version
            if line.startswith("version_plus="):
                info_version[0]=line.strip().split("=")[1]
            
            #her get the local version
            if line.startswith("version_driver="):
                info_version[1]=line.strip().split("=")[1]

    #if exist the file but not exist the information that need, return the first version
    return info_version


def get_the_last_version_from_the_server():
    #her, we will get the information of the last version from the server
    try:
        response = requests.get(API_VERSION_URL) #get the data of the server
        if response.status_code == 200: #if the server answer with a message success, return the answer
            return response.json()  # {"version": "...", "url": "..."}
    except Exception as e:
        print(f"Error al conectar con el servidor: {e}")
    return None


def compare_versions(local, remota):
    return tuple(map(int, remota.split("."))) > tuple(map(int, local.split(".")))


def download_the_last_version_from_the_server(url, destiny):
    try:
        #connect with the server for download the new exe
        response = requests.get(url, stream=True)
        total = int(response.headers.get("content-length", 0)) #get the size of the file

        #if not exist the folder, we will create
        os.makedirs(os.path.dirname(destiny), exist_ok=True)
        print(destiny)

        #her we will open the last version and save the file in the folder of the program
        with open(destiny, 'wb') as file, tqdm(
            desc="Descargando nueva versión",
            total=total,
            unit='B',
            unit_scale=True,
            unit_divisor=1024,
        ) as bar:
            #hwe we will show a barr of progress
            for data in response.iter_content(chunk_size=1024):
                file.write(data)
                bar.update(len(data))

        return True #if all can download with success
    except Exception as e:
        print(f"Error al descargar: {e}")
        return False 


def update_exe(new_path,exe_path):
    if os.path.exists(exe_path):
        os.remove(exe_path)
    shutil.move(new_path, exe_path)


def update_setting(version):
    with open(SETTINGS_FILE, "w") as file:
        file.write(f"version={version}")


def run_software(EXE_PATH):
    subprocess.Popen([EXE_PATH], shell=True)


def update_software(version_local, last_version, url_download,TEMP_EXE_PATH, EXE_PATH):
    #now, we will compare the version for know if exist a new version in the server
    if compare_versions(version_local, last_version):

        #if we watch that exist a new version, so now going to download the last version
        print(f"Nueva versión disponible: {last_version}")
        if download_the_last_version_from_the_server(url_download, TEMP_EXE_PATH):
            #if can download the last version of PLUS, now remplace our exe with the new exe
            update_exe(TEMP_EXE_PATH,EXE_PATH)
            update_setting(last_version)
            print("Actualización completada.") #show a message that exist a new update
    else:
        print("Ya tienes la última versión.")

 

def main():

    #her is the most import because, her we will read the last version of PLUS from my server
    print('Comprobando si existen nuevas actualizaciones...')
    info_api = get_the_last_version_from_the_server() 

    #if exist a answer from the server, we will filter his information
    if info_api:
        #first we will read all the local version of the software
        version_local = read_local_version() #[0]=version software, [1]=version driver

        #get the information of the server
        last_version_plus = info_api.get("version_plus")
        url_download_plus = info_api.get("url_plus")
        last_version_drive = info_api.get("version_drive")
        url_download_drive = info_api.get("url_drive")

        #her we will update the drivers
        print('Comprobar Actualizaciones de los drivers')
        update_software(version_local[1], last_version_drive,url_download_drive,TEMP_DRIVER_PATH, DRIVER_PATH)

        #now we will update the POS 
        print('Comprobar Actualizaciones de PLUS')
        update_software(version_local[0], last_version_plus,url_download_plus,TEMP_EXE_PATH, EXE_PATH)
    else:
        print("No se pudo verificar la versión remota.")

    #run the post 
    run_software(DRIVER_PATH) #first run the driver for the printer and scales
    run_software(EXE_PATH) #after run the POS


if __name__ == "__main__":
    main()
