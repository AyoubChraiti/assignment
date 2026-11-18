import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();
async function main() {
  const names = ['Alex Morgan', 'Sam Taylor', 'Jordan Lee', 'Robin Patel', 'Casey Martin', 'Jamie Smith', 'Avery Wilson', 'Drew Garcia', 'Cameron Brown', 'Morgan Davis', 'Riley Thomas', 'Quinn Anderson'];
  for (const [i, name] of names.entries()) {
    const email = `${name.toLowerCase().replace(' ', '.')}@example.com`;
    await db.user.upsert({ where: { email }, update: {}, create: {
      name, email, role: i % 3 === 0 ? 'admin' : 'member',
      salary: `${3500 + i * 250}.50`, startDate: new Date(`${2020 + i % 5}-01-15`),
    } });
  }
  for (const name of ['Website refresh', 'Customer portal', 'Inventory', 'Reporting', 'Onboarding', 'Billing', 'Documentation', 'Mobile app', 'Analytics', 'Support tools', 'Data migration', 'Accessibility']) {
    await db.project.upsert({ where: { name }, update: {}, create: { name } });
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => db.$disconnect());
