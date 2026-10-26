// Ultimate Natural Language Conversational Engine for AttendOS Siri Copilot
// Handles real AI cloud queries with full multi-turn chat history, strict system instructions,
// typo tolerance, Hinglish phonetics, and contextual offline fallback for Student, Faculty, and Admin.

const ENV_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

/**
 * Builds the natural, warm system prompt for the AttendOS Siri Copilot
 */
function buildSystemInstruction(role, context) {
  return `You are 'AttendOS AI Copilot', an advanced, friendly, and highly intelligent AI academic companion inside AttendOS (College Attendance Management System).
You can talk about anything the user brings up while being an expert in college attendance and academic management. Talk naturally, warmly, and fluidly—just like a supportive, smart friend or colleague chatting on a messaging app!

Current User Role: ${role.toUpperCase()}.
Live Academic Context: ${JSON.stringify(context)}.

Core Personality & Conversational Rules:
1. DISTINGUISH DATA QUERIES VS ACTION REQUESTS:
   - When a user asks a quantitative or status inquiry starting with "How many", "Show", "List", "Check", "Counts", or questions about pending items (e.g., "How many students have medical exemptions pending?", "Show defaulters list"), NEVER draft or generate a letter/application template! Provide the actual counts, statistics, or records from the live context data.
   - ONLY trigger letter/circular/application drafting if the user explicitly asks to draft or write one using action keywords like "Draft", "Write", "Create an application", or "Generate leave letter".
2. NEVER RESET TO DEFAULT INTRO / MENU:
   - If the user says something casual, personal, random, cultural, or non-academic (e.g., "im indian", "how are you", "what's up", "bored today"), NEVER output a rigid welcome message, greeting restart, or robotic menu (like "Main yahan hoon! Batao attendance percentage mein kya help karun?").
3. CONVERSATIONAL FLOW & NATURAL CHAT:
   - Respond to casual or personal remarks naturally, playfully, and warmly like a friend. For example, if someone says "im indian", reply warmly (e.g., "Awesome! Proud to have you here. Chai peene ka mann hai ya phir attendance check karni hai? ☕✨").
4. SEAMLESS BRIDGE:
   - After a brief natural, witty, or friendly remark, smoothly bridge the conversation back to your core academic and attendance superpowers without sounding mechanical.
5. ACCURACY & CONTEXT RETENTION:
   - Always remember the ongoing conversation history and past turns.
   - For academic queries, provide crisp, accurate answers using the live context data (attendance percentage, bunk calculations, exam eligibility, defaulters, pending exemptions/leaves).
6. LANGUAGE & VIBE MATCHING:
   - Effortlessly match the user's language and vibe (English, Hindi, or conversational Hinglish). Use light emojis where fitting (✨, ☕, 🎯, 👍).`;
}

/**
 * Main Assistant entry point
 * @param {string} prompt - Current user message
 * @param {object} context - Academic context (attendance, student info, courses, etc.)
 * @param {string} role - 'student' | 'faculty' | 'admin'
 * @param {string} customKey - Optional API key
 * @param {Array} history - Array of previous messages [{ sender: 'user'|'ai', text: string }]
 */
export async function askGeminiAssistant(prompt, context = {}, role = 'student', customKey = '', history = []) {
  const p = prompt.trim();
  const lower = p.toLowerCase().replace(/['"?!,.]/g, '').trim();

  // Try Cloud Google Gemini if API key is configured
  let activeKey = (customKey || localStorage.getItem('attendos_gemini_api_key') || ENV_API_KEY || '').trim();

  if (activeKey && (activeKey.startsWith('AQ.') || activeKey.startsWith('AIzaSy') || activeKey.length > 20)) {
    const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
    const systemInstruction = buildSystemInstruction(role, context);

    // Format chat history for Gemini API: [{ role: 'user'|'model', parts: [{ text: ... }] }]
    const formattedContents = [];

    // Filter relevant conversation history
    if (Array.isArray(history) && history.length > 0) {
      for (const msg of history) {
        if (!msg.text) continue;
        const apiRole = msg.sender === 'user' ? 'user' : 'model';
        
        const lastTurn = formattedContents[formattedContents.length - 1];
        if (lastTurn && lastTurn.role === apiRole) {
          lastTurn.parts[0].text += `\n${msg.text}`;
        } else {
          if (formattedContents.length === 0 && apiRole === 'model') {
            continue;
          }
          formattedContents.push({
            role: apiRole,
            parts: [{ text: msg.text }]
          });
        }
      }
    }

    // Append the current user prompt
    const lastTurn = formattedContents[formattedContents.length - 1];
    if (lastTurn && lastTurn.role === 'user') {
      lastTurn.parts[0].text += `\n${p}`;
    } else {
      formattedContents.push({
        role: 'user',
        parts: [{ text: p }]
      });
    }

    for (const model of models) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': activeKey
          },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: systemInstruction }]
            },
            contents: formattedContents,
            generationConfig: { maxOutputTokens: 600, temperature: 0.75 }
          })
        });

        if (res.ok) {
          const data = await res.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) return text.trim();
        }
      } catch {
        // Fall through to smart offline natural NLP engine
      }
    }
  }

  return generateNaturalNLPAssistant(p, lower, role, context, history);
}

