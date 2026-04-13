
#include "protocol.h"
#include &lt;string.h&gt;
#include &lt;stdio.h&gt;
#include "event.h"

static protocol_ctx_t g_proto_ctx;
static const proto_driver_t *g_current_driver = NULL;
static const proto_driver_t *g_drivers[4];
static uint8_t g_driver_count = 0;

void protocol_init(void)
{
    memset(&amp;g_proto_ctx, 0, sizeof(g_proto_ctx));
    g_proto_ctx.wifi_state = CONN_STATE_DISCONNECTED;
    g_proto_ctx.server_state = CONN_STATE_DISCONNECTED;
    g_proto_ctx.is_connected = 0;
    
    strncpy(g_proto_ctx.device_id, DEVICE_ID, sizeof(g_proto_ctx.device_id) - 1);
}

void protocol_register_driver(const proto_driver_t *driver)
{
    if (g_driver_count &gt;= 4 || driver == NULL) {
        return;
    }
    
    g_drivers[g_driver_count++] = driver;
}

sys_status_t protocol_select(proto_type_t type)
{
    for (uint8_t i = 0; i &lt; g_driver_count; i++) {
        if (g_drivers[i]-&gt;type == type) {
            g_current_driver = g_drivers[i];
            g_proto_ctx.type = type;
            return SYS_OK;
        }
    }
    
    return SYS_ERROR;
}

sys_status_t protocol_connect(void)
{
    if (g_current_driver == NULL) {
        return SYS_NOT_INITIALIZED;
    }
    
    if (g_current_driver-&gt;init) {
        g_current_driver-&gt;init();
    }
    
    if (g_current_driver-&gt;connect) {
        return g_current_driver-&gt;connect();
    }
    
    return SYS_ERROR;
}

sys_status_t protocol_disconnect(void)
{
    if (g_current_driver == NULL) {
        return SYS_NOT_INITIALIZED;
    }
    
    if (g_current_driver-&gt;disconnect) {
        return g_current_driver-&gt;disconnect();
    }
    
    return SYS_ERROR;
}

static void build_sensor_json(char *json, uint16_t max_len)
{
    sensor_data_t temp, humidity, light, soil;
    
    data_get_sensor_value(SENSOR_TEMP, &amp;temp);
    data_get_sensor_value(SENSOR_HUMIDITY, &amp;humidity);
    data_get_sensor_value(SENSOR_LIGHT, &amp;light);
    data_get_sensor_value(SENSOR_SOIL_MOISTURE, &amp;soil);
    
    snprintf(json, max_len,
             "{\"type\":\"sensor_data\","
             "\"device_id\":\"%s\","
             "\"temperature\":%.1f,"
             "\"humidity\":%.1f,"
             "\"light\":%.1f,"
             "\"soil_moisture\":%.1f,"
             "\"timestamp\":%lu}",
             g_proto_ctx.device_id,
             temp.valid ? temp.value : 0.0f,
             humidity.valid ? humidity.value : 0.0f,
             light.valid ? light.value : 0.0f,
             soil.valid ? soil.value : 0.0f,
             0UL);
}

sys_status_t protocol_send_sensor_data(void)
{
    if (g_current_driver == NULL || !g_proto_ctx.is_connected) {
        return SYS_NOT_INITIALIZED;
    }
    
    char json[MAX_JSON_SIZE];
    build_sensor_json(json, sizeof(json));
    
    if (g_current_driver-&gt;send) {
        return g_current_driver-&gt;send((uint8_t *)json, strlen(json));
    }
    
    return SYS_ERROR;
}

sys_status_t protocol_send_heartbeat(void)
{
    if (g_current_driver == NULL || !g_proto_ctx.is_connected) {
        return SYS_NOT_INITIALIZED;
    }
    
    char json[MAX_JSON_SIZE];
    snprintf(json, sizeof(json),
             "{\"type\":\"heartbeat\","
             "\"device_id\":\"%s\","
             "\"timestamp\":%lu}",
             g_proto_ctx.device_id,
             0UL);
    
    g_proto_ctx.last_heartbeat = 0;
    
    if (g_current_driver-&gt;send) {
        return g_current_driver-&gt;send((uint8_t *)json, strlen(json));
    }
    
    return SYS_ERROR;
}

sys_status_t protocol_send_alarm(sensor_type_t sensor_type, float value)
{
    if (g_current_driver == NULL || !g_proto_ctx.is_connected) {
        return SYS_NOT_INITIALIZED;
    }
    
    const char *sensor_names[] = {"temperature", "humidity", "light", "soil_moisture", 
                                   "co2", "soil_temp", "wind_speed", "rain"};
    
    char json[MAX_JSON_SIZE];
    snprintf(json, sizeof(json),
             "{\"type\":\"alarm\","
             "\"device_id\":\"%s\","
             "\"sensor\":\"%s\","
             "\"value\":%.1f,"
             "\"timestamp\":%lu}",
             g_proto_ctx.device_id,
             sensor_type &lt; 8 ? sensor_names[sensor_type] : "unknown",
             value,
             0UL);
    
    if (g_current_driver-&gt;send) {
        return g_current_driver-&gt;send((uint8_t *)json, strlen(json));
    }
    
    return SYS_ERROR;
}

sys_status_t protocol_receive_command(uint8_t *cmd, uint16_t *len)
{
    if (g_current_driver == NULL || cmd == NULL || len == NULL) {
        return SYS_INVALID_PARAM;
    }
    
    if (g_current_driver-&gt;receive) {
        return g_current_driver-&gt;receive(cmd, len, 100);
    }
    
    return SYS_ERROR;
}

connection_state_t protocol_get_wifi_state(void)
{
    return g_proto_ctx.wifi_state;
}

connection_state_t protocol_get_server_state(void)
{
    return g_proto_ctx.server_state;
}

