import pygame
import numpy as np
from perlin_noise import PerlinNoise
import random

# Definir tipos de terreno con colores
OBJECT_TYPES = {
    0: ('grass', (34, 139, 34)),       # Pasto - Verde
    1: ('mountain', (139, 137, 137)),  # Montaña - Gris
    2: ('castle', (128, 128, 128)),    # Castillo - Gris oscuro
    3: ('river', (30, 144, 255)),      # Río - Azul
    4: ('forest', (34, 100, 34)),      # Bosque - Verde oscuro
    5: ('snow', (255, 250, 250)),      # Nieve - Blanco
    6: ('desert', (210, 180, 140)),    # Desierto - Arena
    7: ('ice', (173, 216, 230)),       # Hielo - Azul claro
    8: ('tundra', (169, 169, 169)),    # Tundra - Gris claro
    9: ('taiga', (0, 100, 0)),         # Taiga - Verde Pino
    10: ('savanna', (189, 183, 107)),  # Sabana - Verde Oliva Claro
    11: ('swamp', (47, 79, 47)),       # Pantano - Verde Oscuro
    12: ('tropical forest', (0, 128, 0)), # Selva tropical - Verde Intenso
    13: ('lake', (0, 0, 255)),          # Lago - Azul
    14: ('city', (200, 100, 100)),      # Ciudad - Rojo apagado
    15: ('village', (210, 180, 222)),   # Aldea - Rosa claro
    16: ('river', (0, 0, 0)),      # Río - Azul
}

def generate_noise_map(width, height, scale=100.0):
    """Genera un mapa de ruido Perlin para el terreno."""
    noise = PerlinNoise(octaves=6)
    noise_map = np.zeros((height, width))
    for y in range(height):
        for x in range(width):
            noise_value = noise([x / scale, y / scale])
            noise_map[y][x] = noise_value
    return noise_map

def assign_terrain(noise_map):
    """Asigna tipos de terreno basado en el mapa de ruido y posición geográfica."""
    height, width = noise_map.shape
    world = np.zeros((height, width), dtype=int)
    
    for y in range(height):
        for x in range(width):
            # Ajuste de temperatura según la latitud (y) y humedad/altitud según la longitud (x)
            noise_value = noise_map[y][x]
            latitude_factor = y / height  # Norte a Sur
            longitude_factor = x / width  # Oeste a Este

            # Nieve y Hielo en zonas frías del norte
            if latitude_factor < 0.2:  # Extremo Norte
                if noise_value < -0.2:
                    world[y][x] = 7  # Hielo
                elif noise_value < 0.0:
                    world[y][x] = 5  # Nieve
                elif noise_value < 0.3:
                    world[y][x] = 8  # Tundra
                else:
                    world[y][x] = 7 #hielo world[y][x] = 9  # Taiga

            # Climas templados a fríos
            elif latitude_factor < 0.4:  # Latitudes Norte
                if noise_value < -0.1:
                    world[y][x] = 1  # Montaña
                elif noise_value < 0.1:
                    world[y][x] = 4  # Bosque
                elif noise_value < 0.3:
                    world[y][x] = 9  # Taiga
                else:
                    world[y][x] = 0  # Pasto

            # Climas templados y húmedos
            elif latitude_factor < 0.6:  # Latitudes Medias
                if noise_value < -0.2:
                    world[y][x] = 1  # Montaña
                elif noise_value < 0.0:
                    world[y][x] = 4  # Bosque
                elif noise_value < 0.2:
                    world[y][x] = 12  # Selva tropical
                else:
                    world[y][x] = 3  # Río

            # Climas cálidos
            elif latitude_factor < 0.8:  # Latitudes Sur
                if noise_value < -0.1:
                    world[y][x] = 1  # Montaña world[y][x] = 11  # Pantano
                elif noise_value < 0.1:
                    world[y][x] = 4  # Bosque world[y][x] = 0  # Pasto
                elif noise_value < 0.3:
                    world[y][x] = 12  # Selva tropical world[y][x] = 10  # Sabana
                else:
                    world[y][x] = 3  # Río world[y][x] = 6  # Desierto

            # Desiertos y climas muy cálidos en el extremo sur
            else:
                if noise_value < -0.2:
                    world[y][x] = 6  # Desierto
                elif noise_value < 0.0:
                    world[y][x] = 10  # Sabana
                elif noise_value < 0.3:
                    world[y][x] = 6  # Selva world[y][x] = 10#12  # Selva tropical
                else:
                    world[y][x] = 3  # Río world[y][x] = 6#0  # Pasto

    return world

def refine_water_bodies(world):
    """Conecta ríos con lagos y crea océanos."""
    height, width = world.shape

    for y in range(height):
        for x in range(width):
            if world[y][x] == 3:  # Río
                # Expandir ríos para conectarlos con lagos
                if y > 0 and world[y-1][x] == 0:  # Expansión hacia arriba
                    world[y-1][x] = 3
                if y < height - 1 and world[y+1][x] == 0:  # Expansión hacia abajo
                    world[y+1][x] = 3
                if x > 0 and world[y][x-1] == 0:  # Expansión hacia la izquierda
                    world[y][x-1] = 3
                if x < width - 1 and world[y][x+1] == 0:  # Expansión hacia la derecha
                    world[y][x+1] = 3

            # Crear lagos más grandes
            if world[y][x] == 3 and random.random() < 0.05:
                world[y][x] = 13  # Convertir en lago

    return world

def add_settlements(world):
    """Agregar ciudades y aldeas de manera lógica."""
    height, width = world.shape
    for y in range(1, height-1):
        for x in range(1, width-1):
            if world[y][x] == 0:  # Pasto
                # Probabilidad de agregar una ciudad cerca de agua dulce
                if (world[y+1][x] == 3 or world[y-1][x] == 3 or 
                    world[y][x+1] == 3 or world[y][x-1] == 3) and random.random() < 0.01:
                    world[y][x] = 14  # Ciudad

                # Probabilidad de agregar una aldea cerca de bosques
                elif (world[y+1][x] == 4 or world[y-1][x] == 4 or 
                      world[y][x+1] == 4 or world[y][x-1] == 4) and random.random() < 0.02:
                    world[y][x] = 15  # Aldea

    return world

def draw_world(screen, world, tile_size):
    """Dibuja el mundo en la pantalla usando pygame."""
    height, width = world.shape
    for y in range(height):
        for x in range(width):
            terrain_type = world[y][x]
            color = OBJECT_TYPES[terrain_type][1]
            pygame.draw.rect(screen, color, (x * tile_size, y * tile_size, tile_size, tile_size))

# Parámetros del mundo
width, height = 250, 150
tile_size = 5

# Inicializar Pygame
pygame.init()
screen = pygame.display.set_mode((width * tile_size, height * tile_size))
pygame.display.set_caption("Mundo Procedural Mejorado")

# Generar el mundo
noise_map = generate_noise_map(width, height)
world = assign_terrain(noise_map)
world = refine_water_bodies(world)
world = add_settlements(world)

# Dibujar el mundo
draw_world(screen, world, tile_size)

# Loop principal de Pygame
running = True
while running:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
    pygame.display.flip()

pygame.quit()
