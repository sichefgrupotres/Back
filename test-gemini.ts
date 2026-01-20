import 'dotenv/config';
import { VertexAI } from '@google-cloud/vertexai';

const vertex = new VertexAI({
  project: process.env.GOOGLE_PROJECT_ID,
  location: process.env.GOOGLE_LOCATION,
});

const model = vertex.getGenerativeModel({ model: 'gemini-2.0-flash-001' });

async function test() {
  const res = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: 'Hola mundo' }] }],
  });
  console.log(JSON.stringify(res, null, 2));
}

test();
