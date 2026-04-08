#ifndef __ATK_D43_H
#define __ATK_D43_H

#include "stm32f10x.h"

#define DTU_RX_CMD_BUF_SIZE    512

/**
 * @brief       DTU工作模式枚举
 */
enum _dtu_work_mode_e
{
    DTU_WORKMODE_NET = 0,       /* 网络透传模式 */
    DTU_WORKMODE_HTTP,          /* HTTP透传模式 */
    DTU_WORKMODE_MQTT,          /* MQTT透传模式 */
    DTU_WORKMODE_ALIYUN,        /* 阿里云透传模式 */
    DTU_WORKMODE_ONENET,        /* OneNET透传模式 */
    DTU_WORKMODE_YUANZIYUN,     /* 原子云透传模式 */
};

typedef enum _dtu_work_mode_e _dtu_work_mode_eu;

/**
 * @brief       DTU数据采集模式枚举
 */
enum _dtu_collect_mode_e
{
    DTU_COLLECT_OFF = 0,                /* 关闭采集功能 */
    DTU_COLLECT_TRANS,                  /* 透传自动采集模式 */
    DTU_COLLECT_MODBUS_USER,            /* Modbus自动采集 */
    DTU_COLLECT_MODBUS_ALI,             /* Modbus阿里云采集模式 */
    DTU_COLLECT_MODBUS_ONENET,          /* Modbus OneNET采集模式 */
};

typedef enum _dtu_collect_mode_e _dtu_collect_mode_eu;

/**
 * @brief       AT命令元素结构
 */
typedef struct
{
    uint32_t timeout;         /* AT命令超时时间 */
    char *read_cmd;           /* 读取AT命令 */
    char *write_cmd;          /* 写入AT命令 */
} _dtu_atcmd_st;

void send_data_to_dtu(uint8_t *data, uint32_t size);
int dtu_config_init(_dtu_work_mode_eu work_mode, _dtu_collect_mode_eu collect_mode);
int dtu_send_sms(char *phone, char *sms_msg);
int dtu_power_reset(void);
int dtu_base_station_location_info(uint8_t *data_buffer, uint32_t buffer_size);
int dtu_device_state_work_info(uint8_t *data_buffer, uint32_t buffer_size);
void dtu_get_urc_info(uint8_t ch);

#endif /* __ATK_D43_H */
