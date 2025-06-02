let currentSlide = 0;
const UNSPLASH_ACCESS_KEY = 'AB5NAz7mZpA_ZbcYnvrNMB9ynd126tcrsSG8e2i9n1E';
const SLIDE_DURATION = 30000; // 30 seconds per slide
let slidesCompleted = 0;

async function getRandomImage(query) {
    try {
        const response = await fetch(
            `https://api.unsplash.com/photos/random?query=${query}&orientation=landscape`,
            {
                headers: {
                    'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
                }
            }
        );
        const data = await response.json();
        return data.urls.regular;
    } catch (error) {
        console.error('Error fetching image:', error);
        return null;
    }
}

// Function to preload image
function preloadImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
    });
}

async function generateSlides() {
    const theme = document.getElementById('theme-input').value;
    if (!theme) {
        alert('Please enter a theme');
        return;
    }

    // Reset counters
    slidesCompleted = 0;
    currentSlide = 0;

    // Show intro slide with countdown first
    await startCountdown();

    const searchQueries = [
        theme,
        theme + ' abstract',
        theme + ' detail',
        theme + ' background',
        theme + ' creative'
    ];

    try {
        // Pre-fetch first image before starting slideshow
        let nextImageUrl = await getRandomImage(searchQueries[0]);
        let nextImage = await preloadImage(nextImageUrl);

        // Generate and show slides one at a time
        for (let i = 1; i <= 5; i++) {
            const currentSlide = document.getElementById(`slide${i}`);
            
            // Show current image
            // Remove all except timer container
            currentSlide.innerHTML = `
                <div class="slide-timer-container">
                    <span class="slide-timer">30</span>
                </div>
            `;
            currentSlide.appendChild(nextImage.cloneNode(true));
            showSlide(i);

            // Start slide timer countdown
            const timerSpan = currentSlide.querySelector('.slide-timer');
            let timeLeft = 30;
            let timerInterval = setInterval(() => {
                timeLeft--;
                if (timerSpan) timerSpan.textContent = timeLeft;
                if (timeLeft <= 0) clearInterval(timerInterval);
            }, 1000);

            // Start preloading next image immediately
            let nextImagePromise = null;
            if (i < 5) {
                nextImagePromise = (async () => {
                    const nextUrl = await getRandomImage(searchQueries[i]);
                    return await preloadImage(nextUrl);
                })();
            }

            // Wait for slide duration
            await new Promise(resolve => setTimeout(resolve, SLIDE_DURATION));

            clearInterval(timerInterval);

            // Ensure next image is ready before continuing
            if (nextImagePromise) {
                nextImage = await nextImagePromise;
            }
        }

        // Show end slide after all slides are complete
        showSlide('end');
    } catch (error) {
        console.error('Error generating slides:', error);
        alert('Error generating slides. Please try again.');
    }
}

async function startCountdown() {
    const beepSound = document.getElementById('beep-sound');
    const timer = document.querySelector('.timer');
    showSlide('intro');
    
    for (let i = 10; i >= 1; i--) {
        timer.textContent = i;
        beepSound.play();
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

function showSlide(slideNumber) {
    // Hide all slides
    document.querySelectorAll('.slide').forEach(slide => {
        slide.classList.remove('active');
    });

    // Show the requested slide
    if (slideNumber === 'intro') {
        document.getElementById('intro-slide').classList.add('active');
    } else if (slideNumber === 'end') {
        document.getElementById('end-slide').classList.add('active');
    } else {
        document.getElementById(`slide${slideNumber}`).classList.add('active');
        slidesCompleted++;
    }
}

// Modal functionality
const modal = document.getElementById('intro-modal');
const closeModalBtn = document.getElementById('close-modal-btn');

// Show the modal on page load
window.addEventListener('DOMContentLoaded', () => {
    modal.style.display = 'flex';
    closeModalBtn.onclick = () => {
        modal.style.display = 'none';
    };
});

// Close the modal when clicking outside of the modal content
window.onclick = (event) => {
    if (event.target == modal) {
        modal.style.display = "none";
    }
};