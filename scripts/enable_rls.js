const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('--- Activando Row Level Security (RLS) en Supabase ---');

  const tables = await prisma.$queryRaw`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE';
  `;

  console.log(`Detectadas ${tables.length} tablas en el esquema public.`);

  for (const row of tables) {
    const tableName = row.table_name;
    await prisma.$executeRawUnsafe(`ALTER TABLE "public"."${tableName}" ENABLE ROW LEVEL SECURITY;`);
    console.log(`✓ RLS activado en: ${tableName}`);
  }

  const rlsStatus = await prisma.$queryRaw`
    SELECT tablename, rowsecurity 
    FROM pg_tables 
    WHERE schemaname = 'public';
  `;

  console.log('\n--- Estado final de RLS ---');
  for (const status of rlsStatus) {
    console.log(`- ${status.tablename}: ${status.rowsecurity ? 'PROTEGIDO (RLS activo)' : 'VULNERABLE'}`);
  }
}

main()
  .catch((e) => {
    console.error('Error al aplicar RLS:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
