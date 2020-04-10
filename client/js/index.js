import '../styles/index.scss';


console.log('webpack starterkit');
let shouldStop = false;
let stopped = false;
const downloadLink = document.getElementById('download');
const stopButton = document.getElementById('stop');

stopButton.addEventListener('click', function() {
    console.log("stop")
    shouldStop = true;
});

const handleSuccess = function(stream) {
    console.log("handle success", stream)
    const options = {mimeType: 'audio/webm'};
    const recordedChunks = [];
    const mediaRecorder = new MediaRecorder(stream, options);

    mediaRecorder
        .addEventListener('dataavailable', (e) => {
            console.log("added listener")
            if (e.data.size > 0) {
                recordedChunks.push(e.data);
                console.log("push")
            }

            if(shouldStop === true && stopped === false) {
                mediaRecorder.stop();
                console.log("stopped")
                stopped = true;
            }
        });

    mediaRecorder
        .addEventListener('stop', function() {
            console.log('recorder stop')
            downloadLink.href = URL.createObjectURL(new Blob(recordedChunks));
            downloadLink.download = 'acetest.wav';
        });

    console.log("starting")
    mediaRecorder.start();
    console.log("started")
};

navigator.mediaDevices
    .getUserMedia({ audio: true, video: false })
    .then(handleSuccess);
