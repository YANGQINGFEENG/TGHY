import time
import json
import os
from src.sensor_simulator import SensorSimulator
from src.mqtt_client import MQTTClient
from src.config_manager import ConfigManager
from src.logger import Logger

# 设置日志
log_file = os.path.join(os.path.dirname(__file__), 'logs', 'app.log')
logger = Logger.setup_logger('app', log_file)

# 加载配置
config_file = os.path.join(os.path.dirname(__file__), 'config', 'config.ini')
config_manager = ConfigManager(config_file)
mqtt_config = config_manager.get_mqtt_config()
simulation_config = config_manager.get_simulation_config()

# 初始化传感器模拟器
sensor_simulator = SensorSimulator()

# 初始化MQTT客户端
mqtt_client = MQTTClient(
    broker=mqtt_config['broker'],
    port=mqtt_config['port'],
    username=mqtt_config['username'],
    password=mqtt_config['password']
)
mqtt_client.connect()

try:
    logger.info("Starting sensor data simulation and MQTT upload")
    logger.info(f"Simulation interval: {simulation_config['interval']} seconds")
    logger.info(f"MQTT broker: {mqtt_config['broker']}:{mqtt_config['port']}")
    
    while True:
        # 生成传感器数据
        sensors_data = sensor_simulator.generate_all_sensors_data()
        
        # 上传环境类传感器数据
        env_topic = "agriculture/iot/environment"
        mqtt_client.publish(env_topic, sensors_data['environment'])
        logger.info(f"Uploaded environment data: {json.dumps(sensors_data['environment'], indent=2)}")
        
        # 上传土壤类传感器数据
        soil_topic = "agriculture/iot/soil"
        mqtt_client.publish(soil_topic, sensors_data['soil'])
        logger.info(f"Uploaded soil data: {json.dumps(sensors_data['soil'], indent=2)}")
        
        # 上传水质类传感器数据
        water_topic = "agriculture/iot/water"
        mqtt_client.publish(water_topic, sensors_data['water'])
        logger.info(f"Uploaded water data: {json.dumps(sensors_data['water'], indent=2)}")
        
        # 上传安全类传感器数据
        security_topic = "agriculture/iot/security"
        mqtt_client.publish(security_topic, sensors_data['security'])
        logger.info(f"Uploaded security data: {json.dumps(sensors_data['security'], indent=2)}")
        
        # 等待下一次上传
        time.sleep(simulation_config['interval'])
        
except KeyboardInterrupt:
    logger.info("Stopping sensor data simulation and MQTT upload")
except Exception as e:
    logger.error(f"Error: {e}")
finally:
    mqtt_client.disconnect()
    logger.info("Program stopped")
