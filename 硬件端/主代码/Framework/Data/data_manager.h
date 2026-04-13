
#ifndef __DATA_MANAGER_H
#define __DATA_MANAGER_H

#include "stm32f10x.h"
#include "sys_config.h"

#define MAX_SENSOR_COUNT 8
#define DATA_BUFFER_SIZE 10
#define FILTER_WINDOW_SIZE 5

typedef enum {
    SENSOR_TEMP = 0,
    SENSOR_HUMIDITY,
    SENSOR_LIGHT,
    SENSOR_SOIL_MOISTURE,
    SENSOR_CO2,
    SENSOR_SOIL_TEMP,
    SENSOR_WIND_SPEED,
    SENSOR_RAIN,
    SENSOR_USER_1,
    SENSOR_USER_2,
    SENSOR_USER_3
} sensor_type_t;

typedef struct {
    float value;
    float raw_value;
    uint32_t timestamp;
    uint8_t valid;
    float min;
    float max;
} sensor_data_t;

typedef struct {
    sensor_data_t current;
    sensor_data_t history[DATA_BUFFER_SIZE];
    uint8_t history_index;
    float filter_buffer[FILTER_WINDOW_SIZE];
    uint8_t filter_index;
    uint8_t enabled;
} sensor_entry_t;

typedef enum {
    ACTUATOR_RELAY_1 = 0,
    ACTUATOR_RELAY_2,
    ACTUATOR_RELAY_3,
    ACTUATOR_RELAY_4,
    ACTUATOR_PUMP,
    ACTUATOR_FAN,
    ACTUATOR_VALVE,
    ACTUATOR_SERVO,
    ACTUATOR_MOTOR,
    ACTUATOR_LED,
    ACTUATOR_USER_1,
    ACTUATOR_USER_2
} actuator_type_t;

typedef struct {
    uint8_t state;
    uint32_t last_change;
    uint32_t on_time;
    uint8_t auto_mode;
    uint8_t enabled;
} actuator_data_t;

typedef struct {
    float min_threshold;
    float max_threshold;
    uint8_t alarm_enabled;
    uint8_t alarm_triggered;
} alarm_config_t;

typedef struct {
    uint8_t wifi_connected;
    uint8_t server_connected;
    uint32_t uptime;
    uint32_t total_uploads;
    uint32_t failed_uploads;
    float battery_voltage;
} system_status_t;

void data_manager_init(void);
sys_status_t data_set_sensor_value(sensor_type_t type, float value);
sys_status_t data_get_sensor_value(sensor_type_t type, sensor_data_t *data);
sys_status_t data_get_sensor_average(sensor_type_t type, float *average);
sys_status_t data_set_actuator_state(actuator_type_t type, uint8_t state);
sys_status_t data_get_actuator_state(actuator_type_t type, actuator_data_t *data);
sys_status_t data_set_alarm_config(sensor_type_t type, alarm_config_t *config);
sys_status_t data_get_alarm_config(sensor_type_t type, alarm_config_t *config);
void data_update_system_status(void);
sys_status_t data_get_system_status(system_status_t *status);

#endif

