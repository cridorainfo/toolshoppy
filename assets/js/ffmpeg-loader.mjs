import { FFmpeg } from '/assets/libs/ffmpeg/index.js';
import { fetchFile } from '/assets/libs/ffmpeg/util/index.js';

let instance = null;
let loading = null;

export async function getFFmpeg(onProgress) {
  if (instance) return instance;
  if (loading) return loading;
  loading = (async () => {
    const ffmpeg = new FFmpeg();
    if (onProgress) ffmpeg.on('progress', (e) => { if (e.progress >= 0) onProgress(Math.round(e.progress * 100)); });
    const base = '/assets/libs/ffmpeg/wasm';
    // The bundled core is UMD, while the FFmpeg wrapper uses a module worker.
    // Export its factory explicitly so the worker's dynamic import can load it.
    const response = await fetch(base + '/ffmpeg-core.js');
    if (!response.ok) throw new Error('Could not load the media engine.');
    const coreURL = URL.createObjectURL(new Blob([
      await response.text(), '\nexport default createFFmpegCore;\n',
    ], { type: 'text/javascript' }));
    try {
      await ffmpeg.load({
        coreURL,
        wasmURL: new URL(base + '/ffmpeg-core.wasm', location.href).href,
      });
    } catch (error) {
      ffmpeg.terminate();
      throw error;
    } finally {
      URL.revokeObjectURL(coreURL);
    }
    instance = ffmpeg;
    return ffmpeg;
  })().catch((error) => {
    loading = null; // A transient load failure must not poison every later attempt.
    throw error;
  });
  return loading;
}

export { fetchFile };

export async function runFFmpeg(file, inputName, outputName, args, onProgress) {
  const ffmpeg = await getFFmpeg(onProgress);
  try {
    await ffmpeg.writeFile(inputName, await fetchFile(file));
    const code = await ffmpeg.exec(['-y', '-i', inputName].concat(args).concat([outputName]));
    if (code !== 0) throw new Error('Could not process this media format.');
    const out = await ffmpeg.readFile(outputName);
    if (!out.length) throw new Error('The output was empty. Choose a valid time range.');
    return new Blob([out], { type: 'application/octet-stream' });
  } finally {
    await ffmpeg.deleteFile(inputName).catch(() => {});
    await ffmpeg.deleteFile(outputName).catch(() => {});
  }
}
