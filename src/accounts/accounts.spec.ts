import { Test, TestingModule } from '@nestjs/testing';
import { Accounts } from './accounts';

describe('Accounts', () => {
  let provider: Accounts;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Accounts],
    }).compile();

    provider = module.get<Accounts>(Accounts);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
