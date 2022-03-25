import container from '../../../inversify.config';
import { TYPES } from '../../../types';

import { IHashService } from '../../../interfaces/common.interface';

const bcryptService: IHashService = container.get<IHashService>(
  TYPES.HashService
);

describe('Bcrypt service', () => {
  it('should hash password and compare the password', async () => {
    let password = 'password';

    const hashedPassword: string = await bcryptService.hash(password);

    const isPasswordCorrect: boolean = await bcryptService.compare(
      password,
      hashedPassword
    );

    expect(isPasswordCorrect).toBe(true);
  });

  it('should return false on comparing the password', async () => {
    const password = 'password';
    const wrongPassword = 'password1';

    const hashedPassword: string = await bcryptService.hash(password);
    const isPasswordCorrect: boolean = await bcryptService.compare(
      wrongPassword,
      hashedPassword
    );
    expect(isPasswordCorrect).toBe(false);
  });
});
