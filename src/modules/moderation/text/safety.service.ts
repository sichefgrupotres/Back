import { Injectable } from '@nestjs/common';
import { VertexAI, GenerativeModel } from '@google-cloud/vertexai';
import { INSULTOS } from '../moderation.constants';
import { PostStatus } from 'src/posts/dto/create-post.dto';

export type ModerationCategory =
  | 'INSULTO'
  | 'SEXUAL'
  | 'VIOLENCIA'
  | 'RACISMO'
  | 'NONE';

export interface TextModerationResult {
  statusPost: PostStatus;
  category: ModerationCategory;
  cleanText: string;
  removedContent: string[];
  generatedText?: string;
  insultosDetectados: string[];
}

function stripCodeFences(text: string): string {
  return text
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();
}

function extractFirstJson(text: string): Record<string, unknown> | null {
  const cleaned = stripCodeFences(text);
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return null;
  const candidate = cleaned.slice(start, end + 1);
  try {
    return JSON.parse(candidate) as Record<string, unknown>;
  } catch {
    return null;
  }
}

@Injectable()
export class SafetyService {
  private readonly vertexAI: VertexAI;
  private readonly model: GenerativeModel;

  constructor() {
    this.vertexAI = new VertexAI({
      project: process.env.GOOGLE_PROJECT_ID ?? '',
      location: process.env.GOOGLE_LOCATION ?? '',
    });
    this.model = this.vertexAI.getGenerativeModel({
      model: 'gemini-2.0-flash-001',
    });
  }

  async checkText(text: string): Promise<TextModerationResult> {
    const prompt = `
Analiza teniendo en cuenta que no puede tener contenido inapropiado,
insultos o texto incoherente y devuelve SOLO JSON (sin texto extra, sin code fences).
Si no detectas nada, pon "category":"none" y "cleanText" igual al original.
Si detectas contenido inapropiado debes extraerlo, lo inadecuado a "removedContent"
y con coherencia y respeto se puede rearmar la receta para que no pierda el sentido y enviarla a "cleanText".

Esquema:
{
  "category": "insulto|sexual|violencia|racismo|none",
  "cleanText": "texto corregido",
  "removedContent": ["frases removidas"]
}

Texto:
${text}
    `.trim();

    const response = await this.model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const raw =
      response?.response?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    const parsed = extractFirstJson(raw);

    // Resultado base
    let result: TextModerationResult = {
      statusPost: PostStatus.SAFE,
      category: 'NONE',
      cleanText: text,
      removedContent: [],
      generatedText: raw,
      insultosDetectados: [],
    };

    if (parsed) {
      const rawCategory = parsed.category;
      const categoryStr =
        typeof rawCategory === 'string' ? rawCategory.toUpperCase() : 'NONE';

      const category: ModerationCategory =
        categoryStr === 'INSULTO' ||
        categoryStr === 'SEXUAL' ||
        categoryStr === 'VIOLENCIA' ||
        categoryStr === 'RACISMO'
          ? (categoryStr as ModerationCategory)
          : 'NONE';

      result = {
        statusPost:
          category !== 'NONE' ? PostStatus.NEEDS_REVIEW : PostStatus.SAFE,
        category,
        cleanText:
          typeof parsed.cleanText === 'string' ? parsed.cleanText : text,
        removedContent: Array.isArray(parsed.removedContent)
          ? (parsed.removedContent as string[])
          : [],
        generatedText: raw,
        insultosDetectados: [],
      };
    }

    const normalized = text
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '');

    const insultosDetectados = INSULTOS.filter((term) =>
      normalized.includes(
        term
          .toLowerCase()
          .normalize('NFD')
          .replace(/\p{Diacritic}/gu, ''),
      ),
    );

    if (insultosDetectados.length > 0) {
      result.category = 'INSULTO';
      result.insultosDetectados = insultosDetectados;
      result.removedContent = [
        ...new Set([...result.removedContent, ...insultosDetectados]),
      ];
      result.statusPost = PostStatus.BLOCKED;
    }

    return result;
  }
}
