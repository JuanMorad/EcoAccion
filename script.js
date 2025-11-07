// Estado global de compromisos
let compromisos = [];

/* ---------------------------
   Helpers DOM
----------------------------*/
function $(id) {
    return document.getElementById(id);
}

/* ---------------------------
   Frecuencia (antes de agregar)
----------------------------*/
function cambiarFrecuencia(accionId, cambio) {
    const input = $(`frec-${accionId}`);
    if (!input) return;

    let valor = parseInt(input.value) + cambio;
    if (valor < 1) valor = 1;
    input.value = valor;
}

/* ---------------------------
   Agregar compromiso
----------------------------*/
function agregarCompromiso(nombre, impactoUnidad, id, icono, unidad) {
    const frecuenciaInput = $(`frec-${id}`);
    if (!frecuenciaInput) return;

    const frecuencia = parseInt(frecuenciaInput.value);

    const index = compromisos.findIndex(item => item.nombre === nombre);

    if (index > -1) {
        // Ya existe -> acumula frecuencia
        compromisos[index].frecuencia += frecuencia;
    } else {
        // Nuevo compromiso
        compromisos.push({
            nombre,
            impacto: impactoUnidad, // impacto por vez
            frecuencia,             // veces por semana
            icono,
            unidad                  // 'litros', 'kg CO₂', 'bolsas plásticas'
        });
    }

    // Reset visual
    frecuenciaInput.value = 1;

    renderCompromisos();
}

/* ---------------------------
   Eliminar compromiso
----------------------------*/
function eliminarCompromiso(index) {
    compromisos.splice(index, 1);
    renderCompromisos();
}

/* ---------------------------
   Totales mensuales
----------------------------*/
function calcularTotalesMensuales() {
    let totalCO2 = 0;
    let totalAgua = 0;
    let totalBolsas = 0;

    compromisos.forEach(item => {
        const impactoSemanal = item.impacto * item.frecuencia;
        const impactoMensual = impactoSemanal * 4; // ~4 semanas

        if (item.unidad === 'kg CO₂') {
            totalCO2 += impactoMensual;
        } else if (item.unidad === 'litros') {
            totalAgua += impactoMensual;
        } else if (item.unidad === 'bolsas plásticas') {
            totalBolsas += impactoMensual;
        }
    });

    return {
        co2: Math.round(totalCO2),
        agua: Math.round(totalAgua),
        bolsas: Math.round(totalBolsas)
    };
}

/* ---------------------------
   Render UI
----------------------------*/
function renderCompromisos() {
    const contenedorCompromisos = $('compromisos-items');
    const totalSection = $('total-section');
    const badge = $('badge-compromisos');

    if (!contenedorCompromisos || !totalSection || !badge) return;

    if (compromisos.length === 0) {
        contenedorCompromisos.innerHTML = `
            <div class="compromisos-vacio">
                Aún no tienes compromisos. ¡Empieza adoptando acciones ecológicas! 🌱
            </div>
        `;
        totalSection.style.display = 'none';
        badge.textContent = '0 compromisos';
        return;
    }

    let html = '';
    compromisos.forEach((item, index) => {
        const impactoSemanal = item.impacto * item.frecuencia;

        html += `
            <div class="compromiso-item">
                <div class="item-info">
                    <div class="item-nombre">${item.icono} ${item.nombre}</div>
                    <div class="item-frecuencia">
                        Frecuencia: ${item.frecuencia}× por semana
                    </div>
                </div>

                <div class="item-impacto">
                    ${impactoSemanal} ${item.unidad}/semana
                </div>

                <button class="btn-eliminar" onclick="eliminarCompromiso(${index})">✕</button>
            </div>
        `;
    });

    contenedorCompromisos.innerHTML = html;

    const totales = calcularTotalesMensuales();

    $('total-co2').textContent = totales.co2;
    $('total-agua').textContent = totales.agua;
    $('total-bolsas').textContent = totales.bolsas;

    totalSection.style.display = 'block';

    badge.textContent = `${compromisos.length} ${compromisos.length === 1 ? 'compromiso' : 'compromisos'}`;
}

/* ---------------------------
   Compartir impacto
----------------------------*/
function compartirImpacto() {
    if (compromisos.length === 0) {
        alert('Todavía no has agregado compromisos 🌱');
        return;
    }

    const { co2, agua, bolsas } = calcularTotalesMensuales();

    let mensaje = '🌍 Mi Compromiso con el Planeta\n\n';
    mensaje += `He adoptado ${compromisos.length} acción(es) ecológicas:\n\n`;

    compromisos.forEach(item => {
        mensaje += `• ${item.nombre} (${item.frecuencia}× por semana)\n`;
    });

    mensaje += '\nImpacto mensual estimado:\n';
    if (co2 > 0) mensaje += `• ${co2} kg de CO₂ evitados\n`;
    if (agua > 0) mensaje += `• ${agua} litros de agua ahorrados\n`;
    if (bolsas > 0) mensaje += `• ${bolsas} bolsas plásticas evitadas\n`;

    mensaje += '\nCada acción cuenta 💚';

    alert(mensaje);
}
