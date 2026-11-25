import { fireEvent, render, screen } from "@testing-library/react-native";
import * as Haptics from "expo-haptics";
import MoodPicker from "../MoodPicker";
import { getMoodById } from "../../constants/moods";

jest.mock("expo-haptics");

const GREAT = { id: 1, emoji: "😄", label: "Great", color: "#4CAF50" };

afterEach(() => {
  jest.clearAllMocks();
});

describe("MoodPicker", () => {
  it("menampilkan lima pilihan mood", async () => {
    await render(<MoodPicker selectedMood={null} onSelectMood={jest.fn()} />);

    for (const emoji of ["😄", "🙂", "😐", "😔", "😢"]) {
      expect(screen.getByText(emoji)).toBeOnTheScreen();
    }
  });

  it("tidak menampilkan label jika belum ada mood dipilih", async () => {
    await render(<MoodPicker selectedMood={null} onSelectMood={jest.fn()} />);
    expect(screen.queryByText(/Great|Good|Okay|Bad|Awful/)).toBeNull();
  });

  it("memanggil onSelectMood dengan objek mood dan memicu haptic saat ditekan", async () => {
    const onSelectMood = jest.fn();
    await render(<MoodPicker selectedMood={null} onSelectMood={onSelectMood} />);

    await fireEvent.press(screen.getByText("😢"));

    expect(onSelectMood).toHaveBeenCalledTimes(1);
    expect(onSelectMood).toHaveBeenCalledWith(getMoodById(5));
    expect(onSelectMood.mock.calls[0][0]).toMatchObject({
      id: 5,
      emoji: "😢",
      label: "Awful",
      color: "#F44336",
    });
    expect(Haptics.impactAsync).toHaveBeenCalledWith(
      Haptics.ImpactFeedbackStyle.Light,
    );
  });

  it("menampilkan label mood yang sedang dipilih", async () => {
    await render(<MoodPicker selectedMood={GREAT} onSelectMood={jest.fn()} />);
    expect(screen.getByText("😄 Great")).toBeOnTheScreen();
  });
});
