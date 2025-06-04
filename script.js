
// Speichert Buchungen im localStorage
// Felder: Name, Start, End, Kommentar
const form = document.getElementById('booking-form');
const calendarDiv = document.getElementById('calendar');
const formMessage = document.getElementById('form-message');

// Nutzer-ID aus localStorage laden oder neu erstellen
const userId = localStorage.getItem('userId') || crypto.randomUUID();
localStorage.setItem('userId', userId);

function loadBookings() {
  let data = localStorage.getItem('bookings');
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function saveBookings(bookings) {
  localStorage.setItem('bookings', JSON.stringify(bookings));
}

function hasConflict(newStart, newEnd, bookings) {
  for (const booking of bookings) {
    const start = new Date(booking.start);
    const end = new Date(booking.end);
    if (newStart <= end && newEnd >= start) {
      return true;
    }
  }
  return false;
}

function renderCalendar(bookings) {
  calendarDiv.innerHTML = '';
  if (bookings.length === 0) {
    calendarDiv.innerHTML = '<p>Keine Buchungen vorhanden.</p>';
    return;
  }

  bookings.sort((a,b) => new Date(a.start) - new Date(b.start));

  for (const booking of bookings) {
    const entry = document.createElement('div');
    entry.className = 'booking-entry';
    entry.textContent = `${booking.name} von ${booking.start} bis ${booking.end}`;

    // Nur eigener Nutzer sieht den Stornieren-Button
    if (booking.userId === userId) {
      const cancelBtn = document.createElement('button');
      cancelBtn.textContent = 'X';
      cancelBtn.title = 'Buchung stornieren';
      cancelBtn.addEventListener('click', () => {
        if (confirm('Buchung wirklich stornieren?')) {
          const filtered = bookings.filter(b => b !== booking);
          saveBookings(filtered);
          renderCalendar(filtered);
        }
      });
      entry.appendChild(cancelBtn);
    }

    calendarDiv.appendChild(entry);
  }
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  formMessage.textContent = '';

  const name = form.name.value.trim();
  const start = form.start.value;
  const end = form.end.value;
  const comment = form.comment.value.trim();

  if (!name || !start || !end) {
    formMessage.style.color = 'red';
    formMessage.textContent = 'Bitte alle Pflichtfelder ausfüllen.';
    return;
  }

  const startDate = new Date(start);
  const endDate = new Date(end);
  if (startDate > endDate) {
    formMessage.style.color = 'red';
    formMessage.textContent = 'Das Startdatum darf nicht nach dem Enddatum liegen.';
    return;
  }

  const bookings = loadBookings();
  if (hasConflict(startDate, endDate, bookings)) {
    formMessage.style.color = 'red';
    formMessage.textContent = 'Der Zeitraum ist bereits gebucht.';
    return;
  }

  // Neue Buchung mit userId speichern
  bookings.push({name, start, end, comment, userId});
  saveBookings(bookings);
  renderCalendar(bookings);

  formMessage.style.color = 'green';
  formMessage.textContent = 'Buchung erfolgreich gespeichert!';

  form.reset();
});

document.addEventListener('DOMContentLoaded', () => {
  const bookings = loadBookings();
  renderCalendar(bookings);
});

