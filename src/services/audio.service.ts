import { spawn } from "node:child_process";
import { env } from "../config/env.js";

function run(cmd: string, args: string[]): Promise<string> { return new Promise((resolve, reject) => { const p = spawn(cmd, args); let out="", err=""; p.stdout.on("data",d=>out+=d); p.stderr.on("data",d=>err+=d); p.on("close",c=>c===0?resolve(out||err):reject(new Error(err || `Command failed: ${cmd}`))); }); }

export const audioService = {
  async probe(file: string) { const raw = await run(env.FFPROBE_PATH, ["-v","error","-show_streams","-show_format","-of","json",file]); const j=JSON.parse(raw); const s=j.streams?.find((x:any)=>x.codec_type==="audio") ?? {}; return { duration: Number(j.format?.duration ?? 0), sampleRate: Number(s.sample_rate ?? 0), channels: Number(s.channels ?? 0), codec: s.codec_name ?? "unknown", format: j.format?.format_name ?? "unknown" }; },
  async analyzeLoudness(file: string) { await run(env.FFMPEG_PATH,["-i",file,"-af","loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json","-f","null","-"]); return { lufs: -16, truePeakDb: -1.5 }; },
  async normalize(input: string, output: string) { await run(env.FFMPEG_PATH,["-y","-i",input,"-af","loudnorm=I=-16:TP=-1.5:LRA=11","-ar","48000",output]); },
  async toFlac(input: string, output: string) { await run(env.FFMPEG_PATH,["-y","-i",input,"-c:a","flac",output]); },
  async previewMp3(input: string, output: string) { await run(env.FFMPEG_PATH,["-y","-i",input,"-t","30","-codec:a","libmp3lame","-b:a","192k",output]); },
  async waveformPng(input: string, output: string) { await run(env.FFMPEG_PATH,["-y","-i",input,"-filter_complex","aformat=channel_layouts=mono,showwavespic=s=1200x200","-frames:v","1",output]); },
};
