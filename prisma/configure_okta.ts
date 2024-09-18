import { PrismaClient, Org, User, Todo } from '@prisma/client';
const prisma = new PrismaClient()

async function main() {

  // Run this:
  // npm run configure-okta 1 https://{your_okta_domain}.okta.com

  const argv = process.argv.slice(2);
  if (argv.length !== 2) {
    throw 'Provide an org id'
  }

  const orgId = parseInt(argv[0]);
  const issuer = argv[1]

  const org: Org | null = await prisma.org.findFirst({
    where: { id : orgId }
  })

  if(!org) {
    throw 'Org not found'
  }

const result = await prisma.org.update({
  where: {
      id: orgId
    },
  data: {
    issuer: issuer,
    authorization_endpoint: issuer + "oauth2/v1/authorize",
    token_endpoint: issuer + "oauth2/v1/token",
    userinfo_endpoint: issuer + "oauth2/v1/userinfo",
    }
  })

  console.log("Successfully updated the DB")
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
