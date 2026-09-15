CHRISTIAN & QUEENCY — WEDDING WEBSITE

This is the website version (not Canva) and is designed for free static hosting.

FEATURES
- Brown and beige luxury wedding theme
- Opening invitation screen
- Smooth scrolling and scroll reveal animations
- Falling petals effect
- Responsive desktop/tablet/mobile layout
- Wedding countdown to October 10, 2026 at 7:30 AM (Philippines time)
- Google Maps direction buttons
- Add-to-calendar button (downloads an .ics file)
- RSVP email form
- Optional background music support
- Supplied wedding photos, with face-focused crop positions
- QR code reception section

IMPORTANT: RSVP
Open script.js and replace:
  const RSVP_EMAIL='YOUR_EMAIL@example.com';
with the email address that should receive RSVP messages.

OPTIONAL MUSIC
Add a royalty-free/local MP3 named:
  assets/wedding-music.mp3
The Music button will then work in the browser. Browsers generally require the visitor to tap the button before audio can play.

FREE HOSTING
See DEPLOY-FREE.txt for GitHub Pages instructions.


UPDATED 2026-09-10
- Organized wedding-day details and corrected ceremony timing: 7:30 AM guest arrival, 8:00 AM ceremony.
- Added a clearer Wedding Day Schedule heading.
- Reworked responsive image framing so faces stay visible on desktop, tablet, and mobile.
- Reduced gallery vertical scrolling on phones with a compact two-column layout.
- Added responsive overflow protection and mobile spacing refinements.


RSVP EMAIL DELIVERY
The RSVP form now submits by AJAX to FormSubmit and sends the response to queencypineda29@gmail.com without opening an email app. On the first submission, FormSubmit may send a confirmation email to the destination address; confirm it once to activate delivery. The guest email is included as Reply-To so the couple can reply directly.


GUEST PHOTO BOOTH — NEW
- photo.html: mobile phone wedding photo booth matching the invitation theme.
- qr.html: generates a QR code automatically for the current site's photo.html URL.
- photo.js: camera, countdown, frame, redo, submit and Google Drive upload client.
- google-apps-script/Code.gs: Google Drive upload backend.
- Upload destination: Google Drive folder "Christian & Queency — Wedding Guest Photos".
- Drive/Apps Script account: queencypineda29@gmail.com
- Hashtag: #ChristianCenFoundhisQueenCy

GOOGLE DRIVE SETUP
1. Sign in to Google with queencypineda29@gmail.com.
2. Go to script.google.com and create a new Apps Script project.
3. Copy google-apps-script/Code.gs into Code.gs.
4. Run createPhotoFolder once and approve the requested Google Drive permission.
5. Deploy -> New deployment -> Web app.
   Execute as: Me
   Who has access: Anyone
6. Copy the Web App /exec URL.
7. Open photo.js and replace:
   PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE
   with that URL.
8. Re-upload photo.js and the rest of the site to your hosting.
9. Open qr.html on the published site. The QR automatically points to photo.html on the same domain.

IMPORTANT
- The published website must use HTTPS for phone camera access.
- Guests do not need Google accounts and do not need Google Drive.
- Camera permission is requested by the phone browser.
- The QR code is generated from the live website URL, so it works after the site is published without hard-coding a domain.

FRAME UPDATE 2026-09-15
- Replaced the photo booth frame with an ivory/blush/peach/champagne floral frame coordinated with the wedding invitation.
- The same frame artwork is used in the live camera preview and baked into captured JPG photos.
- Captured photos continue to upload to the configured Google Drive wedding album through the Apps Script backend.
