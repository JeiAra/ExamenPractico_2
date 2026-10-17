# Portafolio interactivo — SIS-214

CV / portafolio web para el Segundo Examen Práctico (Unidad II) de Tecnologías Web I, Universidad Católica Boliviana “San Pablo”.

## Enlaces de publicación

- **Repositorio GitHub:** https://github.com/JeiAra/SIS214_ExamenPractico2_MontanoArantza
- **GitHub Pages:** https://jeiara.github.io/SIS214_ExamenPractico2_MontanoArantza/


## Tecnologías

HTML5 semántico y WAI-ARIA · CSS3 (tokens, reset universal, Flexbox, Grid, diseño mobile-first y media queries) · JavaScript ES6+ · Fetch API · Git · GitHub Pages.

## Estructura del proyecto

```text
├── index.html       # Estructura semántica y formularios
├── css/
│   └── styles.css   # Tokens, estilos responsivos y accesibilidad visual
├── js/
│   └── main.js      # Tema, menú, filtro, formulario y API de GitHub
└── README.md        # Documentación e instrucciones
```

## Funcionalidades

- **Tema claro/oscuro:** cambia `data-theme` en el elemento `html`; guarda y lee la preferencia con `localStorage`, `JSON.stringify()` y `JSON.parse()`.
- **Menú responsivo:** botón con `aria-expanded`, cierre al elegir una sección y con la tecla Escape.
- **Filtro de proyectos:** busca en tiempo real con `.filter()` y `.map()` sin modificar la colección original. Incluye My Virtual Buddy y este portafolio web, a partir de la información proporcionada.
- **Formulario:** utiliza validación HTML5, mensajes asociados a los campos, evento `input` y `event.preventDefault()` en el envío. **Es demostrativo:** valida los datos, pero no manda correo ni guarda el mensaje en un servidor.
- **API REST de GitHub:** consulta repositorios públicos con `fetch` y `async/await`; contempla `response.ok`, errores HTTP, red y estados de carga, éxito y error.

## Ejecutar localmente

Los módulos JavaScript ES necesitan un servidor local; no abras `index.html` directamente con `file://`.

1. Instala [Git](https://git-scm.com/downloads) y [Visual Studio Code](https://code.visualstudio.com/) si aún no los tienes.
2. Abre la carpeta del proyecto en VS Code.
3. Ejecuta en la terminal:

   ```bash
   python -m http.server 8000
   ```

4. Abre `http://localhost:8000` en el navegador. También puedes utilizar la extensión Live Server.

## Diseño adaptable

- Móvil: estilos base para menos de 768 px.
- Tablet: 768–1024 px.
- Escritorio: desde 1025 px.

## Publicar en GitHub Pages

En GitHub abre el repositorio → **Settings** → **Pages**. En *Build and deployment*, selecciona *Deploy from a branch*, rama `main` y carpeta `/(root)`, y guarda. Espera a que termine la publicación y prueba la URL en una ventana privada.

## Historial de versiones

Los commits deben representar cambios reales, pequeños y comprobados. Consulta `GUIA_GIT_Y_ENTREGA.md` para los pasos de publicación y entrega en Moodle.


## Datos personales y privacidad

- Se incluyo mi nombre completo, carrera, universidad, formación previa, habilidades, idiomas, correo, teléfono, ciudad y la fotografía del CV.
- La lista de proyectos contiene My Virtual Buddy y este portafolio de examen.
