// ⚠️ আপনার Replit এর আসল লিঙ্ক এখানে দিন (শেষে '/' দেবেন না)
// উদাহরণ: https://my-repl-name.username.repl.co
const SERVER_URL = "https://REPLACE_WITH_YOUR_REPLIT_URL";

console.log("Extension Started. Connecting to:", SERVER_URL);

// প্রতি ২ সেকেন্ড পর পর সার্ভার চেক করবে
setInterval(async () => {
  try {
    const response = await fetch(`${SERVER_URL}/get_pending_command`);
    const data = await response.json();

    if (data.action === "none") return;

    console.log("New Command:", data);

    // ১. নেভিগেট কমান্ড (নতুন লিঙ্কে যাওয়া)
    if (data.action === "navigate") {
      chrome.tabs.update({ url: data.details });
    }

    // ২. ক্লিক বা টাইপ কমান্ড
    else if (data.action === "click" || data.action === "type") {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length === 0) return;

        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: performAction,
          args: [data.action, data.details],
        });
      });
    }
  } catch (err) {
    console.log("Connection Error. Is Replit running?", err);
  }
}, 2000);

// এই ফাংশনটি ওয়েবপেজের ভেতরে ইঞ্জেক্ট হবে
function performAction(action, details) {
  if (action === "click") {
    // সিলেক্টর অথবা টেক্সট দিয়ে বাটন খোঁজা
    let el = document.querySelector(details);
    if (!el) {
      // যদি সিলেক্টর না পায়, টেক্সট দিয়ে খুঁজি
      el = Array.from(document.querySelectorAll('a, button, input[type="submit"]'))
        .find(e => e.innerText && e.innerText.toLowerCase().includes(details.toLowerCase()));
    }

    if (el) {
      el.click();
      console.log("Clicked:", el);
    } else {
      console.log("Element not found:", details);
    }
  } else if (action === "type") {
    const parts = details.split(":::");
    const el = document.querySelector(parts[0]);
    if (el) el.value = parts[1] || "";
  }
}

// --- USAGE NOTE ---
// 1) Replace the SERVER_URL value above with your Replit URL (no trailing slash).
// 2) Load this folder (MyAI_Agent) in Chrome/Edge via chrome://extensions -> Load unpacked.
// 3) Make sure the Replit server is running and reachable from your phone browser.
