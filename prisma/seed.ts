import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seed () {
  await prisma.payment.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.owner.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.create({
    data: {
      username: "test_user",
      hashedPassword: await bcrypt.hash("default@8901", 10),
    },
  });

  await prisma.owner.createMany({
    data: [
      {
        fullName: "John Moyo",
        licenseNumber: "472629HD",
      },
      {
        fullName: "Peter Dube",
        licenseNumber: "462729PB",
      },
    ],
  });
  const owners = await prisma.owner.findMany();

  await prisma.vehicle.createMany({
    data: [
      {
        plateNumber: "PBS492",
        makeAndModel: "Land Rover, Defender",
        finesDue: 123232.23,
        ownerId: owners[0].id,
      },
      {
        plateNumber: "PBS492",
        makeAndModel: "Land Rover, Defender",
        finesDue: 123232.23,
        ownerId: owners[1].id,
      }
    ]
  });
  const vehicles = await prisma.vehicle.findMany();

  await prisma.payment.createMany({
    data: [
      {
        amount: 123.23,
        vehicleId: vehicles[0].id,
      },
      {
        amount: 83.23,
        vehicleId: vehicles[0].id,
      },
      {
        amount: 123.23,
        vehicleId: vehicles[1].id,
      },
      {
        amount: 53.23,
        vehicleId: vehicles[1].id,
      }
    ]
  });

  console.log(`Database has been seeded. 🌱`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
