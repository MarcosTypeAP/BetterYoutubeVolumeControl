// ==UserScript==
// @name        Better youtube volume control
// @namespace   Violentmonkey Scripts
// @match       https://www.youtube.com/*
// @grant       none
// @version     1.0
// @author      MarcosTypeAP
// @description Adds a slider to the youtube video player to feel the volume changes more naturally.
// @run-at document-end
// @noframes
// ==/UserScript==

// Storage data samples:
//
//     yt-player-volume: {"data":"{\"volume\":7,\"muted\":false}","creation":1648648184259}
//     yt-player-volume: {"data":"{\"volume\":7,\"muted\":false}","expiration":1651335718207,"creation":1648743718207}

function main() {
    'use strict'

	const getExponentialVolume = volume => volume ** 2 // to notice volume increases more naturally
    const getVideo = () => document.querySelector('#movie_player .video-stream') // if video tag changes
    const ytLeftControls = document.querySelector('.ytp-left-controls')
    if (!ytLeftControls) {
        setTimeout(main, 200)
        return
    }

    let ytPlayerVolumeData = JSON.parse(sessionStorage.getItem('yt-player-volume'))
    if (!ytPlayerVolumeData) {
        ytPlayerVolumeData = JSON.parse(localStorage.getItem('yt-player-volume'))
    }

    window.ytVideoCustomVolume = localStorage.getItem('custom-player-volume')
    window.ytVideoCustomVolume = window.ytVideoCustomVolume
		? window.ytVideoCustomVolume
		: 0.4

    getVideo().onplay = event => {
        document.querySelector('.ytp-chapter-container').style.flexBasis = "30%"
        for (let milliseconds=50; milliseconds<3000; milliseconds+=50) {
            setTimeout(() => {
                event.srcElement.muted = false
                event.srcElement.volume = window.ytVideoCustomVolume
            }, milliseconds)
        }
    }

    const newVolumeControl = document.createElement('input')
    newVolumeControl.setAttribute('type', 'range')
    newVolumeControl.setAttribute('min', '0')
    newVolumeControl.setAttribute('max', '1')
    newVolumeControl.setAttribute('step', '0.001')
    newVolumeControl.setAttribute('value', Math.sqrt(window.ytVideoCustomVolume))
    newVolumeControl.style = 'width:30vw; height:43px; margin-left:20px;'
    newVolumeControl.oninput = () => {
        window.ytVideoCustomVolume = getExponentialVolume(newVolumeControl.value)
        getVideo().volume = window.ytVideoCustomVolume
    }
    newVolumeControl.onmouseup = () => {
        getVideo().focus()
    }
    newVolumeControl.onchange = () => {
        const newVolume = getExponentialVolume(newVolumeControl.value)
        ytPlayerVolumeData = {
            data: JSON.stringify({
                volume: newVolume * 100, // to percentage
                muted: false
            }),
            creation: new Date().getTime()
        }
        sessionStorage.setItem('yt-player-volume', JSON.stringify(ytPlayerVolumeData))
        ytPlayerVolumeData.expiration = new Date().getTime() + 2592000000 // +1 Month
        localStorage.setItem('yt-player-volume', JSON.stringify(ytPlayerVolumeData))

        localStorage.setItem('custom-player-volume', newVolume)
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
