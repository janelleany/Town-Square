let recordVideo = function (vidId) {

    let preview = document.getElementById("preview");
    let recording = document.getElementById("recording");
    let recordButton = document.getElementById("recordButton");
    let stopButton = document.getElementById("stopButton");
    let logElement = document.getElementById("log");
    let leftDiv = document.querySelector(".left")

    //sets time to record
    let recordingTimeMS = 5000;

    function log(msg) {
        logElement.innerHTML += msg + "\n";
    }
    //sets wait function
    function wait(delayInMS) {
        return new Promise(resolve => setTimeout(resolve, delayInMS));
    }
    // starts recording for 5 seconds or untill stopped
    function startRecording(stream, lengthInMS) {
        let recorder = new MediaRecorder(stream);
        let data = [];

        recorder.ondataavailable = event => data.push(event.data);
        recorder.start();
        log(recorder.state + " for " + (lengthInMS / 1000) + " seconds...");

        let stopped = new Promise((resolve, reject) => {
            recorder.onstop = resolve;
            recorder.onerror = event => reject(event.name);
        });

         
        let recorded = wait(lengthInMS).then(
            () => recorder.state == "recording" && recorder.stop() );

        return Promise.all([
                stopped,
                recorded
            ])
            .then(() => data);
    }

    function stop(stream) {
        stream.getTracks().forEach(track => track.stop());
    }

    // adds click event to recordbutton 
    recordButton.addEventListener("click", function () {
        //gets okay from user to allow video and audio
        navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            }).then(stream => {
                preview.srcObject = stream;
                // downloadButton.href = stream;
                preview.captureStream = preview.captureStream || preview.mozCaptureStream;
                return new Promise(resolve => preview.onplaying = resolve);
            }).then(() => startRecording(preview.captureStream(), recordingTimeMS))
            // runs function to allow download
            .then(recordedChunks => {
                leftDiv.className = "left viewable-off";
                // encodes video into webm 
                let recordedBlob = new Blob(recordedChunks, {
                    type: "video/webm"
                });
                // create post request with form data to localhost:3000/videos
                let formData = new FormData()
                console.log(recordedBlob)
                formData.append('video', recordedBlob)

                for (var pair of formData.entries()) {
                    console.log(pair[0] + ', ' + pair[1]);
                }

                console.log('about to fetch')
                fetch('http://localhost:3000', {
                    method: 'POST',
                    body: 'fd',formData
                })

                // creates url object
                recording.src = URL.createObjectURL(recordedBlob);
            })
            .catch(log);
    }, false);
    stopButton.addEventListener("click", function () {
        stop(preview.srcObject);
    }, false);
}