require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors()); // Esto elimina el error "porquería" del CORS

const PORT = process.env.PORT || 3000;

// Almacenamiento en caché simple para no gastar tus consultas gratuitas de la API en cada recarga
let cacheData = null;
let lastFetch = 0;
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutos de caché

app.get('/api/fixture', async (req, res) => {
    const now = Date.now();
    
    if (cacheData && (now - lastFetch < CACHE_DURATION)) {
        return res.json(cacheData);
    }

    try {
        const response = await axios.get('https://api-football-v1.p.rapidapi.com/v3/fixtures', {
            params: {
                league: '1', // ID general de la FIFA World Cup en API-Football
                season: '2026'
            },
            headers: {
                'x-rapidapi-host': 'api-football-v1.p.rapidapi.com',
                'x-rapidapi-key': process.env.RAPIDAPI_KEY
            }
        });

        // Guardamos en caché y respondemos
        cacheData = response.data.response;
        lastFetch = now;
        res.json(cacheData);

    } catch (error) {
        console.error("Error al consultar API-Football:", error.message);
        res.status(500).json({ error: "No se pudieron obtener los datos reales." });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor puente corriendo en http://localhost:${PORT}`);
});