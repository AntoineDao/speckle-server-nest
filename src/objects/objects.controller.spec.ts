import { Test, TestingModule } from '@nestjs/testing';
import { ObjectsController } from './objects.controller';

describe('Objects Controller', () => {
  let controller: ObjectsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ObjectsController],
    }).compile();

    controller = module.get<ObjectsController>(ObjectsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
