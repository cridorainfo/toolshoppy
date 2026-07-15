import { FFmpeg } from '/assets/libs/ffmpeg/index.js';
import { fetchFile, toBlobURL } from '/assets/libs/ffmpeg/util/index.js';

let instance = null;
let loading = null;

export async function getFFmpeg(onProgress) {
  if (instance) return instance;
  if (loading) return loading;
  loading = (async () => {
    const ffmpeg = new FFmpeg();
    if (onProgress) ffmpeg.on('progress', (e) => { if (e.progress >= 0) onProgress(Math.round(e.progress * 100)); });
    const base = '/assets/libs/ffmpeg/wasm';
    await ffmpeg.load({
      coreURL: await toBlobURL(base + '/ffmpeg-core.js', 'text/javascript'),
      wasmURL: await toBlobURL(base + '/ffmpeg-core.wasm', 'application/wasm'),
    });
    instance = ffmpeg;
    return ffmpeg;
  })();
  return loading;
}

export { fetchFile };

export async function runFFmpeg(file, inputName, outputName, args, onProgress) {
  const ffmpeg = await getFFmpeg(onProgress);
  await ffmpeg.writeFile(inputName, await fetchFile(file));
  await ffmpeg.exec(['-i', inputName].concat(args).concat([outputName]));
  const out = await ffmpeg.readFile(outputName);
  await ffmpeg.deleteFile(inputName);
  await ffmpeg.deleteFile(outputName);
  return new Blob([out.buffer], { type: 'application/octet-stream' });
}
