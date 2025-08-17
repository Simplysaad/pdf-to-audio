import path from "path";
import AdmZip from "adm-zip";
const zip = new AdmZip();

export default function compress_playlist(folder_path) {
  try {
    zip.addLocalFolder(folder_path);
    zip.writeZip(path.basename(folder_path) + ".zip");
  } catch (err) {
    console.error(err);
  }
}
