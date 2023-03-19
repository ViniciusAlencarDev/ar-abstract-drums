const root = document.getElementById('root');
let widthVideo = 1280
let heightVideo = 768

// create video
const video = document.createElement('video')
video.id = "video"
video.style = `
    transform: scaleX(-1);
    width: 100%;
    height: 100%;
`
root.appendChild(video)

// create canvas
const canvas = document.createElement('canvas')
canvas.id = "canvas"
canvas.style = `
    width: 100%;
    height: 100%;
`
root.appendChild(canvas)

const config = {
    video: { width: widthVideo, height: heightVideo, fps: 144 }
}

async function initCamera(width, height, fps) {
    const constraints = {
        audio: false,
        video: {
            facingMode: "user",
            width: width,
            height: height,
            frameRate: { max: fps }
        }
    }

    const stream = await navigator.mediaDevices.getUserMedia(constraints)
    video.srcObject = stream
    video.width = width
    video.height = height

    return new Promise(resolve => {
        video.onloadedmetadata = () => { resolve(video) }
    })
}

async function main() {
    const detector = await window.handPoseDetection.createDetector(
      window.handPoseDetection.SupportedModels.MediaPipeHands,
      {
        runtime: "mediapipe",
        modelType: "full",
        maxHands: 2,
        solutionPath: `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915`,
      }
    )
    async function getHands() {
        const hands = await detector.estimateHands(video, { flipHorizontal: true })
        hands.map(hand => {
            console.log(hand.handedness, (hand.keypoints[0].x / widthVideo) * window.screen.width, (hand.keypoints[0].y / heightVideo) * window.screen.height)
            move((hand.keypoints[0].x / widthVideo) * window.screen.width, ((hand.keypoints[0].y / widthVideo) * window.screen.height) - 100, hand.handedness)
        })
        setTimeout(() => { getHands() }, 1000 / config.video.fps)
    }
    getHands();
}

window.addEventListener("DOMContentLoaded", () => {
    initCamera(config.video.width, config.video.height, config.video.fps)
        .then(video => {
            video.play()
            video.addEventListener("loadeddata", (e) => {
                console.log('e', e)
                main()
            })
        })
    canvas.width = config.video.width
    canvas.height = config.video.height
})

// create element audio
const audio = document.createElement('audio')
root.appendChild(audio)

// right drumstick
const rightDrumstick = document.createElement('div');
rightDrumstick.id = "rightDrumstick";
root.appendChild(rightDrumstick)

// left drumstick
const leftDrumstick = document.createElement('div');
leftDrumstick.id = "leftDrumstick";
root.appendChild(leftDrumstick)

const elements = [
    {
        name: '',
        width: 100,
        height: 100,
        x: window.screen.width / 2 - 100 - 80,
        y: 400,
        radius: 100,
        backgroundColor: '#fff',
        sound: './assets/1.mp3',
    },
    {
        name: '',
        width: 100,
        height: 100,
        x: window.screen.width / 2 - 50 + 0,
        y: 350,
        radius: 100,
        backgroundColor: '#fff',
        sound: './assets/1.mp3',
    },
    {
        name: '',
        width: 100,
        height: 100,
        x: window.screen.width / 2 - 0 + 80,
        y: 400,
        radius: 100,
        backgroundColor: '#fff',
        sound: './assets/1.mp3',
    },
    {
        name: 'crash',
        width: 150,
        height: 150,
        x: window.screen.width / 2 - 75 - 200,
        y: 200,
        radius: 150,
        backgroundColor: 'yellow',
        sound: './assets/2.mp3',
    },
    {
        name: 'crash',
        width: 150,
        height: 150,
        x: window.screen.width / 2 - 75 + 200,
        y: 200,
        radius: 150,
        backgroundColor: 'yellow',
        sound: './assets/2.mp3',
    },
    {
        name: '',
        width: 200,
        height: 200,
        x: window.screen.width / 2 - 100 - 350,
        y: 400,
        radius: 150,
        backgroundColor: 'lightgreen',
        sound: './assets/3.mp3',
    },
    {
        name: '',
        width: 200,
        height: 200,
        x: window.screen.width / 2 - 100 - 120,
        y: 510,
        radius: 150,
        backgroundColor: '#dff220',
        sound: './assets/4.mp3',

    },
    {
        name: '',
        width: 200,
        height: 200,
        x: window.screen.width / 2 - 100 + 120,
        y: 510,
        radius: 150,
        backgroundColor: '#dff220',
        sound: './assets/4.mp3',
    }
]

elements.map(element => {
    const newElement = document.createElement('div')
    newElement.style = `
        position: absolute;
        width: ${element.width}px;
        height: ${element.height}px;
        left: ${element.x}px;
        top: ${element.y}px;
        border-radius: ${element.radius}px;
        background: radial-gradient(${element.backgroundColor} 60%, black);
        opacity: 0.7;
        ${element.image ? `
            background: url('${element.image}');
            background-position: center;
            background-size: 100% 100%;
            box-shadow: none;
            border-radius: 0;
        ` : ''}
        ${element.name === "crash" && `
            mix-blend-mode: multiply;
        `}
    `
    root.appendChild(newElement)
})

let lastPositionLeft= null
let lockedForAPeriodLeft = false
let lastPositionRight = null
let lockedForAPeriodRight = false

document.addEventListener('mousemove', e => {
    const { clientX: x, clientY: y } = e
    move(x, y)
})

function move(x, y, hand = "Right") {
    let itHit = false
    const currentPosition = [x, y]

    if(hand === "Right") {
        rightDrumstick.style = `
            left: ${x}px;
            top: ${y}px;
        `
        if(lastPositionRight) {
            const diffY = lastPositionRight[1] - currentPosition[1]

            if(!lockedForAPeriodRight) {
                if(diffY < -15) {
                    itHit = true
                    lockedForAPeriodRight = true
                    setTimeout(() => {
                        lockedForAPeriodRight = false
                    }, 200)
                }
            }
        }
        lastPositionRight = currentPosition
    } else if(hand === "Left") {
        leftDrumstick.style = `
            left: ${x}px;
            top: ${y}px;
        `
        if(lastPositionLeft) {
            const diffY = lastPositionLeft[1] - currentPosition[1]

            if(!lockedForAPeriodLeft) {
                if(diffY < -15) {
                    itHit = true
                    lockedForAPeriodLeft = true
                    setTimeout(() => {
                        lockedForAPeriodLeft = false
                    }, 200)
                }
            }
        }
        lockedForAPeriodLeft = currentPosition
    }

    if(itHit) {
        console.log('It Hit')

        const filterElement = elements.filter(element => {
            return (
                currentPosition[0] >= element.x && currentPosition[0] <= (element.x + element.width)
                &&
                currentPosition[1] >= element.y && currentPosition[1] <= (element.y + element.height)
            )
        })

        if(filterElement.length > 0) {
            const element = filterElement[0]
    
            console.log('itHit in element', element.name, element.sound)

            audio.src = element.sound;
            (async () => {
                await audio.play()
            })()
        }
    }
}
