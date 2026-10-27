# Reduce a 256 px las texturas de corteza y hojas de New-Rol (CC0: Poly Haven y TextureCan) para incrustarlas
# en js/arboles.js. Uso: python3 -I tools/reducir-texturas-arboles.py <carpeta public/assets de New-Rol> <salida>
import os, sys
from PIL import Image

origen, salida = sys.argv[1], sys.argv[2]
os.makedirs(salida, exist_ok=True)
TAM = 256
TAM_HOJA = 128
for sub, nombre in [('leaves/oak_color.png', 'hoja_roble.png'), ('leaves/aspen_color.png', 'hoja_alamo.png'),
                    ('leaves/pine_color.png', 'hoja_pino.png'),
                    ('bark/oak_color_1k.jpg', 'corteza_roble.jpg'), ('bark/birch_color_1k.jpg', 'corteza_abedul.jpg'),
                    ('bark/pine_color_1k.jpg', 'corteza_pino.jpg')]:
    im = Image.open(os.path.join(origen, sub))
    if nombre.endswith('.png'):
        im = im.convert('RGBA').resize((TAM_HOJA, TAM_HOJA), Image.LANCZOS)
        im.save(os.path.join(salida, nombre), optimize=True)
    else:
        im = im.convert('RGB').resize((TAM, TAM), Image.LANCZOS)
        im.save(os.path.join(salida, nombre), quality=80, optimize=True)
    print(nombre, os.path.getsize(os.path.join(salida, nombre)), 'bytes')
