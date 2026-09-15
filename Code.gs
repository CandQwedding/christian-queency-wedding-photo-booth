/**
 * CHRISTIAN & QUEENCY — GOOGLE DRIVE WEDDING PHOTO BOOTH
 *
 * Deploy:
 * 1) Open script.google.com while signed in as queencypineda29@gmail.com.
 * 2) New project -> paste this file into Code.gs.
 * 3) Run createPhotoFolder once and approve permissions.
 * 4) Deploy -> New deployment -> Web app.
 *    Execute as: Me
 *    Who has access: Anyone
 * 5) Copy the /exec URL into photo.js:
 *    GOOGLE_APPS_SCRIPT_URL
 */

const FOLDER_NAME = 'Christian & Queency — Wedding Guest Photos';

function createPhotoFolder() {
  const folders = DriveApp.getFoldersByName(FOLDER_NAME);
  if (folders.hasNext()) return folders.next().getId();
  return DriveApp.createFolder(FOLDER_NAME).getId();
}

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({
      ok: true,
      service: 'Christian & Queency Wedding Photo Booth'
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents || '{}');
    if (!data.base64) throw new Error('Missing image data.');

    const folderId = createPhotoFolder();
    const folder = DriveApp.getFolderById(folderId);

    const bytes = Utilities.base64Decode(data.base64);
    const blob = Utilities.newBlob(
      bytes,
      data.mimeType || 'image/jpeg',
      data.filename || ('Christian-Queency_' + Date.now() + '.jpg')
    );

    const file = folder.createFile(blob);
    file.setDescription(
      'Christian & Queency Wedding Photo Booth\n' +
      (data.hashtag || '#ChristianCenFoundhisQueenCy')
    );

    return ContentService
      .createTextOutput(JSON.stringify({
        ok: true,
        fileId: file.getId(),
        fileName: file.getName()
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        ok: false,
        error: String(error)
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
