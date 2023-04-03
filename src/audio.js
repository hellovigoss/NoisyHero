

function startCapture(dom, scence, cb){
  dom.addEventListener("click", async () => {
    let audioCtx = new (window.AudioContext || window.webkitAudioContext)(); // define audio context
    let analyser = audioCtx.createAnalyser();
    let distortion = audioCtx.createWaveShaper();
    let gainNode = audioCtx.createGain();
    let biquadFilter = audioCtx.createBiquadFilter();

    let stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    let source = audioCtx.createMediaStreamSource(stream);

    source.connect(analyser);
    analyser.connect(distortion);
    distortion.connect(biquadFilter);
    biquadFilter.connect(gainNode);
    gainNode.connect(audioCtx.destination); // connecting the different audio graph nodes together

    cb(scence, analyser);
  });


}


function visualize(stream, analyser) {
  let canvas = document.getElementById('visualizer');
  console.log(canvas);
  let canvasCtx = canvas.getContext('2d');
  let WIDTH = canvas.width;
  let HEIGHT = canvas.height;

  analyser.fftSize = 256;
  const bufferLengthAlt = analyser.frequencyBinCount;
  console.log(bufferLengthAlt);

  // See comment above for Float32Array()
  const dataArrayAlt = new Uint8Array(bufferLengthAlt);

  canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

  const drawAlt = function () {
    let drawVisual = requestAnimationFrame(drawAlt);

    analyser.getByteFrequencyData(dataArrayAlt);

    canvasCtx.fillStyle = "rgb(0, 0, 0)";
    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

    const barWidth = (WIDTH / bufferLengthAlt) * 2.5;
    let barHeight;
    let x = 0;

    for (let i = 0; i < bufferLengthAlt; i++) {
      barHeight = dataArrayAlt[i];

      canvasCtx.fillStyle = "rgb(" + (barHeight + 100) + ",50,50)";
      canvasCtx.fillRect(
        x,
        HEIGHT - barHeight / 2,
        barWidth,
        barHeight / 2
      );

      x += barWidth + 1;
    }
  };

  drawAlt();
}

export {startCapture, visualize}