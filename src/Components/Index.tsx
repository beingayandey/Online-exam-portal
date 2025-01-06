import React, { useState, useEffect, useRef } from "react";
import axios, { AxiosResponse } from "axios";
import Loading from "./Loading";

const shuffleArray = (array: any[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};

const Index = () => {
  const [updatedata, setUpdatedata] = useState<any[]>([]);
  const [categories, setCategories] = useState("");
  const [timer, setTimer] = useState<number>(600); // 10 minutes in seconds
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [userAnswers, setUserAnswers] = useState<any>({});
  const [score, setScore] = useState<number>(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isScore, setIsScore] = useState(false);
  const [loading, setLoading] = useState(false); // Loading state
  const [submittedAnswers, setSubmittedAnswers] = useState<any[]>([]);
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const searchFunc = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategories(e.target.value);
  };
  const handleShowCorrectAnswers = () => {
    setShowCorrectAnswers(!showCorrectAnswers); // Toggle the visibility
  };

  useEffect(() => {
    if (isTimerActive && timer > 0) {
      intervalRef.current = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer > 0) {
            return prevTimer - 1;
          } else {
            clearInterval(intervalRef.current!);
            alert("Time's up!");
            setIsTimerActive(false);
            return 0;
          }
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isTimerActive, timer]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes < 10 ? `0${minutes}` : minutes}:${
      seconds < 10 ? `0${seconds}` : seconds
    }`;
  };

  const startIt = () => {
    resetStates();
    setIsTimerActive(true);
    const categoriesMap: { [key: string]: string } = {
      sc: "18",
      sg: "30",
      my: "20",
      gk: "9",
    };

    const finalSelect = categoriesMap[categories];

    if (finalSelect) {
      setLoading(true); // Set loading state to true
      axios
        .get(
          `https://opentdb.com/api.php?amount=10&category=${finalSelect}&difficulty=easy&type=multiple`
        )
        .then((res: AxiosResponse) => {
          const shuffledData = res.data.results.map((question: any) => {
            const answers = [
              ...question.incorrect_answers,
              question.correct_answer,
            ];
            shuffleArray(answers);
            return { ...question, answers };
          });

          setTimeout(() => {
            setUpdatedata(shuffledData); // Set the updated data
            setLoading(false); // Set loading state to false after 2 seconds
          }, 2000);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
          alert("Wait sometime to change the category.");
        });
      setIsSubmitted(true);
    } else {
      alert("Please select a category before starting.");
    }
  };

  const resetStates = () => {
    setTimer(600);
    setUserAnswers({});
    setScore(0);
    setIsSubmitted(false);
    setIsScore(false);
    setUpdatedata([]);
  };

  const handleAnswerSelection = (questionIndex: number, answer: string) => {
    setUserAnswers((prevAnswers: any) => ({
      ...prevAnswers,
      [questionIndex]: answer,
    }));
  };

  const calculateScore = () => {
    let calculatedScore = 0;
    updatedata.forEach((question: any, index: number) => {
      const userAnswer = userAnswers[index];
      if (userAnswer === question.correct_answer) {
        calculatedScore += 1;
      }
    });

    setScore(calculatedScore);
  };

  const handleSubmit = () => {
    setSubmittedAnswers(updatedata);
    calculateScore();
    setIsScore(true);
    setCategories("");
    setUpdatedata([]);
    setIsSubmitted(false);
  };

  return (
    <>
      <div className="top-bar">
        <div className="timer">
          Remaining Time : <span className="rtimer"> {formatTime(timer)} </span>
        </div>
      </div>

      <header>
        <div className="container">
          <nav>
            <div className="total-menu d-flex my-5 justify-content-between">
              <div className="logo">
                <strong className="fs-5">Exam Portal</strong>
              </div>
              <div className="menu">
                <ul>
                  <li></li>
                </ul>
              </div>
              <div className="right-side-menu">
                <ul className="d-flex gap-2">
                  <li>Admin Login</li>
                  <li> Login </li>
                </ul>
              </div>
            </div>
          </nav>
        </div>
      </header>

      <section className="section-two">
        <div className="container">
          <div className="d-flex align-items-center justify-content-between">
            <div className="left-categories">
              <h3>Select Categories:</h3>
              <div className="optionbox">
                <select name="" id="" onChange={searchFunc} value={categories}>
                  <option value="">None</option>
                  <option value="sc">Science computers</option>
                  <option value="sg">Science gadgets</option>
                  <option value="my">Mythology</option>
                  <option value="gk">General knowledge</option>
                </select>
              </div>
            </div>
            <div className="right-categories">
              <button onClick={startIt} className="start-btn">
                Start
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="question-sec py-5">
        <div className="container">
          <h2 className="heading">Questions</h2>
          <h5 className="heading2">
            Selected Categories:
            <span className="scc">
              {categories === "sc"
                ? "Science computers"
                : categories === "sg"
                ? "Science gadgets"
                : categories === "my"
                ? "Mythology"
                : categories === "gk"
                ? "General knowledge"
                : "None"}
            </span>
          </h5>

          {loading ? (
            <Loading />
          ) : (
            <>
              {updatedata.map((value: any, index: number) => (
                <div className="question box" key={index}>
                  <h3>
                    Q{index + 1} &gt; &nbsp;
                    <span
                      dangerouslySetInnerHTML={{ __html: value.question }}
                    />
                  </h3>
                  <div className="answer-box">
                    {value.answers.map((answer: any, i: number) => (
                      <div className="answers" key={i}>
                        <div className="radio-input">
                          <label htmlFor={`question-${index}-answer-${i}`}>
                            <input
                              type="radio"
                              id={`question-${index}-answer-${i}`}
                              name={`question-${index}`}
                              value={answer}
                              onChange={() =>
                                handleAnswerSelection(index, answer)
                              }
                            />
                            <p
                              className="text"
                              dangerouslySetInnerHTML={{ __html: answer }}
                            ></p>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {isSubmitted && (
                <button onClick={handleSubmit} className="submit-btn">
                  Submit Answers
                </button>
              )}
            </>
          )}
        </div>
      </section>

      <section className="submit-answer">
        <div className="container">
          {isScore && (
            <div className="card">
              <div className="card2">
                <div className="score-display gradient-border" id="box">
                  <h3>Your Score: {score}</h3>
                </div>
                <div className="d-flex justify-content-between">
                  <div className="left-answers">
                    <div className="your-answer">
                      <h4>Your Answers:</h4>
                      <ul>
                        {Object.keys(userAnswers).map((key: any) => {
                          const answer = userAnswers[key]; // Get the user's answer for the current question
                          const isCorrect =
                            submittedAnswers[key]?.correct_answer === answer; // Check if the answer is correct
                          return (
                            <li key={key}>
                              Q{parseInt(key) + 1}:{" "}
                              <span
                                dangerouslySetInnerHTML={{ __html: answer }}
                              />
                              {/* Display tick or cross based on whether the answer is correct */}
                              {isCorrect ? (
                                <span className="tick"> &#10003;</span> // Right answer: Tick
                              ) : (
                                <span className="cross"> &#10060;</span> // Wrong answer: Cross
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                  <div className="right-answers">
                    {/* Button to toggle visibility of correct answers */}
                    <button
                      onClick={handleShowCorrectAnswers}
                      className="start-btn"
                    >
                      {showCorrectAnswers
                        ? "Hide Correct Answers"
                        : "Show Correct Answers"}
                    </button>

                    {/* Conditionally render the correct answers based on state */}
                    {showCorrectAnswers && (
                      <div className="correct-answers">
                        <h4>Correct Answers:</h4>
                        {submittedAnswers.map(
                          (cavalue: any, caindex: number) => {
                            return (
                              <div key={caindex} className="after-answer">
                                <p>
                                  <strong>Q{caindex + 1}:</strong> &gt; &nbsp;
                                  <span
                                    dangerouslySetInnerHTML={{
                                      __html: cavalue.question,
                                    }}
                                  ></span>
                                </p>
                                <p
                                  dangerouslySetInnerHTML={{
                                    __html: cavalue.correct_answer,
                                  }}
                                  className="corrected_answer"
                                ></p>
                              </div>
                            );
                          }
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Index;
