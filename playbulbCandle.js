(function() {
    'use strict';

    let encoder = new TextEncoder('utf-8');
    let decoder = new TextDecoder('utf-8');

    const CANDLE_SERVICE_UUID = 0xFF02;

    const CANDLE_DEVICE_NAME_UUID = 0xFFFF;
    const CANDLE_COLOR_UUID = 0xFFFC;
    const CANDLE_EFFECT_UUID = 0xFFFB;

    class PlaybulbCandle {
        constructor() {
            this.device = null;
            this._isEffectSet = false;
        }
        async connect() {
            let options = {filters:[{services:[ CANDLE_SERVICE_UUID ]}],
                           optionalServices: ['battery_service']};
            const device = await navigator.bluetooth.requestDevice(options);
            this.device = device;
            return device.gatt.connect();
        }
        async getDeviceName() {
            const service = await this.device.gatt.getPrimaryService(CANDLE_SERVICE_UUID);
            const characteristic = await service.getCharacteristic(CANDLE_DEVICE_NAME_UUID);
            const data = await characteristic.readValue();
            let decoder = new TextDecoder('utf-8');
            return decoder.decode(data);
        }
        async setDeviceName(name) {
            const service = await this.device.gatt.getPrimaryService(CANDLE_SERVICE_UUID);
            const characteristic = await service.getCharacteristic(CANDLE_DEVICE_NAME_UUID);
            let encoder = new TextEncoder('utf-8');
            characteristic.writeValue(encoder.encode(name));
        }
        async getBatteryLevel() {
            const service = await this.device.gatt.getPrimaryService('battery_service');
            const characteristic = await service.getCharacteristic('battery_level');
            const data = await characteristic.readValue();
            return data.getUint8(0);
        }

        async setColor(r, g, b) {
            await stopEffect.bind(this)();
            if (!this._isEffectSet) {
                await update.bind(this)();
            }
            return [r, g, b];

            async function stopEffect() {
                // Turn off Color Effect first.
                const data = new Uint8Array([0x00, r, g, b, 0x05, 0x00, 0x01, 0x00]);
                const service = await this.device.gatt.getPrimaryService(CANDLE_SERVICE_UUID);
                const characteristic =  await service.getCharacteristic(CANDLE_EFFECT_UUID);
                await characteristic.writeValue(data);
            }
            async function update() {
                const data = new Uint8Array([0x00, r, g, b]);
                const service = await this.device.gatt.getPrimaryService(CANDLE_SERVICE_UUID);
                const characteristic = await service.getCharacteristic(CANDLE_COLOR_UUID);
                await characteristic.writeValue(data);
            }
        }
        async setCandleEffectColor(r, g, b) {
            let data = new Uint8Array([0x00, r, g, b, 0x04, 0x00, 0x01, 0x00]);
            const service = await this.device.gatt.getPrimaryService(CANDLE_SERVICE_UUID);
            const characteristic = await service.getCharacteristic(CANDLE_EFFECT_UUID);
            await characteristic.writeValue(data);
            this._isEffectSet = true;
            return [r,g,b];
        }
        async setFlashingColor(r, g, b) {
            let data = new Uint8Array([0x00, r, g, b, 0x00, 0x00, 0x1F, 0x00]);
            const service = await this.device.gatt.getPrimaryService(CANDLE_SERVICE_UUID);
            const characteristic = await service.getCharacteristic(CANDLE_EFFECT_UUID);
            await characteristic.writeValue(data);
            this._isEffectSet = true;
            return [r,g,b];
        }
        async setPulseColor(r, g, b) {
            // We have to correct user color to make it look nice for real...
            const newRed = Math.min(Math.round(r / 64) * 64, 255);
            const newGreen = Math.min(Math.round(g / 64) * 64, 255);
            const newBlue = Math.min(Math.round(b / 64) * 64, 255);
            const data = new Uint8Array([0x00, newRed, newGreen, newBlue, 0x01, 0x00, 0x09, 0x00]);
            const service = await this.device.gatt.getPrimaryService(CANDLE_SERVICE_UUID);
            const characteristic = await service.getCharacteristic(CANDLE_EFFECT_UUID);
            await characteristic.writeValue(data);
            this._isEffectSet = true;
            return [r,g,b];
        }
        async setRainbow() {
            const data = new Uint8Array([0x01, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, 0x00]);
            const service = await this.device.gatt.getPrimaryService(CANDLE_SERVICE_UUID);
            const characteristic = await service.getCharacteristic(CANDLE_EFFECT_UUID);
            await characteristic.writeValue(data);
            this._isEffectSet = true;
            return;
        }
        async setRainbowFade() {
            const data = new Uint8Array([0x01, 0x00, 0x00, 0x00, 0x03, 0x00, 0x26, 0x00]);
            const service = await this.device.gatt.getPrimaryService(CANDLE_SERVICE_UUID);
            const characteristic = await service.getCharacteristic(CANDLE_EFFECT_UUID);
            await characteristic.writeValue(data);
            this._isEffectSet = true;
            return;
        }
    }

    window.playbulbCandle = new PlaybulbCandle();

})();
