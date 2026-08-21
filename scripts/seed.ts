import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

async function main() {
  if (!process.env.DATABASE_URL) {
    console.log('No DATABASE_URL set — skipping seed.');
    return;
  }

  const prisma = new PrismaClient();
  try {
    console.log('Seeding demo data...');

    const user = await prisma.user.upsert({
      where: { email: 'demo@fintechlab.local' },
      update: {},
      create: {
        id: randomUUID(),
        clerkId: `clerk_${randomUUID()}`,
        email: 'demo@fintechlab.local',
        name: 'Demo User',
      },
    });

    const workspace = await prisma.workspace.upsert({
      where: { slug: 'demo' },
      update: {},
      create: {
        id: randomUUID(),
        name: 'Demo Workspace',
        slug: 'demo',
        ownerId: user.id,
      },
    });

    await prisma.workspaceMember.upsert({
      where: { id: `${workspace.id}-${user.id}` },
      update: {},
      create: {
        id: `${workspace.id}-${user.id}`,
        workspaceId: workspace.id,
        userId: user.id,
        role: 'ADMIN',
      },
    });

    await prisma.copilotThread.createMany({
      data: [
        {
          id: randomUUID(),
          userId: user.id,
          title: 'Getting started with FintechLab',
          context: 'Demo thread',
            messages: [
            { role: 'user', content: 'How do I connect my bank?' },
            { role: 'assistant', content: 'Use the Open Banking sandbox to simulate connections.' },
            ],
        },
      ],
      skipDuplicates: true,
    });

    console.log('Seed complete.');
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
