<template>
  <div class="container-fluid py-4">
    <div class="row mb-3 align-items-center">
      <div class="col">
        <h1 class="mb-1">Conversor de Divisas</h1>
        <p class="text-muted mb-0">Tipos de cambio en tiempo real</p>
      </div>
      <div class="col-auto">
        <span class="badge bg-success me-2">EN VIVO</span>
        <button class="btn btn-outline-light btn-sm">USD Base</button>
      </div>
    </div>

    <div class="row g-4">
      <div class="col-lg-5">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <span>Convertidor</span>
            <button class="btn btn-sm btn-primary" @click="intercambiarMonedas">SWAP</button>
          </div>
          <div class="card-body">
            <div class="mb-3">
              <label class="form-label small text-muted">Desde</label>
              <input 
                type="number" 
                class="form-control form-control-lg mb-2" 
                v-model="cantidadDesde"
                @input="convertirDesdeHacia"
                placeholder="100"
              >
              <select class="form-select" v-model="monedaDesde" @change="cambiarMonedaDesde">
                <option v-for="moneda in monedasDisponibles" :key="moneda" :value="moneda">
                  {{ moneda }} - {{ nombresMonedas[moneda] }}
                </option>
              </select>
              <small class="text-muted d-block mt-2">Disponible: {{ cantidadDesde }}</small>
            </div>

            <div class="text-center my-3">
              <button class="swap-button" @click="intercambiarMonedas">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="17 1 21 5 17 9"></polyline>
                  <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                  <polyline points="7 23 3 19 7 15"></polyline>
                  <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
                </svg>
              </button>
            </div>

            <div class="mb-3">
              <label class="form-label small text-muted">Hacia</label>
              <input 
                type="number" 
                class="form-control form-control-lg mb-2" 
                v-model="cantidadHacia"
                @input="convertirHaciaDesde"
                placeholder="0.00"
              >
              <select class="form-select" v-model="monedaHacia" @change="cambiarMonedaHacia">
                <option v-for="moneda in monedasDisponibles" :key="moneda" :value="moneda">
                  {{ moneda }} - {{ nombresMonedas[moneda] }}
                </option>
              </select>
            </div>

            <div class="tarifa-box" v-if="tasaActual">
              <div class="d-flex justify-content-between mb-2">
                <span class="text-muted small">Tarifa de transacción:</span>
                <strong class="text-white">0.3%</strong>
              </div>
              <div class="d-flex justify-content-between">
                <span class="text-muted small">Recibirás aproximadamente:</span>
                <strong class="text-primary">{{ (cantidadHacia * 0.997).toFixed(2) }} {{ monedaHacia }}</strong>
              </div>
            </div>

            <button class="btn btn-primary w-100 btn-lg" @click="realizarConversion">
              Convertir Ahora
            </button>

            <div class="text-center mt-3 text-muted small" v-if="tasaActual">
              Tasa actual: 1 {{ monedaDesde }} = {{ tasaActual.toFixed(6) }} {{ monedaHacia }}
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-7">
        <div class="card mb-4">
          <div class="card-header d-flex justify-content-between align-items-center">
            <span>Gráfico Histórico</span>
            <div>
              <button 
                class="btn-tabs" 
                :class="{ active: periodoGrafico === '7D' }"
                @click="cambiarPeriodoGrafico('7D')"
              >7D</button>
              <button 
                class="btn-tabs" 
                :class="{ active: periodoGrafico === '30D' }"
                @click="cambiarPeriodoGrafico('30D')"
              >30D</button>
              <button 
                class="btn-tabs" 
                :class="{ active: periodoGrafico === '90D' }"
                @click="cambiarPeriodoGrafico('90D')"
              >90D</button>
            </div>
          </div>
          <div class="card-body">
            <div class="d-flex gap-3 mb-3">
              <div class="flex-fill">
                <select class="form-select" v-model="monedaGraficoDesde" @change="actualizarGrafico">
                  <option v-for="moneda in monedasPrincipales" :key="moneda" :value="moneda">
                    {{ moneda }}
                  </option>
                </select>
              </div>
              <div class="flex-fill">
                <select class="form-select" v-model="monedaGraficoHacia" @change="actualizarGrafico">
                  <option v-for="moneda in monedasPrincipales" :key="moneda" :value="moneda">
                    {{ moneda }}
                  </option>
                </select>
              </div>
            </div>
            <canvas ref="graficoCanvas"></canvas>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            Moneda Favorita
          </div>
          <div class="card-body">
            <div class="mb-3">
              <label class="form-label">Seleccionar</label>
              <select class="form-select" v-model="monedaFavoritaSeleccionada" @change="cambiarMonedaFavorita">
                <option v-for="moneda in monedasPrincipales" :key="moneda" :value="moneda">
                  {{ moneda }} - {{ nombresMonedas[moneda] }}
                </option>
              </select>
            </div>

            <div class="moneda-favorita-box text-center">
              <div class="h2 mb-2">{{ monedaFavoritaSeleccionada }}</div>
              <div class="small mb-3">Conversión Rápida</div>
              <div class="row g-2">
                <div class="col-6">
                  <input 
                    type="number" 
                    class="form-control conversion-rapida-input" 
                    v-model="cantidadRapida"
                    @input="convertirRapido"
                    placeholder="100"
                  >
                </div>
                <div class="col-6">
                  <div class="conversion-rapida-input">
                    {{ resultadoRapido }}
                  </div>
                </div>
              </div>
              <button class="btn btn-success w-100 mt-3" @click="convertirAMonedaFavorita">
                Convertir a {{ monedaFavoritaSeleccionada }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="row mt-4">
      <div class="col-12">
        <div class="card">
          <div class="card-header">
            Historial
          </div>
          <div class="card-body">
            <div v-if="historial.length === 0" class="text-center py-5">
              <p class="text-muted">Sin conversiones aún</p>
            </div>
            <div v-else class="table-responsive">
              <table class="table">
                <thead>
                  <tr>
                    <th>Desde</th>
                    <th>Hacia</th>
                    <th>Cantidad</th>
                    <th>Resultado</th>
                    <th>Tasa</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in historial" :key="item._id">
                    <td>{{ item.desde }}</td>
                    <td>{{ item.hacia }}</td>
                    <td>{{ item.cantidad.toFixed(2) }}</td>
                    <td>{{ item.resultado.toFixed(2) }}</td>
                    <td>{{ item.tasa.toFixed(6) }}</td>
                    <td>{{ formatearFecha(item.fecha) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useConversorStore } from '../stores/conversor'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const store = useConversorStore()

const cantidadDesde = ref(100)
const cantidadHacia = ref(0)
const monedaDesde = ref('USD')
const monedaHacia = ref('EUR')
const tasaActual = ref(null)
const historial = ref([])
const graficoCanvas = ref(null)
let graficoInstancia = null

const periodoGrafico = ref('90D')
const monedaGraficoDesde = ref('USD')
const monedaGraficoHacia = ref('EUR')

const monedaFavoritaSeleccionada = ref(store.monedaFavorita)
const cantidadRapida = ref(100)
const resultadoRapido = ref('0.00')

const monedasDisponibles = ref([
  'USD', 'EUR', 'GBP', 'JPY', 'CNY', 'AUD', 'CAD', 'CHF', 'HKD', 'NZD',
  'SEK', 'KRW', 'SGD', 'NOK', 'MXN', 'INR', 'RUB', 'ZAR', 'BRL', 'TRY'
])

const monedasPrincipales = ref([
  'USD', 'EUR', 'GBP', 'JPY', 'CNY', 'AUD', 'CAD', 'CHF'
])

const nombresMonedas = {
  'USD': 'Dólar Estadounidense',
  'EUR': 'Euro',
  'GBP': 'Libra Esterlina',
  'JPY': 'Yen Japonés',
  'CNY': 'Yuan Chino',
  'AUD': 'Dólar Australiano',
  'CAD': 'Dólar Canadiense',
  'CHF': 'Franco Suizo',
  'HKD': 'Dólar de Hong Kong',
  'NZD': 'Dólar Neozelandés',
  'SEK': 'Corona Sueca',
  'KRW': 'Won Surcoreano',
  'SGD': 'Dólar de Singapur',
  'NOK': 'Corona Noruega',
  'MXN': 'Peso Mexicano',
  'INR': 'Rupia India',
  'RUB': 'Rublo Ruso',
  'ZAR': 'Rand Sudafricano',
  'BRL': 'Real Brasileño',
  'TRY': 'Lira Turca'
}

const cambiarMonedaDesde = async () => {
  await store.obtenerTiposCambio(monedaDesde.value)
  convertirDesdeHacia()
}

const cambiarMonedaHacia = () => {
  convertirDesdeHacia()
}

const convertirDesdeHacia = () => {
  if (store.tiposCambio[monedaHacia.value]) {
    tasaActual.value = store.tiposCambio[monedaHacia.value]
    cantidadHacia.value = (cantidadDesde.value * tasaActual.value).toFixed(2)
  }
}

const convertirHaciaDesde = () => {
  if (tasaActual.value && tasaActual.value !== 0) {
    cantidadDesde.value = (cantidadHacia.value / tasaActual.value).toFixed(2)
  }
}

const intercambiarMonedas = () => {
  const tempMoneda = monedaDesde.value
  const tempCantidad = cantidadDesde.value
  
  monedaDesde.value = monedaHacia.value
  monedaHacia.value = tempMoneda
  
  cantidadDesde.value = cantidadHacia.value
  cantidadHacia.value = tempCantidad
  
  cambiarMonedaDesde()
}

const realizarConversion = async () => {
  if (cantidadDesde.value && tasaActual.value) {
    await store.guardarConversion({
      desde: monedaDesde.value,
      hacia: monedaHacia.value,
      cantidad: parseFloat(cantidadDesde.value),
      resultado: parseFloat(cantidadHacia.value),
      tasa: tasaActual.value
    })
    await cargarHistorial()
  }
}

const cargarHistorial = async () => {
  historial.value = await store.obtenerHistorialConversiones()
}

const formatearFecha = (fecha) => {
  return new Date(fecha).toLocaleString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const cambiarPeriodoGrafico = (periodo) => {
  periodoGrafico.value = periodo
  actualizarGrafico()
}

const actualizarGrafico = async () => {
  const datos = await store.obtenerDatosHistoricos(monedaGraficoDesde.value, monedaGraficoHacia.value)
  
  if (graficoInstancia) {
    graficoInstancia.destroy()
  }

  const ctx = graficoCanvas.value.getContext('2d')
  
  const etiquetas = datos.map(d => {
    const fecha = new Date(d.fecha)
    return fecha.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
  })
  
  const valores = datos.map(d => d.tasa)

  graficoInstancia = new Chart(ctx, {
    type: 'line',
    data: {
      labels: etiquetas,
      datasets: [{
        label: `${monedaGraficoDesde.value}/${monedaGraficoHacia.value}`,
        data: valores,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointHoverRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(15, 39, 68, 0.9)',
          titleColor: '#ffffff',
          bodyColor: '#ffffff',
          borderColor: 'rgba(59, 130, 246, 0.5)',
          borderWidth: 1,
          padding: 12,
          displayColors: false
        }
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(255, 255, 255, 0.1)',
            drawBorder: false
          },
          ticks: {
            color: 'rgba(255, 255, 255, 0.7)'
          }
        },
        y: {
          grid: {
            color: 'rgba(255, 255, 255, 0.1)',
            drawBorder: false
          },
          ticks: {
            color: 'rgba(255, 255, 255, 0.7)'
          }
        }
      }
    }
  })
}

const cambiarMonedaFavorita = () => {
  store.establecerMonedaFavorita(monedaFavoritaSeleccionada.value)
  convertirRapido()
}

const convertirRapido = async () => {
  await store.obtenerTiposCambio('USD')
  if (store.tiposCambio[monedaFavoritaSeleccionada.value]) {
    const tasa = store.tiposCambio[monedaFavoritaSeleccionada.value]
    resultadoRapido.value = (cantidadRapida.value * tasa).toFixed(2)
  }
}

const convertirAMonedaFavorita = () => {
  monedaDesde.value = 'USD'
  monedaHacia.value = monedaFavoritaSeleccionada.value
  cantidadDesde.value = cantidadRapida.value
  cambiarMonedaDesde()
}

onMounted(async () => {
  await store.obtenerTiposCambio(monedaDesde.value)
  convertirDesdeHacia()
  await cargarHistorial()
  await actualizarGrafico()
  convertirRapido()
})
</script>