/**
 * Fallback Natural NLP Engine (Offline / Standby)
 * Delivers warm, human, conversational answers with smart context bridges.
 */
function generateNaturalNLPAssistant(rawPrompt, lower, role, context, history = []) {
  const todayDate = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const studentName = context.student?.name || 'Aarav Sharma';
  const firstName = studentName.split(' ')[0];
  const pct = context.percentage ?? 85;
  const threshold = context.threshold ?? (context.attendanceThreshold ?? 75);
  const totalUsers = context.totalUsers ?? 6;
  const facultyCount = context.totalFaculty ?? 2;
  const studentCount = totalUsers - facultyCount > 0 ? totalUsers - facultyCount : 4;
  const presentCount = context.presentCount ?? 38;
  const absentCount = context.absentCount ?? 7;

  // Typo & Hinglish phonetic normalization
  const clean = lower
    .replace(/\bkitn\b/g, 'kitne')
    .replace(/\bareport\b/g, 'report')
    .replace(/\bu\b/g, 'you')
    .replace(/\br+\b/g, 'are')
    .replace(/\bareu\b/g, 'are you')
    .replace(/\bhow\s+r+\s+u\b/g, 'how are you')
    .replace(/\bbache\b/g, 'bachhe')
    .replace(/\bbacche\b/g, 'bachhe')
    .replace(/\bkya chalra\b/g, 'kya chal raha');

  // Find recent topic from previous user messages
  const lastUserMsg = Array.isArray(history) 
    ? [...history].reverse().find(m => m.sender === 'user' && m.text !== rawPrompt)?.text?.toLowerCase() || ''
    : '';

  // 1. REPORTS ("kitne report hai", "report dikhao", "attendance report")
  if (clean.includes('report')) {
    if (role === 'admin') {
      return `Haan bilkul! Total **4 institutional reports** ready hain: Semester Audit, Department Defaulters Sheet, Faculty Turnout Matrix, aur AICTE Compliance Summary. Kaunsi open karun?`;
    }
    if (role === 'faculty') {
      return `Aapke subject ke liye **3 reports** ready hain: Monthly Register CSV, Defaulter Roster, aur Turnout Analysis. Ek click me generate kar sakte ho!`;
    }
    return `Aapke portal me **2 key reports** hain: Subject-wise Breakdown aur Hall Ticket Clearance Report. Ekdam updated hain! ✨`;
  }

  // 2. HOW MANY STUDENTS / USERS ("kitne bache hai", "kitne students hai", "total log")
  if (
    clean.includes('kitne bachhe') ||
    clean.includes('kitne student') ||
    clean.includes('kitne log') ||
    clean.includes('total enrolled') ||
    clean.includes('total student') ||
    clean.includes('total user') ||
    clean.includes('kitne user')
  ) {
    if (role === 'admin') {
      return `System me abhi total **${totalUsers} accounts** active hain — jisme **${studentCount} students** aur **${facultyCount} faculty members** shamil hain. Sab smooth chal raha hai!`;
    }
    if (role === 'faculty') {
      return `Aapki class me total **${context.students?.length || 45} students** enrolled hain. Aaj ka scene yeh hai: **${presentCount} present** aur **${absentCount} absent** hain.`;
    }
    return `Aapke batch (B.Tech CSE VI) me total **60 batchmates** enrolled hain.`;
  }

  // 3. TODAY'S TURNOUT / PRESENT / ABSENT ("aaj kitne present hai", "attendance lag gayi")
  if (clean.includes('present') || clean.includes('absent') || clean.includes('aaj kitne') || clean.includes('turnout')) {
    if (role === 'student') {
      return context.isTodayPresent 
        ? `Haanji! Aaj aapki attendance **Present ✅** mark ho chuki hai. Badhiya! 👍`
        : `Aaj aapki attendance **Absent ❌** dikh rahi hai. Agar aap class me the, toh ek baar professor se check karwa lo!`;
    }
    return `Aaj turnout solid hai! Total **${presentCount} students present** hain aur sirf **${absentCount} absent**.`;
  }

  // 4. IDENTITY & INTRODUCTION ("who are you", "tum kaun ho")
  if (
    clean.includes('who are you') ||
    clean.includes('kaun ho') ||
    clean.includes('tum kaun') ||
    clean.includes('what are you') ||
    clean.includes('naam kya')
  ) {
    if (role === 'admin') {
      return `Hey! Main **AttendOS AI Copilot** hoon — aapka trusted academic partner. Compliance check karni ho, debarment notices draft karne hon, ya analytics dekhni ho, main ready hoon! ✨`;
    }
    if (role === 'faculty') {
      return `Main aapka **Classroom AI Companion** hoon. Attendance tracking, defaulters alerts, ya student reports — bas batao aur main sambhal lunga! 🤝`;
    }
    return `Main aapka **AttendOS Student Copilot** hoon — aapka personal academic buddy! Attendance tracking, safe bunks calculate karna, ya leave applications likhna, sab aasan bana dunga. 😊`;
  }

  // 5. CASUAL, PERSONAL & CULTURAL CHAT ("im indian", "kaise ho", "how are you", "what's up")
  if (clean.includes('indian') || clean.includes('india') || clean.includes('bharat') || clean.includes('desi')) {
    return `Awesome! Proud to have you here. 🇮🇳 Chai peene ka mann hai ya phir attendance check karni hai? ☕✨`;
  }
  if (clean.includes('whatsup') || clean.includes('whats up') || clean.includes('sup') || clean.includes('kya chal raha')) {
    return `Sab badhiya chal raha hai dost! Aaj campus me kya chal raha hai? Koi class bunk karni hai ya attendance score dekhna hai? 😎`;
  }
  if (clean.includes('bored') || clean.includes('bore ho')) {
    return `Haha, lagta hai class thodi slow chal rahi hai! 😄 Batao, safe bunk balance calculate karein ya exam eligibility check karein?`;
  }
  if (clean.includes('how are you') || clean.includes('kaise ho') || clean.includes('kya hal') || clean.includes('sab theek')) {
    return `Main ekdam badhiya aur energetic hoon! 🚀 Aap batao, aaj college ka kya scene hai?`;
  }
  if (/^(hi|hello|hey|heyy|namaste|hola|yo|good morning|good evening)$/.test(clean)) {
    if (role === 'admin') return `Hey Administrator! Kaise hain aap? Aaj college analytics me kya review karein? ✨`;
    if (role === 'faculty') return `Hello Professor! Umeed hai class achi chal rahi hai. Aaj attendance ya defaulters list me kya check karna hai?`;
    return `Hey ${firstName}! Kaise ho dost? Kaho, attendance check karni hai ya koi letter draft karwana hai? ✨`;
  }

  // 6. SAFE MISSABLE CLASSES / BUNKING ("kitni chhutti le sakta hu", "classes miss")
  if (clean.includes('miss') || clean.includes('bunk') || clean.includes('skip') || clean.includes('chhutti')) {
    const safeMiss = context.safeMissable ?? Math.max(0, Math.floor((pct - threshold) / 2));
    if (safeMiss > 0) {
      return `Aapke pass good news hai! Aap aram se **${safeMiss} classes miss** kar sakte ho, aur tab bhi aapki attendance **${threshold}% cutoff** ke upar safe rahegi. Chill karo! 😎`;
    }
    return `Suno dost, abhi thoda sambhalne ka time hai! Aapke paas **0 safe bunks** bache hain. Ek bhi absence hui toh attendance ${threshold}% ke niche chali jayegi! ⚠️`;
  }

  // 7. EXAM ELIGIBILITY / HALL TICKET ("exam de sakta hu", "hall ticket")
  if (clean.includes('hall ticket') || clean.includes('eligib') || clean.includes('admit card') || clean.includes('exam')) {
    if (pct >= threshold) {
      return `Bilkul de sakte ho! 🎉 Aapki current attendance **${pct}%** hai, jo mandatory **${threshold}%** cutoff se upar hai. Hall ticket aram se mil jayega, bas exam ki taiyari shuru rakho!`;
    }
    const needed = context.recoveryClasses || Math.max(1, Math.ceil((threshold - pct) * 1.5));
    return `Thoda alert ho jao! Abhi aapki attendance **${pct}%** hai. Exam eligibility clear karne ke liye agle **${needed} lectures bina miss kiye lagane** honge. You got this! 💪`;
  }

  // 8. MY ATTENDANCE ("meri attendance")
  if (clean.includes('attendance') && (clean.includes('meri') || clean.includes('my') || clean.includes('kitni'))) {
    return `Aapka current attendance score **${pct}%** hai (Cutoff requirement: **${threshold}%**). ${pct >= threshold ? 'Mast chal raha hai! 🎯' : 'Thoda focus karne ki zaroorat hai dost! 📈'}`;
  }

  // 9. DATA QUERY: MEDICAL EXEMPTIONS & LEAVES ("how many medical", "pending exemptions", "kitni chhutti pending")
  const isDataInquiry = clean.includes('how many') || 
                        clean.includes('kitne') || 
                        clean.includes('kitni') || 
                        clean.includes('pending') || 
                        clean.includes('status') || 
                        clean.includes('list') || 
                        clean.includes('show') || 
                        clean.includes('check');

  if ((clean.includes('medical') || clean.includes('exemption') || clean.includes('leave')) && isDataInquiry) {
    const pendingList = context.pendingLeaves || (Array.isArray(context.leaves) ? context.leaves.filter(l => l.status === 'PENDING') : []);
    const pendingCount = pendingList.length || 2;
    const approvedCount = Array.isArray(context.leaves) ? context.leaves.filter(l => l.status === 'APPROVED').length : 1;

    if (role === 'faculty') {
      const studentNames = pendingList.map(l => l.studentName).filter(Boolean).slice(0, 3).join(', ');
      return `Aapki active class me abhi **${pendingCount} medical exemptions / leave applications pending** hain verification ke liye${studentNames ? ` (${studentNames})` : ''}. Aap **Faculty Approvals** tab se unhe review aur approve kar sakte hain.`;
    }

    if (role === 'admin') {
      return `Institution-wide abhi total **${context.totalPending ?? pendingCount} student exemption requests pending** hain review ke liye.`;
    }

    return `Aapke portal me abhi **${pendingCount} leave request pending** hai aur **${approvedCount} approved** hai. Aap status Leaves tab me check kar sakte hain! 📋`;
  }

  // 10. ACTION REQUEST: DRAFT LEAVE / SICK LETTER (ONLY when user explicitly asks to draft/write/create)
  const isDraftAction = clean.includes('draft') || 
                        clean.includes('write') || 
                        clean.includes('likh') || 
                        clean.includes('banao') || 
                        clean.includes('generate') || 
                        clean.includes('create');

  if (isDraftAction && (clean.includes('leave') || clean.includes('sick') || clean.includes('medical') || clean.includes('letter') || clean.includes('application'))) {
    return `Yeh lo, maine aapke liye ek clean application draft kar di hai:

**Formal Leave Application**

**To:** The Head of Department, Computer Science & Engineering  
**Subject:** Medical Leave Application — Roll No: ${context.student?.rollNo || '0101CS221001'}  

Respected Sir/Ma'am,  
I, **${studentName}**, was unwell and unable to attend lectures. I have uploaded the medical certificate to the AttendOS portal. Kindly grant duty attendance credit.  

Yours obediently,  
**${studentName}** (${todayDate})

(Aap ise copy karke sidha submit kar sakte ho!)`;
  }

  // 11. DEBARMENT CIRCULAR (Admin)
  if (clean.includes('debar') || clean.includes('circular') || clean.includes('notice')) {
    return `Official notice draft ready hai:

**CIRCULAR: End-Semester Exam Debarment Notice**  
**Ref:** UNIV/ACAD/2026/CIR-088 | **Date:** ${todayDate}  

All students must maintain a minimum of **${threshold}% attendance** to appear in the End-Semester Examinations. Students with attendance below 65% shall be summarily debarred.  

*Dean of Academic Affairs & Controller of Examinations*`;
  }

  // 11. CONVERSATIONAL NATURAL FALLBACK (Warm human banter + smooth academic bridge)
  if (lastUserMsg && (lastUserMsg.includes('exam') || lastUserMsg.includes('hall ticket') || lastUserMsg.includes('eligib'))) {
    return `Bilkul! Exam eligibility aur required lectures ke regarding kuch aur calculate karna hai? Main ready hoon! 🎯`;
  }
  if (lastUserMsg && (lastUserMsg.includes('report') || lastUserMsg.includes('audit'))) {
    return `Reports aur batch breakdown ki baatein ho rahi thi — kya koi specific file ya list check karni hai? ✨`;
  }
  if (lastUserMsg && (lastUserMsg.includes('leave') || lastUserMsg.includes('letter'))) {
    return `Leave letter ready hai! Agar application me koi dates ya reason badalna ho toh bas batao. 👍`;
  }

  return `Haha, sahi hai! Main yahan aapki attendance, safe bunk calculations, ya exam eligibility me assist karne ke liye ready hoon. Aaj kya plan hai? ✨`;
}

