
#include "tasks.h"
#include "../Core/event.h"
#include "../Data/data_manager.h"
#include "../Protocol/protocol.h"
#include "../Utils/logger.h"
#include "../../Hardware/LED.h"

static int8_t g_task_sensor_id = -1;
static int8_t g_task_upload_id = -1;
static int8_t g_task_heartbeat_id = -1;
static int8_t g_task_led_id = -1;

static void task_sensor_sample(void *param)
{
    log_debug(LOG_TAG_TASK, "Sensor sample task running");
    event_post(EVENT_SENSOR_SAMPLE, NULL, 0);
}

static void task_data_upload(void *param)
{
    log_debug(LOG_TAG_TASK, "Data upload task running");
    event_post(EVENT_DATA_UPLOAD, NULL, 0);
}

static void task_heartbeat(void *param)
{
    log_debug(LOG_TAG_TASK, "Heartbeat task running");
    event_post(EVENT_HEARTBEAT, NULL, 0);
}

static void task_led_blink(void *param)
{
    static uint8_t led_state = 0;
    led_state = !led_state;
    if (led_state) {
        LED1_ON();
    } else {
        LED1_OFF();
    }
}

void tasks_init(void)
{
    g_task_sensor_id = task_create(task_sensor_sample, NULL, 5000);
    g_task_upload_id = task_create(task_data_upload, NULL, 10000);
    g_task_heartbeat_id = task_create(task_heartbeat, NULL, 30000);
    g_task_led_id = task_create(task_led_blink, NULL, 500);
    
    if (g_task_sensor_id &gt;= 0) task_start(g_task_sensor_id);
    if (g_task_upload_id &gt;= 0) task_start(g_task_upload_id);
    if (g_task_heartbeat_id &gt;= 0) task_start(g_task_heartbeat_id);
    if (g_task_led_id &gt;= 0) task_start(g_task_led_id);
    
    log_info(LOG_TAG_TASK, "All tasks initialized");
}

