// =======================
// Configuración Supabase
// =======================
const SUPABASE_URL = "https://lsgjlhpriezzjonrnwiq.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzZ2psaHByaWV6empvbnJud2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMzE0NDEsImV4cCI6MjA3MzcwNzQ0MX0._p0QYm2Wp3Tt95ecN9YygC7MLvjfLemVCe3vK_oTaRs";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Configuración global para PDF.js (requiere la librería en <head>)
if (typeof pdfjsLib !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

// Función para verificar si el usuario está logueado (usando auth real de Supabase)
async function estaLogueado() {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
}

// Función para manejar el login (ejemplo básico; puedes expandir con formulario en modalLogin)
async function manejarLogin(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  if (error) {
    alert("❌ Error al iniciar sesión: " + error.message);
    return false;
  }
  alert("✅ Sesión iniciada correctamente");
  // Cerrar modal de login si existe
  const modalLogin = document.getElementById('modalLogin');
  if (modalLogin) modalLogin.style.display = 'none';
  return true;
}
// Nueva función: Manejar login con Google
async function manejarLoginGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin + window.location.pathname  // Vuelve a la página actual después del login
    }
  });

  if (error) {
    console.error('Error en login Google:', error);
    alert("❌ Error al iniciar sesión con Google: " + error.message);
    return false;
  }
  console.log('Iniciando login con Google...');
  // Supabase maneja el redirect automáticamente; no cierres modal aquí
  return true;
}
// Escuchar cambios en el estado de autenticación (opcional, para actualizar UI dinámicamente)
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Estado de auth cambiado:', event, !!session);
  // Aquí puedes actualizar botones o UI global si es necesario, ej: mostrar/ocultar botones de subir
});

// Datos de cursos
const cursos = {
  arquitectura: {
    titulo: "Arquitectura de Software",
    descripcion: "Repositorio del curso de Arquitectura de Software",
    info: "Brinda conocimientos para diseñar y documentar arquitecturas.",
    contenido: [
      "Mapas conceptuales sobre fundamentos",
      "Informe técnico aplicando estándares",
      "Documento de diseño arquitectónico UML o C4",
      "Evaluación arquitectónica",
      "Avance del Proyecto",
    ],
    semanaActual: { titulo: "Semana 1", tema: "Mapas conceptuales sobre fundamentos" }
  },
  sistemas: {
    titulo: "Sistemas Operativos",
    descripcion: "Repositorio de Sistemas Operativos",
    info: "Conceptos básicos de procesos, memoria, E/S y archivos.",
    contenido: [
      "Introducción a SO",
      "Gestión de procesos",
      "Planificación de CPU",
      "Gestión de memoria",
      "Sistemas de archivos",
      "Seguridad"
    ],
    semanaActual: { titulo: "Semana 1", tema: "Historia y evolución de los SO" }
  },
  redes: {
    titulo: "Redes de Computadoras",
    descripcion: "Repositorio de Redes",
    info: "Fundamentos de redes, protocolos y servicios de comunicación.",
    contenido: [
      "Modelo OSI",
      "Modelo TCP/IP",
      "Redes LAN y WAN",
      "Protocolos de enrutamiento",
      "Servicios de red",
      "Seguridad en redes"
    ],
    semanaActual: { titulo: "Semana 1", tema: "Fundamentos de redes y modelo OSI" }
  },
  base_datos: {
    titulo: "Base de Datos",
    descripcion: "Repositorio de BD",
    info: "Diseñar, implementar y administrar bases de datos relacionales.",
    contenido: [
      "Modelo entidad-relación",
      "Normalización",
      "Lenguaje SQL",
      "Procedimientos almacenados",
      "Índices y optimización",
      "Administración de BD"
    ],
    semanaActual: { titulo: "Semana 1", tema: "Introducción a bases de datos" }
  }
};

