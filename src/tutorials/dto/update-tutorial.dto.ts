import { PartialType, PickType } from '@nestjs/swagger';
import { CreateTutorialDto } from './create-tutorial.dto';

export class UpdateTutorialDto extends PartialType(
  PickType(CreateTutorialDto, [
    'title',
    'description',
    'recipeId',
    'ingredients',
    'steps',
  ] as const),
) {}
