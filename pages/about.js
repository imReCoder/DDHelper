const Page = () => {
  return (
    <div style={{ marginTop: '2em' }}>
      <div className="jumbotron text-center">
        <h1>DDHelper - Sign Language Translator</h1>
        <h4>
          DDHelper uses machine learning to convert webcam input into human-readable sign language using a variety of techniques. The next set of text describes the steps DDHelper takes to convert an image into a final word.
        </h4>
      </div>
      <div className="bg-secondary jumbotron">
        <h3 className="text-center">1. OpenCV Pipeline</h3>
        <div className="row justify-content-center">
          <img
            src="opencv.png"
            alt="OpenCV Pipeline Demo"
            className="img-responsive col-xs-12 col-md-6"
            style={{ height: '100%' }}
          />
          <div className="col-xs-12 col-md-6">
            <p>
              The first step is to access the webcam and convert the image into a
              format that is easier to process. This is done using OpenCV, a
              library for computer vision. The following code is an example of
              the pipeline used to convert the image into a format that is
              easier to process.

              <br />
              <code>
                const img = cv.matFromImageData(payload);
                <br/>
                let result = new cv.Mat();
                <br/>
                cv.cvtColor(img, result, cv.COLOR_BGR2GRAY);
                <br/>
                cv.adaptiveThreshold(
                result,
                result,
                255,
                cv.ADAPTIVE_THRESH_GAUSSIAN_C,
                cv.THRESH_BINARY,
                21,
                2
                );
                <br/>
                cv.cvtColor(result, result, cv.COLOR_GRAY2RGB);
                <br/>
              </code>
              <br />
              The first step is to convert the image into a format that OpenCV
              can recognize. The next step is to convert the image to grayscale
              and then apply an adaptive threshold to the image. This is done
              because the webcam will be picking up a lot of noise, and the
              adaptive threshold will help to filter out the noise. The final
              step is to convert the image back to RGB format so that it can be
              displayed on the screen.

            </p>
          </div>
        </div>
      </div>
      <div className="bg-secondary jumbotron">
        <h3 className="text-center">2. Tensorflow CNN</h3>
        <div className="row justify-content-center">
          <img
            src="model-architecture.png"
            alt="OpenCV Pipeline Demo"
            className="img-responsive col-xs-12 col-md-6"
            style={{ height: '100%' }}
          />
          <div className="col-xs-12 col-md-6">
            <p>
              The next step is to use a Tensorflow CNN to detect the letters in
              the image. The CNN was trained on a dataset of 26 letters, and
              outputs a stream of 26 numbers, each corresponding to the
              probability that the letter is the corresponding letter.
              We have used MobileNetV2 as our base model, and added a few
              additional layers to the model. The first additional layer is a dense
              relu layer with 26 neurons, which is used to output the 26 probabilities
              mentioned above. The final layer is a softmax layer, which is used
              to normalize the output of the dense layer. 

            </p>
          </div>
        </div>
      </div>
      <div className="bg-secondary jumbotron">
        <h3 className="text-center">3. Interpreting The Results</h3>
        <div className="row justify-content-center">
          <img
            src="interpretation.png"
            alt="OpenCV Pipeline Demo"
            className="img-responsive col-xs-12 col-md-6"
            style={{ height: '100%' }}
          />
          <div className="col-xs-12 col-md-6">
            <p>
              The final step is to interpret the results of the CNN. The CNN
              outputs a stream of 26 numbers, each corresponding to the
              probability that the letter is the corresponding letter. We
              interpret the results by taking the highest probability letter
              and converting it to a letter.To increase the accuracy of the
              results, we have thresholded the results. This means that if the
              highest probability letter is below a certain threshold, we
              ignore it and do not output a letter. This is done because the
              CNN is not always 100% accurate, and we want to make sure that
              the output is as accurate as possible.

              We have also added a autocorrect feature to the results.
              As mentioned above, the CNN is not always 100% accurate, and
              sometimes outputs a letter that is not the correct letter.



              
              

            </p>
          </div>
        </div>
      </div>
      <div className="bg-secondary jumbotron">
        <h3 className="text-center">4. Autocorrection And Text To Speech</h3>
        <div className="row justify-content-center">
          <img
            src="tts.jpeg"
            alt="OpenCV Pipeline Demo"
            className="img-responsive col-xs-12 col-md-6"
            style={{ height: '100%' }}
          />
          <div className="col-xs-12 col-md-6">
            <p>
            To
              increase the accuracy of the results, we have added a autocorrect
              feature. This feature takes the highest probability letter and
              compares it to a list of possible words. If the highest
              probability letter is not in the list of possible words, we
              ignore it and do not output a letter.
              <br/>
              We have also added text to speech to the results. This is done
              because the output of the previous step is a stream of letters,
              which is not very useful. To make the output more useful, we have
              added text to speech, which converts the stream of letters into
              a stream of words. This is done using the Web Speech API.
              Below is an example of the text to speech feature.
              <code>
                <br />
                const synth = window.speechSynthesis;
                <br />
                const utterThis = new SpeechSynthesisUtterance(text);
                <br />
                synth.speak(utterThis);
                <br />

              </code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
