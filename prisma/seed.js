const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('Admin123!', 10);
  
  await prisma.user.upsert({
    where: { email: 'admin@bizcore.com' },
    update: {},
    create: {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@bizcore.com',
      password,
      phone: '+1234567890',
      role: 'SUPER_ADMIN',
      isVerified: true,
    },
  });
  
  await prisma.user.upsert({
    where: { email: 'manager@bizcore.com' },
    update: {},
    create: {
      firstName: 'Manager',
      lastName: 'User',
      email: 'manager@bizcore.com',
      password,
      phone: '+1234567891',
      role: 'MANAGER',
      isVerified: true,
    },
  });
  
  await prisma.user.upsert({
    where: { email: 'employee@bizcore.com' },
    update: {},
    create: {
      firstName: 'Employee',
      lastName: 'User',
      email: 'employee@bizcore.com',
      password,
      phone: '+1234567892',
      role: 'EMPLOYEE',
      isVerified: true,
    },
  });

  console.log('Seed completed successfully!');
  console.log('Login credentials:');
  console.log('Super Admin: admin@bizcore.com / Admin123!');
  console.log('Manager: manager@bizcore.com / Admin123!');
  console.log('Employee: employee@bizcore.com / Admin123!');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
