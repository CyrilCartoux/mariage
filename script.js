const daysElement = document.getElementById("days");
const hoursElement = document.getElementById("hours");
const minutesElement = document.getElementById("minutes");
const secondsElement = document.getElementById("seconds");

const second = 1000,
      minute = second * 60,
      hour = minute * 60,
      day = hour * 24;

const countDown = new Date("06/22/2024").getTime();

function updateCountdown() {
  const now = new Date().getTime();
  const distance = countDown - now;

  daysElement.innerText = Math.floor(distance / day);
  hoursElement.innerText = Math.floor((distance % day) / hour);
  minutesElement.innerText = Math.floor((distance % hour) / minute);
  secondsElement.innerText = Math.floor((distance % minute) / second);

  if (distance < 0) {
    document.getElementById("countdown").style.display = "none";
    document.getElementById("content").style.display = "block";
    clearInterval(x);
  }
}

const x = setInterval(updateCountdown, 1000);

const parallax = document.querySelector('.parallax');

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  parallax.style.transform = `translateY(${scrollY * 0.6}px)`; // Adjust the factor for desired parallax effect
});

