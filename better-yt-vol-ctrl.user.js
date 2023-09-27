// ==UserScript==
// @name        Better youtube volume control
// @namespace   Violentmonkey Scripts
// @match       https://www.youtube.com/*
// @grant       none
// @version     3.0
// @author      MarcosTypeAP
// @description Adds a slider to the youtube video player to feel the volume changes more naturally.
// @run-at document-end
// @noframes
// @downloadURL https://github.com/MarcosTypeAP/BetterYoutubeVolumeControl/raw/main/better-yt-vol-ctrl.user.js
// ==/UserScript==

let watchSliderClassname = "custom-watch-volume-slider"
let shortsSliderClassname = "custom-shorts-volume-slider"

function setupWatchSlider() {
    "use strict"

    const videoPlayer = document.querySelector("#movie_player.html5-video-player")
    const ytLeftControls = document.querySelector(".ytp-left-controls")

	const setVolume = (volume) => videoPlayer.setVolume((volume ** 2) * 100) // to notice that the volume increases more naturally

    const getVideo = () => videoPlayer.querySelector(".video-stream.html5-main-video") // if video tag changes

    getVideo().onplay = () => {
        document.querySelector(".ytp-chapter-container").style.flexBasis = "30%"

        getVideo().focus()
    }

    const customVideoVolume = localStorage.getItem("custom-player-volume") ?? 0.4

    setVolume(customVideoVolume)

    const $newVolumeControl = document.createElement("input")
    $newVolumeControl.className = watchSliderClassname
    $newVolumeControl.setAttribute("type", "range")
    $newVolumeControl.setAttribute("min", "0.099")
    $newVolumeControl.setAttribute("max", "1")
    $newVolumeControl.setAttribute("step", "0.001")
    $newVolumeControl.setAttribute("value", customVideoVolume)

    $newVolumeControl.style.width = "30vw"
    $newVolumeControl.style.height = "43px"
    $newVolumeControl.style.marginLeft = "20px"

    $newVolumeControl.oninput = () => {
        setVolume($newVolumeControl.value)
    }

    $newVolumeControl.onmouseup = () => {
        getVideo().focus()
    }

    $newVolumeControl.onchange = () => {
        localStorage.setItem("custom-player-volume", $newVolumeControl.value)
    }

    if (document.getElementsByClassName(watchSliderClassname).length > 0) {
        return
    }

    ytLeftControls.appendChild($newVolumeControl)

    window.addEventListener("keydown", event => {
		const hasArrowUpOrDownPressed = event.key === "ArrowUp" || event.key === "ArrowDown"
		const isMoviePlayerOrProgressBarActive = (
			document.querySelector("#movie_player") === document.activeElement ||
			document.activeElement.classList.contains("ytp-progress-bar")
		)

        if (hasArrowUpOrDownPressed && isMoviePlayerOrProgressBarActive) {

            if (event.key === "ArrowUp") {
                $newVolumeControl.stepUp(10)
            } else if (event.key === "ArrowDown") {
                $newVolumeControl.stepDown(10)
            }

            $newVolumeControl.onchange()
            $newVolumeControl.oninput()
            event.preventDefault()
            event.stopImmediatePropagation()
        }
    }, true)
}

function setupShortsSlider() {
    "use strict"

    const videoPlayer = document.querySelector("#shorts-player.html5-video-player")

	const setVolume = (volume) => videoPlayer.setVolume((volume ** 2) * 100) // to notice that the volume increases more naturally

    const getCustomVideoVolume = () => localStorage.getItem("custom-player-volume") ?? 0.4

    const getVideo = () => videoPlayer.querySelector(".video-stream.html5-main-video") // if video tag changes

    getVideo().onplay = () => {
        setVolume(getCustomVideoVolume())
    }

    setVolume(getCustomVideoVolume())

    const $newVolumeControl = document.createElement("input")
    $newVolumeControl.className = shortsSliderClassname
    $newVolumeControl.setAttribute("type", "range")
    $newVolumeControl.setAttribute("min", "0.099")
    $newVolumeControl.setAttribute("max", "1")
    $newVolumeControl.setAttribute("step", "0.001")
    $newVolumeControl.setAttribute("value", getCustomVideoVolume())

    $newVolumeControl.style.width = "40vh"
    $newVolumeControl.style.height = "40px"
    $newVolumeControl.style.position = "fixed"
    $newVolumeControl.style.right = "-100px"
    $newVolumeControl.style.bottom = "40vh"
    $newVolumeControl.style.transform = "rotateZ(-90deg)"

    $newVolumeControl.oninput = () => {
        setVolume($newVolumeControl.value)
    }

    $newVolumeControl.onchange = () => {
        localStorage.setItem("custom-player-volume", $newVolumeControl.value)
    }

    if (document.getElementsByClassName(shortsSliderClassname).length > 0) {
        return
    }

    document.body.appendChild($newVolumeControl)
}

const observer = new MutationObserver(() => {

    const $shortsSlider = document.querySelector('.' + shortsSliderClassname)
    const $watchSlider = document.querySelector('.' + watchSliderClassname)


    if ($shortsSlider) {
        $shortsSlider.style.visibility = "hidden"
    }

    if (window.location.pathname.startsWith("/watch")) {
        if (!document.querySelector("#movie_player.html5-video-player") ||
            !document.querySelector(".ytp-left-controls")) {

            return
        }

        if ($watchSlider === null) {
            setupWatchSlider()
        }

        return
    }

    if (window.location.pathname.startsWith("/shorts")) {
        if (!document.querySelector("#shorts-player.html5-video-player")) {

            return
        }

        if ($shortsSlider === null) {
            setupShortsSlider()
            return
        }

        $shortsSlider.style.visibility = "visible"
    }
});

observer.observe(document.querySelector("body"), { childList: true, subtree: true });
