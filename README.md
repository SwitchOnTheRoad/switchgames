# Switch Games - Complete Website

A fully-featured, modern website for Switch Games Roblox studio with live stats, contact forms, and job applications that integrate with Discord.

## ✨ Complete Features

### 🎮 Live Game Statistics
- Real-time player count
- Total visit counter
- Auto-updates every 30 seconds
- Formatted numbers (K+, M+)

### 🎨 Modern Design
- Professional dark theme with orange accents
- Smooth scroll animations
- Gradient text effects
- Full-width featured game showcase
- Responsive design for all devices

### 📧 Contact Form
- Beautiful contact form
- Sends messages directly to Discord webhook
- Form validation
- Success/error messages

### 💼 Careers Section
- Easy-to-manage job listings
- Professional job cards
- Application modal
- Applications sent to Discord webhook

### 🚀 All Features Complete
- Hero section with animated scroll indicator
- Live stats integration
- Full-width game showcase
- About section with values
- Careers with application system
- Contact form
- Discord webhook integration

## 📁 Files Included

```
├── index.html          # Main HTML (with all sections)
├── styles.css          # Complete styling
├── main.js             # Stats API integration
├── animations.js       # Scroll animations
├── careers.js          # Job management (EDIT THIS!)
├── forms.js            # Form submission handlers
├── server.js           # Express server with Discord webhook
├── getData.js          # Roblox API integration
├── updateData.js       # Stats update logic
├── data.js             # Stats cache
└── info.js             # Universe IDs
```

## 🚀 Quick Start

1. **Install dependencies:**
```bash
npm install
```

2. **Start the server:**
```bash
npm start
```

3. **Open your browser:**
```
http://localhost:5500
```

## 💼 Managing Job Listings

### Adding a New Job

Open `careers.js` and add a new job object to the `jobs` array:

```javascript
const jobs = [
    // ... existing jobs ...
    {
        title: "Game Designer",           // Job title
        type: "Full-Time",                // Full-Time, Part-Time, Contract
        location: "Remote",               // Remote, Hybrid, or location
        description: "Your job description here...",
        requirements: [
            "Requirement 1",
            "Requirement 2",
            "Requirement 3"
        ]
    }
];
```

### Removing a Job

Simply delete or comment out the job object in `careers.js`:

```javascript
const jobs = [
    // This job is no longer available
    // {
    //     title: "Old Position",
    //     ...
    // },
    
    {
        title: "Active Position",
        ...
    }
];
```

### Editing a Job

Just change the properties in the job object:

```javascript
{
    title: "Updated Title",           // Changed
    type: "Contract",                 // Changed from Full-Time
    location: "Remote",
    description: "Updated description...",
    requirements: [
        "New requirement 1",
        "New requirement 2"
    ]
}
```

**No need to restart the server!** Just refresh the page.

## 📧 Discord Webhook Integration

### How It Works

1. **Contact Form**: When someone submits the contact form, it sends a message to your Discord webhook with:
   - Name
   - Email
   - Subject
   - Message

2. **Job Applications**: When someone applies for a job, it sends to Discord with:
   - Position applied for
   - Name & Email
   - Discord username (if provided)
   - Portfolio link (if provided)
   - Experience description

### Message Format in Discord

**Contact Form:**
```
📧 New Contact Form Submission
Name: John Doe
Email: john@example.com
Subject: Partnership Inquiry
Message: [Full message here]
```

**Job Application:**
```
💼 New Job Application
Position: Gameplay Scripter
Name: Jane Smith
Email: jane@example.com
Discord: janesmith#1234
Portfolio: https://github.com/janesmith
Experience: [Full experience text here]
```

### Changing the Webhook URL

If you need to change the Discord webhook URL, edit `server.js`:

```javascript
const DISCORD_WEBHOOK_URL = "YOUR_NEW_WEBHOOK_URL_HERE";
```

## 🎨 Customization Guide

### Changing Colors

Edit CSS variables in `styles.css`:

```css
:root {
    --primary: hsl(25, 100%, 55%);      /* Orange accent */
    --background: hsl(0, 0%, 4%);       /* Dark background */
    --foreground: hsl(0, 0%, 98%);      /* Text color */
}
```

