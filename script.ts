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
    timer.background_music = document.querySelector("#bg-music") as HTMLAudioElement | null
    
    if (!audio_btn || !audio_icon) return

    audio_btn.addEventListener("click", () => {
        if (timer.background_music !== null) {
            if (timer.background_music.muted) {
                timer.background_music.muted = false
                timer.background_music.volume = 0.1
                timer.background_music.play()

                audio_icon.alt = "mute"
                audio_icon.title = "Mute audio"

                audio_icon.src = "assets/images/audio_off.svg"
            } else {
                timer.background_music.muted = true
                timer.background_music.pause()

                audio_icon.alt = "unmute"
                audio_icon.title = "Unmute audio"

                audio_icon.src = "assets/images/audio_on.svg"
            }
        }
    })
    
}

function playSoundEffect(id: string, volume = 1) {
    const sfx_og = document.querySelector(id) as HTMLAudioElement | null
    if (sfx_og) {
        const sfx_copy = sfx_og.cloneNode(true) as HTMLAudioElement
        sfx_copy.muted = false
        sfx_copy.volume = volume
        sfx_copy.play()

        sfx_copy.addEventListener("ended", () => {
            sfx_copy.remove()
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

function setupNextRound() {
    /*
        Update cycle count after long break
        Increment round
        Update mode and progress bar
        Reset the clock to the next starting time
    */

    clearInterval(timer.interval_id)
    timer.current_round += 1

    if (timer.current_round % 8 === 0) {
        timer.current_mode = "long_break"
    } else if (timer.current_mode === "focused") {
        timer.current_mode = "short_break"
    } else {
        timer.current_mode = "focused"
    }


    const modeToNum = new Map<mode, number>([
        ["focused", 1500],
        ["short_break", 300],
        ["long_break", 900]
    ])

    timer.current_time = modeToNum.get(timer.current_mode) ?? 0
    minutesToSeconds()

    if (timer.progress_bar) {
        const progress = (timer.current_round % 8) / 8 * 100
        if (progress === 0 && timer.display_cycle) {
            timer.current_cycle++;
            timer.display_cycle.textContent= String(timer.current_cycle)
            playSoundEffect("#level-brawl-pass")
        }
        console.log(`progress = ${progress} and cycle = ${timer.current_round}`)
        timer.progress_bar.style.width = `${progress}%`
    }

    console.log(`mode = ${timer.current_mode}: ${modeToNum.get(timer.current_mode)}`)
}

function setupPlayButton() {
    const play = document.querySelector("#startBtn") as HTMLButtonElement | null
    play?.addEventListener("click", () => {
        play.classList.toggle("alt-theme")
        if (timer.current_state === "idle") {
            playSoundEffect("#start-sound", 0.5)
            play.textContent = "Pause"
            
            timer.current_state = "running"
            
            timer.interval_id = setInterval(() => {
                if (timer.current_time !== null){
                    if (timer.current_time <= 0) {
                        playSoundEffect("#end-sound")  
                        setupNextRound()
                    } else {
                        if (timer.current_time === 15) {
                            playSoundEffect("#final-seconds-music", 1)                       
                        }
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

    minutesToSeconds()
}

function setupSkipButton() {
    const skip = document.querySelector("#skipBtn")
    skip?.addEventListener("click", () => {
        setupNextRound()
    })
}

function setupButtonSfx() {
    const clicky_buttons = document.querySelectorAll(".clicky")
    clicky_buttons.forEach((button) => {
        button.addEventListener("click", () => {
            playSoundEffect(".click-sfx", 1)
        })
    })
}

function setupEventListeners() {
    timer.display_time = document.querySelector(".timer")
    timer.display_cycle = document.querySelector("#cycle_number")
    timer.progress_bar = document.querySelector(".xp_bar_progress")

    setupAudio()
    setupTimer("idle", "focused", 1500, 1)
    setupPlayButton()
    setupSkipButton()
    setupButtonSfx()
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
    current_cycle: 0,
    display_cycle: null as HTMLElement | null,
    interval_id: undefined as number | undefined,
    progress_bar: null as HTMLElement | null,
    background_music: null as HTMLAudioElement | null,
}

main()
