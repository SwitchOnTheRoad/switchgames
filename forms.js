// Handle Contact Form Submission
document.getElementById('contact-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const form = e.target;
    const status = document.getElementById('contact-status');
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;
    
    // Disable button and show loading
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    status.textContent = '';
    status.className = 'form-status';
    
    try {
        const formData = {
            name: form.name.value,
            email: form.email.value,
            subject: form.subject.value,
            message: form.message.value
        };
        
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            status.textContent = '✓ Message sent successfully! We\'ll get back to you soon.';
            status.className = 'form-status success';
            form.reset();
        } else {
            throw new Error(data.message || 'Failed to send message');
        }
    } catch (error) {
        console.error('Contact form error:', error);
        status.textContent = '✗ Failed to send message. Please try again or email us directly.';
        status.className = 'form-status error';
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
    }
});

// Handle Application Form Submission
document.getElementById('application-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const form = e.target;
    const status = document.getElementById('application-status');
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;
    
    // Disable button and show loading
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    status.textContent = '';
    status.className = 'form-status';
    
    try {
        const formData = {
            position: form.position.value,
            name: form.name.value,
            email: form.email.value,
            discord: form.discord.value,
            portfolio: form.portfolio.value,
            experience: form.experience.value
        };
        
        const response = await fetch('/api/apply', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            status.textContent = '✓ Application submitted successfully! We\'ll review it and get back to you.';
            status.className = 'form-status success';
            
            // Close modal after 2 seconds
            setTimeout(() => {
                closeApplicationModal();
            }, 2000);
        } else {
            throw new Error(data.message || 'Failed to submit application');
        }
    } catch (error) {
        console.error('Application form error:', error);
        status.textContent = '✗ Failed to submit application. Please try again.';
        status.className = 'form-status error';
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
    }
});