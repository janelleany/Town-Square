let recordVideo = () => {

    let preview = document.getElementById("preview");
    let recording = document.getElementById("recording");
    let recordButton = document.getElementById("recordButton");
    let stopButton = document.getElementById("stopButton");
    let showVideoSelector = document.querySelector('.showVideo')
    let recordVideoSelector = document.querySelector('.recordVideo')
    let submitThreadSelector = document.querySelector('.submit_thread')


    let recordingTimeMS = 1000;

    function wait(delayInMS) {
        return new Promise(resolve => setTimeout(resolve, delayInMS));
    }

    function startRecording(stream, lengthInMS) {
        let recorder = new MediaRecorder(stream);
        let data = [];

        recorder.ondataavailable = event => data.push(event.data);
        recorder.start();

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

    recordButton.addEventListener("click", function () {
            startRecording(preview.captureStream(), recordingTimeMS)
            .then(recordedChunks => {

                let recordedBlob = new Blob(recordedChunks, {
                    type: "video/webm"
                });

                let formData = new FormData()
                formData.append('video', recordedBlob)
                recording.src = URL.createObjectURL(recordedBlob);
                submitThread(formData);

            }).then(showPreview => {
                recordVideoSelector.className = 'recordVideo viewable-off'
                showVideoSelector.className = 'showVideo viewable-on'
                
            })
    }, false);

    stopButton.addEventListener("click", function () {
        stop(preview.srcObject);
    }, false);
}

let startPreview = () => {
        navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            }).then(stream => {
                preview.srcObject = stream;
                preview.captureStream = preview.captureStream || preview.mozCaptureStream;
                return new Promise(resolve => preview.onplaying = resolve);
            })
}

let submitThread = (form) => {
    let submitThreadFormSelector = document.querySelector('form')

    submitThreadFormSelector.addEventListener('submit', (event) => {
        let threadTitleSelector = document.getElementById('thread_title').value;
        let threadUsernameSelector = document.getElementById('user').value;

        form.append('threadtitle', threadTitleSelector);
        form.append('username', threadUsernameSelector);

        event.preventDefault();
        console.log('Fetching....')
        fetch('http://localhost:3000/video', {
            method: 'POST',
            body: form 
            // headers: {"Content-Type":"application/json"}
        })
        console.log('Done fetching')
    })
}

startPreview();
recordVideo();

//janelle's press play event listener
// let playIcon = document.querySelector("press-play-icon");
// playIcon.addEventListener("click", function() {
//   if (video.paused === true) {video.play()} else {video.pause()}
// });