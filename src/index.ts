import { distance } from "mathjs";
import { SSPMParsedMap } from "./sspmParser";

export enum RhythiaDifficulty {
  NONE,
  EASY,
  MEDIUM,
  HARD,
  LOGIC,
  TASUKETE,
}

export enum DifficultySpikes {
  EASY_JUMP = "EASY_JUMP",
  JUMP = "JUMP",
  HARD_JUMP = "HARD_JUMP",
  INSANE_JUMP = "INSANE_JUMP",
  EASY_STREAM = "EASY_STREAM",
  STREAM = "STREAM",
  HARD_STREAM = "HARD_STREAM",
  INSANE_STREAM = "INSANE_STREAM",
}

export type Rating = {
  numberRating: number;
  difficulty: RhythiaDifficulty;
};

const MAX_DISTANCE = 2.8284271247461903;
const FUCKED_UP_DIFFICULTY = 22300000;

function clamp(number: number, min: number, max: number) {
  return Math.max(min, Math.min(number, max));
}
function easeOutQuint(x: number): number {
  return Math.sqrt(1 - Math.pow(x - 1, 2));
}
export function rateMap(map: SSPMParsedMap) {
  const notes = map.markers
    .filter((marker) => marker.type === 0)
    .map((marker) => ({
      time: marker.position,
      x: marker.data["field0"].x,
      y: marker.data["field0"].y,
    }));

  let difficultyPoints: Record<DifficultySpikes, number> = {
    EASY_JUMP: 0,
    EASY_STREAM: 0,
    HARD_JUMP: 0,
    HARD_STREAM: 0,
    INSANE_JUMP: 0,
    INSANE_STREAM: 0,
    JUMP: 0,
    STREAM: 0,
  };

  let difficultyMaxes: Record<DifficultySpikes, number> = {
    EASY_JUMP: 10,
    EASY_STREAM: 1,
    HARD_JUMP: 1000,
    HARD_STREAM: 100,
    INSANE_JUMP: 10000,
    INSANE_STREAM: 1000,
    JUMP: 100,
    STREAM: 10,
  };
  for (let index = 0; index < notes.length - 1; index++) {
    const note = notes[index];
    const nextNote = notes[index + 1];
    const deltaTime = nextNote.time - note.time;

    // Weird stuff, possible parser issues.
    if (deltaTime == 0) continue;

    const noteDistance = Number(
      distance([note.x, note.y], [nextNote.x, nextNote.y])
    );

    // Instead of dealing with distances and times, let's normalize it to 0-1
    const distanceDifficulty = clamp(noteDistance / MAX_DISTANCE, 0, 1);
    const timeDifficulty = 1 - (clamp(deltaTime, 10, 1000) - 10) / 990;

    let verdict: DifficultySpikes | undefined;

    // Jump Category
    if (distanceDifficulty >= 0.8 && timeDifficulty > 0.3) {
      verdict = DifficultySpikes.EASY_JUMP;
    }

    if (distanceDifficulty >= 0.8 && timeDifficulty > 0.6) {
      verdict = DifficultySpikes.JUMP;
    }

    if (distanceDifficulty >= 0.6 && timeDifficulty > 0.7) {
      verdict = DifficultySpikes.HARD_JUMP;
    }

    if (distanceDifficulty >= 0.5 && timeDifficulty > 0.85) {
      verdict = DifficultySpikes.INSANE_JUMP;
    }

    // Stream Category
    if (distanceDifficulty < 0.5 && timeDifficulty > 0.96) {
      verdict = DifficultySpikes.INSANE_STREAM;
    }

    if (distanceDifficulty < 0.3 && timeDifficulty > 0.95) {
      verdict = DifficultySpikes.HARD_STREAM;
    }

    if (distanceDifficulty < 0.2 && timeDifficulty > 0.95) {
      verdict = DifficultySpikes.EASY_STREAM;
    }

    if (distanceDifficulty < 0.1 && timeDifficulty > 0.95) {
      verdict = DifficultySpikes.EASY_STREAM;
    }

    if (verdict) {
      difficultyPoints[verdict] += difficultyMaxes[verdict];
    }
  }
  const starRating = Math.max(...Object.values(difficultyPoints));

  return easeOutQuint(starRating / FUCKED_UP_DIFFICULTY) * 11;
}
