import { MOODS, getMoodById } from "../moods";

describe("MOODS", () => {
  it("mempertahankan id 1–5 yang sudah tersimpan di histori pengguna", () => {
    expect(MOODS.map((m) => [m.id, m.label])).toEqual([
      [1, "Great"],
      [2, "Good"],
      [3, "Okay"],
      [4, "Bad"],
      [5, "Awful"],
    ]);
  });

  it("memiliki id unik dan field lengkap", () => {
    expect(new Set(MOODS.map((m) => m.id)).size).toBe(MOODS.length);
    for (const mood of MOODS) {
      expect(mood).toEqual({
        id: expect.any(Number),
        emoji: expect.any(String),
        label: expect.any(String),
        color: expect.stringMatching(/^#[0-9A-F]{6}$/i),
        score: expect.any(Number),
      });
    }
  });

  it("memberi skor 5 (Great) sampai 1 (Awful)", () => {
    expect(MOODS.map((m) => m.score)).toEqual([5, 4, 3, 2, 1]);
  });

  it("tidak bisa diubah saat runtime", () => {
    expect(Object.isFrozen(MOODS)).toBe(true);
    expect(MOODS.every((m) => Object.isFrozen(m))).toBe(true);
  });
});

describe("getMoodById", () => {
  it("mengembalikan definisi mood sesuai id", () => {
    expect(getMoodById(4)).toBe(MOODS[3]);
  });

  it.each([undefined, null, 0, 6, "1"])(
    "mengembalikan null untuk id tidak dikenal (%p)",
    (id) => {
      expect(getMoodById(id)).toBeNull();
    },
  );
});
