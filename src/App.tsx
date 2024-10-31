import React, { useState, useRef } from "react";
import Data from "./mockData/Data.json";
import "./App.css";
import Draggable, { DraggableData, DraggableEvent } from "react-draggable";

import { useForm, useFieldArray } from "react-hook-form";
import Toast, {
  showSuccessToast,
  showFailToast,
} from "../src/components/toast";

function App() {
  const data = Data.question.paragraph;
  const parts = data.split("[_input]");
  const dragWordsList = Data.question.dragWords;
  const { register, control, getValues, setValue } = useForm({});
  useFieldArray({
    control,
    name: "wordList",
  });
  const [positions, setPositions] = useState<{
    [key: number]: { x: number; y: number };
  }>(
    dragWordsList.reduce((acc, item) => {
      acc[item.id] = { x: 0, y: 0 };
      return acc;
    }, {} as { [key: number]: { x: number; y: number } })
  );
  const [flag, setFlag] = useState<number>();
  const [isHasContent, setIsHasContent] = useState(false);
  const [inputColors, setInputColors] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const inputRefs = useRef<HTMLInputElement[]>([]);

  const onDragStart = (e: DraggableEvent) => {
    const dragElement = e.target as HTMLDivElement;
    const dragRect = dragElement.getBoundingClientRect();

    const droppedInsideInput: number | undefined = inputRefs.current.findIndex(
      (input) => {
        const inputRect = input.getBoundingClientRect();
        return (
          dragRect.left >= inputRect.left &&
          dragRect.right <= inputRect.right &&
          dragRect.top >= inputRect.top &&
          dragRect.bottom <= inputRect.bottom
        );
      }
    );

    if (droppedInsideInput !== -1) {
      setFlag(droppedInsideInput);
      setIsHasContent(true);
    }
  };

  const onDragStop = (
    e: DraggableEvent,
    data: DraggableData,
    itemId: number
  ) => {
    const dragElement = e.target as HTMLDivElement;
    const dragRect = dragElement.getBoundingClientRect();
    let x = 0;
    let y = 0;

    const droppedInsideInput = inputRefs.current.findIndex((input) => {
      const inputRect = input.getBoundingClientRect();
      const isInside =
        dragRect.left >= inputRect.left &&
        dragRect.right <= inputRect.right &&
        dragRect.top >= inputRect.top &&
        dragRect.bottom <= inputRect.bottom;

      if (isInside) {
        x = data.x - (dragRect.left - inputRect.left - 4);
        y = data.y + (inputRect.bottom - dragRect.bottom - 4);
      }

      return isInside;
    });

    if (droppedInsideInput !== -1) {
      // get conditionnal clause to limit for loop
      if (isHasContent || getValues(`wordList.${droppedInsideInput}`)) {
        const prevItem = dragWordsList.find(
          (item) => item.word === getValues(`wordList.${droppedInsideInput}`)
        )?.id;
        setPositions((prev) => ({
          ...prev,
          ...(prevItem !== undefined && { [prevItem]: { x: 0, y: 0 } }),
          [itemId]: { x: x, y: y },
        }));
        void (flag !== undefined && setValue(`wordList.${flag}`, undefined));
      } else {
        setPositions((prev) => ({
          ...prev,
          [itemId]: { x: x, y: y },
        }));
      }
      setValue(
        `wordList.${droppedInsideInput}`,
        dragWordsList.find((item) => item.id === itemId)?.word
      );
    } else {
      setPositions((prev) => ({
        ...prev,
        [itemId]: { x: 0, y: 0 },
      }));
      void (flag !== undefined && setValue(`wordList.${flag}`, undefined));
      setIsHasContent(false);
    }
    setFlag(undefined);
  };

  const handleSubmit = () => {
    const dataForm = getValues("wordList");
    const result = Data.question.blanks.map((item) => item.correctAnswer);
    const newColors = result.map((answer, index) =>
      dataForm[index] === answer ? "green" : "red"
    );

    setInputColors(newColors);
    setIsSubmitted(true);

    if (!newColors.includes("red")) {
      showSuccessToast("You passed the exam");
    } else {
      showFailToast("That incorrect answer");
    }
  };

  return (
    <div>
      <Toast />
      <p>
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            <span dangerouslySetInnerHTML={{ __html: part }} />
            {index < parts.length - 1 &&
              (isSubmitted ? (
                <span
                  style={{
                    color: inputColors[index],
                    fontWeight: "bold",
                  }}
                >
                  {getValues(`wordList.${index}`)}
                </span>
              ) : (
                <input
                  disabled
                  {...register(`wordList.${index}`)}
                  ref={(el) => (inputRefs.current[index] = el!)}
                  type="text"
                  placeholder=""
                />
              ))}
          </React.Fragment>
        ))}
      </p>
      {!isSubmitted && (
        <div>
          <h4>Choose the answer to fill in the blank</h4>
          <div className="answer-container">
            {dragWordsList.map((item) => (
              <Draggable
                key={item.id}
                position={positions[item.id]}
                onStop={(e, data) => {
                  onDragStop(e, data, item.id);
                }}
                onStart={(e) => {
                  onDragStart(e);
                }}
              >
                <div className="answer-item">{item.word}</div>
              </Draggable>
            ))}
          </div>
        </div>
      )}
      <div>
        <button onClick={() => handleSubmit()}>Submit</button>
      </div>
    </div>
  );
}

export default App;
