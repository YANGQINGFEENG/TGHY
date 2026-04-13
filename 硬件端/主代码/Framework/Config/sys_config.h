
#ifndef __SYS_CONFIG_H
#define __SYS_CONFIG_H

#include "stm32f10x.h"

#define FW_VERSION_MAJOR 1
#define FW_VERSION_MINOR 0
#define FW_VERSION_PATCH 0

#define DEVICE_ID "AGRI-001"

typedef enum {
    SYS_OK = 0,
    SYS_ERROR,
    SYS_TIMEOUT,
    SYS_BUSY,
    SYS_INVALID_PARAM,
    SYS_NOT_INITIALIZED
} sys_status_t;

typedef enum {
    LED_STATUS_OFF = 0,
    LED_STATUS_ON,
    LED_STATUS_BLINK_SLOW,
    LED_STATUS_BLINK_FAST
} led_status_t;

typedef struct {
    uint8_t hour;
    uint8_t minute;
    uint8_t second;
} time_t;

typedef struct {
    uint16_t year;
    uint8_t month;
    uint8_t day;
} date_t;

#define WIFI_SSID_MAX_LEN 32
#define WIFI_PWD_MAX_LEN 64
#define SERVER_URL_MAX_LEN 64
#define SERVER_PORT_MAX_LEN 8

typedef struct {
    char wifi_ssid[WIFI_SSID_MAX_LEN];
    char wifi_pwd[WIFI_PWD_MAX_LEN];
    char server_url[SERVER_URL_MAX_LEN];
    char server_port[SERVER_PORT_MAX_LEN];
    uint16_t sensor_sample_interval;
    uint16_t data_upload_interval;
    uint16_t heartbeat_interval;
} sys_config_t;

extern sys_config_t g_sys_config;

void sys_config_init(void);
void sys_config_set_defaults(void);

#endif