// Archivos en memoria (se actualizan desde Supabase)
const archivosSubidos = {
  arquitectura: { 1: [], 2: [], 3: [] },
  sistemas: { 1: [], 2: [], 3: [] },
  redes: { 1: [], 2: [], 3: [] },
  base_datos: { 1: [], 2: [], 3: [] }
};

// Referencias DOM (con checks de seguridad)
let cursoSelect, titulo, descripcion, info, contenidoOl, footerCurso, cardsSemanaContainer;
let sliderCursos, sliderPrev, sliderNext, sliderIndicadores, slides;
let currentSlideIndex = 0;

// =======================
// Funciones para Slider de Cursos (corregido con debug y checks)
// =======================

// Función para seleccionar un slide (al clic o navegación)
function seleccionarSlide(index) {
  console.log(`DEBUG: Intentando seleccionar slide ${index}`); // Debug temporal
  
  if (!slides || slides.length === 0) {
    console.error('DEBUG: No se encontraron slides. Verifica HTML.');
    return;
  }
  
  // Remover active de todos
  slides.forEach(slide => slide.classList.remove('active'));
  
  // Añadir active al nuevo
  slides[index].classList.add('active');
  currentSlideIndex = index;
  
  // Actualizar hidden input para compatibilidad
  const cursoSeleccionado = slides[index].dataset.curso;
  const hiddenSelect = document.getElementById("cursoSelect");
  if (hiddenSelect) {
    hiddenSelect.value = cursoSeleccionado;
    console.log(`DEBUG: Hidden input actualizado a: ${cursoSeleccionado}`);
  } else {
    console.error('DEBUG: No se encontró #cursoSelect (hidden input). Verifica HTML.');
  }
  
  // Actualizar curso (dispara la lógica existente)
  actualizarCurso(cursoSeleccionado);
  console.log(`DEBUG: Llamado actualizarCurso(${cursoSeleccionado})`);
  
  // Actualizar indicadores (si existen)
  actualizarIndicadores();
}

// Función para navegar al slide anterior/siguiente (con wrap-around)
function navegarSlide(direccion) { // 'prev' o 'next'
  let nuevoIndex = currentSlideIndex;
  if (direccion === 'prev') {
    nuevoIndex = (currentSlideIndex - 1 + slides.length) % slides.length;
  } else if (direccion === 'next') {
    nuevoIndex = (currentSlideIndex + 1) % slides.length;
  }
  seleccionarSlide(nuevoIndex);
}

// Función para crear y actualizar indicadores (puntos debajo del slider)
function crearIndicadores() {
  if (!sliderIndicadores) {
    console.error('DEBUG: No se encontró #sliderIndicadores.');
    return;
  }
  sliderIndicadores.innerHTML = ''; // Limpiar
  slides.forEach((_, index) => {
    const indicador = document.createElement('span');
    indicador.className = 'indicador-slide';
    indicador.dataset.index = index;
    if (index === 0) indicador.classList.add('active'); // Primero activo por default
    indicador.addEventListener('click', () => seleccionarSlide(index));
    sliderIndicadores.appendChild(indicador);
  });
  console.log('DEBUG: Indicadores creados.');
}

function actualizarIndicadores() {
  const indicadores = document.querySelectorAll('.indicador-slide');
  indicadores.forEach(ind => ind.classList.remove('active'));
  if (indicadores[currentSlideIndex]) {
    indicadores[currentSlideIndex].classList.add('active');
  }
}

// Listeners para slides (clic directo en slide para seleccionar)
function agregarListenersSlides() {
  if (!slides || slides.length === 0) {
    console.error('DEBUG: No hay slides para agregar listeners.');
    return;
  }
  
  slides.forEach((slide, index) => {
    slide.addEventListener('click', (e) => {
      e.stopPropagation(); // Evita burbujeo
      console.log(`DEBUG: Clic en slide ${index} (${slide.dataset.curso})`);
      seleccionarSlide(index);
    });
  });
  console.log('DEBUG: Listeners agregados a slides.');
  
  // Listeners para botones prev/next
  if (sliderPrev) {
    sliderPrev.addEventListener('click', (e) => {
      e.stopPropagation();
      console.log('DEBUG: Clic en prev.');
      navegarSlide('prev');
    });
  }
  if (sliderNext) {
    sliderNext.addEventListener('click', (e) => {
      e.stopPropagation();
      console.log('DEBUG: Clic en next.');
      navegarSlide('next');
    });
  }
  console.log('DEBUG: Listeners agregados a controles.');
}

