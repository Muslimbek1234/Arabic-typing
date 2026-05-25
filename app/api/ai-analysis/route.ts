import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { calculateFeedback } from '../../../lib/feedback-engine';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const apiKey = process.env.OPENAI_API_KEY;

    // Check if it's a history-based progress tahlili request
    if (body.history && Array.isArray(body.history)) {
      const history = body.history;

      if (history.length === 0) {
        return NextResponse.json({
          feedback: "Sizda hali mashqlar tarixi mavjud emas. Mashqlarni boshlang va AI sizning o'sish dinamikangizni tahlil qilib beradi! 🚀",
          source: 'local'
        });
      }

      // Calculate averages locally for fallback or context
      const total = history.length;
      const avgWpm = Math.round(history.reduce((sum: number, item: any) => sum + item.wpm, 0) / total);
      const avgAcc = Math.round(history.reduce((sum: number, item: any) => sum + item.accuracy, 0) / total);
      const totalErrors = history.reduce((sum: number, item: any) => sum + item.errors, 0);

      if (apiKey) {
        try {
          const openai = new OpenAI({ apiKey });
          
          const systemPrompt = `You are a high-level educational typing coach. Analyze the student's typing progress history over multiple sessions and provide a highly personalized, structured progress review in Uzbek language. Explain their speed trends, accuracy, strengths, and specific areas to focus on. Keep the response under 120 words. Be motivating but strictly objective. Use specific numbers from their session data.`;
          
          const historySummary = history.map((s: any, i: number) => 
            `Session ${i+1}: Level ${s.level}, Stage ${s.stage || 'N/A'}, WPM: ${s.wpm}, Accuracy: ${s.accuracy}%, Errors: ${s.errors}, Duration: ${s.duration}s`
          ).join('\n');

          const userPrompt = `Student History:\n${historySummary}\n\nAverages:\n- Total Sessions: ${total}\n- Average Speed: ${avgWpm} WPM\n- Average Accuracy: ${avgAcc}%\n- Total Errors: ${totalErrors}`;

          const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            max_tokens: 220,
            temperature: 0.7,
          });

          const feedback = response.choices[0]?.message?.content?.trim();
          if (feedback) {
            return NextResponse.json({ feedback, source: 'openai' });
          }
        } catch (err) {
          console.error('OpenAI history analysis failed, falling back to smart local analysis:', err);
        }
      }

      // Smart local progress analysis fallback
      let localReport = `Ushbu tahlil mahalliy baholash motori tomonidan tayyorlandi:\n\nSiz jami ${total} ta mashq seansini yakunladingiz. O'rtacha yozish tezligingiz ${avgWpm} WPM (so'z/daq)ni, aniqligingiz esa ${avgAcc}% ni tashkil qilmoqda. `;
      if (avgAcc >= 95 && avgWpm >= 35) {
        localReport += "Ajoyib natija! Sizda mukammal mushak xotirasi va ritm shakllangan. Ritmga e'tibor qaratgan holda tezlikni 50+ WPM gacha ko'tarishda davom eting! 🏆";
      } else if (avgAcc >= 90) {
        localReport += "Yaxshi ko'rsatkich! Aniqlik barqaror, endi klaviaturaga qaramasdan barmoqlarni ritmik va erkin harakatlantirish orqali tezlikni oshirishga e'tibor qarating. ⭐";
      } else {
        localReport += "Tavsiya: Yozish tezligidan ko'ra aniqlikka ko'proq diqqat qiling. Xatolarni kamaytirish uchun tezlikni biroz pasaytirishingizni maslahat beramiz. 95% dan yuqori aniqlikka erishgach tezlik o'zidan-o'zi o'sadi. 💪";
      }

      return NextResponse.json({ feedback: localReport, source: 'local' });
    }

    // Default: Single session stats analysis
    const { wpm, accuracy, errors, level, skillLevel } = body;

    if (apiKey) {
      try {
        const openai = new OpenAI({ apiKey });
        
        const systemPrompt = `You are an Arabic typing coach. Analyze the student's typing statistics and give personalized feedback in Uzbek language. Be encouraging but highly specific. Help them improve. Keep your response under 100 words. Do not use generic praise; mention specific things like their WPM, accuracy, and error counts.`;
        
        const userPrompt = `Student Stats:
- Level: ${level}
- Current Skill Level: ${skillLevel}/10
- Typing Speed: ${wpm} WPM
- Accuracy: ${accuracy}%
- Errors: ${errors} errors`;

        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          max_tokens: 180,
          temperature: 0.7,
        });

        const feedback = response.choices[0]?.message?.content?.trim();
        if (feedback) {
          return NextResponse.json({ feedback, source: 'openai' });
        }
      } catch (err) {
        console.error('OpenAI API call failed, falling back to local engine:', err);
      }
    }

    const fallbackFeedback = calculateFeedback(wpm, accuracy, errors);
    return NextResponse.json({ feedback: fallbackFeedback, source: 'local' });
  } catch (error) {
    console.error('Error in AI Analysis route:', error);
    return NextResponse.json(
      { feedback: 'Mashq muvaffaqiyatli yakunlandi! Ritm va aniqlikni oshirishda davom eting.', source: 'fallback' },
      { status: 500 }
    );
  }
}
