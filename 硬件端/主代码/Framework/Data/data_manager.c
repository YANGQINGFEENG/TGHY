
#include "data_manager.h"
#include &lt;string.h&gt;
#include "event.h"

static sensor_entry_t g_sensors[MAX_SENSOR_COUNT];
static actuator_data_t g_actuators[12];
static alarm_config_t g_alarms[MAX_SENSOR_COUNT];
static system_status_t g_system_status;

void data_manager_init(void)
{
    memset(g_sensors, 0, sizeof(g_sensors));
    memset(g_actuators, 0, sizeof(g_actuators));
    memset(g_alarms, 0, sizeof(g_alarms));
    memset(&amp;g_system_status, 0, sizeof(g_system_status));
    
    for (uint8_t i = 0; i &lt; MAX_SENSOR_COUNT; i++) {
        g_sensors[i].enabled = 1;
        g_sensors[i].current.min = -999.0f;
        g_sensors[i].current.max = 999.0f;
    }
    
    for (uint8_t i = 0; i &lt; 12; i++) {
        g_actuators[i].enabled = 1;
    }
}

sys_status_t data_set_sensor_value(sensor_type_t type, float value)
{
    if (type &gt;= MAX_SENSOR_COUNT) {
        return SYS_INVALID_PARAM;
    }
    
    sensor_entry_t *sensor = &amp;g_sensors[type];
    
    if (!sensor-&gt;enabled) {
        return SYS_ERROR;
    }
    
    sensor-&gt;filter_buffer[sensor-&gt;filter_index] = value;
    sensor-&gt;filter_index = (sensor-&gt;filter_index + 1) % FILTER_WINDOW_SIZE;
    
    float sum = 0;
    uint8_t count = 0;
    for (uint8_t i = 0; i &lt; FILTER_WINDOW_SIZE; i++) {
        if (sensor-&gt;filter_buffer[i] != 0 || count &gt; 0) {
            sum += sensor-&gt;filter_buffer[i];
            count++;
        }
    }
    
    float filtered_value = (count &gt; 0) ? (sum / count) : value;
    
    sensor-&gt;history[sensor-&gt;history_index] = sensor-&gt;current;
    sensor-&gt;history_index = (sensor-&gt;history_index + 1) % DATA_BUFFER_SIZE;
    
    sensor-&gt;current.raw_value = value;
    sensor-&gt;current.value = filtered_value;
    sensor-&gt;current.timestamp = 0;
    sensor-&gt;current.valid = 1;
    
    if (filtered_value &lt; sensor-&gt;current.min) {
        sensor-&gt;current.min = filtered_value;
    }
    if (filtered_value &gt; sensor-&gt;current.max) {
        sensor-&gt;current.max = filtered_value;
    }
    
    if (g_alarms[type].alarm_enabled) {
        if (filtered_value &lt; g_alarms[type].min_threshold || 
            filtered_value &gt; g_alarms[type].max_threshold) {
            if (!g_alarms[type].alarm_triggered) {
                g_alarms[type].alarm_triggered = 1;
                event_post(EVENT_ALARM_TRIGGER, &amp;type, sizeof(type));
            }
        } else {
            g_alarms[type].alarm_triggered = 0;
        }
    }
    
    return SYS_OK;
}

sys_status_t data_get_sensor_value(sensor_type_t type, sensor_data_t *data)
{
    if (type &gt;= MAX_SENSOR_COUNT || data == NULL) {
        return SYS_INVALID_PARAM;
    }
    
    sensor_entry_t *sensor = &amp;g_sensors[type];
    
    if (!sensor-&gt;enabled) {
        return SYS_ERROR;
    }
    
    *data = sensor-&gt;current;
    
    return SYS_OK;
}

sys_status_t data_get_sensor_average(sensor_type_t type, float *average)
{
    if (type &gt;= MAX_SENSOR_COUNT || average == NULL) {
        return SYS_INVALID_PARAM;
    }
    
    sensor_entry_t *sensor = &amp;g_sensors[type];
    
    if (!sensor-&gt;enabled) {
        return SYS_ERROR;
    }
    
    float sum = 0;
    uint8_t count = 0;
    
    for (uint8_t i = 0; i &lt; DATA_BUFFER_SIZE; i++) {
        if (sensor-&gt;history[i].valid) {
            sum += sensor-&gt;history[i].value;
            count++;
        }
    }
    
    if (count &gt; 0) {
        *average = sum / count;
    } else {
        *average = sensor-&gt;current.value;
    }
    
    return SYS_OK;
}

sys_status_t data_set_actuator_state(actuator_type_t type, uint8_t state)
{
    if (type &gt;= 12) {
        return SYS_INVALID_PARAM;
    }
    
    actuator_data_t *actuator = &amp;g_actuators[type];
    
    if (!actuator-&gt;enabled) {
        return SYS_ERROR;
    }
    
    if (actuator-&gt;state != state) {
        actuator-&gt;state = state;
        actuator-&gt;last_change = 0;
    }
    
    return SYS_OK;
}

sys_status_t data_get_actuator_state(actuator_type_t type, actuator_data_t *data)
{
    if (type &gt;= 12 || data == NULL) {
        return SYS_INVALID_PARAM;
    }
    
    actuator_data_t *actuator = &amp;g_actuators[type];
    
    if (!actuator-&gt;enabled) {
        return SYS_ERROR;
    }
    
    *data = *actuator;
    
    return SYS_OK;
}

sys_status_t data_set_alarm_config(sensor_type_t type, alarm_config_t *config)
{
    if (type &gt;= MAX_SENSOR_COUNT || config == NULL) {
        return SYS_INVALID_PARAM;
    }
    
    g_alarms[type] = *config;
    
    return SYS_OK;
}

sys_status_t data_get_alarm_config(sensor_type_t type, alarm_config_t *config)
{
    if (type &gt;= MAX_SENSOR_COUNT || config == NULL) {
        return SYS_INVALID_PARAM;
    }
    
    *config = g_alarms[type];
    
    return SYS_OK;
}

void data_update_system_status(void)
{
    g_system_status.uptime++;
}

sys_status_t data_get_system_status(system_status_t *status)
{
    if (status == NULL) {
        return SYS_INVALID_PARAM;
    }
    
    *status = g_system_status;
    
    return SYS_OK;
}

