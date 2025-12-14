const mqtt = require('mqtt');

const client = mqtt.connect('mqtt://localhost:1883');

client.on('connect', () => {
    console.log("🔌 Publisher connected!");
    
    setInterval(() => {

        const fakeData = {
            temp: Math.floor(Math.random() * 40), 
            hum: Math.floor(Math.random() * 100)  
        };
        
        // Gửi lên topic 'iot/data'
        client.publish('iot/data', JSON.stringify(fakeData));
        console.log("Đã gửi:", fakeData);
    }, 3000); 
});