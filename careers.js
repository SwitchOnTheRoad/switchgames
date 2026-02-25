// ====================================
// EASY JOB MANAGEMENT
// ====================================
// To add a new job: Add an object to the jobs array
// To remove a job: Delete or comment out the job object
// To edit a job: Change the properties below

const jobs = [
    {
        title: "LUA Programmer",
        type: "Full-Time",
        location: "Remote",
        description: "We're looking for an experienced Luau/Lua scripter to help build engaging gameplay mechanics for our Roblox experiences.",
        requirements: [
            "2+ years of Luau/Lua scripting experience",
            "Strong understanding of Roblox APIs and services",
            "Experience with client-server architecture",
            "Portfolio of previous Roblox work"
        ]
    },
    {
        title: "3D Modeler",
        type: "Contract",
        location: "Remote",
        description: "Join our team to create stunning 3D models and environments for our upcoming Roblox games.",
        requirements: [
            "Proficiency in Blender or similar 3D software",
            "Understanding of low-poly modeling techniques",
            "Experience with Roblox Studio",
            "Strong artistic eye and attention to detail"
        ]
    },
    {
        title: "UI/UX Designer",
        type: "Part-Time",
        location: "Remote",
        description: "Help us create beautiful and intuitive user interfaces that enhance player experience.",
        requirements: [
            "Experience with Figma or Adobe XD",
            "Understanding of UX principles",
            "Knowledge of Roblox UI systems",
            "Portfolio showcasing UI/UX work"
        ]
    }
];

// ====================================
// DON'T EDIT BELOW THIS LINE
// (unless you know what you're doing)
// ====================================

function renderJobs() {
    const careersList = document.getElementById('careers-list');
    
    if (!careersList) return;
    
    if (jobs.length === 0) {
        careersList.innerHTML = `
            <div class="no-positions">
                <p>No open positions at the moment. Check back soon!</p>
            </div>
        `;
        return;
    }
    
    careersList.innerHTML = jobs.map(job => `
        <div class="career-card animate-on-scroll">
            <div class="career-header">
                <h3 class="career-title">${job.title}</h3>
                <div class="career-meta">
                    <span class="career-type">${job.type}</span>
                    <span class="career-location">${job.location}</span>
                </div>
            </div>
            <p class="career-description">${job.description}</p>
            <div class="career-requirements">
                <h4>Requirements:</h4>
                <ul>
                    ${job.requirements.map(req => `<li>${req}</li>`).join('')}
                </ul>
            </div>
            <button class="btn btn-outline" onclick="openApplicationModal('${job.title}')">
                Apply Now
            </button>
        </div>
    `).join('');
    
    // Re-observe new elements for animations
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach(el => {
        if (window.observer) {
            window.observer.observe(el);
        }
    });
}

function openApplicationModal(jobTitle) {
    const modal = document.getElementById('application-modal');
    const modalTitle = document.getElementById('modal-job-title');
    const jobPosition = document.getElementById('job-position');
    
    modalTitle.textContent = `Apply for ${jobTitle}`;
    jobPosition.value = jobTitle;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeApplicationModal() {
    const modal = document.getElementById('application-modal');
    const form = document.getElementById('application-form');
    
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    form.reset();
    
    const status = document.getElementById('application-status');
    status.textContent = '';
    status.className = 'form-status';
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    const modal = document.getElementById('application-modal');
    if (e.target === modal) {
        closeApplicationModal();
    }
});

// Render jobs when page loads
document.addEventListener('DOMContentLoaded', renderJobs);