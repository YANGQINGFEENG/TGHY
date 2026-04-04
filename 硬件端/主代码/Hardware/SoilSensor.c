#include "stm32f10x.h"
#include "RS485.h"
#include "../System/Delay.h"

#define SOIL_SENSOR_ADDR 0x01 // 土壤传感器地址

// 外部变量声明
extern uint8_t USART3_RX_BUF[USART3_REC_LEN];
extern uint16_t USART3_RX_STA;

/**
 * @brief 计算Modbus CRC16校验和
 * @param data 数据数组
 * @param length 数据长度
 * @retval CRC16校验和
 */
uint16_t SoilSensor_CalculateCRC16(uint8_t *data, uint8_t length)
{
	uint16_t crc = 0xFFFF;
	for (uint8_t i = 0; i < length; i++)
	{
		crc ^= data[i];
		for (uint8_t j = 0; j < 8; j++)
		{
			if (crc & 0x0001)
			{
				crc = (crc >> 1) ^ 0xA001;
			}
			else
			{
				crc >>= 1;
			}
		}
	}
	return crc;
}

/**
 * @brief 验证CRC16校验和
 * @param data 数据数组（包含CRC）
 * @param length 数据长度（包含CRC）
 * @retval 0: 校验成功, 1: 校验失败
 */
uint8_t SoilSensor_VerifyCRC16(uint8_t *data, uint8_t length)
{
	if (length < 3)
		return 1;
	
	uint16_t received_crc = data[length - 2] | (data[length - 1] << 8);
	uint16_t calculated_crc = SoilSensor_CalculateCRC16(data, length - 2);
	
	return (received_crc == calculated_crc) ? 0 : 1;
}

/**
 * @brief 解析并打印485接收到的数据（用于调试）
 * @param 无
 * @retval 无
 */
void SoilSensor_PrintReceivedData(void)
{
	uint16_t rx_len = USART3_RX_STA & 0x3FFF;
	
	// 检查数据长度
	if (rx_len < 5)
	{
		printf("\r\n[SoilSensor] 数据长度不足，无法解析\r\n");
		return;
	}
	
	// 打印原始数据
	printf("\r\n[SoilSensor] 接收到的原始数据（%d字节）：\r\n", rx_len);
	printf("  ");
	for (uint16_t i = 0; i < rx_len; i++)
	{
		printf("%02X ", USART3_RX_BUF[i]);
		if ((i + 1) % 16 == 0)
			printf("\r\n  ");
	}
	printf("\r\n");
	
	// 解析地址和功能码
	uint8_t addr = USART3_RX_BUF[0];
	uint8_t func_code = USART3_RX_BUF[1];
	
	printf("\r\n[SoilSensor] 解析结果：\r\n");
	printf("  地址: 0x%02X\r\n", addr);
	printf("  功能码: 0x%02X\r\n", func_code);
	
	// 验证功能码
	if (func_code != 0x03)
	{
		printf("  错误: 功能码不匹配！\r\n");
		return;
	}
	
	// 获取数据长度
	uint8_t data_len = USART3_RX_BUF[2];
	printf("  数据长度: %d字节\r\n", data_len);
	
	// 验证数据长度
	if (rx_len < (3 + data_len + 2))
	{
		printf("  错误: 数据长度不匹配！\r\n");
		return;
	}
	
	// 验证CRC16校验和
	uint8_t total_len = 3 + data_len + 2;
	if (SoilSensor_VerifyCRC16(USART3_RX_BUF, total_len) == 0)
	{
		printf("  CRC校验: 通过\r\n");
	}
	else
	{
		printf("  CRC校验: 失败！\r\n");
		return;
	}
	
	// 解析数据内容（根据传感器手册）
	printf("\r\n  数据内容解析：\r\n");
	
	// 数据格式：含水率(2字节) + 温度(2字节) + 电导率(2字节) + PH值(2字节)
	if (data_len >= 8)
	{
		uint8_t offset = 3; // 跳过地址、功能码、数据长度
		
		// 1. 含水率（地址0x0000）
		uint16_t moisture_raw = (USART3_RX_BUF[offset] << 8) | USART3_RX_BUF[offset + 1];
		float moisture = moisture_raw / 10.0f;
		printf("    含水率原始值: 0x%04X (%d)\r\n", moisture_raw, moisture_raw);
		printf("    含水率: %.1f%%\r\n", moisture);
		
		// 2. 温度值（地址0x0001），使用int16_t处理负数
		int16_t temperature_raw = (int16_t)((USART3_RX_BUF[offset + 2] << 8) | USART3_RX_BUF[offset + 3]);
		float temperature = temperature_raw / 10.0f;
		printf("    温度原始值: 0x%04X (%d)\r\n", (uint16_t)temperature_raw, temperature_raw);
		printf("    温度: %.1f℃\r\n", temperature);
		
		// 3. 电导率（地址0x0002）
		uint16_t ec_raw = (USART3_RX_BUF[offset + 4] << 8) | USART3_RX_BUF[offset + 5];
		printf("    电导率原始值: 0x%04X (%d)\r\n", ec_raw, ec_raw);
		printf("    电导率: %d us/cm\r\n", ec_raw);
		
		// 4. PH值（地址0x0003）
		uint16_t ph_raw = (USART3_RX_BUF[offset + 6] << 8) | USART3_RX_BUF[offset + 7];
		float ph = ph_raw / 10.0f;
		printf("    PH值原始值: 0x%04X (%d)\r\n", ph_raw, ph_raw);
		printf("    PH值: %.1f\r\n", ph);
	}
	
	// 打印所有数据字节（便于分析）
	printf("\r\n  所有数据字节：\r\n");
	printf("    ");
	for (uint8_t i = 0; i < data_len; i++)
	{
		printf("%02X ", USART3_RX_BUF[3 + i]);
		if ((i + 1) % 8 == 0)
			printf("\r\n    ");
	}
	printf("\r\n");
	
	// 打印CRC
	printf("\r\n  CRC16校验和: %02X %02X\r\n", 
		USART3_RX_BUF[3 + data_len], 
		USART3_RX_BUF[3 + data_len + 1]);
}

