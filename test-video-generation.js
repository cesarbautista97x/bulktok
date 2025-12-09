// Test unitario para diagnosticar generación de videos
// Ejecutar con: node test-video-generation.js

const https = require('https');
const http = require('http');

const PROD_URL = 'https://bulktok-fivtx04ku-cesarbautista97xs-projects.vercel.app';
const LOCAL_URL = 'http://localhost:3000';

// Usar URL de producción por defecto
const BASE_URL = PROD_URL;

console.log('🧪 BulkTok Video Generation Unit Test');
console.log('=====================================\n');

// Test 1: Verificar que el endpoint existe
async function testEndpointExists() {
    console.log('TEST 1: Verificar endpoint /api/generate existe');
    console.log('------------------------------------------------');

    return new Promise((resolve) => {
        const url = new URL('/api/generate', BASE_URL);
        const client = url.protocol === 'https:' ? https : http;

        const req = client.request(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        }, (res) => {
            console.log(`Status: ${res.statusCode}`);

            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 401) {
                    console.log('✅ Endpoint existe (requiere autenticación)');
                    resolve(true);
                } else if (res.statusCode === 400) {
                    console.log('✅ Endpoint existe (requiere datos)');
                    resolve(true);
                } else if (res.statusCode === 404) {
                    console.log('❌ Endpoint NO existe');
                    resolve(false);
                } else {
                    console.log(`⚠️  Status inesperado: ${res.statusCode}`);
                    console.log('Response:', data);
                    resolve(true);
                }
            });
        });

        req.on('error', (error) => {
            console.log('❌ Error de conexión:', error.message);
            resolve(false);
        });

        req.end();
    });
}

// Test 2: Verificar scripts de Python existen
async function testPythonScripts() {
    console.log('\nTEST 2: Verificar scripts de Python');
    console.log('------------------------------------');

    const fs = require('fs');
    const path = require('path');

    const scripts = [
        '/Users/cesar/Automate/hedra-bulk/main.py',
        '/Users/cesar/Automate/hedra-bulk/bulk.py'
    ];

    let allExist = true;

    for (const script of scripts) {
        if (fs.existsSync(script)) {
            console.log(`✅ ${path.basename(script)} existe`);
        } else {
            console.log(`❌ ${path.basename(script)} NO existe`);
            allExist = false;
        }
    }

    return allExist;
}

// Test 3: Verificar Python está instalado
async function testPythonInstalled() {
    console.log('\nTEST 3: Verificar Python instalado');
    console.log('-----------------------------------');

    const { exec } = require('child_process');

    return new Promise((resolve) => {
        exec('python3 --version', (error, stdout, stderr) => {
            if (error) {
                console.log('❌ Python3 no encontrado');
                resolve(false);
            } else {
                console.log(`✅ ${stdout.trim()}`);
                resolve(true);
            }
        });
    });
}

// Test 4: Verificar dependencias de Python
async function testPythonDependencies() {
    console.log('\nTEST 4: Verificar dependencias de Python');
    console.log('-----------------------------------------');

    const { exec } = require('child_process');

    const dependencies = ['requests', 'python-dotenv'];

    for (const dep of dependencies) {
        await new Promise((resolve) => {
            exec(`python3 -c "import ${dep.replace('-', '_')}"`, (error) => {
                if (error) {
                    console.log(`❌ ${dep} no instalado`);
                } else {
                    console.log(`✅ ${dep} instalado`);
                }
                resolve();
            });
        });
    }
}

// Test 5: Simular request completo
async function testCompleteRequest() {
    console.log('\nTEST 5: Simular request completo (sin auth)');
    console.log('--------------------------------------------');

    console.log('⚠️  Este test fallará por falta de autenticación');
    console.log('   Pero nos dirá si el endpoint procesa requests\n');

    return new Promise((resolve) => {
        const url = new URL('/api/generate', BASE_URL);
        const client = url.protocol === 'https:' ? https : http;

        const boundary = '----WebKitFormBoundary' + Math.random().toString(36);
        const body = [
            `--${boundary}`,
            'Content-Disposition: form-data; name="prompt"',
            '',
            'Test video',
            `--${boundary}--`
        ].join('\r\n');

        const req = client.request(url, {
            method: 'POST',
            headers: {
                'Content-Type': `multipart/form-data; boundary=${boundary}`,
                'Content-Length': Buffer.byteLength(body)
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                console.log(`Status: ${res.statusCode}`);

                try {
                    const json = JSON.parse(data);
                    console.log('Response:', json);

                    if (json.error) {
                        console.log('Error esperado:', json.error);
                    }
                } catch (e) {
                    console.log('Response (no JSON):', data.substring(0, 200));
                }

                resolve();
            });
        });

        req.on('error', (error) => {
            console.log('❌ Error:', error.message);
            resolve();
        });

        req.write(body);
        req.end();
    });
}

// Ejecutar todos los tests
async function runAllTests() {
    const results = {
        endpoint: await testEndpointExists(),
        pythonScripts: await testPythonScripts(),
        pythonInstalled: await testPythonInstalled(),
    };

    await testPythonDependencies();
    await testCompleteRequest();

    console.log('\n📊 RESUMEN DE TESTS');
    console.log('==================');
    console.log('Endpoint existe:', results.endpoint ? '✅' : '❌');
    console.log('Scripts Python:', results.pythonScripts ? '✅' : '❌');
    console.log('Python instalado:', results.pythonInstalled ? '✅' : '❌');

    console.log('\n💡 POSIBLES CAUSAS DE FALLO:');
    console.log('============================');

    if (!results.endpoint) {
        console.log('❌ El endpoint /api/generate no existe o no responde');
        console.log('   → Verifica que el servidor esté corriendo');
        console.log('   → Verifica el deployment en Vercel');
    }

    if (!results.pythonScripts) {
        console.log('❌ Scripts de Python no encontrados');
        console.log('   → Verifica las rutas en .env:');
        console.log('     MAIN_PY_PATH=/Users/cesar/Automate/hedra-bulk/main.py');
        console.log('     BULK_PY_PATH=/Users/cesar/Automate/hedra-bulk/bulk.py');
    }

    if (!results.pythonInstalled) {
        console.log('❌ Python3 no está instalado');
        console.log('   → Instala Python 3: brew install python3');
    }

    console.log('\n📝 PRÓXIMOS PASOS:');
    console.log('==================');
    console.log('1. Verifica que estés autenticado en la app');
    console.log('2. Verifica que tengas Hedra API key configurada en /account');
    console.log('3. Abre DevTools (F12) y mira la pestaña Network');
    console.log('4. Intenta generar un video');
    console.log('5. Busca el request a /api/generate');
    console.log('6. Revisa la respuesta y compártela');
}

runAllTests().catch(console.error);
