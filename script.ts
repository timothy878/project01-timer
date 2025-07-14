type timer_state = 
            "idle" |
            "running" |
            "paused"

type mode = 
        "focused" |
        "short_break" |
        "long_break"

function setupAudio() {
    const audio_btn = document.querySelector("#audio") as HTMLElement | null
    const audio_icon = document.querySelector("#audio-icon") as HTMLImageElement | null
    const audio = document.querySelector("#bg-music") as HTMLAudioElement | null
    if (audio_btn && audio_icon && audio) {
        audio_btn.addEventListener("click", () => {
            if (audio.muted) {
                audio.muted = false
                audio.volume = 0.1
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

function minutesToSeconds() {
    const minutes = Math.floor(timer.current_time / 60)
    const seconds = String(timer.current_time % 60)
    const seconds_padded = seconds.padStart(2, "0")
    console.log(`time is ${minutes}:${seconds}`)
    if (timer.display_time) {
        if (timer.current_time >= 60) timer.display_time.textContent = `${minutes}:${seconds_padded}`
        else timer.display_time.textContent = `${seconds}`
    }
}

function startClock() {
    const play = document.querySelector("#startBtn") as HTMLButtonElement | null
    play?.addEventListener("click", () => {
        play.classList.toggle("alt-theme")
        if (timer.current_state === "idle") {
            play.textContent = "Pause"
            
            timer.current_state = "running"
            
            timer.interval_id = setInterval(() => {
                if (timer.current_time !== null){
                    if (timer.current_time <= 0) {
                        clearInterval(timer.interval_id)
                        console.log("done!")
                        if (timer.display_time) timer.display_time.textContent = "0"
                    } else {
                        console.log(timer.current_time)
                        minutesToSeconds()
                        timer.current_time -= 1
                    }
                }
            }, 1000)  
        } else if (timer.current_state === "running") {
            play.textContent = "play"

            timer.current_state = "idle"

            clearInterval(timer.interval_id)
        }
    })
}

function setupTimer(state: timer_state, mode: mode, time: number, round: number) {
    timer.current_state = state
    timer.current_mode = mode
    timer.current_time = time
    timer.current_round = round
}

function setupEventListeners() {
    timer.display_time = document.querySelector(".timer")

    setupAudio()
    setupTimer("idle", "focused", 65, 1)
    startClock()
}

function main() {
    setupEventListeners()
}

const timer = {
    current_state: null as timer_state | null,
    current_mode: null as mode | null,
    current_time: 1500,
    display_time: null as HTMLElement | null,
    current_round: 1,
    interval_id: undefined as number | undefined,
}

main()