/**
 * @brief 读取土壤传感器数据
 * @param moisture 含水率指针（%）
 * @param temperature 温度值指针（℃）
 * @param ec 电导率指针（us/cm）
 * @param ph PH值指针
 * @retval 0: 成功, 1: 超时, 2: 响应错误, 3: CRC校验失败
 */
uint8_t SoilSensor_ReadData(float *moisture, float *temperature, uint16_t *ec, float *ph)
{
	// 根据传感器手册，正确的请求指令：01 03 00 00 00 04 44 09
	uint8_t sendBuf[8] = {0};
	sendBuf[0] = SOIL_SENSOR_ADDR; // 地址：0x01
	sendBuf[1] = 0x03;             // 功能码：读取多个寄存器
	sendBuf[2] = 0x00;             // 起始寄存器高字节：0x00
	sendBuf[3] = 0x00;             // 起始寄存器低字节：0x00
	sendBuf[4] = 0x00;             // 读取寄存器数量高字节：0x00
	sendBuf[5] = 0x04;             // 读取寄存器数量低字节：0x04（读取4个寄存器）
	
	// 计算CRC16校验和
	uint16_t crc = SoilSensor_CalculateCRC16(sendBuf, 6);
	sendBuf[6] = crc & 0xFF;        // CRC低字节
	sendBuf[7] = (crc >> 8) & 0xFF; // CRC高字节
	
	// 清除接收状态和缓冲区
	USART3_RX_STA = 0;
	for (uint16_t i = 0; i < USART3_REC_LEN; i++)
	{
		USART3_RX_BUF[i] = 0;
	}
	
	// 发送读取命令 - 使用RS485_SendHex发送HEX数据
	RS485_SendHex(sendBuf, 8);
	
	printf("\r\n[SoilSensor] 已发送请求，等待响应...\r\n");
	
	// 等待响应（最多等待1000ms）
	uint32_t timeout = 0;
	uint16_t rx_len = 0;
	
	while (timeout < 1000)
	{
		timeout++;
		delay_ms(1);
		
		// 检查当前接收到的数据长度
		rx_len = USART3_RX_STA & 0x3FFF;
		
		// 如果收到了足够的数据（13字节），立即停止等待
		if (rx_len >= 13)
		{
			printf("\r\n[SoilSensor] 接收到 %d 字节数据，开始解析...\r\n", rx_len);
			break;
		}
	}
	
	// 检查是否收到了足够的数据
	if (rx_len < 13)
	{
		printf("\r\n[SoilSensor] 读取超时，只收到 %d 字节数据\r\n", rx_len);
		return 1; // 超时
	}
	
	// 打印接收到的原始数据
	printf("\r\n[SoilSensor] 接收到的原始数据：\r\n");
	for (uint16_t i = 0; i < rx_len; i++)
	{
		printf("%02X ", USART3_RX_BUF[i]);
	}
	printf("\r\n");
	
	// 验证数据格式
	if (USART3_RX_BUF[0] != SOIL_SENSOR_ADDR || USART3_RX_BUF[1] != 0x03)
	{
		printf("\r\n[SoilSensor] 响应格式错误\r\n");
		return 2; // 响应错误
	}
	
	// 验证CRC16校验和
	if (SoilSensor_VerifyCRC16(USART3_RX_BUF, 13) != 0)
	{
		printf("\r\n[SoilSensor] CRC校验失败\r\n");
		return 3; // CRC校验失败
	}
	
	// 解析数据（根据传感器手册）
	// 数据格式：01 03 08 [含水率2字节] [温度2字节] [电导率2字节] [PH值2字节] [CRC2字节]
	uint8_t offset = 3; // 跳过地址、功能码、数据长度
	
	// 1. 含水率（地址0x0000）
	uint16_t moisture_raw = (USART3_RX_BUF[offset] << 8) | USART3_RX_BUF[offset + 1];
	*moisture = moisture_raw / 10.0f;
	
	// 2. 温度值（地址0x0001），使用int16_t处理负数
	int16_t temperature_raw = (int16_t)((USART3_RX_BUF[offset + 2] << 8) | USART3_RX_BUF[offset + 3]);
	*temperature = temperature_raw / 10.0f;
	
	// 3. 电导率（地址0x0002）
	uint16_t ec_raw = (USART3_RX_BUF[offset + 4] << 8) | USART3_RX_BUF[offset + 5];
	*ec = ec_raw;
	
	// 4. PH值（地址0x0003）
	uint16_t ph_raw = (USART3_RX_BUF[offset + 6] << 8) | USART3_RX_BUF[offset + 7];
	*ph = ph_raw / 10.0f;
	
	// 打印解析结果
	printf("\r\n[SoilSensor] 读取成功：\r\n");
	printf("  含水率: %.1f%%\r\n", *moisture);
	printf("  温度: %.1f℃\r\n", *temperature);
	printf("  电导率: %d us/cm\r\n", *ec);
	printf("  PH值: %.1f\r\n", *ph);
	
	// 清除接收状态
	USART3_RX_STA = 0;
	
	return 0; // 成功
}

