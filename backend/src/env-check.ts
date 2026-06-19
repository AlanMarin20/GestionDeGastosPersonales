// Script de diagnóstico de variables de entorno
const requiredVars = ['DATABASE_URL', 'JWT_SECRET'];
const optionalVars = ['NODE_ENV', 'PORT', 'DB_SSL', 'DB_SYNCHRONIZE'];

console.log('\n========== DIAGNÓSTICO DE VARIABLES DE ENTORNO ==========');
console.log(`Timestamp: ${new Date().toISOString()}`);
console.log(`Node.js: ${process.version}`);
console.log(`Process ID: ${process.pid}`);
console.log(`Environment: ${process.env.NODE_ENV || 'desarrollo'}\n`);

console.log('VARIABLES REQUERIDAS:');
requiredVars.forEach((varName) => {
  const value = process.env[varName];
  const exists = !!value;
  const masked = value ? value.substring(0, 10) + '***' : 'NO CONFIGURADA';
  console.log(`  ✓ ${varName}: ${exists ? '✓ Presente' : '✗ FALTA'} (${masked})`);
});

console.log('\nVARIABLES OPCIONALES:');
optionalVars.forEach((varName) => {
  const value = process.env[varName];
  console.log(`  • ${varName}: ${value || '(no definida)'}`);
});

console.log('\nTODAS LAS VARIABLES CONFIGURADAS:');
const allVars = Object.keys(process.env).sort();
allVars.forEach((key) => {
  if (!key.includes('npm') && !key.includes('PATH') && key.length < 30) {
    console.log(`  ${key}=${process.env[key]?.substring(0, 30)}...`);
  }
});

console.log('=========================================================\n');

// Validación
const missingVars = requiredVars.filter((v) => !process.env[v]);
if (missingVars.length > 0) {
  console.error(
    `\n❌ FALTA(N) VARIABLE(S) REQUERIDA(S): ${missingVars.join(', ')}`,
  );
  console.error(
    'Por favor, configura estas variables de entorno en Northflank:\n',
  );
  missingVars.forEach((v) => {
    console.error(`  ${v}=<tu-valor>`);
  });
  process.exit(1);
}

console.log('✅ Todas las variables requeridas están configuradas\n');
