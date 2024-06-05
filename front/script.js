const daysElement = document.getElementById("days");
const hoursElement = document.getElementById("hours");
const minutesElement = document.getElementById("minutes");
const secondsElement = document.getElementById("seconds");
const uploadBtn = document.getElementById("upload-btn");
const fileInput = document.getElementById("file-input");
const uploadText = document.querySelector(".upload-text");
const checkmark = document.querySelector(".check");

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

const parallax = document.querySelector(".parallax");

window.addEventListener("scroll", () => {
  const scrollY = window.scrollY;
  parallax.style.transform = `translateY(${scrollY * 0.6}px)`; // Adjust the factor for desired parallax effect
});

// Define the function to handle file selection and upload
async function handleFileUpload() {
  showLoader();
  const password = getFromLocalStorage("password");

  const formData = new FormData();
  const files = fileInput.files;

  console.log("files :>> ", files);

  for (let i = 0; i < files.length; i++) {
    formData.append("files", files[i]);
  }

  try {
    const response = await fetch('http://194.164.77.171/api/upload', {
      method: "POST",
      body: formData,
      headers: {
        password: password,
      },
    });

    const data = await response.json();

    if (response.status !== 200) {
      return alert(data.message);
    }
    hideLoader();
    showCheckmark();

    saveToLocalStorage("password", password);
  } catch (error) {
    hideLoader();
    console.error(error);
    alert("An error occurred uploading your file , error: " + error.message);
  }
}

// Add event listener for file input change event
fileInput.addEventListener("change", handleFileUpload);

// Add event listener for upload button click event
uploadBtn.addEventListener("click", () => {
  // Prompt for password if not stored in local storage
  let password = getFromLocalStorage("password");
  if (!password) {
    password = window.prompt("Please enter password");
    saveToLocalStorage("password", password);
  }

  // Programmatically trigger file input click
  fileInput.click();
});

const saveToLocalStorage = (key, value) => {
  localStorage.setItem(key, value);
};

const getFromLocalStorage = (key) => {
  return localStorage.getItem(key);
};

// Function to show the checkmark and hide the text
function showCheckmark() {
  uploadText.style.display = "none"; // Hide text
  checkmark.style.display = "inline-block"; // Show checkmark

  // Hide the checkmark after a few seconds
  setTimeout(() => {
    checkmark.style.display = "none"; // Hide checkmark
    uploadText.style.display = "inline-block"; // Show text again
  }, 3000); // Adjust the duration as needed (3000 milliseconds = 3 seconds)
}

// Function to show the loader and hide other elements
function showLoader() {
  const uploadText = document.querySelector(".upload-text");
  const checkmark = document.querySelector(".check");
  const loader = document.getElementById("loader");

  uploadText.style.display = "none";
  checkmark.style.display = "none";
  loader.style.display = "block"; // Show loader
}

// Function to hide the loader and show the text
function hideLoader() {
  const uploadText = document.querySelector(".upload-text");
  const loader = document.getElementById("loader");

  uploadText.style.display = "block"; // Show text
  loader.style.display = "none"; // Hide loader
}
