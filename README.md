# Christian & Queency — Wedding Website + Mobile Photo Booth

GitHub Pages-ready wedding invitation and guest photo booth.

**Repository:** `CandQwedding/christian-queency-wedding-photo-booth`

**Expected site:** https://candqwedding.github.io/christian-queency-wedding-photo-booth/

## Included

- Christian & Queency wedding invitation in the supplied brown/beige theme
- Responsive gallery and wedding details
- Mobile guest photo booth
- Front/rear camera switch
- 3-second countdown
- Wedding frame and `#ChristianCenFoundhisQueenCy`
- Redo / Submit flow
- QR-code page at `/qr.html`
- Google Drive upload backend template for `queencypineda29@gmail.com`
- GitHub Pages Actions deployment workflow
- `.nojekyll` for static hosting

## GitHub Pages deployment

1. Upload the **contents of this folder** to the repository root.
2. Commit to `main`.
3. Open **Settings → Pages** in the repository.
4. Under **Build and deployment → Source**, select **GitHub Actions**.
5. The included `.github/workflows/pages.yml` will deploy the site.
6. The site URL will be:
   `https://candqwedding.github.io/christian-queency-wedding-photo-booth/`

GitHub Pages serves static files over HTTPS, which is required for browser camera access.

## Google Drive photo upload

The website is already configured for the intended Google account:

`queencypineda29@gmail.com`

The account itself is **not** placed in the client-side upload URL. Instead, deploy the supplied `google-apps-script/Code.gs` as a Google Apps Script Web App while signed into that account.

### One-time Google setup

1. Sign in to Google as `queencypineda29@gmail.com`.
2. Open Google Apps Script and create a project.
3. Copy `google-apps-script/Code.gs` into `Code.gs`.
4. Run `createPhotoFolder()` once and authorize Google Drive access.
5. Deploy → New deployment → Web app.
6. Execute as: **Me**.
7. Who has access: **Anyone**.
8. Copy the deployed `/exec` URL.
9. Open `photo.js` and replace:

   `PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE`

   with the `/exec` URL.
10. Commit the updated `photo.js` to GitHub.

The photos will be stored in a Drive folder named:

`Christian & Queency — Wedding Guest Photos`

Guests do not need a Google account or Google Drive.

## QR code

Open the published:

`https://candqwedding.github.io/christian-queency-wedding-photo-booth/qr.html`

The QR code automatically points to the site's `photo.html`, so no manual QR URL editing is needed after deployment.

## Camera notes

- Guests use their own phones.
- The browser asks for camera permission.
- Use the front camera for selfies or switch to the rear camera for someone taking the guest's photo.
- The final image is generated in the browser with the wedding frame and hashtag.
- The site must be HTTPS for camera access.

## RSVP

The existing RSVP form is configured for:

`queencypineda29@gmail.com`

## Important security note

Do not put Google account passwords, private Drive credentials, service-account keys, or OAuth client secrets into this repository. The public website only needs the Apps Script Web App URL.
