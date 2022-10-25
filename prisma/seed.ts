import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seed () {
  await prisma.payment.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.driver.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.create({
    data: {
      username: "test_user",
      hashedPassword: await bcrypt.hash("default@8901", 10),
    },
  });

  await prisma.driver.createMany({
    data: [
      {
        fullName: "John Moyo",
        licenseNumber: "472629HD",
        nationalID: "70-278724-G87",
        dob: new Date(1998, 3, 14),
        phone: "+263779528194",
        defensive: "0893714GT6",
        medical: "EXP 02-10-2023",
        class: "2",
        year: "2018",
      },
      {
        fullName: "Peter Dube",
        licenseNumber: "462729PB",
        nationalID: "70-278724-G87",
        dob: new Date(1998, 3, 14),
        phone: "+263779528194",
        defensive: "0893714GT6",
        medical: "EXP 02-10-2023",
        class: "2",
        year: "2018",
      },
    ],
  });
  const drivers = await prisma.driver.findMany();

  await prisma.vehicle.createMany({
    data: [
      {
        plateNumber: "PBS492",
        makeAndModel: "Land Rover, Defender",
        year: "2018",
        colour: "White",
        weight: 2000,
        netWeight: 1500,
        finesDue: 123232.23,
        driverId: drivers[0].id,
      },
      {
        plateNumber: "PBS498",
        makeAndModel: "Land Rover, Defender",
        year: "2018",
        colour: "White",
        weight: 2000,
        netWeight: 1500,
        finesDue: 123232.23,
        driverId: drivers[1].id,
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
