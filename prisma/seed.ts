import { PrismaClient, Organization } from "@prisma/client";
import { randomBytes, pbkdf2Sync } from "crypto";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

async function main() {
  const salt = randomBytes(16).toString("hex");
  const password = pbkdf2Sync("secret", salt, 310000, 32, "sha256").toString(
    "hex"
  );
  const upsertJohnDoe = await prisma.user.upsert({
    where: { email: "johndoe@example.com" },
    update: {},
    create: {
      first_name: "John",
      last_name: "Doe",
      email: "johndoe@example.com",
      password: password,
      salt: salt,
    },
  });
  console.log(upsertJohnDoe);

  const organizations: Organization[] = [];
  for (let i = 0; i < 100; i++) {
    const organization = await prisma.organization.create({
      data: {
        name: faker.company.companyName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        address: faker.address.streetAddress(),
        city: faker.address.city(),
        region: faker.address.state(),
        country: faker.address.countryCode("alpha-2"),
        postal_code: faker.address.zipCode(),
      },
    });
    console.log(organization);
    organizations.push(organization);
  }

  for (let i = 0; i < 100; i++) {
    const randomOrganization = faker.helpers.arrayElement(organizations);
    const contact = await prisma.contact.create({
      data: {
        organization: { connect: { id: randomOrganization.id } },
        first_name: faker.name.firstName(),
        last_name: faker.name.lastName(),
        email: faker.unique(faker.internet.email),
        phone: faker.phone.number(),
        address: faker.address.streetAddress(),
        city: faker.address.city(),
        region: faker.address.state(),
        country: faker.address.countryCode("alpha-2"),
        postal_code: faker.address.zipCode(),
      },
    });
    console.log(contact);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