// =======================
// Modal Archivos (sin cambios)
// =======================
function crearModalArchivos() {
  if (document.getElementById('modalArchivos')) return;
  const modal = document.createElement('div');
  modal.id = 'modalArchivos';
  modal.style = `
    display:none; position:fixed; top:0; left:0; width:100%; height:100%;
    background:rgba(0,0,0,0.8); justify-content:center; align-items:center; z-index:1000;
  `;
  modal.innerHTML = `
    <div style="background:#222; padding:2rem; border-radius:8px; max-width:900px; width:90%; max-height:90vh; position:relative; color: white; overflow: hidden;">
      <span id="cerrarModalArchivos" style="position:absolute; top:10px; right:15px; cursor:pointer; font-size:1.5rem; color:white;">&times;</span>
      <h2 style="text-align:center;">Archivos Subidos</h2>
      <div id="modalContenidoArchivos" style="margin-top:1rem;"></div>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById('cerrarModalArchivos').addEventListener('click', () => modal.style.display = 'none');
  modal.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none'; });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') modal.style.display = 'none'; });
}

// Cargar archivos desde Supabase
async function cargarArchivosDesdeSupabase(curso, semana) {
  const { data, error } = await supabase.storage
    .from("archivos_curso")
    .list(`${curso}/semana${semana}/`);
  if (error) {
    console.error("Error al listar archivos:", error.message);
    return;
  }
  archivosSubidos[curso][semana] = [];
  for (let file of data) {
    const { data: urlData } = supabase.storage
      .from("archivos_curso")
      .getPublicUrl(`${curso}/semana${semana}/${file.name}`);
    archivosSubidos[curso][semana].push({
      nombre: file.name,
      url: urlData.publicUrl
    });
  }
}

// Mostrar archivos (con previews pequeñas + scroll + eliminar)
async function mostrarArchivos(curso, semana) {
  crearModalArchivos();
  const modal = document.getElementById('modalArchivos');
  const modalContenido = document.getElementById('modalContenidoArchivos');

  await cargarArchivosDesdeSupabase(curso, semana);
  const archivos = archivosSubidos[curso]?.[semana] || [];
  modalContenido.innerHTML = "";

  if (archivos.length === 0) {
    modalContenido.innerHTML = "<p style='text-align:center;'>No hay archivos disponibles.</p>";
  } else {
    // Contenedor con scroll
    const lista = document.createElement('ul');
    lista.style = `
      list-style:none; 
      padding:0; 
      margin:0; 
      max-height:70vh;   /* límite de alto */
      overflow-y:auto;   /* scroll vertical */
    `;

    archivos.forEach(async (archivo) => {
      const li = document.createElement('li');
      li.style = "margin-bottom:1.5rem; padding:1rem; background:#333; border-radius:8px; color:white;";

      const nombre = document.createElement('p');
      nombre.textContent = archivo.nombre;
      nombre.style = "font-weight:bold;";

      let preview;
      const ext = archivo.nombre.split('.').pop().toLowerCase();
      if (["jpg","jpeg","png","gif","webp"].includes(ext)) {
        preview = document.createElement('img');
        preview.src = archivo.url;
        preview.style = "max-width:100%; border-radius:5px; margin-top:0.5rem;";
      } else if (ext === "pdf") {
        preview = document.createElement('iframe');
        preview.src = archivo.url;
        preview.style = "width:100%; height:300px; border:none; margin-top:0.5rem;";
      } else if (["mp4","webm","ogg"].includes(ext)) {
        preview = document.createElement('video');
        preview.src = archivo.url;
        preview.controls = true;
        preview.style = "max-width:100%; margin-top:0.5rem;";
      } else {
        preview = document.createElement('a');
        preview.href = archivo.url;
        preview.target = "_blank";
        preview.textContent = "📎 Abrir archivo";
        preview.style = "color:#4da3ff; display:block; margin-top:0.5rem;";
      }

      // Botones
      const btns = document.createElement('div');
      btns.style = "margin-top:0.8rem; display:flex; gap:0.5rem; flex-wrap:wrap;";

      // Vista previa en ventana aparte
      const btnVista = document.createElement('button');
      btnVista.textContent = "👁️ Vista previa";
      btnVista.style = "background:#4da3ff; border:none; padding:0.4rem 0.8rem; border-radius:5px; cursor:pointer; color:white;";
      btnVista.onclick = () => {
        window.open(archivo.url, "_blank");
      };

      // Descargar
      const btnDescargar = document.createElement('a');
      btnDescargar.href = archivo.url;
      btnDescargar.textContent = "⬇️ Descargar";
      btnDescargar.target = "_blank";
      btnDescargar.style = "background:#28a745; border:none; padding:0.4rem 0.8rem; border-radius:5px; cursor:pointer; color:white; text-decoration:none;";

      // Eliminar (solo si está logueado)
      const btnEliminar = document.createElement('button');
      btnEliminar.textContent = "🗑️ Eliminar";
      btnEliminar.style = "background:#ff4444; border:none; padding:0.4rem 0.8rem; border-radius:5px; cursor:pointer; color:white;";
      btnEliminar.onclick = async () => {
        if (!await estaLogueado()) {
          mostrarModalLoginRequerido();
          return;
        }
        if (confirm(`¿Eliminar ${archivo.nombre}?`)) {
          const path = `${curso}/semana${semana}/${archivo.nombre}`;
          const { error } = await supabase.storage.from("archivos_curso").remove([path]);
          if (error) {
            alert("❌ Error: " + error.message);
          } else {
            alert("✅ Archivo eliminado");
            // Eliminar de la lista local
            archivosSubidos[curso][semana] = archivosSubidos[curso][semana].filter(f => f.nombre !== archivo.nombre);
            // Actualizar la vista
            mostrarArchivos(curso, semana);
          }
        }
      };

      btns.appendChild(btnVista);
      btns.appendChild(btnDescargar);
      btns.appendChild(btnEliminar);

      li.appendChild(nombre);
      li.appendChild(preview);
      li.appendChild(btns);

      lista.appendChild(li);
    });

    modalContenido.appendChild(lista);
  }

  modal.style.display = 'flex';
}

// Subir archivos (ahora con verificación de auth real)
// Subir archivos (ahora con verificación de auth real) - CORREGIDO
function agregarListenersBotones() {
  // Listeners para botones "Subir archivo"
  document.querySelectorAll('.btn-semana.subir-archivo').forEach(button => {
    button.onclick = async (e) => {
      e.preventDefault();
      e.stopPropagation(); // Evita burbujeo si es necesario
      
      if (!await estaLogueado()) {
        mostrarModalLoginRequerido();
        return;
      }

      const inputId = button.dataset.fileinput;
      const input = document.getElementById(inputId);
      
      if (!input) {
        console.error(`DEBUG: Input file no encontrado con ID: ${inputId}`);
        alert("❌ Error: No se pudo encontrar el input de archivo.");
        return;
      }

      // Asignar el listener ANTES de click() para evitar timing issues
      input.onchange = async () => {
        const file = input.files[0]; // Solo UNA declaración (eliminé el duplicado)
        if (!file) {
          console.warn('DEBUG: No se seleccionó ningún archivo.');
          return;
        }
        
        console.log(`DEBUG: Archivo seleccionado: ${file.name}`); // Debug temporal
        
        // Verificar auth nuevamente antes de subir (por si la sesión expiró)
        if (!await estaLogueado()) {
          alert("❌ Sesión expirada. Por favor, inicia sesión nuevamente.");
          mostrarModalLoginRequerido();
          return;
        }
        
        const curso = button.dataset.curso;
        const semana = button.dataset.semana;
        const path = `${curso}/semana${semana}/${file.name}`;
        
        console.log(`DEBUG: Subiendo a path: ${path}`); // Debug temporal
        
        const { error } = await supabase.storage
          .from("archivos_curso")
          .upload(path, file, { upsert: true });
        
        if (error) {
          console.error('DEBUG: Error en upload:', error);
          alert("❌ Error al subir: " + error.message);
        } else {
          alert("✅ Archivo subido correctamente");
          mostrarArchivos(curso, semana); // Recarga la lista de archivos
          input.value = ''; // Limpia el input para permitir re-subir el mismo archivo
        }
      };

      // Ahora abrir el selector de archivos
      input.click();
    };
  });

  // Listeners para botones "Ver más" (sin cambios, pero con check)
  document.querySelectorAll('.btn-semana.ver-mas').forEach(button => {
    button.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const curso = button.dataset.curso;
      const semana = button.dataset.semana;
      
      if (!curso || !semana) {
        console.error('DEBUG: Datos de curso/semana no encontrados en botón.');
        alert("❌ Error: Datos del botón no válidos.");
        return;
      }
      
      console.log(`DEBUG: Abriendo archivos para ${curso} - Semana ${semana}`); // Debug temporal
      mostrarArchivos(curso, semana);
    };
  });
  
  console.log('DEBUG: Listeners de botones agregados correctamente.'); // Debug temporal
}
// Actualizar curso y tarjetas (versión con debug)
async function actualizarCurso(curso) {
  console.log(`DEBUG: Actualizando curso a: ${curso}`); // Debug temporal
  
  const data = cursos[curso];
  if (!data) {
    console.error(`DEBUG: Curso no encontrado: ${curso}`);
    return;
  }

  // Verificar sesión de usuario
  const { data: { session } } = await supabase.auth.getSession();
  const logueado = !!session;

  // Actualizar referencias DOM si no están seteadas (por si se llaman antes de DOMContentLoaded)
  if (!titulo) titulo = document.getElementById("cursoTitulo");
  if (!descripcion) descripcion = document.getElementById("cursoDescripcion");
  if (!info) info = document.getElementById("cursoInfo");
  if (!contenidoOl) contenidoOl = document.getElementById("cursoContenido");
  if (!footerCurso) footerCurso = document.getElementById("cursoFooter");
  if (!cardsSemanaContainer) cardsSemanaContainer = document.getElementById("cardsSemanaContainer");

  if (!titulo || !descripcion || !info || !contenidoOl || !footerCurso || !cardsSemanaContainer) {
    console.error('DEBUG: Algunos elementos DOM no encontrados. Verifica IDs en HTML.');
    return;
  }

  // Actualizar información general del curso
  titulo.textContent = data.titulo;
  descripcion.textContent = data.descripcion;
  info.textContent = data.info;

  contenidoOl.innerHTML = "";
  data.contenido.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    contenidoOl.appendChild(li);
  });

  // Temas por semana
  const temas = [
  data.semanaActual.tema,
  curso === "arquitectura" ? "Informe técnico con estándares" :
  curso === "sistemas" ? "Gestión de procesos" :
  curso === "redes" ? "Protocolos de enrutamiento" : "Normalización",
  curso === "arquitectura" ? "Diseño arquitectónico UML o C4" :
  curso === "sistemas" ? "Planificación de CPU" :
  curso === "redes" ? "Seguridad en redes" : "Lenguaje SQL",
  curso === "arquitectura" ? "Evaluación arquitectónica" :
  curso === "sistemas" ? "Gestión de memoria" :
  curso === "redes" ? "Servicios de red" : "Procedimientos almacenados",
  curso === "arquitectura" ? "Avance del proyecto" :
  curso === "sistemas" ? "Sistemas de archivos" :
  curso === "redes" ? "Seguridad en redes" : "Optimización de consultas"
  ];

  // Renderizar tarjetas semanales
  cardsSemanaContainer.innerHTML = "";
  for (let i = 1; i <= 6; i++) {
    const card = document.createElement('div');
    card.className = 'card-semana';
    card.style = "flex:1 1 30%; background:#222; padding:1rem; border-radius:8px; color:white;";
    card.innerHTML = `
      <h3>Semana ${i}</h3>
      <p>Tema: ${temas[i - 1] || "Tema no definido"}</p>
      <input type="file" id="fileSemana${i}" style="display:none;">
      ${
        logueado
          ? `<button class="btn-semana subir-archivo" data-semana="${i}" data-curso="${curso}" data-fileinput="fileSemana${i}">Subir archivo</button>`
          : ``
      }
      <button class="btn-semana ver-mas" data-semana="${i}" data-curso="${curso}">Ver más</button>
    `;
    cardsSemanaContainer.appendChild(card);
  }

  footerCurso.textContent = `Curso: ${data.titulo}`;

  agregarListenersBotones();
  console.log(`DEBUG: Curso actualizado exitosamente para ${curso}. Logueado: ${logueado}`);
  // Trigger animación después de actualizar contenido
  const infoSection = document.querySelector('.info-curso');
  if (infoSection) {
  infoSection.classList.remove('animate-in');
  // Fuerza reflow para reset animación
  infoSection.offsetHeight;
  infoSection.classList.add('animate-in');
  }
}

// Modal Login requerido
function mostrarModalLoginRequerido() {
  const modal = document.getElementById('modalLoginRequerido');
  if (modal) modal.style.display = 'flex';
  else console.error('DEBUG: Modal #modalLoginRequerido no encontrado.');
}

// =======================
// Inicializar (modificado: slider en lugar de select)
// =======================
document.addEventListener('DOMContentLoaded', () => {
  console.log('DEBUG: DOM cargado. Inicializando...'); // Debug
  
  // Setear referencias DOM
  cursoSelect = document.getElementById("cursoSelect");
  titulo = document.getElementById("cursoTitulo");
  descripcion = document.getElementById("cursoDescripcion");
  info = document.getElementById("cursoInfo");
  contenidoOl = document.getElementById("cursoContenido");
  footerCurso = document.getElementById("cursoFooter");
  cardsSemanaContainer = document.getElementById("cardsSemanaContainer");
  
  // Refs para slider
  sliderCursos = document.getElementById("sliderCursos");
  sliderPrev = document.getElementById("sliderPrev");
  sliderNext = document.getElementById("sliderNext");
  sliderIndicadores = document.getElementById("sliderIndicadores");
  slides = document.querySelectorAll(".slide-curso");
  
  console.log(`DEBUG: Slides encontrados: ${slides.length}`); // Debe ser 4 (arquitectura, sistemas, redes, base_datos)
  
  // Inicializar slider si existe
  if (sliderCursos && slides.length > 0) {
    crearIndicadores(); // Crear puntos/indicadores
    agregarListenersSlides(); // Listeners para clics y navegación
    seleccionarSlide(0); // Seleccionar primero por default (arquitectura)
    console.log('DEBUG: Slider inicializado correctamente.');
  } else {
    // Fallback si no hay slider (por si acaso)
    console.warn('DEBUG: Slider no encontrado. Usando fallback.');
    if (cursoSelect) {
      actualizarCurso(cursoSelect.value || 'arquitectura');
    } else {
      actualizarCurso('arquitectura');
    }
  }
  
  // Listeners existentes para modales/login
  const closeLoginRequerido = document.getElementById('closeLoginRequerido');
  if (closeLoginRequerido) closeLoginRequerido.addEventListener('click', () => {
    const modal = document.getElementById('modalLoginRequerido');
    if (modal) modal.style.display = 'none';
  });
  
  const modalLoginRequerido = document.getElementById('modalLoginRequerido');
  if (modalLoginRequerido) modalLoginRequerido.addEventListener('click', e => {
    if (e.target === modalLoginRequerido) modalLoginRequerido.style.display = 'none';
  });
  
  const btnIrALogin = document.getElementById('btnIrALogin');
  if (btnIrALogin) btnIrALogin.addEventListener('click', () => {
    const modalReq = document.getElementById('modalLoginRequerido');
    const modalLogin = document.getElementById('modalLogin');
    if (modalReq) modalReq.style.display = 'none';
    if (modalLogin) modalLogin.style.display = 'flex';
  });

  // Listener para formulario de login
  const formLogin = document.getElementById('formLogin');
  if (formLogin) {
    formLogin.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('emailLogin')?.value;
      const password = document.getElementById('passwordLogin')?.value;
      if (email && password) {
        await manejarLogin(email, password);
      }
    });
  }
  
  // Actualizar estado login
  actualizarEstadoLogin();
  
  console.log('DEBUG: Inicialización completa.');
  const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('reveal');
    }
  });
});
observer.observe(document.querySelector('.info-curso'));
});

// =======================
// UI: Mostrar Login / Logout
// =======================
async function actualizarEstadoLogin() {
  const loginLink = document.getElementById("loginLink");
  if (!loginLink) {
    console.error('DEBUG: #loginLink no encontrado.');
    return;
  }
  
  const { data: { session } } = await supabase.auth.getSession();

  if (session) {
    // Usuario logueado → mostrar "Cerrar sesión"
    loginLink.textContent = "Cerrar sesión";
    loginLink.onclick = async (e) => {
      e.preventDefault();
      await supabase.auth.signOut();
      alert("🔒 Sesión cerrada");
      loginLink.textContent = "Login";
      loginLink.onclick = (ev) => {
        ev.preventDefault();
        const modalLogin = document.getElementById("modalLogin");
        if (modalLogin) modalLogin.style.display = "flex";
      };

      // Refrescar el curso actual para ocultar "Subir archivo"
      const cursoActual = document.getElementById("cursoSelect")?.value || 'arquitectura';
      await actualizarCurso(cursoActual);
    };
  } else {
    // Usuario no logueado → mostrar "Login"
    loginLink.textContent = "Login";
    loginLink.onclick = (e) => {
      e.preventDefault();
      const modalLogin = document.getElementById("modalLogin");
      if (modalLogin) modalLogin.style.display = "flex";
    };
  }
  console.log(`DEBUG: Estado login actualizado. Logueado: ${!!session}`);
}

// Revisar estado al cargar (ya en DOMContentLoaded, pero por si acaso)
actualizarEstadoLogin();

// Escuchar cambios en sesión para actualizar UI automáticamente (corregido: sin duplicados)
supabase.auth.onAuthStateChange(async (event, session) => {
  console.log('DEBUG: Cambio en auth detectado:', event, !!session);
  await actualizarEstadoLogin();

  // Si el curso actual está visible, lo recargamos para mostrar/ocultar los botones "Subir archivo"
  const cursoActual = document.getElementById("cursoSelect")?.value || 'arquitectura';
  if (cursoActual) {
    await actualizarCurso(cursoActual);
  }
});
// Nuevo: Listener para botón "Continuar con Google"
const btnGoogleLogin = document.getElementById('btnGoogleLogin');
if (btnGoogleLogin) {
  btnGoogleLogin.addEventListener('click', async (e) => {
    e.preventDefault();
    await manejarLoginGoogle();
    // Opcional: Cerrar modal después de iniciar (pero como hay redirect, no siempre se ejecuta)
    const modalLogin = document.getElementById('modalLogin');
    if (modalLogin) modalLogin.style.display = 'none';
  });
} else {
  console.warn('DEBUG: Botón #btnGoogleLogin no encontrado. Verifica HTML.');
}

