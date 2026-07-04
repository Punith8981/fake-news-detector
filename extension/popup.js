document.getElementById('checkBtn').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  const [{ result: selectedText }] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => window.getSelection().toString()
  });

  if (!selectedText) {
    document.getElementById('result').innerHTML = "Please select some text on the page first.";
    return;
  }

  document.getElementById('result').innerHTML = "Checking...";

  const response = await fetch("http://127.0.0.1:8000/check-news", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: selectedText })
  });

  const data = await response.json();
  document.getElementById('result').innerHTML = `<strong>${data.label}</strong> (${data.confidence}%)`;
});