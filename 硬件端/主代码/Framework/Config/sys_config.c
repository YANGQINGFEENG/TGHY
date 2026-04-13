
#include "sys_config.h"
#include &lt;string.h&gt;

sys_config_t g_sys_config;

void sys_config_set_defaults(void)
{
    strncpy(g_sys_config.wifi_ssid, "vivoS18", WIFI_SSID_MAX_LEN - 1);
    strncpy(g_sys_config.wifi_pwd, "12345678", WIFI_PWD_MAX_LEN - 1);
    strncpy(g_sys_config.server_url, "subfastigiated-avis-unreplevinable.ngrok-free.dev", SERVER_URL_MAX_LEN - 1);
    strncpy(g_sys_config.server_port, "80", SERVER_PORT_MAX_LEN - 1);
    
    g_sys_config.sensor_sample_interval = 5000;
    g_sys_config.data_upload_interval = 10000;
    g_sys_config.heartbeat_interval = 30000;
}

void sys_config_init(void)
{
    sys_config_set_defaults();
}

