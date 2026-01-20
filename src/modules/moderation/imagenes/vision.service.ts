import { Injectable } from '@nestjs/common';
import { ImageAnnotatorClient, protos } from '@google-cloud/vision';
import { PostStatus } from 'src/posts/dto/create-post.dto';

export type SafeSearchAnnotation =
  protos.google.cloud.vision.v1.ISafeSearchAnnotation;

const Likelihood = protos.google.cloud.vision.v1.Likelihood;

function toNumber(
  val: SafeSearchAnnotation[keyof SafeSearchAnnotation] | undefined,
): number {
  return typeof val === 'number' ? val : Likelihood.UNKNOWN;
}

export type LikelihoodText =
  | 'UNKNOWN'
  | 'VERY_UNLIKELY'
  | 'UNLIKELY'
  | 'POSSIBLE'
  | 'LIKELY'
  | 'VERY_LIKELY';

const likelihoodMap: Record<number, LikelihoodText> = {
  [Likelihood.UNKNOWN]: 'UNKNOWN',
  [Likelihood.VERY_UNLIKELY]: 'VERY_UNLIKELY',
  [Likelihood.UNLIKELY]: 'UNLIKELY',
  [Likelihood.POSSIBLE]: 'POSSIBLE',
  [Likelihood.LIKELY]: 'LIKELY',
  [Likelihood.VERY_LIKELY]: 'VERY_LIKELY',
};

function likelihoodToText(val: number): LikelihoodText {
  return likelihoodMap[val] ?? 'UNKNOWN';
}

export interface VisionModerationResult {
  statusPost: PostStatus;
  categories: {
    adult: LikelihoodText;
    spoof: LikelihoodText;
    medical: LikelihoodText;
    violence: LikelihoodText;
    racy: LikelihoodText;
  };
}

@Injectable()
export class VisionService {
  private readonly client = new ImageAnnotatorClient();

  async checkImage(path: string): Promise<VisionModerationResult> {
    const [result] = await this.client.safeSearchDetection(path);
    const response = result.safeSearchAnnotation;

    if (!response) {
      return {
        statusPost: PostStatus.SAFE,
        categories: {
          adult: 'UNKNOWN',
          spoof: 'UNKNOWN',
          medical: 'UNKNOWN',
          violence: 'UNKNOWN',
          racy: 'UNKNOWN',
        },
      };
    }

    const adult = toNumber(response.adult);
    const spoof = toNumber(response.spoof);
    const medical = toNumber(response.medical);
    const violence = toNumber(response.violence);
    const racy = toNumber(response.racy);

    const categories = {
      adult: likelihoodToText(adult),
      spoof: likelihoodToText(spoof),
      medical: likelihoodToText(medical),
      violence: likelihoodToText(violence),
      racy: likelihoodToText(racy),
    };

    const shouldBlock =
      adult >= (Likelihood.POSSIBLE as number) ||
      spoof >= (Likelihood.POSSIBLE as number) ||
      medical >= (Likelihood.POSSIBLE as number) ||
      violence >= (Likelihood.POSSIBLE as number) ||
      racy >= (Likelihood.POSSIBLE as number);

    return {
      statusPost: shouldBlock ? PostStatus.BLOCKED : PostStatus.SAFE,
      categories,
    };
  }
}
