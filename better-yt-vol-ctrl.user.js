// ==UserScript==
// @name        Better youtube volume control
// @namespace   Violentmonkey Scripts
// @match       https://www.youtube.com/*
// @grant       none
// @version     2.0
// @author      MarcosTypeAP
// @description Adds a slider to the youtube video player to feel the volume changes more naturally.
// @run-at document-end
// @noframes
// @downloadURL https://github.com/MarcosTypeAP/BetterYoutubeVolumeControl/raw/main/better-yt-vol-ctrl.user.js
// ==/UserScript==

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms)
    })
}

async function main() {
    'use strict'

    let retries = 100

    const ytLeftControls = document.querySelector('.ytp-left-controls')

    if (!ytLeftControls) {
        if (retries) {
            await sleep(200)
            retries--
        }

        return
    }

    const videoPlayer = document.querySelector(".html5-video-player")

    if (!videoPlayer) {
        if (retries) {
            await sleep(200)
            retries--
        }

        return
    }

	const setVolume = (volume) => videoPlayer.setVolume((volume ** 2) * 100) // to notice that the volume increases more naturally

    const getVideo = () => document.querySelector('#movie_player .video-stream') // if video tag changes

    getVideo().onplay = () => {
        document.querySelector('.ytp-chapter-container').style.flexBasis = "30%"

        getVideo().focus()
    }

    const customVideoVolume = localStorage.getItem('custom-player-volume') ?? 0.4

    setVolume(customVideoVolume)

    const newVolumeControl = document.createElement('input')
    newVolumeControl.setAttribute('type', 'range')
    newVolumeControl.setAttribute('min', '0.099')
    newVolumeControl.setAttribute('max', '1')
    newVolumeControl.setAttribute('step', '0.001')
    newVolumeControl.setAttribute('value', customVideoVolume)
    newVolumeControl.style = 'width:30vw; height:43px; margin-left:20px;'

    newVolumeControl.oninput = () => {
        setVolume(newVolumeControl.value)
    }

    newVolumeControl.onmouseup = () => {
        getVideo().focus()
    }

    newVolumeControl.onchange = () => {
        localStorage.setItem('custom-player-volume', newVolumeControl.value)
    }

    ytLeftControls.appendChild(newVolumeControl)

    window.addEventListener('keydown', event => {
		const hasArrowUpOrDownPressed = event.key === 'ArrowUp' || event.key === 'ArrowDown'
		const isMoviePlayerOrProgressBarActive = (
			document.querySelector('#movie_player') === document.activeElement ||
			document.activeElement.classList.contains('ytp-progress-bar')
		)

        if (hasArrowUpOrDownPressed && isMoviePlayerOrProgressBarActive) {

            if (event.key === 'ArrowUp') {
                newVolumeControl.stepUp(10)
            } else if (event.key === 'ArrowDown') {
                newVolumeControl.stepDown(10)
            }

            newVolumeControl.onchange()
            newVolumeControl.oninput()
            event.preventDefault()
            event.stopImmediatePropagation()
        }
    }, true)
}

main()
