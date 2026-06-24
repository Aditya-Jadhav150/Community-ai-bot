const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding Database...');

  // Create Departments
  const deptRoads = await prisma.department.upsert({
    where: { name: 'Roads & Infrastructure' },
    update: {},
    create: { name: 'Roads & Infrastructure' },
  });
  
  const deptSanitation = await prisma.department.upsert({
    where: { name: 'Sanitation & Waste' },
    update: {},
    create: { name: 'Sanitation & Waste' },
  });

  const deptWater = await prisma.department.upsert({
    where: { name: 'Water & Sewage' },
    update: {},
    create: { name: 'Water & Sewage' },
  });

  // Create Users
  const user1 = await prisma.user.upsert({
    where: { email: 'citizen1@example.com' },
    update: {},
    create: {
      email: 'citizen1@example.com',
      name: 'John Doe',
      username: 'johndoe',
      role: 'USER',
      city: 'New York',
      onboardingComplete: true
    }
  });

  const worker1 = await prisma.user.upsert({
    where: { email: 'worker1@example.com' },
    update: {},
    create: {
      email: 'worker1@example.com',
      name: 'Jane Smith',
      username: 'janesmith_worker',
      role: 'WORKER',
      city: 'New York',
      onboardingComplete: true
    }
  });

  const adminUser = await prisma.user.findFirst({
    where: { role: 'SUPERADMIN' }
  });

  if (!adminUser) {
    console.log("No SUPERADMIN found to act as author of logs. Skipping report seeding.");
    return;
  }

  // Create some Issues
  const issuesToCreate = [
    {
      title: "Massive Pothole on 5th Ave",
      description: "There is a huge pothole causing traffic jams and damaging cars.",
      type: "INFRASTRUCTURE",
      severity: "HIGH",
      status: "REPORTED",
      latitude: 40.7128,
      longitude: -74.0060,
      address: "5th Avenue, NY",
      departmentId: deptRoads.id,
      authorId: user1.id,
    },
    {
      title: "Overflowing Garbage Bins",
      description: "The garbage bins near the park have not been emptied for a week.",
      type: "SANITATION",
      severity: "MEDIUM",
      status: "IN_PROGRESS",
      latitude: 40.7138,
      longitude: -74.0070,
      address: "Central Park West, NY",
      departmentId: deptSanitation.id,
      authorId: user1.id,
      assignedToId: worker1.id,
    },
    {
      title: "Broken Water Pipe",
      description: "Water is flooding the street near the intersection.",
      type: "UTILITIES",
      severity: "CRITICAL",
      status: "ESCALATED",
      isEscalated: true,
      latitude: 40.7148,
      longitude: -74.0080,
      address: "Main St & 2nd Ave, NY",
      departmentId: deptWater.id,
      authorId: user1.id,
    },
    {
      title: "Graffiti on Public Library",
      description: "Someone spray-painted the library walls overnight.",
      type: "VANDALISM",
      severity: "LOW",
      status: "RESOLVED",
      latitude: 40.7158,
      longitude: -74.0090,
      address: "NY Public Library",
      authorId: user1.id,
    }
  ];

  for (const issueData of issuesToCreate) {
    const existing = await prisma.issue.findFirst({ where: { title: issueData.title } });
    if (!existing) {
      await prisma.issue.create({
        data: issueData
      });
      console.log(`Created issue: ${issueData.title}`);
    }
  }

  console.log('Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
