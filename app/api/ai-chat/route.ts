import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const FAQ_ANSWERS = [
  {
    keywords: ['salom', 'assalom'],
    answer: "Assalomu alaykum! Men sizning At-Tanal Writing imtihoniga tayyorlovchi va arabcha yozish bo'yicha maxsus AI yordamchingizman. Arabcha yozish, klaviaturani sozlash, arab harflari yoki At-Tanal sertifikati haqida nimalarni bilmoqchisiz?"
  },
  {
    keywords: ['harf', 'alifbo', 'shakl', 'yozish', 'tartib'],
    answer: "Arab alifbosi 28 ta asosiy harfdan iborat bo'lib, o'ngdan chapga qarab yoziladi. Ko'pgina harflar so'zdagi o'rniga qarab bosh, o'rta, oxirgi va alohida shakllarga ega. At-Tanal imtihonida harflarning to'g'ri yozilishi (ayniqsa, hamza va harakatlar) juda muhim."
  },
  {
    keywords: ['tezlik', 'wpm', 'tezlashtirish', 'oshirish', 'ritm'],
    answer: "At-Tanal Writing imtihonida yuqori tezlik (kamida 30-40 WPM) va yuqori aniqlik (kamida 90-95%) talab qilinadi. Tezlikni oshirish uchun klaviaturaga qaramasdan o'nta barmoq bilan (blind typing) yozishni mashq qiling. Har kuni 15-20 daqiqa mashq qilish ajoyib natija beradi."
  },
  {
    keywords: ['xato', 'aniqlik', "noto'g'ri", 'foiz'],
    answer: "At-Tanal yozish sertifikatida aniqlik birinchi darajali ahamiyatga ega. Xatolar ko'p bo'lsa, tezlikni pasaytirib, aniqlikni 95% dan yuqori qilishga e'tibor qarating. Shundan so'ng tezlikni oshirish osonroq bo'ladi."
  },
  {
    keywords: ['klaviatura', 'sozlash', "o'rnatish", 'windows', 'mac'],
    answer: "Arabcha klaviaturani o'rnatish:\n- Windows: Sozlamalar -> Vaqt va til -> Til va hudud -> Til qo'shish -> Arabcha (Arabic (Egypt) yoki Saudi Arabia).\n- Mac: Tizim sozlamalari -> Klaviatura -> Matn kiritish manbalari -> + -> Arabcha.\nAt-Tanal imtihoni uchun standard Arabic klaviatura tartibini o'rganish zarur."
  },
  {
    keywords: ['tanal', 'at-tanal', 'attanal', 'imtihon', 'sertifikat'],
    answer: "At-Tanal (التنال العربي) — xalqaro arab tili standart sertifikati bo'lib, undagi Writing (yozish) bo'limida arab tilida tez va to'g'ri yozish qobiliyati sinovdan o'tkaziladi. Ushbu ilova sizni aynan At-Tanal yozish imtihoniga mukammal tayyorlash uchun mo'ljallangan!"
  },
  {
    keywords: ['barmoq', 'qaysi', 'finger', 'layout'],
    answer: "Arab klaviaturasida har bir barmoq ma'lum tugmalarga biriktirilgan. O'ng qo'l ko'rsatkich barmog'i: ت ن م ك — Chap qo'l ko'rsatkich: ب ي س ش. Bosh barmoqlar — bo'sh joy (probel). Har kuni bir nechta harfni mashq qiling va barmoq joylashuvini mushak xotirasiga singdiring."
  },
  {
    keywords: ['mashq', 'practice', 'trenirovka', 'dars', 'lesson'],
    answer: "Mashq qilish uchun har kuni kamida 15-20 daqiqa ajrating. Avval harflarni alohida-alohida mashq qiling, keyin so'zlarga, so'ngra to'liq gaplarga o'ting. Bu bosqichma-bosqich yondashuv At-Tanal imtihoniga eng samarali tayyorgarlik hisoblanadi."
  }
];

