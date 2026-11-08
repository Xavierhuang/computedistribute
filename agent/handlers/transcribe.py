"""Transcribe one audio file with faster-whisper and print the result as JSON on stdout.

Usage: python transcribe.py AUDIO_PATH [--model small] [--language en] [--task transcribe]
Requires: pip install "faster-whisper>=1.1". Uses CUDA when available, else CPU.
"""
import argparse
import json
import sys

from faster_whisper import WhisperModel


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("audio_path")
    parser.add_argument("--model", default="small")
    parser.add_argument("--language", default=None)
    parser.add_argument("--task", default="transcribe", choices=["transcribe", "translate"])
    parser.add_argument("--device", default="auto")
    parser.add_argument("--max-duration", type=float, default=4 * 3600)
    parser.add_argument("--clip-start", type=float, default=None)
    parser.add_argument("--clip-end", type=float, default=None)
    args = parser.parse_args()

    model = WhisperModel(args.model, device=args.device, compute_type="auto")
    clip = [args.clip_start, args.clip_end] if args.clip_start is not None else "0"
    segments, info = model.transcribe(
        args.audio_path, language=args.language, task=args.task, clip_timestamps=clip
    )
    if info.duration > args.max_duration:
        # Exit code 3 tells the agent this is permanent: the audio is too long everywhere.
        print(f"audio is {info.duration:.0f}s; the limit is {args.max_duration:.0f}s", file=sys.stderr)
        sys.exit(3)
    # segments is a lazy generator: transcription actually happens while iterating.
    out_segments = [
        {"start": round(s.start, 2), "end": round(s.end, 2), "text": s.text.strip()}
        for s in segments
    ]
    # For a clip, bill only the clip's length (bounded by the real audio length).
    duration = info.duration
    if args.clip_start is not None:
        duration = max(0.0, min(args.clip_end, info.duration) - args.clip_start)
    json.dump(
        {
            "text": " ".join(s["text"] for s in out_segments).strip(),
            "language": info.language,
            "language_probability": round(info.language_probability, 3),
            "duration_s": round(duration, 2),
            "clip_start_s": args.clip_start,
            "model": args.model,
            "segments": out_segments,
        },
        sys.stdout,
    )


if __name__ == "__main__":
    main()
