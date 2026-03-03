// Compute the last Saturday of February 2031 in the user's local timezone.
function getLastSaturdayOfFeb2031() {
  const year = new Date().getFullYear() + 1;
  const monthIndex = 1; // February is 1 (0-based)

  const badgeEl = document.getElementById("badge");
  if (badgeEl) {
    badgeEl.textContent = "Встречаемся в " + year
  }
  
  const subtitleEl = document.getElementById("subtitle");
  if (subtitleEl) {
    subtitleEl.textContent = "Отсчет до последней субботы февраля " + year
  }

  // Start from last day of February
  const lastDayOfFeb = new Date(year, monthIndex + 1, 0); // March 0 = last day of Feb

  // Walk backwards until we hit Saturday (6)
  const dayOfWeek = lastDayOfFeb.getDay();
  const diffToSaturday = (dayOfWeek - 6 + 7) % 7;
  const lastSaturdayDate = lastDayOfFeb.getDate() - diffToSaturday;

  // Set target time to 18:00 local time for a "meeting evening" feel
  const target = new Date(year, monthIndex, lastSaturdayDate, 18, 0, 0, 0);
  return target;
}

function formatTargetDate(date) {
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return date.toLocaleString(undefined, options);
}

function updateCountdown(targetDate) {
  const now = new Date();
  const diffMs = targetDate.getTime() - now.getTime();

  const daysEl = document.getElementById("days");
  const hoursEl = document.getElementById("hours");
  const minutesEl = document.getElementById("minutes");

  if (!daysEl || !hoursEl || !minutesEl) return;

  if (diffMs <= 0) {
    daysEl.textContent = "00";
    hoursEl.textContent = "00";
    minutesEl.textContent = "00";
    return;
  }

  // Calculate exact years, then remaining days/hours/minutes
  const msPerDay = 24 * 60 * 60 * 1000;
  let tempStart = new Date(now.getTime());
  let years = targetDate.getFullYear() - tempStart.getFullYear();

  // Adjust years so that tempStart advanced by that many years does not pass the target
  let advanced = new Date(
    tempStart.getFullYear() + years,
    tempStart.getMonth(),
    tempStart.getDate(),
    tempStart.getHours(),
    tempStart.getMinutes(),
    tempStart.getSeconds(),
    tempStart.getMilliseconds()
  );

  if (advanced > targetDate) {
    years -= 1;
    advanced = new Date(
      tempStart.getFullYear() + years,
      tempStart.getMonth(),
      tempStart.getDate(),
      tempStart.getHours(),
      tempStart.getMinutes(),
      tempStart.getSeconds(),
      tempStart.getMilliseconds()
    );
  }

  let remainingMs = targetDate.getTime() - advanced.getTime();
  const totalMinutes = Math.floor(remainingMs / (60 * 1000));
  const totalDays = Math.floor(remainingMs / msPerDay);
  const days = totalDays;
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const minutes = totalMinutes % 60;

  daysEl.textContent = String(days).padStart(2, "0");
  hoursEl.textContent = String(hours).padStart(2, "0");
  minutesEl.textContent = String(minutes).padStart(2, "0");
}

function applyTelegramTheme() {
  if (typeof window.Telegram === "undefined") return;
  const webApp = window.Telegram.WebApp;
  if (!webApp) return;

  webApp.ready();

  const theme = webApp.themeParams || {};

  // Apply Telegram theme colors where it makes sense
  const rootStyle = document.documentElement.style;

  if (theme.bg_color) {
    rootStyle.setProperty("--bg", `#${theme.bg_color}`);
  }
  if (theme.text_color) {
    rootStyle.setProperty("--text", `#${theme.text_color}`);
  }
  if (theme.secondary_bg_color) {
    rootStyle.setProperty("--bg-secondary", `#${theme.secondary_bg_color}`);
  }
  if (theme.accent_text_color) {
    rootStyle.setProperty("--accent", `#${theme.accent_text_color}`);
  }

  webApp.expand();
}

document.addEventListener("DOMContentLoaded", () => {
  applyTelegramTheme();

  const targetDate = getLastSaturdayOfFeb2031();
  const targetDateTextEl = document.getElementById("target-date-text");
  if (targetDateTextEl) {
    targetDateTextEl.textContent = `Встреча начнется ${formatTargetDate(
      targetDate
    )}`;
  }

  // Initial render
  updateCountdown(targetDate);
  // Update every second
  setInterval(() => updateCountdown(targetDate), 1000);
});

