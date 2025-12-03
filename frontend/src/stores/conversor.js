import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

const API_BASE = 'http://localhost:3000/api'
const API_KEY = '605d6117a65a4ee2a7aaf2c4'

export const useConversorStore = defineStore('conversor', () => {
  const monedaFavorita = ref(localStorage.getItem('monedaFavorita') || 'USD')
  const tiposCambio = ref({})
  const cargando = ref(false)
  const error = ref(null)

  const obtenerTiposCambio = async (monedaBase) => {
    cargando.value = true
    error.value = null
    try {
      const response = await axios.get(`${API_BASE}/tipos-cambio/${monedaBase}`)
      tiposCambio.value = response.data.conversion_rates
      return response.data
    } catch (err) {
      error.value = 'Error al obtener tipos de cambio'
      throw err
    } finally {
      cargando.value = false
    }
  }

  const guardarConversion = async (datos) => {
    try {
      await axios.post(`${API_BASE}/conversiones`, datos)
    } catch (err) {
      console.error('Error al guardar conversión:', err)
    }
  }

  const obtenerHistorialConversiones = async () => {
    try {
      const response = await axios.get(`${API_BASE}/conversiones`)
      return response.data
    } catch (err) {
      console.error('Error al obtener historial:', err)
      return []
    }
  }

  const obtenerDatosHistoricos = async (desde, hacia) => {
    try {
      const response = await axios.get(`${API_BASE}/historico/${desde}/${hacia}`)
      return response.data
    } catch (err) {
      console.error('Error al obtener datos históricos:', err)
      return []
    }
  }

  const establecerMonedaFavorita = (moneda) => {
    monedaFavorita.value = moneda
    localStorage.setItem('monedaFavorita', moneda)
  }

  return {
    monedaFavorita,
    tiposCambio,
    cargando,
    error,
    obtenerTiposCambio,
    guardarConversion,
    obtenerHistorialConversiones,
    obtenerDatosHistoricos,
    establecerMonedaFavorita
  }
})
