let recordVideo = () => {
    
    let preview = document.getElementById("preview");
    let recording = document.getElementById("recording");
    let recordButton = document.getElementById("recordButton");
    let stopButton = document.getElementById("stopButton");
    let showVideoSelector = document.querySelector('.showVideo')
    let recordVideoSelector = document.querySelector('.recordVideo')
    let submitThreadSelector = document.querySelector('.submit_reply')

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
                reRecord();
                submitReply(formData);

            }).then(showPreview => {
                recordVideoSelector.className = 'recordVideo viewable-off'
                showVideoSelector.className = 'showVideo viewable-on animated bounce slideInRight'
                
            })
    }, false);

    stopButton.addEventListener("click", function () {
        stop(preview.srcObject);
    }, false);
}

let startPreview = () => {
    let recordVideoSelector = document.querySelector('.recordVideo')
        navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            }).then(stream => {
                preview.srcObject = stream;
                preview.captureStream = preview.captureStream || preview.mozCaptureStream;
                return new Promise(resolve => preview.onplaying = resolve);
            }).then(slideUp => {
                recordVideoSelector.className = 'recordVideo viewable-on animated slideInUp';
            })
}

let submitReply = (form) => {
    let submitThreadFormSelector = document.querySelector('form')

    submitThreadFormSelector.addEventListener('submit', (event) => {
        event.preventDefault();

        let threadUsernameSelector = document.getElementById('user').value;
        let threadId = getPath();

        form.append('post_id', guid());
        form.append('thread_id', threadId);
        form.append('username', threadUsernameSelector);

        console.log('Fetching....')
        fetch('http://localhost:3000/postReply', {
            method: 'POST',
            body: form 
        })
        console.log('Done fetching')
    })
}

let guid = () => {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return s4() + s4() + '-' + s4();
  }

let getPath = () => {
    let path = window.location.pathname;
    let regex = /^\/createReply\/([A-Za-z0-9-]+)$/g;
    let id = regex.exec(path);
    return id[1]
}

let reRecord = () => {
    let reRecordSelector = document.querySelector('.re_record')
    let showVideoSelector = document.querySelector('.showVideo')
    let recordVideoSelector = document.querySelector('.recordVideo')
    
    reRecordSelector.addEventListener('click', () => {
        recordVideoSelector.className = 'recordVideo viewable-on animated slideInUp'
        showVideoSelector.className = 'showVideo viewable-off'
    })

}

startPreview();
recordVideo();

