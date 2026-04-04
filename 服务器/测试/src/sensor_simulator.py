import random
from datetime import datetime

class SensorSimulator:
    def __init__(self):
        self.season = "spring"
    
    def simulate_temperature(self):
        """模拟温度数据，春季温度在15-25℃之间"""
        return round(random.uniform(15, 25), 1)
    
    def simulate_humidity(self):
        """模拟湿度数据，春季湿度在40%-70%之间"""
        return round(random.uniform(40, 70), 1)
    
    def simulate_illumination(self):
        """模拟光照强度，根据时间变化"""
        hour = datetime.now().hour
        if 6 <= hour < 18:
            # 白天光照较强
            return round(random.uniform(1000, 10000), 0)
        else:
            # 夜间光照较弱
            return round(random.uniform(0, 100), 0)
    
    def simulate_co2(self):
        """模拟CO₂浓度，在400-2000 ppm之间"""
        return round(random.uniform(400, 2000), 0)
    
    def simulate_pressure(self):
        """模拟气压，在1000-1020 hPa之间"""
        return round(random.uniform(1000, 1020), 1)
    
    def simulate_soil_moisture(self):
        """模拟土壤湿度，在20%-80%之间"""
        return round(random.uniform(20, 80), 1)
    
    def simulate_soil_ph(self):
        """模拟土壤pH值，在5.5-7.5之间"""
        return round(random.uniform(5.5, 7.5), 1)
    
    def simulate_soil_ec(self):
        """模拟土壤EC值，在0.1-2.0 mS/cm之间"""
        return round(random.uniform(0.1, 2.0), 2)
    
    def simulate_water_ph(self):
        """模拟水质pH值，在6.5-8.5之间"""
        return round(random.uniform(6.5, 8.5), 1)
    
    def simulate_dissolved_oxygen(self):
        """模拟溶解氧，在5-10 mg/L之间"""
        return round(random.uniform(5, 10), 1)
    
    def simulate_turbidity(self):
        """模拟浊度，在0-50 NTU之间"""
        return round(random.uniform(0, 50), 1)
    
    def simulate_pir(self):
        """模拟人体红外传感器，随机生成有人/无人状态"""
        return random.choice([True, False])
    
    def simulate_smoke(self):
        """模拟烟雾传感器，正常情况下较低，偶尔出现异常值"""
        if random.random() < 0.95:
            # 95%的概率为正常状态
            return round(random.uniform(0, 200), 0)
        else:
            # 5%的概率为异常状态
            return round(random.uniform(500, 1000), 0)
    
    def simulate_rain(self):
        """模拟雨滴传感器，春季降雨概率适中"""
        return random.choice([True, False])
    
    def generate_all_sensors_data(self):
        """生成所有传感器的数据"""
        timestamp = datetime.now().isoformat()
        
        environment_data = {
            "device_id": "env_device_001",
            "timestamp": timestamp,
            "season": self.season,
            "sensors": {
                "temperature": {
                    "value": self.simulate_temperature(),
                    "unit": "℃"
                },
                "humidity": {
                    "value": self.simulate_humidity(),
                    "unit": "%"
                },
                "illumination": {
                    "value": self.simulate_illumination(),
                    "unit": "lux"
                },
                "co2": {
                    "value": self.simulate_co2(),
                    "unit": "ppm"
                },
                "pressure": {
                    "value": self.simulate_pressure(),
                    "unit": "hPa"
                }
            }
        }
        
        soil_data = {
            "device_id": "soil_device_001",
            "timestamp": timestamp,
            "season": self.season,
            "sensors": {
                "soil_moisture": {
                    "value": self.simulate_soil_moisture(),
                    "unit": "%"
                },
                "soil_ph": {
                    "value": self.simulate_soil_ph(),
                    "unit": "pH"
                },
                "soil_ec": {
                    "value": self.simulate_soil_ec(),
                    "unit": "mS/cm"
                }
            }
        }
        
        water_data = {
            "device_id": "water_device_001",
            "timestamp": timestamp,
            "season": self.season,
            "sensors": {
                "water_ph": {
                    "value": self.simulate_water_ph(),
                    "unit": "pH"
                },
                "dissolved_oxygen": {
                    "value": self.simulate_dissolved_oxygen(),
                    "unit": "mg/L"
                },
                "turbidity": {
                    "value": self.simulate_turbidity(),
                    "unit": "NTU"
                }
            }
        }
        
        security_data = {
            "device_id": "security_device_001",
            "timestamp": timestamp,
            "season": self.season,
            "sensors": {
                "pir": {
                    "value": self.simulate_pir(),
                    "unit": "status"
                },
                "smoke": {
                    "value": self.simulate_smoke(),
                    "unit": "ppm"
                },
                "rain": {
                    "value": self.simulate_rain(),
                    "unit": "status"
                }
            }
        }
        
        return {
            "environment": environment_data,
            "soil": soil_data,
            "water": water_data,
            "security": security_data
        }