### Updating Content

#### Hero Section
Edit the hero text in `index.html` (around line 35):

```html
<h1 class="hero-title">
    <span class="hero-title-line">We Create</span>
    <span class="hero-title-line text-gradient">Worlds</span>
</h1>
```

#### Featured Game
Update the game link and info in `index.html` (around line 105):

```html
<a href="YOUR_ROBLOX_GAME_URL" target="_blank" class="game-card-link">
    <!-- Change title, description, etc. -->
</a>
```

#### About Section
Edit the about text in `index.html` (around line 155).

### Adding More Games

To track more games, update `info.js`:

```javascript
const Universes = [
    9167571801,
    9463026019,
    YOUR_NEW_UNIVERSE_ID  // Add here
];
```

## 🎯 Features Breakdown

### Contact Form
- **Location**: `index.html` (Contact Section)
- **Handler**: `forms.js`
- **Endpoint**: `/api/contact` in `server.js`
- **Validation**: Required fields checked
- **Feedback**: Success/error messages shown

### Careers Section
- **Job List**: `careers.js` (Edit the `jobs` array)
- **Application Form**: Modal popup
- **Handler**: `forms.js`
- **Endpoint**: `/api/apply` in `server.js`
- **Features**: 
  - Multiple job listings
  - Easy add/remove/edit
  - Professional layout
  - Application modal

### Stats Display
- **CCU**: Current concurrent users
- **Visits**: Total visits across all games
- **Updates**: Every 30 seconds
- **Format**: Automatic (1K+, 1M+)

## 🔧 Troubleshooting

### Forms Not Sending
1. Check server is running on port 5500
2. Verify Discord webhook URL in `server.js`
3. Check browser console for errors
4. Test webhook with Discord's webhook test feature

### Stats Not Loading
1. Verify server is running
2. Check universe IDs in `info.js`
3. Ensure Roblox API is accessible
4. Check console for API errors

### Jobs Not Showing
1. Check `careers.js` syntax
2. Ensure `jobs` array is not empty
3. Check browser console for errors
4. Refresh the page

### Styling Issues
1. Ensure `styles.css` loaded properly
2. Check browser console for CSS errors
3. Clear browser cache
4. Verify all files are in correct location

## 📱 Responsive Design

The website is fully responsive with breakpoints at:
- **Desktop**: 1024px+
- **Tablet**: 768px - 1023px
- **Mobile**: < 768px

## 🌐 Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers

## 🔐 Security Notes

- The Discord webhook URL is exposed in `server.js`
- For production, use environment variables
- Consider rate limiting on endpoints
- Add CAPTCHA for public production use

## 📊 API Endpoints

### GET /api/get-total-visits
Returns combined total visits.

**Response:**
```json
{
  "message": "Successfully grabbed total visits",
  "value": 3548901
}
```

### GET /api/get-total-ccu
Returns current concurrent users.

**Response:**
```json
{
  "message": "Successfully grabbed total ccu",
  "value": 452
}
```

### POST /api/contact
Sends contact form to Discord.

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Question",
  "message": "Hello..."
}
```

### POST /api/apply
Sends job application to Discord.

**Body:**
```json
{
  "position": "Gameplay Scripter",
  "name": "Jane Smith",
  "email": "jane@example.com",
  "discord": "jane#1234",
  "portfolio": "https://...",
  "experience": "I have 3 years..."
}
```

## 🎓 Tips for Success

1. **Job Listings**: Keep descriptions concise and requirements realistic
2. **Contact Form**: Respond to submissions within 24 hours
3. **Stats**: Monitor your API rate limits
4. **Design**: Customize colors and images to match your brand
5. **Testing**: Test forms on different devices

## 📄 License

All rights reserved © 2026 Switch Games

---

**Need Help?**

If you run into any issues:
1. Check the troubleshooting section above
2. Verify all files are in the correct location
3. Check browser and server console logs
4. Ensure Node.js and dependencies are installed

**Made with ❤️ for Switch Games**