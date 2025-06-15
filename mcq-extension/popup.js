function renderMCQs(responseText) {
  const output = document.getElementById('output');
  output.innerHTML = '';

  const mcqs = responseText.trim().split(/\n(?=Q[:\s])/i);
  mcqs.forEach((block, i) => {
    console.log("📦 MCQ block:", block);

    const match = block.match(/Q[:\s]*(.*?)\nA[.)\s]*(.*?)\nB[.)\s]*(.*?)\nC[.)\s]*(.*?)\nD[.)\s]*(.*?)\nAnswer[:\s]*(\w)/is);

    if (!match) {
      const warning = document.createElement('p');
      warning.className = "text-red-500 text-xs mb-2";
      warning.textContent = `⚠️ Could not parse MCQ ${i + 1}. Check formatting.`;
      output.appendChild(warning);
      return;
    }

    const [, question, A, B, C, D, answer] = match;

    const container = document.createElement('div');
    container.className = "bg-white rounded-lg border border-gray-300 p-3 mb-4 shadow";

    const questionElem = document.createElement('h3');
    questionElem.className = "font-semibold mb-2 text-sm";
    questionElem.textContent = `Q${i + 1}: ${question}`;
    container.appendChild(questionElem);

    const options = { A, B, C, D };
    Object.entries(options).forEach(([key, val]) => {
      const btn = document.createElement('button');
      btn.className = "option-btn block w-full text-left px-3 py-2 rounded hover:bg-blue-100 text-sm mb-1 border";
      btn.textContent = `${key}. ${val}`;
      btn.dataset.key = key;
      btn.dataset.answer = answer.toUpperCase();

      btn.addEventListener('click', () => {
        const allBtns = container.querySelectorAll('.option-btn');
        allBtns.forEach(b => {
          b.disabled = true;
          const k = b.dataset.key;
          const correct = b.dataset.answer;
          if (k === correct) {
            b.classList.add('bg-green-100', 'border-green-500', 'text-green-800');
          }
          if (k !== correct && k === btn.dataset.key) {
            b.classList.add('bg-red-100', 'border-red-500', 'text-red-800');
          }
        });
      });

      container.appendChild(btn);
    });

    output.appendChild(container);
  });
}

document.getElementById('generate').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'extractText' }, async response => {
      const selection = response?.content;
      const manual = document.getElementById('customText').value.trim();
      const content = selection || manual;

      if (!content) return alert('⚠️ Please select or paste text.');

      try {
        const res = await fetch('http://localhost:5000/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: content })
        });

        const data = await res.json();
        renderMCQs(data.reply);
      } catch (err) {
        document.getElementById('output').innerText = '❌ Backend error.';
        console.error(err);
      }
    });
  });
});
