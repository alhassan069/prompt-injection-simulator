// app/api/generate/route.ts
import { OpenAI } from 'openai';
import { NextRequest, NextResponse } from 'next/server';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req: NextRequest) {
  const { systemPrompt, userPrompt, model, testConfigs } = await req.json();

  try {
    const results = await Promise.all(testConfigs.map(async (cfg: any) => {
      const messages: ChatCompletionMessageParam[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ];
      const completion = await openai.chat.completions.create({
        model,
        messages,
        temperature: cfg.temperature,
        max_tokens: cfg.max_tokens,
        presence_penalty: cfg.presence_penalty,
        frequency_penalty: cfg.frequency_penalty,
        stop: cfg.stop && cfg.stop.length > 0 ? cfg.stop : undefined
      });

      return {
        ...cfg,
        output: completion.choices[0].message.content
      };
    }));

    return NextResponse.json(results);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'OpenAI API error' }, { status: 500 });
  }
}
