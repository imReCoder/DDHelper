import { useEffect, useRef, useState } from "react";
import io from 'socket.io-client';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHandPaper } from "@fortawesome/free-solid-svg-icons";
import Collapse from 'react-bootstrap/Collapse';
import Form from 'react-bootstrap/Form';

import service from "../services/service";
// We'll limit the processing size to 200px.
const maxVideoSize = 224;
const LETTERS = [
  "A","B","C","D",
  "E","F","G","H",
  "I","J","K","L",
  "M","N","O","P",
  "Q","R","S","T",
  "U","V","W",
  "X","Y","Z",
  "_BLANK",
  "_SPACE",
];
const THRESHOLD = 5;

const THRESHOLDS = {
  S: 3,
  E: 5,
  A: 5,
  N: 6,
  R: 5,
};
export default function Page() {
  const videoElement = useRef(null);
  const canvasEl = useRef(null);
  const outputCanvasEl = useRef(null);
  const cameraSelectEl = useRef(null);
  let [letter, setLetter] = useState(null);
  let [loading, setLoading] = useState(true);
  let [fps, setFps] = useState(0);
  let [words, setWords] = useState("");
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [video, setVideo] = useState(null);
  const [socket, setSocket] = useState(null);
  let [isAuto, setIsAuto] = useState(false);

  async function guessWord(manualWords) {
    return new Promise((resolve, reject) => {
      const wordsSplit = manualWords.split(" ");
      console.log("Guessing word: ", wordsSplit[wordsSplit.length - 1]);
      const wordToGuess = wordsSplit[wordsSplit.length - 1];
      if (wordToGuess.length < 3) {
        speechSynthesis.speak(new SpeechSynthesisUtterance(wordToGuess));
        return resolve(wordToGuess);
      }
      if (wordToGuess == "PARUL") {
        speechSynthesis.speak(new SpeechSynthesisUtterance(wordToGuess));
        return resolve(wordToGuess);
      }
      fetch(`/api/autocorrect?word=${wordsSplit[wordsSplit.length - 1]}`)
        .then((res) => res.json())
        .then((json) => {
          const correctedWord = json["correctedWord"];
          speechSynthesis.speak(new SpeechSynthesisUtterance(correctedWord));
          wordsSplit.pop();
          let _words =
            wordsSplit.join(" ") + " " + correctedWord.toUpperCase() + " ";
          setWords(
            wordsSplit.join(" ") + " " + correctedWord.toUpperCase() + " "
          );
          console.log("Corrected word: ", correctedWord);
          resolve(correctedWord);
        });
    });
  }

  async function processImage() {
    if (
      videoElement !== null &&
      canvasEl !== null &&
      typeof videoElement.current !== "undefined" &&
      videoElement.current !== null
    ) {
      let frames = 0;
      let start = Date.now();
      let prevLetter = "";
      let count = 0;
      let _words = "";

      const processWord = () => {
        console.log("isAuto ", isAuto);
        if (!isAuto) return;
        let wordsSplit = _words.split(" ");
        fetch(`/api/autocorrect?word=${wordsSplit[wordsSplit.length - 1]}`)
          .then((res) => res.json())
          .then((json) => {
            const correctedWord = json["correctedWord"];
            speechSynthesis.speak(new SpeechSynthesisUtterance(correctedWord));
            wordsSplit.pop();
            _words =
              wordsSplit.join(" ") + " " + correctedWord.toUpperCase() + " ";
            setWords(
              wordsSplit.join(" ") + " " + correctedWord.toUpperCase() + " "
            );
            console.log("Corrected word: ", correctedWord);
          });
      };

      // videoElement.current.addEventListener("ended", () => processWord());

      while (true) {
        const ctx = canvasEl.current.getContext("2d");
        ctx.drawImage(videoElement.current, 0, 0, maxVideoSize, maxVideoSize);
        const image = ctx.getImageData(0, 0, maxVideoSize, maxVideoSize);
        // Processing image
        const processedImage = await service.imageProcessing(image);
        // Render the processed image to the canvas
        const ctxOutput = outputCanvasEl.current.getContext("2d");
        ctxOutput.putImageData(processedImage.data.payload, 0, 0);

        const prediction = await service.predict(processedImage.data.payload);
        const predictedLetter = prediction.data.payload;
        const confidence = prediction.data.confidence;
        let letterValue = LETTERS[predictedLetter];
        if (isAuto) {
          // if (confidence < 0.5) letterValue = "_NOTHING";
          if (confidence > 0.4) {
            // console.log("-------------------------------------------")
            // console.log(letterValue + " confidence " + prediction.data.confidence + " count " + count);
            // console.log("-----------------------------------------")
          }
        // console.log(letterValue + " confidence " + prediction.data.confidence + " count " + count);

        setLetter(letterValue);


        if (letterValue !== prevLetter) {
          if (
            !THRESHOLDS[prevLetter]
              ? count > THRESHOLD
              : count > THRESHOLDS[prevLetter]
          ) {
            if (prevLetter === "_SPACE" && isAuto) processWord();
            else {
              _words = _words + (prevLetter === "_NOTHING" ? "" : prevLetter);
              setWords(
                (state, props) =>
                  state + (prevLetter === "_NOTHING" ? "" : prevLetter)
              );
              console.log("Words: ", _words);

            }
          }
          count = 0;
        } else {
          count++;
        }
        prevLetter = letterValue;
        }
        frames++;
        if (frames === 10) {
          setFps(10 / ((Date.now() - start) / 1000));
          frames = 0;
          start = Date.now();
        }
      }
    }
  }

  /**
   * In the useEffect hook we'll load the video
   * element to show what's on camera.
   */
  useEffect(() => {
    const delay = (ms) => new Promise((res) => setTimeout(res, ms));
    const newSocket = io(`http://localhost:3000`);
    setSocket(newSocket);
    let manualWord = "";
    const messageListener = async (message) => {
      // set random letter
      let randomLetter = LETTERS[Math.floor(Math.random() * LETTERS.length)];
      setLetter(randomLetter);
      await delay(200);

      randomLetter = LETTERS[Math.floor(Math.random() * LETTERS.length)];
      setLetter(randomLetter);
      await delay(100);

      setLetter(message);
      if (message == "_SPACE") {

        setWords(
          (state, props) =>
            state + " ");
        guessWord(manualWord);
        manualWord = manualWord + " ";
        return;
      }
      manualWord = manualWord + message;
      console.log("Message received ", message);
      setWords((state, props) => state + message);
      console.log("Words: ", words);

    };
    newSocket.on('message', messageListener);
    newSocket.on("IsAuto", (auto) => {
      console.log("IsAuto received", auto);
      setIsAuto(auto);
      setLetter("");
      setWords("");
      console.log("IsAuto current", isAuto);

    });

    newSocket.on("clear", (data) => {
      console.log("Clear");
      setWords("");
      setLetter("");
      manualWord = "";

    });

    newSocket.on('reset', () => {
      console.log("Reset");
      setWords("");
      setLetter(null);
      setIsAuto(true);
    })
    newSocket.on('connect', () => {
      console.log("Socket connected");
    })
    let serviceLoaded = false;
    let cameraFetched = false;
    cameraSelectEl.current.addEventListener('change', () => changeCamera());

    function changeCamera() {
      const videoSource = cameraSelectEl.current.value;
      console.log("Camera change ", videoSource);
      load(videoSource);
    }
    async function fetchAllCameras() {
      return new Promise((resolve, reject) => {
        navigator.mediaDevices.enumerateDevices().then((devices) => {
          let videoSourcesSelect = cameraSelectEl.current;

          // Iterate over all the list of devices (InputDeviceInfo and MediaDeviceInfo)
          devices.forEach((device) => {
            let option = new Option();
            option.value = device.deviceId;

            // According to the type of media device
            switch (device.kind) {
              // Append device to list of Cameras
              case "videoinput":
                option.text = device.label || `Camera ${videoSourcesSelect.length + 1}`;
                videoSourcesSelect.appendChild(option);
                break;

            }

            console.log(device);
            cameraFetched = true;
            resolve(device)
          });
        }).catch(function (e) {
          console.log(e.name + ": " + e.message);
          reject(e)
        });
      })
    }
    async function initCamera(videoSource) {
      videoElement.current.width = maxVideoSize;
      videoElement.current.height = maxVideoSize;
      if (!cameraFetched) {
        await fetchAllCameras();
      }

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            deviceId: videoSource ? { exact: videoSource } : undefined,
            width: maxVideoSize,
            height: maxVideoSize,
          },
        });
        videoElement.current.srcObject = stream;

        return new Promise((resolve) => {
          videoElement.current.onloadedmetadata = () => {
            resolve(videoElement.current);
          };
        });
      }
      const errorMessage =
        "This browser does not support video capture, or this device does not have a camera";
      alert(errorMessage);
      return Promise.reject(errorMessage);
    }


    async function load(source) {
      const videoLoaded = await initCamera(source);
      videoLoaded.play();
      setVideo(videoLoaded);
      setPlaying(true);
      if (!serviceLoaded) {
        await service.load();
        setTimeout(processImage, 0);
        serviceLoaded = true;
      }

      setLoading(false);
      // setTimeout(() => { typeLetter("HELLO") }, 10000);
      return videoLoaded;
    }

    load();
  }, [setSocket, setWords, setLetter]);


  function reset() {
    setLetter(null);
    setFps(0);
    setWords("");
  }

  function typeLetter(letter) {
    let i = 0;
    // setIsAuto(false);

    setInterval(() => {
      const interval = setLetter(letter.substring(0, i));
      console.log(letter[i]);
      i++;
      if (!letter[i]) {
        clearInterval(interval);
      }
    }, 2000)
  }
  function togglePlay() {
    console.log("Toggle playing..", video);
    if (!video) return;
    if (playing) {
      video.pause();
    } else {
      video.play();
    }

    setPlaying(!playing);
  }
  return (
    <div style={{ marginTop: "1em" }}>
      <h2
        className="text-center text-heading"
        style={{ marginBottom: "0.5em" }}
        onClick={() => typeLetter("HELLO PARUL")}
      >
        <FontAwesomeIcon icon={faHandPaper} /> DDHelper
      </h2>
      {loading && (
        <div className="row justify-content-center">
          <div className="col text-center">
            <div
              className="spinner-border"
              style={{ width: "8em", height: "8em", marginBottom: "2em" }}
              role="status"
            ></div>
          </div>
        </div>
      )}
      <div style={{ display: loading ? "none" : "block" }}>
        <div className="signs">
          <button
            onClick={() => setOpen(!open)}
            aria-controls="example-collapse-text"
            aria-expanded={open}
            className="btn btn-default"
            style={{ marginBottom: "1em" }}
          >
            Show Signs
          </button>
          <Collapse in={open}>
            <div id="example-collapse-text" className="sign-img">
              {/* show signs.png */}
              <img src="signs.png" style={{ height: "50%" }}></img>
            </div>
          </Collapse>
          <Form.Control ref={cameraSelectEl} className="video-select" as="select">
            <option>Select Camera</option>

          </Form.Control>
        </div>
        <div className="row justify-content-center">
          <div className="col-xs-12 text-center video">
            <video className="video" playsInline ref={videoElement} />
          </div>
          <canvas
            style={{ display: "none" }}
            ref={canvasEl}
            width={maxVideoSize}
            height={maxVideoSize}
          ></canvas>
          <canvas
            className="col-xs-12"
            style={{ display: "none" }}
            ref={outputCanvasEl}
            width={maxVideoSize}
            height={maxVideoSize}
          ></canvas>
        </div>

        <div
          className="row justify-content-center text-center"
          style={{ marginTop: "2em" }}
        >
          <div className="col-xs-12">
            <h5 className="text-letter">Predicted Letter:</h5>
            <h4
              className="text-letter"
              style={{
                borderRadius: 10,
                border: "2px solid #FFFFFF",
                padding: "0.5em",
              }}
            >
              {letter}
            </h4>
          </div>
        </div>
        <div
          className="row justify-content-center text-center"
          style={{ marginTop: "2em" }}
        >
          <div className="col-xs-12">
            <h4 className="text-words">Predicted Words:</h4>
            <h2
              className="text-words"
              style={{
                borderRadius: 10,
                border: "2px solid #FFFFFF",
                minHeight:'40px',
                padding: "0.3em",
              }}
            >
              {words}
            </h2>
            {/* create button and call onclick function */}
            <button className="btn btn-info btn-sm" style={{margin:"10px"}} onClick={reset}>Reset</button>
            <button className="btn btn-success btn-sm" style={{ margin: "10px" }} onClick={togglePlay}>{playing ? "Pause" : "Play"}</button>

            <p className="text-fps">FPS: {fps.toFixed(3)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
