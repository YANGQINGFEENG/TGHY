import logging
import os

class Logger:
    @staticmethod
    def setup_logger(name, log_file, level=logging.INFO):
        """设置日志记录器"""
        # 确保日志目录存在
        log_dir = os.path.dirname(log_file)
        if log_dir and not os.path.exists(log_dir):
            os.makedirs(log_dir)
        
        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        
        handler = logging.FileHandler(log_file)
        handler.setFormatter(formatter)
        
        console_handler = logging.StreamHandler()
        console_handler.setFormatter(formatter)
        
        logger = logging.getLogger(name)
        logger.setLevel(level)
        logger.addHandler(handler)
        logger.addHandler(console_handler)
        
        return logger