const DECLINE_MESSAGE = "Kechirasiz, men faqat arabcha yozish (typing) mashqlari, arab alifbosi, klaviatura sozlamalari va At-Tanal Writing sertifikati imtihoniga tayyorgarlik bo'yicha savollarga javob bera olaman. Iltimos, faqat shu mavzular doirasida savollar bering! 😊";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, context } = body;

    if (!message) {
      return NextResponse.json({ reply: "Iltimos, xabarni kiriting.", source: 'error' }, { status: 400 });
    }

    const cleanMsg = message.toLowerCase().trim();

    // Strict topic filter — only allow typing/Arabic/At-Tanal related questions
    const typingKeywords = [
      'arab', 'arabic', 'harf', 'yozish', 'typing', 'keyboard', 'klaviatura',
      'tanal', 'imtihon', 'exam', 'sertifikat', 'wpm', 'acc', 'xato', 'tahlil',
      'lesson', 'dars', 'stage', 'speed', 'tezlik', 'aniqlik', 'mashq',
      'practice', 'barmoq', 'finger', 'layout', 'alifbo', 'harflar',
      'salom', 'assalom', 'bo\'sh joy', 'probel', 'backspace',
      'combo', 'streak', 'daraja', 'level', 'bosqich',
      'ritm', 'mushak', 'xotira', 'blind', 'sozlash',
      'writing', 'yoz', 'tugma', 'key', 'button'
    ];

    const isRelated = typingKeywords.some(kw => cleanMsg.includes(kw));

    // If it's totally unrelated, decline immediately
    if (!isRelated && cleanMsg.length > 3) {
      return NextResponse.json({ reply: DECLINE_MESSAGE, source: 'local_refusal' });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (apiKey) {
      try {
        const openai = new OpenAI({ apiKey });

        let systemPrompt = `Siz faqat va faqat arabcha yozish (typing), arab klaviatura tartibi, arab alifbosi va xalqaro At-Tanal Writing Certificate imtihoniga tayyorgarlik bo'yicha ixtisoslashgan AI Tutorsiz.

QATTIQ QOIDALAR (BUZILMASLIGI SHART):
1. Siz FAQAT quyidagi mavzularga javob berasiz:
   - Arabcha typing mashqlari va tezlikni oshirish
   - Arab alifbosi va harflar shakllari
   - Arab klaviatura sozlash va barmoq joylashuvi
   - At-Tanal Writing sertifikati imtihoniga tayyorgarlik
   - Yozish aniqligi va xatolarni kamaytirish

2. Quyidagi mavzularga javob berish MUTLAQO TA'QIQLANADI:
   - Dasturlash (Python, JavaScript, HTML, CSS va boshqalar)
   - Matematika, fizika, kimyo va boshqa fanlar
   - Tarjima (arab tilidan tashqari)
   - Umumiy suhbat va chat
   - Ovqat tayyorlash, sog'liq, sport va boshqalar
   - Siyosat, din, tarix (typing bilan bog'liq bo'lmasa)
   - Har qanday boshqa mavzu

3. Agar foydalanuvchi boshqa mavzuda savol bersa, DOIMO o'zbek tilida quyidagicha rad eting:
   "Kechirasiz, men faqat arabcha yozish mashqlari va At-Tanal imtihoniga tayyorgarlik bo'yicha yordam bera olaman. Iltimos, shu mavzularda savol bering!"

4. Har doim O'ZBEK tilida javob bering.
5. Javoblar qisqa va foydali bo'lsin — 120 so'zdan oshmasin.`;

        if (context) {
          systemPrompt += `\nTalaba konteksti:\n- Qiyinchilik darajasi: ${context.level}\n- Mahorat darajasi: ${context.skillLevel}/10\n- So'nggi WPM: ${context.recentWpm || 'N/A'}\n- So'nggi Aniqlik: ${context.recentAccuracy ? context.recentAccuracy + '%' : 'N/A'}`;
        }

        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
          ],
          max_tokens: 220,
          temperature: 0.3, // Even lower temperature for stricter rule following
        });

        const reply = response.choices[0]?.message?.content?.trim();

        // Extended safety check — make sure AI didn't bypass topic restriction
        const lowerReply = reply?.toLowerCase() || '';
        const bannedTopicKeywords = [
          'javascript', 'python', 'code', 'function', 'class', 'html', 'css', 'react',
          'algorithm', 'database', 'sql', 'api', 'server', 'frontend', 'backend',
          'recipe', 'ingredient', 'cook', 'medicine', 'doctor', 'hospital',
          'football', 'basketball', 'movie', 'film', 'music', 'song'
        ];
        const isAIBypassingTopic = bannedTopicKeywords.some(kw => lowerReply.includes(kw)) && !lowerReply.includes('klaviatura') && !lowerReply.includes('typing');

        if (isAIBypassingTopic) {
          return NextResponse.json({ reply: DECLINE_MESSAGE, source: 'safety_override' });
        }

        if (reply) {
          return NextResponse.json({ reply, source: 'openai' });
        }
      } catch (err) {
        console.error('OpenAI API call failed in chat, falling back to local engine:', err);
      }
    }

    // Fallback simple FAQ keyword matcher
    let matchedAnswer = DECLINE_MESSAGE;

    for (const faq of FAQ_ANSWERS) {
      if (faq.keywords.some(kw => cleanMsg.includes(kw))) {
        matchedAnswer = faq.answer;
        break;
      }
    }

    return NextResponse.json({ reply: matchedAnswer, source: 'local' });
  } catch (error) {
    console.error('Error in AI Chat route:', error);
    return NextResponse.json(
      { reply: "Kechirasiz, xabarni qayta ishlashda xatolik yuz berdi. Iltimos, qayta urinib ko'ring.", source: 'fallback' },
      { status: 500 }
    );
  }
}
