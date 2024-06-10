import { useCallback, useEffect, useRef, useState } from "react";
import { COLS, DIRECTIONS, ROWS, createEmptyGird } from "./utils/utils";
import { twMerge } from "tailwind-merge";
import { PlayPauseButton } from "./components/PlayPauseButton";
import { Button } from "./components/Button";
import { Select } from "./components/Select";

function App() {
  const [grid, setGrid] = useState<number[][]>(createEmptyGird());
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [speed, setSpeed] = useState(100);

  const getGridSize = () => {
    const size = Math.min(
      (window.innerWidth - 32) / COLS,
      (window.innerHeight - 200) / ROWS,
      20
    );
    return size;
  };

  const [cellSize, setCellSize] = useState(getGridSize());

  useEffect(() => {
    const handleResize = () => {
      setCellSize(getGridSize());
    };
    window.addEventListener("resize", handleResize);

    // cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const speedRef = useRef(speed);
  speedRef.current = speed;

  // reference to the state -> maintian state across components re-renders
  const playingRef = useRef(isPlaying);
  playingRef.current = isPlaying;

  // without useCallback, the function will be re-created on every re-render
  // with useCallback, the function will be memoized and only re-created when the dependencies change
  const runGameOfLife = useCallback(() => {
    if (!playingRef.current) {
      return;
    }

    // create a deep copy of curent grid, so that we can update the new grid
    // doesn't affect the current grid data -> immutable data handing in react
    setGrid((currentGrid) => {
      const newGrid = currentGrid.map((arr) => [...arr]);
      for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
          let liveNeighbours = 0;
          DIRECTIONS.forEach(([directionX, direcitonY]) => {
            const neighborRow = row + directionX;
            const neighborCol = col + direcitonY;

            if (
              neighborRow >= 0 &&
              neighborRow < ROWS &&
              neighborCol >= 0 &&
              neighborCol < COLS
            ) {
              // within grid bounds
              liveNeighbours += currentGrid[neighborRow][neighborCol] ? 1 : 0;
            }
          });

          // apply game of life rules
          if (liveNeighbours < 2 || liveNeighbours > 3) {
            newGrid[row][col] = 0; // overpopulation or underpopulation
          } else if (currentGrid[row][col] === 0 && liveNeighbours === 3) {
            newGrid[row][col] = 1; // reproduction
          }
        }
      }
      return newGrid;
    });

    setTimeout(runGameOfLife, speedRef.current);
  }, [playingRef, setGrid]);

  const handleMouseDown = () => {
    setIsMouseDown(true);
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
  };

  const toggleCellState = (rowToToggle: number, colToToggle: number) => {
    const newGrid = grid.map((row, rowIndex) =>
      row.map((cell, colIndex) =>
        rowIndex === rowToToggle && colIndex === colToToggle
          ? cell
            ? 0
            : 1
          : cell
      )
    );
    setGrid(newGrid);
  };
  const handleMouseEnter = (row: number, col: number) => {
    if (isMouseDown) {
      // toggle the cell state
      toggleCellState(row, col);
    }
  };
  return (
    <div className="h-screen w-screen flex items-center p-4 flex-col gap-4 relative">
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem]">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_500px_at_50%_200px,#C9EBFF,transparent)]"></div>
      </div>
      <h1 className="md:text-4xl text-xl font-bold text-black">
        Conway's Game of Life
      </h1>
      <div className="flex gap-4 items-center">
        <PlayPauseButton
          isPlaying={isPlaying}
          onClick={() => {
            setIsPlaying(!isPlaying);
            if (!isPlaying) {
              playingRef.current = true;
              runGameOfLife();
            }
          }}
        />
        <Button
          onClick={() => {
            const rows = [];
            for (let i = 0; i < ROWS; i++) {
              rows.push(
                Array.from(Array(COLS), () => (Math.random() > 0.75 ? 1 : 0))
              );
            }
            setGrid(rows);
          }}
        >
          Seed
        </Button>
        <Button
          onClick={() => {
            setGrid(createEmptyGird());
            setIsPlaying(false);
          }}
        >
          {" "}
          Clear{" "}
        </Button>
        <Select
          label="speed selector"
          value={speed}
          onChange={(e) => setSpeed(parseInt(e.target.value))}
        >
          <option value={1000}>Slow</option>
          <option value={500}>Medium</option>
          <option value={100}>Fast</option>
          <option value={50}>Lightning</option>
        </Select>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${COLS}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${ROWS}, ${cellSize}px)`,
        }}
      >
        {grid.map((rows, originalRowIndex) =>
          rows.map((_col, originalColIndex) => (
            <button
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseEnter={() =>
                handleMouseEnter(originalRowIndex, originalColIndex)
              }
              onClick={() =>
                toggleCellState(originalRowIndex, originalColIndex)
              }
              key={`${originalRowIndex}-${originalColIndex}`}
              className={twMerge(
                "border border-[#5095e9]",
                grid[originalRowIndex][originalColIndex]
                  ? "bg-[#7bc6ee]"
                  : "bg-[#062b43]"
              )}
            />
          ))
        )}
      </div>
    </div>
  );
}
export default App;
