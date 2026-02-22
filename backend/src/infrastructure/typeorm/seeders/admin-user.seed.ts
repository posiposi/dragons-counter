import { DataSource } from 'typeorm';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';
import { UserEntity } from '../entities/user.entity';
import { UserRegistrationRequestEntity } from '../entities/user-registration-request.entity';
import { UserRoleEnum } from '../enums/user-role.enum';
import { RegistrationStatusEnum } from '../enums/registration-status.enum';

export async function seedAdminUser(dataSource: DataSource): Promise<void> {
  console.log('Seeding admin user...');

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.log(
      'ADMIN_EMAIL or ADMIN_DEFAULT_PASSWORD is not set, skipping admin user seeding.',
    );
    return;
  }

  const userRepository = dataSource.getRepository(UserEntity);

  const existingAdmin = await userRepository.findOne({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log('Admin user already exists, skipping.');
    return;
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  await dataSource.transaction(async (manager) => {
    const userId = randomUUID();

    const user = manager.create(UserEntity, {
      id: userId,
      email: adminEmail,
      password: hashedPassword,
      role: UserRoleEnum.ADMIN,
    });
    await manager.save(user);

    const registrationRequest = manager.create(UserRegistrationRequestEntity, {
      id: randomUUID(),
      userId: userId,
      status: RegistrationStatusEnum.APPROVED,
    });
    await manager.save(registrationRequest);
  });

  console.log('Admin user created successfully.');
}
