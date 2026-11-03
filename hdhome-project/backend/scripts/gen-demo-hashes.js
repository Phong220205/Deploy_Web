import bcrypt from 'bcrypt';

const passwords = {
  admin: 'Admin@123',
  projectmanager: 'Manager@123',
  technical: 'Technical@123',
};
for (const [user, pw] of Object.entries(passwords)) {
  const hash = await bcrypt.hash(pw, 10);
  console.log(`${user}|${pw}|${hash}`);
}
