import fs from 'fs';
import axios from 'axios';
import path from 'path';

// Read .env
const envPath = path.resolve(process.cwd(), '.env');
console.log("Reading .env from:", envPath);

try {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const match = envContent.match(/VITE_ORS_API_KEY=(.+)/);
    const apiKey = match ? match[1].trim() : null;

    if (!apiKey) {
        console.error("API Key not found in .env");
        process.exit(1);
    }

    // Paris -> Versailles (Short route < 150km)
    const start = [2.3522, 48.8566];
    const end = [2.1301, 48.8049];

    const payload = {
        coordinates: [start, end],
        alternative_routes: { target_count: 3 }
    };

    console.log("Sending payload:", JSON.stringify(payload, null, 2));

    try {
        const response = await axios.post('https://api.openrouteservice.org/v2/directions/driving-car/geojson', payload, {
            headers: { Authorization: apiKey }
        });
        console.log("Success! Features count:", response.data.features.length);

        response.data.features.forEach((f, i) => {
            console.log(`\nRoute ${i + 1}:`);
            console.log(`  Duration: ${f.properties.summary.duration}s`);
            console.log(`  Distance: ${f.properties.summary.distance}m`);
            console.log(`  Coords Count: ${f.geometry.coordinates.length}`);
            const first = f.geometry.coordinates[0];
            const last = f.geometry.coordinates[f.geometry.coordinates.length - 1];
            console.log(`  Start: [${first[0]}, ${first[1]}]`);
            console.log(`  End:   [${last[0]}, ${last[1]}]`);
            // Check EXACT equality with previous
            if (i > 0) {
                const prev = response.data.features[i - 1];
                const sameGeo = JSON.stringify(f.geometry.coordinates) === JSON.stringify(prev.geometry.coordinates);
                console.log(`  Identical Geometry to Route ${i}? ${sameGeo}`);
            }
        });

    } catch (error) {
        console.error("Error Status:", error.response?.status);
        if (error.response?.data) {
            console.error("Error Data:", JSON.stringify(error.response.data, null, 2));
        } else {
            console.error("Error Message:", error.message);
        }
    }

} catch (e) {
    console.error("Failed to read .env:", e.message);
}
