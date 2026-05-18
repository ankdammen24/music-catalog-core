import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { env } from "../config/env";
const exec = promisify(execFile);
export async function probeAudio(path:string){ const { stdout } = await exec(env.FFPROBE_PATH, ["-v","quiet","-print_format","json","-show_streams","-show_format",path]); return JSON.parse(stdout); }
export async function toFlac(input:string, output:string){ await exec(env.FFMPEG_PATH, ["-y","-i",input,"-c:a","flac",output]); }
