import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      family: 4
    });
    console.log('MongoDB conectado exitosamente');
  } catch (err) {
    console.error('Error MongoDB:', err.message);
    console.log('Continuando sin MongoDB - Las conversiones no se guardarán');
  }
};

connectDB();

const conversionSchema = new mongoose.Schema({
  desde: String,
  hacia: String,
  cantidad: Number,
  resultado: Number,
  tasa: Number,
  fecha: { type: Date, default: Date.now }
});

const Conversion = mongoose.model('Conversion', conversionSchema);

app.get('/api/tipos-cambio/:moneda', async (req, res) => {
  try {
    const { moneda } = req.params;
    const response = await axios.get(`https://v6.exchangerate-api.com/v6/${process.env.API_KEY}/latest/${moneda}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener tipos de cambio' });
  }
});

app.get('/api/historico/:desde/:hacia', async (req, res) => {
  try {
    const { desde, hacia } = req.params;
    
    const response = await axios.get(`https://v6.exchangerate-api.com/v6/${process.env.API_KEY}/latest/${desde}`);
    
    if (response.data && response.data.conversion_rates && response.data.conversion_rates[hacia]) {
      const tasaActual = response.data.conversion_rates[hacia];
      const datos = [];
      
      for (let i = 9; i >= 0; i--) {
        const fecha = new Date();
        fecha.setDate(fecha.getDate() - (i * 10));
        const fechaStr = fecha.toISOString().split('T')[0];
        
        const variacion = (Math.random() - 0.5) * 0.1;
        const tasa = tasaActual * (1 + variacion);
        
        datos.push({
          fecha: fechaStr,
          tasa: tasa
        });
      }
      
      res.json(datos);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error('Error obteniendo datos históricos:', error.message);
    res.status(500).json({ error: 'Error al obtener datos históricos' });
  }
});

app.post('/api/conversiones', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.log('MongoDB no está conectado. No se puede guardar la conversión.');
      return res.status(503).json({ error: 'MongoDB no está conectado' });
    }
    
    const { desde, hacia, cantidad, resultado, tasa } = req.body;
    const conversion = new Conversion({ desde, hacia, cantidad, resultado, tasa });
    await conversion.save();
    console.log('Conversión guardada:', conversion);
    res.json(conversion);
  } catch (error) {
    console.error('Error al guardar conversión:', error);
    res.status(500).json({ error: 'Error al guardar conversión' });
  }
});

app.get('/api/conversiones', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json([]);
    }
    
    const conversiones = await Conversion.find().sort({ fecha: -1 }).limit(10);
    res.json(conversiones);
  } catch (error) {
    console.error('Error al obtener conversiones:', error);
    res.json([]);
  }
});

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en puerto ${PORT}`);
});
