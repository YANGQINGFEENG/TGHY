import configparser
import os

class ConfigManager:
    def __init__(self, config_file):
        self.config_file = config_file
        self.config = configparser.ConfigParser()
        self.load_config()
    
    def load_config(self):
        if os.path.exists(self.config_file):
            self.config.read(self.config_file)
        else:
            # 创建默认配置
            self.create_default_config()
    
    def create_default_config(self):
        self.config['MQTT'] = {
            'broker': 'localhost',
            'port': '1883',
            'username': '',
            'password': ''
        }
        
        self.config['Simulation'] = {
            'interval': '10',  # 数据上传间隔（秒）
            'device_id_prefix': 'device_'
        }
        
        with open(self.config_file, 'w') as f:
            self.config.write(f)
    
    def get_mqtt_config(self):
        return {
            'broker': self.config['MQTT']['broker'],
            'port': int(self.config['MQTT']['port']),
            'username': self.config['MQTT']['username'],
            'password': self.config['MQTT']['password']
        }
    
    def get_simulation_config(self):
        return {
            'interval': int(self.config['Simulation']['interval']),
            'device_id_prefix': self.config['Simulation']['device_id_prefix']
        }
