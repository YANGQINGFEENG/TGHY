
#ifndef __EVENT_H
#define __EVENT_H

#include "stm32f10x.h"
#include "sys_config.h"

#define MAX_EVENT_QUEUE_SIZE 16
#define MAX_TASK_COUNT 8

typedef enum {
    EVENT_NONE = 0,
    EVENT_SENSOR_SAMPLE,
    EVENT_DATA_UPLOAD,
    EVENT_HEARTBEAT,
    EVENT_WIFI_CONNECTED,
    EVENT_WIFI_DISCONNECTED,
    EVENT_SERVER_CONNECTED,
    EVENT_SERVER_DISCONNECTED,
    EVENT_KEY_PRESS,
    EVENT_RELAY_CONTROL,
    EVENT_ALARM_TRIGGER,
    EVENT_USER_1,
    EVENT_USER_2,
    EVENT_USER_3
} event_type_t;

typedef struct {
    event_type_t type;
    uint32_t timestamp;
    void *data;
    uint16_t data_len;
} event_t;

typedef void (*event_handler_t)(event_t *event);

typedef struct {
    event_type_t event_type;
    event_handler_t handler;
} event_listener_t;

typedef void (*task_func_t)(void *param);

typedef enum {
    TASK_STATE_STOPPED = 0,
    TASK_STATE_RUNNING,
    TASK_STATE_PAUSED
} task_state_t;

typedef struct {
    task_func_t func;
    void *param;
    uint32_t interval;
    uint32_t last_run;
    task_state_t state;
    uint8_t enabled;
} task_t;

void event_init(void);
sys_status_t event_post(event_type_t type, void *data, uint16_t len);
sys_status_t event_subscribe(event_type_t type, event_handler_t handler);
void event_process(void);

void task_init(void);
int8_t task_create(task_func_t func, void *param, uint32_t interval);
sys_status_t task_start(int8_t task_id);
sys_status_t task_stop(int8_t task_id);
sys_status_t task_set_interval(int8_t task_id, uint32_t interval);
void task_scheduler(void);

#endif

