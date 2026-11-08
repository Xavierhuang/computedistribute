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
    args = parser.parse_args()

    model = WhisperModel(args.model, device=args.device, compute_type="auto")
    segments, info = model.transcribe(args.audio_path, language=args.language, task=args.task)
    # segments is a lazy generator: transcription actually happens while iterating.
    out_segments = [
        {"start": round(s.start, 2), "end": round(s.end, 2), "text": s.text.strip()}
        for s in segments
    ]
    json.dump(
        {
            "text": " ".join(s["text"] for s in out_segments).strip(),
            "language": info.language,
            "language_probability": round(info.language_probability, 3),
            "duration_s": round(info.duration, 2),
            "model": args.model,
            "segments": out_segments,
        },
        sys.stdout,
    )


if __name__ == "__main__":
    main()
