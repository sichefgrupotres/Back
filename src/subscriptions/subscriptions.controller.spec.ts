import { Test, TestingModule } from '@nestjs/testing';
import { SuscriptionsController } from './subscriptions.controller';
import { SuscriptionsService } from './subscriptions.service';

describe('SuscriptionsController', () => {
  let controller: SuscriptionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SuscriptionsController],
      providers: [SuscriptionsService],
    }).compile();

    controller = module.get<SuscriptionsController>(SuscriptionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
