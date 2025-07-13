// to be filled!!

function setupAudio() {
    const audio_btn = document.querySelector("#audio")
    const audio_icon = document.querySelector("#audio-icon")
    const audio = document.querySelector("#bg-music")
    audio.volume = 0.1
    if (audio_btn) {
        audio_btn.addEventListener("click", () => {
            if (audio.muted) {
                audio.muted = false
                audio.play()

                audio_icon.alt = "mute"
                audio_icon.title = "Mute audio"

                audio_icon.src = "assets/images/audio_off.svg"
                audio.play()
            } else {
                audio.muted = true
                audio.pause()

                audio_icon.alt = "unmute"
                audio_icon.title = "Unmute audio"

                audio_icon.src = "assets/images/audio_on.svg"
            }
        })
    }

}

function setupEventListeners() {
    setupAudio()
}

function main() {
    setupEventListeners()
}

main()
