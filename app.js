(async function(){
    document.querySelector('#connect').addEventListener('click', async (event) => {
        document.querySelector('#state').classList.add('connecting');
        try {
            await playbulbCandle.connect();
            console.log(playbulbCandle.device);
            document.querySelector('#state').classList.remove('connecting');
            document.querySelector('#state').classList.add('connected');
            const deviceName = await playbulbCandle.getDeviceName();
            handleDeviceName(deviceName);
            const batteryLevel = await playbulbCandle.getBatteryLevel();
            handleBatteryLevel(batteryLevel);
        } catch (error) {
            console.error('Argh!', error);
        }
    });

    function handleDeviceName(deviceName) {
        document.querySelector('#deviceName').value = deviceName;
    }

    function handleBatteryLevel(batteryLevel) {
        document.querySelector('#batteryLevel').textContent = batteryLevel + '%';
    }

    async function changeColor() {
        const effect = document.querySelector('[name="effectSwitch"]:checked').id;
        let color = [];
        switch(effect) {
        case 'noEffect':
            color = await playbulbCandle.setColor(r, g, b);
            break;
        case 'candleEffect':
            color = await playbulbCandle.setCandleEffectColor(r, g, b);
            break;
        case 'flashing':
            color = await playbulbCandle.setFlashingColor(r, g, b);
            break;
        case 'pulse':
            color = await playbulbCandle.setPulseColor(r, g, b);
            break;
        case 'rainbow':
            color = await playbulbCandle.setRainbow();
            break;
        case 'rainbowFade':
            color = await playbulbCandle.setRainbowFade();
            break;
        }
        onColorChanged(color);
    }

    document.querySelector('#deviceName').addEventListener('input', async (event) => {
        try {
            await playbulbCandle.setDeviceName(event.target.value);
            console.log('Device name changed to ' + event.target.value);
        } catch(error) {
            console.error('Argh!', error);
        };
    });

    let r = g = b = 255;

    function onColorChanged(rgb) {
        if (rgb) {
            console.log('Color changed to ' + rgb);
            r = rgb[0]; g = rgb[1]; b = rgb[2];
        } else {
            console.log('Color changed');
        }
    }

    let img = new Image();
    img.src = 'color-wheel.png';
    img.onload = () => {
        let canvas = document.querySelector('canvas');
        let context = canvas.getContext('2d');

        canvas.width = 300 * devicePixelRatio;
        canvas.height = 300 * devicePixelRatio;
        canvas.style.width = "300px";
        canvas.style.height = "300px";
        canvas.addEventListener('click', function(evt) {
            // Refresh canvas in case user zooms and devicePixelRatio changes.
            canvas.width = 300 * devicePixelRatio;
            canvas.height = 300 * devicePixelRatio;
            context.drawImage(img, 0, 0, canvas.width, canvas.height);

            let rect = canvas.getBoundingClientRect();
            let x = Math.round((evt.clientX - rect.left) * devicePixelRatio);
            let y = Math.round((evt.clientY - rect.top) * devicePixelRatio);
            let data = context.getImageData(0, 0, canvas.width, canvas.height).data;

            r = data[((canvas.width * y) + x) * 4];
            g = data[((canvas.width * y) + x) * 4 + 1];
            b = data[((canvas.width * y) + x) * 4 + 2];

            changeColor();

            context.beginPath();
            context.arc(x, y + 2, 10 * devicePixelRatio, 0, 2 * Math.PI, false);
            context.shadowColor = '#333';
            context.shadowBlur = 4 * devicePixelRatio;
            context.fillStyle = 'white';
            context.fill();
        });

        context.drawImage(img, 0, 0, canvas.width, canvas.height);
    };

    document.querySelector('#noEffect').addEventListener('click', changeColor);
    document.querySelector('#candleEffect').addEventListener('click', changeColor);
    document.querySelector('#flashing').addEventListener('click', changeColor);
    document.querySelector('#pulse').addEventListener('click', changeColor);
    document.querySelector('#rainbow').addEventListener('click', changeColor);
    document.querySelector('#rainbowFade').addEventListener('click', changeColor);
}());
