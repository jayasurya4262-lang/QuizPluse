const fs = require('fs');
const path = require('path');

const target = process.argv[2] || 'sqlite';
const prismaDir = path.join(__dirname, '..', 'prisma');
const envPath = path.join(__dirname, '..', '.env');

if (target === 'postgres' || target === 'postgresql') {
  fs.copyFileSync(
    path.join(prismaDir, 'schema.prisma'),
    path.join(prismaDir, 'schema.current.prisma')
  );
  console.log('Switched Prisma to PostgreSQL (Neon/Production mode).');
  console.log('Ensure DATABASE_URL is set to your PostgreSQL connection string.');
} else {
  // Use sqlite
  fs.copyFileSync(
    path.join(prismaDir, 'schema.sqlite.prisma'),
    path.join(prismaDir, 'schema.prisma')
  );
  console.log('Switched Prisma to SQLite (Local/Zero-config mode).');
  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }
  if (!envContent.includes('DATABASE_URL=')) {
    envContent += '\nDATABASE_URL="file:./dev.db"\n';
    fs.writeFileSync(envPath, envContent);
  }
}
