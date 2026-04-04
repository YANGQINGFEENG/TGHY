import paho.mqtt.client as mqtt
import json
import logging

class MQTTClient:
    def __init__(self, broker, port, username=None, password=None):
        self.broker = broker
        self.port = port
        self.username = username
        self.password = password
        self.client = mqtt.Client()
        
        # 设置回调函数
        self.client.on_connect = self.on_connect
        self.client.on_publish = self.on_publish
        self.client.on_error = self.on_error
        
        # 设置用户名和密码
        if username and password:
            self.client.username_pw_set(username, password)
    
    def on_connect(self, client, userdata, flags, rc):
        if rc == 0:
            logging.info("Connected to MQTT broker successfully")
        else:
            logging.error(f"Failed to connect to MQTT broker, return code: {rc}")
    
    def on_publish(self, client, userdata, mid):
        logging.info(f"Message published successfully, message ID: {mid}")
    
    def on_error(self, client, userdata, err):
        logging.error(f"MQTT client error: {err}")
    
    def connect(self):
        try:
            self.client.connect(self.broker, self.port, 60)
            self.client.loop_start()
            logging.info(f"Connected to MQTT broker: {self.broker}:{self.port}")
        except Exception as e:
            logging.error(f"Failed to connect to MQTT broker: {e}")
    
    def disconnect(self):
        self.client.loop_stop()
        self.client.disconnect()
        logging.info("Disconnected from MQTT broker")
    
    def publish(self, topic, payload):
        try:
            # 确保payload是JSON字符串
            if isinstance(payload, dict):
                payload = json.dumps(payload)
            
            result = self.client.publish(topic, payload, qos=1, retain=False)
            result.wait_for_publish()
            logging.info(f"Published message to topic: {topic}")
            return True
        except Exception as e:
            logging.error(f"Failed to publish message: {e}")
            return False
