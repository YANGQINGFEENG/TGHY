
#ifndef __PROTOCOL_H
#define __PROTOCOL_H

#include "stm32f10x.h"
#include "sys_config.h"
#include "data_manager.h"

#define MAX_PAYLOAD_SIZE 256
#define MAX_JSON_SIZE 512

typedef enum {
    PROTO_HTTP = 0,
    PROTO_MQTT,
    PROTO_TCP,
    PROTO_UDP
} proto_type_t;

typedef enum {
    CONN_STATE_DISCONNECTED = 0,
    CONN_STATE_CONNECTING,
    CONN_STATE_CONNECTED,
    CONN_STATE_ERROR
} connection_state_t;

typedef struct {
    proto_type_t type;
    connection_state_t wifi_state;
    connection_state_t server_state;
    char device_id[32];
    uint32_t last_heartbeat;
    uint8_t is_connected;
} protocol_ctx_t;

typedef sys_status_t (*proto_init_func_t)(void);
typedef sys_status_t (*proto_connect_func_t)(void);
typedef sys_status_t (*proto_disconnect_func_t)(void);
typedef sys_status_t (*proto_send_func_t)(uint8_t *data, uint16_t len);
typedef sys_status_t (*proto_receive_func_t)(uint8_t *data, uint16_t *len, uint32_t timeout);

typedef struct {
    proto_type_t type;
    proto_init_func_t init;
    proto_connect_func_t connect;
    proto_disconnect_func_t disconnect;
    proto_send_func_t send;
    proto_receive_func_t receive;
} proto_driver_t;

void protocol_init(void);
sys_status_t protocol_select(proto_type_t type);
sys_status_t protocol_connect(void);
sys_status_t protocol_disconnect(void);
sys_status_t protocol_send_sensor_data(void);
sys_status_t protocol_send_heartbeat(void);
sys_status_t protocol_send_alarm(sensor_type_t sensor_type, float value);
sys_status_t protocol_receive_command(uint8_t *cmd, uint16_t *len);
void protocol_register_driver(const proto_driver_t *driver);
connection_state_t protocol_get_wifi_state(void);
connection_state_t protocol_get_server_state(void);

#endif

