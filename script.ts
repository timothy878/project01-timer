import gemGrab from './assets/images/gem_grab.svg'
import brawlBall from './assets/images/brawl_ball.svg'
import bounty from './assets/images/bounty.svg'

type timer_state = 
            "idle" |
            "running" |
            "paused"

type mode = 
        "focused" |
        "short_break" |
        "long_break"

const modeToNum = new Map<mode, number>([
        ["focused", 1500],
        ["short_break", 300],
        ["long_break", 1200]
])

function setupAudio() {
    const audio_btn = document.querySelector("#audio") as HTMLElement | null
    const audio_icon = document.querySelector("#audio-icon") as HTMLImageElement | null
    timer.background_music = document.querySelector("#bg-music") as HTMLAudioElement | null
    
    if (!audio_btn || !audio_icon) return

    audio_btn.addEventListener("click", () => {
        if (timer.background_music !== null) {
            if (timer.background_music.muted) {
                timer.background_music.muted = false
                timer.background_music.volume = 0.5
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

    const round_mode = document.querySelector(".round-mode") as HTMLElement | null
    const round_duration = document.querySelector(".round-duration") as HTMLElement | null

    const mode_icon = document.querySelector("#currentRound img") as HTMLImageElement | null
    if (mode_icon!== null && timer.current_mode === "long_break") {
        mode_icon.classList.remove("gem")
        mode_icon.classList.remove("bounty")
        mode_icon.classList.add("ball")
        mode_icon.src = brawlBall

        if (round_mode) round_mode.textContent = "Brawl Break!"
        if (round_duration) {
            round_duration.style.color = "#aab5ed"
            round_duration.textContent = "20 minutes"
        }
    } else if (mode_icon !== null && timer.current_mode === "focused") {
        mode_icon.classList.remove("ball")
        mode_icon.classList.remove("bounty")
        mode_icon.classList.add("gem")
        mode_icon.src = gemGrab
        
        if (round_mode) round_mode.textContent = "Focus Time"
        if (round_duration) {
            round_duration.style.color = "hsl(283, 89%, 58%)"
            round_duration.textContent = "25 minutes"
        }
    } else if (mode_icon !== null && timer.current_mode === "short_break") {
        mode_icon.classList.remove("ball")
        mode_icon.classList.remove("gem")
        mode_icon.classList.add("bounty")
        mode_icon.src = bounty

        if (round_mode) round_mode.textContent = "Short Break"
        if (round_duration) {
            round_duration.style.color = "rgba(0,208,255,255)"
            round_duration.textContent = "5 minutes"
        }
    }

    timer.current_time = modeToNum.get(timer.current_mode) ?? 0
    timer.starting_time = timer.current_time
    minutesToSeconds()

    if (timer.brawl_pass_progress_bar) {
        const progress = (timer.current_round % 8) / 8 * 100
        if (progress === 0 && timer.display_cycle) {
            timer.current_cycle++;
            timer.display_cycle.textContent= String(timer.current_cycle)
            playSoundEffect("#level-brawl-pass")
            timer.brawl_pass_progress_bar.style.width = "110%"

            setTimeout(() => {
              if (timer.brawl_pass_progress_bar !== null) timer.brawl_pass_progress_bar.style.width = "0%"
            }, 750)
        } else {
            timer.brawl_pass_progress_bar.style.width = `${progress}%`
        }
        console.log(`progress = ${progress} and cycle = ${timer.current_round}`)
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
                        play.textContent = "play"
                        play.classList.toggle("alt-theme")
                        timer.current_state = "idle"
                        playSoundEffect("#end-sound") 
                        if (timer.time_progress_bar !== null) timer.time_progress_bar.style.width = `100%`
 
                        setupNextRound()
                    } else {
                        if (timer.current_time === 15) {
                            playSoundEffect("#final-seconds-music", 1)                       
                        }
                        console.log(timer.current_time)
                        minutesToSeconds()
                        
                        const progress = (1 - (timer.current_time / timer.starting_time)) * 100
                        if (timer.time_progress_bar !== null) timer.time_progress_bar.style.width = `${progress}%`
                        
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
        const play = document.querySelector("#startBtn") as HTMLButtonElement | null
        if (play !== null && play.textContent === "Pause") {
            play.textContent = "play"
            play.classList.toggle("alt-theme")
            timer.current_state = "idle"
        }
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
    timer.brawl_pass_progress_bar = document.querySelector(".xp_bar_progress")
    timer.time_progress_bar = document.querySelector(".timer_progress")

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
    starting_time: 1500,
    display_time: null as HTMLElement | null,
    current_round: 1,
    current_cycle: 0,
    display_cycle: null as HTMLElement | null,
    interval_id: undefined as number | undefined,
    brawl_pass_progress_bar: null as HTMLElement | null,
    time_progress_bar: null as HTMLElement | null,
    background_music: null as HTMLAudioElement | null,
    play: null as HTMLButtonElement | null,
}

main()
